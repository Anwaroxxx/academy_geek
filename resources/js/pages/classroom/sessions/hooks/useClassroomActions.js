import { useCallback, useEffect, useRef, useState } from 'react';

function readCookie(name) {
    if (typeof document === 'undefined') {
        return null;
    }

    return (
        document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')
            .slice(1)
            .join('=') ?? null
    );
}

async function postClassroomRoomAction(classId, action, options = {}) {
    const xsrfToken = readCookie('XSRF-TOKEN');
    const isFormData = options.body instanceof FormData;
    const headers = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    return fetch(`/classroom/sessions/${classId}/${action}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers,
        ...options,
    });
}

async function getClassroomRoomStatus(classId) {
    return fetch(`/classroom/sessions/${classId}/status`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });
}

export default function useClassroomActions({
    canStartRoom = false,
    classId,
    getClassroomData,
    getJitsiSync,
    initialIsJoined = false,
    initialRoomIsLive = false,
    onLocalLeave,
} = {}) {
    const getClassroomDataRef = useRef(getClassroomData);
    const getJitsiSyncRef = useRef(getJitsiSync);
    const onLocalLeaveRef = useRef(onLocalLeave);
    const [isJoined, setIsJoined] = useState(initialIsJoined);
    const [isStartingRoom, setIsStartingRoom] = useState(false);
    const [isStoppingRoom, setIsStoppingRoom] = useState(false);
    const [isModeratingParticipant, setIsModeratingParticipant] =
        useState(false);
    const [roomIsLive, setRoomIsLive] = useState(initialRoomIsLive);
    const [streamEndedByStaff, setStreamEndedByStaff] = useState(false);

    useEffect(() => {
        getClassroomDataRef.current = getClassroomData;
        getJitsiSyncRef.current = getJitsiSync;
        onLocalLeaveRef.current = onLocalLeave;
    }, [getClassroomData, getJitsiSync, onLocalLeave]);

    const classroomData = useCallback(
        () => getClassroomDataRef.current?.() ?? {},
        [],
    );

    const jitsiSync = useCallback(() => getJitsiSyncRef.current?.() ?? {}, []);

    const leaveLocally = useCallback(() => {
        setIsJoined(false);
        onLocalLeaveRef.current?.();
    }, []);

    const handleJoin = useCallback(async () => {
        setStreamEndedByStaff(false);

        if (canStartRoom) {
            setIsStartingRoom(true);

            try {
                const response = await postClassroomRoomAction(
                    classId,
                    'start',
                );

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                setRoomIsLive(Boolean(payload.room_is_live));
                classroomData().applyParticipantResponse?.(payload);
            } finally {
                setIsStartingRoom(false);
            }
        } else {
            const response = await postClassroomRoomAction(
                classId,
                'participants/join',
            );

            if (response.ok) {
                classroomData().applyParticipantResponse?.(
                    await response.json(),
                );
            }
        }

        setIsJoined(true);
    }, [canStartRoom, classId, classroomData]);

    const handleLeave = useCallback(async () => {
        if (canStartRoom && roomIsLive) {
            setIsStoppingRoom(true);

            try {
                const response = await postClassroomRoomAction(
                    classId,
                    'stop',
                );

                if (response.ok) {
                    const payload = await response.json();
                    setRoomIsLive(Boolean(payload.room_is_live));
                    classroomData().applyParticipantResponse?.(payload);
                }
            } finally {
                setIsStoppingRoom(false);
            }
        } else {
            const response = await postClassroomRoomAction(
                classId,
                'participants/leave',
            );

            if (response.ok) {
                classroomData().applyParticipantResponse?.(
                    await response.json(),
                );
            }
        }

        leaveLocally();
    }, [canStartRoom, classId, classroomData, leaveLocally, roomIsLive]);

    useEffect(() => {
        if (!canStartRoom || !isJoined || !roomIsLive) {
            return undefined;
        }

        const handleBeforeUnload = () => {
            postClassroomRoomAction(classId, 'stop', {
                keepalive: true,
            }).catch(() => undefined);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [canStartRoom, classId, isJoined, roomIsLive]);

    useEffect(() => {
        if (!isJoined || canStartRoom) {
            return undefined;
        }

        let cancelled = false;

        const pollRoomStatus = async () => {
            try {
                const response = await getClassroomRoomStatus(classId);

                if (!response.ok || cancelled) {
                    return;
                }

                const payload = await response.json();
                const nextRoomIsLive = Boolean(payload.room_is_live);
                const nextCurrentParticipant = payload.participant;
                const currentParticipant =
                    classroomData().currentParticipant;

                if (!nextRoomIsLive && roomIsLive) {
                    setRoomIsLive(false);
                    setStreamEndedByStaff(true);
                    classroomData().applyParticipantResponse?.(payload);
                    leaveLocally();
                    return;
                }

                if (
                    currentParticipant?.is_screen_sharing &&
                    nextCurrentParticipant &&
                    !nextCurrentParticipant.can_share_screen
                ) {
                    jitsiSync().stopScreenSharingForRevokedPermission?.();
                }

                setRoomIsLive(nextRoomIsLive);
                classroomData().applyParticipantResponse?.(payload);
            } catch {
                // Temporary polling is best-effort until realtime is added.
            }
        };

        const intervalId = window.setInterval(pollRoomStatus, 4000);

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [
        canStartRoom,
        classId,
        classroomData,
        isJoined,
        jitsiSync,
        leaveLocally,
        roomIsLive,
    ]);

    const handleModerateParticipant = useCallback(
        async (participant, action) => {
            if (action !== 'screenShare' || !canStartRoom || !participant?.id) {
                return;
            }

            setIsModeratingParticipant(true);

            try {
                const response = await postClassroomRoomAction(
                    classId,
                    `participants/${participant.id}/screen-share`,
                    {
                        body: JSON.stringify({
                            allowed: !participant.can_share_screen,
                        }),
                    },
                );

                if (response.ok) {
                    classroomData().applyParticipantResponse?.(
                        await response.json(),
                    );
                }
            } finally {
                setIsModeratingParticipant(false);
            }
        },
        [canStartRoom, classId, classroomData],
    );

    return {
        handleJoin,
        handleLeave,
        handleModerateParticipant,
        isJoined,
        isModeratingParticipant,
        isStartingRoom,
        isStoppingRoom,
        roomIsLive,
        streamEndedByStaff,
    };
}

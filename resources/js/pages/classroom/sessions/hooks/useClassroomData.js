import { useCallback, useEffect, useMemo, useState } from 'react';

function upsertParticipant(items, nextParticipant) {
    if (!nextParticipant?.id) {
        return items;
    }

    if (!items.some((participant) => participant.id === nextParticipant.id)) {
        return [...items, nextParticipant];
    }

    return items.map((participant) =>
        participant.id === nextParticipant.id
            ? {
                  ...participant,
                  ...nextParticipant,
                  user: nextParticipant.user ?? participant.user,
              }
            : participant,
    );
}

export default function useClassroomData({
    jitsiAccess,
    mappedClassroom,
    roomIsLive = false,
}) {
    const [currentParticipant, setCurrentParticipant] = useState(null);

    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    const canStartRoom = Boolean(
        jitsiAccess?.can_start_room || jitsiAccess?.is_host,
    );
    const canShareScreen = Boolean(
        canStartRoom || currentParticipant?.can_share_screen,
    );

    const classroomPermissions = useMemo(
        () => ({
            ...mappedClassroom.permissions,
            can_share_screen: canShareScreen,
            can_moderate_participants: canStartRoom,
            can_start_room: canStartRoom,
        }),
        [canShareScreen, canStartRoom, mappedClassroom.permissions],
    );

    const jitsiAccessForRoom = useMemo(
        () =>
            jitsiAccess
                ? {
                      ...jitsiAccess,
                      room_is_live: roomIsLive,
                      host_is_online: roomIsLive,
                      can_share_screen: canShareScreen,
                  }
                : jitsiAccess,
        [canShareScreen, jitsiAccess, roomIsLive],
    );

    // useEffect(() => {
    //     setCurrentParticipant(mappedClassroom.currentParticipant);
    //     setParticipants(mappedClassroom.participants);
    // }, [mappedClassroom.currentParticipant, mappedClassroom.participants]);

    useEffect(() => {
        let isCancelled = false;

        queueMicrotask(() => {
            if (isCancelled) {
return;
}

            setCurrentParticipant(mappedClassroom.currentParticipant ?? null);

            setParticipants(mappedClassroom.participants ?? []);
        });

        return () => {
            isCancelled = true;
        };
    }, [mappedClassroom.currentParticipant, mappedClassroom.participants]);

    const applyCurrentParticipantUpdate = useCallback(
        (payload) => {
            setCurrentParticipant((current) =>
                current ? { ...current, ...payload } : current,
            );
            setParticipants((items) =>
                items.map((participant) =>
                    participant.id === currentParticipant?.id
                        ? { ...participant, ...payload }
                        : participant,
                ),
            );
        },
        [currentParticipant?.id],
    );

    const applyParticipantResponse = useCallback(
        (payload) => {
            if (Array.isArray(payload?.participants)) {
                setParticipants(payload.participants);
            } else if (payload?.participant) {
                setParticipants((items) =>
                    upsertParticipant(items, payload.participant),
                );
            }

            const nextCurrentParticipant =
                payload?.participant?.is_current_user ||
                payload?.participant?.user_id === currentParticipant?.user_id
                    ? payload.participant
                    : payload?.participants?.find(
                          (participant) => participant.is_current_user,
                      );

            if (nextCurrentParticipant) {
                setCurrentParticipant(nextCurrentParticipant);
            }
        },
        [currentParticipant?.user_id],
    );

    return {
        applyCurrentParticipantUpdate,
        applyJitsiParticipantMediaPayload: applyCurrentParticipantUpdate,
        applyParticipantResponse,
        canShareScreen,
        canStartRoom,
        classroomPermissions,
        currentParticipant,
        jitsiAccessForRoom,
        participants,
        selectedParticipant,
        setSelectedParticipant,
    };
}

import { useCallback, useRef } from 'react';

function buildMediaState(participant) {
    return {
        isAudioMuted: participant?.is_muted,
        isScreenSharing: participant?.is_screen_sharing,
        isVideoMuted:
            participant?.is_camera_on === undefined
                ? undefined
                : !participant.is_camera_on,
    };
}

function toParticipantMediaPayload(state) {
    const payload = {};

    if (Object.hasOwn(state, 'isAudioMuted')) {
        payload.is_muted = Boolean(state.isAudioMuted);
    }

    if (Object.hasOwn(state, 'isVideoMuted')) {
        payload.is_camera_on = !state.isVideoMuted;
    }

    if (Object.hasOwn(state, 'isScreenSharing')) {
        payload.is_screen_sharing = Boolean(state.isScreenSharing);
    }

    return payload;
}

export default function useJitsiSync({
    canShareScreen = false,
    isJoined = false,
    participant,
    onParticipantMediaChange,
} = {}) {
    const jitsiApiRef = useRef(null);
    const jitsiMediaStateRef = useRef(buildMediaState(participant));

    const setJitsiMediaState = useCallback((state) => {
        jitsiMediaStateRef.current = {
            ...jitsiMediaStateRef.current,
            ...state,
        };
    }, []);

    const executeJitsiCommand = useCallback((command) => {
        try {
            jitsiApiRef.current?.executeCommand?.(command);
        } catch {
            // Jitsi commands are local best-effort in Phase 1.
        }
    }, []);

    const onJitsiApiReady = useCallback((api) => {
        jitsiApiRef.current = api;
    }, []);

    const onJitsiApiDisposed = useCallback(() => {
        jitsiApiRef.current = null;
        jitsiMediaStateRef.current = buildMediaState(participant);
    }, [participant]);

    const onJitsiMediaStateChange = useCallback(
        (state) => {
            const payload = toParticipantMediaPayload(state);

            if (!Object.keys(payload).length) {
                return;
            }

            setJitsiMediaState(state);
            onParticipantMediaChange?.(payload);
        },
        [onParticipantMediaChange, setJitsiMediaState],
    );

    const syncJitsiScreenShareState = useCallback(
        (payload) => {
            if (!Object.hasOwn(payload, 'is_screen_sharing')) {
                return true;
            }

            if (!isJoined || !jitsiApiRef.current || !canShareScreen) {
                return false;
            }

            const desiredScreenSharing = Boolean(payload.is_screen_sharing);
            const currentScreenSharing =
                jitsiMediaStateRef.current.isScreenSharing;

            if (
                currentScreenSharing === undefined ||
                currentScreenSharing !== desiredScreenSharing
            ) {
                executeJitsiCommand('toggleShareScreen');
            }

            setJitsiMediaState({
                isScreenSharing: desiredScreenSharing,
            });

            return true;
        },
        [
            canShareScreen,
            executeJitsiCommand,
            isJoined,
            setJitsiMediaState,
        ],
    );

    const syncJitsiParticipantUpdate = useCallback(
        (payload) => {
            if (Object.hasOwn(payload, 'is_muted')) {
                executeJitsiCommand('toggleAudio');
            }

            if (Object.hasOwn(payload, 'is_camera_on')) {
                executeJitsiCommand('toggleVideo');
            }

            if (Object.hasOwn(payload, 'is_screen_sharing')) {
                return syncJitsiScreenShareState(payload);
            }

            return true;
        },
        [executeJitsiCommand, syncJitsiScreenShareState],
    );

    const stopScreenSharingForRevokedPermission = useCallback(() => {
        executeJitsiCommand('toggleShareScreen');
        setJitsiMediaState({
            isScreenSharing: false,
        });
    }, [executeJitsiCommand, setJitsiMediaState]);

    return {
        executeJitsiCommand,
        jitsiApiRef,
        jitsiMediaStateRef,
        onJitsiApiDisposed,
        onJitsiApiReady,
        onJitsiMediaStateChange,
        stopScreenSharingForRevokedPermission,
        syncJitsiParticipantUpdate,
        syncJitsiScreenShareState,
    };
}

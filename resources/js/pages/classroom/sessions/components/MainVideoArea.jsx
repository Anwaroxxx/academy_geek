import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MicOff, MonitorPlay, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const JITSI_SCRIPT_ID = 'jitsi-external-api';
const JITSI_SCRIPT_URL_KEY = '__ACADEMY_JITSI_SCRIPT_URL__';
const JITSI_IFRAME_ALLOW =
    'camera; microphone; display-capture; fullscreen; autoplay; clipboard-write';

const jitsiScriptPromises = new Map();

function loadJitsiExternalApi(scriptUrl) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('Jitsi can only load in the browser.'));
    }

    const existingScript = document.getElementById(JITSI_SCRIPT_ID);
    const existingScriptMatches = existingScript?.src === scriptUrl;

    if (
        window.JitsiMeetExternalAPI &&
        (window[JITSI_SCRIPT_URL_KEY] === scriptUrl || existingScriptMatches)
    ) {
        window[JITSI_SCRIPT_URL_KEY] = scriptUrl;
        return Promise.resolve(window.JitsiMeetExternalAPI);
    }

    if (
        window.JitsiMeetExternalAPI &&
        window[JITSI_SCRIPT_URL_KEY] !== scriptUrl
    ) {
        return Promise.reject(
            new Error('Jitsi script source changed. Please refresh the page.'),
        );
    }

    if (jitsiScriptPromises.has(scriptUrl)) {
        return jitsiScriptPromises.get(scriptUrl);
    }

    const jitsiScriptPromise = new Promise((resolve, reject) => {
        if (existingScript) {
            if (!existingScriptMatches) {
                reject(new Error('Jitsi script URL changed after loading.'));
                return;
            }

            if (window.JitsiMeetExternalAPI) {
                window[JITSI_SCRIPT_URL_KEY] = scriptUrl;
                resolve(window.JitsiMeetExternalAPI);
                return;
            }

            existingScript.addEventListener('load', () => {
                window[JITSI_SCRIPT_URL_KEY] = scriptUrl;
                resolve(window.JitsiMeetExternalAPI);
            });
            existingScript.addEventListener('error', () =>
                reject(new Error('Jitsi could not be loaded.')),
            );
            return;
        }

        const script = document.createElement('script');

        script.id = JITSI_SCRIPT_ID;
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => {
            window[JITSI_SCRIPT_URL_KEY] = scriptUrl;
            resolve(window.JitsiMeetExternalAPI);
        };
        script.onerror = () => reject(new Error('Jitsi could not be loaded.'));

        document.body.appendChild(script);
    });

    jitsiScriptPromises.set(scriptUrl, jitsiScriptPromise);

    return jitsiScriptPromise;
}

function initials(name) {
    return name
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function applyJitsiIframePermissions(api) {
    const iframe = api.getIFrame?.();

    if (!iframe) {
        return;
    }

    iframe.setAttribute('allow', JITSI_IFRAME_ALLOW);
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.display = 'block';
    iframe.style.border = '0';
}

function VideoTile({ label, participant, isMain = false }) {
    const isMuted = Boolean(participant?.is_muted);
    const isOnline = participant?.is_online ?? true;

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/10',
                isMain ? 'min-h-[70px] flex-1' : 'aspect-video w-full',
            )}
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-white/10">
                    {participant?.user?.name ? (
                        <span className="text-lg font-semibold text-white/80">
                            {initials(participant.user.name)}
                        </span>
                    ) : (
                        <UserRound className="size-7 text-white/50" />
                    )}
                </div>
                {!isOnline && (
                    <span className="text-xs text-white/40">Offline</span>
                )}
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
                    {label}
                </span>
                {isMuted && (
                    <span className="rounded-md bg-black/60 p-1 text-white">
                        <MicOff className="size-3.5" />
                    </span>
                )}
            </div>
        </div>
    );
}

export default function MainVideoArea({
    session,
    jitsiAccess,
    streamEndedByStaff = false,
    currentParticipant,
    currentUser,
    participants = [],
    isFocusMode = false,
    isJoined = false,
    canJoin = false,
    isJoining = false,
    onJoin,
    showNativeRecordingControl = false,
    onJitsiApiReady,
    onJitsiApiDisposed,
    onJitsiMediaStateChange,
}) {
    const subject =
        jitsiAccess?.subject ?? session?.title ?? 'Classroom session';
    const jitsiDomain = jitsiAccess?.domain;
    const jitsiScriptUrl = jitsiAccess?.script_url;
    const jitsiRoomName = jitsiAccess?.room_name ?? session?.jitsi_room_name;
    const roomName = jitsiRoomName ?? 'Pending room';
    const displayName =
        jitsiAccess?.display_name ??
        currentParticipant?.user?.name ??
        currentUser?.name ??
        'Guest';
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);
    const displayNameRef = useRef(displayName);
    const subjectRef = useRef(subject);
    const currentParticipantRef = useRef(currentParticipant);
    const onJitsiApiReadyRef = useRef(onJitsiApiReady);
    const onJitsiApiDisposedRef = useRef(onJitsiApiDisposed);
    const onJitsiMediaStateChangeRef = useRef(onJitsiMediaStateChange);
    const filmstripHiddenRef = useRef(false);
    const filmstripHideTimeoutRef = useRef(null);
    const [jitsiStatus, setJitsiStatus] = useState('idle');
    const [jitsiError, setJitsiError] = useState(null);

    const hostParticipant =
        participants.find((item) => item.role === 'host') ?? participants[0];
    const canStartRoom = Boolean(
        jitsiAccess?.can_start_room || jitsiAccess?.is_host,
    );
    const hostIsOnline = Boolean(
        jitsiAccess?.room_is_live || jitsiAccess?.host_is_online,
    );
    const shouldMountJitsi =
        !streamEndedByStaff && isJoined && (canStartRoom || hostIsOnline);
    const isWaitingForTeacher = isJoined && !canStartRoom && !hostIsOnline;
    const showJoinButton = !streamEndedByStaff && !isJoined && canJoin;
    const nativeToolbarButtons = useMemo(
        () => (showNativeRecordingControl ? ['recording'] : []),
        [showNativeRecordingControl],
    );
    const hasValidJitsiConfig = Boolean(
        jitsiDomain && jitsiScriptUrl && jitsiRoomName,
    );

    const sidebarParticipants = participants
        .filter((item) => item.id !== hostParticipant?.id)
        .slice(0, 3);

    while (sidebarParticipants.length < 3) {
        sidebarParticipants.push(null);
    }

    const disposeJitsi = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.clearTimeout(filmstripHideTimeoutRef.current);
        }

        filmstripHideTimeoutRef.current = null;
        filmstripHiddenRef.current = false;

        const api = jitsiApiRef.current;

        if (!api) {
            return;
        }

        jitsiApiRef.current = null;
        onJitsiApiDisposedRef.current?.();

        try {
            api.executeCommand?.('hangup');
        } catch {
            // Dispose still needs to run if Jitsi cannot process hangup.
        }

        try {
            api.dispose();
        } catch {
            // Cleanup is best-effort during leave/unmount races.
        }
    }, []);

    useEffect(() => {
        displayNameRef.current = displayName;
        subjectRef.current = subject;
        currentParticipantRef.current = currentParticipant;
        onJitsiApiReadyRef.current = onJitsiApiReady;
        onJitsiApiDisposedRef.current = onJitsiApiDisposed;
        onJitsiMediaStateChangeRef.current = onJitsiMediaStateChange;
    }, [
        currentParticipant,
        displayName,
        onJitsiApiDisposed,
        onJitsiApiReady,
        onJitsiMediaStateChange,
        subject,
    ]);

    useEffect(() => {
        let cancelled = false;
        const jitsiListeners = [];

        const removeJitsiListeners = () => {
            jitsiListeners.forEach(([api, eventName, handler]) => {
                api.removeListener?.(eventName, handler);
            });
            jitsiListeners.length = 0;
        };

        if (!shouldMountJitsi) {
            disposeJitsi();
            setJitsiStatus('idle');
            setJitsiError(null);
            return undefined;
        }

        if (!hasValidJitsiConfig) {
            disposeJitsi();
            setJitsiStatus('error');
            setJitsiError('Jitsi video is not configured for this session.');
            return undefined;
        }

        if (!jitsiContainerRef.current || jitsiApiRef.current) {
            return undefined;
        }

        setJitsiStatus('loading');
        setJitsiError(null);

        loadJitsiExternalApi(jitsiScriptUrl)
            .then((JitsiMeetExternalAPI) => {
                if (
                    cancelled ||
                    !jitsiContainerRef.current ||
                    jitsiApiRef.current
                ) {
                    return;
                }

                const apiOptions = {
                    roomName: jitsiRoomName,
                    parentNode: jitsiContainerRef.current,
                    width: '100%',
                    height: '100%',
                    userInfo: {
                        displayName: displayNameRef.current,
                    },
                    configOverwrite: {
                        prejoinPageEnabled: false,
                        prejoinConfig: {
                            enabled: false,
                        },
                        disableDeepLinking: true,
                        disableInviteFunctions: true,
                        hideConferenceSubject: true,
                        startWithAudioMuted: Boolean(
                            currentParticipantRef.current?.is_muted,
                        ),
                        startWithVideoMuted:
                            currentParticipantRef.current?.is_camera_on ===
                            undefined
                                ? true
                                : !currentParticipantRef.current.is_camera_on,
                        toolbarButtons: nativeToolbarButtons,
                    },
                    interfaceConfigOverwrite: {
                        TOOLBAR_BUTTONS: nativeToolbarButtons,
                    },
                };

                if (jitsiAccess?.jwt) {
                    apiOptions.jwt = jitsiAccess.jwt;
                }

                const api = new JitsiMeetExternalAPI(
                    jitsiDomain,
                    apiOptions,
                );

                jitsiApiRef.current = api;
                filmstripHiddenRef.current = false;
                applyJitsiIframePermissions(api);
                setJitsiStatus('ready');
                onJitsiApiReadyRef.current?.(api);
                onJitsiMediaStateChangeRef.current?.({
                    isAudioMuted: Boolean(
                        currentParticipantRef.current?.is_muted,
                    ),
                    isScreenSharing: Boolean(
                        currentParticipantRef.current?.is_screen_sharing,
                    ),
                    isVideoMuted:
                        currentParticipantRef.current?.is_camera_on ===
                        undefined
                            ? undefined
                            : !currentParticipantRef.current.is_camera_on,
                });

                const addJitsiListener = (eventName, handler) => {
                    api.addListener?.(eventName, handler);
                    jitsiListeners.push([api, eventName, handler]);
                };

                addJitsiListener('videoConferenceJoined', () => {
                    api.executeCommand?.('displayName', displayNameRef.current);
                    api.executeCommand?.('subject', subjectRef.current);

                    window.clearTimeout(filmstripHideTimeoutRef.current);
                    filmstripHideTimeoutRef.current = window.setTimeout(() => {
                        if (
                            cancelled ||
                            filmstripHiddenRef.current ||
                            jitsiApiRef.current !== api
                        ) {
                            return;
                        }

                        api.executeCommand?.('toggleFilmStrip');
                        filmstripHiddenRef.current = true;
                    }, 200);
                });
                addJitsiListener('videoMuteStatusChanged', ({ muted }) => {
                    onJitsiMediaStateChangeRef.current?.({
                        isVideoMuted: muted,
                    });
                });
                addJitsiListener('audioMuteStatusChanged', ({ muted }) => {
                    onJitsiMediaStateChangeRef.current?.({
                        isAudioMuted: muted,
                    });
                });
                addJitsiListener('screenSharingStatusChanged', (event) => {
                    onJitsiMediaStateChangeRef.current?.({
                        isScreenSharing: Boolean(event?.on),
                    });
                });
            })
            .catch((error) => {
                if (!cancelled) {
                    setJitsiStatus('error');
                    setJitsiError(
                        error?.message ?? 'Jitsi could not be loaded.',
                    );
                }
            });

        return () => {
            cancelled = true;
            removeJitsiListeners();
            disposeJitsi();
        };
    }, [
        disposeJitsi,
        hasValidJitsiConfig,
        jitsiAccess?.jwt,
        nativeToolbarButtons,
        jitsiDomain,
        jitsiRoomName,
        jitsiScriptUrl,
        shouldMountJitsi,
    ]);

    useEffect(() => {
        if (!jitsiApiRef.current || jitsiStatus !== 'ready') {
            return;
        }

        jitsiApiRef.current.executeCommand?.('displayName', displayName);
        jitsiApiRef.current.executeCommand?.('subject', subject);
    }, [displayName, jitsiStatus, subject]);

    return (
        <section
            className={cn(
                'flex h-full min-h-[420px] flex-col overflow-hidden bg-neutral-950 text-white shadow-sm',
                isFocusMode
                    ? 'min-h-0 rounded-none border-0'
                    : 'rounded-2xl border',
            )}
        >
            {!isFocusMode && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-medium">
                            {subject}
                        </h2>
                        <p className="truncate text-xs text-white/60">
                            Room: {roomName} - {displayName}
                        </p>
                    </div>
                </div>
            )}

            <div
                className={cn(
                    'relative flex min-h-0 flex-1 flex-col gap-3 lg:flex-row',
                    isFocusMode ? 'p-0' : 'p-3',
                )}
            >
                <div className="flex min-h-0 flex-1 flex-col">
                    <VideoTile
                        label={
                            hostParticipant?.user?.name
                                ? `${hostParticipant.user.name} - Teacher`
                                : 'Teacher'
                        }
                        participant={hostParticipant}
                        isMain
                    />
                </div>

                <div className="flex w-full shrink-0 flex-row gap-3 lg:w-[220px] lg:flex-col">
                    {sidebarParticipants.map((participant, index) => (
                        <VideoTile
                            key={participant?.id ?? `placeholder-${index}`}
                            label={
                                participant?.user?.name ??
                                `Participant ${index + 1}`
                            }
                            participant={participant}
                        />
                    ))}
                </div>

                <div
                    id="jitsi-container"
                    ref={jitsiContainerRef}
                    className={cn(
                        'absolute overflow-hidden bg-black shadow-2xl',
                        isFocusMode
                            ? 'inset-0 rounded-none border-0'
                            : 'inset-3 rounded-xl border border-white/10',
                    )}
                    aria-label="Jitsi classroom video"
                >
                    {(streamEndedByStaff || jitsiStatus !== 'ready') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-[1px]">
                            <div className="mx-auto max-w-md px-6 text-center">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-white/10 [@media(max-width:639px)_and_(orientation:portrait)]:hidden">
                                    <MonitorPlay className="size-8 text-white/70" />
                                </div>
                                <p className="text-base font-semibold text-white">
                                    {streamEndedByStaff
                                        ? 'The coach has left the stream'
                                        : showJoinButton
                                        ? 'Ready to join'
                                        : isWaitingForTeacher
                                          ? 'Waiting For The Coach'
                                        : jitsiStatus === 'error'
                                          ? 'Jitsi video is unavailable'
                                          : 'Loading Jitsi video'}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/60">
                                    {streamEndedByStaff
                                        ? 'This classroom stream has ended because the coach or admin left the room.'
                                        : showJoinButton
                                        ? 'Join the session to start the classroom stream.'
                                        : isWaitingForTeacher
                                          ? 'Waiting For The Coach to start the video room...'
                                        : (jitsiError ??
                                          'The meeting is opening inside this classroom area.')}
                                </p>
                                {showJoinButton && (
                                    <button
                                        type="button"
                                        onClick={onJoin}
                                        disabled={isJoining}
                                        className="m-10 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-amber-950 shadow-lg shadow-amber-950/20 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60 [@media(max-width:639px)_and_(orientation:portrait)]:m-7"
                                    >
                                        {isJoining
                                            ? 'Joining...'
                                            : 'Join session'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FeaturedRecordingSection from './components/FeaturedRecordingSection';
import LiveStreamBanner from './components/LiveStreamBanner';
import RecentRecordingsSection from './components/RecentRecordingsSection';
import RecordingsLibraryHeader from './components/RecordingsLibraryHeader';
import RecordingsSidebarList from './components/RecordingsSidebarList';
import RecordingsToolbar from './components/RecordingsToolbar';

const emptyRecordings = {
    data: [],
    meta: {
        total: 0,
        current_page: 1,
        last_page: 1,
        per_page: 4,
        from: 0,
        to: 0,
    },
    links: [],
};

const emptyFilters = {
    search: '',
};

export default function RecordingsIndex() {
    const pageProps = usePage().props ?? {};
    const recordings = pageProps.recordings ?? emptyRecordings;
    const filters = pageProps.filters ?? emptyFilters;
    const liveStream = pageProps.liveStream ?? null;
    const baseRecordingItems = Array.isArray(recordings.data)
        ? recordings.data
        : [];
    const recordingMeta = {
        ...emptyRecordings.meta,
        ...(recordings.meta ?? {}),
    };
    const recordingLinks = Array.isArray(recordings.links)
        ? recordings.links
        : [];
    const search = typeof filters?.search === 'string' ? filters.search : '';
    const recordingCount = Number(
        recordingMeta.total ?? baseRecordingItems.length,
    );
    const [featuredRecording, setFeaturedRecording] = useState(null);
    const [progressOverrides, setProgressOverrides] = useState({});
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);
    const [isPlaybackCompleted, setIsPlaybackCompleted] = useState(false);
    const [playRequest, setPlayRequest] = useState(0);
    const playerRef = useRef(null);
    const lastWatchButtonRef = useRef(null);
    const pageIdentity = `${recordingMeta.current_page ?? 1}:${search}`;
    const recordingItems = useMemo(
        () =>
            baseRecordingItems.map((recording) => ({
                ...recording,
                ...(progressOverrides[recording.id] ?? {}),
            })),
        [baseRecordingItems, progressOverrides],
    );

    useEffect(() => {
        if (!isPlayerOpen) {
            return;
        }

        window.requestAnimationFrame(() => {
            playerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }, [isPlayerOpen]);

    useEffect(() => {
        if (
            featuredRecording &&
            recordingItems.some(
                (recording) => recording.id === featuredRecording.id,
            )
        ) {
            return;
        }

        setFeaturedRecording(null);
        setIsPlayerOpen(false);
        setIsPlaybackCompleted(false);
    }, [featuredRecording, recordingItems]);

    useEffect(() => {
        setFeaturedRecording(null);
        setProgressOverrides({});
        setIsPlayerOpen(false);
        setIsPlaybackCompleted(false);
    }, [pageIdentity]);

    const nextRecording = useMemo(() => {
        if (!featuredRecording) {
            return null;
        }

        const currentIndex = recordingItems.findIndex(
            (recording) => recording.id === featuredRecording.id,
        );

        if (currentIndex < 0) {
            return null;
        }

        return recordingItems[currentIndex + 1] ?? null;
    }, [featuredRecording, recordingItems]);

    const handleSelectRecording = (recording) => {
        lastWatchButtonRef.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
        setFeaturedRecording(recording);
        setIsPlaybackCompleted(false);
        setIsPlayerOpen(true);
    };

    const handleClosePlayer = useCallback(() => {
        setIsPlaybackCompleted(false);
        setIsPlayerOpen(false);
        setFeaturedRecording(null);

        window.requestAnimationFrame(() => {
            if (lastWatchButtonRef.current?.isConnected) {
                lastWatchButtonRef.current.focus();
            }
        });
    }, []);

    const handlePlaybackEnded = () => {
        setIsPlaybackCompleted(true);
    };

    const handleProgressSaved = useCallback((progress) => {
        setProgressOverrides((current) => {
            const previousWatched =
                Number(current[progress.id]?.watched_seconds) || 0;
            const nextWatched = Number(progress.watched_seconds) || 0;

            return {
                ...current,
                [progress.id]: {
                    completed_at:
                        progress.completed_at ??
                        current[progress.id]?.completed_at ??
                        null,
                    watched_seconds: Math.max(previousWatched, nextWatched),
                },
            };
        });

        setFeaturedRecording((current) => {
            if (!current || current.id !== progress.id) {
                return current;
            }

            const previousWatched = Number(current.watched_seconds) || 0;
            const nextWatched = Number(progress.watched_seconds) || 0;

            return {
                ...current,
                completed_at: progress.completed_at ?? current.completed_at ?? null,
                watched_seconds: Math.max(previousWatched, nextWatched),
            };
        });
    }, []);

    const handleReplay = () => {
        setIsPlaybackCompleted(false);
    };

    const handleWatchNext = () => {
        if (!nextRecording) {
            return;
        }

        lastWatchButtonRef.current = null;
        setFeaturedRecording(nextRecording);
        setIsPlaybackCompleted(false);
        setIsPlayerOpen(true);
        setPlayRequest((value) => value + 1);
    };

    const isWatching = isPlayerOpen && Boolean(featuredRecording);

    useEffect(() => {
        if (!isWatching) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleClosePlayer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClosePlayer, isWatching]);

    return (
        <div className="min-h-[calc(100dvh-4rem)] overflow-x-hidden bg-[#f6f5f1] text-foreground dark:bg-[#101010]">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-6 md:px-6 lg:py-8">
                {!isWatching && (
                    <>
                        <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-neutral-950/72 dark:shadow-black/20 md:p-6">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
                                <RecordingsLibraryHeader
                                    recordingCount={recordingCount}
                                />
                                <RecordingsToolbar
                                    disabled={recordingCount === 0}
                                    query={search}
                                />
                            </div>
                        </div>

                        <LiveStreamBanner liveStream={liveStream} />
                    </>
                )}

                {isWatching ? (
                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <FeaturedRecordingSection
                            ref={playerRef}
                            recording={featuredRecording}
                            isPlaybackCompleted={isPlaybackCompleted}
                            nextRecording={nextRecording}
                            playRequest={playRequest}
                            onClose={handleClosePlayer}
                            onPlaybackEnded={handlePlaybackEnded}
                            onProgressSaved={handleProgressSaved}
                            onReplay={handleReplay}
                            onWatchNext={handleWatchNext}
                        />

                        <RecordingsSidebarList
                            recordings={recordingItems}
                            selectedRecordingId={featuredRecording.id}
                            onSelectRecording={handleSelectRecording}
                        />
                    </div>
                ) : (
                    <RecentRecordingsSection
                        links={recordingLinks}
                        recordings={recordingItems}
                        meta={recordingMeta}
                        onNavigate={() => {
                            setFeaturedRecording(null);
                            setIsPlayerOpen(false);
                            setIsPlaybackCompleted(false);
                        }}
                        search={search}
                        selectedRecordingId={featuredRecording?.id}
                        onSelectRecording={handleSelectRecording}
                    />
                )}
            </div>
        </div>
    );
}

RecordingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Recordings',
            href: '/recordings',
        },
    ],
};
import { forwardRef, useEffect, useRef, useState } from 'react';
import {
    Calendar,
    CheckCircle,
    Clock,
    RotateCcw,
    SkipForward,
    Video,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecordingProgress } from '../hooks/useRecordingProgress';
import {
    formatDate,
    formatDuration,
    recordingTitle,
} from '../lib/recording-formatters';

function FeaturedMedia({
    recording,
    isPlaybackCompleted,
    nextRecording,
    playRequest,
    onClose,
    onPlaybackEnded,
    onProgressSaved,
    onReplay,
    onWatchNext,
}) {
    const [hasPlayerError, setHasPlayerError] = useState(false);
    const videoRef = useRef(null);
    useRecordingProgress({
        onProgressSaved,
        recording,
        videoRef,
    });

    useEffect(() => {
        setHasPlayerError(false);
    }, [recording?.id]);

    useEffect(() => {
        if (!playRequest || !videoRef.current) {
            return;
        }

        videoRef.current.currentTime = 0;
        videoRef.current.play()?.catch(() => {});
    }, [playRequest, recording?.id]);

    const handleReplay = () => {
        onReplay();

        if (!videoRef.current) {
            return;
        }

        videoRef.current.currentTime = 0;
        videoRef.current.play()?.catch(() => {});
    };

    // NOTE: everything in this component intentionally stays on a fixed
    // dark chrome (bg-neutral-950, text-white, text-neutral-300...)
    // regardless of light/dark theme. This mirrors how virtually every
    // video player (YouTube, Netflix, native <video> controls) keeps a
    // black letterbox background so the video content itself has
    // consistent contrast — it is NOT part of the "no light mode" bug.
    return (
        <div className="relative aspect-video overflow-hidden bg-neutral-950">
            {recording.has_streamable_source && !hasPlayerError ? (
                <video
                    key={recording.id}
                    ref={videoRef}
                    aria-label={`Recording player for ${recordingTitle(recording)}`}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full bg-black"
                    onError={() => setHasPlayerError(true)}
                    onEnded={onPlaybackEnded}
                >
                    <source src={recording.stream_url} type="video/mp4" />
                </video>
            ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-white">
                        <Video className="size-7" />
                    </div>
                    <p className="max-w-md text-sm text-neutral-300">
                        Recording source is not available yet.
                    </p>
                </div>
            )}

            {isPlaybackCompleted &&
                recording.has_streamable_source &&
                !hasPlayerError && (
                    <div
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-neutral-950/88 px-5 text-center backdrop-blur-sm"
                        aria-live="polite"
                    >
                        <div className="flex size-14 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-xl shadow-amber-950/30">
                            <CheckCircle className="size-7" aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-white">
                                Recording completed
                            </p>
                            <p className="text-sm text-neutral-300">
                                You finished this replay.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button
                                type="button"
                                onClick={handleReplay}
                                className="bg-amber-400 text-amber-950 hover:bg-amber-300"
                            >
                                <RotateCcw
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Replay
                            </Button>
                            {nextRecording && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onWatchNext}
                                    className="border border-white/10 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                                >
                                    <SkipForward
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Watch next
                                </Button>
                            )}
                        </div>
                    </div>
                )}

            <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={onClose}
                aria-label="Close recording player"
                className="absolute top-3 right-3 z-20 bg-white/90 text-neutral-950 shadow-lg hover:bg-white"
            >
                <X className="size-4" />
            </Button>
        </div>
    );
}

const FeaturedRecordingSection = forwardRef(function FeaturedRecordingSection(
    {
        recording,
        isPlaybackCompleted,
        nextRecording,
        playRequest,
        onClose,
        onPlaybackEnded,
        onProgressSaved,
        onReplay,
        onWatchNext,
    },
    ref,
) {
    const recordedDate = formatDate(recording?.recorded_at);
    const duration = formatDuration(recording?.duration_seconds);
    const description =
        typeof recording?.description === 'string' &&
        recording.description.trim()
            ? recording.description
            : null;

    return (
        <section ref={ref} aria-labelledby="active-recording-title">
            <h2 id="active-recording-title" className="sr-only">
                Active recording player
            </h2>
            {/* CHANGED: was a two-column grid (video | info side by side).
                Now stacked vertically — video on top, info directly below
                it — so this reads as a single "main column" like a
                YouTube watch page, leaving room for a separate sidebar
                list of other recordings next to it. */}
            <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/10">
                <FeaturedMedia
                    recording={recording}
                    isPlaybackCompleted={isPlaybackCompleted}
                    nextRecording={nextRecording}
                    playRequest={playRequest}
                    onClose={onClose}
                    onPlaybackEnded={onPlaybackEnded}
                    onProgressSaved={onProgressSaved}
                    onReplay={onReplay}
                    onWatchNext={onWatchNext}
                />

                <div className="flex min-w-0 flex-col gap-3 p-5 md:p-6">
                    {recording.session?.title && (
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">
                            {recording.session.title}
                        </p>
                    )}
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                            {recordingTitle(recording)}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {recordedDate && (
                                <span className="inline-flex items-center gap-2">
                                    <Calendar
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {recordedDate}
                                </span>
                            )}
                            {duration && (
                                <span className="inline-flex items-center gap-2">
                                    <Clock
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {duration}
                                </span>
                            )}
                        </div>
                    </div>

                    {description && (
                        <p className="max-w-prose overflow-hidden text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
});

export default FeaturedRecordingSection;

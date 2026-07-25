import { forwardRef, useEffect, useRef, useState } from 'react';
import {
    Calendar,
    CheckCircle,
    Clock,
    Maximize,
    Minimize,
    Pause,
    Play,
    RotateCcw,
    SkipForward,
    Video,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecordingProgress } from '../hooks/useRecordingProgress';
import {
    courseBadgeStyles,
    formatDate,
    formatDuration,
    recordingCourse,
    recordingTitle,
} from '../lib/recording-formatters';

function CourseBadge({ course }) {
    const className = courseBadgeStyles[course];

    if (!className) {
        return null;
    }

    return (
        <span
            className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}
        >
            {course}
        </span>
    );
}
function formatPlayerTime(seconds) {
    const value = Number(seconds);

    if (!Number.isFinite(value) || value <= 0) {
        return '00:00';
    }

    const totalSeconds = Math.floor(value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    if (hours > 0) {
        return `${hours}:${paddedMinutes}:${paddedSeconds}`;
    }

    return `${paddedMinutes}:${paddedSeconds}`;
}

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
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const playerRef = useRef(null);
    const videoRef = useRef(null);

    useRecordingProgress({
        onProgressSaved,
        recording,
        videoRef,
    });

    useEffect(() => {
        setHasPlayerError(false);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
    }, [recording?.id]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === playerRef.current);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange,
            );
        };
    }, []);

    useEffect(() => {
        if (!playRequest || !videoRef.current) {
            return;
        }

        videoRef.current.currentTime = 0;
        setCurrentTime(0);
        videoRef.current.play()?.catch(() => {});
    }, [playRequest, recording?.id]);

    const syncVideoProgress = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const nextCurrentTime = Number(video.currentTime);
        const nextDuration = Number(video.duration);

        setCurrentTime(
            Number.isFinite(nextCurrentTime) && nextCurrentTime > 0
                ? nextCurrentTime
                : 0,
        );
        setDuration(
            Number.isFinite(nextDuration) && nextDuration > 0
                ? nextDuration
                : 0,
        );
    };

    const syncVideoVolume = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        setVolume(video.volume);
        setIsMuted(video.muted || video.volume === 0);
    };

    const handleProgressSeek = (event) => {
        const video = videoRef.current;

        if (!video || duration <= 0) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const seekRatio = Math.min(
            1,
            Math.max(0, (event.clientX - rect.left) / rect.width),
        );
        const nextTime = duration * seekRatio;

        video.currentTime = nextTime;
        setCurrentTime(nextTime);
    };

    const handlePlayPause = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (video.paused) {
            video.play()?.catch(() => {});
            return;
        }

        video.pause();
    };

    const handleMuteToggle = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (video.muted || video.volume === 0) {
            const restoredVolume = video.volume > 0 ? video.volume : 0.7;
            video.volume = restoredVolume;
            video.muted = false;
            setVolume(restoredVolume);
            setIsMuted(false);
            return;
        }

        video.muted = true;
        setIsMuted(true);
    };

    const handleVolumeChange = (event) => {
        const video = videoRef.current;
        const nextVolume = Math.min(
            1,
            Math.max(0, Number(event.target.value)),
        );

        setVolume(nextVolume);
        setIsMuted(nextVolume === 0);

        if (!video) {
            return;
        }

        video.volume = nextVolume;
        video.muted = nextVolume === 0;
    };

    const handleFullscreen = () => {
        const player = playerRef.current;

        if (!player) {
            return;
        }

        if (document.fullscreenElement) {
            document.exitFullscreen?.();
            return;
        }

        player.requestFullscreen?.();
    };

    const handleReplay = () => {
        onReplay();

        if (!videoRef.current) {
            return;
        }

        videoRef.current.currentTime = 0;
        setCurrentTime(0);
        videoRef.current.play()?.catch(() => {});
    };

    const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
    const displayedVolume = isMuted ? 0 : volume;

    return (
        <div
            ref={playerRef}
            className={
                isFullscreen
                    ? 'flex h-screen flex-col overflow-hidden bg-neutral-950'
                    : 'overflow-hidden bg-neutral-950'
            }
        >
            <div
                className={
                    isFullscreen
                        ? 'relative min-h-0 flex-1 bg-neutral-950'
                        : 'relative aspect-video bg-neutral-950'
                }
            >
                {recording.has_streamable_source && !hasPlayerError ? (
                    <video
                        key={recording.id}
                        ref={videoRef}
                        aria-label={`Recording player for ${recordingTitle(recording)}`}
                        playsInline
                        preload="metadata"
                        className="h-full w-full bg-black object-contain"
                        onDurationChange={syncVideoProgress}
                        onError={() => setHasPlayerError(true)}
                        onLoadedMetadata={() => {
                            syncVideoProgress();
                            syncVideoVolume();
                        }}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onTimeUpdate={syncVideoProgress}
                        onVolumeChange={syncVideoVolume}
                        onEnded={(event) => {
                            setIsPlaying(false);
                            syncVideoProgress();
                            onPlaybackEnded(event);
                        }}
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

            {recording.has_streamable_source && !hasPlayerError && (
                <div className="shrink-0 border-t border-white/10 bg-neutral-950 px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-300">
                        <Button
                            type="button"
                            size="icon"
                            onClick={handlePlayPause}
                            aria-label={isPlaying ? 'Pause recording' : 'Play recording'}
                            className="size-9 shrink-0 bg-amber-400 text-amber-950 hover:bg-amber-300"
                        >
                            {isPlaying ? (
                                <Pause className="size-4 fill-current" aria-hidden="true" />
                            ) : (
                                <Play className="size-4 fill-current" aria-hidden="true" />
                            )}
                        </Button>
                        <span className="min-w-11 font-mono text-amber-200">
                            {formatPlayerTime(currentTime)}
                        </span>
                        <button
                            type="button"
                            className="group h-5 min-w-32 flex-1 cursor-pointer rounded-full py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                            onClick={handleProgressSeek}
                            aria-label="Seek recording progress"
                            aria-valuemax={Math.floor(duration)}
                            aria-valuemin={0}
                            aria-valuenow={Math.floor(currentTime)}
                        >
                            <span className="block h-[5px] overflow-hidden rounded-full bg-white/18 shadow-inner">
                                <span
                                    className="block h-full rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)] transition-[width] group-hover:bg-amber-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </span>
                        </button>
                        <span className="min-w-11 text-right font-mono text-neutral-400">
                            {formatPlayerTime(duration)}
                        </span>

                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5">
                            <button
                                type="button"
                                onClick={handleMuteToggle}
                                className="inline-flex size-7 items-center justify-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                                aria-label={isMuted ? 'Unmute recording' : 'Mute recording'}
                            >
                                {isMuted ? (
                                    <VolumeX className="size-4" aria-hidden="true" />
                                ) : (
                                    <Volume2 className="size-4" aria-hidden="true" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={displayedVolume}
                                onChange={handleVolumeChange}
                                aria-label="Recording volume"
                                className="h-1.5 w-20 accent-amber-400 sm:w-24"
                            />
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleFullscreen}
                            aria-label={isFullscreen ? 'Exit fullscreen recording player' : 'Fullscreen recording player'}
                            className="size-9 shrink-0 text-neutral-300 hover:bg-white/10 hover:text-amber-200"
                        >
                            {isFullscreen ? (
                                <Minimize className="size-4" aria-hidden="true" />
                            ) : (
                                <Maximize className="size-4" aria-hidden="true" />
                            )}
                        </Button>
                    </div>
                </div>
            )}
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
    const course = recordingCourse(recording);
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
                    <div className="space-y-2">
                        <CourseBadge course={course} />
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
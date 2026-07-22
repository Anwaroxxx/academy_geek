import { CheckCircle, Clock, Play, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RecordingPagination from './RecordingPagination';
import {
    formatDate,
    formatDuration,
    formatWatchedDuration,
    recordingTitle,
    watchedSeconds,
} from '../lib/recording-formatters';

function RecordingRow({ recording, isSelected, onSelect }) {
    const recordedDate = formatDate(recording.recorded_at);
    const duration = formatDuration(recording.duration_seconds);
    const title = recordingTitle(recording);
    const watched = watchedSeconds(recording);
    const durationSeconds = Number(recording.duration_seconds) || 0;
    const isCompleted = Boolean(recording.completed_at)
        || (durationSeconds > 0 && watched >= Math.ceil(durationSeconds * 0.9));
    const hasWatchedProgress = isCompleted || watched > 0;
    const progress = isCompleted
        ? 100
        : durationSeconds > 0
            ? Math.min(100, (watched / durationSeconds) * 100)
            : 0;
    const roundedProgress = isCompleted
        ? 100
        : watched > 0 && progress > 0
            ? Math.max(1, Math.round(progress))
            : Math.round(progress);
    const progressText = isCompleted
        ? 'Completed'
        : `${formatWatchedDuration(watched)}${
            durationSeconds > 0 ? ` - ${roundedProgress}%` : ''
        }`;
    return (
        <article
            className={cn(
                'group grid overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-md shadow-black/5 transition hover:border-amber-300/70 md:grid-cols-[104px_minmax(0,1fr)_auto]',
                isSelected &&
                    'border-amber-300 bg-muted ring-2 ring-amber-300/40',
            )}
            aria-current={isSelected ? 'true' : undefined}
            aria-labelledby={`recording-${recording.id}-title`}
        >
            <div
                className="relative flex min-h-24 items-center justify-center overflow-hidden bg-muted text-amber-600 md:min-h-0"
                aria-hidden="true"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.28),transparent_34%),linear-gradient(135deg,rgba(245,158,11,0.18),rgba(10,10,10,0.96))]" />
                <div className="relative flex size-10 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/15 shadow-lg">
                    <Video className="size-5" />
                </div>
            </div>

            <div className="min-w-0 space-y-2.5 p-4 md:px-4 md:py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                    {isSelected && (
                        <span className="rounded-full border border-amber-300/50 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                            Featured
                        </span>
                    )}
                </div>

                <h3
                    id={`recording-${recording.id}-title`}
                    className="line-clamp-1 text-base font-semibold tracking-tight md:text-lg"
                >
                    {title}
                </h3>

                {recording.session?.title && (
                    <p className="line-clamp-1 text-sm font-medium text-amber-200/90">
                        {recording.session.title}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-neutral-400">
                    {recordedDate && <span>{recordedDate}</span>}
                    {duration && (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-4" aria-hidden="true" />
                            {duration}
                        </span>
                    )}
                </div>

                {hasWatchedProgress && (
                    <div className="w-full max-w-[360px] space-y-1.5">
                        <div
                            className="h-[5px] overflow-hidden rounded-full bg-neutral-200 shadow-inner dark:bg-neutral-800"
                            aria-label={`${progressText} progress`}
                        >
                            <div
                                className="h-full rounded-full bg-amber-400 transition-[width]"
                                style={{
                                    minWidth: progress > 0 ? '6px' : undefined,
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-amber-200/85">
                            {isCompleted && (
                                <CheckCircle className="size-3.5" aria-hidden="true" />
                            )}
                            {progressText}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-4 py-3 md:border-t-0 md:border-l">
                {isSelected && (
                    <span className="hidden text-sm text-neutral-400 lg:inline">
                        Selected
                    </span>
                )}
                <Button
                    type="button"
                    onClick={() => onSelect(recording)}
                    className="bg-amber-400 text-amber-950 hover:bg-amber-300"
                    aria-label={`Watch ${title}`}
                >
                    <Play className="size-4 fill-current" aria-hidden="true" />
                    Watch
                </Button>
            </div>
        </article>
    );
}

export default function RecentRecordingsSection({
    links,
    meta,
    onNavigate,
    onSelectRecording,
    recordings,
    search,
    selectedRecordingId,
}) {
    const total = Number.isFinite(meta?.total) ? meta.total : recordings.length;
    const from = meta?.from;
    const to = meta?.to;
    const hasSearch = search.trim() !== '';
    const countLabel =
        total === 1 ? '1 recording' : `${total.toLocaleString()} recordings`;
    const rangeLabel =
        from && to
            ? `Showing ${from.toLocaleString()}-${to.toLocaleString()} of ${countLabel}`
            : countLabel;

    return (
        <section
            className="rounded-3xl border border-black/5 bg-white/85 p-4 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-neutral-950/80 dark:shadow-black/20 md:p-5"
            aria-labelledby="recent-recordings-title"
        >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2
                        id="recent-recordings-title"
                        className="text-lg font-semibold"
                    >
                        Recent recordings
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Browse classroom replays published for your learning.
                    </p>
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {rangeLabel}
                </span>
            </div>

            {total === 0 && !hasSearch ? (
                <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-amber-400/35 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.86),rgba(250,250,247,0.92))] px-6 py-14 text-center dark:border-amber-300/20 dark:bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.16),transparent_38%),linear-gradient(180deg,rgba(23,23,23,0.88),rgba(10,10,10,0.94))]">
                    <div className="mx-auto max-w-lg">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow-xl shadow-amber-950/10 dark:shadow-black/30">
                            <Video className="size-7" aria-hidden="true" />
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#806200] dark:text-amber-200">
                            <Sparkles className="size-3.5" aria-hidden="true" />
                            Library pending
                        </div>
                        <h3 className="mt-4 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                            No recordings yet
                        </h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                            Recorded classroom sessions will appear here once
                            they are available.
                        </p>
                    </div>
                </div>
            ) : recordings.length === 0 ? (
                <div className="rounded-xl border border-border/70 bg-muted/70 px-6 py-10 text-center text-sm text-muted-foreground">
                    No recordings match your search.
                </div>
            ) : (
                <div className="space-y-5">
                    <ul className="space-y-3">
                        {recordings.map((recording) => (
                            <li key={recording.id}>
                                <RecordingRow
                                    recording={recording}
                                    isSelected={
                                        selectedRecordingId === recording.id
                                    }
                                    onSelect={onSelectRecording}
                                />
                            </li>
                        ))}
                    </ul>

                    <RecordingPagination
                        meta={meta}
                        links={links}
                        onNavigate={onNavigate}
                    />
                </div>
            )}
        </section>
    );
}

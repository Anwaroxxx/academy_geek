import { Clock, Play, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    formatDate,
    formatDuration,
    recordingTitle,
} from '../lib/recording-formatters';

function RecordingRow({ recording, isSelected, onSelect }) {
    const recordedDate = formatDate(recording.recorded_at);
    const duration = formatDuration(recording.duration_seconds);
    const title = recordingTitle(recording);

    return (
        <article
            className={cn(
                'group grid overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-lg shadow-black/10 transition hover:border-amber-300/70 md:grid-cols-[116px_minmax(0,1fr)] lg:grid-cols-[132px_minmax(0,1fr)_180px]',
                isSelected &&
                    'border-amber-300 bg-muted ring-2 ring-amber-300/40',
            )}
            aria-current={isSelected ? 'true' : undefined}
            aria-labelledby={`recording-${recording.id}-title`}
        >
            <div
                className="relative flex min-h-28 items-center justify-center overflow-hidden bg-muted text-amber-600 md:min-h-0"
                aria-hidden="true"
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.28),transparent_34%),linear-gradient(135deg,rgba(245,158,11,0.18),rgba(10,10,10,0.96))]" />
                <div className="relative flex size-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/15 shadow-lg">
                    <Video className="size-6" />
                </div>
            </div>

            <div className="min-w-0 space-y-3 p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2">
                    {isSelected && (
                        <span className="rounded-full border border-amber-300/50 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                            Featured
                        </span>
                    )}
                    {recording.status === 'ready' && (
                        <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                            Ready
                        </span>
                    )}
                </div>

                <h3
                    id={`recording-${recording.id}-title`}
                    className="line-clamp-2 text-lg font-semibold tracking-tight"
                >
                    {title}
                </h3>

                {recording.session?.title && (
                    <p className="line-clamp-1 text-sm font-medium text-amber-200/90">
                        {recording.session.title}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-400">
                    {recordedDate && <span>{recordedDate}</span>}
                    {duration && (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-4" aria-hidden="true" />
                            {duration}
                        </span>
                    )}
                </div>

            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4 md:col-span-2 lg:col-span-1 lg:flex-col lg:items-end lg:justify-center lg:border-t-0 lg:border-l">
                <span className="text-sm text-neutral-400">
                    {isSelected ? 'Selected recording' : 'Ready to watch'}
                </span>
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
    recordings,
    meta,
    search,
    selectedRecordingId,
    onSelectRecording,
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
            )}
        </section>
    );
}

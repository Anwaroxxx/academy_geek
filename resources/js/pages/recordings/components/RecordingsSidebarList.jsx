import { ArrowUpDown, Clock, Play, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    formatDate,
    formatDuration,
    recordingTitle,
} from '../lib/recording-formatters';

// Same visual language as RecentRecordingsSection's RecordingRow (badge,
// title, session, date/duration), reflowed as a horizontal row for the
// sidebar: a large preview thumbnail on the left (~38% of the card's
// width, real aspect ratio, object-cover), truncating text content in
// the middle, and a circular play button pinned to the right that never
// shrinks. The whole card is still a single click target.
// This intentionally does NOT use `md:`/`lg:` breakpoint classes for its
// layout, since those react to viewport width, not this column's width.
function SidebarRecordingRow({ recording, isSelected, onSelect }) {
    const recordedDate = formatDate(recording.recorded_at);
    const duration = formatDuration(recording.duration_seconds);
    const title = recordingTitle(recording);

    return (
        <button
            type="button"
            onClick={() => onSelect(recording)}
            aria-current={isSelected ? 'true' : undefined}
            aria-label={`Watch ${title}`}
            className={cn(
                'flex w-full items-center gap-3 rounded-2xl border bg-card p-2.5 text-left text-card-foreground shadow-sm transition hover:border-amber-400/70',
                isSelected &&
                    'border-amber-400 bg-amber-50/60 ring-2 ring-amber-400/40 dark:bg-amber-400/10',
            )}
        >
            {/* Thumbnail — the recording preview. ~38% of the card's width,
                real aspect ratio (not a small icon box), rounded corners,
                object-cover so it never stretches or distorts. */}
            <div className="relative aspect-video w-[38%] shrink-0 overflow-hidden rounded-lg border border-black/10 bg-neutral-900 ring-1 ring-white/5">
                {recording.thumbnail_url ? (
                    <img
                        src={recording.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.35),transparent_45%),linear-gradient(135deg,#2a2410,#0a0a0a)]">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400 shadow-lg shadow-black/30">
                            <Video
                                className="size-4 text-amber-950"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content — title, course name, date + duration; truncates */}
            <div className="min-w-0 flex-1 space-y-1">
                <h4
                    id={`sidebar-recording-${recording.id}-title`}
                    className="truncate text-sm font-semibold tracking-tight text-foreground"
                >
                    {title}
                </h4>

                {recording.session?.title && (
                    <p className="truncate text-sm font-medium text-amber-600 dark:text-amber-300">
                        {recording.session.title}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                    {recordedDate && (
                        <span className="truncate">{recordedDate}</span>
                    )}
                    {recordedDate && duration && (
                        <span aria-hidden="true">·</span>
                    )}
                    {duration && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {duration}
                        </span>
                    )}
                </div>
            </div>

            {/* Play button — circular, brand yellow, fixed size, never shrinks */}
            <span className="flex size-9 shrink-0 items-center justify-center self-center rounded-full bg-amber-400 shadow-md shadow-black/20">
                <Play
                    className="size-4 translate-x-px fill-amber-950 text-amber-950"
                    aria-hidden="true"
                />
            </span>
        </button>
    );
}

export default function RecordingsSidebarList({
    recordings = [],
    selectedRecordingId,
    onSelectRecording,
    onSortClick,
}) {
    if (recordings.length === 0) {
        return null;
    }

    return (
        <aside
            className="flex min-h-0 flex-col gap-3 lg:sticky lg:top-6"
            aria-label="Recordings"
        >
            <div className="flex items-start justify-between gap-3 px-1">
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        Recordings
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {recordings.length}{' '}
                        {recordings.length === 1 ? 'video' : 'videos'}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onSortClick}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                    <ArrowUpDown className="size-3.5" aria-hidden="true" />
                    Sort
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {recordings.map((recording) => (
                    <SidebarRecordingRow
                        key={recording.id}
                        recording={recording}
                        isSelected={selectedRecordingId === recording.id}
                        onSelect={onSelectRecording}
                    />
                ))}
            </div>
        </aside>
    );
}

import {
    ArrowUpDown,
    BookOpen,
    Braces,
    Clock,
    Code2,
    FileCode2,
    Flame,
    Github,
    GitBranch,
    LayoutGrid,
    Palette,
    Paintbrush,
    Play,
    Wind,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    courseBadgeStyles,
    courseVisual,
    formatDate,
    formatDuration,
    recordingCourse,
    recordingTitle,
} from '../lib/recording-formatters';

const courseIcons = {
    'HTML Course': FileCode2,
    'CSS Course': Paintbrush,
    'JavaScript Course': Braces,
    'Bootstrap Course': LayoutGrid,
    'Sass Course': Palette,
    'Git Course': GitBranch,
    'GitHub Course': Github,
    'Tailwind Course': Wind,
    'Laravel Course': Flame,
    'General Course': BookOpen,
};

function CourseBadge({ course }) {
    const className =
        courseBadgeStyles[course] ?? courseBadgeStyles['General Course'];
    const Icon = courseIcons[course] ?? Code2;

    return (
        <span
            className={cn(
                'inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold',
                className,
            )}
        >
            <Icon className="size-3" aria-hidden="true" />
            {course}
        </span>
    );
}

function SidebarThumbnail({ course, duration, recording, title }) {
    const visual = courseVisual(course);

    return (
        <div className="relative aspect-video w-[38%] shrink-0 overflow-hidden rounded-lg border border-black/10 bg-neutral-950 ring-1 ring-white/5">
            {recording.thumbnail_url ? (
                <img
                    src={recording.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover"
                />
            ) : (
                <div
                    className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        visual.thumbnail,
                    )}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.28),transparent_30%)]" />
                    <p className="absolute right-2 bottom-2 left-2 line-clamp-2 text-[11px] font-black leading-3 text-white drop-shadow">
                        {title}
                    </p>
                </div>
            )}

            <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur transition group-hover:bg-amber-400 group-hover:text-amber-950">
                    <Play
                        className="size-3.5 translate-x-px fill-current"
                        aria-hidden="true"
                    />
                </span>
            </span>

            {duration && (
                <span className="absolute right-1.5 bottom-1.5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    {duration}
                </span>
            )}
        </div>
    );
}

function SidebarRecordingRow({ recording, isSelected, onSelect }) {
    const recordedDate = formatDate(recording.recorded_at);
    const duration = formatDuration(recording.duration_seconds);
    const title = recordingTitle(recording);
    const course = recordingCourse(recording);

    return (
        <button
            type="button"
            onClick={() => onSelect(recording)}
            aria-current={isSelected ? 'true' : undefined}
            aria-label={`Watch ${title}`}
            className={cn(
                'group flex w-full items-center gap-3 rounded-2xl border bg-card p-2.5 text-left text-card-foreground shadow-sm transition hover:border-amber-400/70 hover:shadow-md hover:shadow-amber-950/10',
                isSelected &&
                    'border-amber-400 bg-amber-50/60 ring-2 ring-amber-400/40 dark:bg-amber-400/10',
            )}
        >
            <SidebarThumbnail
                course={course}
                duration={duration}
                recording={recording}
                title={title}
            />

            <div className="min-w-0 flex-1 space-y-1">
                <CourseBadge course={course} />
                <h4
                    id={`sidebar-recording-${recording.id}-title`}
                    className="truncate text-sm font-semibold tracking-tight text-foreground"
                >
                    {title}
                </h4>

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

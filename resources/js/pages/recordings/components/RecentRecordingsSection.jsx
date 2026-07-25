import {
    BookOpen,
    Braces,
    Calendar,
    CheckCircle,
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
    Sparkles,
    Video,
    Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import RecordingPagination from './RecordingPagination';
import {
    courseBadgeStyles,
    courseVisual,
    formatDate,
    formatDuration,
    formatWatchedDuration,
    recordingCourse,
    recordingTitle,
    watchedSeconds,
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
                'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
                className,
            )}
        >
            <Icon className="size-3.5" aria-hidden="true" />
            {course}
        </span>
    );
}

function RecordingThumbnail({ recording, course, duration, title }) {
    const visual = courseVisual(course);

    return (
        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-neutral-950">
            {recording.thumbnail_url ? (
                <img
                    src={recording.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
            ) : (
                <div
                    className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        visual.thumbnail,
                    )}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.32),transparent_24%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_34%,rgba(251,191,36,0.12)_65%,transparent)]" />
                    <p className="absolute right-5 bottom-5 left-5 line-clamp-2 text-lg font-black tracking-tight text-white drop-shadow md:text-xl">
                        {title}
                    </p>
                </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-2xl backdrop-blur transition group-hover:scale-105 group-hover:bg-amber-400 group-hover:text-amber-950">
                    <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
                </span>
            </div>

            {duration && (
                <span className="absolute right-3 bottom-3 rounded-md bg-black/75 px-2 py-1 font-mono text-xs font-bold text-white shadow-lg backdrop-blur">
                    {duration}
                </span>
            )}
        </div>
    );
}

function RecordingCard({ recording, isSelected, onSelect }) {
    const recordedDate = formatDate(recording.recorded_at);
    const duration = formatDuration(recording.duration_seconds);
    const title = recordingTitle(recording);
    const course = recordingCourse(recording);
    const watched = watchedSeconds(recording);
    const durationSeconds = Number(recording.duration_seconds) || 0;
    const isCompleted =
        Boolean(recording.completed_at) ||
        (durationSeconds > 0 && watched >= Math.ceil(durationSeconds * 0.9));
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
              durationSeconds > 0 ? ` · ${roundedProgress}%` : ''
          }`;

    return (
        <article
            className={cn(
                'group flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-[#E8E1D1] bg-white text-card-foreground shadow-[0_12px_30px_rgba(16,32,51,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-300/70 hover:shadow-[0_22px_44px_rgba(255,208,38,0.14)] dark:border-neutral-800 dark:bg-neutral-950/70 dark:shadow-black/20 dark:hover:border-amber-300/45',
                isSelected && 'border-amber-300 ring-2 ring-amber-300/40',
            )}
            aria-current={isSelected ? 'true' : undefined}
            aria-labelledby={`recording-${recording.id}-title`}
        >
            <RecordingThumbnail
                recording={recording}
                course={course}
                duration={duration}
                title={title}
            />

            <div className="flex flex-1 flex-col p-4">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <CourseBadge course={course} />
                        {isSelected && (
                            <span className="rounded-full border border-amber-300/50 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-200">
                                Featured
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3
                            id={`recording-${recording.id}-title`}
                            className="line-clamp-2 text-base font-black leading-6 text-neutral-950 dark:text-white"
                        >
                            {title}
                        </h3>
                        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-neutral-600 dark:text-neutral-400">
                            {recording.description || 'No description provided'}
                        </p>
                        {recording.session?.title && (
                            <p className="line-clamp-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                                {recording.session.title}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        {recordedDate && (
                            <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                {recordedDate}
                            </span>
                        )}
                        {duration && (
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                {duration}
                            </span>
                        )}
                    </div>

                    {hasWatchedProgress && (
                        <div className="space-y-1.5">
                            <div
                                className="h-[5px] overflow-hidden rounded-full bg-neutral-200 shadow-inner dark:bg-neutral-800"
                                aria-label={`${progressText} progress`}
                            >
                                <div
                                    className="h-full rounded-full bg-amber-400 transition-[width]"
                                    style={{
                                        minWidth: progress > 0 ? '6px' : undefined,
                                        width: `${isCompleted ? 100 : progress}%`,
                                    }}
                                />
                            </div>
                            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-amber-200/85">
                                {isCompleted && (
                                    <CheckCircle
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                )}
                                {progressText}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-end gap-3 pt-5">
                    {isSelected && (
                        <span className="hidden text-sm text-muted-foreground lg:inline">
                            Selected
                        </span>
                    )}
                    <Button
                        type="button"
                        onClick={() => onSelect(recording)}
                        className="bg-amber-400 font-bold text-amber-950 hover:bg-amber-300"
                        aria-label={`Watch ${title}`}
                    >
                        <Play className="size-4 fill-current" aria-hidden="true" />
                        Watch
                    </Button>
                </div>
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
                    <ul className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {recordings.map((recording) => (
                            <li key={recording.id}>
                                <RecordingCard
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

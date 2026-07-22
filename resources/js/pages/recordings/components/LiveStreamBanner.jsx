import { Link } from '@inertiajs/react';
import { Clock, Radio, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

function parseStartedAt(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    const timestamp = date.getTime();

    if (Number.isNaN(timestamp) || timestamp > Date.now() + 60000) {
        return null;
    }

    return date;
}

function formatLiveDuration(startedAt, now) {
    if (!startedAt) {
        return 'Live session available';
    }

    const elapsedSeconds = Math.max(
        0,
        Math.floor((now - startedAt.getTime()) / 1000),
    );
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        return `Live for ${hours}:${paddedMinutes}:${paddedSeconds}`;
    }

    return `Live for ${paddedMinutes}:${paddedSeconds}`;
}

function initials(name) {
    const value = typeof name === 'string' ? name.trim() : '';

    if (!value) {
        return 'C';
    }

    return value
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

export default function LiveStreamBanner({ liveStream }) {
    const [now, setNow] = useState(() => Date.now());
    const startedAt = useMemo(
        () => parseStartedAt(liveStream?.started_at),
        [liveStream?.started_at],
    );

    useEffect(() => {
        if (!startedAt) {
            return undefined;
        }

        const interval = window.setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => window.clearInterval(interval);
    }, [startedAt]);

    if (!liveStream?.is_live || !liveStream?.href) {
        return null;
    }

    const title = liveStream.title || 'Live classroom session';
    const coachName = liveStream.coach_name || 'Coach';
    const classLabel = [liveStream.class_name, liveStream.type]
        .filter(Boolean)
        .join(' - ');
    const studentsOnline = Number(liveStream.students_online);
    const hasStudentsOnline = Number.isFinite(studentsOnline) && studentsOnline >= 0;

    return (
        <section
            className="overflow-hidden rounded-2xl border border-amber-300/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,248,226,0.92))] shadow-xl shadow-amber-950/5 dark:border-amber-300/25 dark:bg-[linear-gradient(135deg,rgba(24,24,27,0.96),rgba(39,32,16,0.9))] dark:shadow-black/25"
            aria-label="Live classroom stream"
        >
            <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-300">
                            <span className="size-2 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.16)]" />
                            Live now
                        </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-300/50 bg-amber-100 text-sm font-bold text-amber-900 shadow-sm dark:bg-amber-300/15 dark:text-amber-100">
                            {liveStream.coach_avatar ? (
                                <img
                                    src={liveStream.coach_avatar}
                                    alt={`${coachName} avatar`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initials(coachName)
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold tracking-tight text-neutral-950 dark:text-white md:text-lg">
                                {title}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {coachName}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {classLabel && (
                                    <span className="rounded-full border border-amber-300/35 bg-amber-300/12 px-2.5 py-1 text-xs font-semibold text-[#806200] dark:text-amber-200">
                                        {classLabel}
                                    </span>
                                )}
                                <span className="rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                                    Your class is currently live
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-amber-300/25 pt-4 sm:flex-row sm:items-center sm:justify-between lg:border-t-0 lg:pt-0">
                    <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-300 lg:justify-end">
                        <span className="inline-flex items-center gap-2">
                            <Clock className="size-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                            {formatLiveDuration(startedAt, now)}
                        </span>
                        {hasStudentsOnline && (
                            <span className="inline-flex items-center gap-2">
                                <Users className="size-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
                                {studentsOnline.toLocaleString()} students online
                            </span>
                        )}
                    </div>

                    <Button
                        asChild
                        className="w-full bg-[#FFD026] text-[#102033] shadow-lg shadow-amber-950/10 hover:bg-[#FFC400] sm:w-auto"
                    >
                        <Link href={liveStream.href}>
                            <Radio className="size-4" aria-hidden="true" />
                            Join Live Stream
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
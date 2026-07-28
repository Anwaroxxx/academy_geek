export const courseBadgeStyles = {
    'HTML Course': 'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-200',
    'CSS Course': 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200',
    'JavaScript Course': 'border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-400/30 dark:bg-yellow-400/15 dark:text-yellow-200',
    'Bootstrap Course': 'border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/15 dark:text-purple-200',
    'Sass Course': 'border-pink-200 bg-pink-100 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-200',
    'Git Course': 'border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200',
    'GitHub Course': 'border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-neutral-500/40 dark:bg-neutral-700/40 dark:text-neutral-100',
    'Tailwind Course': 'border-cyan-200 bg-cyan-100 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/15 dark:text-cyan-200',
    'Laravel Course': 'border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200',
    'General Course': 'border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-600/40 dark:bg-neutral-800/60 dark:text-neutral-200',
};

export const courseVisuals = {
    'HTML Course': {
        thumbnail:
            'from-orange-500/35 via-orange-300/20 to-neutral-950 dark:from-orange-500/40 dark:via-orange-500/15 dark:to-neutral-950',
    },
    'CSS Course': {
        thumbnail:
            'from-blue-500/35 via-sky-300/20 to-neutral-950 dark:from-blue-500/40 dark:via-blue-500/15 dark:to-neutral-950',
    },
    'JavaScript Course': {
        thumbnail:
            'from-yellow-400/40 via-amber-300/20 to-neutral-950 dark:from-yellow-400/40 dark:via-yellow-400/15 dark:to-neutral-950',
    },
    'Bootstrap Course': {
        thumbnail:
            'from-purple-500/40 via-violet-300/20 to-neutral-950 dark:from-purple-500/40 dark:via-purple-500/15 dark:to-neutral-950',
    },
    'Sass Course': {
        thumbnail:
            'from-pink-500/35 via-rose-300/20 to-neutral-950 dark:from-pink-500/40 dark:via-pink-500/15 dark:to-neutral-950',
    },
    'Git Course': {
        thumbnail:
            'from-red-500/35 via-orange-300/20 to-neutral-950 dark:from-red-500/40 dark:via-orange-500/15 dark:to-neutral-950',
    },
    'GitHub Course': {
        thumbnail:
            'from-neutral-500/35 via-neutral-400/15 to-neutral-950 dark:from-neutral-400/25 dark:via-neutral-700/35 dark:to-neutral-950',
    },
    'Tailwind Course': {
        thumbnail:
            'from-cyan-400/35 via-sky-300/20 to-neutral-950 dark:from-cyan-400/40 dark:via-cyan-400/15 dark:to-neutral-950',
    },
    'Laravel Course': {
        thumbnail:
            'from-red-500/35 via-rose-300/20 to-neutral-950 dark:from-red-500/40 dark:via-red-500/15 dark:to-neutral-950',
    },
    'General Course': {
        thumbnail:
            'from-neutral-400/25 via-amber-200/15 to-neutral-950 dark:from-neutral-500/20 dark:via-neutral-700/20 dark:to-neutral-950',
    },
};
export function formatDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
    }).format(date);
}

export function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return null;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    if (remainingSeconds > 0) {
        parts.push(`${remainingSeconds}s`);
    }

    return parts.join(' ');
}

export function watchedSeconds(recording) {
    const seconds = Number(recording?.watched_seconds);

    if (!Number.isFinite(seconds) || seconds <= 0) {
        return 0;
    }

    return seconds;
}

export function watchedProgress(recording) {
    const duration = Number(recording?.duration_seconds);

    if (!Number.isFinite(duration) || duration <= 0) {
        return 0;
    }

    return Math.min(100, Math.round((watchedSeconds(recording) / duration) * 100));
}

export function formatWatchedDuration(seconds) {
    const watched = Number(seconds);

    if (!Number.isFinite(watched) || watched <= 0) {
        return '0m watched';
    }

    const hours = Math.floor(watched / 3600);
    const minutes = Math.floor((watched % 3600) / 60);
    const remainingSeconds = Math.floor(watched % 60);
    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    if (remainingSeconds > 0 && hours === 0) {
        parts.push(`${remainingSeconds}s`);
    }

    return `${parts.length > 0 ? parts.join(' ') : '0m'} watched`;
}

export function recordingTitle(recording) {
    const title = recording?.title?.trim();

    return title || 'Untitled recording';
}

export function recordingCourse(recording) {
    const course = recording?.metadata?.course;

    return typeof course === 'string' && course.trim()
        ? course.trim()
        : 'General Course';
}

export function courseVisual(course) {
    return courseVisuals[course] ?? courseVisuals['General Course'];
}

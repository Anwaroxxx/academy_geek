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

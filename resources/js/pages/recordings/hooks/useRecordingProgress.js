import { useCallback, useEffect, useRef } from 'react';

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

const xsrfToken = () => {
    const cookie = document.cookie
        .split('; ')
        .find((item) => item.startsWith('XSRF-TOKEN='));

    return cookie
        ? decodeURIComponent(cookie.substring('XSRF-TOKEN='.length))
        : null;
};

function initialWatchedSeconds(recording) {
    const seconds = Number(recording?.watched_seconds);

    return Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
}

function currentVideoSeconds(video) {
    const currentTime = Number(video?.currentTime);

    return Number.isFinite(currentTime) && currentTime > 0
        ? Math.floor(currentTime)
        : 0;
}

function videoEndSeconds(video) {
    const duration = Number(video?.duration);

    if (Number.isFinite(duration) && duration > 0) {
        return Math.floor(duration);
    }

    return currentVideoSeconds(video);
}

export function useRecordingProgress({
    onProgressSaved,
    recording,
    videoRef,
}) {
    const intervalRef = useRef(null);
    const lastSavedSecondsRef = useRef(initialWatchedSeconds(recording));
    const resumeAppliedRef = useRef(null);

    useEffect(() => {
        lastSavedSecondsRef.current = initialWatchedSeconds(recording);
    }, [recording]);

    useEffect(() => {
        resumeAppliedRef.current = null;
    }, [recording?.id]);

    const clearSaveInterval = useCallback(() => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const saveProgress = useCallback(async (watchedSecondsOverride) => {
        const video = videoRef.current;

        if (!recording?.id || !recording?.stream_url || !video) {
            return false;
        }

        const hasOverride = watchedSecondsOverride !== undefined;
        const overrideSeconds = Number(watchedSecondsOverride);
        const watchedSeconds = hasOverride && Number.isFinite(overrideSeconds)
            ? Math.floor(overrideSeconds)
            : currentVideoSeconds(video);

        if (
            !Number.isFinite(watchedSeconds) ||
            watchedSeconds <= 0 ||
            watchedSeconds === lastSavedSecondsRef.current
        ) {
            return false;
        }

        try {
            const response = await fetch(
                `/recordings/${recording.id}/progress`,
                {
                    method: 'PATCH',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken() ?? '',
                        'X-XSRF-TOKEN': xsrfToken() ?? '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        watched_seconds: watchedSeconds,
                    }),
                },
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return false;
            }

            const savedSeconds = Number(data.watched_seconds);
            const nextWatchedSeconds =
                Number.isFinite(savedSeconds) && savedSeconds >= 0
                    ? Math.floor(savedSeconds)
                    : watchedSeconds;

            lastSavedSecondsRef.current = Math.max(
                lastSavedSecondsRef.current,
                nextWatchedSeconds,
            );
            onProgressSaved?.({
                completed_at: data.completed_at ?? null,
                id: recording.id,
                watched_seconds: lastSavedSecondsRef.current,
            });

            return true;
        } catch {
            return false;
        }
    }, [onProgressSaved, recording, videoRef]);

    useEffect(() => {
        const video = videoRef.current;

        if (!recording?.id || !recording?.stream_url || !video) {
            return undefined;
        }

        const handleLoadedMetadata = () => {
            if (resumeAppliedRef.current === recording.id) {
                return;
            }

            const watchedSeconds = initialWatchedSeconds(recording);

            if (watchedSeconds <= 0) {
                resumeAppliedRef.current = recording.id;

                return;
            }

            const duration = Number(video.duration);
            const resumeAt =
                Number.isFinite(duration) && duration > 0
                    ? Math.min(watchedSeconds, Math.max(duration - 1, 0))
                    : watchedSeconds;

            video.currentTime = resumeAt;
            resumeAppliedRef.current = recording.id;
        };

        const startSaveInterval = () => {
            clearSaveInterval();
            intervalRef.current = window.setInterval(saveProgress, 15000);
        };

        const stopAndSave = () => {
            clearSaveInterval();
            saveProgress();
        };

        const saveEndedProgress = () => {
            const endedSeconds = videoEndSeconds(video);

            clearSaveInterval();

            if (endedSeconds > 0) {
                saveProgress(endedSeconds);
            }
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', startSaveInterval);
        video.addEventListener('pause', stopAndSave);
        video.addEventListener('ended', saveEndedProgress);

        if (video.readyState >= 1) {
            handleLoadedMetadata();
        }

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', startSaveInterval);
            video.removeEventListener('pause', stopAndSave);
            video.removeEventListener('ended', saveEndedProgress);
            clearSaveInterval();

            if (currentVideoSeconds(video) > 0) {
                saveProgress();
            }
        };
    }, [clearSaveInterval, recording, saveProgress, videoRef]);
}
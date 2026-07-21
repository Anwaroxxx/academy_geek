import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import ParticipantAvatar from './ParticipantAvatar';

function formatElapsed(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function useConnectedTimer(startedAt, isJoined) {
    const [elapsed, setElapsed] = useState(0);
    const [localStartedAt, setLocalStartedAt] = useState(null);

    useEffect(() => {
        if (!isJoined || startedAt) {
            setLocalStartedAt(null);
            return;
        }

        setLocalStartedAt((value) => value ?? new Date().toISOString());
    }, [isJoined, startedAt]);

    useEffect(() => {
        const effectiveStartedAt = startedAt ?? localStartedAt;

        if (!isJoined || !effectiveStartedAt) {
            setElapsed(0);
            return undefined;
        }

        const start = new Date(effectiveStartedAt).getTime();

        if (Number.isNaN(start)) {
            setElapsed(0);
            return undefined;
        }

        const tick = () => {
            setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
        };

        tick();
        const intervalId = window.setInterval(tick, 1000);

        return () => window.clearInterval(intervalId);
    }, [isJoined, localStartedAt, startedAt]);

    return formatElapsed(elapsed);
}

export default function ClassroomHeader({
    session,
    currentUser,
    currentParticipant,
    isJoined = false,
}) {
    const timerStartedAt = isJoined ? currentParticipant?.joined_at : null;
    const timer = useConnectedTimer(timerStartedAt, isJoined);

    return (
        <header className="border-b bg-card px-4 py-3 md:px-6">
            <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">

                {/* Title & Description */}
                <div className="min-w-0">
                    <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">
                        {session?.title ?? 'Classroom session'}
                    </h1>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {session?.description ?? 'Live classroom'}
                    </p>
                </div>

                {/* Connected timer / Status */}
                <div className="flex items-center justify-start lg:justify-center">
                    {isJoined ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium shadow-xs">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
                                Connected
                            </span>
                            <span className="font-mono text-xs text-emerald-800/80 dark:text-emerald-200/80">
                                {timer}
                            </span>
                        </div>
                    ) : (
                        <span
                            className={cn(
                                'inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize',
                                session?.status === 'ended'
                                    ? 'border-muted-foreground/20 text-muted-foreground'
                                    : session?.status === 'live'
                                      ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'border-muted-foreground/25 text-muted-foreground',
                            )}
                        >
                            {session?.status ?? 'scheduled'}
                        </span>
                    )}
                </div>

                {/* Current user identity */}
                <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">

                    {/* Current user identity pill */}
                    <div className="flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 py-1 pl-1 pr-3 dark:border-amber-400/20 dark:bg-amber-400/10">


                            <ParticipantAvatar
                                user={currentUser}
                                isHost={false}
                                size="small"
                                className="ring-1 ring-amber-400/30"
                                fallbackClassName="bg-amber-100 text-amber-950"
                            />

                        <span className="max-w-[110px] truncate text-sm font-medium text-amber-800 dark:text-amber-200">
                            {currentUser?.name ?? 'Guest'}
                        </span>
                    </div>

                </div>
            </div>
        </header>
    );
}

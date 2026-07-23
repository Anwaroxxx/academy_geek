import { useMemo, useState } from 'react';
import {ChevronDown,Crown,Mic,MicOff,MonitorUp,Search,UserRound,UserX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ParticipantAvatar from './ParticipantAvatar';




export default function ParticipantsPanel({
    participants = [],
    currentUser,
    permissions,
    isModerating,
    onModerateParticipant,
    selectedParticipant,
    onSelectParticipant,
    className,
}) {
    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(false);
    const canModerate = permissions?.can_moderate_participants ?? false;

    const filteredParticipants = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return participants;
        }

        return participants.filter((participant) =>
            participant.user?.name?.toLowerCase().includes(query),
        );
    }, [participants, search]);

    const onlineParticipants = filteredParticipants.filter(
        (participant) => participant.is_online,
    );
    const offlineParticipants = filteredParticipants.filter(
        (participant) => !participant.is_online,
    );
    const groupedParticipants = [
        ...onlineParticipants,
        ...offlineParticipants,
    ];
    const visibleParticipants = showAll
        ? groupedParticipants
        : groupedParticipants.slice(0, 8);
    const visibleOnlineParticipants = visibleParticipants.filter(
        (participant) => participant.is_online,
    );
    const visibleOfflineParticipants = visibleParticipants.filter(
        (participant) => !participant.is_online,
    );

    const participantGroups = [
        {
            label: 'Online',
            count: onlineParticipants.length,
            participants: visibleOnlineParticipants,
        },
        {
            label: 'Offline',
            count: offlineParticipants.length,
            participants: visibleOfflineParticipants,
        },
    ].filter((group) => group.participants.length > 0);

    const renderParticipantRow = (participant) => {
        const user = participant.user;
        const isHost = participant.role === 'host';
        const isCurrentUser = user?.id === currentUser?.id;
        // chat filter
        const isSelected = selectedParticipant?.id === participant.id;
        const canModerateParticipant =
            canModerate && !isCurrentUser && !isHost;
        const onlineStatus = participant.is_online
            ? 'Online'
            : 'Offline';

        return (
            <div
                key={participant.id}
                // chat filter
                onClick={() => onSelectParticipant?.(participant)}

                className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border bg-background px-3 py-2.5 transition',
                        isSelected &&
                            'border-amber-400 bg-amber-50 dark:bg-amber-500/10',
                        !isSelected &&
                            'hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10',
                    )}
            >
                <ParticipantAvatar
                    user={user}
                    isHost={isHost}
                    size="medium"
                    className="shrink-0"
                />

                <div className="min-w-0 flex-1">

                        {/* long names    */}
                    <div className="flex min-w-0 items-center gap-2">
                    <p
                        className="max-w-[120px] truncate text-sm font-medium"
                        title={user?.name ?? 'Unknown participant'}
                    >
                        {user?.name ?? 'Unknown participant'}
                    </p>
                        {isCurrentUser && (
                            <span className="text-xs text-muted-foreground">
                                (You)
                            </span>
                        )}
                    </div>
                    <p className="text-xs capitalize text-muted-foreground">
                        {onlineStatus}
                    </p>
                </div>
                                {/* badge of the host  */}
                <div className="flex items-center gap-2">
                    {isHost && (
                            <Badge
                                className="
                                    border border-amber-300
                                        bg-amber-50
                                        text-amber-700
                                        px-2.5 py-1
                                        dark:border-amber-500/30
                                        dark:bg-amber-500/15
                                        dark:text-amber-300
                                "
                            >
                                <Crown className="mr-1 size-3" />
                                Host
                            </Badge>
                    )}

                    {participant.is_muted ? (
                        <MicOff
                            className="size-4 text-muted-foreground"
                            aria-label="Muted"
                        />
                    ) : (
                        <Mic
                            className="size-4 text-emerald-500"
                            aria-label="Unmuted"
                        />
                    )}

                    <span
                        className={cn(
                            'size-2 rounded-full',
                            participant.is_online
                                ? 'bg-emerald-500'
                                : 'bg-muted-foreground/40',
                        )}
                        aria-label={onlineStatus}
                    />

                    {canModerateParticipant && (
                        <div className="ml-1 flex items-center gap-1">
                            {!participant.is_muted && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={isModerating}
                                    title="Mute participant"
                                    aria-label="Mute participant"
                                    onClick={() =>
                                        onModerateParticipant?.(
                                            participant,
                                            'mute',
                                        )
                                    }
                                >
                                    <MicOff className="size-4" />
                                </Button>
                            )}

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isModerating}
                                title={
                                    participant.can_share_screen
                                        ? 'Revoke screen sharing'
                                        : 'Allow screen sharing'
                                }
                                aria-label={
                                    participant.can_share_screen
                                        ? 'Revoke screen sharing'
                                        : 'Allow screen sharing'
                                }
                                onClick={() =>
                                    onModerateParticipant?.(
                                        participant,
                                        'screenShare',
                                    )
                                }
                            >
                                <MonitorUp
                                    className={cn(
                                        'size-4',
                                        participant.can_share_screen &&
                                            'text-amber-600',
                                    )}
                                />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isModerating}
                                title="Remove participant"
                                aria-label="Remove participant"
                                onClick={() =>
                                    onModerateParticipant?.(
                                        participant,
                                        'remove',
                                    )
                                }
                            >
                                <UserX className="size-4 text-destructive" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ROOT FIX: previously this was
    //   'flex min-h-[420px] bg-card flex-1 flex-col overflow-hidden
    //    rounded-2xl border shadow-sm xl:min-h-0 xl:h-full'
    // and Show.jsx passed in `className="flex h-full min-h-0 flex-1"`.
    // Both class strings targeted `min-height`/`height` on the SAME
    // element. If `cn()` here is a plain clsx-style concatenation
    // (no tailwind-merge dedup), both classes survive in the markup
    // and the browser picks whichever rule Tailwind happens to emit
    // later in the generated stylesheet — which has nothing to do
    // with the order the classes appear in JSX. That's what let
    // `min-h-[420px]` silently win over the incoming `h-full`, so the
    // card stopped short of the 620px column height on desktop.
    //
    // Show.jsx already guarantees a definite-height wrapper in every
    // context this component is used in:
    //   - mobile:  <div className="min-h-[420px] flex-1"> ... </div>
    //   - desktop: <aside className="h-[620px]"> ... </aside>
    // so this component doesn't need its own min-height opinion or
    // `xl:` breakpoint duplication at all. It just needs to always
    // fill whatever height its parent gives it.
    return (
        <section
            className={cn(
                'flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm',
                className,
            )}
        >
            <div className="flex-none border-b px-4 py-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold">
                        Participants ({participants.length})
                    </h2>
                </div>

                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search participant"
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 space-y-2 overflow-y-auto p-4">
                {filteredParticipants.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        {search
                            ? 'No participants match your search.'
                            : 'No participants have joined yet.'}
                    </p>
                )}

                {participantGroups.map((group) => (
                    <div key={group.label} className="space-y-2">
                        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {group.label} &mdash; {group.count}
                        </p>
                        {group.participants.map(renderParticipantRow)}
                    </div>
                ))}
            </div>

            {filteredParticipants.length > 8 && (
                <div className="flex-none border-t px-4 py-3">
                    <button
                        type="button"
                        onClick={() => setShowAll((value) => !value)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
                    >
                        {showAll ? 'Show less' : 'View all'}
                        <ChevronDown
                            className={cn(
                                'size-4 transition-transform',
                                showAll && 'rotate-180',
                            )}
                        />
                    </button>
                </div>
            )}
        </section>
    );
}

import { MessageCircle, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatPanel from './ChatPanel';
import ParticipantsPanel from './ParticipantsPanel';

export default function FocusModeOverlay({
    activeFocusOverlay,
    setActiveFocusOverlay,
    areFocusControlsVisible,
    revealFocusControls,
    messages,
    currentUser,
    permissions,
    isSending,
    onSendMessage,
    participants,
    chatFilterParticipant,
    setChatFilterParticipant,
    onEditMessage,
    onDeleteMessage,
    isModerating,
    onModerateParticipant,
}) {
    return (
        <>
            <div
                className={cn(
                    'absolute top-4 right-4 z-20 flex flex-wrap justify-end gap-2 transition-all duration-300 ease-out',
                    areFocusControlsVisible || activeFocusOverlay
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-2 opacity-0',
                )}
                onMouseEnter={() =>
                    revealFocusControls({
                        keepVisible: true,
                    })
                }
                onMouseLeave={() => revealFocusControls()}
                onFocusCapture={() =>
                    revealFocusControls({
                        keepVisible: true,
                    })
                }
                onBlurCapture={() => revealFocusControls()}
            >
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                        setActiveFocusOverlay((value) =>
                            value === 'chat' ? null : 'chat',
                        )
                    }
                    className={cn(
                        'border border-white/15 bg-neutral-900/85 text-white shadow-xl backdrop-blur hover:bg-neutral-800 hover:text-white',
                        activeFocusOverlay === 'chat' &&
                            'border-amber-300 bg-amber-400 text-amber-950 hover:bg-amber-400 hover:text-amber-950',
                    )}
                >
                    <MessageCircle className="size-4" />
                    Chat
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                        setActiveFocusOverlay((value) =>
                            value === 'participants' ? null : 'participants',
                        )
                    }
                    className={cn(
                        'border border-white/15 bg-neutral-900/85 text-white shadow-xl backdrop-blur hover:bg-neutral-800 hover:text-white',
                        activeFocusOverlay === 'participants' &&
                            'border-amber-300 bg-amber-400 text-amber-950 hover:bg-amber-400 hover:text-amber-950',
                    )}
                >
                    <Users className="size-4" />
                    Participants
                </Button>
            </div>

            {activeFocusOverlay && (
                <div className="absolute top-16 right-4 bottom-24 z-30 flex w-[min(360px,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                            {activeFocusOverlay === 'chat' ? (
                                <MessageCircle className="size-4 text-amber-600" />
                            ) : (
                                <Users className="size-4 text-amber-600" />
                            )}
                            <span className="text-sm font-semibold">
                                {activeFocusOverlay === 'chat'
                                    ? 'Chat'
                                    : 'Participants'}
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setActiveFocusOverlay(null)}
                            aria-label="Close focus overlay"
                            className="size-8"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    {activeFocusOverlay === 'chat' ? (
                        <ChatPanel
                            messages={messages}
                            currentUser={currentUser}
                            permissions={permissions}
                            isSending={isSending}
                            onSendMessage={onSendMessage}
                            participants={participants}
                            selectedParticipant={chatFilterParticipant}
                            onSelectParticipant={setChatFilterParticipant}
                            onClearParticipantFilter={() =>
                                setChatFilterParticipant(null)
                            }
                            onEdit={onEditMessage}
                            onDelete={onDeleteMessage}
                            className="h-full min-h-0 rounded-none border-0 shadow-none"
                        />
                    ) : (
                        <ParticipantsPanel
                            participants={participants}
                            currentUser={currentUser}
                            permissions={permissions}
                            isModerating={isModerating}
                            onModerateParticipant={onModerateParticipant}
                            className="h-full !min-h-0 rounded-none border-0 shadow-none"
                        />
                    )}
                </div>
            )}
        </>
    );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ParticipantAvatar from './ParticipantAvatar';
import MessageBubble from './MessageBubble';

const tabs = [
    { id: 'everyone', label: 'Everyone' },

];


export default function ChatPanel({
    messages = [],
    currentUser,
    permissions,
    isSending,
    onSendMessage,
    className,
    participants = [],
    selectedParticipant,
    onSelectParticipant,
    onClearParticipantFilter,
    onEdit,
    onDelete,
}) {
    const [activeTab, setActiveTab] = useState('everyone');
    const [draft, setDraft] = useState('');
    const [error, setError] = useState(null);
    const [isParticipantMenuOpen, setIsParticipantMenuOpen] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingDraft, setEditingDraft] = useState('');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const menuButtonRef = useRef(null);
    const menuRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const wasAtBottomRef = useRef(true);
    const canSendMessage = permissions?.can_send_message ?? false;

    useEffect(() => {
        if (!isParticipantMenuOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            const clickedInsideButton = menuButtonRef.current?.contains(
                event.target,
            );
            const clickedInsideMenu = menuRef.current?.contains(event.target);

            if (!clickedInsideButton && !clickedInsideMenu) {
                setIsParticipantMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, [isParticipantMenuOpen]);

    const visibleMessages = useMemo(() => {
        const everyoneMessages = messages.filter(
            (item) =>
                item.receiver_type === 'everyone' || !item.receiver_type,
        );

        if (!selectedParticipant) {
            return everyoneMessages;
        }

        return everyoneMessages.filter(
            (item) => item.sender?.id === selectedParticipant.user?.id,
        );
    }, [messages, selectedParticipant]);

    const isNearBottom = (element) => {
        if (!element) {
            return true;
        }

        const threshold = 1;
        const distanceFromBottom =
            element.scrollHeight - (element.scrollTop + element.clientHeight);

        return distanceFromBottom <= threshold;
    };

    const updateScrollButtonState = (element = messagesContainerRef.current) => {
        if (!element) {
            setShowScrollButton(false);
            return;
        }

        const nearBottom = isNearBottom(element);
        wasAtBottomRef.current = nearBottom;
        setShowScrollButton(!nearBottom && visibleMessages.length > 0);
    };

    const scrollToBottom = () => {
        const element = messagesContainerRef.current;

        if (!element) {
            return;
        }

        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
        wasAtBottomRef.current = true;
        setShowScrollButton(false);
    };

    useEffect(() => {
        const element = messagesContainerRef.current;

        if (!element) {
            return undefined;
        }

        const handleScroll = () => {
            updateScrollButtonState(element);
        };

        handleScroll();
        element.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            element.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [visibleMessages.length]);

    useEffect(() => {
        const element = messagesContainerRef.current;

        if (!element) {
            return;
        }

        if (visibleMessages.length === 0) {
            wasAtBottomRef.current = true;
            setShowScrollButton(false);
            return;
        }

        if (wasAtBottomRef.current) {
            requestAnimationFrame(() => {
                element.scrollTo({
                    top: element.scrollHeight,
                    behavior: 'smooth',
                });
            });
        }

        updateScrollButtonState(element);
    }, [visibleMessages]);

    const handleSelectParticipant = (participant) => {
        onSelectParticipant?.(participant);
        setIsParticipantMenuOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmed = draft.trim();

        if (!trimmed || !canSendMessage || isSending) {
            return;
        } 

        setError(null);
        const message = await onSendMessage?.({
            message: trimmed,
            receiverType: activeTab,
        });

        if (!message) {
            setError('Message could not be sent.');
            return;
        }

        setDraft('');
    };

    const handleCopyMessage = async (message) => {
        const text = typeof message?.message === 'string' ? message.message : '';

        if (!text) {
            return;
        }

        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                toast.success('Message copied');
            } catch {
                toast.error('Unable to copy message');
            }

            return;
        }

        toast.error('Clipboard is not available');
    };

    const isHostOrTeacher = Boolean(
        permissions?.can_moderate_participants ||
            permissions?.can_manage_recordings ||
            currentUser?.role === 'host' ||
            currentUser?.role === 'teacher',
    );

    const getMessagePermissions = (message) => {
        const isOwner = message.sender?.id === currentUser?.id;

        return {
            canCopy: true,
            canEdit: Boolean(isOwner),
            canDelete: Boolean(isOwner || isHostOrTeacher),
        };
    };
    const handleEditMessage = (message) => {
        const permissionsForMessage = getMessagePermissions(message);

        if (!permissionsForMessage.canEdit) {
            return;
        }

        setEditingMessageId(message.id);
        setEditingDraft(message.message ?? '');
    };

    const handleSubmitEdit = (message) => {
        const permissionsForMessage = getMessagePermissions(message);
        const trimmed = editingDraft.trim();

        if (!permissionsForMessage.canEdit || !trimmed) {
            return;
        }

        onEdit?.(message, trimmed);
        setEditingMessageId(null);
        setEditingDraft('');
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditingDraft('');
    };

    const handleDeleteMessage = (message) => {
        const permissionsForMessage = getMessagePermissions(message);

        if (!permissionsForMessage.canDelete) {
            return;
        }

        onDelete?.(message);
    };

    return (
        <section
            className={cn(
                'flex min-h-80 min-h-0 w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm',
                className,
            )}
        >
            <div className="border-b px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                                    activeTab === tab.id
                                        ? 'bg-amber-400 text-amber-950'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative" ref={menuRef}>
                        <button
                            ref={menuButtonRef}
                            type="button"
                            onClick={() =>
                                setIsParticipantMenuOpen((value) => !value)
                            }
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
                            aria-label="Filter messages by participant"
                        >
                            <MoreHorizontal className="size-4" />
                        </button>

                        {isParticipantMenuOpen && (
                            <div className="absolute top-full right-0 z-20 mt-2 w-64 rounded-xl border bg-background p-2 shadow-lg">
                                <div className="max-h-48 overflow-y-auto">
                                    {participants.length === 0 ? (
                                        <p className="px-2 py-3 text-sm text-muted-foreground">
                                            No participants yet.
                                        </p>
                                    ) : (
                                        participants.map((participant) => {
                                            const user = participant.user;
                                            const isSelected =
                                                selectedParticipant?.id ===
                                                participant.id;

                                            return (
                                                <button
                                                    key={participant.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectParticipant(
                                                            participant,
                                                        )
                                                    }
                                                    className={cn(
                                                        'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-muted',
                                                        isSelected &&
                                                            'bg-amber-50 dark:bg-amber-500/10',
                                                    )}
                                                >
                                                    <ParticipantAvatar
                                                        user={user}
                                                        isHost={participant.role === 'host'}
                                                        size="small"
                                                        className="shrink-0"
                                                        fallbackClassName="text-xs"
                                                    />
                                                    <span className="truncate font-medium">
                                                        {user?.name ??
                                                            'Unknown participant'}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {selectedParticipant && (
                    <div className="mt-3 flex items-center justify-between rounded-lg border bg-muted px-3 py-2 text-sm">
                        <span className="truncate">
                            Messages from {selectedParticipant.user?.name}
                        </span>

                        <button 
                            type="button"
                            onClick={onClearParticipantFilter}
                            className="font-medium text-amber-700 hover:text-amber-800"
                        >
                        <Trash2 className="size-4 text-destructive" />
                        </button>
                    </div>
                )}
            </div>

                <div
                    ref={messagesContainerRef}
                    className="relative min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4"
                >
                    {error && (
                        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    {visibleMessages.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No messages in this channel yet.
                        </p>
                    )}
                    {visibleMessages.map((item) => {
                        const permissionsForMessage = getMessagePermissions(item);

                        return (
                            <MessageBubble
                                key={item.id}
                                message={item}
                                currentUser={currentUser}
                                onCopy={() => {
                                    if (!permissionsForMessage.canCopy) {
                                        return;
                                    }

                                    handleCopyMessage(item);
                                }}
                                onEdit={() => handleEditMessage(item)}
                                onDelete={() => handleDeleteMessage(item)}
                                isEditing={editingMessageId === item.id}
                                editingValue={editingDraft}
                                onEditingChange={setEditingDraft}
                                onSubmitEdit={handleSubmitEdit}
                                onCancelEdit={handleCancelEdit}
                                canCopy={permissionsForMessage.canCopy}
                                canEdit={permissionsForMessage.canEdit}
                                canDelete={permissionsForMessage.canDelete}
                            />
                        );
                    })}

                    {showScrollButton && (
                        <button
                            type="button"
                            onClick={scrollToBottom}
                            className="absolute bottom-5 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-border/60 bg-background/95 text-foreground shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-background dark:border-white/10 dark:bg-background/80"
                            aria-label="Scroll to latest message"
                        >
                            <ArrowDown className="size-4" />
                        </button>
                    )}
                </div>

            <form
                onSubmit={handleSubmit}
                className="flex items-center  gap-2 border-t p-3"
            >
                <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Type a message..."
                    disabled={!canSendMessage || isSending}
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim() || !canSendMessage || isSending}
                    className="shrink-0 bg-amber-400 text-amber-950 hover:bg-amber-500"
                >
                    <ArrowRight className="size-4" />
                    <span className="sr-only">Send message</span>
                </Button>
            </form>
        </section>
    );
}

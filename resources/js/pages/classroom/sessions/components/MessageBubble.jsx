import { useState } from 'react';
import { cn } from '@/lib/utils';
import ParticipantAvatar from './ParticipantAvatar';
import EditableMessageContent from './EditableMessageContent';
import MessageActions from './MessageActions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';

function formatMessageTime(value) {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function MessageBubble({
    message,
    currentUser,
    onCopy,
    onEdit,
    onDelete,
    isEditing,
    editingValue,
    onEditingChange,
    onSubmitEdit,
    onCancelEdit,
    canCopy,
    canEdit,
    canDelete,
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const mine = message.sender?.id === currentUser?.id;
    const isEdited = Boolean(message?.is_edited || message?.edited_at);

    return (
        <div
            className={cn('flex', mine ? 'justify-end' : 'justify-start')}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={cn(
                    'flex max-w-[80%] gap-2',
                    mine ? 'flex-row-reverse' : 'flex-row',
                )}
            >
                {!mine && (
                    <ParticipantAvatar
                        user={message.sender}
                        isHost={Boolean(
                            message.sender?.role === 'host' ||
                                message.sender?.is_host,
                        )}
                        size="small"
                        className="shrink-0"
                        fallbackClassName="text-xs"
                    />
                )}

                <div className={cn('min-w-0', mine ? 'text-right' : 'text-left')}>
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {message.sender?.name ?? 'Unknown'}
                        </span>
                        <span>{formatMessageTime(message.created_at)}</span>
                    </div>

                    <div className="relative flex flex-col items-start gap-2">
                        <EditableMessageContent
                            message={message}
                            isEditing={isEditing}
                            editingValue={editingValue}
                            onEditingChange={onEditingChange}
                            onSubmitEdit={onSubmitEdit}
                            onCancelEdit={onCancelEdit}
                            mine={mine}
                        />

                        {isEdited && !isEditing && (
                            <span className="text-[11px] text-muted-foreground">
                                (edited)
                            </span>
                        )}

                        {!isEditing && (
                            <>
                                <div
                                    className={cn(
                                        'transition-all duration-200',
                                        isHovered
                                            ? 'translate-y-0 opacity-100'
                                            : 'pointer-events-none translate-y-1 opacity-0',
                                    )}
                                >
                                    <MessageActions
                                        onCopy={canCopy ? onCopy : undefined}
                                        onEdit={canEdit ? onEdit : undefined}
                                        onDelete={canDelete ? () => setIsDeleteDialogOpen(true) : undefined}
                                    />
                                </div>

                                <Dialog
                                    open={isDeleteDialogOpen}
                                    onOpenChange={setIsDeleteDialogOpen}
                                >
                                    <DialogContent>
                                        <DialogTitle>Delete this message?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. Press
                                            Delete to remove the message or
                                            Cancel to keep it.
                                        </DialogDescription>

                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <Button variant="secondary">
                                                    Cancel
                                                </Button>
                                            </DialogClose>

                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setIsDeleteDialogOpen(false);
                                                    onDelete?.();
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

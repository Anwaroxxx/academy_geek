import { cn } from '@/lib/utils';

export default function EditableMessageContent({
    message,
    isEditing,
    editingValue,
    onEditingChange,
    onSubmitEdit,
    onCancelEdit,
    mine,
}) {
    if (!isEditing) {
        return (
            <p
                className={cn(
                    'inline-block max-w-full overflow-hidden rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap [overflow-wrap:anywhere]',
                    mine
                        ? 'bg-amber-100 text-amber-950'
                        : 'bg-muted',
                )}
            >
                {message.message}
            </p>
        );
    }

    return (
        <div className="w-full min-w-48 space-y-2">
            <textarea
                value={editingValue}
                onChange={(event) => onEditingChange?.(event.target.value)}
                onKeyDown={(event) => {
                    // Cancel edit with Escape
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        onCancelEdit?.();
                    } 

                    // Save edit with Enter
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        onSubmitEdit?.(message);
                    }
                }}
                rows={3}
                className="w-full resize-none rounded-2xl border border-amber-200 bg-background/95 px-3 py-2 text-sm shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                placeholder="Edit message"
            />

            <p className="text-xs text-muted-foreground">
                Esc to cancel • Enter to save
            </p>
        </div>
    );
}
   
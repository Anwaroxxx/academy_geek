import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MessageActions({
    onCopy,
    onEdit,
    onDelete,
    className,
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-1 rounded-full border border-border/60 bg-background/95 p-1 shadow-sm backdrop-blur-sm transition-all duration-200',
                className,
            )}
        >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onCopy}
                aria-label="Copy message"
                title="Copy message"
            >
                <Copy className="size-3.5" />
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onEdit}
                aria-label="Edit message"
                title="Edit message"
            >
                <Pencil className="size-3.5" />
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={onDelete}
                aria-label="Delete message"
                title="Delete message"
            >
                <Trash2 className="size-3.5" />
            </Button>
        </div>
    );
}

import { FolderOpen, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mobileUtilityPanels = [
    {
        id: 'chat',
        label: 'Chat',
        icon: MessageCircle,
    },
    {
        id: 'resources',
        label: 'Resources',
        icon: FolderOpen,
    },
    {
        id: 'participants',
        label: 'Participants',
        icon: Users,
    },
];

export default function ClassroomTabBar({
    activePanel,
    onTogglePanel,
    variant,
}) {
    const isFixed = variant === 'fixed';

    return (
        <div
            className={
                isFixed
                    ? 'fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t bg-background/95 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur'
                    : 'grid flex-none grid-cols-3 gap-2'
            }
            role="group"
            aria-label="Classroom utility panels"
        >
            {mobileUtilityPanels.map(({ id, label, icon: Icon }) => {
                const isActive = activePanel === id;

                return (
                    <Button
                        key={id}
                        type="button"
                        variant="secondary"
                        onClick={() => onTogglePanel(id)}
                        aria-pressed={isActive}
                        className={cn(
                            'flex h-14 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl border bg-card px-1 py-1.5 text-center text-[10px] leading-none text-card-foreground shadow-sm',
                            isActive &&
                                'border-amber-300 bg-amber-400 text-amber-950 hover:bg-amber-400 hover:text-amber-950',
                        )}
                    >
                        <Icon className="size-5 shrink-0" />

                        <span className="w-full truncate text-center">
                            {label}
                        </span>
                    </Button>
                );
            })}
        </div>
    );
}

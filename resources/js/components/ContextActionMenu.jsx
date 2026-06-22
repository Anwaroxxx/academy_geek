import { useEffect } from 'react';

export default function ContextActionMenu({
    menu,
    actions = [],
    onClose,
    widthClass = 'w-44',
}) {
    useEffect(() => {
        if (!menu) {
            return;
        }

        const closeMenu = () => onClose?.();
        const closeMenuOnEscape = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        window.addEventListener('click', closeMenu);
        window.addEventListener('scroll', closeMenu, true);
        window.addEventListener('keydown', closeMenuOnEscape);

        return () => {
            window.removeEventListener('click', closeMenu);
            window.removeEventListener('scroll', closeMenu, true);
            window.removeEventListener('keydown', closeMenuOnEscape);
        };
    }, [menu, onClose]);

    if (!menu) {
        return null;
    }

    return (
        <div
            className={`fixed z-50 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg ${widthClass}`}
            style={{ left: menu.x, top: menu.y }}
            onClick={(event) => event.stopPropagation()}
        >
            {actions.map((action) => (
                <button
                    key={action.id ?? action.label}
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                        action.variant === 'danger'
                            ? 'text-error hover:bg-error/10'
                            : 'hover:bg-muted'
                    }`}
                    onClick={() => action.onSelect(menu.item)}
                >
                    {action.icon}
                    {action.label}
                </button>
            ))}
        </div>
    );
}

import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function normalizedLabel(label) {
    return String(label ?? '')
        .replace(/&laquo;|&raquo;/g, '')
        .trim();
}

function pageItems(currentPage, lastPage) {
    const pages = new Set([1, lastPage]);

    for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
        if (page > 1 && page < lastPage) {
            pages.add(page);
        }
    }

    const sortedPages = [...pages].sort((a, b) => a - b);
    const items = [];

    sortedPages.forEach((page, index) => {
        const previousPage = sortedPages[index - 1];

        if (previousPage && page - previousPage > 1) {
            items.push(`ellipsis-${previousPage}-${page}`);
        }

        items.push(page);
    });

    return items;
}

function PaginationButton({
    children,
    disabled = false,
    isActive = false,
    label,
    onClick,
}) {
    return (
        <Button
            type="button"
            variant={isActive ? 'default' : 'secondary'}
            size="sm"
            disabled={disabled}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            onClick={onClick}
            className={cn(
                'min-w-10 border border-white/10',
                isActive
                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                    : 'bg-muted text-foreground hover:bg-accent hover:text-accent-foreground',
                disabled && 'cursor-not-allowed opacity-50',
            )}
        >
            {children}
        </Button>
    );
}

export default function RecordingPagination({ meta = {}, links = [], onNavigate }) {
    const currentPage = Number(meta.current_page ?? 1);
    const lastPage = Number(meta.last_page ?? 1);

    if (lastPage <= 1) {
        return null;
    }

    const previousLink = links[0] ?? null;
    const nextLink = links[links.length - 1] ?? null;
    const pageLinks = new Map(
        links
            .filter((link) => /^\d+$/.test(normalizedLabel(link.label)))
            .map((link) => [Number(normalizedLabel(link.label)), link]),
    );

    const visit = (url) => {
        if (!url) {
            return;
        }

        onNavigate?.();
        router.visit(url, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <nav
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Recordings pagination"
        >
            <PaginationButton
                disabled={!previousLink?.url}
                label="Go to previous page"
                onClick={() => visit(previousLink?.url)}
            >
                Previous
            </PaginationButton>

            {pageItems(currentPage, lastPage).map((item) => {
                if (typeof item === 'string') {
                    return (
                        <span
                            key={item}
                            className="px-2 text-sm text-neutral-500"
                            aria-hidden="true"
                        >
                            ...
                        </span>
                    );
                }

                const pageLink = pageLinks.get(item);
                const isActive = item === currentPage;

                return (
                    <PaginationButton
                        key={item}
                        disabled={isActive || !pageLink?.url}
                        isActive={isActive}
                        label={`Go to page ${item}`}
                        onClick={() => visit(pageLink?.url)}
                    >
                        {item}
                    </PaginationButton>
                );
            })}

            <PaginationButton
                disabled={!nextLink?.url}
                label="Go to next page"
                onClick={() => visit(nextLink?.url)}
            >
                Next
            </PaginationButton>
        </nav>
    );
}

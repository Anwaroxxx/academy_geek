import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      variant={isActive ? "default" : "secondary"}
      size="sm"
      disabled={disabled}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "min-w-10 border border-black/5 dark:border-white/10",
        isActive
          ? "bg-[#FFD026] text-[#102033] hover:bg-[#FFC400]"
          : "bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </Button>
  );
}

export function RecordedStreamsPagination({
  currentPage,
  from,
  lastPage,
  onPageChange,
  to,
  total,
}) {
  const hasMultiplePages = lastPage > 1;
  const countLabel = total === 1 ? "1 recording" : `${total} recordings`;
  const rangeLabel =
    total > 0
      ? `Showing ${from}-${to} of ${countLabel}`
      : "Showing 0 recordings";

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-[#E8E1D1] pt-5 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
        {rangeLabel}
      </p>

      {hasMultiplePages && (
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Recorded streams pagination"
        >
          <PaginationButton
            disabled={currentPage <= 1}
            label="Go to previous recordings page"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            Previous
          </PaginationButton>

          {pageItems(currentPage, lastPage).map((item) => {
            if (typeof item === "string") {
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

            const isActive = item === currentPage;

            return (
              <PaginationButton
                key={item}
                disabled={isActive}
                isActive={isActive}
                label={`Go to recordings page ${item}`}
                onClick={() => onPageChange(item)}
              >
                {item}
              </PaginationButton>
            );
          })}

          <PaginationButton
            disabled={currentPage >= lastPage}
            label="Go to next recordings page"
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          >
            Next
          </PaginationButton>
        </nav>
      )}
    </div>
  );
}

import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function SortViewMenu({
    sortOptions = [],
    sortValue,
    onSortChange,
    viewOptions = [],
    viewValue,
    onViewChange,
    onReset,
    triggerLabel = 'Sort & view',
    sortLabel = 'Sort By',
    viewLabel = 'View As',
    resetLabel = 'Reset to default',
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-border bg-background/80 px-3 shadow-xs transition-all hover:border-alpha/70 hover:bg-alpha/10"
                >
                    <ArrowUpDown className="size-4" />
                    {triggerLabel}
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-52 border-border bg-popover/95 p-3 shadow-xl backdrop-blur"
            >
                <OptionGroup
                    label={sortLabel}
                    options={sortOptions}
                    value={sortValue}
                    onChange={onSortChange}
                />

                <DropdownMenuSeparator className="my-3" />

                <OptionGroup
                    label={viewLabel}
                    options={viewOptions}
                    value={viewValue}
                    onChange={onViewChange}
                />

                {onReset && (
                    <>
                        <DropdownMenuSeparator className="my-3" />
                        <button
                            type="button"
                            className="w-full rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted hover:text-alpha"
                            onClick={onReset}
                        >
                            {resetLabel}
                        </button>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function OptionGroup({ label, options, value, onChange }) {
    return (
        <div className="space-y-1">
            <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted hover:text-alpha"
                    onClick={() => onChange(option.value)}
                >
                    <span>{option.label}</span>
                    <span className="flex size-5 items-center justify-center rounded-full border border-muted-foreground/60">
                        {value === option.value && (
                            <span className="size-2.5 rounded-full bg-alpha shadow-[0_0_12px_var(--color-alpha)]" />
                        )}
                    </span>
                </button>
            ))}
        </div>
    );
}

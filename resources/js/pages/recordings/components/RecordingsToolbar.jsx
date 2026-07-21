import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const RECORDINGS_INDEX_URL = '/recordings';

export default function RecordingsToolbar({ disabled = false, query }) {
    const [value, setValue] = useState(query);

    useEffect(() => {
        setValue(query);
    }, [query]);

    useEffect(() => {
        if (disabled) {
            return undefined;
        }

        const normalizedQuery = value.trim();

        if (normalizedQuery === query) {
            return undefined;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                RECORDINGS_INDEX_URL,
                normalizedQuery ? { search: normalizedQuery } : {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [disabled, query, value]);

    return (
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-neutral-900/80 dark:shadow-black/20">
            <label
                htmlFor="recordings-search"
                className="mb-2 block text-sm font-medium text-neutral-600 dark:text-neutral-400"
            >
                Search recordings
            </label>
            <div className="relative">
                <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                />
                <input
                    id="recordings-search"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    disabled={disabled}
                    placeholder="Search recordings..."
                    className="h-11 w-full rounded-xl border border-border/70 bg-background pr-3 pl-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-amber-400 focus:ring-2 focus:ring-amber-300/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>
            {disabled && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                    Search will be available once recordings are published.
                </p>
            )}
        </div>
    );
}

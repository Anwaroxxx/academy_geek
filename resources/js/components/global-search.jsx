import { router } from '@inertiajs/react';
import {
    BookOpen,
    LayoutDashboard,
    Palette,
    Search,
    Settings,
    ShieldCheck,
    UsersRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { index as classesIndex } from '@/actions/App/Http/Controllers/ClassController';
import { dashboard as dashboardIndex } from '@/routes';
import { edit as appearanceEdit } from '@/routes/appearance';
import { index as coursesIndex } from '@/routes/courses';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import { toUrl } from '@/lib/utils';

const searchItems = [
    {
        title: 'Dashboard',
        description: 'Overview, stats, and workspace summary',
        href: dashboardIndex(),
        icon: LayoutDashboard,
        keywords: ['home', 'overview', 'stats'],
    },
    {
        title: 'Courses',
        description: 'Create, review, and manage reusable courses',
        href: coursesIndex(),
        icon: BookOpen,
        keywords: ['course', 'catalog', 'learning'],
    },
    {
        title: 'Classes',
        description: 'Browse promotions, specialties, coaches, and students',
        href: classesIndex(),
        icon: UsersRound,
        keywords: ['class', 'promo', 'media', 'coding', 'students', 'coaches'],
    },
    {
        title: 'Profile settings',
        description: 'Manage your profile information',
        href: profileEdit(),
        icon: Settings,
        keywords: ['profile', 'account', 'settings'],
    },
    {
        title: 'Security',
        description: 'Password, passkeys, and two-factor settings',
        href: securityEdit(),
        icon: ShieldCheck,
        keywords: ['password', '2fa', 'security'],
    },
    {
        title: 'Appearance',
        description: 'Switch between light and dark mode',
        href: appearanceEdit(),
        icon: Palette,
        keywords: ['theme', 'dark', 'light'],
    },
];

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (!open) {
            setQuery('');
            return;
        }

        window.setTimeout(() => inputRef.current?.focus(), 0);
    }, [open]);

    const results = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) {
            return [];
        }

        return searchItems.filter((item) => {
            const searchable = [
                item.title,
                item.description,
                ...item.keywords,
            ]
                .join(' ')
                .toLowerCase();

            return searchable.includes(term);
        });
    }, [query]);

    const goToResult = (href) => {
        setOpen(false);
        router.visit(toUrl(href));
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative hidden h-9 w-full max-w-sm items-center rounded-lg border border-sidebar-border/70 bg-background/70 pl-9 pr-16 text-left text-sm text-muted-foreground shadow-none transition-colors hover:border-alpha/50 hover:text-foreground focus-visible:border-alpha/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha/20 md:flex dark:bg-[#151515]"
            >
                <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
                <span className="truncate">Search anything...</span>
                <span className="pointer-events-none absolute right-2 hidden items-center gap-1 rounded border border-border bg-muted/70 px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground lg:flex">
                    Ctrl K
                </span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="top-[28%] max-w-2xl gap-0 overflow-hidden rounded-xl border-border bg-background p-0 shadow-2xl dark:bg-[#080808]">
                    <DialogTitle className="sr-only">Global search</DialogTitle>
                    <DialogDescription className="sr-only">
                        Search across Academy pages and workspace destinations.
                    </DialogDescription>

                    <div className="border-b border-border p-3">
                        <label className="relative flex items-center">
                            <Search className="pointer-events-none absolute left-4 size-5 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search users, projects, tasks, equipment, reservations..."
                                className="h-12 rounded-lg bg-muted/30 pl-12 pr-4 text-base shadow-none focus-visible:ring-alpha/20 dark:bg-[#141414]"
                            />
                        </label>
                    </div>

                    <div className="min-h-56 p-4">
                        {!query.trim() && (
                            <div className="flex min-h-48 flex-col items-center justify-center text-center">
                                <Search className="mb-5 size-14 text-muted-foreground" />
                                <p className="text-sm font-medium text-foreground">
                                    Start typing to search...
                                </p>
                                <p className="mt-2 max-w-md text-xs text-muted-foreground">
                                    Search across courses, classes, settings, security, and workspace pages.
                                </p>
                            </div>
                        )}

                        {query.trim() && results.length === 0 && (
                            <div className="flex min-h-48 flex-col items-center justify-center text-center">
                                <Search className="mb-5 size-14 text-muted-foreground" />
                                <p className="text-sm font-medium text-foreground">
                                    No results found
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Try searching for courses, classes, profile, or security.
                                </p>
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="grid gap-2">
                                {results.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <button
                                            key={item.title}
                                            type="button"
                                            onClick={() => goToResult(item.href)}
                                            className="flex items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-alpha/25 hover:bg-alpha/10 focus-visible:border-alpha/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha/20"
                                        >
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-alpha/25 bg-alpha/10 text-alpha">
                                                <Icon className="size-5" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-foreground">
                                                    {item.title}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {item.description}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

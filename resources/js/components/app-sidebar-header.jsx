import { Breadcrumbs } from '@/components/breadcrumbs';
import { GlobalSearch } from '@/components/global-search';
import { NavbarUser, NavbarUserStats } from '@/components/navbar-user';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { Bell, Moon, Sun } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const nextAppearance = resolvedAppearance === 'dark' ? 'light' : 'dark';
    const ThemeIcon = resolvedAppearance === 'dark' ? Sun : Moon;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-light px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:bg-dark">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="mx-auto hidden flex-1 justify-center px-4 md:flex">
                <GlobalSearch />
            </div>
            <div className="ml-auto flex items-center gap-2 md:gap-3">
                <NavbarUserStats />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="relative size-9 rounded-full text-foreground/80 hover:bg-alpha/10 hover:text-alpha"
                            aria-label="Notifications"
                        >
                            <Bell className="size-4" />
                            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-full text-foreground/80 hover:bg-alpha/10 hover:text-alpha"
                            aria-label="Toggle theme"
                            onClick={() => updateAppearance(nextAppearance)}
                        >
                            <ThemeIcon className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Switch to {nextAppearance} mode
                    </TooltipContent>
                </Tooltip>
                <NavbarUser />
            </div>
        </header>
    );
}

import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, Coins } from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';

const geekPoints = '1,240';
const profileStats = {
    level: 3,
    xp: 860,
    xpTarget: 1200,
    xpProgress: 68,
};
const fallbackUser = {
    name: 'Local Coach',
    email: 'local-coach@example.test',
    avatar: '',
};

export function NavbarUser() {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const user = auth.user ?? fallbackUser;

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-12 gap-1 rounded-full px-2"
                        aria-label="Open user menu"
                    >
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                            />
                            <AvatarFallback className="rounded-full bg-neutral-200 text-xs text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(user.name ?? '')}
                            </AvatarFallback>
                        </Avatar>
                        <ChevronsUpDown className="hidden size-4 text-muted-foreground sm:block" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <UserMenuContent user={user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function NavbarUserStats() {
    return (
        <div className="hidden items-center gap-2 md:flex">
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex min-w-28 flex-col gap-1.5 rounded-full border border-alpha/45 bg-[#fff8d6] px-4 py-2 shadow-[0_8px_24px_rgba(255,200,1,0.12)] dark:border-alpha/25 dark:bg-alpha/10 dark:shadow-[0_0_18px_rgba(255,200,1,0.06)]">
                        <span className="text-xs font-semibold leading-none text-[#5a4600] dark:text-foreground">
                            <TransText en="Level" fr="Level" ar="Level" /> {profileStats.level}
                        </span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-[#ead893] dark:bg-muted">
                            <span
                                className="block h-full rounded-full bg-alpha"
                                style={{ width: `${profileStats.xpProgress}%` }}
                            />
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="border border-alpha/20 bg-white text-[#5a4600] shadow-[0_8px_24px_rgba(0,0,0,0.10)] dark:border-alpha/20 dark:bg-[#1b1b1b] dark:text-alpha">
                    {profileStats.xp} XP
                </TooltipContent>
            </Tooltip>

            <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-alpha/35 bg-alpha/10 px-3 text-xs font-semibold text-[#8a6a00] dark:text-alpha">
                <Coins className="size-3.5" />
                {geekPoints}{' '}
                <TransText
                    en="Geek Points"
                    fr="Geek Points"
                    ar="Geek Points"
                />
            </div>
        </div>
    );
}

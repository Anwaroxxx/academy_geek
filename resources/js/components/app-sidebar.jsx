import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    UsersRound,
    Video,
} from 'lucide-react';
import { TransText } from '@/components/TransText';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn, toUrl } from '@/lib/utils';
import { index as classesIndex } from '@/actions/App/Http/Controllers/ClassController';
import { dashboard as dashboardIndex } from '@/routes';
import { index as coursesIndex } from '@/routes/courses';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';

const logoSrc = '/assets/images/logolionsgeek.png';

const navigationSections = [
    {
        key: 'platform',
        label: <TransText en="Platform" fr="Platform" ar="Platform" />,
        items: [
            {
                title: <TransText en="Dashboard" fr="Dashboard" ar="Dashboard" />,
                href: dashboardIndex(),
                icon: LayoutDashboard,
            },
            {
                title: <TransText en="Courses" fr="Courses" ar="Courses" />,
                href: coursesIndex(),
                icon: BookOpen,
            },
            {
                title: <TransText en="Classes" fr="Classes" ar="Classes" />,
                href: classesIndex(),
                icon: UsersRound,
            },
            {
                title: <TransText en="Recordings" fr="Recordings" ar="Recordings" />,
                href: '/recordings',
                icon: Video,
            },
        ],
    },
    {
        key: 'workspace',
        label: <TransText en="Workspace" fr="Workspace" ar="Workspace" />,
        items: [
            {
                title: <TransText en="Settings" fr="Settings" ar="Settings" />,
                href: profileEdit(),
                icon: Settings,
            },
            {
                title: <TransText en="Security" fr="Security" ar="Security" />,
                href: securityEdit(),
                icon: ShieldCheck,
            },
        ],
    },
];

export function AppSidebar() {
    const page = usePage();

    return (
        <Sidebar
            collapsible="icon"
            className="h-svh! min-h-svh border-r border-sidebar-border bg-sidebar [--sidebar:#f9fafb] [--sidebar-accent:#fff4bd] [--sidebar-accent-foreground:#6f5600] [--sidebar-border:#e5e7eb] [--sidebar-foreground:#111827] dark:[--sidebar:#171717] dark:[--sidebar-accent:#4b3b05] dark:[--sidebar-accent-foreground:#ffc801] dark:[--sidebar-border:#252525] dark:[--sidebar-foreground:#f5f5f5]"
        >
            <SidebarHeader className="mx-2 border-b border-sidebar-border px-4 py-5 group-data-[collapsible=icon]:mx-1 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-auto gap-3 rounded-xl px-0 py-1 hover:bg-transparent data-[active=true]:bg-transparent"
                        >
                            <Link href={coursesIndex().url} prefetch>
                                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-alpha/70 bg-alpha/5 shadow-[0_0_18px_rgba(255,200,1,0.18)] group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-full">
                                    <img
                                        src={logoSrc}
                                        alt="LionsGeek"
                                        className="size-8 rounded-full object-cover group-data-[collapsible=icon]:size-6"
                                    />
                                </span>
                                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-[0.92rem] font-semibold text-sidebar-foreground">
                                        <TransText
                                            en="LionsGeek Academy"
                                            fr="LionsGeek Academy"
                                            ar="LionsGeek Academy"
                                        />
                                    </span>
                                    <span className="truncate text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
                                        <TransText
                                            en="Coach workspace"
                                            fr="Coach workspace"
                                            ar="Coach workspace"
                                        />
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-6 px-4 py-5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-4">
                {navigationSections.map((section) => (
                    <SidebarMenu
                        key={section.key}
                        className="gap-1.5 group-data-[collapsible=icon]:items-center"
                    >
                        <p className="px-3 pb-2 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-sidebar-foreground/62 group-data-[collapsible=icon]:hidden">
                            {section.label}
                        </p>

                        {section.items.map((item) => (
                            <SidebarNavItem
                                key={item.href.url ?? item.href}
                                item={item}
                                currentUrl={page.url}
                            />
                        ))}
                    </SidebarMenu>
                ))}
            </SidebarContent>

            <SidebarFooter className="mx-2 mt-auto border-t border-sidebar-border p-0 pb-5 group-data-[collapsible=icon]:mx-1" />
        </Sidebar>
    );
}

function SidebarNavItem({ item, currentUrl }) {
    const href = toUrl(item.href);
    const isActive = currentUrl.startsWith(href);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                tooltip={{ children: item.title }}
                isActive={isActive}
                className={cn(
                    'group/nav h-10 rounded-lg px-3 text-[0.92rem] font-medium text-sidebar-foreground transition-all duration-200',
                    'group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:p-0!',
                    'hover:bg-alpha/10 hover:text-[#6f5600] hover:shadow-[inset_0_0_0_1px_rgba(255,200,1,0.22)] dark:hover:bg-[#2f2a16] dark:hover:text-alpha',
                    isActive &&
                        'bg-alpha/15 text-[#6f5600] shadow-[inset_0_0_0_1px_rgba(255,200,1,0.28)] hover:bg-alpha/22 hover:text-[#5a4600] dark:bg-[#4b3b05] dark:text-alpha dark:hover:bg-[#604b07] dark:hover:text-alpha dark:hover:shadow-[inset_0_0_0_1px_rgba(255,200,1,0.35)]',
                )}
            >
                <Link href={href} prefetch>
                    <item.icon
                        className={cn(
                            'size-4 transition-transform duration-200 ease-out group-hover/nav:-translate-y-0.5 group-hover/nav:scale-110 group-hover/nav:rotate-[-6deg] group-focus-visible/nav:-translate-y-0.5 group-focus-visible/nav:scale-110',
                            isActive
                                ? 'text-[#d8a200] dark:text-alpha'
                                : 'text-sidebar-foreground group-hover/nav:text-[#d8a200] dark:group-hover/nav:text-alpha',
                        )}
                    />
                    <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                    </span>
                    {isActive && (
                        <ChevronRight className="ml-auto size-4 text-[#d8a200] dark:text-alpha group-data-[collapsible=icon]:hidden" />
                    )}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

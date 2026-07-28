import { Link } from '@inertiajs/react';
import { MessageSquare, Play, Users, Video } from 'lucide-react';

const features = [
    { label: 'Go Live', icon: Video },
    { label: 'Engage Students', icon: Users },
    { label: 'Real-time Interaction', icon: MessageSquare },
];

export default function LiveStreamBanner({
    actionLabel = 'Start Live Session',
    classId,
    description = 'Start and manage your live class session',
    href,
    title = 'Live Streaming',
}) {
    const sessionHref = href ?? (classId ? `/classroom/sessions/${classId}` : '#');

    return (
        <section className="mx-3 mt-4 mb-8 overflow-hidden rounded-2xl border border-[#F5E8C6] bg-[#FFF9EA] px-6 py-5 shadow-sm transition-all duration-300 hover:border-[#E8D49A] hover:shadow-md hover:shadow-amber-200/40 md:mx-5 md:px-10 md:py-6 lg:mx-6 lg:px-14 dark:border-[#2A2617] dark:bg-[#15130D] dark:shadow-none dark:hover:border-[#4A3B12] dark:hover:shadow-lg dark:hover:shadow-yellow-950/20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* left side  */}
                <div className="min-w-0">
                    <h2 className="text-2xl font-bold leading-tight text-[#1F2937] md:text-[1.6rem] dark:text-white">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-[#64748B] md:text-base dark:text-[#9CA3AF]">
                        {description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {features.map(({ label, icon: Icon }) => (
                            <div
                                key={label}
                                className="flex cursor-default items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFF3C4] hover:shadow-sm hover:shadow-amber-100 dark:hover:bg-[#24200F] dark:hover:shadow-none"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFE8A3] dark:bg-[#2A240D] dark:ring-1 dark:ring-[#4A3B12]">
                                    <Icon
                                        className="h-3.5 w-3.5 text-[#1F2937] dark:text-[#FACC15]"
                                        strokeWidth={2}
                                    />
                                </span>

                                <span className="text-sm font-medium text-[#475569] dark:text-[#D1D5DB]">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* right side  */}
                <div className="shrink-0">
                {/* CTA button */}
                <Link
                    href={sessionHref}
                    aria-label="Start Live Session"
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#FFD026] to-[#FFC400] px-6 py-3 text-sm font-bold text-[#102033] shadow-md shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/30"
                >
                    <Play className="h-4 w-4 fill-[#102033]" />
                    <span>{actionLabel}</span>

                    <span className="ml-2 flex items-center gap-1 rounded-md bg-white/55 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        LIVE
                    </span>
                </Link>


                </div>
            </div>
        </section>
    );
}

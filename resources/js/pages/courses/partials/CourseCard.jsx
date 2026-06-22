import { BookOpen, Clock, Eye, Layers3, MoreHorizontal } from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Button } from '@/components/ui/button';
import BannerVisual from './BannerVisual';

export default function CourseCard({
    course,
    onOpenMenu,
    onOpenMenuFromButton,
    onReview,
    statusLabel,
    statusStyles,
}) {
    return (
        <article
            className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-alpha/60 hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
            onContextMenu={onOpenMenu}
        >
            <div className="absolute inset-y-0 left-0 w-1 bg-alpha opacity-80" />
            <div className="grid sm:grid-cols-[1fr_34%]">
                <div className="relative flex min-h-44 flex-col justify-between gap-5 overflow-hidden p-4 pl-6">
                    <div className="absolute inset-0 bg-[linear-gradient(115deg,var(--color-muted)_0%,transparent_42%)] opacity-35" />
                    <div className="relative">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-md border border-alpha/30 bg-alpha/10 text-xs font-bold text-alpha">
                                {course.title?.slice(0, 2).toUpperCase()}
                            </span>
                            <p className="text-xs font-medium text-muted-foreground">
                                <TransText
                                    en="Created by"
                                    fr="Created by"
                                    ar="Created by"
                                />{' '}
                                {course.creator_name ?? (
                                    <TransText
                                        en="Local Coach"
                                        fr="Local Coach"
                                        ar="Local Coach"
                                    />
                                )}
                            </p>
                        </div>
                        <h3 className="max-w-2xl text-xl leading-tight font-semibold text-foreground transition-colors group-hover:text-alpha">
                            {course.title}
                        </h3>
                        {course.description && (
                            <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {course.description}
                            </p>
                        )}
                        <span
                            className={`mt-3 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles(course.status)}`}
                        >
                            {statusLabel(course.status)}
                        </span>
                    </div>

                    <div className="relative flex flex-wrap items-center gap-3">
                        {course.estimated_duration_days && (
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                                <Clock className="size-4 text-alpha" />
                                {course.estimated_duration_days}{' '}
                                <TransText en="days" fr="days" ar="days" />
                            </span>
                        )}
                        <CountBadge
                            icon={<Layers3 className="size-4 text-alpha" />}
                            value={course.concepts_count ?? 0}
                            label={
                                <TransText
                                    en="concepts"
                                    fr="concepts"
                                    ar="concepts"
                                />
                            }
                        />
                        <CountBadge
                            icon={<BookOpen className="size-4 text-alpha" />}
                            value={course.chapters_count ?? 0}
                            label={
                                <TransText
                                    en="chapters"
                                    fr="chapters"
                                    ar="chapters"
                                />
                            }
                        />
                    </div>
                </div>

                <div className="relative border-l border-border/70 bg-muted/20 p-2">
                    <BannerVisual
                        imageUrl={course.thumbnail_url}
                        className="h-44 rounded-md"
                    />
                    <CourseQuickActions
                        onReview={onReview}
                        onOpenMenu={onOpenMenuFromButton}
                    />
                </div>
            </div>
        </article>
    );
}

export function CountBadge({ icon, value, label }) {
    return (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {icon}
            {value} {label}
        </span>
    );
}

export function CourseQuickActions({ onReview, onOpenMenu }) {
    return (
        <div className="absolute right-4 bottom-4 flex items-center gap-2">
            <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 rounded-full bg-background/85 px-3 text-xs shadow-lg backdrop-blur hover:bg-alpha hover:text-black"
                onClick={onReview}
            >
                <Eye className="size-4" />
                <TransText en="Review" fr="Review" ar="Review" />
            </Button>
            <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-8 rounded-full bg-background/85 shadow-lg backdrop-blur hover:bg-alpha hover:text-black"
                onClick={onOpenMenu}
                aria-label="Course actions"
            >
                <MoreHorizontal className="size-4" />
            </Button>
        </div>
    );
}

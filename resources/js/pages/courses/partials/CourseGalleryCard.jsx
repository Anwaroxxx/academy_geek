import { BookOpen, Clock, Layers3 } from 'lucide-react';
import { TransText } from '@/components/TransText';
import BannerVisual from './BannerVisual';
import { CountBadge, CourseQuickActions } from './CourseCard';

export default function CourseGalleryCard({
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
            <div className="relative border-b border-border/70 bg-muted/20 p-2">
                <BannerVisual
                    imageUrl={course.thumbnail_url}
                    className="h-36 rounded-md"
                />
                <CourseQuickActions
                    onReview={onReview}
                    onOpenMenu={onOpenMenuFromButton}
                />
            </div>
            <div className="flex min-h-40 flex-col justify-between gap-4 p-4">
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-md border border-alpha/30 bg-alpha/10 text-xs font-bold text-alpha">
                            {course.title?.slice(0, 2).toUpperCase()}
                        </span>
                        <p className="text-xs font-medium text-muted-foreground">
                            {course.creator_name ?? (
                                <TransText
                                    en="Local Coach"
                                    fr="Local Coach"
                                    ar="Local Coach"
                                />
                            )}
                        </p>
                    </div>
                    <h3 className="text-xl leading-tight font-semibold text-foreground transition-colors group-hover:text-alpha">
                        {course.title}
                    </h3>
                    {course.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {course.description}
                        </p>
                    )}
                    <span
                        className={`mt-3 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles(course.status)}`}
                    >
                        {statusLabel(course.status)}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {course.estimated_duration_days && (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
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
        </article>
    );
}

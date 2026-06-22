import { Button } from '@/components/ui/button';
import { TransText } from '@/components/TransText';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import BannerVisual from './BannerVisual';

export default function CourseReviewModal({
    course,
    open,
    onOpenChange,
    statusLabel,
    statusStyles,
}) {
    if (!course) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{course.title}</DialogTitle>
                    <DialogDescription>
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
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-[40%_1fr]">
                    <BannerVisual
                        imageUrl={course.thumbnail_url}
                        className="h-56 rounded-lg"
                    />
                    <div className="space-y-4">
                        <span
                            className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles(course.status)}`}
                        >
                            {statusLabel(course.status)}
                        </span>

                        {course.description && (
                            <p className="text-sm leading-6 text-muted-foreground">
                                {course.description}
                            </p>
                        )}

                        <div className="grid gap-2 sm:grid-cols-3">
                            <ReviewMetric
                                label={
                                    <TransText
                                        en="Duration"
                                        fr="Duration"
                                        ar="Duration"
                                    />
                                }
                                value={
                                    course.estimated_duration_days
                                        ? (
                                              <>
                                                  {course.estimated_duration_days}{' '}
                                                  <TransText
                                                      en="days"
                                                      fr="days"
                                                      ar="days"
                                                  />
                                              </>
                                          )
                                        : (
                                              <TransText
                                                  en="Not set"
                                                  fr="Not set"
                                                  ar="Not set"
                                              />
                                          )
                                }
                            />
                            <ReviewMetric
                                label={
                                    <TransText
                                        en="Concepts"
                                        fr="Concepts"
                                        ar="Concepts"
                                    />
                                }
                                value={course.concepts_count ?? 0}
                            />
                            <ReviewMetric
                                label={
                                    <TransText
                                        en="Chapters"
                                        fr="Chapters"
                                        ar="Chapters"
                                    />
                                }
                                value={course.chapters_count ?? 0}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        <TransText en="Close" fr="Close" ar="Close" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ReviewMetric({ label, value }) {
    return (
        <div className="rounded-md border border-border bg-muted/20 p-3">
            <div className="text-lg font-semibold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

import { Layers3, Plus } from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Button } from '@/components/ui/button';
import CourseStats from './CourseStats';

export default function CoursesHeader({ stats, onCreate }) {
    return (
        <div className="relative mb-6 overflow-hidden rounded-lg border border-border  shadow-xs">
            <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-alpha),transparent_72%)]" />
            <div className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-alpha uppercase">
                        <Layers3 className="size-4" />
                        <TransText
                            en="Coach workspace"
                            fr="Coach workspace"
                            ar="Coach workspace"
                        />
                    </div>
                    <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
                        <TransText en="Courses" fr="Courses" ar="Courses" />
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        <TransText
                            en="Manage reusable courses before assigning them to promotions."
                            fr="Manage reusable courses before assigning them to promotions."
                            ar="Manage reusable courses before assigning them to promotions."
                        />
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <CourseStats stats={stats} />
                    <Button
                        type="button"
                        className="bg-alpha"
                        onClick={onCreate}
                    >
                        <Plus />
                        <TransText
                            en="New course"
                            fr="New course"
                            ar="New course"
                        />
                    </Button>
                </div>
            </div>
        </div>
    );
}

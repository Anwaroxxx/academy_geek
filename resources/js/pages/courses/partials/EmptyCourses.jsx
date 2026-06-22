import { Plus } from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Button } from '@/components/ui/button';

export default function EmptyCourses({ onCreate }) {
    return (
        <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-alpha text-black">
                <Plus className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
                <TransText
                    en="No courses yet"
                    fr="No courses yet"
                    ar="No courses yet"
                />
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                <TransText
                    en="Create the first course and it will show up here as a catalog item."
                    fr="Create the first course and it will show up here as a catalog item."
                    ar="Create the first course and it will show up here as a catalog item."
                />
            </p>
            <Button
                type="button"
                className="mt-4 bg-alpha"
                onClick={onCreate}
            >
                <Plus />
                <TransText
                    en="Create course"
                    fr="Create course"
                    ar="Create course"
                />
            </Button>
        </div>
    );
}

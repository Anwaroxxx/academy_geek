import { Archive } from 'lucide-react';
import { TransText } from '@/components/TransText';

export default function EmptyFilter() {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border border-border bg-muted/30">
                <Archive className="size-5 text-alpha" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
                <TransText
                    en="No courses in this filter"
                    fr="No courses in this filter"
                    ar="No courses in this filter"
                />
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                <TransText
                    en="Switch filters or reset the catalog view to see the full course list."
                    fr="Switch filters or reset the catalog view to see the full course list."
                    ar="Switch filters or reset the catalog view to see the full course list."
                />
            </p>
        </div>
    );
}

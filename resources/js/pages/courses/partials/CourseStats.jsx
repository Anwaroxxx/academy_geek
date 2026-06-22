import { TransText } from '@/components/TransText';

export default function CourseStats({ stats }) {
    return (
        <div className="grid grid-cols-3 gap-2 text-sm">
            <Metric
                label={<TransText en="Total" fr="Total" ar="Total" />}
                value={stats.total}
            />
            <Metric
                label={
                    <TransText
                        en="Published"
                        fr="Published"
                        ar="Published"
                    />
                }
                value={stats.assigned}
            />
            <Metric
                label={<TransText en="Drafts" fr="Drafts" ar="Drafts" />}
                value={stats.drafts}
            />
        </div>
    );
}

function Metric({ label, value }) {
    return (
        <div className="min-w-20 rounded-md border border-border bg-muted/30 px-3 py-2 shadow-xs transition-colors hover:border-alpha/50">
            <div className="text-lg leading-none font-semibold text-alpha">
                {value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

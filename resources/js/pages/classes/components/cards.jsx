import { BookOpen, User, Users } from 'lucide-react';
import { TransText } from '@/components/TransText';

const Cards = ({ img, promo, classNum, formation, date, coach, studentsNum, ...props }) => {
    const normalizedFormation = String(formation ?? 'class').trim().toLowerCase();
    const formationLabel = normalizedFormation.charAt(0).toUpperCase() + normalizedFormation.slice(1);
    const cardTitle = `Promo ${promo} - ${formationLabel} ${classNum}`;
    const isMedia = normalizedFormation === 'media';
    const logoSrc = '/assets/images/logolionsgeek.png';

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-alpha/45 hover:shadow-[0_14px_30px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_14px_30px_rgba(255,200,1,0.035)]">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-alpha/70" />
            <div
                className={`absolute -right-24 top-1/2 size-52 -translate-y-1/2 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-105 ${
                    isMedia ? 'bg-sky-400/10' : 'bg-alpha/12'
                }`}
            />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-40 bg-gradient-to-l from-alpha/8 via-alpha/4 to-transparent dark:from-alpha/10 dark:via-alpha/4" />
            <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 top-1/2 size-40 -translate-y-1/2 rounded-full object-contain opacity-[0.18] blur-[0.6px] saturate-75 transition-all duration-300 group-hover:-right-8 group-hover:opacity-[0.24] dark:opacity-[0.16] dark:group-hover:opacity-[0.22]"
            />

            <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 max-w-[calc(100%-5rem)] items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-alpha/35 bg-alpha/10 text-alpha">
                        <BookOpen className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            {formationLabel}
                        </p>
                        <h3 className="mt-1 truncate text-lg font-bold text-card-foreground">
                            {cardTitle}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="relative mt-8 grid gap-3 rounded-xl border border-border/80 bg-background/70 p-4 pr-16 backdrop-blur-[1px] dark:bg-black/25">
                <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="size-4 text-alpha" />
                        <TransText en="Coach" fr="Coach" ar="Coach" />
                    </span>
                    <span className="truncate text-sm font-semibold text-card-foreground">
                        {coach || <TransText en="Unassigned" fr="Non assigné" ar="غير معين" />}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="size-4 text-alpha" />
                        <TransText en="Students" fr="Étudiants" ar="Students" />
                    </span>
                    <span className="text-sm font-semibold text-card-foreground">
                        {studentsNum}
                    </span>
                </div>
            </div>
        </article>
    );
};

export default Cards;

export default function CourseFilters({ value, options, onChange }) {
    return (
        <div className="flex w-full gap-1 rounded-full border border-border bg-muted/20 p-1 sm:w-auto">
            {options.map((option) => {
                const active = value === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                                ? 'bg-alpha text-black shadow-[0_0_18px_var(--color-alpha)]'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

import {
    Plus,
    BookOpen,
    Trash2,
    Video,
    FileText,
    HelpCircle,
    Award,
} from 'lucide-react';

export default function CourseStructureSidebar({
    concept,
    topics = [],
    activeTopicId,
    onSelectTopic,
    onAddTopic,
    onDeleteTopic,
}) {
    return (
        <aside className="w-[310px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shrink-0">
            <div className="p-3 border-b border-sidebar-border">
                <button
                    onClick={onAddTopic}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-alpha px-3 py-2 text-sm font-semibold shadow-sm shadow-alpha/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-alpha/30 dark:text-zinc-950"
                >
                    <Plus className="h-4 w-4" />
                    Add Lesson
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {topics.map((topic, index) => {
                    const isActive = activeTopicId === topic.id;

                    return (
                        <button
                            key={topic.id}
                            type="button"
                            onClick={() => onSelectTopic(topic.id)}
                            className={`group w-full rounded-2xl border p-3 text-left transition-all duration-200 ${
                                isActive
                                    ? 'bg-[#FFF7D6] border-[#F5C518] shadow-sm dark:bg-amber-500/10 dark:border-amber-400 dark:ring-1 dark:ring-amber-400/30 dark:shadow-none'
                                    : 'bg-[#FAFAFA] border-[#ECECEC] hover:bg-[#F4F4F5] dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 dark:bg-zinc-950 dark:border-zinc-800">
                                    <BookOpen className="w-3.5 h-3.5 text-foreground dark:text-zinc-300" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold dark:text-zinc-500">
                                        Lesson {String(index + 1).padStart(2, '0')}
                                    </p>

                                    <p className="text-xs font-semibold truncate mt-0.5 text-foreground dark:text-white">
                                        {topic.title || 'Untitled lesson'}
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground dark:text-zinc-500">
                                        <Video
                                            className={`w-3.5 h-3.5 ${
                                                topic.videoUrl || topic.videoFile
                                                    ? 'text-good dark:text-emerald-400'
                                                    : ''
                                            }`}
                                        />
                                        <FileText
                                            className={`w-3.5 h-3.5 ${
                                                topic.resources?.length > 0
                                                    ? 'text-alpha dark:text-amber-300'
                                                    : ''
                                            }`}
                                        />
                                        <HelpCircle
                                            className={`w-3.5 h-3.5 ${
                                                topic.hasQuiz ? 'text-alpha dark:text-amber-300' : ''
                                            }`}
                                        />
                                        <Award
                                            className={`w-3.5 h-3.5 ${
                                                topic.hasExercise ? 'text-good dark:text-emerald-400' : ''
                                            }`}
                                        />
                                    </div>
                                </div>

                                <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTopic(topic.id);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key !== 'Enter' && e.key !== ' ') return;
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDeleteTopic(topic.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-error dark:text-zinc-500 dark:hover:text-red-400"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

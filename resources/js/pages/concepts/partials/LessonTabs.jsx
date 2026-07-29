import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Eye,
    HelpCircle,
    Paperclip,
    Pencil,
    Settings,
    Trash2,
} from 'lucide-react';

import TheoryTab from './TheoryTab';
import ResourcesTab from './ResourcesTab';
import TopicSettingsTab from './TopicSettingsTab';

import Quizes from '@/components/quizes';
import Exercises from '@/components/exercices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DeleteModal from '@/components/DeleteModal';
import ManualModal from '@/pages/concepts/partials/ManualModal';
import ReviewModal from '@/pages/concepts/partials/ReviewModal';
import { destroy as destroyQuiz } from '@/routes/quizes';

const statusStyles = {
    pending_review: 'border-alpha/40 bg-alpha/10 text-alpha',
    approved: 'border-good/40 bg-good/10 text-good',
    rejected: 'border-destructive/40 bg-destructive/10 text-destructive',
};

const sourceStyles = {
    ai: 'border-orange-400/40 bg-orange-400/15 text-orange-400',
    manual: 'border-blue-400/40 bg-blue-400/15 text-blue-400',
    pdf: 'border-red-300/40 bg-red-300/25 text-red-300',
};

const formatRelativeDate = (value) => {
    if (!value) return null;

    const date = new Date(value);
    const timestamp = date.getTime();

    if (Number.isNaN(timestamp)) return null;

    const diffInSeconds = Math.max(
        0,
        Math.floor((Date.now() - timestamp) / 1000),
    );
    const units = [
        ['year', 31536000],
        ['month', 2592000],
        ['week', 604800],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [unit, seconds] of units) {
        const amount = Math.floor(diffInSeconds / seconds);

        if (amount >= 1) {
            return `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;
        }
    }

    return 'Just now';
};

const normalizeStatus = (status) => String(status || '').toLowerCase();
const normalizeSource = (source) => String(source || '').toLowerCase();
const getApprovedQuestionCount = (quiz) => {
    if (!Array.isArray(quiz?.questions)) return 0;

    return quiz.questions.filter(
        (question) => normalizeStatus(question?.status) === 'approved',
    ).length;
};
const getQuizStatusLabel = (source, status) => {
    if (source === 'manual' && status === 'approved') return 'Published';
    if (['ai', 'pdf'].includes(source) && status === 'approved') {
        return 'Reviewed';
    }
    if (status === 'pending_review') return 'Pending Review';

    return null;
};

function QuizBadge({ children, className }) {
    return (
        <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
        >
            {children}
        </Badge>
    );
}

function QuizActionButton({ label, icon: Icon, onClick, disabled = false }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            title={label}
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className="size-9 rounded-lg border border-border bg-background/70 text-muted-foreground shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-alpha/50 hover:bg-alpha/10 hover:text-alpha hover:shadow-md"
        >
            <Icon className="size-4" />
        </Button>
    );
}

function QuizCard({ quiz, onPreview, onEdit, onDelete, deleting }) {
    const status = normalizeStatus(quiz.status);
    const source = normalizeSource(quiz.source);
    const questionCount = getApprovedQuestionCount(quiz);
    const createdAt = formatRelativeDate(quiz.created_at);
    const statusLabel = getQuizStatusLabel(source, status);
    const sourceLabels = {
        ai: 'AI Generated',
        manual: 'Manual',
        pdf: 'PDF Generated',
    };
    return (
        <article className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-alpha/50 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-alpha/30 bg-alpha/10 text-alpha shadow-xs">
                <HelpCircle className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-alpha">
                        {quiz.title || 'Untitled Quiz'}
                    </h4>

                    {source && sourceStyles[source] && (
                        <QuizBadge className={sourceStyles[source]}>
                            {sourceLabels[source]}
                        </QuizBadge>
                    )}

                    {statusLabel && statusStyles[status] && (
                        <QuizBadge className={statusStyles[status]}>
                            {statusLabel}
                        </QuizBadge>
                    )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                        {questionCount}{' '}
                        {questionCount === 1 ? 'Question' : 'Questions'}
                    </span>
                    {createdAt && <span>Created {createdAt}</span>}
                    {quiz.passing_score !== null &&
                        quiz.passing_score !== undefined && (
                            <span>Passing Score: {quiz.passing_score}%</span>
                        )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                <QuizActionButton
                    label="Preview"
                    icon={Eye}
                    onClick={() => onPreview(quiz)}
                />
                <QuizActionButton
                    label="Review / Edit"
                    icon={Pencil}
                    onClick={() => onEdit(quiz)}
                />
                <QuizActionButton
                    label="Delete"
                    icon={Trash2}
                    onClick={() => onDelete(quiz)}
                    disabled={deleting}
                />
            </div>
        </article>
    );
}

function QuizEmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center shadow-xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-alpha/30 bg-alpha/10 text-alpha">
                <HelpCircle className="size-6" />
            </div>
            <h4 className="mt-4 font-medium text-foreground">
                No quiz created yet
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
                Generate with AI or create one manually.
            </p>
        </div>
    );
}

export default function LessonTabs({
    concept,
    topic,
    quizzes = [],
    onUpdateTopic,
}) {
    const [activeTab, setActiveTab] = useState('theory');
    const [displayedQuizzes, setDisplayedQuizzes] = useState(quizzes);
    const [previewingQuiz, setPreviewingQuiz] = useState(null);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => setDisplayedQuizzes(quizzes), [quizzes]);

    const lessonQuizzes = displayedQuizzes.filter(
        (quiz) =>
            quiz.topic_id !== null &&
            quiz.topic_id !== undefined &&
            Number(quiz.topic_id) === Number(topic?.id),
    );
    const conceptQuizzes = displayedQuizzes.filter(
        (quiz) =>
            (quiz.topic_id === null || quiz.topic_id === undefined) &&
            Number(quiz.concept_id) === Number(concept?.id),
    );

    const renderQuizCard = (quiz) => (
        <QuizCard
            key={quiz.id}
            quiz={quiz}
            onPreview={setPreviewingQuiz}
            onEdit={setEditingQuiz}
            onDelete={(selectedQuiz) => {
                setDeleteError('');
                setQuizToDelete(selectedQuiz);
            }}
            deleting={deleteProcessing && quizToDelete?.id === quiz.id}
        />
    );

    const deleteQuiz = () => {
        if (!quizToDelete || deleteProcessing) return Promise.resolve();

        const deletedQuizId = quizToDelete.id;
        setDeleteProcessing(true);
        setDeleteError('');

        return new Promise((resolve, reject) => {
            router.delete(destroyQuiz.url(deletedQuizId), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setDisplayedQuizzes((previousQuizzes) =>
                        previousQuizzes.filter(
                            (quiz) => quiz.id !== deletedQuizId,
                        ),
                    );
                    setQuizToDelete(null);
                    resolve();
                },
                onError: (errors) => {
                    setDeleteError(
                        errors.quiz ||
                            errors.message ||
                            'Unable to delete the quiz. Please try again.',
                    );
                    reject(new Error('Quiz deletion failed.'));
                },
                onFinish: () => setDeleteProcessing(false),
            });
        });
    };

    const tabs = [
        { id: 'theory', label: 'Theory', icon: BookOpen },
        { id: 'resources', label: 'Resources', icon: Paperclip },
        { id: 'quiz', label: 'Quiz', icon: HelpCircle },
        { id: 'exercise', label: 'Exercise', icon: Award },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-2 pt-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-semibold transition ${
                                isActive
                                    ? 'border border-border border-b-card bg-card text-foreground'
                                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                            }`}
                        >
                            <Icon className="size-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="p-6">
                {activeTab === 'theory' && (
                    <TheoryTab topic={topic} onUpdateTopic={onUpdateTopic} />
                )}

                {activeTab === 'resources' && (
                    <ResourcesTab topic={topic} onUpdateTopic={onUpdateTopic} />
                )}

                {activeTab === 'quiz' && (
                    <div className="space-y-5">
                        <div className="space-y-3 border-b border-border pb-5">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Concept Quiz
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Quizzes covering the full concept.
                                </p>
                            </div>

                            {conceptQuizzes.length > 0 ? (
                                <div className="space-y-3">
                                    {conceptQuizzes.map(renderQuizCard)}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                                    No concept quiz created yet.
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    Lesson Quiz
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create or manage quiz questions for this
                                    lesson.
                                </p>
                            </div>

                            <Quizes topicId={topic?.id} />
                        </div>

                        {lessonQuizzes.length > 0 ? (
                            <div className="space-y-3">
                                {lessonQuizzes.map(renderQuizCard)}
                            </div>
                        ) : (
                            <QuizEmptyState />
                        )}
                    </div>
                )}

                {activeTab === 'exercise' && (
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">
                                Practical Exercise
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create a coding challenge for this lesson.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-medium text-foreground">
                                        No exercise created yet
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Help students practice what they
                                        learned.
                                    </p>
                                </div>

                                <Exercises
                                    coachType="coding"
                                    topicId={topic?.id}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <TopicSettingsTab
                        topic={topic}
                        onUpdateTopic={onUpdateTopic}
                    />
                )}
            </div>

            <ReviewModal
                open={Boolean(previewingQuiz)}
                onOpenChange={(open) => {
                    if (!open) setPreviewingQuiz(null);
                }}
                onReviewed={(quizId, reviewStatuses, orderedQuestionIds) => {
                    setDisplayedQuizzes((previousQuizzes) =>
                        previousQuizzes.map((quiz) => {
                            if (quiz.id !== quizId) {
                                return quiz;
                            }

                            const nextQuestions = (quiz.questions || []).map(
                                (question) => ({
                                    ...question,
                                    status:
                                        reviewStatuses[question.id] ||
                                        'approved',
                                }),
                            );
                            const questionMap = new Map(
                                nextQuestions.map((question) => [question.id, question]),
                            );
                            const reorderedQuestions = (
                                orderedQuestionIds || nextQuestions.map((question) => question.id)
                            ).map((questionId) => questionMap.get(questionId)).filter(Boolean);

                            return {
                                ...quiz,
                                status: 'approved',
                                questions: reorderedQuestions,
                            };
                        }),
                    );
                }}
                quiz={previewingQuiz}
            />

            <ManualModal
                open={Boolean(editingQuiz)}
                onOpenChange={(open) => {
                    if (!open) setEditingQuiz(null);
                }}
                onCreated={() => router.reload({ only: ['quizzes'] })}
                topicId={
                    editingQuiz?.topic_id !== null &&
                    editingQuiz?.topic_id !== undefined
                        ? topic?.id
                        : null
                }
                conceptId={
                    editingQuiz?.topic_id === null ||
                    editingQuiz?.topic_id === undefined
                        ? concept?.id
                        : null
                }
                quiz={editingQuiz}
            />

            <DeleteModal
                open={Boolean(quizToDelete)}
                onOpenChange={(open) => {
                    if (!open) {
                        setQuizToDelete(null);
                        setDeleteError('');
                    }
                }}
                title="Delete Quiz?"
                description="This will permanently delete the quiz and all of its questions."
                cancelLabel="Cancel"
                confirmLabel="Delete"
                loading={deleteProcessing}
                onConfirm={deleteQuiz}
            >
                {deleteError && (
                    <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                        {deleteError}
                    </p>
                )}
            </DeleteModal>
        </section>
    );
}

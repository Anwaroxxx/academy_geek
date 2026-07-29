import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle2, CircleCheck, Eye, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import DeleteModal from '@/components/DeleteModal';
import { review as reviewQuiz } from '@/routes/quizes';

const formatLabel = (value) =>
    String(value || '')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getQuizStatusLabel = (source, status) => {
    if (source === 'manual' && status === 'approved') return 'Published';
    if (['ai', 'pdf'].includes(source) && status === 'approved') {
        return 'Reviewed';
    }

    return formatLabel(status);
};

export default function ReviewModal({ open, onOpenChange, onReviewed, quiz }) {
    const [reviewStatuses, setReviewStatuses] = useState({});
    const [orderedQuestionIds, setOrderedQuestionIds] = useState([]);
    const [activeReviewTab, setActiveReviewTab] = useState('all');
    const [draggedQuestionId, setDraggedQuestionId] = useState(null);
    const [dragOverQuestionId, setDragOverQuestionId] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    useEffect(() => {
        if (!open || !quiz) return;

        const nextQuestions = quiz.questions || [];

        setReviewStatuses(
            Object.fromEntries(
                nextQuestions.map((question) => {
                    const savedStatus = ['approved', 'rejected'].includes(
                        question.status,
                    )
                        ? question.status
                        : 'approved';

                    return [question.id, savedStatus];
                }),
            ),
        );
        setOrderedQuestionIds(nextQuestions.map((question) => question.id));
        setActiveReviewTab('all');
        setDraggedQuestionId(null);
        setDragOverQuestionId(null);
        setError('');
        setSaving(false);
        setConfirmationOpen(false);
    }, [open, quiz]);

    const setReviewStatus = (questionId, reviewStatus) => {
        setReviewStatuses((statuses) => ({
            ...statuses,
            [questionId]: reviewStatus,
        }));
        setError('');
    };

    const questions = quiz?.questions || [];
    const canReview = ['ai', 'pdf'].includes(
        String(quiz?.source || '').toLowerCase(),
    );
    const statusLabel = getQuizStatusLabel(
        String(quiz?.source || '').toLowerCase(),
        String(quiz?.status || '').toLowerCase(),
    );
    const questionMap = useMemo(
        () => new Map(questions.map((question) => [question.id, question])),
        [questions],
    );
    const hasQuestionsToDelete = questions.some(
        (question) => reviewStatuses[question.id] === 'rejected',
    );

    const orderedQuestions = useMemo(() => {
        return orderedQuestionIds
            .map((questionId) => questionMap.get(questionId))
            .filter(Boolean);
    }, [orderedQuestionIds, questionMap]);

    const reviewStats = useMemo(() => {
        const approvedCount = orderedQuestions.filter(
            (question) => reviewStatuses[question.id] !== 'rejected',
        ).length;
        const rejectedCount = orderedQuestions.length - approvedCount;

        return {
            approved: approvedCount,
            rejected: rejectedCount,
            total: orderedQuestions.length,
        };
    }, [orderedQuestions, reviewStatuses]);

    const groupedQuestions = useMemo(() => {
        const approvedQuestions = orderedQuestions.filter(
            (question) => reviewStatuses[question.id] !== 'rejected',
        );
        const rejectedQuestions = orderedQuestions.filter(
            (question) => reviewStatuses[question.id] === 'rejected',
        );

        return [
            { key: 'approved', title: 'Approved', questions: approvedQuestions },
            { key: 'rejected', title: 'Rejected', questions: rejectedQuestions },
        ].filter((group) => group.questions.length > 0);
    }, [orderedQuestions, reviewStatuses]);

    const reviewTabGroups = useMemo(() => {
        if (activeReviewTab === 'approved') {
            const approvedQuestions = orderedQuestions.filter(
                (question) => reviewStatuses[question.id] !== 'rejected',
            );

            return approvedQuestions.length > 0
                ? [{ key: 'approved', title: 'Approved', questions: approvedQuestions }]
                : [];
        }

        if (activeReviewTab === 'rejected') {
            const rejectedQuestions = orderedQuestions.filter(
                (question) => reviewStatuses[question.id] === 'rejected',
            );

            return rejectedQuestions.length > 0
                ? [{ key: 'rejected', title: 'Rejected', questions: rejectedQuestions }]
                : [];
        }

        return groupedQuestions;
    }, [activeReviewTab, groupedQuestions, orderedQuestions, reviewStatuses]);

    const moveQuestion = (sourceQuestionId, targetQuestionId) => {
        if (!sourceQuestionId || !targetQuestionId || sourceQuestionId === targetQuestionId) {
            return;
        }

        setOrderedQuestionIds((currentOrder) => {
            const sourceIndex = currentOrder.indexOf(sourceQuestionId);
            const targetIndex = currentOrder.indexOf(targetQuestionId);

            if (sourceIndex === -1 || targetIndex === -1) {
                return currentOrder;
            }

            const nextOrder = [...currentOrder];
            const [movedQuestionId] = nextOrder.splice(sourceIndex, 1);
            const insertIndex =
                sourceIndex < targetIndex ? targetIndex : targetIndex + 1;
            nextOrder.splice(insertIndex, 0, movedQuestionId);

            return nextOrder;
        });
        setDraggedQuestionId(null);
        setDragOverQuestionId(null);
    };

    const submitReview = () => {
        if (!quiz || saving) return Promise.resolve();

        return new Promise((resolve, reject) => {
            setSaving(true);
            setError('');

            router.put(
                reviewQuiz.url(quiz.id),
                {
                    questions: orderedQuestions.map((question) => ({
                        id: question.id,
                        status:
                            reviewStatuses[question.id] === 'rejected'
                                ? 'rejected'
                                : 'approved',
                    })),
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        onReviewed?.(
                            quiz.id,
                            Object.fromEntries(
                                orderedQuestions.map((question) => [
                                    question.id,
                                    reviewStatuses[question.id] === 'rejected'
                                        ? 'rejected'
                                        : 'approved',
                                ]),
                            ),
                            orderedQuestions.map((question) => question.id),
                        );
                        onOpenChange(false);
                        resolve();
                    },
                    onError: (errors) => {
                        setError(
                            errors.questions ||
                                errors.message ||
                                'Unable to save the quiz review.',
                        );
                        reject(new Error('Quiz review failed.'));
                    },
                    onFinish: () => setSaving(false),
                },
            );
        });
    };

    const saveReview = () => {
        if (saving) return;

        if (hasQuestionsToDelete) {
            setConfirmationOpen(true);
            return;
        }

        submitReview();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-3xl">
                <DialogHeader className="border-b border-border px-6 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-alpha/30 bg-alpha/10 text-alpha">
                            <Eye className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-foreground">
                                {quiz?.title || 'Untitled Quiz'}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {canReview
                                    ? 'Preview every question, verify its correct answer, and choose a review status.'
                                    : 'Preview every question and its correct answer.'}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3">
                        <Badge variant="outline">
                            Source: {formatLabel(quiz?.source)}
                        </Badge>
                        <Badge variant="outline">Status: {statusLabel}</Badge>
                        <Badge variant="outline">
                            Approved: {reviewStats.approved}
                        </Badge>
                        <Badge variant="outline">
                            Rejected: {reviewStats.rejected}
                        </Badge>
                        <Badge variant="outline">
                            Total: {reviewStats.total}
                        </Badge>
                    </div>
                </DialogHeader>

                {canReview && (
                    <div className="flex flex-wrap gap-2 border-b border-border px-6 py-3">
                        {[
                            { key: 'all', label: 'All Questions' },
                            { key: 'approved', label: 'Approved' },
                            { key: 'rejected', label: 'Rejected' },
                        ].map((tab) => {
                            const isActive = activeReviewTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveReviewTab(tab.key)}
                                    className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'border-alpha/40 bg-alpha/10 text-alpha'
                                            : 'border-border bg-background/50 text-muted-foreground hover:border-alpha/30 hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">
                    {reviewTabGroups.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-background/30 p-6 text-center text-sm text-muted-foreground">
                            No questions match this review filter.
                        </div>
                    ) : (
                        reviewTabGroups.map((group) => (
                            <div key={group.key} className="space-y-3">
                                {group.key === 'rejected' &&
                                    reviewStats.rejected > 0 &&
                                    activeReviewTab === 'all' && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-border" />
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                                {group.title} Questions ({reviewStats.rejected})
                                            </p>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                    )}

                                {group.questions.map((question) => (
                                    <div key={`question-${question.id}`} className="space-y-2">
                                        <article
                                            className={`rounded-xl border border-border bg-background/40 p-4 transition-all duration-200 ${
                                                draggedQuestionId === question.id
                                                    ? 'opacity-60'
                                                    : 'opacity-100'
                                            }`}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                if (
                                                    canReview &&
                                                    draggedQuestionId &&
                                                    draggedQuestionId !== question.id
                                                ) {
                                                    setDragOverQuestionId(question.id);
                                                }
                                            }}
                                            onDrop={(event) => {
                                                event.preventDefault();
                                                if (canReview && draggedQuestionId) {
                                                    moveQuestion(
                                                        draggedQuestionId,
                                                        question.id,
                                                    );
                                                }
                                            }}
                                            onDragLeave={() => {
                                                if (dragOverQuestionId === question.id) {
                                                    setDragOverQuestionId(null);
                                                }
                                            }}
                                        >
                                        <div className="flex items-start gap-3">
                                            {canReview && (
                                                <button
                                                    type="button"
                                                    draggable
                                                    aria-label={`Drag question ${orderedQuestions.findIndex((item) => item.id === question.id) + 1}`}
                                                    onDragStart={(event) => {
                                                        event.dataTransfer.effectAllowed = 'move';
                                                        event.dataTransfer.setData(
                                                            'text/plain',
                                                            String(question.id),
                                                        );
                                                        setDraggedQuestionId(question.id);
                                                    }}
                                                    onDragEnd={() => {
                                                        setDraggedQuestionId(null);
                                                        setDragOverQuestionId(null);
                                                    }}
                                                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all duration-200 hover:border-alpha/30 hover:bg-alpha/10 hover:text-alpha"
                                                >
                                                    <GripVertical className="size-4 cursor-grab" />
                                                </button>
                                            )}
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-alpha/10 text-xs font-bold text-alpha">
                                                {orderedQuestions.findIndex(
                                                    (item) => item.id === question.id,
                                                ) + 1}
                                            </span>
                                            <p className="pt-1 text-sm font-medium text-foreground">
                                                {question.text}
                                            </p>
                                        </div>

                                        <div className="mt-4 space-y-2 pl-10">
                                            {(question.answers || []).map(
                                                (answer, answerIndex) => (
                                                    <div
                                                        key={answer.id}
                                                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                                                            answer.is_correct
                                                                ? 'border-good/40 bg-good/10 text-good'
                                                                : 'border-border bg-card text-muted-foreground'
                                                        }`}
                                                    >
                                                        <span className="w-4 shrink-0 text-xs font-semibold">
                                                            {String.fromCharCode(
                                                                65 + answerIndex,
                                                            )}
                                                        </span>
                                                        <span className="flex-1">
                                                            {answer.text}
                                                        </span>
                                                        {answer.is_correct && (
                                                            <span className="flex items-center gap-1 text-xs font-semibold">
                                                                <CheckCircle2 className="size-4" />
                                                                Correct answer
                                                            </span>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {canReview && (
                                            <fieldset className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 pl-10">
                                                <legend className="sr-only">
                                                    Review question {orderedQuestions.findIndex((item) => item.id === question.id) + 1}
                                                </legend>
                                                {['approved', 'rejected'].map(
                                                    (status) => (
                                                        <label
                                                            key={status}
                                                            className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-review-${question.id}`}
                                                                value={status}
                                                                checked={
                                                                    reviewStatuses[
                                                                        question.id
                                                                    ] === status
                                                                }
                                                                onChange={() =>
                                                                    setReviewStatus(
                                                                        question.id,
                                                                        status,
                                                                    )
                                                                }
                                                                className="size-4 accent-alpha"
                                                            />
                                                            {formatLabel(status)}
                                                        </label>
                                                    ),
                                                )}
                                            </fieldset>
                                        )}
                                        </article>
                                        {canReview && dragOverQuestionId === question.id && (
                                            <div className="h-12 rounded-xl border border-dashed border-alpha/40 bg-alpha/5" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="border-t border-border px-6 py-4">
                    {error && (
                        <p className="mr-auto text-sm text-error">{error}</p>
                    )}
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        disabled={saving}
                    >
                        Close Preview
                    </Button>
                    {canReview && (
                        <Button
                            type="button"
                            onClick={saveReview}
                            disabled={saving}
                            className="bg-alpha font-semibold hover:bg-alpha/85"
                        >
                            {saving ? 'Saving Review…' : 'Save Review'}
                        </Button>
                    )}
                </DialogFooter>

                {canReview && (
                    <DeleteModal
                        open={confirmationOpen}
                        onOpenChange={setConfirmationOpen}
                        title="Save Quiz Review?"
                        description="Your review decisions will be saved for every question. Rejected questions will remain in the quiz."
                        cancelLabel="Cancel"
                        confirmLabel="Save Review"
                        loading={saving}
                        onConfirm={submitReview}
                        icon={CircleCheck}
                        iconClassName="bg-alpha/10 text-alpha"
                        confirmButtonClassName="bg-alpha font-semibold text-beta hover:bg-alpha/85"
                    >
                        {error && (
                            <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                                {error}
                            </p>
                        )}
                    </DeleteModal>
                )}
            </DialogContent>
        </Dialog>
    );
}

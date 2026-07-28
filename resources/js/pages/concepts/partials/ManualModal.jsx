import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    Loader2,
    PenLine,
    Plus,
    Trash2,
} from 'lucide-react';
import { TransText } from '@/components/TransText';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { store as manualStore } from '@/routes/quizes/manual';
import { update as updateQuiz } from '@/routes/quizes';

const uid = () => Math.random().toString(36).slice(2);

const createAnswer = () => ({ id: uid(), text: '' });

const createQuestion = () => ({
    id: uid(),
    text: '',
    answers: [createAnswer(), createAnswer()],
    correctId: null,
    correctIds: [],
});

const EMPTY_FORM = () => ({
    title: '',
    questions: [createQuestion()],
});

export default function ManualModal({
    open,
    onOpenChange,
    onCreated,
    topicId,
    conceptId,
    quiz = null,
}) {
    // console.log(topicId);

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const isEditing = Boolean(quiz);

    useEffect(() => {
        if (!open || !quiz) return;

        setForm({
            title: quiz.title || '',
            questions: quiz.questions.map((question) => ({
                id: question.id,
                text: question.text,
                answers: question.answers.map((answer) => ({
                    id: answer.id,
                    text: answer.text,
                })),
                correctIds: question.answers
                    .filter((answer) => answer.is_correct)
                    .map((answer) => answer.id),
            })),
        });
        setErrors({});
    }, [open, quiz]);

    const clearError = (key) =>
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });

    const reset = () => {
        setForm(EMPTY_FORM());
        setErrors({});
        setSubmitting(false);
    };

    const handleOpenChange = (nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
    };

    // ── Title ──────────────────────────────────────────────────────────────
    const setTitle = (title) => {
        setForm((prev) => ({ ...prev, title }));
        clearError('title');
    };

    // ── Question actions ───────────────────────────────────────────────────
    const updateQuestion = (qId, text) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === qId ? { ...q, text } : q,
            ),
        }));
        clearError(`q_${qId}`);
    };

    const removeQuestion = (qId) =>
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== qId),
        }));

    const addQuestion = () =>
        setForm((prev) => ({
            ...prev,
            questions: [...prev.questions, createQuestion()],
        }));

    // ── Answer actions ─────────────────────────────────────────────────────
    const updateAnswer = (qId, aId, text) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id !== qId
                    ? q
                    : {
                          ...q,
                          answers: q.answers.map((a) =>
                              a.id === aId ? { ...a, text } : a,
                          ),
                      },
            ),
        }));
        clearError(`a_${qId}_${aId}`);
    };

    const addAnswer = (qId) =>
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === qId
                    ? { ...q, answers: [...q.answers, createAnswer()] }
                    : q,
            ),
        }));

    const removeAnswer = (qId, aId) =>
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) => {
                if (q.id !== qId) return q;
                const answers = q.answers.filter((a) => a.id !== aId);
                return {
                    ...q,
                    answers,
                    correctId: q.correctId === aId ? null : q.correctId,
                    correctIds: (q.correctIds || []).filter(
                        (correctId) => correctId !== aId,
                    ),
                };
            }),
        }));

    const setCorrect = (qId, aId) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
                q.id === qId
                    ? {
                          ...q,
                          correctId: aId,
                          correctIds: [aId],
                      }
                    : q,
            ),
        }));
        clearError(`correct_${qId}`);
    };

    // ── Validation ─────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Quiz title is required.';

        form.questions.forEach((q) => {
            if (!q.text.trim())
                errs[`q_${q.id}`] = 'Question text is required.';
            if (!(q.correctIds || (q.correctId ? [q.correctId] : [])).length)
                errs[`correct_${q.id}`] = 'Mark the correct answer.';
            q.answers.forEach((a) => {
                if (!a.text.trim()) errs[`a_${q.id}_${a.id}`] = 'Required.';
            });
        });
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        if (!isEditing && !topicId && !conceptId) {
            setErrors((prev) => ({
                ...prev,
                topic_id:
                    'Please select a lesson or concept before creating the quiz.',
            }));
            return;
        }
        setSubmitting(true);

        const url = isEditing ? updateQuiz.url(quiz.id) : manualStore.url();
        const payload = {
            topic_id: topicId,
            concept_id: conceptId,
            title: form.title,
            questions: form.questions.map((question) => ({
                text: question.text,
                id:
                    isEditing && Number.isInteger(question.id)
                        ? question.id
                        : null,
                answers: question.answers.map((answer) => ({
                    text: answer.text,
                    id:
                        isEditing && Number.isInteger(answer.id)
                            ? answer.id
                            : null,
                })),
                correct_index: question.answers.findIndex(
                    (answer) => answer.id === question.correctId,
                ),
                correct_indices: question.answers
                    .map((answer, index) =>
                        (question.correctIds || []).includes(answer.id)
                            ? index
                            : null,
                    )
                    .filter((index) => index !== null),
            })),
        };
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onCreated?.();
                handleOpenChange(false);
            },
            onError: (backendErrors) => {
                setErrors((prev) => ({ ...prev, ...backendErrors }));
            },
            onFinish: () => setSubmitting(false),
        };

        if (isEditing) {
            router.put(url, payload, options);
            return;
        }

        router.post(url, payload, options);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
                {/* ── Header ── */}
                <DialogHeader className="border-b border-beta/10 px-6 py-5 dark:border-beta">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-alpha/10 text-beta dark:text-alpha">
                            <PenLine className="size-4" />
                        </span>
                        <div>
                            <DialogTitle>
                                <TransText
                                    en={
                                        isEditing
                                            ? 'Review / Edit Quiz'
                                            : 'Create Quiz Manually'
                                    }
                                    fr="Créer un Quiz Manuellement"
                                    ar="إنشاء اختبار يدويًا"
                                />
                            </DialogTitle>
                            <DialogDescription>
                                <TransText
                                    en="Add questions with multiple answers and mark the correct one for each."
                                    fr="Ajoutez des questions avec plusieurs réponses et marquez la bonne."
                                    ar="أضف أسئلة بإجابات متعددة وحدد الإجابة الصحيحة لكل سؤال."
                                />
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* ── Scrollable body ── */}
                <form
                    id="manual-quiz-form"
                    onSubmit={handleSubmit}
                    className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-6 py-5"
                >
                    {/* Quiz title */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-beta dark:text-light">
                            <TransText
                                en="Quiz Title"
                                fr="Titre du Quiz"
                                ar="عنوان الاختبار"
                            />
                            <span className="ml-0.5 text-error">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. JavaScript Fundamentals"
                            className={[
                                'w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-beta placeholder:text-beta/40 focus:ring-2 focus:outline-none dark:text-light dark:placeholder:text-light/30',
                                errors.title
                                    ? 'border-error focus:ring-error/20'
                                    : 'border-beta/20 focus:border-alpha/50 focus:ring-alpha/15 dark:border-beta dark:focus:border-alpha/60',
                            ].join(' ')}
                        />
                        {(errors.topic_id || errors.concept_id) && (
                            <p className="text-xs text-error">
                                {errors.topic_id || errors.concept_id}
                            </p>
                        )}
                    </div>

                    {/* Questions list */}
                    <div className="space-y-4">
                        {form.questions.map((q, qIdx) => (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                index={qIdx}
                                errors={errors}
                                canRemove={form.questions.length > 1}
                                onUpdateQuestion={updateQuestion}
                                onRemoveQuestion={removeQuestion}
                                onUpdateAnswer={updateAnswer}
                                onAddAnswer={addAnswer}
                                onRemoveAnswer={removeAnswer}
                                onSetCorrect={setCorrect}
                            />
                        ))}
                    </div>

                    {/* Add Question */}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-beta/15 py-3 text-sm text-beta/50 transition-colors hover:border-alpha/40 hover:text-alpha dark:border-beta/40 dark:text-light/40 dark:hover:border-alpha/50 dark:hover:text-alpha"
                    >
                        <Plus className="size-4" />
                        <TransText
                            en="Add Question"
                            fr="Ajouter une Question"
                            ar="إضافة سؤال"
                        />
                    </button>
                </form>

                {/* ── Footer ── */}
                <div className="shrink-0 border-t border-beta/10 dark:border-beta">
                    <DialogFooter className="flex items-center justify-between gap-2 px-6 py-4 sm:justify-between">
                        <p className="text-xs text-beta/40 dark:text-light/40">
                            {form.questions.length}{' '}
                            <TransText
                                en="question(s)"
                                fr="question(s)"
                                ar="سؤال/أسئلة"
                            />
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-beta/20 text-beta/70 dark:border-light/20 dark:text-light/70"
                                onClick={() => handleOpenChange(false)}
                                disabled={submitting}
                            >
                                <TransText
                                    en="Cancel"
                                    fr="Annuler"
                                    ar="إلغاء"
                                />
                            </Button>
                            <Button
                                type="submit"
                                form="manual-quiz-form"
                                disabled={submitting}
                                className="gap-1.5 bg-alpha font-semibold hover:bg-alpha/85 disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <TransText
                                            en="Saving…"
                                            fr="Enregistrement…"
                                            ar="جارٍ الحفظ…"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Plus className="size-4" />
                                        <TransText
                                            en={
                                                isEditing
                                                    ? 'Save Quiz'
                                                    : 'Create Quiz'
                                            }
                                            fr="Créer le Quiz"
                                            ar="إنشاء الاختبار"
                                        />
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Extracted sub-component to keep ManualModal readable ──────────────────
function QuestionCard({
    question,
    index,
    errors,
    canRemove,
    onUpdateQuestion,
    onRemoveQuestion,
    onUpdateAnswer,
    onAddAnswer,
    onRemoveAnswer,
    onSetCorrect,
}) {
    return (
        <div className="space-y-3 rounded-xl border border-beta/10 bg-beta/[0.02] p-4 dark:border-beta dark:bg-dark">
            {/* Question text row */}
            <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-alpha/10 text-xs font-bold text-beta dark:text-alpha">
                    {index + 1}
                </span>
                <input
                    type="text"
                    value={question.text}
                    onChange={(e) =>
                        onUpdateQuestion(question.id, e.target.value)
                    }
                    placeholder="Enter question text…"
                    className={[
                        'flex-1 rounded-lg border bg-transparent px-3 py-1.5 text-sm text-beta placeholder:text-beta/40 focus:ring-2 focus:outline-none dark:text-light dark:placeholder:text-light/30',
                        errors[`q_${question.id}`]
                            ? 'border-error focus:ring-error/20'
                            : 'border-beta/20 focus:border-alpha/50 focus:ring-alpha/15 dark:border-beta dark:focus:border-alpha/60',
                    ].join(' ')}
                />
                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemoveQuestion(question.id)}
                        className="shrink-0 rounded-md p-1 text-beta/30 transition-colors hover:text-error dark:text-light/30 dark:hover:text-error"
                    >
                        <Trash2 className="size-4" />
                    </button>
                )}
            </div>

            {/* Validation errors for question */}
            {errors[`q_${question.id}`] && (
                <p className="pl-8 text-xs text-error">
                    {errors[`q_${question.id}`]}
                </p>
            )}
            {errors[`correct_${question.id}`] && (
                <p className="pl-2 text-xs text-error">
                    {errors[`correct_${question.id}`]}
                </p>
            )}

            {/* Answers */}
            <div className="space-y-2 pl-2">
                {question.answers.map((answer, aIdx) => {
                    const isCorrect = (
                        question.correctIds ||
                        (question.correctId ? [question.correctId] : [])
                    ).includes(answer.id);
                    return (
                        <div
                            key={answer.id}
                            className="flex items-center gap-2"
                        >
                            {/* Correct-answer toggle */}
                            <button
                                type="button"
                                onClick={() =>
                                    onSetCorrect(question.id, answer.id)
                                }
                                title="Mark as correct answer"
                                className={`shrink-0 transition-colors ${
                                    isCorrect
                                        ? 'text-good'
                                        : 'text-beta/25 hover:text-alpha dark:text-light/25 dark:hover:text-alpha'
                                }`}
                            >
                                {isCorrect ? (
                                    <CheckCircle2 className="size-[18px]" />
                                ) : (
                                    <Circle className="size-[18px]" />
                                )}
                            </button>

                            {/* Letter label */}
                            <span className="w-4 shrink-0 text-xs font-semibold text-beta/40 dark:text-light/30">
                                {String.fromCharCode(65 + aIdx)}
                            </span>

                            {/* Answer input */}
                            <input
                                type="text"
                                value={answer.text}
                                onChange={(e) =>
                                    onUpdateAnswer(
                                        question.id,
                                        answer.id,
                                        e.target.value,
                                    )
                                }
                                placeholder={`Answer ${String.fromCharCode(65 + aIdx)}…`}
                                className={[
                                    'flex-1 rounded-lg border bg-transparent px-3 py-1.5 text-sm text-beta placeholder:text-beta/40 focus:ring-2 focus:outline-none dark:text-light dark:placeholder:text-light/30',
                                    errors[`a_${question.id}_${answer.id}`]
                                        ? 'border-error focus:ring-error/20'
                                        : isCorrect
                                          ? 'border-good/40 bg-good/5 focus:border-good/60 focus:ring-good/10 dark:bg-good/5'
                                          : 'border-beta/15 focus:border-alpha/50 focus:ring-alpha/10 dark:border-beta/60 dark:focus:border-alpha/60',
                                ].join(' ')}
                            />

                            {/* Remove answer (keep minimum 2) */}
                            {question.answers.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveAnswer(question.id, answer.id)
                                    }
                                    className="shrink-0 rounded-md p-0.5 text-beta/25 transition-colors hover:text-error dark:text-light/25 dark:hover:text-error"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Add answer */}
                <button
                    type="button"
                    onClick={() => onAddAnswer(question.id)}
                    className="flex items-center gap-1.5 pt-1 pl-1 text-xs text-alpha/70 transition-colors hover:text-alpha"
                >
                    <Plus className="size-3.5" />
                    <TransText
                        en="Add answer"
                        fr="Ajouter une réponse"
                        ar="إضافة إجابة"
                    />
                </button>
            </div>
        </div>
    );
}

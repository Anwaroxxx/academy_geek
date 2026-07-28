<?php

namespace App\Http\Controllers;

use App\Models\Concept;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Topic;
use App\Models\User;
use App\Services\QuizAiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Smalot\PdfParser\Parser;

class QuizController extends Controller
{
    public function index()
    {
        return Inertia::render('quizes/index', [
            'topics' => Topic::query()
                ->select('id', 'title')
                ->orderBy('title')
                ->get(),

            'quizzes' => Quiz::query()
                ->withCount('questions')
                ->latest()
                ->get([
                    'id',
                    'topic_id',
                    'concept_id',
                    'title',
                    'description',
                    'passing_score',
                    'xp_reward',
                    'order_index',
                    'created_at',
                    'source',
                    'status',
                ]),
        ]);
    }

    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.text' => ['required', 'string'],
            'questions.*.answers' => ['required', 'array', 'min:2'],
            'questions.*.answers.*.text' => ['required', 'string'],
            'questions.*.correct_index' => ['required', 'integer', 'min:0'],
            'topic_id' => ['nullable', 'exists:topics,id', 'required_without:concept_id'],
            'concept_id' => ['nullable', 'exists:concepts,id', 'required_without:topic_id'],
        ]);

        $topic = isset($validated['topic_id']) ? Topic::findOrFail($validated['topic_id']) : null;
        $concept = isset($validated['concept_id']) ? Concept::findOrFail($validated['concept_id']) : null;
        $orderIndex = $topic
            ? ((int) Quiz::where('topic_id', $topic->id)->max('order_index')) + 1
            : ((int) Quiz::where('concept_id', $concept->id)->max('order_index')) + 1;

        DB::transaction(function () use ($request, $validated, $topic, $concept, $orderIndex) {
            $quiz = Quiz::create([
                'topic_id' => $topic?->id,
                'concept_id' => $concept?->id,
                'title' => $validated['title'],
                'description' => null,
                'passing_score' => 70,
                'xp_reward' => 0,
                'order_index' => $orderIndex,
                'source' => 'manual',
                'status' => 'approved',
            ]);

            foreach ($validated['questions'] as $questionIndex => $questionData) {
                $question = new QuizQuestion([
                    'quiz_id' => $quiz->id,
                    'question_text' => $questionData['text'],
                    'order_index' => $questionIndex + 1,
                ]);

                $question->save();

                foreach ($questionData['answers'] as $answerIndex => $answerData) {
                    QuizOption::create([
                        'question_id' => $question->id,
                        'option_text' => $answerData['text'],
                        'is_correct' => $answerIndex === $questionData['correct_index'],
                        'order_index' => $answerIndex + 1,
                    ]);
                }
            }

            $this->syncQuestionReviewMetadata($quiz, 'approved', $request->user()->id);
        });

        return back();
    }

    public function generateWithAi(Request $request, QuizAiService $quizAiService)
    {
        $validated = $request->validate([
            'topic_id' => ['nullable', 'exists:topics,id', 'required_without:concept_id'],
            'concept_id' => ['nullable', 'exists:concepts,id', 'required_without:topic_id'],
            'topic' => ['required', 'string', 'min:3', 'max:2000'],
        ]);

        $topic = isset($validated['topic_id']) ? Topic::findOrFail($validated['topic_id']) : null;
        $concept = isset($validated['concept_id']) ? Concept::findOrFail($validated['concept_id']) : null;
        $orderIndex = $topic
            ? ((int) Quiz::where('topic_id', $topic->id)->max('order_index')) + 1
            : ((int) Quiz::where('concept_id', $concept->id)->max('order_index')) + 1;

        try {
            $data = $quizAiService->generate($validated['topic']);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'topic' => $e->getMessage(),
            ]);
        }

        DB::transaction(function () use ($data, $topic, $concept, $orderIndex) {
            $quiz = Quiz::create([
                'topic_id' => $topic?->id,
                'concept_id' => $concept?->id,
                'title' => $data['title'] ?? 'AI Generated Quiz',
                'description' => null,
                'passing_score' => 70,
                'xp_reward' => 0,
                'order_index' => $orderIndex,
                'source' => 'ai',
                'status' => 'pending_review',
            ]);

            foreach ($data['questions'] as $questionIndex => $questionData) {
                $question = new QuizQuestion([
                    'quiz_id' => $quiz->id,
                    'question_text' => $questionData['question'],
                    'order_index' => $questionIndex + 1,
                ]);

                if (Schema::hasColumn('quiz_questions', 'status')) {
                    $question->forceFill([
                        'status' => 'approved',
                    ]);
                }
                if (Schema::hasColumn('quiz_questions', 'level')) {
                    $question->forceFill([
                        'level' => $questionData['level'] ?? 'easy',
                    ]);
                }
                if (Schema::hasColumn('quiz_questions', 'type')) {
                    $question->forceFill([
                        'type' => $questionData['type'] ?? 'mcq',
                    ]);
                }

                $question->save();

                $correctAnswers = $questionData['correct_answer'] ?? [];
                if (! is_array($correctAnswers)) {
                    $correctAnswers = [$correctAnswers];
                }
                $options = $questionData['options'] ?? [];

                if (($questionData['type'] ?? '') === 'true_false') {
                    $options = ['True', 'False'];
                }
                if (($questionData['type'] ?? '') === 'fill_blank' && empty($options)) {
                    $options = $correctAnswers;
                }

                foreach ($options as $optionIndex => $optionText) {
                    $isCorrect = ($questionData['type'] ?? '') === 'true_false'
                        ? ($optionText === 'True') === ($correctAnswers[0] ?? null)
                        : in_array($optionText, $correctAnswers, true)
                            || in_array((string) $optionText, array_map('strval', $correctAnswers), true);

                    QuizOption::create([
                        'question_id' => $question->id,
                        'option_text' => is_bool($optionText)
                            ? ($optionText ? 'True' : 'False')
                            : (string) $optionText,
                        'is_correct' => $isCorrect,
                        'order_index' => $optionIndex + 1,
                    ]);
                }
            }

            $this->syncQuestionReviewMetadata($quiz, 'pending');
        });

        return back()->with('success', 'AI quiz generated successfully.');
    }

    public function generateFromFile(Request $request, QuizAiService $quizAiService)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'topic_id' => ['nullable', 'exists:topics,id', 'required_without:concept_id'],
            'concept_id' => ['nullable', 'exists:concepts,id', 'required_without:topic_id'],
        ]);

        $topic = isset($validated['topic_id']) ? Topic::findOrFail($validated['topic_id']) : null;
        $concept = isset($validated['concept_id']) ? Concept::findOrFail($validated['concept_id']) : null;
        $orderIndex = $topic
            ? ((int) Quiz::where('topic_id', $topic->id)->max('order_index')) + 1
            : ((int) Quiz::where('concept_id', $concept->id)->max('order_index')) + 1;

        try {
            $pdfContent = (new Parser)
                ->parseFile($validated['file']->getPathname())
                ->getText();
            $pdfContent = trim(preg_replace('/[\x{0000}-\x{0008}\x{000B}\x{000C}\x{000E}-\x{001F}\x{007F}]/u', '', $pdfContent) ?? '');

            if ($pdfContent === '' || preg_match('/[\pL\pN]/u', $pdfContent) !== 1) {
                return back()->withErrors([
                    'file' => 'No readable text was found in this PDF. Scanned or image-only PDFs are not supported yet.',
                ]);
            }

            $data = $quizAiService->generateFromPdf(mb_substr($pdfContent, 0, 50000));
        } catch (\Throwable $e) {
            return back()->withErrors([
                'file' => $e->getMessage(),
            ]);
        }

        DB::transaction(function () use ($data, $topic, $concept, $orderIndex) {
            $quiz = Quiz::create([
                'topic_id' => $topic?->id,
                'concept_id' => $concept?->id,
                'title' => $data['title'],
                'description' => null,
                'passing_score' => 70,
                'xp_reward' => 0,
                'order_index' => $orderIndex,
                'source' => 'pdf',
                'status' => 'pending_review',
            ]);

            foreach ($data['questions'] as $questionIndex => $questionData) {
                $question = new QuizQuestion([
                    'quiz_id' => $quiz->id,
                    'question_text' => $questionData['question'],
                    'order_index' => $questionIndex + 1,
                ]);

                if (Schema::hasColumn('quiz_questions', 'status')) {
                    $question->forceFill(['status' => 'approved']);
                }
                if (Schema::hasColumn('quiz_questions', 'level')) {
                    $question->forceFill(['level' => $questionData['level']]);
                }
                if (Schema::hasColumn('quiz_questions', 'type')) {
                    $question->forceFill(['type' => $questionData['type']]);
                }

                $question->save();

                $correctAnswers = $questionData['correct_answer'];
                $options = $questionData['options'] ?? [];

                if ($questionData['type'] === 'true_false') {
                    $options = ['True', 'False'];
                }
                if ($questionData['type'] === 'fill_blank' && empty($options)) {
                    $options = $correctAnswers;
                }

                foreach ($options as $optionIndex => $optionText) {
                    $isCorrect = $questionData['type'] === 'true_false'
                        ? ($optionText === 'True') === $correctAnswers[0]
                        : in_array($optionText, $correctAnswers, true)
                            || in_array((string) $optionText, array_map('strval', $correctAnswers), true);

                    QuizOption::create([
                        'question_id' => $question->id,
                        'option_text' => is_bool($optionText)
                            ? ($optionText ? 'True' : 'False')
                            : (string) $optionText,
                        'is_correct' => $isCorrect,
                        'order_index' => $optionIndex + 1,
                    ]);
                }
            }

            $this->syncQuestionReviewMetadata($quiz, 'pending');
        });

        return back()->with('success', 'PDF quiz generated successfully.');
    }

    public function update(Request $request, Quiz $quiz)
    {
        $this->ensureCanManageQuiz($request, $quiz);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.id' => ['nullable', 'integer'],
            'questions.*.text' => ['required', 'string'],
            'questions.*.answers' => ['required', 'array', 'min:1'],
            'questions.*.answers.*.id' => ['nullable', 'integer'],
            'questions.*.answers.*.text' => ['required', 'string'],
            'questions.*.correct_indices' => ['required', 'array', 'min:1'],
            'questions.*.correct_indices.*' => ['integer', 'min:0'],
        ]);

        $existingQuestions = $quiz->questions()
            ->with('options:id,question_id')
            ->get()
            ->keyBy('id');
        $submittedQuestionIds = collect($validated['questions'])
            ->pluck('id')
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id);

        if ($submittedQuestionIds->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages([
                'questions' => 'The same question cannot be submitted more than once.',
            ]);
        }

        if ($submittedQuestionIds->diff($existingQuestions->keys())->isNotEmpty()) {
            throw ValidationException::withMessages([
                'questions' => 'One or more questions do not belong to this quiz.',
            ]);
        }

        foreach ($validated['questions'] as $questionIndex => $questionData) {
            $existingQuestion = ! empty($questionData['id'])
                ? $existingQuestions->get((int) $questionData['id'])
                : null;
            $submittedOptionIds = collect($questionData['answers'])
                ->pluck('id')
                ->filter(fn ($id) => is_numeric($id))
                ->map(fn ($id) => (int) $id);
            $existingOptionIds = $existingQuestion?->options->pluck('id') ?? collect();

            if ($submittedOptionIds->duplicates()->isNotEmpty()) {
                throw ValidationException::withMessages([
                    "questions.$questionIndex.answers" => 'The same option cannot be submitted more than once.',
                ]);
            }

            if ($submittedOptionIds->diff($existingOptionIds)->isNotEmpty()) {
                throw ValidationException::withMessages([
                    "questions.$questionIndex.answers" => 'One or more options do not belong to this question.',
                ]);
            }

            $minimumOptions = $existingQuestion && $existingOptionIds->count() === 1 ? 1 : 2;
            if (count($questionData['answers']) < $minimumOptions) {
                throw ValidationException::withMessages([
                    "questions.$questionIndex.answers" => "This question must have at least $minimumOptions options.",
                ]);
            }

            if (collect($questionData['correct_indices'])->contains(
                fn ($index) => $index >= count($questionData['answers'])
            )) {
                throw ValidationException::withMessages([
                    "questions.$questionIndex.correct_indices" => 'Select a correct answer from the remaining options.',
                ]);
            }
        }

        DB::transaction(function () use ($request, $quiz, $validated, $submittedQuestionIds) {
            $quiz->update(['title' => $validated['title']]);
            $quiz->questions()->whereNotIn('id', $submittedQuestionIds)->delete();
            $quiz->questions()->update([
                'order_index' => DB::raw('order_index + 1000'),
            ]);

            foreach ($validated['questions'] as $questionIndex => $questionData) {
                $question = ! empty($questionData['id'])
                    ? $quiz->questions()->whereKey($questionData['id'])->firstOrFail()
                    : $quiz->questions()->make();

                $question->fill([
                    'question_text' => $questionData['text'],
                    'order_index' => $questionIndex + 1,
                ]);

                if (! $question->exists
                    && $quiz->source !== 'manual'
                    && Schema::hasColumn('quiz_questions', 'status')) {
                    $question->forceFill(['status' => 'approved']);
                }

                $question->save();
                $submittedOptionIds = collect($questionData['answers'])
                    ->pluck('id')
                    ->filter(fn ($id) => is_numeric($id))
                    ->map(fn ($id) => (int) $id);
                $question->options()->whereNotIn('id', $submittedOptionIds)->delete();
                $question->options()->update([
                    'order_index' => DB::raw('order_index + 1000'),
                ]);

                foreach ($questionData['answers'] as $answerIndex => $answerData) {
                    $option = ! empty($answerData['id'])
                        ? $question->options()->whereKey($answerData['id'])->firstOrFail()
                        : $question->options()->make();

                    $option->fill([
                        'option_text' => $answerData['text'],
                        'is_correct' => in_array($answerIndex, $questionData['correct_indices'], true),
                        'order_index' => $answerIndex + 1,
                    ])->save();
                }
            }

            if ($quiz->source === 'manual') {
                $quiz->update(['status' => 'approved']);
                $this->syncQuestionReviewMetadata($quiz, 'approved', $request->user()->id);
            }
        });

        return back()->with('success', 'Quiz updated successfully.');
    }

    public function review(Request $request, Quiz $quiz)
    {
        $this->ensureCanManageQuiz($request, $quiz);

        $canReview = in_array($quiz->source, ['ai', 'pdf'], true)
            && in_array($quiz->status, ['pending_review', 'approved'], true);

        if (! $canReview) {
            throw ValidationException::withMessages([
                'questions' => 'Only AI or PDF quizzes can be reviewed.',
            ]);
        }

        $validated = $request->validate([
            'questions' => ['required', 'array'],
            'questions.*.id' => ['required', 'integer'],
            'questions.*.status' => ['nullable', 'in:approved,rejected'],
        ]);

        DB::transaction(function () use ($request, $quiz, $validated) {
            $questionIds = $quiz->questions()
                ->lockForUpdate()
                ->pluck('id');
            $submittedQuestions = collect($validated['questions']);
            $submittedQuestionIds = $submittedQuestions
                ->pluck('id')
                ->map(fn ($questionId) => (int) $questionId);

            if ($submittedQuestionIds->duplicates()->isNotEmpty()
                || $submittedQuestionIds->diff($questionIds)->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'questions' => 'One or more questions do not belong to this quiz.',
                ]);
            }

            $reviewedAt = now();
            $existingReviewData = json_decode($quiz->description ?? '', true);
            $quizDescription = is_array($existingReviewData)
                && array_key_exists('question_reviews', $existingReviewData)
                    ? ($existingReviewData['description'] ?? null)
                    : $quiz->description;

            $reviewStatuses = $submittedQuestions
                ->mapWithKeys(fn ($question) => [
                    (int) $question['id'] => ($question['status'] ?? 'approved') === 'rejected'
                        ? 'rejected'
                        : 'approved',
                ])
                ->all();

            $submittedQuestionIds = $submittedQuestions
                ->pluck('id')
                ->map(fn ($questionId) => (int) $questionId)
                ->values();

            $questionOrdering = $submittedQuestionIds->all();

            $quiz->questions()->update([
                'order_index' => DB::raw('order_index + 1000'),
            ]);

            foreach ($questionOrdering as $questionIndex => $questionId) {
                $quiz->questions()->whereKey($questionId)->update([
                    'order_index' => $questionIndex + 1,
                ]);
            }

            if (Schema::hasColumns('quiz_questions', ['status', 'reviewed_by', 'reviewed_at'])) {
                $quiz->questions()->get()->each(function ($question) use ($reviewStatuses, $request, $reviewedAt) {
                    $question->update([
                        'status' => $reviewStatuses[$question->id] ?? 'approved',
                        'reviewed_by' => $request->user()->id,
                        'reviewed_at' => $reviewedAt,
                    ]);
                });
            }

            $quiz->update([
                'status' => 'approved',
                'description' => json_encode([
                    'description' => $quizDescription,
                    'question_reviews' => collect($reviewStatuses)
                        ->mapWithKeys(fn ($status, $questionId) => [
                            (string) $questionId => [
                                'status' => $status,
                                'reviewed_by' => $request->user()->id,
                                'reviewed_at' => $reviewedAt->toIso8601String(),
                            ],
                        ])
                        ->all(),
                ]),
            ]);
        });

        return back()->with('success', 'Quiz review saved successfully.');
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        $this->ensureCanManageQuiz($request, $quiz);

        try {
            $quiz->delete();
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'quiz' => 'Unable to delete the quiz. Please try again.',
            ]);
        }

        return back()->with('success', 'Quiz deleted successfully.');
    }

    private function syncQuestionReviewMetadata(Quiz $quiz, string $status, ?int $reviewedBy = null): void
    {
        $questionIds = $quiz->questions()->pluck('id');
        $reviewedAt = $status === 'approved' ? now() : null;

        $effectiveStatus = $status === 'pending' ? 'approved' : $status;

        if (Schema::hasColumn('quiz_questions', 'status')) {
            $quiz->questions()->update(['status' => $effectiveStatus]);
        }

        if ($reviewedAt && Schema::hasColumns('quiz_questions', ['reviewed_by', 'reviewed_at'])) {
            $quiz->questions()->update([
                'reviewed_by' => $reviewedBy,
                'reviewed_at' => $reviewedAt,
            ]);
        }

        $existingReviewData = json_decode($quiz->description ?? '', true);
        $quizDescription = is_array($existingReviewData)
            && array_key_exists('question_reviews', $existingReviewData)
                ? ($existingReviewData['description'] ?? null)
                : $quiz->description;

        $quiz->update([
            'description' => json_encode([
                'description' => $quizDescription,
                'question_reviews' => $questionIds->mapWithKeys(fn ($questionId) => [
                    (string) $questionId => [
                        'status' => $status,
                        'reviewed_by' => $reviewedBy,
                        'reviewed_at' => $reviewedAt?->toIso8601String(),
                    ],
                ])->all(),
            ]),
        ]);
    }

    private function ensureCanManageQuiz(Request $request, Quiz $quiz): void
    {
        $manager = $request->user();
        abort_unless($manager instanceof User, 403);
        abort_unless($manager->Roles()->whereIn('role', ['admin', 'coach', 'super_admin'])->exists(), 403);

        $quiz->loadMissing(['topic.concept.course', 'concept.course']);
        $course = $quiz->topic?->concept?->course ?? $quiz->concept?->course;

        abort_unless($course && (int) $course->created_by === (int) $manager->id, 403);
    }
}

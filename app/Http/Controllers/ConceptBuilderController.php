<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateConceptBuilderRequest;
use App\Models\Concept;
use App\Models\Quiz;
use App\Models\Topic;
use App\Models\TopicResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConceptBuilderController extends Controller
{
    private const RESOURCE_UPLOAD_DIRECTORY = 'topic-resources';

    public function edit(Request $request, Concept $concept)
    {
        $this->ensureCanManageConcept($request, $concept);

        $concept->load([
            'topics' => fn ($query) => $query->orderBy('order_index'),
            'topics.lessons' => fn ($query) => $query->orderBy('order_index'),
            'topics.resources',
            'topics.quizzes' => fn ($query) => $query
                ->with(['questions' => fn ($questionQuery) => $questionQuery
                    ->with(['options' => fn ($optionQuery) => $optionQuery->orderBy('order_index')])
                    ->orderBy('order_index')])
                ->withCount('questions')
                ->latest(),
            'topics.exercises',
        ]);

        $conceptQuizzes = Quiz::query()
            ->where('concept_id', $concept->id)
            ->whereNull('topic_id')
            ->with(['questions' => fn ($questionQuery) => $questionQuery
                ->with(['options' => fn ($optionQuery) => $optionQuery->orderBy('order_index')])
                ->orderBy('order_index')])
            ->withCount('questions')
            ->latest()
            ->get();

        return Inertia::render('concepts/index', [
            'concept' => [
                'id' => $concept->id,
                'course_id' => $concept->course_id,
                'title' => $concept->title,
                'description' => $concept->description,
            ],
            'topics' => $concept->topics->map(fn (Topic $topic) => $this->transformTopic($topic))->values(),
            'quizzes' => $concept->topics
                ->flatMap(fn (Topic $topic) => $topic->quizzes)
                ->concat($conceptQuizzes)
                ->map(function ($quiz) {
                    $reviewData = json_decode($quiz->description ?? '', true);
                    $questionReviews = is_array($reviewData)
                        ? ($reviewData['question_reviews'] ?? [])
                        : [];

                    return [
                        'id' => $quiz->id,
                        'topic_id' => $quiz->topic_id,
                        'concept_id' => $quiz->concept_id,
                        'title' => $quiz->title,
                        'passing_score' => $quiz->passing_score,
                        'source' => $quiz->source,
                        'status' => $quiz->status,
                        'questions_count' => $quiz->questions_count,
                        'created_at' => $quiz->created_at,
                        'questions' => $quiz->questions->map(fn ($question) => [
                            'id' => $question->id,
                            'text' => $question->question_text,
                            'status' => $question->status
                                ?: (is_array($questionReviews[(string) $question->id] ?? null)
                                    ? ($questionReviews[(string) $question->id]['status'] ?? null)
                                    : ($questionReviews[(string) $question->id] ?? null)),
                            'answers' => $question->options->map(fn ($option) => [
                                'id' => $option->id,
                                'text' => $option->option_text,
                                'is_correct' => $option->is_correct,
                            ])->values(),
                        ])->values(),
                    ];
                })
                ->values(),
        ]);
    }

    public function update(UpdateConceptBuilderRequest $request, Concept $concept)
    {
        $this->ensureCanManageConcept($request, $concept);

        $validated = $request->validated();

        DB::transaction(function () use ($concept, $validated) {
            $this->syncTopics($concept, $validated['topics'] ?? []);
        });

        return redirect()
            ->route('concept.edit', $concept)
            ->with('success', 'Concept content saved.');
    }

    private function syncTopics(Concept $concept, array $topics): void
    {
        $submittedTopicIds = collect($topics)
            ->pluck('id')
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->values();

        $concept->topics()
            ->when(
                $submittedTopicIds->isNotEmpty(),
                fn ($query) => $query->whereNotIn('id', $submittedTopicIds),
                fn ($query) => $query
            )
            ->delete();

        $temporaryOrderBase = ((int) $concept->topics()->max('order_index')) + 1000;

        $concept->topics()
            ->whereIn('id', $submittedTopicIds)
            ->get(['id'])
            ->each(function (Topic $topic, int $index) use ($temporaryOrderBase) {
                $topic->forceFill([
                    'order_index' => $temporaryOrderBase + $index + 1,
                ])->save();
            });

        foreach (array_values($topics) as $index => $topicData) {
            $topic = null;

            if (! empty($topicData['id'])) {
                $topic = $concept->topics()
                    ->whereKey($topicData['id'])
                    ->first();
            }

            if (! $topic) {
                $topic = new Topic(['concept_id' => $concept->id]);
            }

            $topic->fill([
                'title' => $topicData['title'],
                'description' => $topicData['description'] ?? null,
                'order_index' => $index + 1,
            ]);
            $topic->concept_id = $concept->id;
            $topic->save();

            $this->syncMainLesson($topic, $topicData);
            $this->syncResources($topic, $topicData['resources'] ?? []);
        }
    }

    private function syncMainLesson(Topic $topic, array $topicData): void
    {
        $lesson = $topic->lessons()
            ->orderBy('order_index')
            ->first();

        $topic->lessons()->updateOrCreate(
            ['id' => $lesson?->id],
            [
                'title' => $topic->title ?: 'Lesson',
                'description' => $topic->description,
                'content_type' => 'mixed',
                'content' => $topicData['theory'] ?? null,
                'content_url' => $topicData['videoUrl'] ?? null,
                'duration_minutes' => $topicData['duration_minutes'] ?? null,
                'order_index' => 1,
            ]
        );
    }

    private function syncResources(Topic $topic, array $resources): void
    {
        $keptResourceIds = [];

        foreach (array_values($resources) as $index => $resourceData) {
            $resource = null;

            if (! empty($resourceData['id'])) {
                $resource = $topic->resources()
                    ->whereKey($resourceData['id'])
                    ->first();
            }

            if (! $resource) {
                $resource = $topic->resources()->make();
            }

            $originalUrl = $resource->url;
            $uploadedFile = $resourceData['file'] ?? null;
            $type = $resourceData['type'];
            $name = $resourceData['name'];
            $url = $resourceData['url'] ?? null;
            $meta = $resourceData['meta'] ?? null;

            if ($uploadedFile instanceof UploadedFile) {
                if ($resource->exists) {
                    $this->deleteResourceFileIfOwned($resource->url);
                }

                $path = $uploadedFile->store(self::RESOURCE_UPLOAD_DIRECTORY, 'public');

                $type = 'file';
                $name = $uploadedFile->getClientOriginalName();
                $url = Storage::disk('public')->url($path);
                $meta = $this->uploadedFileMeta($uploadedFile);
            }

            if (! $uploadedFile instanceof UploadedFile && $resource->exists && $originalUrl !== $url) {
                $this->deleteResourceFileIfOwned($originalUrl);
            }

            $resource->fill([
                'type' => $type,
                'name' => $name,
                'url' => $url,
                'meta' => $meta,
                'order_index' => $index + 1,
            ]);
            $resource->topic_id = $topic->id;
            $resource->save();

            $keptResourceIds[] = $resource->id;
        }

        $resourcesToDelete = $topic->resources();

        if ($keptResourceIds !== []) {
            $resourcesToDelete->whereNotIn('id', $keptResourceIds);
        }

        $resourcesToDelete->get()->each(function (TopicResource $resource) {
            $this->deleteResourceFileIfOwned($resource->url);
            $resource->delete();
        });
    }

    private function uploadedFileMeta(UploadedFile $file): string
    {
        $mimeType = $file->getClientMimeType() ?: 'File';
        $size = $file->getSize();

        if (! $size) {
            return $mimeType;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $exponent = min((int) floor(log($size, 1024)), count($units) - 1);
        $value = $size / (1024 ** $exponent);
        $precision = $value >= 10 || $exponent === 0 ? 0 : 1;

        return $mimeType.' - '.round($value, $precision).' '.$units[$exponent];
    }

    private function deleteResourceFileIfOwned(?string $url): void
    {
        $path = $this->ownedResourceStoragePath($url);

        if (! $path) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    private function ownedResourceStoragePath(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);
        $host = parse_url($url, PHP_URL_HOST);
        $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);

        if ($scheme && $host !== $appHost) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $publicPrefix = '/storage/'.self::RESOURCE_UPLOAD_DIRECTORY.'/';

        if (! str_starts_with($path, $publicPrefix)) {
            return null;
        }

        $storagePath = urldecode(ltrim(substr($path, strlen('/storage/')), '/'));

        if (
            ! str_starts_with($storagePath, self::RESOURCE_UPLOAD_DIRECTORY.'/')
            || str_contains($storagePath, '..')
            || str_contains($storagePath, '\\')
        ) {
            return null;
        }

        return $storagePath;
    }

    private function ensureCanManageConcept(Request $request, Concept $concept): void
    {
        $concept->loadMissing('course');
        $manager = $request->user();

        abort_unless($manager instanceof User, 403);
        abort_unless($this->userHasAnyRole($manager, ['admin', 'coach', 'super_admin']), 403);
        abort_unless((int) $concept->course?->created_by === (int) $manager->id, 403);
    }

    private function userHasAnyRole(User $user, array $allowedRoles): bool
    {
        return $user->Roles()->whereIn('role', $allowedRoles)->exists();
    }

    private function transformTopic(Topic $topic): array
    {
        $lesson = $topic->lessons->sortBy('order_index')->first();

        return [
            'id' => $topic->id,
            'title' => $topic->title,
            'description' => $topic->description,
            'order_index' => $topic->order_index,
            'theory' => $lesson?->content ?? '',
            'videoUrl' => $lesson?->content_url ?? '',
            'videoFile' => null,
            'resources' => $topic->resources->map(fn ($resource) => [
                'id' => $resource->id,
                'type' => $resource->type,
                'name' => $resource->name,
                'url' => $resource->url,
                'meta' => $resource->meta,
                'order_index' => $resource->order_index,
            ])->values(),
            'difficulty' => 'easy',
            'status' => 'draft',
            'hasQuiz' => $topic->quizzes->isNotEmpty(),
            'hasExercise' => $topic->exercises->isNotEmpty(),
        ];
    }
}

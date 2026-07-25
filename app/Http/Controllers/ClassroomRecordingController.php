<?php

namespace App\Http\Controllers;

use App\Models\ClassroomRecording;
use App\Models\Classes;
use App\Models\User;
use App\Services\ClassroomRecordingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ClassroomRecordingController extends Controller
{
    public function index(Request $request, ClassroomRecordingService $recordingService): Response
    {
        $search = trim((string) $request->query('search', ''));
        $recordings = $this->recordingsQuery($request->user(), $search)
            ->with('createdBy')
            ->latest('recorded_at')
            ->latest('created_at')
            ->paginate(4)
            ->withQueryString();

        return Inertia::render('recordings/index', [
            'recordings' => $this->recordingsPayload($recordings, $recordingService, $request->user()),
            'selectedRecording' => null,
            'filters' => [
                'search' => $search,
            ],
            'liveStream' => $recordingService->liveStreamForUser($request->user()),
        ]);
    }

    public function upload(
        Request $request,
        Classes $class,
        ClassroomRecordingService $recordingService,
    ): JsonResponse {
        abort_unless($recordingService->canUploadForClass($class, $request->user()), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration' => ['nullable', 'string', 'regex:/^(\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$/'],
            'video' => ['required', 'file', 'mimetypes:video/mp4', 'max:204800'],
            'recorded_at' => ['nullable', 'date'],
            'visibility' => ['nullable', 'string', 'in:class_students,staff_only'],
            'metadata.course' => ['nullable', 'string', 'in:HTML Course,CSS Course,JavaScript Course,Bootstrap Course,Sass Course,Git Course,GitHub Course,Tailwind Course,Laravel Course'],
        ], [
            'duration.regex' => 'Duration must be in MM:SS or HH:MM:SS format.',
        ]);

        $recording = $recordingService->createUploadedForClass(
            $class,
            $request->user(),
            $request->file('video'),
            $validated,
        );

        return response()->json([
            'success' => true,
            'recording' => $recordingService->payload($recording->loadMissing('createdBy')),
        ], 201);
    }

    public function stream(
        ClassroomRecording $recording,
        ClassroomRecordingService $recordingService,
    ): StreamedResponse {
        abort_unless($recordingService->canViewRecording($recording, request()->user()), 403);

        $source = $recordingService->streamSource($recording);

        abort_unless($source, 404);
        abort_unless(Storage::disk($source['disk'])->exists($source['path']), 404);

        return Storage::disk($source['disk'])->response(
            $source['path'],
            $recording->title,
            [
                'Content-Type' => $source['mime_type'],
                'Accept-Ranges' => 'bytes',
            ],
        );
    }

    public function saveProgress(
        Request $request,
        ClassroomRecording $recording,
        ClassroomRecordingService $recordingService,
    ): JsonResponse {
        abort_unless($recordingService->canViewRecording($recording, $request->user()), 403);

        $validated = $request->validate([
            'watched_seconds' => ['required', 'integer', 'min:0'],
        ]);

        $progress = $recordingService->saveProgress(
            $recording,
            $request->user(),
            $validated['watched_seconds'],
        );

        return response()->json([
            'success' => true,
            'watched_seconds' => $progress->watched_seconds,
            'completed_at' => $progress->completed_at,
        ]);
    }

    public function update(
        Request $request,
        ClassroomRecording $recording,
        ClassroomRecordingService $recordingService,
    ): JsonResponse {
        abort_unless($recordingService->canManageRecording($recording, $request->user()), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'duration' => ['nullable', 'string', 'regex:/^(\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$/'],
            'recorded_at' => ['nullable', 'date'],
            'visibility' => ['nullable', 'string', 'in:class_students,staff_only'],
            'metadata.course' => ['nullable', 'string', 'in:HTML Course,CSS Course,JavaScript Course,Bootstrap Course,Sass Course,Git Course,GitHub Course,Tailwind Course,Laravel Course'],
        ], [
            'duration.regex' => 'Duration must be in MM:SS or HH:MM:SS format.',
        ]);

        $recording = $recordingService->updateRecording($recording, $validated);

        return response()->json([
            'success' => true,
            'recording' => $recordingService->payload($recording->loadMissing('createdBy')),
        ]);
    }

    public function destroy(
        Request $request,
        ClassroomRecording $recording,
        ClassroomRecordingService $recordingService,
    ): JsonResponse {
        abort_unless($recordingService->canManageRecording($recording, $request->user()), 403);

        $recording->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    private function recordingsQuery(User $user, string $search): Builder
    {
        $query = ClassroomRecording::query()
            ->with(['academyClass', 'session'])
            ->where('status', 'ready');

        if (! $this->isAdminUser($user)) {
            $query
                ->where('visibility', 'class_students')
                ->whereNotNull('class_id')
                ->whereHas('academyClass.User', function (Builder $classUserQuery) use ($user): void {
                    $classUserQuery->where('users.id', $user->id);
                });
        }

        if ($search !== '') {
            $query->where(function (Builder $searchQuery) use ($search): void {
                $searchQuery
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('academyClass', function (Builder $classQuery) use ($search): void {
                        $classQuery
                            ->where('class', 'like', "%{$search}%")
                            ->orWhere('type', 'like', "%{$search}%")
                            ->orWhere('promo', 'like', "%{$search}%");
                    })
                    ->orWhereHas('session', function (Builder $sessionQuery) use ($search): void {
                        $sessionQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        return $query;
    }

    private function isAdminUser(User $user): bool
    {
        return $user->Roles()->whereIn('role', ['admin', 'super_admin'])->exists();
    }

    /**
     * @return array<string, mixed>
     */
    private function recordingPayload(
        ClassroomRecording $recording,
        ClassroomRecordingService $recordingService,
        User $user,
    ): array
    {
        return array_merge($recordingService->payload($recording, $user), [
            'session' => [
                'id' => $recording->session?->id,
                'title' => $recording->session?->title,
                'description' => $recording->session?->description,
            ],
            'detail_url' => null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function recordingsPayload(
        LengthAwarePaginator $recordings,
        ClassroomRecordingService $recordingService,
        User $user,
    ): array
    {
        return [
            'data' => $recordings
                ->getCollection()
                ->map(fn (ClassroomRecording $recording): array => $this->recordingPayload($recording, $recordingService, $user))
                ->values(),
            'meta' => [
                'current_page' => $recordings->currentPage(),
                'last_page' => $recordings->lastPage(),
                'per_page' => $recordings->perPage(),
                'total' => $recordings->total(),
                'from' => $recordings->firstItem() ?? 0,
                'to' => $recordings->lastItem() ?? 0,
            ],
            'links' => $recordings->linkCollection()->map(fn (array $link): array => [
                'url' => $link['url'],
                'label' => $link['label'],
                'active' => $link['active'],
            ])->values(),
        ];
    }
}

<?php

namespace App\Services;

use App\Models\Classes;
use App\Models\ClassroomRecording;
use App\Models\ClassroomRecordingProgress;
use App\Models\ClassroomSession;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ClassroomRecordingService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function forClass(Classes $class, User $user): array
    {
        if (! $this->canViewClassRecordings($class, $user)) {
            return [];
        }

        return ClassroomRecording::query()
            ->with('createdBy')
            ->where('class_id', $class->id)
            ->when(! $this->canManageClassRecordings($class, $user), function (Builder $query): void {
                $query
                    ->where('status', 'ready')
                    ->where('visibility', 'class_students');
            })
            ->latest('recorded_at')
            ->latest('created_at')
            ->get()
            ->map(fn (ClassroomRecording $recording): array => $this->payload($recording))
            ->values()
            ->all();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createUploadedForClass(Classes $class, User $user, UploadedFile $video, array $data): ClassroomRecording
    {
        $path = sprintf(
            'classroom/recordings/%d/%s.mp4',
            $class->id,
            (string) Str::uuid(),
        );

        $storedPath = $video->storeAs(dirname($path), basename($path), 'local');

        try {
            return ClassroomRecording::create([
                'class_id' => $class->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => 'ready',
                'provider' => 'manual_upload',
                'storage_disk' => 'local',
                'storage_path' => $storedPath,
                'duration_seconds' => $this->durationToSeconds($data['duration'] ?? null),
                'recorded_at' => $data['recorded_at'] ?? now(),
                'available_at' => now(),
                'created_by' => $user->id,
                'visibility' => $data['visibility'] ?? 'class_students',
                'metadata' => [
                    'mime_type' => $video->getMimeType() ?: 'video/mp4',
                    'original_name' => $video->getClientOriginalName(),
                    'size_bytes' => $video->getSize(),
                    'source' => 'manual_upload',
                ],
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($storedPath);

            throw $exception;
        }
    }

    public function canUploadForClass(Classes $class, User $user): bool
    {
        return $this->canManageClassRecordings($class, $user);
    }

    public function canManageRecording(ClassroomRecording $recording, User $user): bool
    {
        $recording->loadMissing('academyClass');

        if (! $recording->academyClass) {
            return $this->isAdminUser($user);
        }

        return $this->canManageClassRecordings($recording->academyClass, $user);
    }

    public function canViewRecording(ClassroomRecording $recording, User $user): bool
    {
        $recording->loadMissing('academyClass');

        if (! $recording->academyClass) {
            return $this->isAdminUser($user);
        }

        if ($this->canManageClassRecordings($recording->academyClass, $user)) {
            return true;
        }

        return $recording->status === 'ready'
            && $recording->visibility === 'class_students'
            && $this->isAssignedToClass($recording->academyClass, $user);
    }

    public function progressForUser(ClassroomRecording $recording, User $user): ?ClassroomRecordingProgress
    {
        return ClassroomRecordingProgress::query()
            ->where('classroom_recording_id', $recording->id)
            ->where('user_id', $user->id)
            ->first();
    }

    public function saveProgress(
        ClassroomRecording $recording,
        User $user,
        int $watchedSeconds,
    ): ClassroomRecordingProgress {
        $progress = ClassroomRecordingProgress::firstOrNew([
            'classroom_recording_id' => $recording->id,
            'user_id' => $user->id,
        ]);

        $existingWatched = (int) ($progress->watched_seconds ?? 0);
        $newWatched = max($existingWatched, $watchedSeconds);

        $progress->watched_seconds = $newWatched;

        if (
            ! $progress->completed_at
            && $recording->duration_seconds
            && $newWatched >= (int) ceil($recording->duration_seconds * 0.9)
        ) {
            $progress->completed_at = now();
        }

        $progress->last_watched_at = now();
        $progress->save();

        return $progress;
    }

    public function watchedSecondsForUser(ClassroomRecording $recording, User $user): int
    {
        return $this->progressForUser($recording, $user)?->watched_seconds ?? 0;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function liveStreamForUser(User $user): ?array
    {
        $classes = Classes::query()
            ->when(! $this->isAdminUser($user), function (Builder $query) use ($user): void {
                $query->whereHas('User', function (Builder $classUserQuery) use ($user): void {
                    $classUserQuery->where('users.id', $user->id);
                });
            })
            ->latest('updated_at')
            ->latest('id')
            ->get();

        foreach ($classes as $class) {
            $liveStatus = Cache::get($this->classroomLiveCacheKey($class), false);

            if (! $this->isLiveCacheValue($liveStatus)) {
                continue;
            }

            return $this->liveStreamPayload($class, $liveStatus);
        }

        return null;
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateRecording(ClassroomRecording $recording, array $data): ClassroomRecording
    {
        $recording->fill([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'recorded_at' => $data['recorded_at'] ?? null,
            'duration_seconds' => $this->durationToSeconds($data['duration'] ?? null),
            'visibility' => $data['visibility'] ?? 'class_students',
        ]);

        $recording->save();

        return $recording;
    }

    /**
     * @return array{disk: string, path: string, mime_type: string}|null
     */
    public function streamSource(ClassroomRecording $recording): ?array
    {
        if (! $this->hasStreamableSource($recording)) {
            return null;
        }

        return [
            'disk' => $recording->storage_disk,
            'path' => $recording->storage_path,
            'mime_type' => $recording->metadata['mime_type'] ?? 'video/mp4',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function payload(ClassroomRecording $recording, ?User $user = null): array
    {
        $hasStreamableSource = $this->hasStreamableSource($recording);
        $progress = $user ? $this->progressForUser($recording, $user) : null;

        $payload = [
            'id' => $recording->id,
            'title' => $recording->title,
            'description' => $recording->description,
            'status' => $recording->status,
            'provider' => $recording->provider,
            'recorded_at' => $recording->recorded_at,
            'available_at' => $recording->available_at,
            'duration_seconds' => $recording->duration_seconds,
            'visibility' => $recording->visibility,
            'has_streamable_source' => $hasStreamableSource,
            'stream_url' => $hasStreamableSource && Route::has('recordings.stream')
                ? route('recordings.stream', $recording)
                : null,
            'created_by' => $recording->createdBy?->name,
        ];

        if ($user) {
            $payload['watched_seconds'] = $progress?->watched_seconds ?? 0;
            $payload['completed_at'] = $progress?->completed_at;
        }

        return $payload;
    }

    private function canViewClassRecordings(Classes $class, User $user): bool
    {
        return $this->isAdminUser($user) || $this->isAssignedToClass($class, $user);
    }

    private function canManageClassRecordings(Classes $class, User $user): bool
    {
        return $this->isAdminUser($user) || $this->isAssignedCoachToClass($class, $user);
    }

    private function isAdminUser(User $user): bool
    {
        return $this->hasRole($user, ['admin', 'super_admin']);
    }

    /**
     * @param array<int, string> $roles
     */
    private function hasRole(User $user, array $roles): bool
    {
        return $user->Roles()->whereIn('role', $roles)->exists();
    }

    private function isAssignedToClass(Classes $class, User $user): bool
    {
        return $class->User()
            ->where('users.id', $user->id)
            ->exists();
    }

    private function isAssignedCoachToClass(Classes $class, User $user): bool
    {
        $coachRoleId = Role::where('role', 'coach')->value('id');

        if (! $coachRoleId) {
            return false;
        }

        return $class->User()
            ->where('users.id', $user->id)
            ->wherePivot('role_id', $coachRoleId)
            ->exists();
    }

    private function isLiveCacheValue(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return is_array($value) && (bool) ($value['is_live'] ?? false);
    }

    private function liveStartedAt(mixed $value): ?string
    {
        if (! is_array($value) || empty($value['started_at']) || ! is_string($value['started_at'])) {
            return null;
        }

        return strtotime($value['started_at']) !== false
            ? $value['started_at']
            : null;
    }

    private function classroomLiveCacheKey(Classes $class): string
    {
        return 'classroom_session_live_'.$class->id;
    }

    private function classroomRoomName(Classes $class): string
    {
        return 'academy-class-'.$class->id;
    }

    private function classTitle(Classes $class): string
    {
        return trim(implode(' ', array_filter([
            $class->type,
            $class->class,
            $class->promo ? 'Promo '.$class->promo : null,
        ])));
    }

    private function lastCoachForClass(Classes $class): ?User
    {
        $coachRoleId = Role::where('role', 'coach')->value('id');

        if (! $coachRoleId) {
            return null;
        }

        return $class->User()
            ->wherePivot('role_id', $coachRoleId)
            ->orderByPivot('created_at', 'desc')
            ->first();
    }

    private function avatarUrl(?string $avatar): ?string
    {
        $avatar = trim((string) $avatar);

        if ($avatar === '') {
            return null;
        }

        if (str_starts_with($avatar, 'http://') || str_starts_with($avatar, 'https://')) {
            return $avatar;
        }

        $avatar = str_replace('\\', '/', $avatar);
        $path = ltrim($avatar, '/');
        $filename = basename($path);

        if ($filename === '' || $filename === '.' || $filename === '..') {
            return null;
        }

        $localPath = 'img/avatars/'.$filename;

        return Storage::disk('public')->exists($localPath)
            ? '/storage/'.$localPath
            : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function liveStreamPayload(Classes $class, mixed $liveStatus): array
    {
        $roomName = $this->classroomRoomName($class);
        $session = ClassroomSession::query()
            ->where('external_group_id', $roomName)
            ->orWhere('jitsi_room_name', $roomName)
            ->withCount([
                'participants as students_online' => function (Builder $query): void {
                    $query
                        ->where('role', 'student')
                        ->where('is_online', true);
                },
            ])
            ->first();
        $coach = $session?->host ?: $this->lastCoachForClass($class);
        $classTitle = $this->classTitle($class) ?: 'Classroom session';

        return [
            'is_live' => true,
            'title' => $classTitle.' - Live Session',
            'class_name' => $class->class,
            'type' => $class->type,
            'coach_name' => $coach?->name,
            'coach_avatar' => $this->avatarUrl($coach?->avatar),
            'started_at' => $this->liveStartedAt($liveStatus),
            'students_online' => $session ? $session->students_online : null,
            'href' => Route::has('classroom.sessions.show')
                ? route('classroom.sessions.show', $class->id, false)
                : '/classroom/sessions/'.$class->id,
        ];
    }

    private function hasStreamableSource(ClassroomRecording $recording): bool
    {
        return (bool) ($recording->storage_disk && $recording->storage_path)
            && Storage::disk($recording->storage_disk)->exists($recording->storage_path);
    }

    private function durationToSeconds(?string $duration): ?int
    {
        $duration = trim((string) $duration);

        if ($duration === '') {
            return null;
        }

        $parts = array_map('intval', explode(':', $duration));

        if (count($parts) === 2) {
            return ($parts[0] * 60) + $parts[1];
        }

        if (count($parts) === 3) {
            return ($parts[0] * 3600) + ($parts[1] * 60) + $parts[2];
        }

        return null;
    }
}

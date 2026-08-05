<?php

namespace App\Http\Controllers;

use App\Models\Concept;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourseConceptRoadmapController extends Controller
{
    public function show(Request $request, $id): Response
    {
        $this->ensureCanManageCourses($request);
        // $this->ensureOwnsCourse($request, $course);

        $course = Course::findOrFail($id);
        // dd($course); 
        $course->load([
            'concepts' => fn ($query) => $query->orderBy('order_index'),
        ]);

        return Inertia::render('courses/[id]', [
            'course' => $course,
        ]);
    }

    public function storeConcept(Request $request, $courseId): RedirectResponse
    {
        $this->ensureCanManageCourses($request);
        $course = Course::findOrFail($courseId);
        $this->ensureOwnsCourse($request, $course);

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:50'],
            'emoji'       => ['nullable', 'string', 'max:4'],
            'description' => ['nullable', 'string', 'max:500'],
            'type'        => ['nullable', 'string', 'max:30'],
        ]);

        $nextIndex = ($course->concepts()->max('order_index') ?? -1) + 1;

        $data = [
            'course_id'   => $course->id,
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'order_index' => $nextIndex,
        ];

        if (Schema::hasColumn('concepts', 'emoji')) {
            $data['emoji'] = $validated['emoji'] ?? null;
        }

        if (Schema::hasColumn('concepts', 'type')) {
            $data['type'] = $validated['type'] ?? null;
        }

        Concept::create($data);

        return redirect()->route('courses.concepts-roadmap.show', $course);
    }

    public function updateConcept(Request $request, Course $course, Concept $concept): RedirectResponse
    {
        $this->ensureCanManageCourses($request);
        $this->ensureOwnsCourse($request, $course);
        abort_unless((int) $concept->course_id === (int) $course->id, 404);

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:50'],
            'emoji'       => ['nullable', 'string', 'max:4'],
            'description' => ['nullable', 'string', 'max:500'],
            'type'        => ['nullable', 'string', 'max:30'],
        ]);

        $data = [
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
        ];

        if (Schema::hasColumn('concepts', 'emoji')) {
            $data['emoji'] = $validated['emoji'] ?? null;
        }

        if (Schema::hasColumn('concepts', 'type')) {
            $data['type'] = $validated['type'] ?? null;
        }

        $concept->update($data);

        return redirect()->route('courses.concepts-roadmap.show', $course);
    }

    public function destroyConcept(Request $request, Course $course, Concept $concept): RedirectResponse
    {
        $this->ensureCanManageCourses($request);
        $this->ensureOwnsCourse($request, $course);
        abort_unless((int) $concept->course_id === (int) $course->id, 404);

        $concept->delete();

        return redirect()->route('courses.concepts-roadmap.show', $course);
    }

    private function ensureCanManageCourses(Request $request): void
    {
        $manager = $this->courseManager($request);
        abort_unless($this->userHasAnyRole($manager, ['admin', 'coach']), 403);
    }

    private function ensureOwnsCourse(Request $request, Course $course): void
    {
        abort_unless((int) $course->created_by === (int) $this->courseManager($request)->id, 403);
    }

    private function courseManager(Request $request): ?User
    {
        if ($request->user()) {
            return $request->user();
        }

        if (! app()->environment('local')) {
            return null;
        }

        $user = User::where('email', 'local-coach@example.test')->first();

        if ($user) {
            return $user;
        }

        return User::unguarded(fn () => User::create($this->localCoachAttributes()));
    }

    private function userHasAnyRole(?User $user, array $allowedRoles): bool
    {
        if (app()->environment('local') && ! Auth::check()) {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->Roles()->whereIn('role', $allowedRoles)->exists();
    }

    private function localCoachAttributes(): array
    {
        $attributes = [
            'name' => 'Local Coach',
            'email' => 'local-coach@example.test',
        ];

        $optionalAttributes = [
            'central_id' => null,
            'avatar' => '',
            'promo' => 0,
            'field' => 'development',
            'roles' => json_encode(['coach']),
            'status' => 'active',
            'formation_id' => null,
            'email_verified_at' => now(),
            'password' => Hash::make(Str::random(32)),
        ];

        foreach ($optionalAttributes as $column => $value) {
            if (Schema::hasColumn('users', $column)) {
                $attributes[$column] = $value;
            }
        }

        return $attributes;
    }
}

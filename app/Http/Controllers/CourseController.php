<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureCanManageCourses($request);
        $manager = $this->courseManager($request);

        return Inertia::render('courses/index', [
            'courses' => Course::query()
                ->with('creator:id,name')
                ->withCount([
                    'modules as concepts_count',
                    'chapters',
                ])
                ->where('created_by', $manager->id)
                ->latest()
                ->get($this->courseQueryColumns())
                ->map(function (Course $course): array {
                    $courseData = $course->only($this->courseColumns());
                    $courseData['creator_name'] = $course->creator?->name ?? 'Local Coach';
                    $courseData['concepts_count'] = $course->concepts_count;
                    $courseData['chapters_count'] = $course->chapters_count;

                    return $courseData;
                }),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureCanManageCourses($request);
        $manager = $this->courseManager($request);

        $data = $this->validatedCourseData($request);
        $data['created_by'] = $manager->id;

        Course::create($data);

        return redirect()->route('courses.index');
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $this->ensureCanManageCourses($request);
        $this->ensureOwnsCourse($request, $course);

        $course->update($this->validatedCourseData($request, $course));

        return redirect()->route('courses.index');
    }

    public function updateStatus(Request $request, Course $course): RedirectResponse
    {
        $this->ensureCanManageCourses($request);
        $this->ensureOwnsCourse($request, $course);

        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['draft', 'assigned', 'archived'])],
        ]);

        $course->update($data);

        return redirect()->route('courses.index');
    }

    public function destroy(Request $request, Course $course): RedirectResponse
    {
        $this->ensureCanManageCourses($request);
        $this->ensureOwnsCourse($request, $course);

        if (app()->environment('local') && ! Schema::hasTable('students')) {
            Schema::withoutForeignKeyConstraints(fn () => $course->delete());
        } else {
            $course->delete();
        }

        return redirect()->route('courses.index');
    }

    private function validatedCourseData(Request $request, ?Course $course = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('courses', 'slug')->ignore($course),
            ],
            'description' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'max:4096'],
            'status' => ['required', 'string', Rule::in(['draft', 'assigned', 'archived'])],
            'estimated_duration_days' => ['nullable', 'integer', 'min:1', 'max:10000'],
        ]);

        $data['slug'] = $data['slug'] ?: $this->uniqueSlug($data['title'], $course);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('course-banners', 'public');
            $data['thumbnail_url'] = Storage::url($path);
        }

        unset($data['thumbnail']);

        if (! Schema::hasColumn('courses', 'estimated_duration_days')) {
            unset($data['estimated_duration_days']);
        }

        return $data;
    }

    private function ensureCanManageCourses(Request $request): void
    {
        abort_unless($this->userHasAnyRole($this->courseManager($request)?->roles, ['admin', 'coach']), 403);
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

    private function userHasAnyRole(?string $roles, array $allowedRoles): bool
    {
        if (app()->environment('local') && ! auth()->check()) {
            return true;
        }

        $decodedRoles = json_decode($roles ?? '[]', true);
        $userRoles = is_array($decodedRoles) ? $decodedRoles : [$roles];

        return collect($userRoles)
            ->filter()
            ->intersect($allowedRoles)
            ->isNotEmpty();
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

    private function courseColumns(): array
    {
        $columns = ['id', 'title', 'slug', 'description', 'thumbnail_url', 'status', 'created_at', 'updated_at'];

        if (Schema::hasColumn('courses', 'estimated_duration_days')) {
            $columns[] = 'estimated_duration_days';
        }

        return $columns;
    }

    private function courseQueryColumns(): array
    {
        return [...$this->courseColumns(), 'created_by'];
    }

    private function uniqueSlug(string $title, ?Course $course = null): string
    {
        $baseSlug = Str::slug($title);
        if ($baseSlug === '') {
            $baseSlug = 'course';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            Course::query()
                ->where('slug', $slug)
                ->when($course, fn ($query) => $query->whereKeyNot($course->id))
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

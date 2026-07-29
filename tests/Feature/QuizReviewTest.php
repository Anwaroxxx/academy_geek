<?php

use App\Models\Concept;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\Role;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Str;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('coach can re-save a review for an already approved ai quiz', function () {
    $user = User::create([
        'name' => 'Coach User',
        'email' => 'coach@example.com',
        'password' => bcrypt('password'),
        'remember_token' => Str::random(10),
    ]);
    $role = Role::forceCreate(['role' => 'coach']);
    $user->Roles()->attach($role->id);

    $course = Course::create([
        'created_by' => $user->id,
        'title' => 'Course',
        'slug' => 'course',
        'description' => 'A course',
        'thumbnail_url' => null,
        'content_types' => [],
        'status' => 'published',
        'estimated_duration_days' => 7,
    ]);

    $concept = Concept::create([
        'course_id' => $course->id,
        'title' => 'Concept',
        'description' => null,
        'order_index' => 1,
    ]);

    $topic = Topic::create([
        'concept_id' => $concept->id,
        'title' => 'Topic',
        'description' => null,
        'order_index' => 1,
    ]);

    $quiz = Quiz::create([
        'topic_id' => $topic->id,
        'concept_id' => null,
        'title' => 'AI Quiz',
        'description' => json_encode([
            'description' => 'Original description',
            'question_reviews' => [],
        ]),
        'passing_score' => 70,
        'xp_reward' => 0,
        'order_index' => 1,
        'source' => 'ai',
        'status' => 'approved',
    ]);

    $question = QuizQuestion::create([
        'quiz_id' => $quiz->id,
        'question_text' => 'What is 2 + 2?',
        'order_index' => 1,
    ]);

    $response = $this->actingAs($user)
        ->put(route('quizes.review', $quiz), [
            'questions' => [
                ['id' => $question->id, 'status' => 'rejected'],
            ],
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success', 'Quiz review saved successfully.');
    $quiz->refresh();
    $question->refresh();

    $this->assertSame('approved', $quiz->status);
    $this->assertSame('rejected', $question->status);
    $this->assertSame($user->id, $question->reviewed_by);
    $this->assertNotNull($question->reviewed_at);
    $this->assertStringContainsString('question_reviews', $quiz->description);
});

test('coach can persist reordered questions when saving a review', function () {
    $user = User::create([
        'name' => 'Coach User',
        'email' => 'coach-order@example.com',
        'password' => bcrypt('password'),
        'remember_token' => Str::random(10),
    ]);
    $role = Role::forceCreate(['role' => 'coach']);
    $user->Roles()->attach($role->id);

    $course = Course::create([
        'created_by' => $user->id,
        'title' => 'Course',
        'slug' => 'course-order',
        'description' => 'A course',
        'thumbnail_url' => null,
        'content_types' => [],
        'status' => 'published',
        'estimated_duration_days' => 7,
    ]);

    $concept = Concept::create([
        'course_id' => $course->id,
        'title' => 'Concept',
        'description' => null,
        'order_index' => 1,
    ]);

    $topic = Topic::create([
        'concept_id' => $concept->id,
        'title' => 'Topic',
        'description' => null,
        'order_index' => 1,
    ]);

    $quiz = Quiz::create([
        'topic_id' => $topic->id,
        'concept_id' => null,
        'title' => 'AI Quiz',
        'description' => json_encode([
            'description' => 'Original description',
            'question_reviews' => [],
        ]),
        'passing_score' => 70,
        'xp_reward' => 0,
        'order_index' => 1,
        'source' => 'ai',
        'status' => 'pending_review',
    ]);

    $firstQuestion = QuizQuestion::create([
        'quiz_id' => $quiz->id,
        'question_text' => 'First question',
        'order_index' => 1,
    ]);
    $secondQuestion = QuizQuestion::create([
        'quiz_id' => $quiz->id,
        'question_text' => 'Second question',
        'order_index' => 2,
    ]);

    $response = $this->actingAs($user)
        ->put(route('quizes.review', $quiz), [
            'questions' => [
                ['id' => $secondQuestion->id, 'status' => 'approved'],
                ['id' => $firstQuestion->id, 'status' => 'rejected'],
            ],
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertSessionHas('success', 'Quiz review saved successfully.');

    $secondQuestion->refresh();
    $firstQuestion->refresh();

    $this->assertSame(1, $secondQuestion->order_index);
    $this->assertSame(2, $firstQuestion->order_index);
});

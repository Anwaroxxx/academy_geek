<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    public function promotionStudents(): HasMany
    {
        return $this->hasMany(PromotionStudent::class);
    }

    public function coursePromotions(): BelongsToMany
    {
        return $this->belongsToMany(CoursePromotion::class, 'course_enrollments')
            ->withPivot(['status', 'enrolled_at', 'last_accessed_at', 'completed_at'])
            ->withTimestamps();
    }

    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'promotion_students')
            ->withPivot(['status', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    public function lessonCompletions(): HasMany
    {
        return $this->hasMany(LessonCompletion::class);
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function exerciseSubmissions(): HasMany
    {
        return $this->hasMany(ExerciseSubmission::class);
    }

}

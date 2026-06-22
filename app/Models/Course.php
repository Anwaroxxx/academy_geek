<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

#[Fillable(['created_by', 'title', 'slug', 'description', 'thumbnail_url', 'content_types', 'status', 'estimated_duration_days'])]
class Course extends Model
{
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class);
    }

    public function chapters(): HasManyThrough
    {
        return $this->hasManyThrough(Chapter::class, Module::class);
    }

    public function coursePromotions(): HasMany
    {
        return $this->hasMany(CoursePromotion::class);
    }

    public function enrollments(): HasManyThrough
    {
        return $this->hasManyThrough(CourseEnrollment::class, CoursePromotion::class);
    }

    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'course_promotions')
            ->withPivot(['status', 'starts_at', 'ends_at'])
            ->withTimestamps();
    }

    protected function casts(): array
    {
        return [
            'content_types' => 'array',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['topic_id', 'concept_id' , 'title', 'description', 'passing_score', 'xp_reward', 'order_index' , 'source' , 'status' ])]
class Quiz extends Model
{
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function concept() : BelongsTo
    {
        return $this->belongsTo(Concept::class);
    }
}

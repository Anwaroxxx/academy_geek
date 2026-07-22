<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassroomRecordingProgress extends Model
{
    use HasFactory;

    protected $table = 'classroom_recording_progresses';

    protected $fillable = [
        'user_id',
        'classroom_recording_id',
        'watched_seconds',
        'completed_at',
        'last_watched_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recording(): BelongsTo
    {
        return $this->belongsTo(ClassroomRecording::class, 'classroom_recording_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'watched_seconds' => 'integer',
            'completed_at' => 'datetime',
            'last_watched_at' => 'datetime',
        ];
    }
}

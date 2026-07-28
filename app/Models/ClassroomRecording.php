<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClassroomRecording extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'class_id',
        'classroom_session_id',
        'title',
        'description',
        'status',
        'provider',
        'external_reference',
        'storage_disk',
        'storage_path',
        'thumbnail_path',
        'secure_url',
        'duration_seconds',
        'recorded_at',
        'available_at',
        'created_by',
        'visibility',
        'metadata',
    ];

    public function academyClass(): BelongsTo
    {
        return $this->belongsTo(Classes::class, 'class_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(ClassroomSession::class, 'classroom_session_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'recorded_at' => 'datetime',
            'available_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Social;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */

#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    public function createdCourses(): HasMany
    {
        return $this->hasMany(Course::class, 'created_by');
    }

    public function hostedClassroomSessions(): HasMany
    {
        return $this->hasMany(ClassroomSession::class, 'host_id');
    }

    public function classroomParticipations(): HasMany
    {
        return $this->hasMany(ClassroomParticipant::class);
    }

    public function classroomSessions(): BelongsToMany
    {
        return $this->belongsToMany(ClassroomSession::class, 'classroom_participants', 'user_id', 'classroom_session_id')
            ->withPivot(['role', 'is_online', 'is_muted', 'is_camera_on', 'is_screen_sharing', 'can_share_screen', 'hand_raised', 'joined_at', 'left_at', 'last_seen_at'])
            ->withTimestamps();
    }

    public function classroomMessages(): HasMany
    {
        return $this->hasMany(ClassroomMessage::class, 'sender_id');
    }

    public function classroomResources(): HasMany
    {
        return $this->hasMany(ClassroomResource::class, 'uploaded_by');
    }

    public function classroomAttendanceRecords(): HasMany
    {
        return $this->hasMany(ClassroomAttendance::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */

    protected $fillable = [
        "central_id",
        "name",
        "email",
        "avatar",
        "promo",
        "field",
        "roles",
        "status",
        "formation_id",
        "thought_class_id",
        "studied_in_class_id",
    ];

    public function Roles()
    {
        return $this->belongsToMany(Role::class, "user_roles");
    }
    public function Social()
    {
        return $this->hasMany(Social::class);
    }
    public function classes()
    {
        return $this->belongsToMany(Classes::class, "user_class");
    }
    
    public function wakatime()
    {
        return $this->hasOne(WakaTime::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges', 'user_id', 'badge_id')
            ->withPivot(['earned_at'])
            ->withTimestamps();
    }

    public function userBadges(): HasMany
    {
        return $this->hasMany(UserBadge::class, 'user_id');
    }
}

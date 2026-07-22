<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassroomParticipant;
use App\Models\ClassroomSession;
use App\Models\Role;
use App\Models\User;
use App\Models\User_role;
use App\Models\WakaTime;
use App\Services\ClassroomRecordingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    private function getLastCoach(Classes $class)
    {
        $coachRoleId = Role::where('role', 'coach')->value('id');
        return $class->User()
            ->wherePivot('role_id', $coachRoleId)
            ->orderByPivot('created_at', 'desc')
            ->get()->first();
    }

    private function getStudents(Classes $class)
    {
        $StudentRoleId = Role::where('role', 'student')->value('id');

        return $class->User()
            ->wherePivot("role_id", $StudentRoleId)
            ->get();
    }

    private function getGithub(User $user)
    {
        return $account = $user->Social()->where("title", "github")->first()?->url;
    }

    private function getWakatimeKey(User $user)
    {
        return $user->wakatime()->value("wakatime_key");
    }

    private function userHasAnyRole(User $user, array $allowedRoles): bool
    {
        return $user->Roles()->whereIn('role', $allowedRoles)->exists();
    }

    private function isAdminUser(User $user): bool
    {
        return $this->userHasAnyRole($user, ['admin', 'super_admin']);
    }

    private function isAssignedToClass(User $user, Classes $class): bool
    {
        return $class->User()
            ->where('users.id', $user->id)
            ->exists();
    }

    private function canAccessClass(User $user, Classes $class): bool
    {
        return $this->isAdminUser($user) || $this->isAssignedToClass($user, $class);
    }

    private function canStartClassroom(User $user, Classes $class, ?User $coach): bool
    {
        $isHost = $coach && (int) $coach->id === (int) $user->id;
        $isAssignedCoach = $this->userHasAnyRole($user, ['coach'])
            && $this->isAssignedToClass($user, $class);

        return $this->isAdminUser($user) || $isAssignedCoach || $isHost;
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
        if (Storage::disk('public')->exists($localPath)) {
            return '/storage/'.$localPath;
        }

        return null;
    }

    private function getOrCreateClassroomSession(Classes $class, ?User $coach): ClassroomSession
    {
        $roomName = $this->classroomRoomName($class);

        $session = ClassroomSession::where('external_group_id', $roomName)
            ->orWhere('jitsi_room_name', $roomName)
            ->first();

        if (! $session) {
            $session = new ClassroomSession();
            $session->jitsi_room_name = $roomName;
        }

        $session->fill([
            'host_id' => $coach?->id,
            'external_group_id' => $roomName,
            'title' => $this->classTitle($class) ?: 'Classroom session',
            'description' => 'Academy classroom session',
            'status' => $session->status ?: 'scheduled',
            'metadata' => [
                'academy_class_id' => $class->id,
            ],
        ]);
        $session->save();

        return $session;
    }

    private function syncClassroomParticipants(ClassroomSession $session, Classes $class, ?User $coach, User $currentUser): void
    {
        $students = $this->getStudents($class);
        $participants = collect();

        if ($coach) {
            $participants->push([$coach, 'host']);
        }

        foreach ($students as $student) {
            $participants->push([$student, 'student']);
        }

        if (! $participants->contains(fn ($item) => (int) $item[0]->id === (int) $currentUser->id)) {
            $participants->push([
                $currentUser,
                $this->canStartClassroom($currentUser, $class, $coach) ? 'host' : 'student',
            ]);
        }

        foreach ($participants as [$participantUser, $role]) {
            $participant = ClassroomParticipant::firstOrNew([
                'classroom_session_id' => $session->id,
                'user_id' => $participantUser->id,
            ]);

            $participant->role = $role;
            $participant->is_muted ??= true;
            $participant->is_camera_on ??= false;
            $participant->is_screen_sharing ??= false;
            $participant->hand_raised ??= false;
            $participant->can_share_screen = $role === 'host'
                ? true
                : (bool) $participant->can_share_screen;
            $participant->save();
        }
    }

    private function participantPayload(ClassroomParticipant $participant, ?User $currentUser = null): array
    {
        $participant->loadMissing('user');

        return [
            'id' => $participant->id,
            'user_id' => $participant->user_id,
            'role' => $participant->role,
            'is_online' => (bool) $participant->is_online,
            'is_muted' => (bool) $participant->is_muted,
            'is_camera_on' => (bool) $participant->is_camera_on,
            'is_screen_sharing' => (bool) $participant->is_screen_sharing,
            'can_share_screen' => (bool) $participant->can_share_screen,
            'hand_raised' => (bool) $participant->hand_raised,
            'joined_at' => $participant->joined_at?->toISOString(),
            'is_current_user' => $currentUser ? (int) $participant->user_id === (int) $currentUser->id : false,
            'user' => [
                'id' => $participant->user?->id,
                'name' => $participant->user?->name,
                'avatar' => $this->avatarUrl($participant->user?->avatar),
                'email' => $participant->user?->email,
                'role' => $participant->role,
            ],
        ];
    }

    private function classroomParticipantsPayload(ClassroomSession $session, User $currentUser)
    {
        return $session->participants()
            ->with('user')
            ->orderByRaw("case when role = 'host' then 0 else 1 end")
            ->orderBy('id')
            ->get()
            ->map(fn (ClassroomParticipant $participant): array => $this->participantPayload($participant, $currentUser))
            ->values();
    }

    public function index()
    {
        $user = Auth::user();
        $classesQuery = Classes::orderBy("promo")->orderBy("class");

        if (! $this->isAdminUser($user)) {
            $classesQuery->whereHas('User', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            });
        }

        $classes = $classesQuery->get()->all();
        $info = [];
        $coaches = [];
        foreach ($classes as $class) {
            $tmp = [];

            $lastCoach = $this->getLastCoach($class);
            if ($lastCoach) {
                $tmp["coach"] = $lastCoach["name"];
                // check if the coach is already in coaches list to avoid dupplicates 
                if (!in_array($lastCoach["name"], $coaches)) {
                    $coaches[] = $lastCoach["name"];
                }
            }
            $studentNum = $this->getStudents($class)->count();
            $tmp["id"] = $class->id;
            $tmp["student_num"] = $studentNum;
            $tmp["class"] = $class->class;
            $tmp["promo"] = $class->promo;
            $tmp["type"] = $class->type;
            $info[] = $tmp;
        }
        $user_id = $user->id;
        $role_id = Role::where("role", "super_admin")->value("id");
        $isSuAdmin = User_role::where("user_id", $user_id)
            ->where("role_id", $role_id)->first();
        if (!$isSuAdmin) {
            $val = false;
        } else {
            $val = true;
        }
        return Inertia::render('classes/index', [
            "items" => array_values($info),
            "coaches" => $coaches,
            "suAdmin" => $val
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($id, ClassroomRecordingService $recordingService)
    {

        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $students = $this->getStudents($class);
        $coach = $this->getLastCoach($class);
        // dd($coach);
        $data = [];
        $data["id"] = $class->id;
        $data["class"] = $class->class;
        $data["promo"] = $class->promo;
        $data["type"] = $class->type;
        if ($coach) {
            $data["coach"] = $coach->name;
        }
        if ($students) {
            foreach ($students as $key => $student) {
                $data["students"][$key]["id"] = $student->id;
                $data["students"][$key]["name"] = $student->name;
                $data["students"][$key]["avatar"] = $student->avatar;
                $data["students"][$key]["field"] = $student->field;
                $data["students"][$key]["status"] = $student->status;
                $data["students"][$key]["promo"] = $class->promo;
                $data["students"][$key]["type"] = $class->type;
                $data["students"][$key]["class"] = $class->class;
                $data["students"][$key]["avatar"] = $this->avatarUrl($student->avatar);
                $data["students"][$key]["email"] = $student->email;
                $data["students"][$key]["gh_url"] = $this->getGithub($student);
                $data["students"][$key]["wakaKey"] = $this->getWakatimeKey($student);
            }
        }
        $data["recordings"] = $recordingService->forClass($class, $user);
        $data["permissions"] = [
            "can_upload_recordings" => $recordingService->canUploadForClass($class, $user),
        ];

        return Inertia::render("classes/[id]", ["data" => $data]);
    }

    public function classroomSession($id)
    {
        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $students = $this->getStudents($class);
        $coach = $this->getLastCoach($class);
        $data = [];
        $data["id"] = $class->id;
        $data["class"] = $class->class;
        $data["promo"] = $class->promo;
        $data["type"] = $class->type;
        if ($coach) {
            $data["coach"] = $coach->name;
        }
        if ($students) {
            foreach ($students as $key => $student) {
                $data["students"][$key]["id"] = $student->id;
                $data["students"][$key]["name"] = $student->name;
                $data["students"][$key]["avatar"] = $student->avatar;
                $data["students"][$key]["field"] = $student->field;
                $data["students"][$key]["status"] = $student->status;
                $data["students"][$key]["promo"] = $class->promo;
                $data["students"][$key]["type"] = $class->type;
                $data["students"][$key]["class"] = $class->class;
                $data["students"][$key]["avatar"] = $this->avatarUrl($student->avatar);
                $data["students"][$key]["email"] = $student->email;
                $data["students"][$key]["gh_url"] = $this->getGithub($student);
                $data["students"][$key]["wakaKey"] = $this->getWakatimeKey($student);
            }
        }

        $classTitle = $this->classTitle($class);
        $isHost = $coach && (int) $coach->id === (int) $user->id;
        $canStartRoom = $this->canStartClassroom($user, $class, $coach);
        $canRecord = $canStartRoom;
        $canShareScreen = $canStartRoom;
        $roomIsLive = (bool) Cache::get($this->classroomLiveCacheKey($class), false);
        $session = $this->getOrCreateClassroomSession($class, $coach);
        $this->syncClassroomParticipants($session, $class, $coach, $user);
        $session->load('participants.user');
        $participants = $this->classroomParticipantsPayload($session, $user);
        $currentParticipant = $participants->firstWhere('user_id', $user->id);
        $roomName = $this->classroomRoomName($class);

        return Inertia::render('classroom/sessions/[id]', [
            'data' => $data,
            'classroom' => [
                'status' => 'pending',
                'message' => 'Jitsi video ready',
                'session_id' => $session->id,
                'participants' => $participants,
                'current_participant' => $currentParticipant,
                'current_user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $this->avatarUrl($user->avatar),
                    'email' => $user->email,
                    'role' => $currentParticipant['role'] ?? 'student',
                ],
                'permissions' => [
                    'can_join' => true,
                    'can_send_message' => false,
                    'can_upload_resource' => false,
                    'can_moderate_participants' => $canStartRoom,
                    'can_share_screen' => $canShareScreen || (bool) ($currentParticipant['can_share_screen'] ?? false),
                    'can_manage_recordings' => false,
                ],
            ],
            'jitsiAccess' => [
                'provider' => config('services.jitsi.provider'),
                'domain' => config('services.jitsi.domain'),
                'script_url' => config('services.jitsi.script_url'),
                'room_name' => $roomName,
                'display_name' => $user->name,
                'is_host' => $isHost,
                'can_start_room' => $canStartRoom,
                'can_share_screen' => $canShareScreen,
                'can_record' => $canRecord,
                'room_is_live' => $roomIsLive,
                'host_is_online' => $roomIsLive,
                'subject' => $classTitle ?: 'Classroom session',
                'user_id' => $user->id,
                'auth_enabled' => false,
                'jwt' => null,
                'expires_at' => null,
            ],
        ]);
    }

    public function startClassroomSession($id): JsonResponse
    {
        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $coach = $this->getLastCoach($class);
        abort_unless($this->canStartClassroom($user, $class, $coach), 403);

        $session = $this->getOrCreateClassroomSession($class, $coach);
        $this->syncClassroomParticipants($session, $class, $coach, $user);
        $participant = ClassroomParticipant::where('classroom_session_id', $session->id)
            ->where('user_id', $user->id)
            ->first();

        if ($participant) {
            $participant->fill([
                'is_online' => true,
                'left_at' => null,
                'last_seen_at' => now(),
                'joined_at' => now(),
            ])->save();
        }

        $liveStatus = Cache::get($this->classroomLiveCacheKey($class));
        $startedAt = is_array($liveStatus) && ! empty($liveStatus['started_at'])
            ? $liveStatus['started_at']
            : now()->toIso8601String();

        Cache::put($this->classroomLiveCacheKey($class), [
            'is_live' => true,
            'started_at' => $startedAt,
            'started_by' => $user->id,
        ], now()->addHours(2));

        return response()->json([
            'room_is_live' => true,
            'participant' => $participant ? $this->participantPayload($participant, $user) : null,
            'participants' => $this->classroomParticipantsPayload($session->fresh(), $user),
        ]);
    }

    public function classroomSessionStatus($id): JsonResponse
    {
        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $coach = $this->getLastCoach($class);
        $roomIsLive = (bool) Cache::get($this->classroomLiveCacheKey($class), false);
        $session = $this->getOrCreateClassroomSession($class, $coach);
        $this->syncClassroomParticipants($session, $class, $coach, $user);
        $session->load('participants.user');
        $participants = $this->classroomParticipantsPayload($session, $user);

        return response()->json([
            'room_is_live' => $roomIsLive,
            'can_start_room' => $this->canStartClassroom($user, $class, $coach),
            'participant' => $participants->firstWhere('user_id', $user->id),
            'participants' => $participants,
        ]);
    }

    public function stopClassroomSession($id): JsonResponse
    {
        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $coach = $this->getLastCoach($class);
        abort_unless($this->canStartClassroom($user, $class, $coach), 403);

        $session = $this->getOrCreateClassroomSession($class, $coach);
        $participant = ClassroomParticipant::where('classroom_session_id', $session->id)
            ->where('user_id', $user->id)
            ->first();

        if ($participant) {
            $participant->fill([
                'is_online' => false,
                'is_screen_sharing' => false,
                'hand_raised' => false,
                'left_at' => now(),
                'last_seen_at' => now(),
            ])->save();
        }

        Cache::forget($this->classroomLiveCacheKey($class));

        return response()->json([
            'room_is_live' => false,
            'participant' => $participant ? $this->participantPayload($participant, $user) : null,
            'participants' => $this->classroomParticipantsPayload($session->fresh(), $user),
        ]);
    }

    public function joinClassroomParticipant($id): JsonResponse
    {
        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $coach = $this->getLastCoach($class);
        $session = $this->getOrCreateClassroomSession($class, $coach);
        $this->syncClassroomParticipants($session, $class, $coach, $user);

        $participant = ClassroomParticipant::where('classroom_session_id', $session->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $participant->fill([
            'is_online' => true,
            'left_at' => null,
            'last_seen_at' => now(),
            'joined_at' => now(),
        ])->save();

        return response()->json([
            'participant' => $this->participantPayload($participant, $user),
            'participants' => $this->classroomParticipantsPayload($session->fresh(), $user),
        ]);
    }

    public function leaveClassroomParticipant($id): JsonResponse
    {
        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $coach = $this->getLastCoach($class);
        $session = $this->getOrCreateClassroomSession($class, $coach);
        $this->syncClassroomParticipants($session, $class, $coach, $user);

        $participant = ClassroomParticipant::where('classroom_session_id', $session->id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $participant->fill([
            'is_online' => false,
            'is_screen_sharing' => false,
            'hand_raised' => false,
            'left_at' => now(),
            'last_seen_at' => now(),
        ])->save();

        return response()->json([
            'participant' => $this->participantPayload($participant, $user),
            'participants' => $this->classroomParticipantsPayload($session->fresh(), $user),
        ]);
    }

    public function updateClassroomParticipantScreenShare(Request $request, $id, $participant): JsonResponse
    {
        $class = Classes::where("id", $id)->get()->first();
        if (!$class) {
            return abort(404);
        }

        $user = Auth::user();
        abort_unless($this->canAccessClass($user, $class), 403);

        $coach = $this->getLastCoach($class);
        abort_unless($this->canStartClassroom($user, $class, $coach), 403);

        $validated = $request->validate([
            'allowed' => ['required', 'boolean'],
        ]);

        $session = $this->getOrCreateClassroomSession($class, $coach);
        $this->syncClassroomParticipants($session, $class, $coach, $user);

        $targetParticipant = ClassroomParticipant::where('classroom_session_id', $session->id)
            ->whereKey($participant)
            ->firstOrFail();

        abort_if((int) $targetParticipant->user_id === (int) $user->id, 403);
        abort_if($targetParticipant->role === 'host', 403);

        $allowed = (bool) $validated['allowed'];
        $targetParticipant->can_share_screen = $allowed;

        if (! $allowed) {
            $targetParticipant->is_screen_sharing = false;
        }

        $targetParticipant->save();

        return response()->json([
            'participant' => $this->participantPayload($targetParticipant, $user),
            'participants' => $this->classroomParticipantsPayload($session->fresh(), $user),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Classes $classes)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Classes $classes)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Classes $classes)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\Role;
use App\Models\User_role;
use App\Models\User;
use App\Models\UserClass;
use App\Services\GetAvatarsService;
use App\Services\GetSocialsService;
use App\Services\GetWakaTimeKeys;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

use function Illuminate\Log\log;

class GetClassesDataController extends Controller
{
    public function __construct(
        private GetSocialsService $getSocialsService,
        private GetWakaTimeKeys $get_waka_time_keys,
        private GetAvatarsService $get_avatars_service,
    ) {}

    private function assignRoles(array $roles, ?User $user)
    {
        if ($user) {
            $user->roles()->detach();
            foreach ($roles as $role) {
                $role_id = Role::where("role", Str::lower($role))->value('id');
                if ($role_id) {
                    User_role::create([
                        "user_id" => $user->id,
                        "role_id" => $role_id,
                    ]);
                }
            }
        }
    }

    private function assignClass(Classes $class, ?User $user, bool $type = false)
    {
        if ($user && $class) {
            $user_id = $user->id;
            $class_id = $class->id;
            if (!$type) {
                $role_id = Role::where("role", "student")->value("id");
            } else {
                $role_id = Role::where("role", "coach")->value("id");
            }
            $userClass = UserClass::where("user_id", "$user_id")
                ->where("classes_id", $class_id)
                ->where("role_id", $role_id)->first();

            if (!$userClass) {
                UserClass::create([
                    "user_id" => $user_id,
                    "classes_id" => $class_id,
                    "role_id" => $role_id
                ]);
            }
        }
    }
    //
    public function getClasses()
    {
        // every call to mylionsgeek to academy specific route 
        // requires "x-api-key" header to be included in this case it is a secrete code

        // call mylionsgeek to get classes there coaches and there students data
        try {
            $classes = Http::withHeaders([
                "x-api-key" => env("CLIENT_SECRET"),
            ])->get(env("CENTRAL_HOST_URL") . env("CENTRAL_HOST_CLASSES_URL"));
            $classes->throw();
        } catch (\Throwable $th) {
            log($th->getCode() . " : " . $th->getMessage());
            return redirect()->intended();
        }
        if ($classes) {
            foreach ($classes->json() ?? [] as $key => $class) {
                // create or update the class info 
                $formation = Classes::where("central_id", $class["central_id"])->first();
                if (!$formation) {
                    $formation = Classes::create(
                        [
                            "central_id" => $class["central_id"],
                            "name" => $class["type"] . " " . $class["class"] ?? 1.  . " promo " . $class["promo"],
                            "promo" => $class["promo"],
                            "type" => $class["type"],
                            "class" => $class["class"] ?? 1,
                            "start_time" => $class["period"]["start"],
                            "end_time" => $class["period"]["end"],
                        ]
                    );
                } else {
                    $formation->update([
                        [
                            "central_id" => $class["central_id"],
                            "name" => $class["type"] . " promo " . $class["promo"],
                            "start_time" => $class["period"]["start"],
                            "end_time" => $class["period"]["end"],
                        ]
                    ]);
                }

                // create or update the coaches info 
                foreach ($class["coaches"] ?? [] as $ref => $coach) {
                    $user = User::where("central_id", $coach["central_id"])->first();
                    if (!$user) {
                        $user =  User::create(
                            [
                                "central_id" => $coach["central_id"],
                                "name" => $coach["name"] ?? "",
                                "email" => $coach["email"] ?? "",
                                "avatar" => $coach["avatar"],
                                "promo" => $coach["promo"],
                                "field" => $coach["field"],
                                "status" => $coach["status"],
                            ]
                        );
                    } else {
                        $user->update(
                            [
                                "central_id" => $coach["central_id"],
                                "name" => $coach["name"] ?? "",
                                "email" => $coach["email"] ?? "",
                                "avatar" => $coach["avatar"],
                                "promo" => $coach["promo"],
                                "field" => $coach["field"],
                                "status" => $coach["status"],
                            ]
                        );
                    }
                    $this->get_avatars_service->get($coach["avatar"]);
                    $this->assignRoles($coach["roles"], $user);
                    $this->assignClass($formation, $user, true);
                }

                // create or update the students
                foreach ($class["users"] ?? [] as $student) {
                    $user = User::where("central_id", $student["central_id"])->first();
                    if (!$user) {
                        $user = User::create(
                            [
                                "central_id" => $student["central_id"],
                                "name" => $student["name"] ?? "",
                                "email" => $student["email"] ?? "",
                                "avatar" => $student["avatar"],
                                "promo" => $student["promo"],
                                "field" => $student["field"],
                                "status" => $student["status"],
                            ]
                        );
                    } else {
                        $user->update(
                            [
                                "central_id" => $student["central_id"],
                                "name" => $student["name"] ?? "",
                                "email" => $student["email"] ?? "",
                                "avatar" => $student["avatar"],
                                "promo" => $student["promo"],
                                "field" => $student["field"],
                                "status" => $student["status"],

                            ]
                        );
                    }
                    $this->get_avatars_service->get($student["avatar"]);
                    $this->assignRoles($student["roles"], $user);
                    $this->assignClass($formation, $user);
                }
            }
            // get users socials
            $this->getSocialsService->getSocials();
            // get users wakatime Kyes
            $this->get_waka_time_keys->getWakaTimeKeys();
        }
        return redirect()->back();
    }
}

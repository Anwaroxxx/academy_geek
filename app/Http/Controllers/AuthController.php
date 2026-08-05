<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\Role;
use App\Models\User;
use App\Models\UserClass;
use App\Models\User_role;
use App\Services\GetAvatarsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

use function Illuminate\Log\log;

class AuthController extends Controller
{
    public function __construct(private GetAvatarsService $getAvatars)
    {
    }
    public function login()
    {
        if (Auth::check()) {
            return redirect("/dashboard");
        }
        return redirect(env("CENTRAL_HOST_URL") . env("CENTRAL_HOST_AUTH"));
    }

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


    public function loginCallback(string $code): ?RedirectResponse
    {
        // every call to mylionsgeek to academy specific route requires "x-api-key" header to be included in this case it is a secrete code

        // mylionsGeek seends a code in the route callback ,
        //  that code is sent back to get a token containing the current user info
        try {
            $token = Http::withHeaders([
                "x-api-key" => env("CLIENT_SECRET"),
                "code" => $code,
            ])->get(env("CENTRAL_HOST_URL") . env("CENTRAL_HOST_TOKEN"));
            $token->throw();
        } catch (\Throwable $th) {
            log($th->getCode() ?? "Connection failed" . " : " . $th->getMessage() ?? "somthing went wrong");
            return redirect()->intended();
        }
        if (!$token["central_id"]) {
            return response()->redirectTo("/");
        }

        // if user does not exist create one else just
        //  update the info of the existing user and login the user in
        $user = User::where("central_id", $token["central_id"])->first();
        if (!$user) {
            $user = User::create([
                "central_id" => $token["central_id"] ?? null,
                "name" => $token["name"] ?? "",
                "email" => $token["email"] ?? "",
                "avatar" => $token["avatar"] ?? "",
                "promo" => $token["promo"] ?? "",
                "field" => $token["field"] ?? "",
                "status" => $token["status"] ?? "",
            ]);
        } else {
            $user->update([
                "central_id" => $token["central_id"] ?? null,
                "name" => $token["name"] ?? "",
                "email" => $token["email"] ?? "",
                "avatar" => $token["avatar"] ?? "",
                "promo" => $token["promo"] ?? "",
                "field" => $token["field"] ?? "",
                "status" => $token["status"] ?? "",
            ]);
        }

        $roles = $token["roles"] ?? [];
        if (is_string($roles)) {
            $roles = array_filter(array_map('trim', explode(',', $roles)));
        }

        $this->assignRoles((array) $roles, $user);
        $this->getAvatars->get($token["avatar"] ?? null);

        Auth::login($user);
        return redirect()->intended("dashboard");
    }
}

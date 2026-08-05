<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use App\Models\User_role;


class HandleCoach
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $role_id = Role::where("role", "coach")->value('id');
        $user_id = Auth::user()->id;
        $coach = User_role::where("user_id", $user_id)
            ->where("role_id", $role_id)->first();

        if (!$coach) {
            return redirect("/dashboard");
        }

        return $next($request);
    }
}

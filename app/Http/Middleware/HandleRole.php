<?php

namespace App\Http\Middleware;

use App\Models\Role;
use App\Models\User_role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HandleRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = Auth::user();

        if (!$user || empty($roles)) {
            return redirect('/dashboard');
        }

        $allowedRoles = array_filter(array_map('trim', $roles));

        if (!$this->userHasAnyRole($user, $allowedRoles)) {
            return redirect('/dashboard');
        }

        return $next($request);
    }

    private function userHasAnyRole($user, array $allowedRoles): bool
    {
        if (empty($allowedRoles)) {
            return false;
        }

        return $user->Roles()->whereIn('role', $allowedRoles)->exists();
    }
}

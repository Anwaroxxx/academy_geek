<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $adminRoleId = DB::table('roles')->where('role', 'admin')->value('id');

        if ($adminRoleId === null) {
            $adminRoleId = DB::table('roles')->insertGetId([
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $superAdminRoleId = DB::table('roles')->where('role', 'super_admin')->value('id');

        if ($superAdminRoleId === null) {
            return;
        }

        DB::table('user_roles')
            ->where('role_id', $superAdminRoleId)
            ->update(['role_id' => $adminRoleId]);

        DB::table('roles')->where('id', $superAdminRoleId)->delete();
    }

    public function down(): void
    {
    }
};
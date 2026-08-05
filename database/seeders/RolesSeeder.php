<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            "admin",
            "coach",
            "student",
        ];
        //
        foreach ($roles as $role) {
            Role::create([
                "role" => $role,
            ]);
        }
    }
}

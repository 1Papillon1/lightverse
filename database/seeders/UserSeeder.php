<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();

        if (!User::where('username', 'admin')->exists()) {
            $admin = User::create([
                'username' => 'admin',
                'email' => 'admin@lightverse.cloud',
                'password' => Hash::make('admin123'),
            ]);

            if ($adminRole) {
                $admin->roles()->attach($adminRole->id);
            }
        }
    }
}

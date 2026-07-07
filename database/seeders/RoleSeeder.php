<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'admin',        'description' => 'Full access to system administration'],
            ['name' => 'moderator',    'description' => 'Can manage users and monitor transactions'],
            ['name' => 'user',         'description' => 'Standard user with wallet and transaction access'],
            ['name' => 'kyc_verified', 'description' => 'User verified through KYC process'],
            ['name' => 'merchant',     'description' => 'Business account for accepting payments'],
            ['name' => 'developer',    'description' => 'Access to developer APIs and tools'],
            ['name' => 'banned',       'description' => 'Access denied - banned user'],
        ];

        DB::table('roles')->insert($roles);
    }
}

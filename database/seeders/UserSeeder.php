<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = config('services.seeder_password');

        // Fixed named accounts — safe to re-run (firstOrCreate)
        $fixed = [
            [
                'name'              => 'Admin User',
                'email'             => 'admin@example.com',
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'QA Engineer',
                'email'             => 'qa@example.com',
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Developer One',
                'email'             => 'dev1@example.com',
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Developer Two',
                'email'             => 'dev2@example.com',
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Project Manager',
                'email'             => 'pm@example.com',
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($fixed as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }

        // 10 additional fake users
        User::factory(10)->create();
    }
}
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = env('SEEDER_DEFAULT_PASSWORD', 'password');

        $fixed = [
            [
                'name'              => env('ADMIN_NAME', 'Admin User'),
                'email'             => env('ADMIN_EMAIL', 'admin@example.com'),
                'password'          => Hash::make(env('ADMIN_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => true,
            ],
            [
                'name'              => env('QA_NAME', 'QA Engineer'),
                'email'             => env('QA_EMAIL', 'qa@example.com'),
                'password'          => Hash::make(env('QA_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
            [
                'name'              => env('DEV1_NAME', 'Developer One'),
                'email'             => env('DEV1_EMAIL', 'dev1@example.com'),
                'password'          => Hash::make(env('DEV1_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
            [
                'name'              => env('DEV2_NAME', 'Developer Two'),
                'email'             => env('DEV2_EMAIL', 'dev2@example.com'),
                'password'          => Hash::make(env('DEV2_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
            [
                'name'              => env('PM_NAME', 'Project Manager'),
                'email'             => env('PM_EMAIL', 'pm@example.com'),
                'password'          => Hash::make(env('PM_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
        ];

        foreach ($fixed as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }

        // Extra fake users (local/dev only)
        if (app()->environment('local')) {
            User::factory(10)->create();
        }
    }
}
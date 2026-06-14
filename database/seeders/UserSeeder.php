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
                'name'              => env('ADMIN_NAME'),
                'email'             => env('ADMIN_EMAIL'),
                'password'          => Hash::make(env('ADMIN_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => true,
            ],
            [
                'name'              => env('QA_NAME'),
                'email'             => env('QA_EMAIL'),
                'password'          => Hash::make(env('QA_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
            [
                'name'              => env('DEV1_NAME'),
                'email'             => env('DEV1_EMAIL'),
                'password'          => Hash::make(env('DEV1_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
            [
                'name'              => env('DEV2_NAME'),
                'email'             => env('DEV2_EMAIL'),
                'password'          => Hash::make(env('DEV2_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
            [
                'name'              => env('PM_NAME'),
                'email'             => env('PM_EMAIL'),
                'password'          => Hash::make(env('PM_PASSWORD', $defaultPassword)),
                'email_verified_at' => now(),
                'is_admin'          => false,
            ],
        ];

        // Skip any users where email is not set in env
        $fixed = array_filter($fixed, function ($u) {
            return !empty($u['email']);
        });

        foreach ($fixed as $data) {
            User::firstOrCreate(['email' => $data['email']], $data);
        }

        // Extra fake users (local/dev only)
        if (app()->environment('local')) {
            User::factory(10)->create();
        }
    }
}
<?php

namespace Database\Seeders;

use App\Models\Protocol;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProtocolSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        // Requirement: at least 12 protocols
        Protocol::factory(12)->make()->each(function ($protocol) use ($users) {
            $protocol->user_id = $users->random()->id;
            $protocol->save();
        });
    }
}
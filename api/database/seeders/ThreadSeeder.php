<?php

namespace Database\Seeders;

use App\Models\Protocol;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Database\Seeder;

class ThreadSeeder extends Seeder
{
    public function run(): void
    {
        $users     = User::all();
        $protocols = Protocol::all();

        // Requirement: at least 10 threads
        // Distribute threads across protocols
        Thread::factory(10)->make()->each(function ($thread) use ($users, $protocols) {
            $thread->user_id     = $users->random()->id;
            $thread->protocol_id = $protocols->random()->id;
            $thread->save();
        });
    }
}
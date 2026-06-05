<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Thread;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;

class VoteSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        // Votes on Threads — each user votes on a random subset, once per thread
        Thread::all()->each(function ($thread) use ($users) {
            $voters = $users->random(rand(2, min(6, $users->count())));

            $voters->each(function ($user) use ($thread) {
                Vote::factory()->create([
                    'user_id'      => $user->id,
                    'voteable_id'  => $thread->id,
                    'voteable_type' => Thread::class,
                ]);
            });
        });

        // Votes on Comments — each user votes on a random subset, once per comment
        Comment::all()->each(function ($comment) use ($users) {
            $voters = $users->random(rand(1, min(4, $users->count())));

            $voters->each(function ($user) use ($comment) {
                Vote::factory()->create([
                    'user_id'      => $user->id,
                    'voteable_id'  => $comment->id,
                    'voteable_type' => Comment::class,
                ]);
            });
        });
    }
}
<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        $users   = User::all();
        $threads = Thread::all();

        // Create 3 top-level comments per thread
        $threads->each(function ($thread) use ($users) {
            $topLevelComments = Comment::factory(3)->create([
                'user_id'   => $users->random()->id,
                'thread_id' => $thread->id,
                'parent_id' => null,
            ]);

            // Create 2 nested replies per top-level comment
            $topLevelComments->each(function ($parent) use ($users, $thread) {
                Comment::factory(2)->create([
                    'user_id'   => $users->random()->id,
                    'thread_id' => $thread->id,
                    'parent_id' => $parent->id,
                ]);
            });
        });
    }
}
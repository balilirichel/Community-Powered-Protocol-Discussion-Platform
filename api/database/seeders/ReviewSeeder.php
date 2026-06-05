<?php

namespace Database\Seeders;

use App\Models\Protocol;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $users     = User::all();
        $protocols = Protocol::all();

        // Each protocol gets 2–4 reviews from different users
        $protocols->each(function ($protocol) use ($users) {
            $reviewers = $users->random(rand(2, 4));

            $reviewers->each(function ($user) use ($protocol) {
                Review::factory()->create([
                    'user_id'     => $user->id,
                    'protocol_id' => $protocol->id,
                ]);
            });
        });
    }
}
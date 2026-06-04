<?php

namespace Database\Factories;

use App\Models\Protocol;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Thread>
 */
class ThreadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'protocol_id' => Protocol::factory(),
            'title'       => $this->faker->sentence(6),
            'body'        => $this->faker->paragraphs(3, true),
        ];
    }
}
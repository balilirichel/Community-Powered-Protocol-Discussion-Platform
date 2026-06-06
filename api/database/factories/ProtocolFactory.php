<?php

namespace Database\Factories;

use App\Models\Protocol;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Protocol>
 */
class ProtocolFactory extends Factory
{
    public function definition(): array
    {
        $tagPool = [
            'meditation', 'breathwork', 'fasting', 'nutrition', 'sleep',
            'cold-therapy', 'yoga', 'journaling', 'hydration', 'movement',
            'detox', 'mindfulness', 'strength', 'recovery', 'herbalism',
        ];

        return [
            'user_id' => User::factory(),
            'title'   => $this->faker->unique()->sentence(5),
            'content' => $this->faker->paragraphs(4, true),
            'tags'    => $this->faker->randomElements($tagPool, rand(2, 5)),
            
        ];
    }
}
<?php

namespace Database\Factories;

use App\Models\Protocol;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'protocol_id' => Protocol::factory(),
            'rating'      => $this->faker->numberBetween(1, 5),
            'feedback'    => $this->faker->optional(0.75)->paragraph(),
        ];
    }
}
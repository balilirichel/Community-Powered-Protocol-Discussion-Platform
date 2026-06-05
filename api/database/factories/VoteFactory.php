<?php

namespace Database\Factories;

use App\Models\Vote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vote>
 */
class VoteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'      => User::factory(),
            'voteable_id'  => null,
            'voteable_type' => null,
            'value'        => $this->faker->randomElement([1, -1]),
        ];
    }
}
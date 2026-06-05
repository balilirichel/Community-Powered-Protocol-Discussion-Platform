<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comment>
 */
class CommentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'   => User::factory(),
            'thread_id' => Thread::factory(),
            'parent_id' => null,
            'body'      => $this->faker->paragraph(),
        ];
    }

    /**
     * Indicate this comment is a reply to a parent comment.
     */
    public function asReply(int $parentId, int $threadId): static
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => $parentId,
            'thread_id' => $threadId,
        ]);
    }
}
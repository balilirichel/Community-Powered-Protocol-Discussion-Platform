<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VoteRequest;
use App\Http\Resources\VoteResource;
use App\Models\Comment;
use App\Models\Thread;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class VoteController extends Controller
{
    /**
     * POST /api/threads/{thread}/vote
     * Upvote or downvote a thread.
     * - If the user has not voted: create the vote.
     * - If the user votes the same value again: remove the vote (toggle off).
     * - If the user votes a different value: update the existing vote.
     */
    public function voteThread(VoteRequest $request, Thread $thread): VoteResource|JsonResponse
    {
        return $this->handleVote($request->input('value'), $thread);
    }

    /**
     * POST /api/comments/{comment}/vote
     * Upvote or downvote a comment.
     */
    public function voteComment(VoteRequest $request, Comment $comment): VoteResource|JsonResponse
    {
        return $this->handleVote($request->input('value'), $comment);
    }

    /**
     * DELETE /api/threads/{thread}/vote
     * Explicitly remove a vote from a thread.
     */
    public function unvoteThread(Thread $thread): JsonResponse
    {
        return $this->handleUnvote($thread);
    }

    /**
     * DELETE /api/comments/{comment}/vote
     * Explicitly remove a vote from a comment.
     */
    public function unvoteComment(Comment $comment): JsonResponse
    {
        return $this->handleUnvote($comment);
    }

    /**
     * Core vote logic shared between threads and comments.
     * Handles create, toggle off, and switch direction.
     */
    private function handleVote(int $value, Thread|Comment $voteable): VoteResource|JsonResponse
    {
        $existingVote = Vote::where('user_id', Auth::id())
            ->where('voteable_id', $voteable->id)
            ->where('voteable_type', $voteable->getMorphClass())
            ->first();

        // Toggle off: same value submitted again — remove the vote
        if ($existingVote && $existingVote->value === $value) {
            $existingVote->delete();

            return response()->json([
                'message' => 'Vote removed.',
            ], 200);
        }

        // Switch direction: different value — update existing vote
        if ($existingVote) {
            $existingVote->update(['value' => $value]);
            $existingVote->load('user');

            return new VoteResource($existingVote);
        }

        // New vote
        $vote = Vote::create([
            'user_id'      => Auth::id(),
            'voteable_id'  => $voteable->id,
            'voteable_type' => $voteable->getMorphClass(),
            'value'        => $value,
        ]);

        $vote->load('user');

        return new VoteResource($vote);
    }

    /**
     * Core unvote logic shared between threads and comments.
     */
    private function handleUnvote(Thread|Comment $voteable): JsonResponse
    {
        $deleted = Vote::where('user_id', Auth::id())
            ->where('voteable_id', $voteable->id)
            ->where('voteable_type', $voteable->getMorphClass())
            ->delete();

        if (! $deleted) {
            return response()->json([
                'message' => 'No vote found to remove.',
            ], 404);
        }

        return response()->json([
            'message' => 'Vote removed successfully.',
        ], 200);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Thread;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CommentController extends Controller
{
    use AuthorizesRequests;
    /**
     * GET /api/threads/{thread}/comments
     * Returns only top-level comments with their nested replies.
     */
    public function index(Request $request, Thread $thread): AnonymousResourceCollection
    {
        $comments = $thread->comments()
            ->with([
                'user',
                'replies' => function ($query) {
                    $query->with('user')
                          ->withCount([
                              'votes as upvotes_count'   => fn($q) => $q->where('value', 1),
                              'votes as downvotes_count' => fn($q) => $q->where('value', -1),
                          ]);
                },
            ])
            ->withCount([
                'votes as upvotes_count'   => fn($q) => $q->where('value', 1),
                'votes as downvotes_count' => fn($q) => $q->where('value', -1),
            ])
            ->whereNull('parent_id') // top-level only; replies are nested inside
            ->orderBy('created_at')
            ->paginate(20);

        return CommentResource::collection($comments);
    }

    /**
     * POST /api/threads/{thread}/comments
     * Creates a top-level comment or a reply (when parent_id is provided).
     */
    public function store(StoreCommentRequest $request, Thread $thread): CommentResource
    {
        // If parent_id is provided, ensure the parent comment belongs to this thread
        if ($request->filled('parent_id')) {
            $parent = Comment::findOrFail($request->input('parent_id'));

            if ($parent->thread_id !== $thread->id) {
                abort(422, 'Parent comment does not belong to this thread.');
            }
        }

        $comment = $thread->comments()->create([
            'body'      => $request->input('body'),
            'parent_id' => $request->input('parent_id'),
            'user_id'   => Auth::id(),
        ]);

        $comment->load(['user', 'replies']);

        return new CommentResource($comment);
    }

    /**
     * GET /api/threads/{thread}/comments/{comment}
     */
    public function show(Thread $thread, Comment $comment): CommentResource
    {
        $this->ensureBelongsToThread($thread, $comment);

        $comment->load([
            'user',
            'replies' => function ($query) {
                $query->with('user')
                      ->withCount([
                          'votes as upvotes_count'   => fn($q) => $q->where('value', 1),
                          'votes as downvotes_count' => fn($q) => $q->where('value', -1),
                      ]);
            },
        ])->loadCount([
            'votes as upvotes_count'   => fn($q) => $q->where('value', 1),
            'votes as downvotes_count' => fn($q) => $q->where('value', -1),
        ]);

        return new CommentResource($comment);
    }

    /**
     * PUT|PATCH /api/threads/{thread}/comments/{comment}
     * Only the body can be updated — parent_id and thread_id are immutable.
     */
    public function update(UpdateCommentRequest $request, Thread $thread, Comment $comment): CommentResource
    {
        $this->ensureBelongsToThread($thread, $comment);
        $this->authorize('update', $comment);

        $comment->update(['body' => $request->input('body')]);

        $comment->load(['user', 'replies']);

        return new CommentResource($comment);
    }

    /**
     * DELETE /api/threads/{thread}/comments/{comment}
     */
    public function destroy(Thread $thread, Comment $comment): JsonResponse
    {
        $this->ensureBelongsToThread($thread, $comment);
        $this->authorize('delete', $comment);

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully.',
        ], 200);
    }

    /**
     * Ensure the comment belongs to the given thread.
     */
    private function ensureBelongsToThread(Thread $thread, Comment $comment): void
    {
        if ($comment->thread_id !== $thread->id) {
            abort(404, 'Comment not found under this thread.');
        }
    }
}
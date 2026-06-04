<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreThreadRequest;
use App\Http\Requests\UpdateThreadRequest;
use App\Http\Resources\ThreadResource;
use App\Models\Protocol;
use App\Models\Thread;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ThreadController extends Controller
{
    use AuthorizesRequests;
    /**
     * GET /api/protocols/{protocol}/threads
     * Supports: sort_by = recent | most_upvoted
     */
    public function index(Request $request, Protocol $protocol): AnonymousResourceCollection
    {
        $query = $protocol->threads()
            ->with(['user', 'protocol'])
            ->withCount('comments')
            ->withCount([
                'votes as upvotes_count'   => fn($q) => $q->where('value', 1),
                'votes as downvotes_count' => fn($q) => $q->where('value', -1),
            ]);

        match ($request->input('sort_by')) {
            'most_upvoted' => $query->orderByDesc('upvotes_count'),
            default        => $query->orderByDesc('created_at'),
        };

        $threads = $query->paginate(15);

        return ThreadResource::collection($threads);
    }

    /**
     * POST /api/protocols/{protocol}/threads
     */
    public function store(StoreThreadRequest $request, Protocol $protocol): ThreadResource
    {
        $thread = $protocol->threads()->create([
            ...$request->validated(),
            'user_id' => Auth::id(),
        ]);

        $thread->load(['user', 'protocol']);

        return new ThreadResource($thread);
    }

    /**
     * GET /api/protocols/{protocol}/threads/{thread}
     */
    public function show(Protocol $protocol, Thread $thread): ThreadResource
    {
        $this->ensureBelongsToProtocol($protocol, $thread);

        $thread->load(['user', 'protocol'])
               ->loadCount([
                   'comments',
                   'votes as upvotes_count'   => fn($q) => $q->where('value', 1),
                   'votes as downvotes_count' => fn($q) => $q->where('value', -1),
               ]);

        return new ThreadResource($thread);
    }

    /**
     * PUT|PATCH /api/protocols/{protocol}/threads/{thread}
     */
    public function update(UpdateThreadRequest $request, Protocol $protocol, Thread $thread): ThreadResource
    {
        $this->ensureBelongsToProtocol($protocol, $thread);
        $this->authorize('update', $thread);

        $thread->update($request->validated());

        $thread->load(['user', 'protocol']);

        return new ThreadResource($thread);
    }

    /**
     * DELETE /api/protocols/{protocol}/threads/{thread}
     */
    public function destroy(Protocol $protocol, Thread $thread): JsonResponse
    {
        $this->ensureBelongsToProtocol($protocol, $thread);
        $this->authorize('delete', $thread);

        $thread->delete();

        return response()->json([
            'success' => true,
            'message' => 'Thread deleted successfully.',
        ], 200);
    }

    /**
     * Ensure the thread belongs to the given protocol.
     * Prevents accessing /protocols/2/threads/99 where thread 99 belongs to protocol 1.
     */
    private function ensureBelongsToProtocol(Protocol $protocol, Thread $thread): void
    {
        if ($thread->protocol_id !== $protocol->id) {
            abort(404, 'Thread not found under this protocol.');
        }
    }
}
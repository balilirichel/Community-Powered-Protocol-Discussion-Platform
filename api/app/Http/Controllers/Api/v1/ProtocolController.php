<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProtocolRequest;
use App\Http\Requests\UpdateProtocolRequest;
use App\Http\Resources\ProtocolResource;
use App\Models\Protocol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProtocolController extends Controller
{   
    use AuthorizesRequests;
    /**
     * GET /api/protocols
     * Supports filters: sort_by = recent | most_reviewed | highest_rated | most_upvoted
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Protocol::query()
            ->with('user')
            ->withCount(['threads', 'reviews']);

        // Sorting
        match ($request->input('sort_by')) {
            'most_reviewed'  => $query->orderByDesc('reviews_count'),
            'highest_rated'  => $query->orderByDesc('rating'),
            'most_upvoted'   => $query->withCount([
                                    'votes as upvotes_count' => fn($q) => $q->where('value', 1),
                                ])->orderByDesc('upvotes_count'),
            default          => $query->orderByDesc('created_at'), // most recent
        };

        $protocols = $query->paginate(15);

        return ProtocolResource::collection($protocols);
    }

    /**
     * POST /api/protocols
     */
    public function store(StoreProtocolRequest $request): ProtocolResource
    {
        $protocol = Auth::user()->protocols()->create($request->validated());

        $protocol->load('user');

        return new ProtocolResource($protocol);
    }

    /**
     * GET /api/protocols/{protocol}
     */
    public function show(Protocol $protocol): ProtocolResource
    {
        $protocol->load('user')
                 ->loadCount(['threads', 'reviews']);

        return new ProtocolResource($protocol);
    }

    /**
     * PUT/PATCH /api/protocols/{protocol}
     */
    public function update(UpdateProtocolRequest $request, Protocol $protocol): ProtocolResource
    {
        $this->authorize('update', $protocol);

        $protocol->update($request->validated());

        $protocol->load('user');

        return new ProtocolResource($protocol);
    }

    /**
     * DELETE /api/protocols/{protocol}
     */
    public function destroy(Protocol $protocol): JsonResponse
    {
        $this->authorize('delete', $protocol);

        $protocol->delete();

        return response()->json([
            'message' => 'Protocol deleted successfully.',
        ], 200);
    }
}
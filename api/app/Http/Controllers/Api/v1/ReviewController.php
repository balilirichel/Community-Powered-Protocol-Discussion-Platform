<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Protocol;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ReviewController extends Controller
{   
    use AuthorizesRequests;

    /**
     * GET /api/protocols/{protocol}/reviews
     * Supports: sort_by = recent | highest_rated
     */
    public function index(Request $request, Protocol $protocol): AnonymousResourceCollection
    {
        $query = $protocol->reviews()
            ->with(['user', 'protocol']);

        match ($request->input('sort_by')) {
            'highest_rated' => $query->orderByDesc('rating'),
            default         => $query->orderByDesc('created_at'),
        };

        $reviews = $query->paginate(15);

        return ReviewResource::collection($reviews);
    }

    /**
     * POST /api/protocols/{protocol}/reviews
     * A user can only post one review per protocol.
     */
    public function store(StoreReviewRequest $request, Protocol $protocol): ReviewResource|JsonResponse
    {
        $alreadyReviewed = $protocol->reviews()
            ->where('user_id', Auth::id())
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'You have already reviewed this protocol.',
            ], 422);
        }

        $review = $protocol->reviews()->create([
            'user_id'  => Auth::id(),
            'rating'   => $request->input('rating'),
            'feedback' => $request->input('feedback'),
        ]);

        $review->load(['user', 'protocol']);

        return new ReviewResource($review);
    }

    /**
     * GET /api/protocols/{protocol}/reviews/{review}
     */
    public function show(Protocol $protocol, Review $review): ReviewResource
    {
        $this->ensureBelongsToProtocol($protocol, $review);

        $review->load(['user', 'protocol']);

        return new ReviewResource($review);
    }

    /**
     * PUT|PATCH /api/protocols/{protocol}/reviews/{review}
     */
    public function update(UpdateReviewRequest $request, Protocol $protocol, Review $review): ReviewResource
    {
        $this->ensureBelongsToProtocol($protocol, $review);
        $this->authorize('update', $review);

        $review->update($request->validated());

        $review->load(['user', 'protocol']);

        return new ReviewResource($review);
    }

    /**
     * DELETE /api/protocols/{protocol}/reviews/{review}
     */
    public function destroy(Protocol $protocol, Review $review): JsonResponse
    {
        $this->ensureBelongsToProtocol($protocol, $review);
        $this->authorize('delete', $review);

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully.',
        ], 200);
    }

    /**
     * Ensure the review belongs to the given protocol.
     */
    private function ensureBelongsToProtocol(Protocol $protocol, Review $review): void
    {
        if ($review->protocol_id !== $protocol->id) {
            abort(404, 'Review not found under this protocol.');
        }
    }
}
<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
    /**
     * Handle the Review "created" event.
     */
    public function created(Review $review): void
    {
        $this->syncProtocolRating($review);
    }

    /**
     * Handle the Review "updated" event.
     */
    public function updated(Review $review): void
    {
        $this->syncProtocolRating($review);
    }

    /**
     * Handle the Review "deleted" event.
     */
    public function deleted(Review $review): void
    {
        $this->syncProtocolRating($review);
    }

    /**
     * Handle the Review "restored" event.
     */
    public function restored(Review $review): void
    {
        $this->syncProtocolRating($review);
    }

    /**
     * Handle the Review "force deleted" event.
     */
    public function forceDeleted(Review $review): void
    {
        $this->syncProtocolRating($review);
    }

    /**
     * Recalculate the protocol's average rating from all its reviews.
     */
    private function syncProtocolRating(Review $review): void
    {
        if (!$review->protocol) {
            $review->load('protocol');
        }

        $protocol = $review->protocol;
        $average = $protocol->reviews()->avg('rating') ?? 0.00;

        $protocol->update(['rating' => round($average, 2)]);
    }
}

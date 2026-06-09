<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
    /**
     * Recalculate protocol rating when a review is created.
     */
    public function created(Review $review): void
    {
        $review->protocol->recalculateRating();
    }

    /**
     * Recalculate when a review rating is updated.
     */
    public function updated(Review $review): void
    {
        if ($review->wasChanged('rating')) {
            $review->protocol->recalculateRating();
        }
    }

    /**
     * Recalculate when a review is deleted.
     */
    public function deleted(Review $review): void
    {
        $review->protocol->recalculateRating();
    }

    /**
     * Handle force-delete (if soft deletes are added later).
     */
    public function forceDeleted(Review $review): void
    {
        $review->protocol->recalculateRating();
    }
}
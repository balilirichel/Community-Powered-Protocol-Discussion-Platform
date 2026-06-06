import React from 'react';
import ReviewCard from './ReviewCard';
import type { Review } from '../../types/review';

// ****Skeleton loader ***********//***───
const ReviewCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gray-100" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 w-28 rounded bg-gray-100" />
        <div className="h-2.5 w-16 rounded bg-gray-100" />
      </div>
      <div className="h-3 w-20 rounded bg-gray-100" />
    </div>
    <div className="space-y-1.5">
      <div className="h-3 w-full rounded bg-gray-100" />
      <div className="h-3 w-4/5 rounded bg-gray-100" />
      <div className="h-3 w-3/5 rounded bg-gray-100" />
    </div>
  </div>
);

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  // user ID to determine if the review can be edited/deleted by the current user
  currentUserId?: number | null;
  /** Called when edit is requested for a review */
  onEdit?: (review: Review) => void;
  /** Called when delete is requested for a review */
  onDelete?: (review: Review) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, isLoading, error, currentUserId, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-center">
        <p className="text-sm font-medium text-red-600">Failed to load reviews</p>
        <p className="text-xs text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
        <div className="text-3xl mb-2">⭐</div>
        <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Be the first to share your experience with this protocol.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          canManage={Boolean(currentUserId && review.author?.id === currentUserId)}
          onEdit={onEdit ? () => onEdit(review) : undefined}
          onDelete={onDelete ? () => onDelete(review) : undefined}
        />
      ))}
    </div>
  );
};

export default ReviewList;

import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import StarRating from '../ui/StarRating';
import type { Review } from '../../types/review';

interface ReviewCardProps {
  review: Review;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const ReviewCard: React.FC<ReviewCardProps> = ({ review, canManage = false, onEdit, onDelete }) => (
  <article className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow duration-150">
    {/* Author row */}
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar name={review.author?.name ?? 'Anonymous'} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {review.author?.name ?? 'Anonymous'}
          </p>
          <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <StarRating rating={review.rating} size={14} />
          <span className="text-xs font-semibold text-amber-600 tabular-nums">
            {review.rating.toFixed(1)}
          </span>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Edit review"
              >
                <Edit3 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                aria-label="Delete review"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Feedback text */}
    {review.feedback && (
      <p className="text-sm text-gray-600 leading-relaxed">{review.feedback}</p>
    )}
  </article>
);

export default ReviewCard;

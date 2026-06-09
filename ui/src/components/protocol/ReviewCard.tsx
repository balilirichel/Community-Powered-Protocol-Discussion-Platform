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

const formatRelativeDate = (value: string) => {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, canManage = false, onEdit, onDelete }) => (
  <article className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:border-[#118451]/30 hover:shadow-sm transition-all duration-150 cursor-default">
    {/* Author row */}
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar name={review.author?.name ?? 'Anonymous'} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {review.author?.name ?? 'Anonymous'}
          </p>
          <p className="text-xs text-gray-400">{formatRelativeDate(review.created_at)}</p>
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

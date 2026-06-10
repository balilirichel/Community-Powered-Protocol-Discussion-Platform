import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import CreateReviewForm from './CreateReviewForm';
import ReviewList from './ReviewList';
import { useAppSelector } from '../../store/hooks';
import useRequireAuth from '../../hooks/useRequireAuth';
import { reviewService } from '../../api/reviewService';
import type { Protocol } from '../../types/protocol';
import type { Review } from '../../types/review';
import type { ApiError } from '../../types/api';

// ****Review Section ***********//***────
interface ReviewSectionProps {
  protocol: Protocol;
  onReviewAdded?: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ protocol, onReviewAdded }) => {
  const { isAuthenticated, open } = useRequireAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const currentUserId = useAppSelector((s) => s.auth.user?.id ?? null);


  const fetchReviews = useCallback(async () => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    try {
      const response = await reviewService.listByProtocol(protocol.id);
      if (!cancelled) {
        setReviews(response.data ?? []);
      }
    } catch (err) {
      if (!cancelled) {
        const apiError = err as ApiError;
        setError(apiError.message ?? 'Failed to load reviews.');
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false);
      }
    }
    return () => { cancelled = true; };
  }, [protocol.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSuccess = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    onReviewAdded?.();
  };

  const handleEditSuccess = (updated: Review) => {
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditingReview(null);
    onReviewAdded?.();
  };

  const handleEditRequest = (review: Review) => {
    setEditingReview(review);
    setShowForm(false);
  };

  const handleDelete = async (review: Review) => {
    // Confirm
    if (!window.confirm('Delete this review? This action cannot be undone.')) return;

    try {
      await reviewService.delete(protocol.id, review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      onReviewAdded?.();
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert('Failed to delete review. Please try again.');
    }
  };

  const reviewCount = reviews.length;

  const handleEditCancel = () => {
    setEditingReview(null);
  };

  const handleEditSubmit = async (updatedReview: Review) => {
    handleEditSuccess(updatedReview);
  };

  interface EditReviewFormProps {
    review: Review;
    protocolId: number;
    onCancel: () => void;
    onSuccess: (review: Review) => void;
  }

  const EditReviewForm: React.FC<EditReviewFormProps> = ({ review, protocolId, onCancel, onSuccess }) => {
    const [rating, setRating] = useState(review.rating);
    const [feedback, setFeedback] = useState(review.feedback ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = rating > 0 && feedback.trim().length > 0;

    const handleSubmit = async () => {
      if (!isValid || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);

      try {
        const updated = await reviewService.update(protocolId, review.id, {
          rating,
          feedback: feedback.trim(),
        });
        onSuccess(updated);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message ?? 'Failed to update review. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Edit Review</p>
            <p className="text-xs text-gray-500">Update your rating and feedback</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Your Rating <span className="text-gray-400 font-normal">(required)</span>
          </p>
          <div className="flex items-center gap-3">
            <StarRating rating={rating} size={30} interactive onChange={setRating} />
            {rating > 0 && (
              <span className="text-sm font-semibold text-amber-600">{rating} / 5</span>
            )}
          </div>
          {rating === 0 && (
            <p className="text-xs text-gray-400 mt-2">Select a rating before saving.</p>
          )}
        </div>

        <div>
          <label htmlFor="edit-review-feedback" className="text-sm font-semibold text-gray-700 block mb-1.5">
            Review <span className="text-red-400">*</span>
          </label>
          <textarea
            id="edit-review-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your updated experience with this protocol…"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">Ctrl+Enter to save</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Saving…' : 'Save Review'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <Plus size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {reviewCount > 0 ? `${reviewCount} Review${reviewCount === 1 ? '' : 's'}` : 'Reviews'}
            </h2>
            <p className="text-xs text-gray-500">Share feedback and help other readers.</p>
          </div>
        </div>

        <Button
          variant={showForm ? 'outline' : 'primary'}
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => {
            if (isAuthenticated) {
              setShowForm((value) => !value);
            } else {
              open();
            }
          }}
        >
          {showForm ? 'Cancel' : 'New Review'}
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm flex-shrink-0">
            <span className="text-2xl font-extrabold text-amber-600">
              {protocol.rating ? protocol.rating : '—'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <StarRating rating={protocol.rating ?? 0} size={18} showValue={false} />
            <p className="text-sm text-gray-600 mt-1">
              {reviewCount > 0
                ? `Based on ${reviewCount} review${reviewCount === 1 ? '' : 's'}`
                : 'No reviews yet'}
            </p>
          </div>
        </div>
      </div>

      {showForm && (
        <CreateReviewForm
          protocolId={protocol.id}
          onSuccess={(review) => {
            handleReviewSuccess(review);
            setShowForm(false);
          }}
        />
      )}

      {editingReview && (
        <EditReviewForm
          review={editingReview}
          protocolId={protocol.id}
          onCancel={handleEditCancel}
          onSuccess={handleEditSubmit}
        />
      )}

      <ReviewList
        reviews={reviews}
        isLoading={isLoading}
        error={error}
        currentUserId={currentUserId}
        onEdit={handleEditRequest}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ReviewSection;

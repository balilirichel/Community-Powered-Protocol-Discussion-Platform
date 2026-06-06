import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';
import ReviewList from './ReviewList';
import { useAppSelector } from '../../store/hooks';
import { reviewService } from '../../api/reviewService';
import type { Protocol } from '../../types/protocol';
import type { Review, CreateReviewRequest } from '../../types/review';
import type { ApiError } from '../../types/api';

// ****Add Review Modal ***********//***──
interface AddReviewModalProps {
  protocol: Protocol;
  onClose: () => void;
  onSuccess: (review: Review) => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({ protocol, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0 || !feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload: CreateReviewRequest = { rating, feedback: feedback.trim() };
      const created = await reviewService.create(protocol.id, payload);
      onSuccess(created);
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setSubmitError(apiError.message ?? 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Write a review"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl lg:rounded-2xl w-full max-w-lg p-6 shadow-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Write a Review</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{protocol.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Rating */}
        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating</p>
          <div className="flex items-center gap-3">
            <StarRating rating={rating} size={30} interactive onChange={setRating} />
            {rating > 0 && (
              <span className="text-sm font-bold text-amber-600">{rating} / 5</span>
            )}
          </div>
          {rating === 0 && (
            <p className="text-xs text-gray-400 mt-1.5">Tap a star to rate this protocol</p>
          )}
        </div>

        {/* Feedback */}
        <div className="mb-5">
          <label htmlFor="review-feedback" className="text-sm font-semibold text-gray-700 block mb-2">
            Your Review
          </label>
          <textarea
            id="review-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with this protocol…"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {feedback.length} chars
          </p>
        </div>

        {/* Error */}
        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {submitError}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            disabled={rating === 0 || !feedback.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ****Review Section ***********//***────
interface ReviewSectionProps {
  protocol: Protocol;
  onReviewAdded?: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ protocol, onReviewAdded }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
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

  return (
    <div className="space-y-5">
      {/* Rating summary card */}
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
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => setShowModal(true)}
          >
            Review
          </Button>
        </div>
      </div>

      {/* Review list */}
      <ReviewList
        reviews={reviews}
        isLoading={isLoading}
        error={error}
        currentUserId={currentUserId}
        onEdit={(r) => setEditingReview(r)}
        onDelete={handleDelete}
      />

      {/* Write review modal */}
      {showModal && (
        <AddReviewModal
          protocol={protocol}
          onClose={() => setShowModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {editingReview && (
        <EditReviewModal
          review={editingReview}
          protocol={protocol}
          onClose={() => setEditingReview(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

// ---------------- Edit Review Modal -------------------------------------
interface EditReviewModalProps {
  review: Review;
  protocol: Protocol;
  onClose: () => void;
  onSuccess: (review: Review) => void;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({ review, protocol, onClose, onSuccess }) => {
  const [rating, setRating] = useState(review.rating);
  const [feedback, setFeedback] = useState(review.feedback ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updated = await reviewService.update(protocol.id, review.id, { rating, feedback });
      onSuccess(updated);
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert('Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Edit review"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl lg:rounded-2xl w-full max-w-lg p-6 shadow-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Review</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{protocol.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating</p>
          <div className="flex items-center gap-3">
            <StarRating rating={rating} size={30} interactive onChange={setRating} />
            {rating > 0 && (
              <span className="text-sm font-bold text-amber-600">{rating} / 5</span>
            )}
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="edit-review-feedback" className="text-sm font-semibold text-gray-700 block mb-2">
            Your Review
          </label>
          <textarea
            id="edit-review-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with this protocol…"
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{feedback.length} chars</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;

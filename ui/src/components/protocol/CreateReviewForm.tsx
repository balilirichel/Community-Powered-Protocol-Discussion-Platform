import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../ui/Button';
import { reviewService } from '../../api/reviewService';
import useRequireAuth from '../../hooks/useRequireAuth';
import type { Review, CreateReviewRequest } from '../../types/review';
import type { ApiError } from '../../types/api';
import StarRating from '../ui/StarRating';

interface CreateReviewFormProps {
  protocolId: number;
  onSuccess: (review: Review) => void;
}

const CreateReviewForm: React.FC<CreateReviewFormProps> = ({ protocolId, onSuccess }) => {
  const { isAuthenticated, open } = useRequireAuth();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const isValid = rating > 0 && feedback.trim().length > 0;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      open();
      return;
    }
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});

    try {
      const payload: CreateReviewRequest = {
        rating,
        feedback: feedback.trim(),
      };
      const created = await reviewService.create(protocolId, payload);
      setRating(0);
      setFeedback('');
      onSuccess(created);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setError(apiError.message ?? 'Failed to submit review. Please try again.');
      }
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
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Your Rating <span className="text-gray-400 font-normal">(required)</span></p>
        <div className="flex items-center gap-3">
          <StarRating rating={rating} size={30} interactive onChange={setRating} />
          {rating > 0 && (
            <span className="text-sm font-semibold text-amber-600">{rating} / 5</span>
          )}
        </div>
        {rating === 0 && (
          <p className="text-xs text-gray-400 mt-2">Select a rating to unlock the review</p>
        )}
      </div>

      <div>
        <label htmlFor="review-feedback" className="text-sm font-semibold text-gray-700 block mb-1.5">
          Review <span className="text-red-400">*</span>
        </label>
        <textarea
          id="review-feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share your experience with this protocol…"
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none transition-colors"
        />
        {validationErrors.feedback && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.feedback[0]}</p>
        )}
        <p className="text-xs text-gray-400 mt-1 text-right">Ctrl+Enter to submit</p>
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
          icon={<Send size={14} />}
          iconPosition="right"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
};

export default CreateReviewForm;

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../ui/Button';
import { threadService } from '../../api/threadService';
import useRequireAuth from '../../hooks/useRequireAuth';
import type { Thread, CreateThreadRequest } from '../../types/thread';
import type { ApiError } from '../../types/api';

interface CreateThreadFormProps {
  protocolId: number;
  onSuccess: (thread: Thread) => void;
  /** Compact layout (no title field) used in the sidebar composer */
  compact?: boolean;
}

const CreateThreadForm: React.FC<CreateThreadFormProps> = ({
  protocolId,
  onSuccess,
  compact = false,
}) => {
  const { isAuthenticated, open } = useRequireAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const isValid = compact
    ? body.trim().length > 0
    : title.trim().length > 0 && body.trim().length > 0;

  const handleSubmit = async () => {
    if (!isAuthenticated) { open(); return; }
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});

    try {
      const payload: CreateThreadRequest = {
        title: compact ? body.trim().slice(0, 120) : title.trim(),
        body: body.trim(),
      };
      const created = await threadService.create(protocolId, payload);
      setTitle('');
      setBody('');
      onSuccess(created);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setError(apiError.message ?? 'Failed to post thread. Please try again.');
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

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start a new thread…"
            rows={2}
            aria-label="Thread message"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none bg-gray-50 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            aria-label="Post thread"
            className="absolute right-3 bottom-3 w-7 h-7 flex items-center justify-center rounded-full bg-[#118451] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#065c38] transition-colors cursor-pointer"
          >
            <Send size={13} />
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
      <div>
        <label htmlFor="thread-title" className="text-sm font-semibold text-gray-700 block mb-1.5">
          Thread Title <span className="text-red-400">*</span>
        </label>
        <input
          id="thread-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your question or discussion topic?"
          maxLength={200}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] transition-colors"
        />
        {validationErrors.title && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="thread-body" className="text-sm font-semibold text-gray-700 block mb-1.5">
          Details <span className="text-red-400">*</span>
        </label>
        <textarea
          id="thread-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Provide more context, share your experience, or ask your question in detail…"
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none transition-colors"
        />
        {validationErrors.body && (
          <p className="text-xs text-red-500 mt-1">{validationErrors.body[0]}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">Ctrl+Enter to post</p>
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
          {isSubmitting ? 'Posting…' : 'Post Thread'}
        </Button>
      </div>
    </div>
  );
};

export default CreateThreadForm;

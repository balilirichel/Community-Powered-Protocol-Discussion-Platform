import React from 'react';
import { CornerDownRight, Send } from 'lucide-react';
import Avatar from '../ui/Avatar';

interface CommentComposerProps {
  commentText: string;
  replyTo: { id: number; author: string } | null;
  isDesktop: boolean;
  isSubmitting: boolean;
  onChange: (text: string) => void;
  onSubmit: () => void;
  onCancelReply: () => void;
  composerRef?: React.RefObject<HTMLTextAreaElement | null>;
}

const CommentComposer: React.FC<CommentComposerProps> = ({
  commentText,
  replyTo,
  isDesktop,
  isSubmitting,
  onChange,
  onSubmit,
  onCancelReply,
  composerRef,
}) => {
  const canSubmit = commentText.trim().length > 0 && !isSubmitting;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit();
    }
  };

  return (
    <div
      id="compose-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 lg:static lg:border-t lg:border-gray-100 lg:px-5 lg:py-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      {/* Reply-to indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <CornerDownRight size={12} className="text-[#118451]" />
          <span className="text-xs text-gray-500">
            Replying to{' '}
            <span className="font-semibold text-[#118451]">@{replyTo.author}</span>
          </span>
          <button
            onClick={onCancelReply}
            className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <Avatar name="You" size="sm" />
        <div className="flex-1">
          <textarea
            ref={composerRef}
            id="comment-compose-input"
            value={commentText}
            onChange={(e) => onChange(e.target.value)}
            placeholder={replyTo ? `Reply to @${replyTo.author}…` : 'Add a comment…'}
            rows={isDesktop ? 3 : 1}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            className={[
              'w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm',
              'placeholder-gray-400 text-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451]',
              'resize-none transition-all bg-gray-50 focus:bg-white',
              'disabled:opacity-60',
              isDesktop ? '' : 'max-h-24',
            ].join(' ')}
          />
          {isDesktop && (
            <p className="text-xs text-gray-400 mt-1 pl-1">⌘ + Enter to post</p>
          )}
        </div>
        <button
          id="submit-comment-btn"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-label="Post comment"
          className={[
            'flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all cursor-pointer',
            canSubmit
              ? 'bg-[#118451] text-white hover:bg-[#065c38] shadow-sm'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed',
          ].join(' ')}
        >
          <Send size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default CommentComposer;

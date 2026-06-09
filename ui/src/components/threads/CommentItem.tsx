import React, { useEffect, useState } from 'react';
import { CornerDownRight, MoreHorizontal, ChevronDown } from 'lucide-react';
import Avatar from '../ui/Avatar';
import VoteController from '../ui/VoteController';
import type { Comment } from '../../types/comment';
import { commentService } from '../../api/commentService';

const formatRelativeDate = (value: string): string => {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

interface CommentItemProps {
  comment: Comment;
  level?: number;
  maxMobileDepth?: number;
  maxDesktopDepth?: number;
  isDesktop?: boolean;
  currentUserId?: number | null;
  onReply?: (commentId: number, authorName: string) => void;
  onCommentUpdated?: (updatedComment: Comment) => void;
  onCommentDeleted?: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  level = 0,
  maxMobileDepth = 2,
  maxDesktopDepth = 4,
  isDesktop = false,
  currentUserId,
  onReply,
  onCommentUpdated,
  onCommentDeleted,
}) => {
  const [showDeepReplies, setShowDeepReplies] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const maxDepth = isDesktop ? maxDesktopDepth : maxMobileDepth;
  const hasReplies = (comment.replies?.length ?? 0) > 0;
  const isAtDepthLimit = level >= maxDepth - 1;

  const upvotes = comment.upvotes_count ?? 0;
  const authorName = comment.author?.name ?? 'Unknown';
  const [votes, setVotes] = useState<number>(upvotes);
  const [userVote, setUserVote] = useState<1 | -1 | null>(() => {
    const raw = (comment as any).user_vote ?? (comment as any).vote ?? null;
    return typeof raw === 'number' ? (raw as 1 | -1) : null;
  });
  const [loading, setLoading] = useState(false);

  const isOwner = Boolean(currentUserId && comment.author?.id === currentUserId);

  useEffect(() => {
    setEditText(comment.body);
  }, [comment.body]);

  const handleSave = async () => {
    if (actionLoading || !comment.id || !editText.trim()) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const updated = await commentService.update(comment.thread_id, comment.id, {
        body: editText.trim(),
      });
      onCommentUpdated?.(updated);
      setIsEditing(false);
      setIsMenuOpen(false);
    } catch (err) {
      setActionError('Failed to save comment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (actionLoading || !comment.id) return;
    if (!window.confirm('Delete this comment? This action cannot be undone.')) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await commentService.delete(comment.thread_id, comment.id);
      onCommentDeleted?.(comment.id);
    } catch (err) {
      setActionError('Failed to delete comment. Please try again.');
    } finally {
      setActionLoading(false);
      setIsMenuOpen(false);
    }
  };

  const borderClasses =
    level === 1
      ? 'border-l-[2px] border-gray-200'
      : level >= 2
      ? 'border-l-[2px] border-[#e8f5f0]'
      : '';

  const marginLeft =
    level === 1
      ? 'ml-[14px] pl-3'
      : level === 2
      ? 'ml-[24px] pl-3'
      : level === 3
      ? 'ml-[34px] pl-3'
      : level >= 4
      ? 'ml-[44px] pl-3'
      : '';

  return (
    <div className={`${marginLeft} ${borderClasses}`}>
      <div className="py-3">
        {/* Author + time */}
        <div className="flex items-center gap-2 mb-1.5 relative">
          <Avatar name={authorName} size="xs" />
          <span className="text-xs font-semibold text-gray-800">{authorName}</span>
          <span className="text-xs text-gray-400">{formatRelativeDate(comment.created_at)}</span>

          {isOwner && (
            <div className="ml-auto relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl border border-gray-200 bg-white shadow-lg text-left z-20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body or inline editor */}
        {isEditing ? (
          <div className="space-y-3 mb-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              disabled={actionLoading}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none"
            />
            {actionError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{actionError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!editText.trim() || actionLoading}
                className="inline-flex items-center justify-center rounded-[2rem] bg-[#118451] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065c38] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.body);
                  setActionError(null);
                }}
                disabled={actionLoading}
                className="inline-flex items-center justify-center rounded-[2rem] border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.body}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <VoteController
            initialVotes={votes}
            userVote={userVote}
            size="sm"
            onVote={async (newVote) => {
              if (!comment.id || loading) return;

              const prevVotes = votes;
              const prevUser = userVote;

              const computeNewVotes = (
                prev: 1 | -1 | null,
                next: 1 | -1 | null,
                base: number,
              ) => {
                if (prev === next) return base;
                if (prev === null && next !== null) return base + next;
                if (prev !== null && next === null) return base - prev;
                if (prev !== null && next !== null) return base - prev + next;
                return base;
              };

              const newVotes = computeNewVotes(prevUser, newVote, prevVotes);
              setVotes(newVotes);
              setUserVote(newVote);
              setLoading(true);

              try {
                if (newVote === 1) {
                  await commentService.upvote(comment.id, { vote: 1 });
                } else {
                  await commentService.removeVote(comment.id);
                }
              } catch (err) {
                setVotes(prevVotes);
                setUserVote(prevUser);
                // eslint-disable-next-line no-alert
                alert('Vote failed. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
          />
          <button
            onClick={() => onReply?.(comment.id, authorName)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#118451] cursor-pointer transition-colors font-medium"
          >
            <CornerDownRight size={12} />
            Reply
          </button>
        </div>
      </div>

      {/* Render nested replies */}
      {hasReplies && (
        <div>
          {isAtDepthLimit && !showDeepReplies ? (
            <button
              onClick={() => setShowDeepReplies(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#118451] hover:text-[#065c38] cursor-pointer py-1.5 mb-2 ml-2"
            >
              <ChevronDown size={13} />
              {comment.replies!.length} more{' '}
              {comment.replies!.length === 1 ? 'reply' : 'replies'}
            </button>
          ) : (
            comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                level={level + 1}
                maxMobileDepth={maxMobileDepth}
                maxDesktopDepth={maxDesktopDepth}
                isDesktop={isDesktop}
                currentUserId={currentUserId}
                onReply={onReply}
                onCommentUpdated={onCommentUpdated}
                onCommentDeleted={onCommentDeleted}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;

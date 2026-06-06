import React, { useState } from 'react';
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
  onReply?: (commentId: number, authorName: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  level = 0,
  maxMobileDepth = 2,
  maxDesktopDepth = 4,
  isDesktop = false,
  onReply,
}) => {
  const [showDeepReplies, setShowDeepReplies] = useState(false);

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
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar name={authorName} size="xs" />
          <span className="text-xs font-semibold text-gray-800">{authorName}</span>
          <span className="text-xs text-gray-400">{formatRelativeDate(comment.created_at)}</span>
          <button className="ml-auto text-gray-300 hover:text-gray-500 cursor-pointer">
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.body}</p>

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

                // refresh authoritative counts for the comment
                // comment list endpoints return paginated data; to keep simple, try to rely on success
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
                onReply={onReply}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;

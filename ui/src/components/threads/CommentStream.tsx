import React from 'react';
import { MessageSquare } from 'lucide-react';
import CommentItem from './CommentItem';
import type { Comment } from '../../types/comment';

interface CommentStreamProps {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  isDesktop: boolean;
  currentUserId?: number | null;
  onReply: (commentId: number, authorName: string) => void;
  onCommentUpdated: (updatedComment: Comment) => void;
  onCommentDeleted: (commentId: number) => void;
}

const CommentStreamSkeleton: React.FC = () => (
  <div className="divide-y divide-gray-50 animate-pulse">
    {[1, 2, 3].map((n) => (
      <div key={n} className="py-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gray-100" />
          <div className="h-3 w-24 rounded bg-gray-100" />
          <div className="h-3 w-12 rounded bg-gray-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 rounded bg-gray-100 w-full" />
          <div className="h-3 rounded bg-gray-100 w-5/6" />
          <div className="h-3 rounded bg-gray-100 w-4/6" />
        </div>
      </div>
    ))}
  </div>
);

const CommentStream: React.FC<CommentStreamProps> = ({
  comments,
  isLoading,
  error,
  isDesktop,
  currentUserId,
  onReply,
  onCommentUpdated,
  onCommentDeleted,
}) => {
  if (isLoading) {
    return (
      <section
        id="comment-stream"
        className="flex-1 overflow-y-auto px-4 py-4 pb-32 lg:pb-8"
      >
        <CommentStreamSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="comment-stream"
        className="flex-1 overflow-y-auto px-4 py-4 pb-32 lg:pb-8"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-semibold text-gray-700">Failed to load comments</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
      </section>
    );
  }

  if (comments.length === 0) {
    return (
      <section
        id="comment-stream"
        className="flex-1 overflow-y-auto px-4 py-4 pb-32 lg:pb-8"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-700">No comments yet</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="comment-stream"
      className="flex-1 overflow-y-auto px-4 py-4 pb-32 lg:pb-8 divide-y divide-gray-50"
    >
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          level={0}
          maxMobileDepth={6}    
          maxDesktopDepth={8}   
          isDesktop={isDesktop}
          currentUserId={currentUserId}
          onReply={onReply}
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
        />
      ))}
    </section>
  );
};

export default CommentStream;

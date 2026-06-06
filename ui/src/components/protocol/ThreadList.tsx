import React from 'react';
import ThreadCard from './ThreadCard';
import type { Thread } from '../../types/thread';

// ****Skeleton card ***********//***─────
const ThreadCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={['bg-white rounded-2xl border border-gray-100 animate-pulse', compact ? 'p-4' : 'p-5'].join(' ')}>
    <div className="flex items-center gap-2 mb-2.5">
      <div className="w-6 h-6 rounded-full bg-gray-100" />
      <div className="h-2.5 w-24 rounded bg-gray-100 flex-1" />
      <div className="h-2.5 w-10 rounded bg-gray-100" />
    </div>
    <div className="h-3.5 w-3/4 rounded bg-gray-100 mb-2" />
    {!compact && (
      <>
        <div className="h-2.5 w-full rounded bg-gray-100 mb-1" />
        <div className="h-2.5 w-4/5 rounded bg-gray-100 mb-3" />
      </>
    )}
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-12 rounded bg-gray-100" />
    </div>
  </div>
);

interface ThreadListProps {
  threads: Thread[];
  protocolId: number;
  isLoading: boolean;
  error: string | null;
  compact?: boolean;
  /** If set, only show the first N threads */
  limit?: number;
  currentUserId?: number | null;
  onEdit?: (thread: Thread) => void;
  onDelete?: (thread: Thread) => void;
}

const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  protocolId,
  isLoading,
  error,
  compact = false,
  limit,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: compact ? 3 : 4 }).map((_, i) => (
          <ThreadCardSkeleton key={i} compact={compact} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-center">
        <p className="text-sm font-medium text-red-600">Failed to load threads</p>
        <p className="text-xs text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  const visible = limit ? threads.slice(0, limit) : threads;

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
        <div className="text-3xl mb-2">💬</div>
        <p className="text-sm font-semibold text-gray-700">No threads yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Be the first to start a discussion on this protocol.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((thread) => {
        const canManage = Boolean(
          currentUserId && (thread.user?.id ?? thread.author?.id) === currentUserId,
        );

        return (
          <ThreadCard
            key={thread.id}
            thread={thread}
            protocolId={protocolId}
            compact={compact}
            canManage={canManage}
            onEdit={onEdit ? () => onEdit(thread) : undefined}
            onDelete={onDelete ? () => onDelete(thread) : undefined}
          />
        );
      })}
    </div>
  );
};

export default ThreadList;

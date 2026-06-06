import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowUp } from 'lucide-react';
import Avatar from '../ui/Avatar';
import type { Thread } from '../../types/thread';

interface ThreadCardProps {
  thread: Thread;
  protocolId?: number;
  compact?: boolean;
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

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, protocolId, compact = false, canManage = false, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const authorName = thread.user?.name ?? thread.author?.name ?? 'Unknown';

  const handleNavigate = () => {
    if (protocolId == null) return;
    navigate(`/threads/${thread.id}`, { state: { protocolId } });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
      className={[
        'w-full text-left bg-white rounded-2xl border border-gray-100',
        'hover:border-[#118451]/30 hover:shadow-sm transition-all duration-150',
        compact ? 'p-4' : 'p-5',
        'cursor-pointer',
      ].join(' ')}
    >
      {/* Author row */}
      <div className="flex items-center gap-2 mb-2.5">
        <Avatar name={authorName} size="xs" />
        <span className="text-xs text-gray-500 font-medium truncate flex-1">{authorName}</span>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {formatRelativeDate(thread.created_at)}
        </span>
      </div>

      {/* Title */}
      <h3 className={['font-semibold text-gray-900 mb-2 line-clamp-2', compact ? 'text-sm' : 'text-sm'].join(' ')}>
        {thread.title}
      </h3>

      {/* Body snippet */}
      {!compact && thread.body && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {thread.body}
        </p>
      )}

      {canManage && (onEdit || onDelete) && (
        <div className="flex items-center gap-3 mb-3">
          {onEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="text-xs font-semibold text-[#118451] hover:text-[#065c38] transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Metrics */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-400">
          <MessageSquare size={12} />
          <span className="text-xs font-medium text-gray-500">
            {thread.comments_count ?? 0}
          </span>
        </div>
        {(thread.upvotes_count ?? 0) > 0 && (
          <>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1 text-[#118451]">
              <ArrowUp size={12} strokeWidth={2.5} />
              <span className="text-xs font-semibold">{thread.upvotes_count}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThreadCard;

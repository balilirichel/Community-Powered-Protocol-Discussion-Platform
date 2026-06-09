import React, { useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import ThreadList from './ThreadList';
import CreateThreadForm from './CreateThreadForm';
import { useAppSelector } from '../../store/hooks';
import { threadService } from '../../api/threadService';
import type { Protocol } from '../../types/protocol';
import type { Thread } from '../../types/thread';
import type { ApiError } from '../../types/api';

// ****Create Thread Modal (mobile/tablet) ──────────────────────────────────────
interface CreateThreadModalProps {
  protocol: Protocol;
  onClose: () => void;
  onSuccess: (thread: Thread) => void;
}

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({ protocol, onClose, onSuccess }) => (
  <div
    className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
    role="dialog"
    aria-modal="true"
    aria-label="Start a thread"
  >
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-t-3xl lg:rounded-2xl w-full max-w-lg shadow-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">Start a Thread</h2>
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
      {/* Form */}
      <div className="p-5">
        <CreateThreadForm
          protocolId={protocol.id}
          onSuccess={(thread) => {
            onSuccess(thread);
            onClose();
          }}
        />
      </div>
    </div>
  </div>
);

// ****Thread Section ***********//***────
interface ThreadSectionProps {
  protocol: Protocol;
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  onThreadCreated: (thread: Thread) => void;
  onThreadUpdated?: (thread: Thread) => void;
  onThreadDeleted?: (thread: Thread) => void;
}

const ThreadSection: React.FC<ThreadSectionProps> = ({
  protocol,
  threads,
  isLoading,
  error,
  onThreadCreated,
  onThreadUpdated,
  onThreadDeleted,
}) => {
  const currentUserId = useAppSelector((s) => s.auth.user?.id ?? null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);

  const handleEditThread = (thread: Thread) => {
    setEditingThread(thread);
    setShowForm(false);
  };

  const handleDeleteThread = async (thread: Thread) => {
    if (!window.confirm('Delete this thread? This action cannot be undone.')) return;

    try {
      await threadService.delete(protocol.id, thread.id);
      onThreadDeleted?.(thread);
    } catch (err) {
      // eslint-disable-next-line no-alert
      window.alert('Failed to delete thread. Please try again.');
    }
  };

  const handleUpdateThread = (updated: Thread) => {
    onThreadUpdated?.(updated);
    setEditingThread(null);
  };

  const handleEditCancel = () => {
    setEditingThread(null);
  };

  interface EditThreadFormProps {
    protocolId: number;
    thread: Thread;
    onCancel: () => void;
    onSuccess: (thread: Thread) => void;
  }

  const EditThreadForm: React.FC<EditThreadFormProps> = ({ protocolId, thread, onCancel, onSuccess }) => {
    const [title, setTitle] = useState(thread.title);
    const [body, setBody] = useState(thread.body);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isValid = title.trim().length > 0 && body.trim().length > 0;

    const handleSubmit = async () => {
      if (!isValid || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);

      try {
        const updated = await threadService.update(protocolId, thread.id, {
          title: title.trim(),
          body: body.trim(),
        });
        onSuccess(updated);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message ?? 'Failed to update thread. Please try again.');
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
            <p className="text-sm font-semibold text-gray-900">Edit Thread</p>
            <p className="text-xs text-gray-500">Update the title or details for this thread.</p>
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
          <label htmlFor="edit-thread-title" className="text-sm font-semibold text-gray-700 block mb-1.5">
            Thread Title <span className="text-red-400">*</span>
          </label>
          <input
            id="edit-thread-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Update your thread title"
            maxLength={200}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="edit-thread-body" className="text-sm font-semibold text-gray-700 block mb-1.5">
            Details <span className="text-red-400">*</span>
          </label>
          <textarea
            id="edit-thread-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Update the thread details."
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] resize-none transition-colors"
          />
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
            {isSubmitting ? 'Saving…' : 'Save Thread'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#118451]" />
          <h2 className="text-sm font-bold text-gray-900">
            {threads.length > 0 ? `${threads.length} Thread${threads.length === 1 ? '' : 's'}` : 'Discussion'}
          </h2>
        </div>
        <Button
          variant={showForm ? 'outline' : 'primary'}
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : 'New Thread'}
        </Button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <CreateThreadForm
          protocolId={protocol.id}
          onSuccess={(thread) => {
            onThreadCreated(thread);
            setShowForm(false);
          }}
        />
      )}

      {editingThread && (
        <EditThreadForm
          protocolId={protocol.id}
          thread={editingThread}
          onCancel={handleEditCancel}
          onSuccess={handleUpdateThread}
        />
      )}

      {/* Thread list */}
      <ThreadList
        threads={threads}
        protocolId={protocol.id}
        isLoading={isLoading}
        error={error}
        currentUserId={currentUserId}
        onEdit={handleEditThread}
        onDelete={handleDeleteThread}
      />

      {/* Modal (triggered from FAB on mobile) */}
      {showModal && (
        <CreateThreadModal
          protocol={protocol}
          onClose={() => setShowModal(false)}
          onSuccess={(thread) => {
            onThreadCreated(thread);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ThreadSection;

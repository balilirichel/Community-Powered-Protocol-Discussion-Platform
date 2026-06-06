import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import type { Protocol } from '../../types/protocol';

interface DeleteProtocolDialogProps {
  protocol: Protocol;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Confirmation dialog for deleting a protocol.
 * Displays protocol title and a destructive warning.
 */
const DeleteProtocolDialog: React.FC<DeleteProtocolDialogProps> = ({
  protocol,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      // onConfirm should handle navigation
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete protocol. Please try again.';
      setError(message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={() => !isDeleting && onClose()}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 id="delete-dialog-title" className="text-center text-lg font-bold text-gray-900">
              Delete protocol?
            </h2>

            {/* Description */}
            <p id="delete-dialog-description" className="text-center text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{protocol.title}"</span>?
              This action cannot be undone.
            </p>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-1 px-5 py-2.5 rounded-[2rem] font-semibold text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteProtocolDialog;

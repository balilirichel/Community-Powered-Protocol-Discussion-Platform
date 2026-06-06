import React from 'react';
import { X } from 'lucide-react';
import ProtocolForm from './create/ProtocolForm';
import type { Protocol } from '../../types/protocol';

interface EditProtocolModalProps {
  protocol: Protocol;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Protocol) => void;
}

/**
 * Modal for editing an existing protocol.
 * Wraps ProtocolForm with edit mode enabled and pre-populated data.
 * Displays as a full-height overlay on mobile, centered modal on desktop.
 */
const EditProtocolModal: React.FC<EditProtocolModalProps> = ({
  protocol,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 py-8 lg:p-4">
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 rounded-t-2xl">
              <h2 id="edit-modal-title" className="text-lg font-bold text-gray-900">
                Edit Protocol
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] px-6 py-6">
              <ProtocolForm
                initialData={protocol}
                isEditing
                onSuccess={(updated) => {
                  onSuccess(updated);
                  onClose();
                }}
                onCancel={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProtocolModal;

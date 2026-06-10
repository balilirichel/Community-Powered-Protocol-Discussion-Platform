import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import useRequireAuth from '../../hooks/useRequireAuth';

interface Props {
  onEdit?: () => void;
  onDelete?: () => void;
}

const GuardedEditDeleteButtons: React.FC<Props> = ({ onEdit, onDelete }) => {
  const { isAuthenticated, open } = useRequireAuth();

  const guard = (fn?: () => void) => () => {
    if (isAuthenticated) return fn?.();
    open();
  };

  return (
    <>
      {onEdit && (
        <button
          onClick={guard(onEdit)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors text-sm font-medium cursor-pointer"
          aria-label="Edit"
        >
          <Edit2 size={14} />
          <span className="hidden sm:inline">Edit</span>
        </button>
      )}
      {onDelete && (
        <button
          onClick={guard(onDelete)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-100 hover:bg-red-500/30 transition-colors text-sm font-medium cursor-pointer"
          aria-label="Delete"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      )}
    </>
  );
};

export default GuardedEditDeleteButtons;

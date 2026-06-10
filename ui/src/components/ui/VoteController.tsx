import React, { useState, useEffect } from 'react';
import useRequireAuth from '../../hooks/useRequireAuth';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface VoteControllerProps {
  initialUpvotes?: number;
  initialDownvotes?: number;
  userVote?: 1 | -1 | null;
  onVote?: (vote: 1 | -1 | null) => void;
  size?: 'sm' | 'md';
}

const VoteController: React.FC<VoteControllerProps> = ({
  initialUpvotes = 0,
  initialDownvotes = 0,
  userVote: initialUserVote = null,
  onVote,
  size = 'md',
}) => {
  const { isAuthenticated, open } = useRequireAuth();
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setUserVote(initialUserVote);
  }, [initialUserVote]);

  useEffect(() => {
    setUpvotes(initialUpvotes);
  }, [initialUpvotes]);

  useEffect(() => {
    setDownvotes(initialDownvotes);
  }, [initialDownvotes]);

  const handleVote = (direction: 1 | -1) => {
    // ensure user is authenticated before allowing vote
    if (!isAuthenticated) {
      open();
      return;
    }

    // simple local debounce to avoid rapid double clicks and provide immediate feedback
    if (processing) return;
    setProcessing(true);
    window.setTimeout(() => setProcessing(false), 900);

    let newVote: 1 | -1 | null = direction;

    if (userVote === direction) {
      newVote = null;
    }

    setUserVote(newVote);

    if (userVote === direction) {
      if (direction === 1) {
        setUpvotes((prev) => Math.max(prev - 1, 0));
      } else {
        setDownvotes((prev) => Math.max(prev - 1, 0));
      }
    } else if (userVote === null) {
      if (direction === 1) {
        setUpvotes((prev) => prev + 1);
      } else {
        setDownvotes((prev) => prev + 1);
      }
    } else {
      if (direction === 1) {
        setUpvotes((prev) => prev + 1);
        setDownvotes((prev) => Math.max(prev - 1, 0));
      } else {
        setDownvotes((prev) => prev + 1);
        setUpvotes((prev) => Math.max(prev - 1, 0));
      }
    }

    onVote?.(newVote);
  };

  const isUpActive = userVote === 1;
  const isDownActive = userVote === -1;

  const containerClass = size === 'sm'
    ? 'flex items-center rounded-[2rem] overflow-hidden border text-xs'
    : 'flex items-center rounded-[2rem] overflow-hidden border text-sm';

  const iconSize = size === 'sm' ? 13 : 15;
  const btnPad = size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5';

  return (
    <div
      className={[
        containerClass,
        userVote ? 'border-[#118451] bg-[#e8f5f0]' : 'border-gray-200 bg-white',
      ].join(' ')}
    >
      <button
        onClick={() => handleVote(1)}
        aria-label="Upvote"
        className={[
          btnPad,
          'flex items-center gap-1 transition-colors duration-150 cursor-pointer',
          isUpActive
            ? 'text-[#118451] font-semibold'
            : 'text-gray-500 hover:text-[#118451] hover:bg-[#e8f5f0]',
        ].join(' ')}
        disabled={processing}
      >
        <ArrowUp size={iconSize} strokeWidth={isUpActive ? 2.5 : 2} />
        <span className="font-semibold tabular-nums">{upvotes}</span>
      </button>

      <div className="w-px h-5 bg-gray-200" />

      <button
        onClick={() => handleVote(-1)}
        aria-label="Downvote"
        className={[
          btnPad,
          'flex items-center gap-1 transition-colors duration-150 cursor-pointer',
          isDownActive
            ? 'text-rose-500 font-semibold'
            : 'text-gray-500 hover:text-rose-500 hover:bg-rose-50',
        ].join(' ')}
        disabled={processing}
      >
        <ArrowDown size={iconSize} strokeWidth={isDownActive ? 2.5 : 2} />
        <span className="font-semibold tabular-nums">{downvotes}</span>
      </button>
    </div>
  );
};

export default VoteController;

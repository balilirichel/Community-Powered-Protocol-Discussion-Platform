import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface VoteControllerProps {
  initialVotes?: number;
  userVote?: 1 | -1 | null;
  onVote?: (vote: 1 | -1 | null) => void;
  size?: 'sm' | 'md';
}

const VoteController: React.FC<VoteControllerProps> = ({
  initialVotes = 0,
  userVote: initialUserVote = null,
  onVote,
  size = 'md',
}) => {
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [votes, setVotes] = useState(initialVotes);

  // Keep internal state in sync when parent updates props (controlled-mode support)
  React.useEffect(() => {
    setUserVote(initialUserVote);
  }, [initialUserVote]);

  React.useEffect(() => {
    setVotes(initialVotes);
  }, [initialVotes]);

  const handleVote = (direction: 1 | -1) => {
    let newVote: 1 | -1 | null;
    let delta = 0;

    if (userVote === direction) {
      // Toggle off
      newVote = null;
      delta = -direction;
    } else {
      // New vote or switching
      delta = userVote ? direction * 2 : direction;
      newVote = direction;
    }

    setUserVote(newVote);
    setVotes((v) => v + delta);
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
      >
        <ArrowUp size={iconSize} strokeWidth={isUpActive ? 2.5 : 2} />
        <span className="font-semibold tabular-nums">{votes}</span>
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
      >
        <ArrowDown size={iconSize} strokeWidth={isDownActive ? 2.5 : 2} />
      </button>
    </div>
  );
};

export default VoteController;

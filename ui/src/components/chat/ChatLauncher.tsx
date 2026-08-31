import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import type { ChatLauncherProps } from './types';

const ChatLauncher: React.FC<ChatLauncherProps> = ({
  isOpen,
  onToggle,
  hasUnread = false,
}) => {
  return (
    <button
      onClick={onToggle}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      className={[
        'fixed z-[96] flex items-center justify-center',
        'w-14 h-14 rounded-full shadow-lg cursor-pointer',
        'transition-all duration-200 ease-out active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#118451] focus-visible:ring-offset-2',
        isOpen
          ? 'bg-gray-800 text-white hover:bg-gray-700'
          : 'bg-[#118451] text-white hover:bg-[#065c38]',
        // Mobile: above BottomNav (bottom-20). Desktop: bottom-6.
        'bottom-20 right-4 lg:bottom-6 lg:right-6',
      ].join(' ')}
    >
      {isOpen ? <X size={22} /> : <MessageCircle size={22} />}

      {hasUnread && !isOpen && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white" />
      )}
    </button>
  );
};

export default ChatLauncher;

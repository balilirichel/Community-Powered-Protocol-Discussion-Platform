import React from 'react';
import Avatar from '../ui/Avatar';
import type { MessageBubbleProps } from './types';

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar
        name={isUser ? 'You' : 'Assistant'}
        size="sm"
      />
      <div
        className={[
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#118451] text-white rounded-br-md'
            : 'bg-[#e8f5f0] text-gray-800 rounded-bl-md',
        ].join(' ')}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;

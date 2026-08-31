import React, { useEffect, useRef, useCallback } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import Spinner from '../ui/Spinner';
import MessageBubble from './MessageBubble';
import type { ChatWindowProps } from './types';

const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  messages,
  isLoading,
  onSendMessage,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousIsOpen = useRef(isOpen);

  const [inputValue, setInputValue] = React.useState('');

  const canSend = inputValue.trim().length > 0 && !isLoading;

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInputValue('');
  }, [inputValue, isLoading, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !previousIsOpen.current) {
      // Small delay to allow animation to start
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
    previousIsOpen.current = isOpen;
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !windowRef.current) return;

      const focusable = windowRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showTypingIndicator =
    isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user';

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label="Chat assistant">
      {/* Backdrop — mobile only */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Chat panel */}
      <div
        ref={windowRef}
        className={[
          'fixed bg-white flex flex-col overflow-hidden',
          'shadow-2xl',
          // Mobile: full screen
          'inset-0',
          // Desktop: floating panel
          'lg:bottom-6 lg:right-6 lg:left-auto lg:inset-x-auto',
          'lg:w-[380px] lg:h-[520px] lg:rounded-2xl',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e8f5f0]">
              <Sparkles size={16} className="text-[#118451]" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">AI Assistant</h2>
              <p className="text-xs text-gray-400">Ask anything about the platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className={[
              'flex items-center justify-center w-8 h-8 rounded-full',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              'transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#118451]',
            ].join(' ')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#e8f5f0] mb-4">
                <Sparkles size={24} className="text-[#118451]" />
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                How can I help?
              </h3>
              <p className="text-sm text-gray-400 max-w-[240px]">
                Ask me anything about protocols, threads, or how the platform works.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {showTypingIndicator && (
                <div className="flex gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e8f5f0] flex-shrink-0">
                    <Spinner size={14} className="text-[#118451]" label="Assistant is typing" />
                  </span>
                  <div className="bg-[#e8f5f0] rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#118451]/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-[#118451]/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-[#118451]/40 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3">
          <div className="flex items-end gap-2.5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question…"
              disabled={isLoading}
              className={[
                'flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm',
                'placeholder-gray-400 text-gray-800 bg-gray-50',
                'focus:outline-none focus:ring-2 focus:ring-[#118451]/40 focus:border-[#118451] focus:bg-white',
                'transition-all disabled:opacity-60',
              ].join(' ')}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              className={[
                'flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all cursor-pointer',
                canSend
                  ? 'bg-[#118451] text-white hover:bg-[#065c38] shadow-sm'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed',
              ].join(' ')}
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </div>
          <p className="text-[11px] text-gray-300 mt-2 pl-1">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

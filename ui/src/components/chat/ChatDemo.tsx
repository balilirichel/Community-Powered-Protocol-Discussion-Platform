/**
 * DEMO-ONLY COMPONENT
 * This file is for visually testing the chat UI in isolation.
 * It simulates a fake backend with setTimeout delays.
 * Do NOT import this in production code.
 */
import React, { useState, useCallback } from 'react';
import ChatLauncher from './ChatLauncher';
import ChatWindow from './ChatWindow';
import type { ChatMessage } from './types';

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'What protocols are available on the platform?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'The platform hosts community-created protocols across various categories. You can browse them on the Home page, or use the search bar to find specific topics. Each protocol has reviews and discussion threads.',
    timestamp: new Date(Date.now() - 60000),
  },
];

const FAKE_RESPONSES = [
  "That's a great question! Let me look into that for you.",
  'Based on the knowledge base, here is what I found — the platform supports protocols, threads, and reviews. You can create new ones from the sidebar.',
  "I'm not sure I understand. Could you rephrase that?",
  'You can find your profile and activity under the Profile tab in the bottom navigation.',
];

const ChatDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback((text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          FAKE_RESPONSES[Math.floor(Math.random() * FAKE_RESPONSES.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1200 + Math.random() * 800);
  }, []);

  return (
    <>
      <ChatLauncher isOpen={isOpen} onToggle={() => setIsOpen((o) => !o)} />
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default ChatDemo;

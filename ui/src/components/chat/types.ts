export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  flagged_off_topic?: boolean;
  created_at?: string;
  timestamp?: Date;
}

export interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export interface ChatLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  hasUnread?: boolean;
}

export interface MessageBubbleProps {
  message: ChatMessage;
}

export interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

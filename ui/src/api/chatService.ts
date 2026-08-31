import apiClient from './client';

export interface ChatSession {
  session_token: string;
  conversation_id: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  flagged_off_topic: boolean;
  created_at: string;
}

export interface SendMessageResponse {
  reply: string;
  conversation_id: string;
}

export interface BookingData {
  name: string;
  email: string;
  date: string;
  time: string;
  topic: string;
}

export interface BookingResponse {
  message: string;
  booking_id: string;
}

export const chatService = {
  createSession: () =>
    apiClient.post<ChatSession>('/chat/session').then((r) => r.data),

  getMessages: (conversationId: string) =>
    apiClient.get<{ messages: ChatMessage[] }>(`/chat/messages/${conversationId}`).then((r) => r.data.messages),

  sendMessage: (conversationId: string, message: string) =>
    apiClient.post<SendMessageResponse>('/chat/message', {
      conversation_id: conversationId,
      message,
    }).then((r) => r.data),

  createBooking: (data: BookingData) =>
    apiClient.post<BookingResponse>('/chat/booking', data).then((r) => r.data),
};

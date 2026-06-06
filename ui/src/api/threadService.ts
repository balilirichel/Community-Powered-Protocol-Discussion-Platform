import apiClient from './client';
import type { Thread, CreateThreadRequest, UpdateThreadRequest, VoteRequest } from '../types/thread';
import type { PaginatedResponse } from '../types/protocol';
import type { ApiResponse } from '../types/api';

export const threadService = {
  listByProtocol: (protocol: number | string) =>
    apiClient
      .get<PaginatedResponse<Thread>>(`/api/protocols/${protocol}/threads`)
      .then((r) => r.data),

  get: (protocol: number | string, thread: number | string) =>
    apiClient
      .get<ApiResponse<Thread>>(`/api/protocols/${protocol}/threads/${thread}`)
      .then((r) => r.data.data),

  create: (protocol: number | string, data: CreateThreadRequest) =>
    apiClient
      .post<ApiResponse<Thread>>(`/api/protocols/${protocol}/threads`, data)
      .then((r) => r.data.data),

  update: (protocol: number | string, thread: number | string, data: UpdateThreadRequest) =>
    apiClient
      .put<ApiResponse<Thread>>(`/api/protocols/${protocol}/threads/${thread}`, data)
      .then((r) => r.data.data),

  patch: (protocol: number | string, thread: number | string, data: UpdateThreadRequest) =>
    apiClient
      .patch<ApiResponse<Thread>>(`/api/protocols/${protocol}/threads/${thread}`, data)
      .then((r) => r.data.data),

  delete: (protocol: number | string, thread: number | string) =>
    apiClient
      .delete<void>(`/api/protocols/${protocol}/threads/${thread}`)
      .then((r) => r.data),

  upvote: (thread: number | string, data: VoteRequest) =>
    apiClient.post<void>(`/api/threads/${thread}/vote`, data).then((r) => r.data),

  removeVote: (thread: number | string) =>
    apiClient.delete<void>(`/api/threads/${thread}/vote`).then((r) => r.data),
};

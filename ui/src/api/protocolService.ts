import apiClient from './client';
import type { Protocol, CreateProtocolRequest, UpdateProtocolRequest } from '../types/protocol';
import type { PaginatedResponse } from '../types/protocol';
import type { ApiResponse } from '../types/api';

export const protocolService = {
  list: () =>
    apiClient.get<PaginatedResponse<Protocol>>('/protocols').then((r) => r.data),

  get: (protocol: number | string) =>
    apiClient.get<ApiResponse<Protocol>>(`/protocols/${protocol}`).then((r) => r.data.data),

  create: (data: CreateProtocolRequest) =>
    apiClient.post<ApiResponse<Protocol>>('/protocols', data).then((r) => r.data.data),

  update: (protocol: number | string, data: UpdateProtocolRequest) =>
    apiClient.put<ApiResponse<Protocol>>(`/protocols/${protocol}`, data).then((r) => r.data.data),

  patch: (protocol: number | string, data: UpdateProtocolRequest) =>
    apiClient.patch<ApiResponse<Protocol>>(`/protocols/${protocol}`, data).then((r) => r.data.data),

  delete: (protocol: number | string) =>
    apiClient.delete<void>(`/protocols/${protocol}`).then((r) => r.data),
};

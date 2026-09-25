import { apiClient } from './client';

export const historyApi = {
  getHistory: async (page = 1, pageSize = 20, search = '', status = '') => {
    let url = `/history/?page=${page}&page_size=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
    return apiClient.get(url);
  },

  getJobDetail: async (jobId) => {
    return apiClient.get(`/history/${jobId}`);
  },

  deleteJob: async (jobId) => {
    return apiClient.delete(`/history/${jobId}`);
  },

  clearAllHistory: async () => {
    return apiClient.delete('/history/clear-all');
  },
};

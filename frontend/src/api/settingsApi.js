import { apiClient } from './client';

export const settingsApi = {
  getSettings: async () => {
    return apiClient.get('/settings/');
  },

  updateSettings: async (updates) => {
    return apiClient.put('/settings/', updates);
  },
};

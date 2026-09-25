import { apiClient } from './client';

export const datasetsApi = {
  getDatasets: async (page = 1, pageSize = 50) => {
    return apiClient.get(`/datasets/?page=${page}&page_size=${pageSize}`);
  },

  createDataset: async (datasetData) => {
    return apiClient.post('/datasets/', datasetData);
  },

  getDatasetById: async (datasetId) => {
    return apiClient.get(`/datasets/${datasetId}`);
  },

  updateDataset: async (datasetId, updates) => {
    return apiClient.put(`/datasets/${datasetId}`, updates);
  },

  deleteDataset: async (datasetId) => {
    return apiClient.delete(`/datasets/${datasetId}`);
  },
};

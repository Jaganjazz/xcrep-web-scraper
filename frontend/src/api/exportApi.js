import { apiClient } from './client';

export const exportApi = {
  requestExport: async ({ jobId, datasetId, data, format, tab, baseName }) => {
    return apiClient.post('/export/', {
      job_id: jobId,
      dataset_id: datasetId,
      data,
      format,
      tab,
      base_name: baseName,
    });
  },

  getDownloadUrl: (exportId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/export/download/${exportId}`;
  },

  triggerBrowserDownload: (downloadUrl, fileName) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName || 'export');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

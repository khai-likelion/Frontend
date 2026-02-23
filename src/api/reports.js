import apiClient from './client';

export const reportApi = {
    createXReport: (data) => apiClient.post('/x_reports', data),
    getXReport: (id) => apiClient.get(`/x_reports/${id}`),
    listXReports: (storeId) => apiClient.get('/x_reports', { params: { store_id: storeId } }),

    // Y-Report 및 시뮬레이션 관련 (추후 백엔드 엔드포인트 확정과 동기화)
    createYReport: (data) => apiClient.post('/y_reports', data),
    getYReport: (id) => apiClient.get(`/y_reports/${id}`),
};

export const storeApi = {
    listStores: (params) => apiClient.get('/stores', { params }),
    getStore: (id) => apiClient.get(`/stores/${id}`),
};

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const dashboardApi = axios.create({
  baseURL: `${API_BASE_URL}/dashboard`,
  timeout: 15000,
});

const readDashboardResponse = (response, endpoint) => {
  console.log(`[dashboardApi] ${endpoint} response`, response.data);

  if (!response.data?.success || !Array.isArray(response.data.data)) {
    throw new Error(`Unexpected dashboard ${endpoint} response`);
  }

  return response.data.data;
};

export const fetchDashboardStats = async () => {
  console.log('[dashboardApi] GET /stats started');
  const response = await dashboardApi.get('/stats');
  return readDashboardResponse(response, 'stats');
};

export const fetchDashboardActivity = async () => {
  console.log('[dashboardApi] GET /activity started');
  const response = await dashboardApi.get('/activity');
  return readDashboardResponse(response, 'activity');
};

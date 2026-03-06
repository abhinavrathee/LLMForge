import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const submitQuery = async (query, sessionId = null) => {
  try {
    const response = await api.post('/query', { query, sessionId });
    return response.data;
  } catch (error) {
    console.error('Error submitting query:', error);
    throw new Error('Failed to fetch model responses');
  }
};

export const getHistory = async () => {
  try {
    const response = await api.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw new Error('Failed to fetch query history');
  }
};

export const deleteHistory = async (id) => {
  try {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting history:', error);
    throw new Error('Failed to delete query history');
  }
};

export default api;

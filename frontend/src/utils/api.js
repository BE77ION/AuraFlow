import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? 'https://auraflow-production-c5ab.up.railway.app/api' 
    : 'http://127.0.0.1:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auraflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auraflow_token');
      localStorage.removeItem('auraflow_user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);

export default api;

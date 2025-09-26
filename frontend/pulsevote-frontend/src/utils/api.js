import axios from 'axios';

const api = axios.create({
  // use https if your backend is running with HTTPS, otherwise http
  baseURL: 'https://localhost:5000',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
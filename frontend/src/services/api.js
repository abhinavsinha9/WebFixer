import axios from 'axios';

console.log('Original VITE_API_URL:', import.meta.env.VITE_API_URL);

let baseURL = import.meta.env.VITE_API_URL || '/api';
if (baseURL.endsWith('/')) {
  baseURL = baseURL.slice(0, -1);
}
if (!baseURL.endsWith('/api') && baseURL !== '/api') {
  baseURL += '/api';
}

console.log('Final Axios baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Print the final URL that axios sends
    console.log('Axios sending request to:', config.baseURL + config.url);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

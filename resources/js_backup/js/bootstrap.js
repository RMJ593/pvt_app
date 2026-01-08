import axios from 'axios';

// ✅ FIX: Always append /api to base URL
const baseURL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
axios.defaults.baseURL = baseURL;

console.log('🔍 Axios Base URL:', baseURL); // Debug log

// Enable credentials
axios.defaults.withCredentials = true;

// Set default headers
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include auth token
axios.interceptors.request.use(
    (config) => {
        console.log('📤 Request:', config.method?.toUpperCase(), config.url); // Debug log
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axios;
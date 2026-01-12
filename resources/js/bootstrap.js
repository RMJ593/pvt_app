import axios from 'axios';

// Set base URL with /api prefix - this will be used globally
axios.defaults.baseURL = `${window.location.origin}/api`;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

console.log('🔧 Axios Base URL:', axios.defaults.baseURL);

// Request interceptor - add auth token if available
axios.interceptors.request.use(
    (config) => {
        console.log('📤 Request:', config.method?.toUpperCase(), config.url);
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

// Response interceptor - handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect to login if NOT already on login page or public pages
            const currentPath = window.location.pathname;
            const publicPaths = ['/', '/menu', '/about', '/contact', '/gallery'];
            const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path));
            
            if (!isPublicPath && currentPath !== '/login') {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
// Get the API base URL from environment variable or use current origin
export const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Helper function to get full API URL
export const getApiUrl = (path) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};

// Helper function to get full storage URL
export const getStorageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
};

// ✅ NEW: Helper to safely extract array from API response
export const extractArray = (response) => {
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
};

export default API_BASE_URL;
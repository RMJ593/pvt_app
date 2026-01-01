// Get the API base URL from environment variable or use current origin
export const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Helper function to get full API URL
export const getApiUrl = (path) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};

// Helper function to get full storage URL
export const getStorageUrl = (path) => {
    if (!path) return '';
    // If path already includes http, return as is
    if (path.startsWith('http')) return path;
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/storage/${cleanPath}`;
};

export default API_BASE_URL;
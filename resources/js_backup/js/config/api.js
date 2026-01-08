// Get the API base URL from environment variable or use current origin
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tphrc-int-project.onrender.com/api';

// Helper function to get full API URL
export const getApiUrl = (path) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Remove 'api/' if it's already in the path to avoid duplication
    const finalPath = cleanPath.replace(/^api\//, '');
    return `/api/${finalPath}`;
};

// Helper function to get full storage URL
export const getStorageUrl = (path) => {
    if (!path) return null;

    // If already a full URL (Cloudinary or external), return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Legacy: Local storage path
    const cleanPath = path.replace(/^\/?(storage\/)?/, '');
    // Use base URL without /api for storage
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://tphrc-int-project.onrender.com';
    return `${baseUrl}/storage/${cleanPath}`;
};

// ✅ NEW: Helper to safely extract array from API response
export const extractArray = (response) => {
    if (Array.isArray(response.data)) {
        return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    console.warn('Unexpected response format:', response.data);
    return [];
};

export default API_BASE_URL;

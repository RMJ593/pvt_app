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
export const getStorageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // ✅ Cloudinary URLs - use directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // ✅ Local paths - add /storage/ prefix
    return `${API_BASE_URL}/storage/${imagePath}`;
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

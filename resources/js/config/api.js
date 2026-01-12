// Get the API base URL - ALWAYS use current domain
export const API_BASE_URL = window.location.origin;

console.log('🔧 API_BASE_URL set to:', API_BASE_URL);

// Helper function to get API path (NOT full URL)
// Since axios baseURL is already set to origin/api, we just return the clean path
export const getApiUrl = (path) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Remove 'api/' prefix if already present to avoid duplication
    const finalPath = cleanPath.replace(/^api\//, '');
    
    // Return just the path WITHOUT /api/ prefix
    // axios will add the baseURL (which already includes /api)
    return `/${finalPath}`;
};

// Helper function to get full storage URL
export const getStorageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Cloudinary URLs - use directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Local paths - construct full URL using current domain
    return `${window.location.origin}/storage/${imagePath}`;
};

// Helper to safely extract array from API response
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
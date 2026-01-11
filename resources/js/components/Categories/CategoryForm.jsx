import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Categories.css';

function CategoryForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        small_heading: '',
        location: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [featured, setFeatured] = useState({
        is_royalty: false,
        is_special_selection: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('You must be logged in to access this page.');
            setTimeout(() => {
                navigate('/staff/login');
            }, 2000);
        }
    }, [navigate]);

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setError('Authentication required');
                return;
            }
                
            const response = await axios.get(`/api/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                const category = response.data.data;
                setFormData({
                    name: category.name,
                    small_heading: category.small_heading || '',
                    location: category.location || ''
                });
                setFeatured({
                    is_royalty: category.is_royalty || false,
                    is_special_selection: category.is_special_selection || false
                });
                
                if (category.image) {
                    // Check if it's a Cloudinary URL or local path
                    if (category.image.startsWith('http')) {
                        setImagePreview(category.image);
                    } else {
                        setImagePreview(`/storage/${category.image}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => navigate('/staff/login'), 2000);
            } else {
                setError('Failed to load category');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleToggle = (field) => {
        setFeatured({
            ...featured,
            [field]: !featured[field]
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                e.target.value = '';
                return;
            }
            
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should not exceed 2MB');
                e.target.value = '';
                return;
            }
            
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Get auth token
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('Authentication required. Please log in.');
            setLoading(false);
            setTimeout(() => navigate('/staff/login'), 2000);
            return;
        }

        // Validation
        if (!isEditMode && !imageFile) {
            setError('Image is required');
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            // Append all fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('small_heading', formData.small_heading || '');
            formDataToSend.append('location', formData.location);
            formDataToSend.append('is_royalty', featured.is_royalty ? '1' : '0');
            formDataToSend.append('is_special_selection', featured.is_special_selection ? '1' : '0');
            formDataToSend.append('is_active', '1');

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            // Debug logging
            console.log('=== SUBMITTING CATEGORY ===');
            console.log('Edit Mode:', isEditMode);
            console.log('Name:', formData.name);
            console.log('Small Heading:', formData.small_heading);
            console.log('Location:', formData.location);
            console.log('Is Royalty:', featured.is_royalty);
            console.log('Is Special Selection:', featured.is_special_selection);
            console.log('Has Image:', !!imageFile);
            console.log('Has Token:', !!token);

            let response;

            if (isEditMode) {
                // For updates, use POST with _method=PUT for FormData
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(
                    `/api/categories/${id}`,
                    formDataToSend,
                    {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                // For create, use POST
                response = await axios.post(
                    `/api/categories`,
                    formDataToSend,
                    {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            console.log('=== SUCCESS ===');
            console.log('Response:', response.data);

            if (response.data.success) {
                alert(isEditMode ? 'Category updated successfully!' : 'Category created successfully!');
                navigate('/staff/categories');
            }
        } catch (error) {
            console.error('=== ERROR DETAILS ===');
            console.error('Error:', error);
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
            
            // Handle different error types
            if (error.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
                setTimeout(() => navigate('/staff/login'), 2000);
            } else if (error.response?.status === 422) {
                // Validation errors
                const errors = error.response.data.errors;
                if (errors) {
                    const errorMessages = Object.entries(errors)
                        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                        .join('\n');
                    setError(`Validation failed:\n${errorMessages}`);
                } else {
                    setError(error.response.data.message || 'Validation failed');
                }
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(`Error: ${error.message}`);
            } else {
                setError('Failed to save category. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Product Category' : 'Add Product Category'}</h1>
                <Link to="/staff/categories" className="btn-back">
                    ← Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error" style={{ whiteSpace: 'pre-line' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="category-form">
                <div className="form-group">
                    <label>Product Categories Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., Pre-Starters, Starters, Mains"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Small Heading *</label>
                    <input
                        type="text"
                        name="small_heading"
                        value={formData.small_heading}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter small heading"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Location *</label>
                    <select
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="">Select Location</option>
                        <option value="Header Menu">Header Menu</option>
                        <option value="Footer Menu">Footer Menu</option>
                        <option value="Sidebar">Sidebar</option>
                        <option value="Home Page">Home Page</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>
                        Image * 
                        {isEditMode && ' (Leave empty to keep current image)'}
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="form-control-file"
                        required={!isEditMode}
                    />
                    <small className="form-text">
                        Accepted: JPEG, PNG, GIF, WebP. Recommended: 285px × 336px. Max: 2MB
                    </small>
                </div>

                {imagePreview && (
                    <div className="image-preview-rectangle">
                        <img src={imagePreview} alt="Preview" />
                    </div>
                )}

                <div className="form-section">
                    <h3>Features</h3>
                    
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Royalty (Show in "Flavors for Royalty" section)</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={featured.is_royalty}
                                    onChange={() => handleToggle('is_royalty')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>

                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Special Selection (Show in special selection section)</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={featured.is_special_selection}
                                    onChange={() => handleToggle('is_special_selection')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={loading || (!isEditMode && !imageFile)} 
                        className="btn-submit"
                    >
                        {loading ? (
                            <>
                                <span>Saving...</span>
                                <span style={{ marginLeft: '10px' }}>⏳</span>
                            </>
                        ) : (
                            isEditMode ? 'Update Category' : 'Create Category'
                        )}
                    </button>
                    <Link to="/staff/categories" className="btn-cancel">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default CategoryForm;
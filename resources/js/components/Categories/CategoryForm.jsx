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

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const token = localStorage.getItem('auth_token');
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
                    setImagePreview(`/storage/${category.image}`);
                }
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            setError('Failed to load category');
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
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should not exceed 2MB');
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

        // Validation
        if (!isEditMode && !imageFile) {
            setError('Image is required');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('small_heading', formData.small_heading);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('is_royalty', featured.is_royalty ? '1' : '0');
            formDataToSend.append('is_special_selection', featured.is_special_selection ? '1' : '0');

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            let response;
            if (isEditMode) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(
                    `/api/categories/${id}`,
                    formDataToSend,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            } else {
                response = await axios.post(
                    '/api/categories',
                    formDataToSend,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            if (response.data.success) {
                navigate('/staff/categories');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            setError(error.response?.data?.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Product Category' : 'Add Product Category'}</h1>
                <Link to="/staff/categories" className="btn-back">
                    † Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
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
                    <label>Image * {isEditMode && '(Leave empty to keep current image)'}</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-control-file"
                        required={!isEditMode}
                    />
                    <small className="form-text">
                        Preferred dimension: 285px x 336px. Max 2MB.
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
                            <span>Royalty</span>
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
                            <span>Special Selection</span>
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
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CategoryForm;


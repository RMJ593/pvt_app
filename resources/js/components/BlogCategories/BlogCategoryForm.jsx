import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './BlogCategories.css';

function BlogCategoryForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        location: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchBlogCategory();
        }
    }, [id]);

    const fetchBlogCategory = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`/blog-categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const category = response.data.data;
                setFormData({
                    name: category.name,
                    slug: category.slug || '',
                    location: category.location || ''
                });
            }
        } catch (error) {
            console.error('Error fetching blog category:', error);
            setError('Failed to load blog category');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            let response;

            console.log('Submitting form data:', formData);

            if (isEditMode) {
                response = await axios.put(
                    `/blog-categories/${id}`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            } else {
                response = await axios.post(
                    '/blog-categories',
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            }

            console.log('Response:', response.data);

            if (response.data.success || response.status === 200 || response.status === 201) {
                console.log('Redirecting to list page...');
                navigate('/staff/blog-categories');
            } else {
                setError('Failed to save blog category');
            }
        } catch (error) {
            console.error('Error saving blog category:', error);
            console.error('Error response:', error.response?.data);
            setError(error.response?.data?.message || 'Failed to save blog category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="blog-category-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Blog Category' : 'Add Blog Category'}</h1>
                <Link to="/staff/blog-categories" className="btn-back">
                    ← Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="blog-category-form">
                <div className="form-group">
                    <label>Blog Categories Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter blog category name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Blog Categories URL *</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., recipes, food-tips"
                        required
                    />
                    <small className="form-text">
                        URL slug (lowercase, use hyphens instead of spaces)
                    </small>
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
                        <option value="Blog Page">Blog Page</option>
                    </select>
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

export default BlogCategoryForm;
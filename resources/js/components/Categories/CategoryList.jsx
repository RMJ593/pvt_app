import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Categories.css';

function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setMessage('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.delete(`/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMessage('Category deleted successfully');
                fetchCategories();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            setMessage('Failed to delete category');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put(`/categories/${id}`, {
                is_active: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                fetchCategories();
            }
        } catch (error) {
            console.error('Error updating active status:', error);
        }
    };

    // Helper function to get the correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        
        // If it's already a full URL (Cloudinary), use it directly
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // Otherwise, it's a local storage path
        return `/storage/${imageUrl}`;
    };

    if (loading) {
        return <div className="category-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="category-container">
            <div className="page-header-simple">
                <h1>Product Categories</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/categories/create" className="btn-new-green">
                        + Add New
                    </Link>
                </div>

                <div className="table-wrapper">
                    <table className="data-table-simple">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="empty-row">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="name-with-image">
                                                {category.image ? (
                                                    <img
                                                        src={getImageUrl(category.image)}
                                                        alt={category.name}
                                                        className="table-image-rectangle"
                                                    />
                                                ) : (
                                                    <div className="no-image-placeholder-rect">No Image</div>
                                                )}
                                                <strong>{category.name}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/categories/${category.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                                <label className="toggle-switch-small" title="Toggle Active Status">
                                                    <input
                                                        type="checkbox"
                                                        checked={category.is_active}
                                                        onChange={() => toggleActive(category.id, category.is_active)}
                                                    />
                                                    <span className="toggle-slider-small"></span>
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CategoryList;
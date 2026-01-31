import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './BlogCategories.css';

function BlogCategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/blog-categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Blog Categories Response:', response.data);
            
            if (response.data.success) {
                setCategories(response.data.data);
            } else if (response.data.data) {
                // Handle case where success flag might be missing
                setCategories(response.data.data);
            } else if (Array.isArray(response.data)) {
                // Handle case where data is returned directly as array
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching blog categories:', error);
            setMessage('Failed to load blog categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog category?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.delete(`/blog-categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMessage('Blog category deleted successfully');
                fetchCategories();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting blog category:', error);
            setMessage('Failed to delete blog category');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put(`/blog-categories/${id}`, {
                is_active: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Update state immediately
                setCategories(prevCategories => 
                    prevCategories.map(category => 
                        category.id === id 
                            ? { ...category, is_active: !currentStatus }
                            : category
                    )
                );
                setMessage('Blog category status updated successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating active status:', error);
            setMessage('Failed to update blog category status');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) {
        return <div className="blog-category-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="blog-category-container">
            <div className="page-header-simple">
                <h1>Blog Categories</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/blog-categories/create" className="btn-new-green">
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
                                        No blog categories found
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{category.name}</strong>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/blog-categories/${category.id}/edit`}
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

export default BlogCategoryList;



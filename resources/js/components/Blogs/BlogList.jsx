import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Blogs.css';

function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/blogs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (Array.isArray(response.data)) {
                setBlogs(response.data);
            } else if (response.data.data) {
                setBlogs(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setMessage('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Blog deleted successfully');
            fetchBlogs();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting blog:', error);
            setMessage('Failed to delete blog');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put(`/blogs/${id}`, {
                is_active: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setBlogs(prevBlogs => 
                    prevBlogs.map(blog => 
                        blog.id === id 
                            ? { ...blog, is_active: !currentStatus }
                            : blog
                    )
                );
                setMessage('Blog status updated successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating active status:', error);
            setMessage('Failed to update blog status');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) {
        return <div className="blog-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="blog-container">
            <div className="page-header-simple">
                <h1>Blogs</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/blogs/create" className="btn-new-green">
                        + Add New
                    </Link>
                </div>

                <div className="table-wrapper">
                    <table className="data-table-simple">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="empty-row">
                                        No blogs found
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog, index) => (
                                    <tr key={blog.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="name-with-image">
                                                {blog.image ? (
                                                    <img
                                                        src={`/storage/${blog.image}`}
                                                        alt={blog.title}
                                                        className="table-image-blog"
                                                    />
                                                ) : (
                                                    <div className="no-image-placeholder-blog">No Image</div>
                                                )}
                                                <strong>{blog.title}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/blogs/${blog.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    hghg
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    ghgh
                                                </button>
                                                <label className="toggle-switch-small" title="Toggle Active Status">
                                                    <input
                                                        type="checkbox"
                                                        checked={blog.is_active}
                                                        onChange={() => toggleActive(blog.id, blog.is_active)}
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

export default BlogList;



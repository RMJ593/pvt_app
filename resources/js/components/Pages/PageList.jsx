import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';
import { extractArray } from '../../config/api';

function PageList() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/pages', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Fetched pages:', response.data);

            const pagesData = extractArray(response);
            setPages(pagesData);
        } catch (error) {
            console.error('Error fetching pages:', error);
            setError('Failed to load pages');
            setPages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const newStatus = currentStatus === 1 ? 0 : 1;

            console.log('Toggling status for page:', id, 'from', currentStatus, 'to', newStatus);

            // ✅ FIXED: Removed /api prefix (axios baseURL already has it)
            const response = await axios.patch(
                `/pages/${id}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Status update response:', response.data);

            setPages(pages.map(page =>
                page.id === id ? { ...page, is_active: newStatus } : page
            ));

            console.log('Status updated successfully');
        } catch (error) {
            console.error('Error toggling status:', error);
            console.error('Error response:', error.response?.data);
            alert('Failed to update status: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this page?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`/pages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPages(pages.filter(page => page.id !== id));
            alert('Page deleted successfully');
        } catch (error) {
            console.error('Error deleting page:', error);
            alert(error.response?.data?.message || 'Failed to delete page');
        }
    };

    if (loading) {
        return (
            <div className="pages-container">
                <div className="loading">Loading pages...</div>
            </div>
        );
    }

    return (
        <div className="pages-container">
            <div className="page-header">
                <h1>Pages</h1>
                <Link to="/staff/pages/create" className="btn-new">
                    + New Page
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>URL</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    No pages found. Click "New Page" to create one.
                                </td>
                            </tr>
                        ) : (
                            pages.map((page, index) => (
                                <tr key={page.id}>
                                    <td>{index + 1}</td>
                                    <td>{page.page_title}</td>
                                    <td>{page.slug || '/'}</td>
                                    <td>{page.location || '-'}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {/* Toggle Switch */}
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={page.is_active === 1}
                                                    onChange={() => handleToggleStatus(page.id, page.is_active)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>

                                            {/* Edit Button */}
                                            <Link
                                                to={`/staff/pages/${page.id}/edit`}
                                                className="btn-edit"
                                                title="Edit"
                                            >
                                                ✏️
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PageList;
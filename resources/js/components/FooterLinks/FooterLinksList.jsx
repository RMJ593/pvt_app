import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './FooterLinks.css';
import { API_BASE_URL, getStorageUrl } from '../../config/api';

function FooterLinksList() {
    const [footerLinks, setFooterLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFooterLinks();
    }, []);

    const fetchFooterLinks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/footer-links`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Fetched footer links:', response.data);

            if (response.data.success) {
                setFooterLinks(response.data.data || []);
            } else if (Array.isArray(response.data)) {
                setFooterLinks(response.data);
            } else {
                setFooterLinks([]);
            }
        } catch (error) {
            console.error('Error fetching footer links:', error);
            setError('Failed to load footer links');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const newStatus = !currentStatus;

            await axios.patch(
                `${API_BASE_URL}/footer-links/${id}/toggle`,
                { is_active: newStatus },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setFooterLinks(footerLinks.map(link =>
                link.id === id ? { ...link, is_active: newStatus } : link
            ));
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this footer link?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API_BASE_URL}/footer-links/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFooterLinks(footerLinks.filter(link => link.id !== id));
            alert('Footer link deleted successfully');
        } catch (error) {
            console.error('Error deleting footer link:', error);
            alert('Failed to delete footer link');
        }
    };

    if (loading) {
        return (
            <div className="footer-links-container">
                <div className="loading">Loading footer links...</div>
            </div>
        );
    }

    return (
        <div className="footer-links-container">
            <div className="page-header">
                <h1>Footer Links</h1>
                <Link to="/staff/footer-links/create" className="btn-new">
                    + New Footer Link
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
                            <th>URL Name</th>
                            <th>Link Type</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {footerLinks.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    No footer links found. Click "New Footer Link" to create one.
                                </td>
                            </tr>
                        ) : (
                            footerLinks.map((link, index) => (
                                <tr key={link.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{link.title}</strong></td>
                                    <td>{link.title}</td>
                                    <td>{link.page_type || 'N/A'}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {/* Edit Button */}
                                            <Link
                                                to={`/staff/footer-links/${link.id}/edit`}
                                                className="btn-edit"
                                                title="Edit"
                                            >
                                                bbhbn
                                            </Link>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(link.id)}
                                                className="btn-delete"
                                                title="Delete"
                                            >
                                                ghgh
                                            </button>

                                            {/* Toggle Switch */}
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={link.is_active || false}
                                                    onChange={() => handleToggleStatus(link.id, link.is_active)}
                                                />
                                                <span className="toggle-slider"></span>
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
    );
}

export default FooterLinksList;


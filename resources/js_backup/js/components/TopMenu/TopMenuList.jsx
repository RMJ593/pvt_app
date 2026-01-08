import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TopMenu.css';

function TopMenuList() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupForm, setGroupForm] = useState({
        name: '',
        link_text: '',
        page_type: ''
    });

    const pageTypes = ['Page', 'Blog', 'Portfolio', 'Gallery', 'Contact', 'Custom'];

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const response = await axios.get('/api/menu-links');
            if (response.data.success) {
                setLinks(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching links:', error);
            setMessage('Failed to load menu links');
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const response = await axios.patch(`/api/menu-links/${id}/toggle`, {
                is_active: !currentStatus
            });

            if (response.data.success) {
                setMessage('Status updated successfully');
                fetchLinks();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this menu link?')) return;

        try {
            const response = await axios.delete(`/api/menu-links/${id}`);
            if (response.data.success) {
                setMessage('Menu link deleted successfully');
                fetchLinks();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting link:', error);
            setMessage('Failed to delete menu link');
        }
    };

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/menu-links', {
                title: groupForm.name,
                link_text: groupForm.link_text,
                page_type: groupForm.page_type,
                url: '#',
                target: '_self',
                is_group: true,
                menu_id: 1,
                order: links.length + 1,
                is_active: true
            });

            if (response.data.success) {
                setMessage('Group created successfully');
                fetchLinks();
                setShowGroupModal(false);
                setGroupForm({ name: '', link_text: '', page_type: '' });
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error creating group:', error);
            console.error('Validation errors:', error.response?.data?.errors);
            const errorMsg = error.response?.data?.errors 
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Failed to create group';
            setMessage(errorMsg);
        }
    };

    const filteredLinks = links.filter(link =>
        link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.link_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="top-menu-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="top-menu-container">
            <div className="page-header-simple">
                <h1>Top Menu Links</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/top-menu/create" className="btn-new-green">
                        + New
                    </Link>
                    <button onClick={() => setShowGroupModal(true)} className="btn-new-green">
                        + New Group
                    </button>
                </div>

                <div className="table-controls">
                    <div className="entries-control">
                        <label>Show</label>
                        <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>

                    <div className="search-control">
                        <label>Search:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder=""
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Name</th>
                                <th>URL Name</th>
                                <th>Link Type</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLinks.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-row">
                                        No menu links found
                                    </td>
                                </tr>
                            ) : (
                                filteredLinks.slice(0, entriesPerPage).map((link) => (
                                    <tr key={link.id}>
                                        <td>{link.order}</td>
                                        <td><strong>{link.title}</strong></td>
                                        <td>{link.link_text || link.title}</td>
                                        <td>{link.page_type || 'N/A'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/top-menu/${link.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    vhvbv
                                                </Link>
                                                <label className="toggle-switch" title="Toggle Active/Inactive">
                                                    <input
                                                        type="checkbox"
                                                        checked={link.is_active || false}
                                                        onChange={() => toggleActive(link.id, link.is_active)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                                <button
                                                    onClick={() => handleDelete(link.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    hhjhjhj
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <div className="showing-info">
                        Showing {filteredLinks.length > 0 ? '1' : '0'} to {Math.min(entriesPerPage, filteredLinks.length)} of {filteredLinks.length} entries
                    </div>
                    <div className="pagination">
                        <button className="page-btn" disabled>Previous</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn" disabled>Next</button>
                    </div>
                </div>
            </div>

            {showGroupModal && (
                <div className="modal-overlay" onClick={() => setShowGroupModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Group</h3>
                            <button onClick={() => setShowGroupModal(false)} className="modal-close">uiu</button>
                        </div>
                        <form onSubmit={handleGroupSubmit}>
                            <div className="form-group">
                                <label>Name To Identify *</label>
                                <input
                                    type="text"
                                    value={groupForm.name}
                                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                    className="form-control"
                                    placeholder="e.g., Services Group"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Link Text *</label>
                                <input
                                    type="text"
                                    value={groupForm.link_text}
                                    onChange={(e) => setGroupForm({ ...groupForm, link_text: e.target.value })}
                                    className="form-control"
                                    placeholder="Text shown on menu"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Page Type *</label>
                                <select
                                    value={groupForm.page_type}
                                    onChange={(e) => setGroupForm({ ...groupForm, page_type: e.target.value })}
                                    className="form-control"
                                    required
                                >
                                    <option value="">-- Select Page Type --</option>
                                    {pageTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-submit">
                                    Create Group
                                </button>
                                <button type="button" onClick={() => setShowGroupModal(false)} className="btn-cancel">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TopMenuList;


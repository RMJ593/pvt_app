import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';
import { extractArray } from '../../config/api';

function PageList() {
    const [pages, setPages] = useState([]);
    const [footerLinks, setFooterLinks] = useState([]);
    const [topMenuLinks, setTopMenuLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            
            // Fetch pages, footer links, and top menu links in parallel
            const [pagesRes, footerRes, menuRes] = await Promise.all([
                axios.get('/pages', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/footer-links', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
                axios.get('/menu-links', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
            ]);

            const pagesData = extractArray(pagesRes);
            const footerData = extractArray(footerRes);
            const menuData = extractArray(menuRes);

            setPages(pagesData);
            setFooterLinks(footerData);
            setTopMenuLinks(menuData.filter(link => link.link_type === 'nav_link' || link.link_type === 'top_menu'));
            
            console.log('Pages:', pagesData);
            console.log('Footer Links:', footerData);
            console.log('Top Menu Links:', menuData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load pages');
            setPages([]);
        } finally {
            setLoading(false);
        }
    };

    const getNavigationStatus = (pageId) => {
        const inFooter = footerLinks.some(link => link.page_id === pageId);
        const inTopMenu = topMenuLinks.some(link => link.page_id === pageId);

        if (inFooter && inTopMenu) {
            return { text: 'Footer & Top Menu', badges: ['footer', 'topmenu'], color: 'success' };
        } else if (inFooter) {
            return { text: 'Footer Only', badges: ['footer'], color: 'info' };
        } else if (inTopMenu) {
            return { text: 'Top Menu Only', badges: ['topmenu'], color: 'primary' };
        } else {
            return { text: 'Not Linked', badges: [], color: 'muted' };
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const newStatus = currentStatus === 1 ? 0 : 1;

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

            setPages(pages.map(page =>
                page.id === id ? { ...page, is_active: newStatus } : page
            ));
        } catch (error) {
            console.error('Error toggling status:', error);
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
                <div className="header-actions">
                    <Link to="/staff/footer-links" className="btn-secondary">
                        Manage Footer Links
                    </Link>
                    <Link to="/staff/top-menu" className="btn-secondary">
                        Manage Top Menu
                    </Link>
                    <Link to="/staff/pages/create" className="btn-new">
                        + New Page
                    </Link>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="info-box">
                <h3>ℹ️ How Page Navigation Works</h3>
                <p>
                    <strong>Footer Links:</strong> Manage which pages appear in the footer by going to "Manage Footer Links"<br/>
                    <strong>Top Menu:</strong> Manage which pages appear in the navigation menu by going to "Manage Top Menu"<br/>
                    <strong>Navigation Status:</strong> The table below shows where each page is currently linked
                </p>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>URL</th>
                            <th>Location</th>
                            <th>Navigation Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    No pages found. Click "New Page" to create one.
                                </td>
                            </tr>
                        ) : (
                            pages.map((page, index) => {
                                const navStatus = getNavigationStatus(page.id);
                                return (
                                    <tr key={page.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <strong>{page.page_title}</strong>
                                            {page.small_heading && (
                                                <div className="page-subtitle">{page.small_heading}</div>
                                            )}
                                        </td>
                                        <td>
                                            <code>/page/{page.slug || '/'}</code>
                                        </td>
                                        <td>
                                            {page.location ? (
                                                <span className="badge badge-secondary">{page.location}</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="navigation-status">
                                                {navStatus.badges.length > 0 ? (
                                                    navStatus.badges.map((badge, i) => (
                                                        <span key={i} className={`badge badge-${badge === 'footer' ? 'info' : 'primary'}`}>
                                                            {badge === 'footer' ? '📍 Footer' : '🔗 Top Menu'}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="badge badge-muted">❌ Not Linked</span>
                                                )}
                                            </div>
                                        </td>
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
                                                    Edit
                                                </Link>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(page.id)}
                                                    className="btn-delete"
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PageList;
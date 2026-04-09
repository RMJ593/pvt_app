import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './TopMenu.css';
import { extractArray } from '../../config/api';

function TopMenuForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        link_text: '',
        link_type: 'custom_url',
        page_id: '',
        custom_url: '',
        open_new_tab: false
    });

    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPages();
        if (isEditMode) {
            fetchLink();
        }
    }, [id, isEditMode]);

    const fetchPages = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/pages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPages(extractArray(response));
        } catch (err) {
            console.error('Error fetching pages:', err);
            setPages([]);
        }
    };

    const fetchLink = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`/menu-links/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const link = response.data.data;
                const isPageLink = !!link.page_id;

                setFormData({
                    link_text: link.link_text || link.title || '',
                    link_type: isPageLink ? 'page' : 'custom_url',
                    page_id: link.page_id || '',
                    custom_url: !isPageLink ? (link.url || '') : '',
                    open_new_tab: link.target === '_blank'
                });
            }
        } catch (err) {
            console.error('Error fetching link:', err);
            setError('Failed to load menu link');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // --- Frontend validation ---
        if (!formData.link_text.trim()) {
            setError('Link Text is required.');
            setLoading(false);
            return;
        }

        if (formData.link_type === 'custom_url' && !formData.custom_url.trim()) {
            setError('URL is required for Custom URL type.');
            setLoading(false);
            return;
        }

        if (formData.link_type === 'page' && !formData.page_id) {
            setError('Please select a page.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');

            // Resolve URL and page_id based on link type
            let finalUrl = '#';
            let finalPageId = null;

            if (formData.link_type === 'page') {
                const selectedPage = pages.find(p => p.id === parseInt(formData.page_id));
                if (selectedPage) {
                    finalUrl = `/page/${selectedPage.slug}`;
                    finalPageId = parseInt(formData.page_id);
                }
            } else {
                finalUrl = formData.custom_url.trim();
            }

            /*
             * FIX: Send only fields the backend actually needs.
             *   - Removed the redundant `name` field (backend doesn't have it).
             *   - `link_text` is used as `title` in the backend — no duplication.
             *   - `menu_id` is omitted entirely so it stays null (avoids FK crash on menu id 1).
             *   - `is_active` / `is_group` sent as real booleans.
             */
            const payload = {
                link_text:  formData.link_text.trim(),
                url:        finalUrl,
                page_id:    finalPageId,
                page_type:  finalPageId ? 'Page' : null,
                target:     formData.open_new_tab ? '_blank' : '_self',
                link_type:  'top_menu',
                order:      0,
                is_active:  true,
                is_group:   false
            };

            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = isEditMode
                ? await axios.put(`/menu-links/${id}`, payload, { headers })
                : await axios.post('/menu-links', payload, { headers });

            if (response.data.success) {
                navigate('/staff/top-menu');
            } else {
                setError(response.data.message || 'Failed to save menu link');
            }
        } catch (err) {
            console.error('Error saving link:', err);

            if (err.response?.data?.errors) {
                // 422 Validation errors from backend
                const msgs = Object.entries(err.response.data.errors)
                    .map(([field, messages]) =>
                        `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
                    )
                    .join('\n');
                setError(`Validation failed:\n${msgs}`);
            } else if (err.response?.data?.error) {
                // 500 with exposed error string (now returned by fixed controller)
                setError(`Server error: ${err.response.data.error}`);
            } else {
                setError(err.response?.data?.message || 'Failed to save menu link');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="top-menu-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Menu Link' : 'Create Menu Link'}</h1>
                <Link to="/staff/top-menu" className="btn-back">
                    ← Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error" style={{ whiteSpace: 'pre-line' }}>
                    {error}
                </div>
            )}

            <div className="info-box">
                <h3>💡 Quick Examples</h3>
                <p>
                    <strong>Custom URL:</strong> /, /about, /our-menus, /contact<br />
                    <strong>CMS Page:</strong> Select from the "Page" dropdown below
                </p>
            </div>

            <form onSubmit={handleSubmit} className="top-menu-form">
                <div className="form-section">
                    <h2>Link Information</h2>

                    <div className="form-group">
                        <label>Link Text *</label>
                        <input
                            type="text"
                            name="link_text"
                            value={formData.link_text}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Text displayed in the menu (e.g. HOME, ABOUT US)"
                            required
                        />
                        <small className="form-text">
                            This text appears in the navigation menu
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Link Type *</label>
                        <select
                            name="link_type"
                            value={formData.link_type}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="custom_url">Custom URL (hardcoded page)</option>
                            <option value="page">CMS Page (created in Pages section)</option>
                        </select>
                    </div>

                    {formData.link_type === 'custom_url' ? (
                        <div className="form-group">
                            <label>URL *</label>
                            <input
                                type="text"
                                name="custom_url"
                                value={formData.custom_url}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="/, /about, /our-menus, /contact"
                                required
                            />
                            <small className="form-text">
                                Use <code>/</code> for the homepage.<br />
                                Examples: /about, /our-menus, /contact, /blogs
                            </small>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Page *</label>
                            <select
                                name="page_id"
                                value={formData.page_id}
                                onChange={handleChange}
                                className="form-control"
                                required
                            >
                                <option value="">-- Select Page --</option>
                                {pages.map((page) => (
                                    <option key={page.id} value={page.id}>
                                        {page.page_title || page.title} ({page.slug})
                                    </option>
                                ))}
                            </select>
                            <small className="form-text">
                                Pages created in the Pages section
                            </small>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="toggle-label">
                            <span>Open in New Tab</span>
                            <label className="toggle-switch-inline">
                                <input
                                    type="checkbox"
                                    name="open_new_tab"
                                    checked={formData.open_new_tab}
                                    onChange={handleChange}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Link' : 'Create Link')}
                    </button>
                    <Link to="/staff/top-menu" className="btn-cancel">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default TopMenuForm;
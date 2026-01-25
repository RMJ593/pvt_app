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
        name: '',
        link_text: '',
        link_type: 'custom_url', // 'custom_url' or 'page'
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
            
            const pagesData = extractArray(response);
            setPages(pagesData);
        } catch (error) {
            console.error('Error fetching pages:', error);
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
                
                // Determine if it's a page link or custom URL
                const isPageLink = link.page_id && link.page_id !== null;
                
                setFormData({
                    name: link.title || '',
                    link_text: link.link_text || link.title || '',
                    link_type: isPageLink ? 'page' : 'custom_url',
                    page_id: link.page_id || '',
                    custom_url: !isPageLink ? link.url : '',
                    open_new_tab: link.target === '_blank'
                });
            }
        } catch (error) {
            console.error('Error fetching link:', error);
            setError('Failed to load menu link');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');

            let finalUrl = '';
            let finalPageId = null;

            if (formData.link_type === 'page') {
                // Link to a CMS page
                const selectedPage = pages.find(p => p.id === parseInt(formData.page_id));
                if (selectedPage) {
                    finalUrl = `/page/${selectedPage.slug}`;
                    finalPageId = formData.page_id;
                }
            } else {
                // Custom URL (hardcoded pages)
                finalUrl = formData.custom_url;
                finalPageId = null;
            }

            const dataToSend = {
                title: formData.link_text, // Use link_text as title
                link_text: formData.link_text,
                page_type: 'Page', // Add default page type
                page_id: finalPageId,
                url: finalUrl || '#', // Ensure URL is never empty
                target: formData.open_new_tab ? '_blank' : '_self',
                link_type: 'nav_link',
                menu_id: null, // Changed from 1 to null - let backend handle it
                order: 0, // Changed from 1 to 0
                is_active: 1, // Use 1 instead of true
                is_group: 0 // Use 0 instead of false
            };

            console.log('Final data being sent:', dataToSend);

            console.log('Submitting top menu link:', dataToSend);

            let response;
            if (isEditMode) {
                response = await axios.put(`/menu-links/${id}`, dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                response = await axios.post('/menu-links', dataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            console.log('Response:', response.data);

            if (response.data.success) {
                navigate('/staff/top-menu');
            }
        } catch (error) {
            console.error('Error saving link:', error);
            console.error('Error details:', error.response?.data);
            
            // Show detailed validation errors
            if (error.response?.data?.errors) {
                const errorDetails = error.response.data.errors;
                console.log('📋 Validation Errors:', errorDetails);
                
                const errors = Object.entries(errorDetails).map(([field, messages]) => {
                    return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                }).join('\n');
                
                setError(`Validation failed:\n${errors}`);
            } else {
                setError(error.response?.data?.message || 'Failed to save menu link');
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
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="info-box">
                <h3>💡 Quick Examples:</h3>
                <p>
                    <strong>Hardcoded Pages:</strong> /, /about, /our-menus, /contact<br/>
                    <strong>CMS Pages:</strong> Select from "Page" dropdown (e.g., Terms & Conditions)
                </p>
            </div>

            <form onSubmit={handleSubmit} className="top-menu-form">
                <div className="form-section">
                    <h2>Link Information</h2>

                    <div className="form-group">
                        <label>Name To Identify *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., Home Link, About Us Link"
                            required
                        />
                        <small className="form-text">
                            This is for internal identification only
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Link Text *</label>
                        <input
                            type="text"
                            name="link_text"
                            value={formData.link_text}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Text displayed on menu (e.g., HOME, ABOUT US)"
                            required
                        />
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
                            <option value="custom_url">Custom URL (Hardcoded page)</option>
                            <option value="page">CMS Page (Created in Pages section)</option>
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
                                Use "/" for homepage<br/>
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
                                These are pages created in the Pages section
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
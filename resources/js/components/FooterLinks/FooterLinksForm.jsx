import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './FooterLinks.css';
import { extractArray } from '../../config/api';

function FooterLinksForm() {
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
            const response = await axios.get(`/footer-links/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const link = response.data.data;
                
                // Determine if it's a page link or custom URL
                const isPageLink = link.page_id && link.page_id !== null;
                
                setFormData({
                    name: link.title || '',
                    link_text: link.title || '',
                    link_type: isPageLink ? 'page' : 'custom_url',
                    page_id: link.page_id || '',
                    custom_url: !isPageLink ? link.url : '',
                    open_new_tab: link.target === '_blank'
                });
            }
        } catch (error) {
            console.error('Error fetching link:', error);
            setError('Failed to load footer link');
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

        console.log('Submitting footer link:', formData);

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
                // Custom URL (hardcoded pages or external links)
                finalUrl = formData.custom_url;
                finalPageId = null;
            }

            const dataToSend = {
                title: formData.link_text || formData.name,
                page_type: null,
                page_id: finalPageId,
                url: finalUrl,
                target: formData.open_new_tab ? '_blank' : '_self',
                order: 0,
                is_active: true
            };

            console.log('Sending data:', dataToSend);

            let response;

            if (isEditMode) {
                response = await axios.put(
                    `/footer-links/${id}`,
                    dataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                response = await axios.post(
                    '/footer-links',
                    dataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            console.log('Response:', response);

            if (response.data.success) {
                console.log('Success! Redirecting...');
                navigate('/staff/footer-links');
            }
        } catch (error) {
            console.error('Error saving link:', error);
            console.error('Error response:', error.response?.data);

            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                setError(errors.join(', '));
            } else {
                setError(error.response?.data?.message || 'Failed to save footer link');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="footer-links-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Footer Link' : 'Create Footer Link'}</h1>
                <button
                    type="button"
                    onClick={() => navigate('/staff/footer-links')}
                    className="btn-back"
                >
                    ← Back to List
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="info-box">
                <h3>💡 Quick Examples:</h3>
                <p>
                    <strong>Hardcoded Pages:</strong> /about, /contact, /blogs, /booking<br/>
                    <strong>External Links:</strong> https://drive.google.com/your-menu-pdf<br/>
                    <strong>CMS Pages:</strong> Select from "Page" dropdown (e.g., Terms & Conditions)
                </p>
            </div>

            <form onSubmit={handleSubmit} className="footer-links-form">
                <div className="form-section">
                    <div className="form-group">
                        <label>Name To Identify *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., About Us Link"
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
                            placeholder="Text displayed in footer (e.g., About Us)"
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
                            <option value="custom_url">Custom URL (Hardcoded page or external link)</option>
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
                                placeholder="/about, /contact, /blogs, or https://..."
                                required
                            />
                            <small className="form-text">
                                Examples: /about, /contact, /booking, https://drive.google.com/file/...
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
                        <small className="form-text">
                            Recommended for external links (Google Drive, etc.)
                        </small>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Link' : 'Create Link')}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/staff/footer-links')} 
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FooterLinksForm;
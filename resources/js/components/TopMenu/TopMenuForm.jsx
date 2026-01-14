import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './TopMenu.css';

function TopMenuForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        link_text: '',
        page_type: '',
        page_id: '',
        open_new_tab: false
    });

    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pageTypes = ['Page', 'Blog', 'Portfolio', 'Gallery', 'Contact', 'Custom'];

    useEffect(() => {
        fetchPages();
        if (isEditMode) {
            fetchLink();
        }
    }, [id, isEditMode]);

    const fetchPages = async () => {
        try {
            const response = await axios.get('/pages');
            if (response.data.success) {
                setPages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const fetchLink = async () => {
        try {
            const response = await axios.get(`/menu-links/${id}`);
            if (response.data.success) {
                const link = response.data.data;
                setFormData({
                    name: link.title || '',
                    link_text: link.link_text || '',
                    page_type: link.page_type || '',
                    page_id: link.page_id || '',
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
            // Get the selected page's slug
            const selectedPage = pages.find(p => p.id === parseInt(formData.page_id));
            const pageSlug = selectedPage?.slug || '';

            const dataToSend = {
                title: formData.name,
                link_text: formData.link_text,
                page_type: formData.page_type,
                page_id: formData.page_id || null,
                url: pageSlug ? `/page/${pageSlug}` : '',
                target: formData.open_new_tab ? '_blank' : '_self',
                link_type: 'top_menu',  // ✅ ADDED: Mark as top menu link
                menu_id: 1,
                order: 1,
                is_active: true,
                is_group: false
            };

            console.log('Submitting top menu link:', dataToSend);

            let response;
            if (isEditMode) {
                response = await axios.put(`/menu-links/${id}`, dataToSend);
            } else {
                response = await axios.post('/menu-links', dataToSend);
            }

            console.log('Response:', response.data);

            if (response.data.success) {
                navigate('/staff/top-menu');
            }
        } catch (error) {
            console.error('Error saving link:', error);
            console.error('Error details:', error.response?.data);
            
            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                setError(errors.join(', '));
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
                            placeholder="e.g., Main About Page"
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
                            placeholder="Text displayed on menu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Page Type *</label>
                        <select
                            name="page_type"
                            value={formData.page_type}
                            onChange={handleChange}
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
                                    {page.page_title || page.title}
                                </option>
                            ))}
                        </select>
                    </div>

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
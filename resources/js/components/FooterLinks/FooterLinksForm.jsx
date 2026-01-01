import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './FooterLinks.css';
import { API_BASE_URL, getStorageUrl } from '../../config/api';

function FooterLinksForm() {
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
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/pages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setPages(response.data.data || []);
            } else if (Array.isArray(response.data)) {
                setPages(response.data);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const fetchLink = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/footer-links/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                const link = response.data.data;
                setFormData({
                    name: link.title || '',
                    link_text: link.title || '',
                    page_type: link.page_type || '',
                    page_id: link.page_id || '',
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
            
            // Prepare data for API
            const dataToSend = {
                title: formData.name,
                url: formData.page_id ? `/page/${formData.page_id}` : '#',
                order: 0,
                is_active: true
            };

            let response;

            if (isEditMode) {
                response = await axios.put(
                    `${API_BASE_URL}/footer-links/${id}`,
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
                    `${API_BASE_URL}/footer-links`,
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
                window.location.href = '/staff/footer-links';
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

    const handleBackClick = () => {
        window.location.href = '/staff/footer-links';
    };

    return (
        <div className="footer-links-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Footer Link' : 'Create Footer Link'}</h1>
                <button 
                    type="button"
                    onClick={handleBackClick} 
                    className="btn-back"
                >
                     Back to List
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

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
                            placeholder="e.g., Privacy Policy Link"
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
                            placeholder="Text displayed in footer"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Page Type</label>
                        <select
                            name="page_type"
                            value={formData.page_type}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="">-- Select Page Type (Optional) --</option>
                            {pageTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Page</label>
                        <select
                            name="page_id"
                            value={formData.page_id}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="">-- Select Page (Optional) --</option>
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
                        {loading ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FooterLinksForm;


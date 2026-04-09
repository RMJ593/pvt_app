import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HeroBanner.css';

function HeroBanner() {
    const [formData, setFormData] = useState({
        small_heading: '',
        heading: '',
        description: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [bannerId, setBannerId] = useState(null);

    useEffect(() => {
        fetchBanner();
    }, []);

    const fetchBanner = async () => {
        try {
            const response = await axios.get('/hero-banners');
            if (response.data.success && response.data.data?.length > 0) {
                const banner = response.data.data[0];
                setBannerId(banner.id);
                setFormData({
                    small_heading: banner.subtitle || '',
                    heading: banner.title || '',
                    description: banner.description || '',
                });
                if (banner.image_path) {
                    const imageUrl =
                        banner.image_path.startsWith('http://') || banner.image_path.startsWith('https://')
                            ? banner.image_path
                            : `/storage/${banner.image_path}`;
                    setImagePreview(imageUrl);
                }
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
            setMessage('Failed to load banner data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setMessage('Image size must be less than 10MB.');
            e.target.value = '';
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setMessage('Please upload a valid image (JPG, PNG, WebP, or GIF).');
            e.target.value = '';
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.heading);
            formDataToSend.append('subtitle', formData.small_heading);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('is_active', '1');

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            let response;
            if (bannerId) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(`/hero-banners/${bannerId}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                response = await axios.post('/hero-banners', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (response.data.success && response.data.data?.id) {
                    setBannerId(response.data.data.id);
                }
            }

            if (response.data.success) {
                setMessage('Hero banner saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorList = Object.entries(errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join(' | ');
                setMessage(`Validation failed: ${errorList}`);
            } else {
                setMessage(error.response?.data?.message || 'Failed to save banner.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="hero-banner-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="hero-banner-form-container">
            <div className="form-header">
                <h1>Hero Banner</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="hero-banner-form">
                <div className="form-section">
                    <h2>Banner Content</h2>

                    <div className="form-group">
                        <label>Small Heading (Subtitle) *</label>
                        <input
                            type="text"
                            name="small_heading"
                            value={formData.small_heading}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., DELIGHTFUL EXPERIENCE"
                            required
                        />
                        <small className="form-text">This appears above the main heading</small>
                    </div>

                    <div className="form-group">
                        <label>Main Heading (Title) *</label>
                        <input
                            type="text"
                            name="heading"
                            value={formData.heading}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., Handcrafted Indian Flavours, Straight from the Heart"
                            required
                        />
                        <small className="form-text">The main title displayed on the banner</small>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            rows="4"
                            placeholder="Brief description shown on the banner..."
                        />
                        <small className="form-text">Optional: Appears below the main heading</small>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Background Image</h2>

                    <div className="form-group">
                        <label>Upload Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleImageChange}
                            className="form-control-file"
                        />
                        <small className="form-text">
                            Accepted: JPG, PNG, WebP, GIF. Max size: 10MB. Recommended: 1920×1080px landscape.
                        </small>
                    </div>

                    {imagePreview && (
                        <div className="image-preview-large">
                            <img
                                src={imagePreview}
                                alt="Banner preview"
                                style={{
                                    width: '100%',
                                    maxHeight: '400px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={saving} className="btn-submit">
                        {saving ? 'Saving...' : 'Save Banner'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default HeroBanner;
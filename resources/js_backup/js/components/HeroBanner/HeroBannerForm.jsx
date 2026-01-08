import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './HeroBanner.css';

function HeroBannerForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        small_heading: '',
        heading: '',
        description: '',
        button_text: '',
        page_type: '',
        page_id: '',
        order: 0,
        is_active: true,
    });

    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pageTypes = [
        'Home',
        'About',
        'Services',
        'Contact',
        'Menu',
        'Gallery',
        'Custom Page',
        'External Link'
    ];

    useEffect(() => {
        fetchPages();
        if (isEditMode) {
            fetchBanner();
        }
    }, [id]);

    const fetchPages = async () => {
        try {
            const response = await axios.get('/api/pages');
            if (response.data.success) {
                setPages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const fetchBanner = async () => {
        try {
            const response = await axios.get(`/api/hero-banners/${id}`);
            if (response.data.success) {
                const banner = response.data.data;
                setFormData({
                    small_heading: banner.subtitle || '',
                    heading: banner.title || '',
                    description: banner.description || '',
                    button_text: banner.button_text || '',
                    page_type: banner.page_type || '',
                    page_id: banner.page_id || '',
                    order: banner.order || 0,
                    is_active: banner.is_active,
                });
                
                if (banner.image_path) {
                    // Handle both Cloudinary URLs and local storage paths
                    const videoUrl = (banner.image_path.startsWith('http://') || banner.image_path.startsWith('https://'))
                        ? banner.image_path 
                        : `/storage/${banner.image_path}`;
                    setVideoPreview(videoUrl);
                }
            }
        } catch (error) {
            console.error('Error fetching banner:', error);
            setError('Failed to load banner');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 50MB for video)
            if (file.size > 50 * 1024 * 1024) {
                setError('Video file size must be less than 50MB');
                e.target.value = '';
                return;
            }
            
            // Check file type
            const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid video file (MP4, WebM, or OGG)');
                e.target.value = '';
                return;
            }
            
            console.log('Video file selected:', file.name, file.size);
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate video file is selected for new banners
        if (!isEditMode && !videoFile) {
            setError('Please select a video file');
            alert('Please select a video file');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            
            // ? FIXED: Map all fields correctly
            formDataToSend.append('title', formData.heading);
            formDataToSend.append('subtitle', formData.small_heading);
            formDataToSend.append('description', formData.description || ''); // ? ADDED
            formDataToSend.append('button_text', formData.button_text || '');
            formDataToSend.append('button_link', formData.page_id ? `/page/${formData.page_id}` : '');
            formDataToSend.append('order', formData.order);
            formDataToSend.append('is_active', formData.is_active ? '1' : '0');

            if (videoFile) {
                console.log('Appending video file to form data');
                formDataToSend.append('image', videoFile);
            }

            console.log('Form data being sent:');
            for (let pair of formDataToSend.entries()) {
                if (pair[0] === 'image') {
                    console.log(pair[0] + ': [File]', pair[1].name, pair[1].size);
                } else {
                    console.log(pair[0] + ':', pair[1]);
                }
            }

            let response;
            if (isEditMode) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(
                    `/api/hero-banners/${id}`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            } else {
                response = await axios.post(
                    '/api/hero-banners',
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            }

            console.log('Success response:', response.data);
            if (response.data.success) {
                alert('Hero banner saved successfully!');
                navigate('/staff/hero-banners');
            }
        } catch (error) {
            console.error('=== ERROR DETAILS ===');
            console.error('Error:', error.response?.data);
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                console.error('Validation errors:', errors);
                
                const errorList = Object.entries(errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
                
                setError(`Validation failed:\n${errorList}`);
                alert(`Validation Errors:\n\n${errorList}`);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
                alert(`Error: ${error.response.data.message}`);
            } else {
                setError('Failed to save banner. Please check console for details.');
                alert('Failed to save banner. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero-banner-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Hero Banner' : 'Create Hero Banner'}</h1>
                <Link to="/staff/hero-banners" className="btn-back">
                    Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error" style={{ whiteSpace: 'pre-line' }}>
                    {error}
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
                        <small className="form-text">
                            This appears above the main heading
                        </small>
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
                        <small className="form-text">
                            The main title displayed on the banner
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            rows="4"
                            placeholder="Brief description about this banner... (e.g., At Curry Leaf, every dish is a celebration...)"
                        />
                        <small className="form-text">
                            Optional: Appears below the main heading
                        </small>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Background Video *</h2>

                    <div className="form-group">
                        <label>Upload Video {!isEditMode && '(Required)'}</label>
                        <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            onChange={handleVideoChange}
                            className="form-control-file"
                            required={!isEditMode}
                        />
                        <small className="form-text">
                            Accepted formats: MP4, WebM, OGG. Max size: 50MB. Recommended: 1920x1080px, landscape orientation
                        </small>
                        {!videoFile && !isEditMode && (
                            <small style={{ color: 'red', display: 'block', marginTop: '0.5rem' }}>
                                ?? Please select a video file before submitting
                            </small>
                        )}
                    </div>

                    {videoPreview && (
                        <div className="video-preview-large">
                            <video 
                                src={videoPreview} 
                                controls 
                                style={{ width: '100%', maxHeight: '400px', borderRadius: '8px' }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h2>Button & Link Settings</h2>

                    <div className="form-group">
                        <label>Button Text</label>
                        <input
                            type="text"
                            name="button_text"
                            value={formData.button_text}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., VIEW OUR MENU"
                        />
                        <small className="form-text">
                            Leave empty to hide the button
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Page Type</label>
                        <select
                            name="page_type"
                            value={formData.page_type}
                            onChange={handleChange}
                            className="form-control"
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
                        <label>Select Page</label>
                        <select
                            name="page_id"
                            value={formData.page_id}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="">-- Select a Page --</option>
                            {pages.map((page) => (
                                <option key={page.id} value={page.id}>
                                    {page.title}
                                </option>
                            ))}
                        </select>
                        <small className="form-text">
                            Leave empty if not linking to a specific page
                        </small>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Display Settings</h2>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Display Order</label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                className="form-control"
                                min="0"
                            />
                            <small className="form-text">
                                Lower numbers display first (0 = highest priority)
                            </small>
                        </div>

                        <div className="form-group half-width">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span>Active (visible on website)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        disabled={loading || (!isEditMode && !videoFile)} 
                        className="btn-submit"
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Banner' : 'Create Banner')}
                    </button>
                    <Link to="/staff/hero-banners" className="btn-cancel">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default HeroBannerForm;

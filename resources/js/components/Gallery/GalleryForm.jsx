import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Gallery.css';

function GalleryForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // API Base URL helper
    const getApiBaseUrl = () => {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://127.0.0.1:8000/api'
            : 'https://tphrc-int-project-cjld.onrender.com/api';
    };

    useEffect(() => {
        if (isEditMode) {
            fetchImage();
        }
    }, [id]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `/storage/${imagePath}`;
    };

    const fetchImage = async () => {
        try {
            const apiBaseUrl = getApiBaseUrl();
            const response = await axios.get(`${apiBaseUrl}/gallery/${id}`);
            if (response.data.success) {
                const image = response.data.data;
                setFormData({
                    title: image.title
                });
                if (image.image) {
                    setImagePreview(getImageUrl(image.image));
                }
            }
        } catch (error) {
            console.error('Error fetching gallery image:', error);
            setError('Failed to load gallery image');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should not exceed 2MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isEditMode && !imageFile) {
            setError('Image is required');
            setLoading(false);
            return;
        }

        try {
            const apiBaseUrl = getApiBaseUrl();
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('is_active', 1);

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            let response;
            if (isEditMode) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(
                    `${apiBaseUrl}/gallery/${id}`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            } else {
                response = await axios.post(
                    `${apiBaseUrl}/gallery`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            }

            if (response.data.success) {
                navigate('/staff/gallery');
            }
        } catch (error) {
            console.error('Error saving gallery image:', error);
            setError(error.response?.data?.message || 'Failed to save gallery image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gallery-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Gallery Image' : 'Add Gallery Image'}</h1>
                <Link to="/staff/gallery" className="btn-back">
                    ← Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="gallery-form">
                <div className="form-group">
                    <label>Identification Name *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter identification name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Image * {isEditMode && '(Leave empty to keep current image)'}</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-control-file"
                        required={!isEditMode}
                    />
                    <small className="form-text">
                        Max 2MB. Formats: JPG, PNG, GIF, WebP
                    </small>
                </div>

                {imagePreview && (
                    <div className="image-preview-large">
                        <img src={imagePreview} alt="Preview" />
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GalleryForm;
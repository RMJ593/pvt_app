import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Testimonials.css';

function TestimonialForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        customer_name: '',
        review: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchTestimonial();
        }
    }, [id]);

    const fetchTestimonial = async () => {
        try {
            const response = await axios.get(`/api/testimonials/${id}`);
            if (response.data.success) {
                const testimonial = response.data.data;
                setFormData({
                    customer_name: testimonial.customer_name,
                    review: testimonial.review
                });
                if (testimonial.customer_image) {
                    setImagePreview(`/storage/${testimonial.customer_image}`);
                }
            }
        } catch (error) {
            console.error('Error fetching testimonial:', error);
            setError('Failed to load testimonial');
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
            // Validate file size (max 2MB)
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

        // Validation
        if (!isEditMode && !imageFile) {
            setError('Profile image is required');
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('customer_name', formData.customer_name);
            formDataToSend.append('review', formData.review);

            if (imageFile) {
                formDataToSend.append('customer_image', imageFile);
            }

            let response;
            if (isEditMode) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(
                    `/api/testimonials/${id}`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            } else {
                response = await axios.post(
                    '/api/testimonials',
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            }

            if (response.data.success) {
                navigate('/staff/testimonials');
            }
        } catch (error) {
            console.error('Error saving testimonial:', error);
            setError(error.response?.data?.message || 'Failed to save testimonial');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="testimonial-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Testimonial' : 'Add Testimonial'}</h1>
                <Link to="/staff/testimonials" className="btn-back">
                     Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="testimonial-form">
                <div className="form-group">
                    <label>User Name *</label>
                    <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter user name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Testimonial *</label>
                    <textarea
                        name="review"
                        value={formData.review}
                        onChange={handleChange}
                        className="form-control"
                        rows="5"
                        placeholder="Enter testimonial"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Profile Image * {isEditMode && '(Leave empty to keep current image)'}</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="form-control-file"
                        required={!isEditMode}
                    />
                    <small className="form-text">
                        Preferred dimension: 100px x 100px. Max 2MB.
                    </small>
                </div>

                {imagePreview && (
                    <div className="image-preview-circle">
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

export default TestimonialForm;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './TeamMembers.css';

function TeamMemberForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        company_id: '',
        name: '',
        designation: '',
        description: '',
        facebook: '',
        twitter: '',
        instagram: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchMember();
        }
    }, [id, isEditMode]);

    const fetchMember = async () => {
        try {
            const response = await axios.get(`/api/team-members/${id}`);
            if (response.data.success) {
                const member = response.data.data;
                setFormData({
                    company_id: member.company_id || '',
                    name: member.name || '',
                    designation: member.designation || '',
                    description: member.description || '',
                    facebook: member.facebook || '',
                    twitter: member.twitter || '',
                    instagram: member.instagram || ''
                });
                if (member.image) {
                    setImagePreview(`/storage/${member.image}`);
                }
            }
        } catch (error) {
            console.error('Error fetching team member:', error);
            setError('Failed to load team member');
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
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('company_id', formData.company_id);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('designation', formData.designation);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('facebook', formData.facebook);
            formDataToSend.append('twitter', formData.twitter);
            formDataToSend.append('instagram', formData.instagram);

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            let response;
            if (isEditMode) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(
                    `/api/team-members/${id}`,
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            } else {
                response = await axios.post(
                    '/api/team-members',
                    formDataToSend,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    }
                );
            }

            if (response.data.success) {
                navigate('/staff/team-members');
            }
        } catch (error) {
            console.error('Error saving team member:', error);
            setError(error.response?.data?.message || 'Failed to save team member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="team-member-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Team Member' : 'Create Team Member'}</h1>
                <Link to="/staff/team-members" className="btn-back">
                     Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="team-member-form">
                <div className="form-section">
                    <h2>Basic Information</h2>

                    <div className="form-group">
                        <label>Company Reg ID *</label>
                        <input
                            type="text"
                            name="company_id"
                            value={formData.company_id}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., EMP001"
                            required
                        />
                        <small className="form-text">
                            Unique company registration ID for this team member
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Designation *</label>
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., Head Chef, Manager"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Small Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            rows="4"
                            placeholder="Brief description about the team member..."
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Profile Image *</h2>

                    <div className="form-group">
                        <label>Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-control-file"
                            required={!isEditMode}
                        />
                        <small className="form-text">
                            Recommended size: 400x400px. Max 2MB.
                        </small>
                    </div>

                    {imagePreview && (
                        <div className="image-preview-circle">
                            <img src={imagePreview} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h2>Social Media Links</h2>
                    <p className="section-description">Optional - Add social media profile URLs</p>

                    <div className="form-group">
                        <label>Facebook URL</label>
                        <input
                            type="url"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="https://facebook.com/username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Twitter URL</label>
                        <input
                            type="url"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="https://twitter.com/username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Instagram URL</label>
                        <input
                            type="url"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="https://instagram.com/username"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : (isEditMode ? 'Update Team Member' : 'Create Team Member')}
                    </button>
                    <Link to="/staff/team-members" className="btn-cancel">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default TeamMemberForm;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './MailTemplates.css';
import { API_BASE_URL, getStorageUrl } from '../../config/api';

function MailTemplateForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        body: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Set base API URL
   
    useEffect(() => {
        if (isEditMode) {
            fetchTemplate();
        }
    }, [id, isEditMode]);

    const fetchTemplate = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/mail-templates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success || response.data) {
                const template = response.data.data || response.data;
                setFormData({
                    name: template.name || '',
                    subject: template.subject || '',
                    body: template.body || ''
                });
            }
        } catch (error) {
            console.error('Error fetching mail template:', error);
            setError('Failed to load mail template');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Submitting mail template:', formData);

        try {
            const token = localStorage.getItem('auth_token');
            let response;

            if (isEditMode) {
                console.log('Updating template:', id);
                response = await axios.put(
                    `${API_BASE_URL}/mail-templates/${id}`,
                    formData,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                console.log('Creating new template');
                response = await axios.post(
                    `${API_BASE_URL}/mail-templates`,
                    formData,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            // Check for successful response
            if (response.status === 200 || response.status === 201) {
                console.log('Success! Redirecting to list page...');
                
                // Clear any form state before navigation
                setFormData({ name: '', subject: '', body: '' });
                
                // Use window.location for full page reload to ensure list updates
                window.location.href = '/staff/mail-templates';
            } else {
                setError('Failed to save mail template');
            }
        } catch (error) {
            console.error('Error saving mail template:', error);
            console.error('Error response:', error.response?.data);
            
            // More detailed error handling
            if (error.response) {
                setError(error.response.data?.message || `Server error: ${error.response.status}`);
            } else if (error.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('Failed to save mail template');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        console.log('Back button clicked - returning to list');
        window.location.href = '/staff/mail-templates';
    };

    return (
        <div className="mail-template-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Mail Template' : 'Add Mail Template'}</h1>
                <button 
                    type="button"
                    onClick={handleBackClick} 
                    className="btn-back"
                >
                    † Back to List
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mail-template-form">
                <div className="form-group">
                    <label>Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., Booking Confirmation"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mail Subject *</label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., Your Table Booking Confirmation"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mail Body *</label>
                    <textarea
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        className="form-control"
                        rows="10"
                        placeholder="Enter email body with placeholders..."
                        required
                    />
                </div>

                <div className="notes-section">
                    <h3>Note:</h3>
                    <ul>
                        <li><strong>{'{BName}'}</strong> - Use for name provided by person on booking. So if the person's name is John Doe, then "Dear {'{BName}'}" will become "Dear John Doe".</li>
                        <li><strong>{'{BEmail}'}</strong> - Use for email.</li>
                        <li><strong>{'{BPhone}'}</strong> - Use for phone.</li>
                        <li><strong>{'{BPerson}'}</strong> - Use for number of persons.</li>
                        <li><strong>{'{BDate}'}</strong> - Use for requested date.</li>
                        <li><strong>{'{BTime}'}</strong> - Use for requested time.</li>
                        <li><strong>{'{BMessage}'}</strong> - Use for message added on table request.</li>
                    </ul>
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

export default MailTemplateForm;


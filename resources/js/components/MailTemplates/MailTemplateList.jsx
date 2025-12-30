import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './MailTemplates.css';

function MailTemplateList() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/mail-templates`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Fetched templates:', response.data);

            if (response.data.success) {
                setTemplates(response.data.data || []);
            } else if (Array.isArray(response.data)) {
                setTemplates(response.data);
            } else {
                setTemplates([]);
            }
        } catch (error) {
            console.error('Error fetching mail templates:', error);
            setError('Failed to load mail templates');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const newStatus = currentStatus === 1 ? 0 : 1;

            console.log('Toggling status for template:', id, 'from', currentStatus, 'to', newStatus);

            // Try multiple possible API endpoints
            let response;
            try {
                // Method 1: PATCH with /status endpoint
                response = await axios.patch(
                    `${API_BASE_URL}/mail-templates/${id}/status`,
                    { status: newStatus },
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (err1) {
                console.log('Method 1 failed, trying PUT method...');
                try {
                    // Method 2: PUT to update the entire template
                    response = await axios.put(
                        `${API_BASE_URL}/mail-templates/${id}`,
                        { status: newStatus },
                        {
                            headers: { 
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                } catch (err2) {
                    console.log('Method 2 failed, trying POST method...');
                    // Method 3: POST with status update
                    response = await axios.post(
                        `${API_BASE_URL}/mail-templates/${id}/toggle-status`,
                        { status: newStatus },
                        {
                            headers: { 
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            }

            console.log('Status update response:', response.data);

            // Update local state
            setTemplates(templates.map(template =>
                template.id === id ? { ...template, status: newStatus } : template
            ));

            console.log('Status updated successfully');
        } catch (error) {
            console.error('Error toggling status:', error);
            console.error('Error response:', error.response?.data);
            alert('Failed to update status. Please check console for details.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this mail template?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API_BASE_URL}/mail-templates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from local state
            setTemplates(templates.filter(template => template.id !== id));
            alert('Mail template deleted successfully');
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete mail template');
        }
    };

    if (loading) {
        return (
            <div className="mail-templates-container">
                <div className="loading">Loading mail templates...</div>
            </div>
        );
    }

    return (
        <div className="mail-templates-container">
            <div className="page-header">
                <h1>Mail Templates</h1>
                <Link to="/staff/mail-templates/create" className="btn-new">
                    + New Mail Template
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">
                                    No mail templates found. Click "New Mail Template" to create one.
                                </td>
                            </tr>
                        ) : (
                            templates.map((template, index) => (
                                <tr key={template.id}>
                                    <td>{index + 1}</td>
                                    <td>{template.name}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {/* Toggle Switch */}
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={template.status === 1}
                                                    onChange={() => handleToggleStatus(template.id, template.status)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>

                                            {/* Edit Button */}
                                            <Link
                                                to={`/staff/mail-templates/${template.id}/edit`}
                                                className="btn-edit"
                                                title="Edit"
                                            >
                                                hbhghg
                                            </Link>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(template.id)}
                                                className="btn-delete"
                                                title="Delete"
                                            >
                                                gghgh
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MailTemplateList;


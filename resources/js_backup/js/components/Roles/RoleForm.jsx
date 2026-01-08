import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Roles.css';
import { API_BASE_URL } from '../../config/api';

function RoleForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        permissions: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    
    // All available permissions
    const allPermissions = [
        'users',
        'roles',
        'permissions',
        'blogs',
        'blogs_publish',
        'pages',
        'general_settings',
        'domain_settings',
        'settings',
        'blog_categories',
        'user_responses_view',
        'user_responses_update',
        'user_responses_delete',
        'menu_links',
        'testimonials',
        'hero_banner',
        'projects',
        'services',
        'faqs',
        'product_categories',
        'products',
        'brand_images',
        'team_members',
        'table_booking_view',
        'table_booking_update',
        'table_booking_delete',
        'mail_templates'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchRole();
        }
    }, [id, isEditMode]);

    const fetchRole = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`/api/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const role = response.data.data || response.data;
            setFormData({
                name: role.name || '',
                permissions: role.permissions || []
            });
        } catch (error) {
            console.error('Error fetching role:', error);
            setError('Failed to load role');
        }
    };

    const handleNameChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handlePermissionToggle = (permission) => {
        const currentPermissions = formData.permissions;
        let newPermissions;

        if (currentPermissions.includes(permission)) {
            newPermissions = currentPermissions.filter(p => p !== permission);
        } else {
            newPermissions = [...currentPermissions, permission];
        }

        setFormData({ ...formData, permissions: newPermissions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Submitting role:', formData);

        try {
            const token = localStorage.getItem('auth_token');
            let response;

            if (isEditMode) {
                console.log('Updating role:', id);
                response = await axios.put(
                    `/api/roles/${id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                console.log('Creating new role');
                response = await axios.post(
                    `/api/roles`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            console.log('Response:', response);

            if (response.status === 200 || response.status === 201) {
                console.log('Success! Redirecting to list page...');
                window.location.href = '/staff/roles';
            } else {
                setError('Failed to save role');
            }
        } catch (error) {
            console.error('Error saving role:', error);
            console.error('Error response:', error.response?.data);

            if (error.response) {
                setError(error.response.data?.message || `Server error: ${error.response.status}`);
            } else if (error.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('Failed to save role');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        window.location.href = '/staff/roles';
    };

    // Split permissions into rows of 4
    const permissionRows = [];
    for (let i = 0; i < allPermissions.length; i += 4) {
        permissionRows.push(allPermissions.slice(i, i + 4));
    }

    return (
        <div className="role-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Role' : 'Add Role'}</h1>
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

            <form onSubmit={handleSubmit} className="role-form">
                <div className="form-group">
                    <label>Role Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        className="form-control"
                        placeholder="e.g., Editor, Manager"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Permissions</label>
                    <div className="permissions-grid">
                        {permissionRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="permission-row">
                                {row.map((permission) => (
                                    <div key={permission} className="permission-item">
                                        <label className="permission-label">
                                            <span className="permission-name">
                                                {permission.replace(/_/g, ' ')}
                                            </span>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(permission)}
                                                    onChange={() => handlePermissionToggle(permission)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ))}
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

export default RoleForm;


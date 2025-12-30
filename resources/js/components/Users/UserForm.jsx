import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Users.css';

function UserForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role_id: ''
    });

    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchRoles();
        if (isEditMode) {
            fetchUser();
        }
    }, [id, isEditMode]);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const rolesData = response.data.success ? response.data.data : response.data;
            setRoles(Array.isArray(rolesData) ? rolesData : []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = response.data.data || response.data;
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role_id: user.role_id || ''
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            setError('Failed to load user');
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

        console.log('Submitting user:', formData);

        try {
            const token = localStorage.getItem('auth_token');
            let response;

            if (isEditMode) {
                console.log('Updating user:', id);
                response = await axios.put(
                    `${API_BASE_URL}/users/${id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                console.log('Creating new user');
                response = await axios.post(
                    `${API_BASE_URL}/users`,
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
                window.location.href = '/staff/users';
            } else {
                setError('Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            console.error('Error response:', error.response?.data);

            if (error.response) {
                const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
                const errors = error.response.data?.errors;
                
                if (errors) {
                    const errorMessages = Object.values(errors).flat().join(', ');
                    setError(errorMessages);
                } else {
                    setError(errorMessage);
                }
            } else if (error.request) {
                setError('No response from server. Please check your connection.');
            } else {
                setError('Failed to save user');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        window.location.href = '/staff/users';
    };

    return (
        <div className="user-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit User' : 'Add User'}</h1>
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

            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                    <label>User Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., John Doe"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., john@example.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Role</label>
                    <select
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select a role</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
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

export default UserForm;


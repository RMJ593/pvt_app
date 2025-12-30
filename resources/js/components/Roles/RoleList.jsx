import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Roles.css';

function RoleList() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Fetched roles:', response.data);

            if (response.data.success) {
                setRoles(response.data.data || []);
            } else if (Array.isArray(response.data)) {
                setRoles(response.data);
            } else {
                setRoles([]);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setError('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API_BASE_URL}/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRoles(roles.filter(role => role.id !== id));
            alert('Role deleted successfully');
        } catch (error) {
            console.error('Error deleting role:', error);
            alert(error.response?.data?.message || 'Failed to delete role');
        }
    };

    if (loading) {
        return (
            <div className="roles-container">
                <div className="loading">Loading roles...</div>
            </div>
        );
    }

    return (
        <div className="roles-container">
            <div className="page-header">
                <h1>Roles</h1>
                <Link to="/staff/roles/create" className="btn-new">
                    + New Role
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
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">
                                    No roles found. Click "New Role" to create one.
                                </td>
                            </tr>
                        ) : (
                            roles.map((role, index) => (
                                <tr key={role.id}>
                                    <td>{index + 1}</td>
                                    <td>{role.name}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <Link
                                                to={`/staff/roles/${role.id}/edit`}
                                                className="btn-edit"
                                                title="Edit"
                                            >
                                                hggh
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                className="btn-delete"
                                                title="Delete"
                                            >
                                                hjhj
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

export default RoleList;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Users.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Fetched users:', response.data);

            const usersData = extractArray(response);
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const newStatus = currentStatus === 1 ? 0 : 1;

            console.log('Toggling status for user:', id, 'from', currentStatus, 'to', newStatus);

            let response;
            try {
                response = await axios.patch(
                    `/api/users/${id}/status`,
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
                response = await axios.put(
                    `/api/users/${id}`,
                    { status: newStatus },
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            console.log('Status update response:', response.data);

            setUsers(users.map(user =>
                user.id === id ? { ...user, status: newStatus } : user
            ));

            console.log('Status updated successfully');
        } catch (error) {
            console.error('Error toggling status:', error);
            console.error('Error response:', error.response?.data);
            alert('Failed to update status. Please check console for details.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsers(users.filter(user => user.id !== id));
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="users-container">
                <div className="loading">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="users-container">
            <div className="page-header">
                <h1>Users</h1>
                <Link to="/staff/users/create" className="btn-new">
                    + New User
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
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-data">
                                    No users found. Click "New User" to create one.
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{index + 1}</td>
                                    <td>{user.name}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            {/* Toggle Switch */}
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={user.status === 1}
                                                    onChange={() => handleToggleStatus(user.id, user.status)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>

                                            {/* Edit Button */}
                                            <Link
                                                to={`/staff/users/${user.id}/edit`}
                                                className="btn-edit"
                                                title="Edit"
                                            >
                                                Edit
                                            </Link>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="btn-delete"
                                                title="Delete"
                                            >
                                                Delete
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

export default UserList;



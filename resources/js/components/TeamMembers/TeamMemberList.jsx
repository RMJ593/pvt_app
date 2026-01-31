import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TeamMembers.css';

function TeamMemberList() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get('/team-members');
            if (response.data.success) {
                setMembers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            setMessage('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            const response = await axios.patch(`/team-members/${id}/toggle`, {
                is_active: !currentStatus
            });
            if (response.data.success) {
                setMessage('Team member status updated successfully');
                fetchMembers();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error toggling team member:', error);
            setMessage('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this team member?')) return;

        try {
            const response = await axios.delete(`/team-members/${id}`);
            if (response.data.success) {
                setMessage('Team member deleted successfully');
                fetchMembers();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting team member:', error);
            setMessage('Failed to delete team member');
        }
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.company_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="team-members-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="team-members-container">
            <div className="page-header-simple">
                <h1>Team Members</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/team-members/create" className="btn-new-green">
                        + New
                    </Link>
                </div>

                <div className="table-controls">
                    <div className="entries-control">
                        <label>Show</label>
                        <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>

                    <div className="search-control">
                        <label>Search:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder=""
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Company ID</th>
                                <th>Name</th>
                                <th>Designation</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-row">
                                        No team members found
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.slice(0, entriesPerPage).map((member, index) => (
                                    <tr key={member.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{member.company_id}</strong></td>
                                        <td>{member.name}</td>
                                        <td>{member.designation}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/team-members/${member.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    Edit
                                                </Link>
                                                <label className="toggle-switch" title="Toggle Active/Inactive">
                                                    <input
                                                        type="checkbox"
                                                        checked={member.is_active || false}
                                                        onChange={() => handleToggle(member.id, member.is_active)}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="action-btn delete-btn"
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

                <div className="table-footer">
                    <div className="showing-info">
                        Showing {filteredMembers.length > 0 ? '1' : '0'} to {Math.min(entriesPerPage, filteredMembers.length)} of {filteredMembers.length} entries
                    </div>
                    <div className="pagination">
                        <button className="page-btn" disabled>Previous</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeamMemberList;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserResponses.css';

function UserResponseList() {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [viewingResponse, setViewingResponse] = useState(null);

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const response = await axios.get('/user-responses');
            if (response.data.success) {
                setResponses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching responses:', error);
            setMessage('Failed to load responses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this response?')) return;

        try {
            const response = await axios.delete(`/user-responses/${id}`);
            if (response.data.success) {
                setMessage('Response deleted successfully');
                fetchResponses();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting response:', error);
            setMessage('Failed to delete response');
        }
    };

    const viewDetails = async (response) => {
        setViewingResponse(response);
        
        // Mark as read if status is 'new'
        if (response.status === 'new') {
            try {
                await axios.put(`/user-responses/${response.id}`, { status: 'read' });
                fetchResponses();
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            new: 'status-new',
            read: 'status-read',
            replied: 'status-replied'
        };
        return statusColors[status] || 'status-new';
    };

    const filteredResponses = responses.filter(response =>
        response.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="user-responses-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="user-responses-container">
            <div className="page-header-simple">
                <h1>User Responses</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
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
                                <th>Name </th>
                                <th>Type </th>
                                <th>Response Added</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResponses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-row">
                                        No user responses found
                                    </td>
                                </tr>
                            ) : (
                                filteredResponses.slice(0, entriesPerPage).map((response, index) => (
                                    <tr key={response.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{response.name}</strong></td>
                                        <td>Contact Us</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadge(response.status)}`}>
                                                {response.status === 'new' ? 'Not responded' :
                                                 response.status === 'read' ? 'Read' : 'Replied'}
                                            </span>
                                        </td>
                                        <td>{formatDate(response.created_at)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => viewDetails(response)}
                                                    className="action-btn view-btn"
                                                    title="View"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(response.id)}
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
                        Showing {filteredResponses.length > 0 ? '1' : '0'} to {Math.min(entriesPerPage, filteredResponses.length)} of {filteredResponses.length} entries
                    </div>
                    <div className="pagination">
                        <button className="page-btn" disabled>Previous</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* View Details Modal */}
            {viewingResponse && (
                <div className="modal-overlay" onClick={() => setViewingResponse(null)}>
                    <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Message Details</h3>
                            <button onClick={() => setViewingResponse(null)} className="modal-close">hhj</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <strong>Name:</strong>
                                <span>{viewingResponse.name}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Email:</strong>
                                <span>{viewingResponse.email}</span>
                            </div>
                            {viewingResponse.phone && (
                                <div className="detail-row">
                                    <strong>Phone:</strong>
                                    <span>{viewingResponse.phone}</span>
                                </div>
                            )}
                            {viewingResponse.subject && (
                                <div className="detail-row">
                                    <strong>Subject:</strong>
                                    <span>{viewingResponse.subject}</span>
                                </div>
                            )}
                            <div className="detail-row">
                                <strong>Message:</strong>
                                <p className="message-text">{viewingResponse.message}</p>
                            </div>
                            <div className="detail-row">
                                <strong>Received:</strong>
                                <span>{formatDate(viewingResponse.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserResponseList;



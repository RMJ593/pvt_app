import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TableBookings.css';

function TableBookingList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [viewingBooking, setViewingBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/table-bookings');
            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setMessage('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            const response = await axios.delete(`/table-bookings/${id}`);
            if (response.data.success) {
                setMessage('Booking deleted successfully');
                fetchBookings();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            setMessage('Failed to delete booking');
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const response = await axios.put(`/table-bookings/${id}`, { status: newStatus });
            if (response.data.success) {
                setMessage(`Booking ${newStatus} successfully`);
                fetchBookings();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage('Failed to update status');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
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

    const formatTime = (timeString) => {
        return timeString.substring(0, 5); // Remove seconds
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            cancelled: 'status-cancelled',
            completed: 'status-completed'
        };
        return statusColors[status] || 'status-pending';
    };

    const filteredBookings = bookings.filter(booking =>
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm)
    );

    if (loading) {
        return <div className="table-bookings-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="table-bookings-container">
            <div className="page-header-simple">
                <h1>Table Bookings</h1>
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
                                <th>Details </th>
                                <th>Booked For</th>
                                <th>Booked On</th>
                                <th>Last Response Added</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-row">
                                        No table bookings found
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.slice(0, entriesPerPage).map((booking, index) => (
                                    <tr key={booking.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="booking-details">
                                                <div className="detail-name">{booking.name}</div>
                                                <div className="detail-contact">{booking.phone}</div>
                                                <div className="detail-contact">{booking.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="booking-for">
                                                <div><strong>{booking.guests}</strong> persons</div>
                                                <div>{formatDate(booking.booking_date)}</div>
                                                <div>{formatTime(booking.booking_time)}</div>
                                            </div>
                                        </td>
                                        <td>{formatDateTime(booking.created_at)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadge(booking.status)}`}>
                                                {booking.status === 'pending' ? 'Not added yet' : booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => setViewingBooking(booking)}
                                                    className="action-btn view-btn"
                                                    title="View"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(booking.id)}
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
                        Showing {filteredBookings.length > 0 ? '1' : '0'} to {Math.min(entriesPerPage, filteredBookings.length)} of {filteredBookings.length} entries
                    </div>
                    <div className="pagination">
                        <button className="page-btn" disabled>Previous</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn" disabled>Next</button>
                    </div>
                </div>
            </div>

            {/* View/Edit Booking Modal */}
            {viewingBooking && (
                <div className="modal-overlay" onClick={() => setViewingBooking(null)}>
                    <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Booking Details</h3>
                            <button onClick={() => setViewingBooking(null)} className="modal-close">jmm</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <strong>Customer Name:</strong>
                                <span>{viewingBooking.name}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Email:</strong>
                                <span>{viewingBooking.email}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Phone:</strong>
                                <span>{viewingBooking.phone}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Number of Guests:</strong>
                                <span>{viewingBooking.guests} persons</span>
                            </div>
                            <div className="detail-row">
                                <strong>Booking Date:</strong>
                                <span>{formatDate(viewingBooking.booking_date)}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Booking Time:</strong>
                                <span>{formatTime(viewingBooking.booking_time)}</span>
                            </div>
                            {viewingBooking.special_requests && (
                                <div className="detail-row">
                                    <strong>Special Requests:</strong>
                                    <p className="message-text">{viewingBooking.special_requests}</p>
                                </div>
                            )}
                            <div className="detail-row">
                                <strong>Booked On:</strong>
                                <span>{formatDateTime(viewingBooking.created_at)}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Current Status:</strong>
                                <span className={`status-badge ${getStatusBadge(viewingBooking.status)}`}>
                                    {viewingBooking.status}
                                </span>
                            </div>
                            
                            <div className="status-actions">
                                <h4>Update Status:</h4>
                                <div className="status-buttons">
                                    <button 
                                        className="status-btn btn-confirmed"
                                        onClick={() => {
                                            updateStatus(viewingBooking.id, 'confirmed');
                                            setViewingBooking(null);
                                        }}
                                    >
                                         Confirm
                                    </button>
                                    <button 
                                        className="status-btn btn-completed"
                                        onClick={() => {
                                            updateStatus(viewingBooking.id, 'completed');
                                            setViewingBooking(null);
                                        }}
                                    >
                                         Complete
                                    </button>
                                    <button 
                                        className="status-btn btn-cancelled"
                                        onClick={() => {
                                            updateStatus(viewingBooking.id, 'cancelled');
                                            setViewingBooking(null);
                                        }}
                                    >
                                         Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TableBookingList;



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Testimonials.css';

function TestimonialList() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const response = await axios.get('/testimonials');
            if (response.data.success) {
                setTestimonials(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            setMessage('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

        try {
            const response = await axios.delete(`/testimonials/${id}`);
            if (response.data.success) {
                setMessage('Testimonial deleted successfully');
                fetchTestimonials();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            setMessage('Failed to delete testimonial');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const response = await axios.put(`/testimonials/${id}`, {
                is_active: !currentStatus
            });

            if (response.data.success) {
                fetchTestimonials();
            }
        } catch (error) {
            console.error('Error updating active status:', error);
        }
    };

    if (loading) {
        return <div className="testimonials-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="testimonials-container">
            <div className="page-header-simple">
                <h1>Testimonials</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/testimonials/create" className="btn-new-green">
                        + Add New
                    </Link>
                </div>

                <div className="table-wrapper">
                    <table className="data-table-simple">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="empty-row">
                                        No testimonials found
                                    </td>
                                </tr>
                            ) : (
                                testimonials.map((testimonial, index) => (
                                    <tr key={testimonial.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="name-with-image">
                                                {testimonial.customer_image ? (
                                                    <img
                                                        src={`/storage/${testimonial.customer_image}`}
                                                        alt={testimonial.customer_name}
                                                        className="table-image-small"
                                                    />
                                                ) : (
                                                    <div className="no-image-placeholder">No Image</div>
                                                )}
                                                <strong>{testimonial.customer_name}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/testimonials/${testimonial.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    hghgh
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(testimonial.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    vhhgh
                                                </button>
                                                <label className="toggle-switch-small" title="Toggle Active Status">
                                                    <input
                                                        type="checkbox"
                                                        checked={testimonial.is_active}
                                                        onChange={() => toggleActive(testimonial.id, testimonial.is_active)}
                                                    />
                                                    <span className="toggle-slider-small"></span>
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TestimonialList;



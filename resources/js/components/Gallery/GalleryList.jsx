import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Gallery.css';

function GalleryList() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await axios.get('/api/gallery');
            if (response.data.success) {
                setImages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            setMessage('Failed to load gallery images');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await axios.delete(`/api/gallery/${id}`);
            if (response.data.success) {
                setMessage('Image deleted successfully');
                fetchImages();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            setMessage('Failed to delete image');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const response = await axios.put(`/api/gallery/${id}`, {
                is_active: !currentStatus
            });

            if (response.data.success) {
                fetchImages();
            }
        } catch (error) {
            console.error('Error updating active status:', error);
        }
    };

    // Helper function to get correct image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // If it's already a full URL (Cloudinary), use it as-is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Otherwise, it's a local storage path
        return `/storage/${imagePath}`;
    };

    if (loading) {
        return <div className="gallery-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="gallery-container">
            <div className="page-header-simple">
                <h1>Gallery Images</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/gallery/create" className="btn-new-green">
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
                            {images.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="empty-row">
                                        No gallery images found
                                    </td>
                                </tr>
                            ) : (
                                images.map((image, index) => (
                                    <tr key={image.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="name-with-image">
                                                {image.image ? (
                                                    <img
                                                        src={getImageUrl(image.image)}
                                                        alt={image.title}
                                                        className="table-image-small"
                                                        onError={(e) => {
                                                            console.error('Image failed to load:', image.image);
                                                            e.target.src = '/placeholder.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="no-image-placeholder">No Image</div>
                                                )}
                                                <strong>{image.title}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/gallery/${image.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(image.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                                <label className="toggle-switch-small" title="Toggle Active Status">
                                                    <input
                                                        type="checkbox"
                                                        checked={image.is_active}
                                                        onChange={() => toggleActive(image.id, image.is_active)}
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

export default GalleryList;
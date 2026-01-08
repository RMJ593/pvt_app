import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HeroBanner.css';

function HeroBannerList() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            console.log('Fetching banners...');
            const response = await axios.get('/api/hero-banners');
            console.log('API Response:', response.data);
        
            if (response.data.success) {
                console.log('Banners fetched:', response.data.data);
                setBanners(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            console.error('Error details:', error.response?.data);
            setMessage('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/hero-banners/${id}`);
            if (response.data.success) {
                setMessage('Banner deleted successfully');
                fetchBanners();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            setMessage('Failed to delete banner');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const formData = new FormData();
            formData.append('is_active', !currentStatus ? '1' : '0');
            formData.append('_method', 'PUT');

            const response = await axios.post(
                `/api/hero-banners/${id}`,
                formData
            );

            if (response.data.success) {
                fetchBanners();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage('Failed to update status');
        }
    };

    const filteredBanners = banners.filter(banner =>
        banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="hero-banner-container">
                <div className="loading">Loading banners...</div>
            </div>
        );
    }

    return (
        <div className="hero-banner-container">
            <div className="page-header">
                <h1>Hero Banner</h1>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <Link to="/staff/hero-banners/create" className="btn-new">
                        + New
                    </Link>
                </div>

                {message && (
                    <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                        {message}
                    </div>
                )}

                <div className="table-controls">
                    <div className="entries-control">
                        <label>Show</label>
                        <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
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
                                <th>Heading †‘</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBanners.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="empty-row">
                                        No hero banners found
                                    </td>
                                </tr>
                            ) : (
                                filteredBanners.slice(0, entriesPerPage).map((banner, index) => (
                                    <tr key={banner.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="heading-cell">
                                                {banner.subtitle && (
                                                    <div className="banner-small-heading">
                                                        {banner.subtitle}
                                                    </div>
                                                )}
                                                <div className="banner-title">{banner.title}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/hero-banners/${banner.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    ghghgh
                                                </Link>
                                                <label className="toggle-switch-small">
                                                    <input
                                                        type="checkbox"
                                                        checked={banner.is_active}
                                                        onChange={() => toggleActive(banner.id, banner.is_active)}
                                                    />
                                                    <span className="toggle-slider-small"></span>
                                                </label>
                                                <button
                                                    onClick={() => handleDelete(banner.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    ghghgh
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
                        Showing {filteredBanners.length > 0 ? '1' : '0'} to {Math.min(entriesPerPage, filteredBanners.length)} of {filteredBanners.length} entries
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

export default HeroBannerList;


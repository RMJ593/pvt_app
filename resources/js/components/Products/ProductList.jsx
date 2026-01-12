import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // API Base URL helper
    const getApiBaseUrl = () => {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://127.0.0.1:8000/api'
            : 'https://tphrc-int-project-cjld.onrender.com/api';
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const apiBaseUrl = getApiBaseUrl();
            const response = await axios.get(`${apiBaseUrl}/menu-items`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setMessage('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const apiBaseUrl = getApiBaseUrl();
            const response = await axios.delete(`${apiBaseUrl}/menu-items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMessage('Product deleted successfully');
                fetchProducts();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            setMessage('Failed to delete product');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('auth_token');
            const apiBaseUrl = getApiBaseUrl();
            
            // Use FormData for consistency with the controller
            const formData = new FormData();
            formData.append('is_active', !currentStatus ? '1' : '0');
            formData.append('_method', 'PUT');
            
            const response = await axios.post(`${apiBaseUrl}/menu-items/${id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Update state immediately for better UX
                setProducts(prevProducts => 
                    prevProducts.map(product => 
                        product.id === id 
                            ? { ...product, is_active: !currentStatus }
                            : product
                    )
                );
                setMessage('Product status updated successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating active status:', error);
            console.error('Error details:', error.response?.data);
            setMessage('Failed to update product status');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // If it's already a full URL (Cloudinary), return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Otherwise, it's a local storage path
        return `/storage/${imagePath}`;
    };

    if (loading) {
        return <div className="product-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="product-container">
            <div className="page-header-simple">
                <h1>Products</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <div className="table-card">
                <div className="table-header-actions">
                    <Link to="/staff/products/create" className="btn-new-green">
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
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="empty-row">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                products.map((product, index) => (
                                    <tr key={product.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="name-with-image">
                                                {product.image ? (
                                                    <img
                                                        src={getImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="table-image-square"
                                                        onError={(e) => {
                                                            if (e.target.src !== '/placeholder-image.jpg') {
                                                                e.target.src = '/placeholder-image.jpg';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="no-image-placeholder-square">No Image</div>
                                                )}
                                                <strong>{product.name}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/staff/products/${product.id}/edit`}
                                                    className="action-btn edit-btn"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="action-btn delete-btn"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                                <label className="toggle-switch-small" title="Toggle Active Status">
                                                    <input
                                                        type="checkbox"
                                                        checked={product.is_active}
                                                        onChange={() => toggleActive(product.id, product.is_active)}
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

export default ProductList;
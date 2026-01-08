import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MenuSection.css';

function MenuSection() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            // Try fetching from /api/categories
            const response = await axios.get('/api/categories');
            
            console.log('=== MENU SECTION DEBUG ===');
            console.log('Full Response:', response);
            console.log('Response Data:', response.data);
            
            let allCategories = [];
            
            // Handle different response structures
            if (response.data.success && response.data.data) {
                allCategories = response.data.data;
            } else if (Array.isArray(response.data)) {
                allCategories = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                allCategories = response.data.data;
            }
            
            console.log('All Categories:', allCategories);
            
            // Filter categories that have is_royalty set to true AND is_active = true
            const royaltyCategories = allCategories.filter(cat => {
                console.log(`Category ${cat.name}:`, {
                    is_royalty: cat.is_royalty,
                    is_active: cat.is_active
                });
                return cat.is_royalty === 1 || cat.is_royalty === true;
            });
            
            console.log('Filtered Royalty Categories:', royaltyCategories);
            
            setCategories(royaltyCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            console.error('Error details:', error.response);
            setError('Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMenu = (categoryId, categoryName) => {
        navigate(`/menu/${categoryId}`, { state: { categoryName } });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-image.jpg';
        
        // If it's already a full URL (Cloudinary), return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        // Otherwise, it's a local storage path
        return `/storage/${imagePath}`;
    };

    if (loading) {
        return (
            <section id="menu" className="menu-section">
                <div className="menu-container">
                    <div className="loading-spinner">Loading menu...</div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="menu" className="menu-section">
                <div className="menu-container">
                    <div className="error-message" style={{color: 'red', padding: '20px'}}>
                        {error}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="menu" className="menu-section">
            <div className="menu-container">
                <p className="menu-subtitle">FLAVORS FOR ROYALTY</p>
                
                <div className="menu-divider">
                    <span>?</span>
                    <span>?</span>
                    <span>?</span>
                </div>

                <h2 className="menu-title">We Offer Top Notch</h2>

                {categories.length === 0 ? (
                    <div className="no-categories" style={{padding: '40px', textAlign: 'center'}}>
                        <p style={{fontSize: '18px', marginBottom: '10px'}}>No menu categories available.</p>
                        <p style={{fontSize: '14px', color: '#666'}}>
                            Please ensure you've added categories with the "Royalty" toggle enabled.
                        </p>
                        <p style={{fontSize: '12px', color: '#999', marginTop: '20px'}}>
                            Check the browser console (F12) for debugging information.
                        </p>
                    </div>
                ) : (
                    <div className="menu-categories-grid">
                        {categories.map((category) => (
                            <div key={category.id} className="menu-category-card">
                                <div className="category-ornament top-ornament"></div>

                                <div className="category-image-wrapper">
                                    <img 
                                        src={getImageUrl(category.image)} 
                                        alt={category.name}
                                        className="category-image"
                                        onError={(e) => {
                                            console.error('Image failed to load:', category.image);
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>

                                <div className="category-ornament bottom-ornament"></div>

                                {category.small_heading && (
                                    <p className="category-subheading">{category.small_heading}</p>
                                )}

                                <h3 className="category-name">{category.name}</h3>
                                
                                {category.location && (
                                    <span className="category-location">{category.location}</span>
                                )}

                                <button 
                                    className="view-menu-btn"
                                    onClick={() => handleViewMenu(category.id, category.name)}
                                >
                                    VIEW MENU
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default MenuSection;

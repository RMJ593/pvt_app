import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SpecialDishesSection.css';

function SpecialDishesSection({ id }) {
    const [specialDishes, setSpecialDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    // API Base URL helper
    const getApiBaseUrl = () => {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://127.0.0.1:8000/api'
            : 'https://tphrc-int-project.onrender.com/api';
    };

    useEffect(() => {
        fetchSpecialDishes();
    }, []);

    const fetchSpecialDishes = async () => {
        try {
            const apiBaseUrl = getApiBaseUrl();
            const response = await axios.get(`${apiBaseUrl}/menu-items`);
            
            let items = [];
            if (response.data.success && response.data.data) {
                items = response.data.data;
            } else if (Array.isArray(response.data)) {
                items = response.data;
            }
            
            // Filter for special dishes (is_special_dish toggle)
            const specials = items.filter(item => 
                item.is_special_dish === true || item.is_special_dish === 1
            );
            
            setSpecialDishes(specials);
        } catch (error) {
            console.error('Error fetching special dishes:', error);
            setSpecialDishes([]);
        } finally {
            setLoading(false);
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
        return (
            <section id={id} className="special-dishes-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Loading Special Dishes...</h2>
                    </div>
                </div>
            </section>
        );
    }

    if (specialDishes.length === 0) {
        return null;
    }

    return (
        <section id={id} className="special-dishes-section">
            <div className="container">
                <div className="section-header">
                    <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <p className="section-subtitle">HOUSE SPECIALTIES</p>
                    <h2 className="section-title">Our Special Dishes</h2>
                    <div className="divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    <p className="section-description">
                        Discover our signature creations, crafted with passion and expertise
                    </p>
                </div>

                <div className="special-dishes-grid">
                    {specialDishes.map((dish) => (
                        <div key={dish.id} className="special-dish-card">
                            <div className="dish-image-wrapper">
                                {getImageUrl(dish.image) ? (
                                    <img 
                                        src={getImageUrl(dish.image)} 
                                        alt={dish.name}
                                        className="dish-image"
                                        onError={(e) => {
                                            if (e.target.src !== '/placeholder-image.jpg') {
                                                e.target.src = '/placeholder-image.jpg';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="dish-image-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                                            <line x1="6" y1="17" x2="18" y2="17" />
                                        </svg>
                                    </div>
                                )}
                                <div className="special-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                    </svg>
                                    <span>Special</span>
                                </div>
                            </div>
                            
                            <div className="dish-content">
                                <h3 className="dish-name">{dish.name}</h3>
                                
                                {dish.description && (
                                    <p className="dish-description">{dish.description}</p>
                                )}

                                <div className="dish-footer">
                                    <span className="dish-price">
                                        ₹{parseFloat(dish.price).toFixed(2)}
                                    </span>
                                    
                                    {dish.category && (
                                        <span className="dish-category">
                                            {typeof dish.category === 'object' ? dish.category.name : dish.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default SpecialDishesSection;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MenuSection.css';
import { API_BASE_URL, getStorageUrl } from '../../config/api';

function MenuSection() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            const allCategories = response.data.data || response.data;
            
            // Filter categories that have is_royalty set to true
            const royaltyCategories = allCategories.filter(cat => cat.is_royalty);
            
            setCategories(royaltyCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewMenu = (categoryId, categoryName) => {
        // Navigate to individual category page showing only that category's products
        navigate(`/menu/${categoryId}`, { state: { categoryName } });
    };

    const getImageUrl = (imagePath) => {
        return getStorageUrl(imagePath);
    };

    if (loading) {
        return (
            <section id="menu" className="menu-section">
                <div className="menu-container">
                    <p>Loading menu...</p>
                </div>
            </section>
        );
    }

    return (
        <section id="menu" className="menu-section">
            <div className="menu-container">
                <p className="menu-subtitle">FLAVORS FOR ROYALTY</p>
                
                <div className="menu-divider">
                    <span>◆</span>
                    <span>◆</span>
                    <span>◆</span>
                </div>

                <h2 className="menu-title">We Offer Top Notch</h2>

                <div className="menu-categories-grid">
                    {categories.map((category) => (
                        <div key={category.id} className="menu-category-card">
                            <div className="category-ornament top-ornament"></div>

                            {category.image && (
                                <div className="category-image-wrapper">
                                    <img 
                                        src={getImageUrl(category.image)} 
                                        alt={category.name}
                                        className="category-image"
                                    />
                                </div>
                            )}

                            <div className="category-ornament bottom-ornament"></div>

                            <h3 className="category-name">{category.name}</h3>
                            
                            <button 
                                className="view-menu-btn"
                                onClick={() => handleViewMenu(category.id, category.name)}
                            >
                                VIEW MENU
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default MenuSection;
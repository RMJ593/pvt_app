import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChefsSelectionSection.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api'; // ✅ Add getStorageUrl

function ChefsSelectionSection({ id }) {
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [chefSelectionDishes, setChefSelectionDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchChefSelectionDishes();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            const cats = extractArray(response);
            const activeCats = cats.filter(cat => cat.is_active);
            setCategories(activeCats);
            if (activeCats.length > 0) {
                setActiveCategory(activeCats[0].id);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchChefSelectionDishes = async () => {
        try {
            const response = await axios.get('/api/menu-items');
            const items = extractArray(response);
            
            const chefDishes = items.filter(item => 
                item.is_special_selection === true || 
                item.is_special_selection === 1
            );
            
            setChefSelectionDishes(chefDishes);
        } catch (error) {
            console.error('Error fetching chef selection dishes:', error);
            setChefSelectionDishes([]);
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED: Use getStorageUrl helper
    const getImageUrl = (imagePath) => {
        return getStorageUrl(imagePath);
    };

    const filteredDishes = activeCategory 
        ? chefSelectionDishes.filter(dish => {
            const categoryId = typeof dish.category === 'object' 
                ? dish.category.id 
                : dish.category_id;
            return categoryId === activeCategory;
        })
        : chefSelectionDishes;

    if (loading) {
        return (
            <section id={id} className="chefs-selection-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Loading...</h2>
                    </div>
                </div>
            </section>
        );
    }

    if (chefSelectionDishes.length === 0) {
        return null;
    }

    return (
        <section id={id} className="chefs-selection-section">
            <div className="container">
                <div className="section-header">
                    <p className="section-subtitle">SPECIAL SELECTION</p>
                    <div className="divider-top">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    <h2 className="section-title">Delicious Menu</h2>
                </div>

                <div className="category-tabs">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                <div className="chefs-dishes-grid">
                    {filteredDishes.map((dish) => (
                        <div key={dish.id} className="chef-dish-card">
                            <div className="dish-image-wrapper">
                                {getImageUrl(dish.image) ? (
                                    <img 
                                        src={getImageUrl(dish.image)} 
                                        alt={dish.name}
                                        className="dish-image"
                                    />
                                ) : (
                                    <div className="dish-image-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                                            <line x1="6" y1="17" x2="18" y2="17" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            
                            <div className="dish-content">
                                <div className="dish-header">
                                    <h3 className="dish-name">{dish.name}</h3>
                                    <span className="dish-price">£{parseFloat(dish.price).toFixed(2)}</span>
                                </div>
                                
                                {dish.description && (
                                    <p className="dish-description">{dish.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDishes.length === 0 && (
                    <div className="no-dishes">
                        <p>No dishes available in this category</p>
                    </div>
                )}

                <div className="view-all-btn-wrapper">
                    <button className="view-all-btn">VIEW ALL MENU</button>
                </div>
            </div>
        </section>
    );
}

export default ChefsSelectionSection;
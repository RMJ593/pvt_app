import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SpecialOffersSection.css';

function SpecialOffersSection({ id }) {
    const [offerDishes, setOfferDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchOfferDishes();
    }, []);

    const fetchOfferDishes = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-items`);
            const items = response.data.data || response.data || [];
            
            // Filter for items with special offers
            const offers = items.filter(item => 
                item.has_offer === true || 
                item.has_offer === 1 ||
                item.is_offer === true ||
                item.is_offer === 1
            );
            
            setOfferDishes(offers);
        } catch (error) {
            console.error('Error fetching offer dishes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://127.0.0.1:8000/storage/${imagePath}`;
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    // Touch handlers for mobile
    const handleTouchStart = (e) => {
        setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchMove = (e) => {
        const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const scrollLeftBtn = () => {
        scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    };

    const scrollRightBtn = () => {
        scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section id={id} className="special-offers-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Loading...</h2>
                    </div>
                </div>
            </section>
        );
    }

    if (offerDishes.length === 0) {
        return null;
    }

    return (
        <section id={id} className="special-offers-section">
            <div className="container-full">
                <div className="section-header">
                    <p className="section-subtitle">LIMITED TIME DEALS</p>
                    <div className="divider-top">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    <h2 className="section-title">Special Offers</h2>
                    <p className="section-description">
                        Grab these amazing deals before they're gone!
                    </p>
                </div>

                <div className="scroll-wrapper">
                    <button className="scroll-btn scroll-btn-left" onClick={scrollLeftBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div 
                        className="offers-scroll-container"
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                    >
                        {offerDishes.map((dish) => (
                            <div key={dish.id} className="offer-card">
                                <div className="offer-image-wrapper">
                                    {getImageUrl(dish.image) ? (
                                        <img 
                                            src={getImageUrl(dish.image)} 
                                            alt={dish.name}
                                            className="offer-image"
                                            draggable="false"
                                        />
                                    ) : (
                                        <div className="offer-image-placeholder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                                                <line x1="6" y1="17" x2="18" y2="17" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    {(dish.offer_percentage || dish.discount_percentage) && (
                                        <div className="offer-badge">
                                            {dish.offer_percentage || dish.discount_percentage}% OFF
                                        </div>
                                    )}
                                </div>
                                
                                <div className="offer-content">
                                    <h3 className="offer-name">{dish.name}</h3>
                                    
                                    {dish.description && (
                                        <p className="offer-description">{dish.description}</p>
                                    )}

                                    <div className="offer-pricing">
                                        {dish.original_price && (
                                            <span className="original-price">£{parseFloat(dish.original_price).toFixed(2)}</span>
                                        )}
                                        <span className="offer-price">£{parseFloat(dish.price).toFixed(2)}</span>
                                    </div>

                                    {dish.category && (
                                        <span className="offer-category">
                                            {typeof dish.category === 'object' ? dish.category.name : dish.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="scroll-btn scroll-btn-right" onClick={scrollRightBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default SpecialOffersSection;
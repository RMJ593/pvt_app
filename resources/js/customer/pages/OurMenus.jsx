import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import './OurMenus.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function OurMenus() {
    const navigate = useNavigate();
    
    const [specialOffers, setSpecialOffers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categorizedProducts, setCategorizedProducts] = useState({});
    const [defaultImage, setDefaultImage] = useState(null);
    const [mainColor, setMainColor] = useState('#d4af37');
    const [loading, setLoading] = useState(true);

   
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchProducts(),
                fetchCategories(),
                fetchSettings(),
                fetchDomainSettings()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`/menu-items`);
            const allProducts = extractArray(response);
            
            // Filter special offers
            const offers = allProducts.filter(product => product.is_special_offer);
            setSpecialOffers(offers);
            
            // Group products by category
            const grouped = {};
            allProducts.forEach(product => {
                const catId = product.category_id;
                if (!grouped[catId]) {
                    grouped[catId] = {
                        regular: [],
                        chef: []
                    };
                }
                
                if (product.is_chef_selection) {
                    grouped[catId].chef.push(product);
                } else {
                    grouped[catId].regular.push(product);
                }
            });
            
            setCategorizedProducts(grouped);
        } catch (error) {
            console.error('Error fetching products:', error);
            setSpecialOffers([]);
            setCategorizedProducts({});
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`/categories`);
            const allCategories = extractArray(response);
            setCategories(allCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`/settings`);
            const settings = response.data.data || response.data;
            if (settings.default_image) {
                setDefaultImage(settings.default_image);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchDomainSettings = async () => {
        try {
            let response;
            try {
                response = await axios.get(`/domain-settings`);
            } catch (err) {
                const token = localStorage.getItem('auth_token');
                response = await axios.get(`/domain-settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            const domainSettings = response.data.data || response.data;
            if (domainSettings.main_color) {
                setMainColor(domainSettings.main_color);
            }
        } catch (error) {
            console.error('Error fetching domain settings:', error);
        }
    };

    const getImageUrl = (imagePath) => {
        return getStorageUrl(imagePath);
    };

    if (loading) {
        return (
            <div className="our-menus-loading">
                <p>Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="our-menus-page">
            {/* Hero Section */}
            <section 
                className="menus-hero"
                style={{
                    backgroundImage: defaultImage 
                        ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${getImageUrl(defaultImage)})`
                        : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                }}
            >
                <div className="hero-content">
                    <p 
                        className="menus-subtitle"
                        style={{ color: mainColor }}
                    >
                        EXPLORE OUR
                    </p>
                    
                    <div 
                        className="menus-divider"
                        style={{ color: mainColor }}
                    >
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    
                    <h1 className="menus-main-title">Complete Menu</h1>
                </div>
            </section>

            {/* Special Offers Section */}
            {specialOffers.length > 0 && (
                <section className="special-offers-section">
                    <div className="section-header">
                        <p 
                            className="section-subtitle"
                            style={{ color: mainColor }}
                        >
                            LIMITED TIME
                        </p>
                        <h2 className="section-title">Special Offers</h2>
                        <div 
                            className="section-divider"
                            style={{ color: mainColor }}
                        >
                            <span>◆</span>
                        </div>
                    </div>
                    
                    <div className="offers-container">
                        <div className="offers-grid">
                            {specialOffers.map((product) => (
                                <div 
                                    key={product.id} 
                                    className="offer-card"
                                    style={{ borderColor: `${mainColor}33` }}
                                >
                                    <div className="offer-badge" style={{ backgroundColor: mainColor }}>
                                        SPECIAL
                                    </div>
                                    
                                    <div className="offer-image-wrapper">
                                        {product.image && (
                                            <img 
                                                src={getImageUrl(product.image)} 
                                                alt={product.name}
                                                className="offer-image"
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="offer-info">
                                        <h3 className="offer-name">{product.name}</h3>
                                        
                                        {product.description && (
                                            <p className="offer-description">{product.description}</p>
                                        )}
                                        
                                        <div 
                                            className="offer-footer"
                                            style={{ borderColor: `${mainColor}33` }}
                                        >
                                            <span 
                                                className="offer-price"
                                                style={{ color: mainColor }}
                                            >
                                                £{parseFloat(product.price).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories with Products */}
            {categories.map((category) => {
                const categoryProducts = categorizedProducts[category.id];
                
                if (!categoryProducts || (categoryProducts.regular.length === 0 && categoryProducts.chef.length === 0)) {
                    return null;
                }
                
                return (
                    <section key={category.id} className="category-section">
                        {/* Category Header */}
                        <div 
                            className="category-header"
                            style={{
                                backgroundImage: defaultImage 
                                    ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${getImageUrl(defaultImage)})`
                                    : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                            }}
                        >
                            <div className="category-header-content">
                                <p 
                                    className="category-small-heading"
                                    style={{ color: mainColor }}
                                >
                                    {category.small_heading || 'OUR PRODUCTS'}
                                </p>
                                
                                <div 
                                    className="category-header-divider"
                                    style={{ color: mainColor }}
                                >
                                    <span>◆</span>
                                    <span>◆</span>
                                    <span>◆</span>
                                </div>
                                
                                <h2 className="category-header-title">{category.name}</h2>
                            </div>
                        </div>

                        {/* Regular Products */}
                        {categoryProducts.regular.length > 0 && (
                            <div className="category-products">
                                <div className="products-grid">
                                    {categoryProducts.regular.map((product) => (
                                        <div 
                                            key={product.id} 
                                            className="product-card"
                                            style={{ borderColor: `${mainColor}1A` }}
                                        >
                                            <div className="product-image-wrapper">
                                                {product.image && (
                                                    <img 
                                                        src={getImageUrl(product.image)} 
                                                        alt={product.name}
                                                        className="product-image"
                                                    />
                                                )}
                                            </div>
                                            
                                            <div className="product-info">
                                                <h3 className="product-name">{product.name}</h3>
                                                
                                                {product.description && (
                                                    <p className="product-description">{product.description}</p>
                                                )}
                                                
                                                <div 
                                                    className="product-footer"
                                                    style={{ borderColor: `${mainColor}33` }}
                                                >
                                                    <span 
                                                        className="product-price"
                                                        style={{ color: mainColor }}
                                                    >
                                                        £{parseFloat(product.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chef Selection */}
                        {categoryProducts.chef.length > 0 && (
                            <div className="chef-selection-section">
                                <div className="chef-selection-container">
                                    {categoryProducts.chef.map((product) => (
                                        <div 
                                            key={product.id} 
                                            className="chef-selection-item"
                                            style={{ 
                                                background: `linear-gradient(135deg, ${mainColor}0D 0%, ${mainColor}1A 100%)`,
                                                borderColor: `${mainColor}4D`
                                            }}
                                        >
                                            <div className="chef-selection-image-wrapper">
                                                {product.image && (
                                                    <img 
                                                        src={getImageUrl(product.image)} 
                                                        alt={product.name}
                                                        className="chef-selection-image"
                                                    />
                                                )}
                                            </div>
                                            
                                            <div className="chef-selection-content">
                                                <div 
                                                    className="chef-badge"
                                                    style={{ 
                                                        background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}CC 100%)`
                                                    }}
                                                >
                                                    <span>★</span>
                                                    <p>CHEF SELECTION</p>
                                                </div>
                                                
                                                <h2 className="chef-selection-name">{product.name}</h2>
                                                
                                                {product.description && (
                                                    <p className="chef-selection-description">{product.description}</p>
                                                )}
                                                
                                                <div className="chef-selection-price">
                                                    <span style={{ color: mainColor }}>
                                                        £{parseFloat(product.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                );
            })}
            <Footer />
        </div>
    );
}

export default OurMenus;

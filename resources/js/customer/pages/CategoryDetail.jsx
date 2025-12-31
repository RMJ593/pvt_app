import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CategoryDetail.css';

function CategoryDetail() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [chefSelections, setChefSelections] = useState([]);
    const [defaultImage, setDefaultImage] = useState(null);
    const [mainColor, setMainColor] = useState('#d4af37');
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchAllData();
    }, [categoryId]);

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchCategoryData(),
                fetchProducts(),
                fetchSettings(),
                fetchDomainSettings()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}`);
            setCategory(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-items`);
            const allProducts = response.data.data || response.data;
            
            const categoryProducts = allProducts.filter(
                product => product.category_id === parseInt(categoryId)
            );
            
            const chefItems = categoryProducts.filter(product => product.is_chef_selection);
            const regularItems = categoryProducts.filter(product => !product.is_chef_selection);
            
            setProducts(regularItems);
            setChefSelections(chefItems);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/settings`);
            const settings = response.data.data || response.data;
            console.log('Settings response:', settings);
            console.log('Default image:', settings.default_image);
            if (settings.default_image) {
                setDefaultImage(settings.default_image);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchDomainSettings = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/domain-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const domainSettings = response.data.data || response.data;
            if (domainSettings.main_color) {
                setMainColor(domainSettings.main_color);
            }
        } catch (error) {
            console.error('Error fetching domain settings:', error);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://127.0.0.1:8000/storage/${imagePath}`;
    };

    if (loading || !category) {
        return (
            <div className="category-detail-loading">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="category-detail-page">
            {/* Hero Section with Background Image */}
            <section 
                className="category-hero"
                style={{
                    backgroundImage: defaultImage 
                        ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${getImageUrl(defaultImage)})`
                        : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                }}
            >
                <button 
                    className="back-button" 
                    onClick={() => navigate(-1)}
                    style={{ borderColor: mainColor }}
                >
                    <span>←</span> Back
                </button>
                
                <div className="hero-content">
                    <p 
                        className="category-subtitle"
                        style={{ color: mainColor }}
                    >
                        {category.small_heading || 'OUR PRODUCTS'}
                    </p>
                    
                    <div 
                        className="category-divider"
                        style={{ color: mainColor }}
                    >
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    
                    <h1 className="category-main-title">{category.name}</h1>
                </div>
            </section>

            {/* Regular Products Grid */}
            {products.length > 0 && (
                <section className="products-section">
                    <div className="products-container">
                        <div className="products-grid">
                            {products.map((product) => (
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
                </section>
            )}

            {/* Chef Selection Section */}
            {chefSelections.length > 0 && (
                <section className="chef-selection-section">
                    <div className="chef-selection-container">
                        {chefSelections.map((product) => (
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
                </section>
            )}

            {/* Empty State */}
            {products.length === 0 && chefSelections.length === 0 && (
                <section className="empty-state">
                    <div className="empty-content">
                        <p>No products available in this category yet.</p>
                    </div>
                </section>
            )}
        </div>
    );
}

export default CategoryDetail;
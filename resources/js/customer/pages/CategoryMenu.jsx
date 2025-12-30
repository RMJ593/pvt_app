import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import './CategoryMenu.css';

function CategoryMenu() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const categoryName = location.state?.categoryName || 'Menu';

    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [settings, setSettings] = useState(null);
    const [menuBackground, setMenuBackground] = useState(null);
    const [chefSelection, setChefSelection] = useState([]);
    const [displayedCount, setDisplayedCount] = useState(4);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchCategoryAndProducts();
    }, [categoryId]);

    const fetchCategoryAndProducts = async () => {
        try {
            await Promise.all([
                fetchSettings(),
                fetchMenuBackground(),
                fetchCategory(),
                fetchProducts()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/settings`);
            const settingsData = response.data.data || response.data;
            setSettings(settingsData);
            
            if (settingsData.main_color) {
                document.documentElement.style.setProperty('--main-color', settingsData.main_color);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchMenuBackground = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gallery-images`);
            const images = response.data.data || response.data;
            const imagesArray = Array.isArray(images) ? images : [];
            
            const bgImage = imagesArray.find(img => 
                img.name?.toLowerCase().includes('menu background') && img.is_active
            );
            if (bgImage) {
                setMenuBackground(bgImage);
            }
        } catch (error) {
            console.error('Error fetching menu background:', error);
        }
    };

    const fetchCategory = async () => {
        try {
            const categoryResponse = await axios.get(`${API_BASE_URL}/categories/${categoryId}`);
            setCategory(categoryResponse.data.data);
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const productsResponse = await axios.get(`${API_BASE_URL}/menu-items`);
            const allProducts = productsResponse.data.data || productsResponse.data;
            
            // Filter products by category
            const categoryProducts = allProducts.filter(
                product => product.category_id === parseInt(categoryId)
            );

            // Separate chef selection and regular products
            const chefSelectionProducts = categoryProducts.filter(p => p.is_chef_selection);
            const regularProducts = categoryProducts.filter(p => !p.is_chef_selection);
            
            setProducts(regularProducts);
            setChefSelection(chefSelectionProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://127.0.0.1:8000/storage/${imagePath}`;
    };

    const getBackgroundStyle = () => {
        if (menuBackground?.image) {
            return {
                backgroundImage: `url(${getImageUrl(menuBackground.image)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            };
        }
        return {};
    };

    const handleViewMore = () => {
        setDisplayedCount(prev => prev + 4);
    };

    const displayedProducts = products.slice(0, displayedCount);
    const hasMore = displayedCount < products.length;

    if (loading) {
        return (
            <div className="category-menu-page">
                <div className="loading">Loading menu...</div>
            </div>
        );
    }

    return (
        <div className="category-menu-page">
            <TopBar settings={settings} />

            {/* Hero Section */}
            <section className="category-menu-hero" style={getBackgroundStyle()}>
                <div className="category-menu-overlay"></div>
                <div className="category-menu-content">
                    <p className="category-menu-subtitle">{category?.small_heading || 'OUR PRODUCTS'}</p>
                    
                    <div className="category-menu-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="category-menu-title">{category?.name || categoryName}</h1>

                    <button className="back-home-btn" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
            </section>

            {/* Products Section */}
            <div className="products-container">
                {displayedProducts.length === 0 && chefSelection.length === 0 ? (
                    <div className="no-products">
                        <p>No items available in this category yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Regular Products */}
                        {displayedProducts.length > 0 && (
                            <div className="category-menu-section">
                                <p className="section-subtitle">{category?.small_heading || category?.name}</p>
                                <div className="section-divider">
                                    <span>◆</span>
                                    <span>◆</span>
                                    <span>◆</span>
                                </div>
                                <h2 className="section-title">{category?.name}</h2>

                                <div className="products-grid">
                                    {displayedProducts.map((product) => (
                                        <div key={product.id} className="product-card">
                                            {product.image && (
                                                <div className="product-image-wrapper">
                                                    <img 
                                                        src={getImageUrl(product.image)} 
                                                        alt={product.name}
                                                        className="product-image"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div className="product-details">
                                                <div className="product-header">
                                                    <h3 className="product-name">{product.name}</h3>
                                                    <span className="product-price">£{parseFloat(product.price).toFixed(2)}</span>
                                                </div>
                                                
                                                {product.description && (
                                                    <p className="product-description">{product.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {hasMore && (
                                    <button className="view-more-btn" onClick={handleViewMore}>
                                        VIEW MORE
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Chef's Selection */}
                        {chefSelection.length > 0 && (
                            <div className="chef-selection-section">
                                <h3 className="chef-selection-heading">Chef's Selection</h3>
                                
                                {chefSelection.map((product) => (
                                    <div key={product.id} className="chef-selection-card">
                                        <div className="chef-selection-image">
                                            {product.image && (
                                                <img src={getImageUrl(product.image)} alt={product.name} />
                                            )}
                                        </div>
                                        <div className="chef-selection-content">
                                            <div className="chef-badge">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                                </svg>
                                            </div>
                                            <p className="chef-label">CHEF SELECTION</p>
                                            <h3 className="chef-name">{product.name}</h3>
                                            {product.description && (
                                                <p className="chef-description">{product.description}</p>
                                            )}
                                            <p className="chef-price">£{parseFloat(product.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default CategoryMenu;
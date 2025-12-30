import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import './CategoryDetail.css';

function CategoryDetail() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [category, setCategory] = useState(location.state?.category || null);
    const [settings, setSettings] = useState(null);
    const [menuBackground, setMenuBackground] = useState(null);
    const [products, setProducts] = useState([]);
    const [chefSelection, setChefSelection] = useState([]);
    const [displayedCount, setDisplayedCount] = useState(4);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchData();
    }, [categoryId]);

    const fetchData = async () => {
        try {
            await Promise.all([
                fetchSettings(),
                fetchMenuBackground(),
                !category && fetchCategory(),
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
            
            // Ensure images is an array
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
            const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}`);
            setCategory(response.data.data);
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-items`);
            const allProducts = response.data.data || response.data;
            
            const categoryProducts = allProducts.filter(p => p.category_id === parseInt(categoryId));
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
        return <div className="loading">Loading...</div>;
    }

    if (!category) {
        return <div className="loading">Category not found</div>;
    }

    return (
        <div className="category-detail-page">
            <TopBar settings={settings} />

            {/* Hero Section */}
            <section className="category-hero" style={getBackgroundStyle()}>
                <div className="category-hero-overlay"></div>
                <div className="category-hero-content">
                    <p className="category-hero-subtitle">{category.small_heading || 'OUR PRODUCTS'}</p>
                    <div className="category-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    <h1 className="category-hero-title">{category.name}</h1>
                </div>
            </section>

            {/* Products Section */}
            <section className="category-products-section">
                <div className="category-section-container">
                    <p className="products-subtitle">{category.small_heading || category.name}</p>
                    <div className="products-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    <h2 className="products-title">{category.name}</h2>

                    {displayedProducts.length > 0 ? (
                        <>
                            <div className="products-grid">
                                {displayedProducts.map((product) => (
                                    <div key={product.id} className="product-card">
                                        {product.image && (
                                            <div className="product-image">
                                                <img src={getImageUrl(product.image)} alt={product.name} />
                                            </div>
                                        )}
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            {product.description && (
                                                <p className="product-description">{product.description}</p>
                                            )}
                                            <p className="product-price">£{parseFloat(product.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {hasMore && (
                                <button className="view-more-btn" onClick={handleViewMore}>
                                    VIEW MORE
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="no-products">No products available in this category.</p>
                    )}

                    {/* Chef's Selection */}
                    {chefSelection.length > 0 && (
                        <div className="chef-selections">
                            <h3 className="chef-section-title">Chef's Selection</h3>
                            {chefSelection.map((product) => (
                                <div key={product.id} className="chef-card">
                                    <div className="chef-card-image">
                                        {product.image && (
                                            <img src={getImageUrl(product.image)} alt={product.name} />
                                        )}
                                    </div>
                                    <div className="chef-card-content">
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
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default CategoryDetail;
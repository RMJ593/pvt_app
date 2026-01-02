import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import './MainMenu.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function MainMenu() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [menuBackground, setMenuBackground] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [specialOffers, setSpecialOffers] = useState([]);
    const [chefSelection, setChefSelection] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            await Promise.all([
                fetchSettings(),
                fetchMenuBackground(),
                fetchCategories(),
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
            const imagesArray = extractArray(response);
            
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

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            const allCategories = extractArray(response);
            const royaltyCategories = allCategories.filter(cat => cat.is_royalty);
            setCategories(royaltyCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-items`);
            const allProducts = extractArray(response);
            
            setProducts(allProducts);
            setSpecialOffers(allProducts.filter(p => p.is_special_offer));
            setChefSelection(allProducts.filter(p => p.is_chef_selection));
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
            setSpecialOffers([]);
            setChefSelection([]);
        }
    };
    const getImageUrl = (imagePath) => {
        return getStorageUrl(imagePath);
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

    const getCategoryProducts = (categoryId) => {
        return products.filter(p => p.category_id === categoryId).slice(0, 4);
    };

    const handleViewMore = (category) => {
        navigate(`/menu/category/${category.id}`, { state: { category } });
    };

    if (loading) {
        return <div className="loading">Loading menu...</div>;
    }

    return (
        <div className="main-menu-page">
            <TopBar settings={settings} />

            {/* Hero Section */}
            <section className="menu-hero" style={getBackgroundStyle()}>
                <div className="menu-hero-overlay"></div>
                <div className="menu-hero-content">
                    <p className="menu-hero-subtitle">OUR PRODUCTS</p>
                    <div className="menu-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    <h1 className="menu-hero-title">Our Menu</h1>
                </div>
            </section>

            {/* Best Special Menu Section */}
            {specialOffers.length > 0 && (
                <section className="special-offers-section">
                    <div className="menu-section-container">
                        <p className="section-subtitle">BEST SPECIAL MENU</p>
                        <div className="section-divider">
                            <span>◆</span>
                            <span>◆</span>
                            <span>◆</span>
                        </div>
                        <h2 className="section-title">Best Special Menu</h2>

                        <div className="special-offers-grid">
                            {specialOffers.map((product) => (
                                <div key={product.id} className="special-offer-card">
                                    {product.image && (
                                        <div className="special-offer-image">
                                            <img src={getImageUrl(product.image)} alt={product.name} />
                                        </div>
                                    )}
                                    <h3 className="special-offer-name">{product.name}</h3>
                                    {product.description && (
                                        <p className="special-offer-description">{product.description}</p>
                                    )}
                                    <p className="special-offer-price">£{parseFloat(product.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Category Sections */}
            {categories.map((category) => {
                const categoryProducts = getCategoryProducts(category.id);
                const categoryChefSelection = chefSelection.find(p => p.category_id === category.id);

                return (
                    <section key={category.id} className="category-section">
                        <div className="menu-section-container">
                            <p className="section-subtitle">{category.small_heading || category.name}</p>
                            <div className="section-divider">
                                <span>◆</span>
                                <span>◆</span>
                                <span>◆</span>
                            </div>
                            <h2 className="section-title">{category.name}</h2>

                            {/* Category Products Grid */}
                            <div className="category-products-grid">
                                {categoryProducts.map((product) => (
                                    <div key={product.id} className="category-product-card">
                                        {product.image && (
                                            <div className="category-product-image">
                                                <img src={getImageUrl(product.image)} alt={product.name} />
                                            </div>
                                        )}
                                        <div className="category-product-info">
                                            <h3 className="category-product-name">{product.name}</h3>
                                            {product.description && (
                                                <p className="category-product-description">{product.description}</p>
                                            )}
                                            <p className="category-product-price">£{parseFloat(product.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                className="view-more-btn"
                                onClick={() => handleViewMore(category)}
                            >
                                VIEW MORE
                            </button>

                            {/* Chef's Selection for this category */}
                            {categoryChefSelection && (
                                <div className="chef-selection-card">
                                    <div className="chef-selection-image">
                                        {categoryChefSelection.image && (
                                            <img src={getImageUrl(categoryChefSelection.image)} alt={categoryChefSelection.name} />
                                        )}
                                    </div>
                                    <div className="chef-selection-content">
                                        <div className="chef-badge">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                            </svg>
                                        </div>
                                        <p className="chef-selection-label">CHEF SELECTION</p>
                                        <h3 className="chef-selection-name">{categoryChefSelection.name}</h3>
                                        {categoryChefSelection.description && (
                                            <p className="chef-selection-description">{categoryChefSelection.description}</p>
                                        )}
                                        <p className="chef-selection-price">£{parseFloat(categoryChefSelection.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                );
            })}

            <Footer />
        </div>
    );
}

export default MainMenu;
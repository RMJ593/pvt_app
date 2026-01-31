import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import './CategoryMenu.css';
import { getStorageUrl, extractArray } from '../../config/api';

function CategoryMenu() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const categoryName = location.state?.categoryName || 'Menu';

    const [settings, setSettings] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [chefSelection, setChefSelection] = useState([]);
    const [displayedCount, setDisplayedCount] = useState(8);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategoryAndProducts();
    }, [categoryId]);

    const fetchCategoryAndProducts = async () => {
        try {
            await Promise.all([
                fetchSettings(),
                fetchMenuItems(),
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
            const response = await axios.get(`/settings`);
            const settingsData = response.data.data || response.data;
            setSettings(settingsData);
            
            if (settingsData.main_color) {
                document.documentElement.style.setProperty('--main-color', settingsData.main_color);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`/menu-links`);
            const items = extractArray(response);
            setMenuItems(items.filter(item => item.link_type === 'nav_link' && item.is_active));
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]);
        }
    };

    const fetchCategory = async () => {
        try {
            const categoryResponse = await axios.get(`/categories/${categoryId}`);
            setCategory(categoryResponse.data.data || categoryResponse.data);
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const productsResponse = await axios.get(`/menu-items`);
            const allProducts = extractArray(productsResponse);
            
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
            setProducts([]);
            setChefSelection([]);
        }
    };

    const handleNavigation = (sectionId) => {
        navigate('/');
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
        setSidebarOpen(false);
    };

    const getImageUrl = (imagePath) => {
        return getStorageUrl(imagePath);
    };

    const getDefaultImageUrl = () => {
        return getStorageUrl(settings?.default_image);
    };

    const getLogoUrl = () => {
        return getStorageUrl(settings?.website_logo);
    };

    const handleViewMore = () => {
        setDisplayedCount(prev => prev + 8);
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

            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                menuItems={menuItems}
                settings={settings}
                onNavigate={handleNavigation}
            />

            <nav className="main-nav">
                <div className="nav-container">
                    <button 
                        className="hamburger-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>

                    <div className="logo">
                        {getLogoUrl() ? (
                            <img src={getLogoUrl()} alt={settings?.site_name || 'Restaurant'} />
                        ) : (
                            <h1>{settings?.site_name || 'Curry Leaf'}</h1>
                        )}
                    </div>

                    <button 
                        onClick={() => navigate('/our-menus')} 
                        className="find-table-btn"
                    >
                        BACK TO MENU
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="category-menu-hero">
                {getDefaultImageUrl() && (
                    <div 
                        className="category-menu-hero-image"
                        style={{ backgroundImage: `url(${getDefaultImageUrl()})` }}
                    />
                )}
                
                <div className="category-menu-hero-overlay"></div>
                
                <div className="category-menu-hero-content">
                    <p className="category-menu-hero-subtitle">
                        {category?.small_heading || 'OUR PRODUCTS'}
                    </p>
                    
                    <div className="category-menu-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="category-menu-hero-title">
                        {category?.name || categoryName}
                    </h1>
                </div>
            </section>

            {/* Products Section */}
            <div className="category-products-wrapper">
                {displayedProducts.length === 0 && chefSelection.length === 0 ? (
                    <div className="no-products">
                        <p>No items available in this category yet.</p>
                    </div>
                ) : (
                    <>
                        {/* Regular Products */}
                        {displayedProducts.length > 0 && (
                            <section className="category-products-section">
                                <div className="category-products-container">
                                    <p className="section-subtitle">
                                        {category?.small_heading || category?.name}
                                    </p>
                                    <div className="section-divider">
                                        <span>◆</span>
                                        <span>◆</span>
                                        <span>◆</span>
                                    </div>
                                    <h2 className="section-title">{category?.name}</h2>

                                    <div className="products-grid">
                                        {displayedProducts.map((product) => (
                                            <div key={product.id} className="product-card">
                                                <div className="product-ornament top-ornament"></div>
                                                
                                                <div className="product-image-wrapper">
                                                    {product.image ? (
                                                        <img 
                                                            src={getImageUrl(product.image)} 
                                                            alt={product.name}
                                                            className="product-image"
                                                        />
                                                    ) : (
                                                        <div className="product-image-placeholder">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                                                                <line x1="6" y1="17" x2="18" y2="17" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="product-ornament bottom-ornament"></div>
                                                
                                                <div className="product-details">
                                                    <h3 className="product-name">{product.name}</h3>
                                                    
                                                    {product.description && (
                                                        <p className="product-description">{product.description}</p>
                                                    )}
                                                    
                                                    <div className="product-footer">
                                                        <span className="product-price">
                                                            £{parseFloat(product.price).toFixed(2)}
                                                        </span>
                                                    </div>
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
                            </section>
                        )}

                        {/* Chef's Selection */}
                        {chefSelection.length > 0 && (
                            <section className="chef-selection-section">
                                <div className="chef-selection-container">
                                    <h2 className="chef-section-title">Chef's Selection</h2>
                                    
                                    {chefSelection.map((product) => (
                                        <div key={product.id} className="chef-selection-card">
                                            <div className="chef-selection-image-wrapper">
                                                {product.image ? (
                                                    <img 
                                                        src={getImageUrl(product.image)} 
                                                        alt={product.name}
                                                        className="chef-selection-image"
                                                    />
                                                ) : (
                                                    <div className="chef-image-placeholder">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                                                            <line x1="6" y1="17" x2="18" y2="17" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="chef-selection-content">
                                                <div className="chef-badge">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                                    </svg>
                                                </div>
                                                <p className="chef-selection-label">CHEF SELECTION</p>
                                                <h3 className="chef-selection-name">{product.name}</h3>
                                                {product.description && (
                                                    <p className="chef-selection-description">{product.description}</p>
                                                )}
                                                <div className="chef-selection-price">
                                                    £{parseFloat(product.price).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            <Footer />
            <WhatsAppButton phone={settings?.contact_phone || '7878277198'} />
        </div>
    );
}

export default CategoryMenu;
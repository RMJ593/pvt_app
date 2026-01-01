import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import WhatsAppButton from '../components/WhatsAppButton';
import AboutUsSection from '../components/AboutUsSection';
import MenuSection from '../components/MenuSection';
import Footer from '../components/Footer';
import SpecialDishesSection from '../components/SpecialDishesSection';
import ChefsSelectionSection from '../components/ChefsSelectionSection';
import SpecialOffersSection from '../components/SpecialOffersSection';
import BookingFormContent from '../components/BookingFormContent';
import BlogsSection from '../components/BlogsSection';
import VideoStatsSection from '../components/VideoStatsSection';
import { API_BASE_URL, getStorageUrl } from '../../config/api';

function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings, setSettings] = useState(null);
    const [heroBanner, setHeroBanner] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const navigate = useNavigate();

    
    useEffect(() => {
        fetchSettings();
        fetchHeroBanner();
        fetchMenuItems();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/settings`);
            const settingsData = response.data.data || response.data;
            setSettings(settingsData);
            
            if (settingsData.main_color) {
                document.documentElement.style.setProperty('--main-color', settingsData.main_color);
            }
            if (settingsData.color_2) {
                document.documentElement.style.setProperty('--color-2', settingsData.color_2);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchHeroBanner = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/hero-banners`);
            const banners = response.data.data || response.data;
            if (Array.isArray(banners) && banners.length > 0) {
                const activeBanner = banners.find(b => b.is_active) || banners[0];
                setHeroBanner(activeBanner);
                console.log('Hero Banner loaded:', activeBanner);
            }
        } catch (error) {
            console.error('Error fetching hero banner:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-links`);
            const items = response.data.data || response.data || [];
            setMenuItems(items.filter(item => item.link_type === 'nav_link' && item.is_active));
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setSidebarOpen(false);
        }
    };

    // Updated handler to navigate to OurMenus page for menu
    const handleNavigation = (sectionId) => {
        if (sectionId === 'menu') {
            navigate('/our-menus');
        } else {
            scrollToSection(sectionId);
        }
    };

    // Get video URL from hero banner
    const getVideoUrl = () => {
        if (!heroBanner) return null;
        if (heroBanner.image_path) {
            return `http://127.0.0.1:8000/storage/${heroBanner.image_path}`;
        }
        return null;
    };

    // Get logo URL from settings
    const getLogoUrl = () => {
        const logoPath = settings?.website_logo || settings?.logo;
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `http://127.0.0.1:8000/storage/${logoPath}`;
    };

    return (
        <div className="customer-site">
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
                        onClick={() => navigate('/booking')} 
                        className="find-table-btn"
                    >
                        FIND A TABLE
                    </button>
                </div>
            </nav>

            <section id="home" className="hero-section">
                {getVideoUrl() && (
                    <video 
                        className="hero-video" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                    >
                        <source src={getVideoUrl()} type="video/mp4" />
                    </video>
                )}
                
                <div className="hero-overlay"></div>

                <div className="hero-content">
                    <p className="hero-subtitle">
                        {heroBanner?.subtitle || 'DELIGHTFUL EXPERIENCE'}
                    </p>
                    
                    <div className="divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="hero-title">
                        {heroBanner?.title || 'Handcrafted Indian Flavours, Straight from the Heart'}
                    </h1>

                    <p className="hero-description">
                        {heroBanner?.description || 'At Curry Leaf, every dish is a celebration of India\'s rich culinary heritage - prepared with passion, perfected with tradition, and served with love.'}
                    </p>

                    <button 
                        onClick={() => navigate('/our-menus')}
                        className="view-menu-btn"
                    >
                        {heroBanner?.button_text || 'VIEW OUR MENU'}
                    </button>
                </div>
            </section>

            <MenuSection id="menu" />
            <AboutUsSection id="about" />
            
            {/* Special Dishes Section - for is_special toggle */}
            <SpecialDishesSection id="special-dishes" />
            
            {/* Chef's Selection Section - for is_special_selection toggle */}
            <ChefsSelectionSection id="chefs-selection" />
            
            {/* Special Offers Section - for has_offer/is_offer toggle */}
            <SpecialOffersSection id="special-offers" />
            
            {/* Booking Form Section - embedded without hero/header/footer */}
            <BookingFormContent />
            
            {/* Video and Stats Section */}
            <VideoStatsSection />
            
            {/* Blogs Section - Latest blogs */}
            <BlogsSection />
            
            <Footer />
            <WhatsAppButton phone={settings?.whatsapp_number || '876543219'} />
        </div>
    );
}

export default Home;
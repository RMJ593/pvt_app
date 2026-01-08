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
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

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
            const response = await axios.get(`/api/settings`);
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
            const response = await axios.get(`/api/hero-banners`);
            
            // Simple extraction - we know the format now
            const banners = response.data?.data || [];
            
            console.log('Fetched banners:', banners);
            
            if (banners.length > 0) {
                const activeBanner = banners.find(b => b.is_active) || banners[0];
                console.log('Active banner:', activeBanner);
                console.log('Video path:', activeBanner.image_path);
                console.log('Full URL:', activeBanner.full_url);
                setHeroBanner(activeBanner);
            }
        } catch (error) {
            console.error('Error fetching hero banner:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`/api/menu-links`);
            const items = extractArray(response);
            setMenuItems(items.filter(item => item.link_type === 'nav_link' && item.is_active));
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]);
        }
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setSidebarOpen(false);
        }
    };

    const handleNavigation = (sectionId) => {
        if (sectionId === 'menu') {
            navigate('/our-menus');
        } else {
            scrollToSection(sectionId);
        }
    };

    // ✅ SIMPLIFIED: Use full_url from backend or construct URL
    // ✅ FIXED: Simplified video URL handling
    const getVideoUrl = (banner) => {
        if (!banner) return null;
        
        // If image_path is already a full Cloudinary URL, use it directly
        if (banner.image_path) {
            if (banner.image_path.startsWith('http://') || banner.image_path.startsWith('https://')) {
                console.log('Using Cloudinary URL:', banner.image_path);
                return banner.image_path;
            }
            // Otherwise it's a local path
            const url = `/storage/${banner.image_path}`;
            console.log('Using local storage URL:', url);
            return url;
        }
        
        return null;
    };

    const getLogoUrl = () => {
        const logoPath = settings?.website_logo || settings?.logo;
        if (!logoPath) return null;
        return getStorageUrl(logoPath);
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
                {heroBanner && getVideoUrl(heroBanner) ? (
                    <video 
                        key={heroBanner.id}
                        className="hero-video" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        onError={(e) => {
                            console.error('❌ Video failed to load');
                            console.error('Video src:', e.target.src);
                            console.error('Error:', e);
                        }}
                        onLoadedData={() => {
                            console.log('✅ Video loaded successfully');
                            console.log('Video src:', getVideoUrl(heroBanner));
                        }}
                    >
                        <source src={getVideoUrl(heroBanner)} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="hero-fallback" style={{
                        padding: '20px', 
                        background: '#333', 
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        {!heroBanner ? 'No hero banner available' : 'Video not available'}
                    </div>
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
            <SpecialDishesSection id="special-dishes" />
            <ChefsSelectionSection id="chefs-selection" />
            <SpecialOffersSection id="special-offers" />
            <BookingFormContent />
            <VideoStatsSection />
            <BlogsSection />
            
            <Footer />
            <WhatsAppButton phone={settings?.whatsapp_number || '876543219'} />
        </div>
    );
}

export default Home;

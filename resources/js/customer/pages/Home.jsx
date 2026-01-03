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
            console.log('Fetching hero banners from:', `${API_BASE_URL}/hero-banners`);
            const response = await axios.get(`${API_BASE_URL}/hero-banners`);
            console.log('Full response:', response);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Is array?', Array.isArray(response.data));
            
            // Try to extract banners from various formats
            let banners = [];
            
            // Format 1: { success: true, data: [...] }
            if (response.data?.success === true && Array.isArray(response.data?.data)) {
                banners = response.data.data;
                console.log('Format 1: success wrapper');
            }
            // Format 2: { data: [...] }
            else if (response.data?.data && Array.isArray(response.data.data)) {
                banners = response.data.data;
                console.log('Format 2: data wrapper');
            }
            // Format 3: [...]
            else if (Array.isArray(response.data)) {
                banners = response.data;
                console.log('Format 3: direct array');
            }
            // Format 4: Single object
            else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
                banners = [response.data];
                console.log('Format 4: single object');
            }
            
            console.log('Extracted banners:', banners);
            console.log('Banners count:', banners.length);
            
            if (banners.length > 0) {
                const activeBanner = banners.find(b => b.is_active) || banners[0];
                console.log('Selected banner:', activeBanner);
                console.log('Banner keys:', Object.keys(activeBanner));
                console.log('Banner image_path:', activeBanner.image_path);
                console.log('Banner full_url:', activeBanner.full_url);
                
                setHeroBanner(activeBanner);
            } else {
                console.warn('No hero banners found in response');
                console.warn('Raw response.data:', JSON.stringify(response.data, null, 2));
            }
        } catch (error) {
            console.error('Error fetching hero banner:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-links`);
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

    // ✅ FIXED: Updated to handle different URL formats
    const getVideoUrl = (banner) => {
        if (!banner || !banner.image_path) return null;
        
        // If full_url is provided by backend, use it
        if (banner.full_url) {
            console.log('Using full_url:', banner.full_url);
            return banner.full_url;
        }
        
        // Otherwise construct the URL
        const path = banner.image_path;
        
        // If path already starts with http, use as is
        if (path.startsWith('http')) {
            return path;
        }
        
        // Remove any leading slashes or 'storage/' prefix
        const cleanPath = path.replace(/^\/?(storage\/)?/, '');
        
        // Construct full URL
        const videoUrl = `${API_BASE_URL}/storage/${cleanPath}`;
        console.log('Constructed video URL:', videoUrl);
        return videoUrl;
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
                {/* Debug info - remove after fixing */}
                {console.log('Render check - heroBanner:', heroBanner)}
                {console.log('Render check - videoUrl:', heroBanner ? getVideoUrl(heroBanner) : 'no banner')}
                
                {heroBanner && getVideoUrl(heroBanner) ? (
                    <video 
                        className="hero-video" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        onError={(e) => {
                            console.error('Video failed to load:', e);
                            console.error('Video src:', e.target.src);
                        }}
                        onLoadedData={() => console.log('Video loaded successfully')}
                    >
                        <source src={getVideoUrl(heroBanner)} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div style={{padding: '20px', background: 'yellow', color: 'black'}}>
                        DEBUG: No video - heroBanner: {heroBanner ? 'exists' : 'null'}, 
                        videoUrl: {heroBanner ? getVideoUrl(heroBanner) || 'null' : 'no banner'}
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
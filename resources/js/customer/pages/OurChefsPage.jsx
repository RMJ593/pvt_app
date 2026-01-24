import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { getStorageUrl, extractArray } from '../../config/api';
import './OurChefsPage.css';

function OurChefsPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
        fetchSettings();
        fetchGallery();
        fetchMenuItems();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/settings');
            if (response.data.success) {
                const settingsData = response.data.data;
                setSettings(settingsData);
                
                if (settingsData.main_color) {
                    document.documentElement.style.setProperty('--main-color', settingsData.main_color);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchGallery = async () => {
        try {
            const response = await axios.get('/gallery');
            const galleryData = extractArray(response);
            setGallery(galleryData);
        } catch (error) {
            console.error('Error fetching gallery:', error);
            setGallery([]);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('/menu-links');
            const items = extractArray(response);
            setMenuItems(items.filter(item => item.link_type === 'nav_link' && item.is_active));
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]);
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

    const getDefaultImageUrl = () => {
        if (!settings?.default_image) return null;
        return getStorageUrl(settings.default_image);
    };

    const getLogoUrl = () => {
        const logoPath = settings?.website_logo || settings?.logo;
        if (!logoPath) return null;
        return getStorageUrl(logoPath);
    };

    const getGalleryImageUrl = (imageNumber) => {
        const galleryItem = gallery.find(item => 
            item.title?.includes(`image${imageNumber}`) || 
            item.id === imageNumber
        );
        if (galleryItem?.image_path) {
            return getStorageUrl(galleryItem.image_path);
        }
        return null;
    };

    return (
        <div className="our-chefs-page-wrapper">
            <TopBar settings={settings} />

            <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                menuItems={menuItems}
                settings={settings}
                onNavigate={handleNavigation}
            />

            <nav className="our-chefs-nav">
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
                        onClick={() => navigate('/')} 
                        className="find-table-btn"
                    >
                        BACK TO HOME
                    </button>
                </div>
            </nav>

            {/* Hero Section with Background Image */}
            <section className="chefs-hero-section">
                {getDefaultImageUrl() && (
                    <div 
                        className="chefs-hero-image"
                        style={{ backgroundImage: `url(${getDefaultImageUrl()})` }}
                    />
                )}
                
                <div className="chefs-hero-overlay"></div>

                <div className="chefs-hero-content">
                    <p className="chefs-hero-subtitle">MEET THE MASTERS</p>
                    
                    <div className="divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="chefs-hero-title">Our Team</h1>
                </div>
            </section>

            {/* Chef Profile Section */}
            <section className="chef-profile-section">
                <div className="chef-profile-container">
                    {/* Left Side - Chef Image */}
                    <div className="chef-image-wrapper">
                        {getGalleryImageUrl(11) ? (
                            <img 
                                src={getGalleryImageUrl(11)} 
                                alt="Chef Vimal Sebastain" 
                                className="chef-profile-image"
                            />
                        ) : (
                            <div className="chef-image-placeholder">
                                <span>Chef Image</span>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Chef Info */}
                    <div className="chef-info-wrapper">
                        <h2 className="chef-years">35 Years of Culinary Excellence</h2>
                        <h3 className="chef-role">Our Master Chef</h3>
                        
                        <p className="chef-description">
                            With over three decades of experience, Chef Vimal brings timeless skill and 
                            passion to every plate. Inspired by India's rich culinary heritage prepared 
                            with passion, perfected with tradition, and served with love, his dishes 
                            reflect both authenticity and artistry.
                        </p>

                        <p className="chef-name">Chef Vimal Sebastain</p>
                    </div>
                </div>
            </section>

            {/* Quote Section with Background */}
            <section className="chef-quote-section">
                {getGalleryImageUrl(12) && (
                    <div 
                        className="quote-background-image"
                        style={{ backgroundImage: `url(${getGalleryImageUrl(12)})` }}
                    />
                )}
                
                <div className="quote-overlay"></div>
                
                <div className="quote-content">
                    <div className="quote-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>
                    
                    <blockquote className="chef-quote">
                        "A modern restaurant with a menu that will make your mouth water."
                    </blockquote>
                    
                    <p className="quote-attribution">— Chef Vimal Sebastain</p>
                </div>
            </section>

            <Footer />
            <WhatsAppButton phone={settings?.contact_phone || '876543219'} />
        </div>
    );
}

export default OurChefsPage;
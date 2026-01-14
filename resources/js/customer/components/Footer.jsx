import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Footer.css';
import { getStorageUrl, extractArray } from '../../config/api';

function Footer() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [footerLinks, setFooterLinks] = useState([]);
    const [pages, setPages] = useState({});
    
    useEffect(() => {
        fetchSettings();
        fetchFooterLinks();
        fetchPages();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/settings');
            const settingsData = response.data.data || response.data;
            console.log('✅ Footer Settings Loaded:', settingsData);
            setSettings(settingsData);
            
            // Apply main color to CSS variables
            if (settingsData.main_color) {
                document.documentElement.style.setProperty('--footer-main-color', settingsData.main_color);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchFooterLinks = async () => {
        try {
            const response = await axios.get('/footer-links');
            const allLinks = extractArray(response);
            const activeLinks = allLinks.filter(link => link.is_active);
            console.log('✅ Footer Links Loaded:', activeLinks);
            setFooterLinks(activeLinks);
        } catch (error) {
            console.error('Error fetching footer links:', error);
            setFooterLinks([]);
        }
    };

    const fetchPages = async () => {
        try {
            const response = await axios.get('/pages');
            const allPages = extractArray(response);
            const pagesMap = {};
            allPages.forEach(page => {
                pagesMap[page.id] = page;
            });
            setPages(pagesMap);
        } catch (error) {
            console.error('Error fetching pages:', error);
            setPages({});
        }
    };

    const getLogoUrl = () => {
        const logoPath = settings?.website_logo;
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return getStorageUrl(logoPath);
    };

    const handleFooterLinkClick = (link) => {
        if (link.page_id && pages[link.page_id]) {
            const page = pages[link.page_id];
            navigate(`/page/${page.slug}`, { state: { page } });
        } else if (link.url && link.url.startsWith('#')) {
            navigate('/');
            setTimeout(() => {
                const sectionId = link.url.replace('#', '');
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else if (link.url && link.url.startsWith('/')) {
            navigate(link.url);
        } else if (link.url && link.url !== '#') {
            if (link.target === '_blank') {
                window.open(link.url, '_blank');
            } else {
                window.location.href = link.url;
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Get main color for styling
    const mainColor = settings?.main_color || '#e4e590';

    return (
        <footer className="footer-elegant" style={{ '--main-color': mainColor }}>
            <div className="footer-elegant-container">
                {/* Left Section - Quick Links */}
                <div className="footer-elegant-section footer-links-section">
                    <nav className="footer-nav-elegant">
                        <button 
                            onClick={() => navigate('/')}
                            className="footer-nav-link"
                        >
                            Home
                        </button>
                        
                        {/* Dynamic Footer Links from Database */}
                        {footerLinks.length > 0 ? (
                            footerLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => handleFooterLinkClick(link)}
                                    className="footer-nav-link"
                                >
                                    {link.title}
                                </button>
                            ))
                        ) : (
                            <>
                                {/* Fallback links if no footer links in database */}
                                <button onClick={() => navigate('/about')} className="footer-nav-link">
                                    About Us
                                </button>
                                <button onClick={() => navigate('/contact')} className="footer-nav-link">
                                    Contact Us
                                </button>
                            </>
                        )}
                        
                        <button 
                            onClick={() => window.open('https://drive.google.com/your-menu-pdf', '_blank')}
                            className="footer-download-btn"
                        >
                            DOWNLOAD MENU
                        </button>
                        
                        <button 
                            onClick={() => navigate('/booking')}
                            className="footer-book-btn"
                        >
                            BOOK A TABLE
                        </button>
                    </nav>
                </div>

                {/* Vertical Divider 1 */}
                <div className="footer-divider">
                    <svg width="2" height="200" viewBox="0 0 2 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="1" y1="0" x2="1" y2="60" stroke={mainColor} strokeWidth="1" opacity="0.3"/>
                        <circle cx="1" cy="70" r="3" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="85" r="2" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="100" r="4" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="115" r="2" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="130" r="3" fill={mainColor} opacity="0.3"/>
                        <line x1="1" y1="140" x2="1" y2="200" stroke={mainColor} strokeWidth="1" opacity="0.3"/>
                    </svg>
                </div>

                {/* Center Section - Logo & Contact Info */}
                <div className="footer-elegant-section footer-center-section">
                    <div className="footer-elegant-logo">
                        {getLogoUrl() ? (
                            <img 
                                src={getLogoUrl()} 
                                alt={settings?.site_name || 'Restaurant'} 
                                className="footer-logo-img-elegant"
                            />
                        ) : (
                            <h2 className="footer-logo-text-elegant">
                                {settings?.site_name || 'Curry Leaf'}
                            </h2>
                        )}
                    </div>

                    <div className="footer-contact-elegant">
                        {settings?.contact_address && (
                            <div className="footer-contact-item">
                                <svg className="footer-contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>{settings.contact_address}</span>
                            </div>
                        )}

                        {settings?.contact_email && (
                            <div className="footer-contact-item">
                                <svg className="footer-contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>{settings.contact_email}</span>
                            </div>
                        )}

                        {settings?.contact_phone && (
                            <div className="footer-contact-item">
                                <svg className="footer-contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <span>{settings.contact_phone}</span>
                            </div>
                        )}

                        {settings?.shop_start_time && settings?.shop_close_time && (
                            <div className="footer-contact-item">
                                <svg className="footer-contact-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>
                                    Daily: {formatTime(settings.shop_start_time)} to {formatTime(settings.shop_close_time)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Divider 2 */}
                <div className="footer-divider">
                    <svg width="2" height="200" viewBox="0 0 2 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="1" y1="0" x2="1" y2="60" stroke={mainColor} strokeWidth="1" opacity="0.3"/>
                        <circle cx="1" cy="70" r="3" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="85" r="2" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="100" r="4" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="115" r="2" fill={mainColor} opacity="0.3"/>
                        <circle cx="1" cy="130" r="3" fill={mainColor} opacity="0.3"/>
                        <line x1="1" y1="140" x2="1" y2="200" stroke={mainColor} strokeWidth="1" opacity="0.3"/>
                    </svg>
                </div>

                {/* Right Section - Social Media */}
                <div className="footer-elegant-section footer-social-section">
                    <h3 className="footer-social-heading">Follow Us</h3>
                    <div className="footer-social-elegant">
                        {settings?.facebook_url && settings.facebook_url.trim() !== '' && (
                            <a 
                                href={settings.facebook_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="footer-social-link-elegant"
                                aria-label="Facebook"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span>Facebook</span>
                            </a>
                        )}

                        {settings?.instagram_url && settings.instagram_url.trim() !== '' && (
                            <a 
                                href={settings.instagram_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="footer-social-link-elegant"
                                aria-label="Instagram"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                <span>Instagram</span>
                            </a>
                        )}

                        {settings?.twitter_url && settings.twitter_url.trim() !== '' && (
                            <a 
                                href={settings.twitter_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="footer-social-link-elegant"
                                aria-label="Twitter"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                                <span>Twitter</span>
                            </a>
                        )}

                        {settings?.youtube_url && settings.youtube_url.trim() !== '' && (
                            <a 
                                href={settings.youtube_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="footer-social-link-elegant"
                                aria-label="YouTube"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                <span>YouTube</span>
                            </a>
                        )}

                        {settings?.linkedin_url && settings.linkedin_url.trim() !== '' && (
                            <a 
                                href={settings.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="footer-social-link-elegant"
                                aria-label="LinkedIn"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                <span>LinkedIn</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-elegant-bottom">
                <div className="footer-elegant-bottom-content">
                    <p className="footer-elegant-copyright">
                        © {new Date().getFullYear()} {settings?.site_name || 'Curry Leaf'}. All Rights Reserved | by{' '}
                        <a href="https://tphrc.com" target="_blank" rel="noopener noreferrer" className="footer-tphrc-link">
                            TPHRC PVT LTD
                        </a>
                    </p>
                    
                    <button onClick={scrollToTop} className="footer-scroll-top-elegant" aria-label="Scroll to top">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 15l-6-6-6 6"/>
                        </svg>
                    </button>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css';

function Sidebar({ isOpen, onClose, menuItems, settings, onNavigate }) {
    const navigate = useNavigate();
    const [topMenuLinks, setTopMenuLinks] = useState([]);
    const [pages, setPages] = useState([]);
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        if (isOpen) {
            fetchTopMenuLinks();
            fetchPages();
        }
    }, [isOpen]);

    const fetchTopMenuLinks = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/menu-links`);
            const allLinks = response.data.data || response.data;
            // Filter only active top menu links
            const activeTopLinks = allLinks.filter(
                link => link.is_active && link.link_type === 'top_menu'
            );
            setTopMenuLinks(activeTopLinks);
        } catch (error) {
            console.error('Error fetching top menu links:', error);
        }
    };

    const fetchPages = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pages`);
            const allPages = response.data.data || response.data;
            const activePages = allPages.filter(page => page.is_active);
            
            // Create a map of pages by ID for easy lookup
            const pagesMap = {};
            activePages.forEach(page => {
                pagesMap[page.id] = page;
            });
            
            setPages(pagesMap);
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const handleLinkClick = (link) => {
        // Check if it's a page link
        if (link.page_id && pages[link.page_id]) {
            const page = pages[link.page_id];
            
            // Special handling for Contact Us page
            if (page.slug === 'contact-us' || page.slug === 'contact') {
                navigate('/contact');
                onClose();
                return;
            }
            
            // Special handling for About Us page
            if (page.slug === 'about-us' || page.slug === 'about') {
                navigate('/about');
                onClose();
                return;
            }
            
            navigate(`/page/${page.slug}`, { state: { page } });
        } 
        // Check if URL starts with # (internal section)
        else if (link.url && link.url.startsWith('#')) {
            const sectionId = link.url.replace('#', '');
            onNavigate(sectionId);
        }
        // Check if URL starts with / (internal route)
        else if (link.url && link.url.startsWith('/')) {
            navigate(link.url);
        }
        // External link
        else if (link.url) {
            if (link.target === '_blank') {
                window.open(link.url, '_blank');
            } else {
                window.location.href = link.url;
            }
        }
        
        onClose();
    };

    const handleOurMenusClick = () => {
        navigate('/our-menus');
        onClose();
    };

    const handleAboutClick = () => {
        navigate('/about');
        onClose();
    };

    const handleContactClick = () => {
        navigate('/contact');
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <button className="sidebar-close" onClick={onClose}>×</button>
                
                <nav className="sidebar-nav">
                    {/* Main Navigation - Always show first */}
                    <h3 className="sidebar-section-title">Explore</h3>
                    
                    <button
                        onClick={handleAboutClick}
                        className="sidebar-link sidebar-link-highlight"
                    >
                        <span className="diamond">◆</span>
                        About Us
                    </button>

                    <button
                        onClick={handleOurMenusClick}
                        className="sidebar-link sidebar-link-highlight"
                    >
                        <span className="diamond">◆</span>
                        Our Menus
                    </button>

                    <button
                        onClick={handleContactClick}
                        className="sidebar-link sidebar-link-highlight"
                    >
                        <span className="diamond">◆</span>
                        Contact Us
                    </button>

                    {topMenuLinks.length > 0 && (
                        <>
                            <div className="sidebar-divider"></div>
                            <h3 className="sidebar-section-title">Menu</h3>
                            
                            {topMenuLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => handleLinkClick(link)}
                                    className="sidebar-link"
                                >
                                    <span className="diamond">◆</span>
                                    {link.title}
                                </button>
                            ))}
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <h3>Visit Us</h3>
                    
                    {settings?.contact_address && (
                        <p className="sidebar-address">{settings.contact_address}</p>
                    )}

                    <p className="sidebar-timing">Daily : 05:00PM to 10:00PM</p>

                    {settings?.contact_email && (
                        <p className="sidebar-email">{settings.contact_email}</p>
                    )}

                    <div className="sidebar-divider-small"></div>

                    <p className="booking-label">Booking Request</p>
                    {settings?.contact_phone && (
                        <a href={`tel:${settings.contact_phone}`} className="sidebar-phone">
                            {settings.contact_phone}
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}

export default Sidebar;
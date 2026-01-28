import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function Sidebar({ isOpen, onClose, menuItems, settings, onNavigate }) {
    const navigate = useNavigate();
    const [topMenuLinks, setTopMenuLinks] = useState([]);
    const [pages, setPages] = useState({});
    
    useEffect(() => {
        if (isOpen) {
            // Reset state first to ensure fresh data
            setTopMenuLinks([]);
            setPages({});
            
            // Then fetch fresh data
            fetchTopMenuLinks();
            fetchPages();
        }
    }, [isOpen]);

    const fetchTopMenuLinks = async () => {
        try {
            console.log('🔍 FETCH: Starting to fetch menu links...');
            const response = await axios.get('/menu-links');
            console.log('🔍 FETCH: Raw API response:', response.data);
            
            const allLinks = extractArray(response);
            console.log('🔍 FETCH: All links after extractArray:', allLinks);
            console.log('🔍 FETCH: Total links count:', allLinks.length);
            
            // Log each link in detail
            allLinks.forEach((link, index) => {
                console.log(`🔍 FETCH: Link ${index + 1}:`, {
                    id: link.id,
                    title: link.title,
                    link_text: link.link_text,
                    is_active: link.is_active,
                    link_type: link.link_type,
                    url: link.url
                });
            });
            
            // Filter only active top menu links and sort by order
            const activeTopLinks = allLinks
                .filter(link => {
                    const matches = link.is_active && link.link_type === 'top_menu';
                    console.log(`🔍 FILTER: Link "${link.title}" - is_active: ${link.is_active}, link_type: "${link.link_type}", matches: ${matches}`);
                    return matches;
                })
                .sort((a, b) => a.order - b.order);
            
            console.log('🔍 FILTER: Filtered top menu links:', activeTopLinks);
            console.log('🔍 FILTER: Final count:', activeTopLinks.length);
            
            setTopMenuLinks(activeTopLinks);
            console.log('✅ FETCH: Top Menu Links Set!');
        } catch (error) {
            console.error('❌ FETCH ERROR:', error);
            setTopMenuLinks([]);
        }
    };

    const fetchPages = async () => {
        try {
            const response = await axios.get('/pages');
            const allPages = extractArray(response);
            
            // Create a map of pages by ID for easy lookup
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

    const handleTopMenuLinkClick = (link) => {
        // Handle CMS Page link (page_id exists)
        if (link.page_id && pages[link.page_id]) {
            const page = pages[link.page_id];
            navigate(`/page/${page.slug}`, { state: { page } });
            onClose();
            return;
        }
        
        // Handle Custom URL (hardcoded pages)
        if (link.url) {
            // Check if URL starts with # (internal section/anchor)
            if (link.url.startsWith('#')) {
                const sectionId = link.url.replace('#', '');
                navigate('/');
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
                onClose();
                return;
            }
            
            // Check if URL starts with / (internal route)
            if (link.url.startsWith('/')) {
                navigate(link.url);
                onClose();
                return;
            }
            
            // External URL
            if (link.url !== '#') {
                if (link.target === '_blank') {
                    window.open(link.url, '_blank');
                } else {
                    window.location.href = link.url;
                }
                onClose();
                return;
            }
        }
        
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
                    <h3 className="sidebar-section-title">Menu</h3>
                    
                    {/* Dynamic Top Menu Links from Database ONLY */}
                    {topMenuLinks.length > 0 ? (
                        topMenuLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => handleTopMenuLinkClick(link)}
                                className="sidebar-link sidebar-link-highlight"
                            >
                                <span className="diamond">◆</span>
                                {link.link_text || link.title}
                            </button>
                        ))
                    ) : (
                        <p className="no-links-message">No menu links available</p>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <h3>Visit Us</h3>
                    
                    {settings?.contact_address && (
                        <p className="sidebar-address">{settings.contact_address}</p>
                    )}

                    {settings?.shop_start_time && settings?.shop_close_time && (
                        <p className="sidebar-timing">
                            Daily : {settings.shop_start_time} to {settings.shop_close_time}
                        </p>
                    )}

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
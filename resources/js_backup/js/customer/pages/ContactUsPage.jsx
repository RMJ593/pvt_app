import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import './ContactUsPage.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function ContactUsPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    
    useEffect(() => {
        fetchSettings();
        fetchMenuItems();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`/api/settings`);
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
        if (settings.default_image.startsWith('http')) return settings.default_image;
        return `http://127.0.0.1:8000/storage/${settings.default_image}`;
    };

    const getLogoUrl = () => {
        const logoPath = settings?.website_logo || settings?.logo;
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `http://127.0.0.1:8000/storage/${logoPath}`;
    };

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getGoogleMapsUrl = () => {
        if (!settings?.contact_address) return '#';
        const address = encodeURIComponent(settings.contact_address);
        return `https://www.google.com/maps/search/?api=1&query=${address}`;
    };

    const getGoogleMapsEmbedUrl = () => {
        if (!settings?.contact_address) return '';
        const address = encodeURIComponent(settings.contact_address);
        return `https://www.google.com/maps?q=${address}&output=embed`;
    };

    const getSundayTiming = () => {
        const sundaySlots = settings?.booking_schedule?.sunday || [];
        if (sundaySlots.length === 0) return 'Closed';
        const firstSlot = sundaySlots[0];
        const lastSlot = sundaySlots[sundaySlots.length - 1];
        return `${formatTime(firstSlot)} - ${formatTime(lastSlot)}`;
    };

    const getWeekdayTiming = () => {
        const mondaySlots = settings?.booking_schedule?.monday || [];
        if (mondaySlots.length === 0) return 'Closed';
        const firstSlot = mondaySlots[0];
        const lastSlot = mondaySlots[mondaySlots.length - 1];
        return `${formatTime(firstSlot)} - ${formatTime(lastSlot)}`;
    };

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`/api/contact`, formData);
            
            if (response.data.success) {
                setMessage('Message sent successfully! We will get back to you soon.');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    message: ''
                });
            }
        } catch (error) {
            console.error('Contact error:', error);
            setMessage('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-us-wrapper">
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
                        onClick={() => navigate('/')} 
                        className="find-table-btn"
                    >
                        BACK TO HOME
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="contact-hero-section">
                {getDefaultImageUrl() && (
                    <div 
                        className="contact-hero-image"
                        style={{ backgroundImage: `url(${getDefaultImageUrl()})` }}
                    />
                )}
                
                <div className="contact-hero-overlay"></div>

                <div className="contact-hero-content">
                    <p className="contact-hero-subtitle">GET IN TOUCH</p>
                    
                    <div className="divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="contact-hero-title">Contact Us</h1>
                </div>
            </section>

            {/* Contact Info & Map Section */}
            <section className="contact-info-section">
                <div className="contact-info-container">
                    {/* Google Map */}
                    <div className="map-wrapper">
                        <iframe
                            src={getGoogleMapsEmbedUrl()}
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Restaurant Location"
                        ></iframe>
                    </div>

                    {/* Info Cards */}
                    <div className="contact-info-cards">
                        <div className="info-card">
                            <h3>Sunday's</h3>
                            <p>{getSundayTiming()}</p>
                        </div>

                        <div className="info-card center-card">
                            <h3>Address</h3>
                            <p>{settings?.contact_address || '169 West Rd, Newcastle upon Tyne NE15 6PQ'}</p>
                        </div>

                        <div className="info-card">
                            <h3>Monday - Friday</h3>
                            <p>{getWeekdayTiming()}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Message Form Section */}
            <section className="contact-form-section">
                <div className="contact-form-container">
                    <h2 className="form-section-title">Message Us</h2>

                    {message && (
                        <div className={`contact-alert ${message.includes('success') ? 'contact-alert-success' : 'contact-alert-error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="contact-form">
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Name"
                                    required
                                    className="contact-input"
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="Email"
                                    required
                                    className="contact-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="Phone"
                                required
                                className="contact-input"
                            />
                        </div>

                        <div className="form-group">
                            <textarea
                                value={formData.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                placeholder="Message"
                                rows="6"
                                required
                                className="contact-textarea"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn-send">
                                {loading ? 'Sending...' : 'SEND YOUR MESSAGE'}
                            </button>
                            
                            <span className="or-text">OR</span>
                            
                            <button 
                                type="button" 
                                onClick={() => navigate('/booking')} 
                                className="btn-book-table"
                            >
                                BOOK A TABLE
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <Footer />
            <WhatsAppButton phone={settings?.contact_phone || '876543219'} />
        </div>
    );
}

export default ContactUsPage;

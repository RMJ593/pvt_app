import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import './BookingPage.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function BookingPage() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        country_code: '+44',
        phone: '',
        num_persons: '1',
        booking_date: '',
        booking_time: '',
        message: '',
        terms_accepted: false,
        privacy_accepted: false
    });
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    
    const countryCodes = [
        { code: '+44', country: 'UK' },
        { code: '+1', country: 'USA' },
        { code: '+91', country: 'India' },
        { code: '+61', country: 'Australia' },
        { code: '+971', country: 'UAE' }
    ];

    useEffect(() => {
        fetchSettings();
        fetchMenuItems();
    }, []);

    useEffect(() => {
        if (formData.booking_date) {
            calculateAvailableTimeSlots(formData.booking_date);
        }
    }, [formData.booking_date, settings]);

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

    const getDayName = (date) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date(date).getDay()];
    };

    const calculateAvailableTimeSlots = (dateStr) => {
        if (!settings || !settings.booking_schedule) {
            setAvailableTimeSlots([]);
            return;
        }

        const dayName = getDayName(dateStr);
        const daySchedule = settings.booking_schedule[dayName] || [];
        
        setAvailableTimeSlots(daySchedule.sort());
    };

    const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const getOpeningHours = () => {
        if (!settings) return [];
        
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const hours = [];

        days.forEach(day => {
            const slots = settings.booking_schedule?.[day] || [];
            if (slots.length > 0) {
                const firstSlot = slots[0];
                const lastSlot = slots[slots.length - 1];
                hours.push({
                    day: day.charAt(0).toUpperCase() + day.slice(1),
                    time: `${formatTime(firstSlot)} - ${formatTime(lastSlot)}`
                });
            }
        });

        return hours;
    };

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.terms_accepted || !formData.privacy_accepted) {
            setMessage('Please accept the terms and conditions');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`/api/bookings`, formData);
            
            if (response.data.success) {
                setMessage('Booking request submitted successfully! We will contact you shortly.');
                setFormData({
                    name: '',
                    country_code: '+44',
                    phone: '',
                    num_persons: '1',
                    booking_date: '',
                    booking_time: '',
                    message: '',
                    terms_accepted: false,
                    privacy_accepted: false
                });
            }
        } catch (error) {
            console.error('Booking error:', error);
            setMessage('Failed to submit booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const groupHoursByPeriod = (hours) => {
        const weekdays = hours.filter(h => 
            !['Sunday', 'Saturday'].includes(h.day)
        );
        const weekend = hours.filter(h => 
            ['Sunday', 'Saturday'].includes(h.day)
        );

        return { weekdays, weekend };
    };

    const openingHours = getOpeningHours();
    const { weekdays, weekend } = groupHoursByPeriod(openingHours);

    return (
        <div className="booking-page-wrapper">
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

            {/* Hero Section with Background Image */}
            <section className="booking-hero-section">
                {getDefaultImageUrl() && (
                    <div 
                        className="booking-hero-image"
                        style={{ backgroundImage: `url(${getDefaultImageUrl()})` }}
                    />
                )}
                
                <div className="booking-hero-overlay"></div>

                <div className="booking-hero-content">
                    <p className="booking-hero-subtitle">RESERVE YOUR TABLE</p>
                    
                    <div className="divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="booking-hero-title">Book A Table</h1>
                </div>
            </section>

            {/* Booking Form Section */}
            <div className="booking-page">
                <div className="booking-container">
                    {/* Left Section - Form */}
                    <div className="booking-form-section">
                        <h1 className="booking-title">Request Callback</h1>
                        <p className="booking-subtitle">
                            Booking request{' '}
                            <a href={`tel:${settings?.contact_phone}`} className="phone-link">
                                {settings?.contact_phone || '+44 787 8277198'}
                            </a>
                            {' '}or fill out the order form for a callback
                        </p>

                        {message && (
                            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="booking-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Name"
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-row">
                                <select
                                    value={formData.country_code}
                                    onChange={(e) => handleChange('country_code', e.target.value)}
                                    className="form-select country-code"
                                >
                                    {countryCodes.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.code}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="Phone"
                                    required
                                    className="form-input phone-input"
                                />
                            </div>

                            <div className="form-row">
                                <select
                                    value={formData.num_persons}
                                    onChange={(e) => handleChange('num_persons', e.target.value)}
                                    className="form-select"
                                    required
                                >
                                    {[...Array(20)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1} Person{i > 0 ? 's' : ''}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="date"
                                    value={formData.booking_date}
                                    onChange={(e) => handleChange('booking_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="form-input"
                                />

                                <select
                                    value={formData.booking_time}
                                    onChange={(e) => handleChange('booking_time', e.target.value)}
                                    className="form-select"
                                    required
                                    disabled={!formData.booking_date}
                                >
                                    <option value="">Select Time</option>
                                    {availableTimeSlots.map(slot => (
                                        <option key={slot} value={slot}>
                                            {formatTime(slot)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => handleChange('message', e.target.value)}
                                    placeholder="Message"
                                    rows="4"
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.terms_accepted}
                                        onChange={(e) => handleChange('terms_accepted', e.target.checked)}
                                        required
                                    />
                                    <span>
                                        I accept the{' '}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/page/terms-and-conditions')}
                                            className="link-button"
                                        >
                                            Terms and Conditions
                                        </button>
                                    </span>
                                </label>
                            </div>

                            <div className="form-checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.privacy_accepted}
                                        onChange={(e) => handleChange('privacy_accepted', e.target.checked)}
                                        required
                                    />
                                    <span>
                                        By signing up, you acknowledge that you've read and agreed to Our{' '}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/page/terms-and-conditions')}
                                            className="link-button"
                                        >
                                            Terms and Conditions
                                        </button>
                                        {' '}and{' '}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/page/privacy-policy')}
                                            className="link-button"
                                        >
                                            Privacy Policy
                                        </button>
                                        , and consent to receive communications regarding your account, promotions, and other updates.
                                    </span>
                                </label>
                            </div>

                            <button type="submit" disabled={loading} className="btn-book">
                                {loading ? 'Submitting...' : 'BOOK A TABLE'}
                            </button>
                        </form>
                    </div>

                    {/* Right Section - Contact Info */}
                    <div className="booking-info-section">
                        <h2 className="info-title">Contact Us</h2>
                        
                        <div className="info-item">
                            <h3 className="info-label">Booking Request</h3>
                            <a href={`tel:${settings?.contact_phone}`} className="info-value">
                                {settings?.contact_phone || '+44 787 8277198'}
                            </a>
                        </div>

                        <div className="info-item">
                            <h3 className="info-label">Location</h3>
                            <p className="info-value">
                                {settings?.contact_address || '169 West Rd, Newcastle upon Tyne NE15 6PQ'}
                            </p>
                        </div>

                        <div className="info-item">
                            <h3 className="info-label">Opening Hours</h3>
                            {weekdays.length > 0 && weekdays.every(w => w.time === weekdays[0].time) ? (
                                <div className="hours-group">
                                    <p className="hours-days">Monday - Friday</p>
                                    <p className="hours-time">{weekdays[0].time}</p>
                                </div>
                            ) : (
                                weekdays.map((hour, idx) => (
                                    <div key={idx} className="hours-group">
                                        <p className="hours-days">{hour.day}</p>
                                        <p className="hours-time">{hour.time}</p>
                                    </div>
                                ))
                            )}
                            
                            {weekend.map((hour, idx) => (
                                <div key={idx} className="hours-group">
                                    <p className="hours-days">{hour.day}</p>
                                    <p className="hours-time">{hour.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <WhatsAppButton phone={settings?.contact_phone || '876543219'} />
        </div>
    );
}

export default BookingPage;

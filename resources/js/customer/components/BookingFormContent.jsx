import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookingFormContent.css';
import { API_BASE_URL } from '../../config/api';

function BookingFormContent() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
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
    }, []);

    useEffect(() => {
        if (formData.booking_date) {
            calculateAvailableTimeSlots(formData.booking_date);
        }
    }, [formData.booking_date, settings]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/settings');
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
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
            const response = await axios.post('/table-bookings', formData);
            
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
        <div className="booking-content-wrapper">
            <div className="booking-content-container">
                {/* Left Section - Form */}
                <div className="booking-content-form-section">
                    <h1 className="booking-content-title">Request Callback</h1>
                    <p className="booking-content-subtitle">
                        Booking request{' '}
                        <a href={`tel:${settings?.contact_phone}`} className="booking-phone-link">
                            {settings?.contact_phone || '+44 787 8277198'}
                        </a>
                        {' '}or fill out the order form for a callback
                    </p>

                    {message && (
                        <div className={`booking-alert ${message.includes('success') ? 'booking-alert-success' : 'booking-alert-error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="booking-content-form">
                        <div className="booking-form-group">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Name"
                                required
                                className="booking-form-input"
                            />
                        </div>

                        <div className="booking-form-row">
                            <select
                                value={formData.country_code}
                                onChange={(e) => handleChange('country_code', e.target.value)}
                                className="booking-form-select booking-country-code"
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
                                className="booking-form-input booking-phone-input"
                            />
                        </div>

                        <div className="booking-form-row">
                            <select
                                value={formData.num_persons}
                                onChange={(e) => handleChange('num_persons', e.target.value)}
                                className="booking-form-select"
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
                                className="booking-form-input"
                            />

                            <select
                                value={formData.booking_time}
                                onChange={(e) => handleChange('booking_time', e.target.value)}
                                className="booking-form-select"
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

                        <div className="booking-form-group">
                            <textarea
                                value={formData.message}
                                onChange={(e) => handleChange('message', e.target.value)}
                                placeholder="Message"
                                rows="4"
                                className="booking-form-textarea"
                            />
                        </div>

                        <div className="booking-form-checkbox">
                            <label className="booking-checkbox-label">
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
                                        className="booking-link-button"
                                    >
                                        Terms and Conditions
                                    </button>
                                </span>
                            </label>
                        </div>

                        <div className="booking-form-checkbox">
                            <label className="booking-checkbox-label">
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
                                        className="booking-link-button"
                                    >
                                        Terms and Conditions
                                    </button>
                                    {' '}and{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/page/privacy-policy')}
                                        className="booking-link-button"
                                    >
                                        Privacy Policy
                                    </button>
                                    , and consent to receive communications regarding your account, promotions, and other updates.
                                </span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading} className="booking-btn-book">
                            {loading ? 'Submitting...' : 'BOOK A TABLE'}
                        </button>
                    </form>
                </div>

                {/* Right Section - Contact Info */}
                <div className="booking-content-info-section">
                    <h2 className="booking-info-title">Contact Us</h2>
                    
                    <div className="booking-info-item">
                        <h3 className="booking-info-label">Booking Request</h3>
                        <a href={`tel:${settings?.contact_phone}`} className="booking-info-value">
                            {settings?.contact_phone || '+44 787 8277198'}
                        </a>
                    </div>

                    <div className="booking-info-item">
                        <h3 className="booking-info-label">Location</h3>
                        <p className="booking-info-value">
                            {settings?.contact_address || '169 West Rd, Newcastle upon Tyne NE15 6PQ'}
                        </p>
                    </div>

                    <div className="booking-info-item">
                        <h3 className="booking-info-label">Opening Hours</h3>
                        {weekdays.length > 0 && weekdays.every(w => w.time === weekdays[0].time) ? (
                            <div className="booking-hours-group">
                                <p className="booking-hours-days">Monday - Friday</p>
                                <p className="booking-hours-time">{weekdays[0].time}</p>
                            </div>
                        ) : (
                            weekdays.map((hour, idx) => (
                                <div key={idx} className="booking-hours-group">
                                    <p className="booking-hours-days">{hour.day}</p>
                                    <p className="booking-hours-time">{hour.time}</p>
                                </div>
                            ))
                        )}
                        
                        {weekend.map((hour, idx) => (
                            <div key={idx} className="booking-hours-group">
                                <p className="booking-hours-days">{hour.day}</p>
                                <p className="booking-hours-time">{hour.time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingFormContent;

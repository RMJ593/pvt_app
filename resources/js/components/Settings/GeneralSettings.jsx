import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

function GeneralSettings() {
    const [settings, setSettings] = useState({
        restaurant_name: '',
        restaurant_tagline: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        opening_hours: '',
        seo_description: '',
        seo_keywords: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            if (response.data.success) {
                setSettings(prevSettings => ({
                    ...prevSettings,
                    ...response.data.data
                }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({
            ...settings,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const response = await axios.post('/api/settings', settings);
            if (response.data.success) {
                setMessage('Settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleClearCache = async () => {
        try {
            const response = await axios.post('/api/clear-cache');
            if (response.data.success) {
                setMessage('Cache cleared successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
            setMessage('Failed to clear cache');
        }
    };

    if (loading) {
        return <div className="settings-container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="settings-container">
            <div className="page-header-simple">
                <h1>General Settings</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
                {/* Basic Information */}
                <div className="settings-section">
                    <h2>Basic Information</h2>
                    
                    <div className="form-group">
                        <label>Restaurant Name *</label>
                        <input
                            type="text"
                            name="restaurant_name"
                            value={settings.restaurant_name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Your Restaurant Name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Tagline</label>
                        <input
                            type="text"
                            name="restaurant_tagline"
                            value={settings.restaurant_tagline}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Delicious Food, Exceptional Service"
                        />
                    </div>

                    <div className="form-group">
                        <label>Opening Hours</label>
                        <textarea
                            name="opening_hours"
                            value={settings.opening_hours}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                            placeholder="Mon-Fri: 11:00 AM - 10:00 PM&#10;Sat-Sun: 10:00 AM - 11:00 PM"
                        />
                    </div>
                </div>

                {/* Contact Information */}
                <div className="settings-section">
                    <h2>Contact Information</h2>
                    
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="contact_email"
                            value={settings.contact_email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="info@restaurant.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="contact_phone"
                            value={settings.contact_phone}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="contact_address"
                            value={settings.contact_address}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                            placeholder="123 Main Street, City, Country"
                        />
                    </div>
                </div>

                {/* Social Media */}
                <div className="settings-section">
                    <h2>Social Media Links</h2>
                    
                    <div className="form-group">
                        <label>Facebook URL</label>
                        <input
                            type="url"
                            name="facebook_url"
                            value={settings.facebook_url}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="https://facebook.com/yourpage"
                        />
                    </div>

                    <div className="form-group">
                        <label>Twitter URL</label>
                        <input
                            type="url"
                            name="twitter_url"
                            value={settings.twitter_url}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="https://twitter.com/yourhandle"
                        />
                    </div>

                    <div className="form-group">
                        <label>Instagram URL</label>
                        <input
                            type="url"
                            name="instagram_url"
                            value={settings.instagram_url}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="https://instagram.com/yourpage"
                        />
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="settings-section">
                    <h2>SEO Settings</h2>
                    
                    <div className="form-group">
                        <label>Meta Description</label>
                        <textarea
                            name="seo_description"
                            value={settings.seo_description}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                            placeholder="A brief description of your restaurant for search engines"
                        />
                    </div>

                    <div className="form-group">
                        <label>Meta Keywords</label>
                        <input
                            type="text"
                            name="seo_keywords"
                            value={settings.seo_keywords}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="restaurant, food, dining, cuisine"
                        />
                    </div>
                </div>

                <div className="settings-actions">
                    <button type="submit" disabled={saving} className="btn-save">
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button type="button" onClick={handleClearCache} className="btn-cache">
                        Clear Cache
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GeneralSettings;


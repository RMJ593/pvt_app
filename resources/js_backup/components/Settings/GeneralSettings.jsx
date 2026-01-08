import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getStorageUrl } from '../../config/api';
import './GeneralSettings.css';

function GeneralSettings() {
    const [settings, setSettings] = useState({
        robots_txt: '',
        enable_popup_ad: false,
        popup_ad_image: null,
        popup_ad_url: '',
        default_image: null,
        show_open_times: true,
        open_time_message: '',
        shop_start_time: '08:00',
        shop_close_time: '22:00',
        show_first_time: false,
        first_time_message: '',
        first_start_time: '08:00',
        first_stop_time: '12:00',
        show_second_time: false,
        second_time_message: '',
        second_start_time: '17:00',
        second_stop_time: '22:00',
        booking_schedule: {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: []
        },
        special_off_days: [],
        first_name: '',
        first_value: '',
        second_name: '',
        second_value: '',
        third_name: '',
        third_value: '',
        fourth_name: '',
        fourth_value: '',
        recaptcha_enable: false,
        recaptcha_key: '',
        recaptcha_secret: '',
        head_code: '',
        footer_code: '',
        body_code: ''
    });

    // Store current image paths from server
    const [currentImages, setCurrentImages] = useState({
        popup_ad_image: null,
        default_image: null
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newOffDay, setNewOffDay] = useState('');

    // Store new uploaded files separately
    const [uploadFiles, setUploadFiles] = useState({
        popup_ad_image: null,
        default_image: null
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            if (response.data.success) {
                const data = response.data.data;
                setSettings({
                    robots_txt: data.robots_txt || '',
                    enable_popup_ad: data.enable_popup_ad || false,
                    popup_ad_image: data.popup_ad_image || null,
                    popup_ad_url: data.popup_ad_url || '',
                    default_image: data.default_image || null,
                    show_open_times: data.show_open_times ?? true,
                    open_time_message: data.open_time_message || '',
                    shop_start_time: data.shop_start_time || '08:00',
                    shop_close_time: data.shop_close_time || '22:00',
                    show_first_time: data.show_first_time || false,
                    first_time_message: data.first_time_message || '',
                    first_start_time: data.first_start_time || '08:00',
                    first_stop_time: data.first_stop_time || '12:00',
                    show_second_time: data.show_second_time || false,
                    second_time_message: data.second_time_message || '',
                    second_start_time: data.second_start_time || '17:00',
                    second_stop_time: data.second_stop_time || '22:00',
                    booking_schedule: (() => {
                        try {
                            if (typeof data.booking_schedule === 'string') {
                                return JSON.parse(data.booking_schedule);
                            }
                            if (typeof data.booking_schedule === 'object' && data.booking_schedule !== null) {
                                return data.booking_schedule;
                            }
                        } catch (e) {
                            console.error('Failed to parse booking_schedule:', e);
                        }
                        return {
                            sunday: [],
                            monday: [],
                            tuesday: [],
                            wednesday: [],
                            thursday: [],
                            friday: [],
                            saturday: []
                        };
                    })(),
                    special_off_days: Array.isArray(data.special_off_days) 
                        ? data.special_off_days 
                        : (data.special_off_days ? JSON.parse(data.special_off_days) : []),
                    first_name: data.first_name || '',
                    first_value: data.first_value || '',
                    second_name: data.second_name || '',
                    second_value: data.second_value || '',
                    third_name: data.third_name || '',
                    third_value: data.third_value || '',
                    fourth_name: data.fourth_name || '',
                    fourth_value: data.fourth_value || '',
                    recaptcha_enable: data.recaptcha_enable || false,
                    recaptcha_key: data.recaptcha_key || '',
                    recaptcha_secret: data.recaptcha_secret || '',
                    head_code: data.head_code || '',
                    footer_code: data.footer_code || '',
                    body_code: data.body_code || ''
                });

                // Store current image paths
                setCurrentImages({
                    popup_ad_image: data.popup_ad_image,
                    default_image: data.default_image
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleChange = (field, value) => {
        setSettings({
            ...settings,
            [field]: value
        });
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage('Image size should not exceed 5MB');
                return;
            }

            // Store the file for upload
            setUploadFiles({
                ...uploadFiles,
                [field]: file
            });

            setMessage('');
        }
    };

    const generateTimeSlots = (start, end) => {
        if (!start || !end) return [];
        
        const slots = [];
        const startHour = parseInt(start.split(':')[0]);
        const endHour = parseInt(end.split(':')[0]);
        
        for (let hour = startHour; hour <= endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < endHour) {
                slots.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        return slots;
    };

    const handleTimeSlotToggle = (day, time) => {
        const currentSlots = settings.booking_schedule[day] || [];
        const newSlots = currentSlots.includes(time)
            ? currentSlots.filter(t => t !== time)
            : [...currentSlots, time].sort();
        
        setSettings({
            ...settings,
            booking_schedule: {
                ...settings.booking_schedule,
                [day]: newSlots
            }
        });
    };

    const addOffDay = () => {
        if (newOffDay && !settings.special_off_days.includes(newOffDay)) {
            setSettings({
                ...settings,
                special_off_days: [...settings.special_off_days, newOffDay].sort()
            });
            setNewOffDay('');
        }
    };

    const removeOffDay = (day) => {
        setSettings({
            ...settings,
            special_off_days: settings.special_off_days.filter(d => d !== day)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            
            // Add all text/boolean fields
            Object.keys(settings).forEach(key => {
                if (key === 'popup_ad_image' || key === 'default_image') {
                    // Skip image fields - we'll handle them separately
                    return;
                }
                
                if (typeof settings[key] === 'object') {
                    formData.append(key, JSON.stringify(settings[key]));
                } else {
                    formData.append(key, settings[key] || '');
                }
            });

            // Add new uploaded files
            if (uploadFiles.popup_ad_image) {
                formData.append('popup_ad_image', uploadFiles.popup_ad_image);
            }
            if (uploadFiles.default_image) {
                formData.append('default_image', uploadFiles.default_image);
            }

            const response = await axios.post('/api/settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                setMessage('Settings updated successfully!');
                fetchSettings();
                // Clear upload files
                setUploadFiles({
                    popup_ad_image: null,
                    default_image: null
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage('Failed to update settings: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const timeSlots = generateTimeSlots(settings.shop_start_time, settings.shop_close_time);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    return (
        <div className="general-settings-container">
            <div className="settings-header">
                <h1>General Settings</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
                {/* Basic Settings */}
                <div className="settings-section">
                    <h2 className="section-title">Basic Settings</h2>
                    
                    <div className="form-group">
                        <label>Robots.txt</label>
                        <textarea
                            value={settings.robots_txt}
                            onChange={(e) => handleChange('robots_txt', e.target.value)}
                            className="form-control"
                            rows="6"
                            placeholder="User-agent: *&#10;Disallow: /admin/"
                        />
                    </div>
                </div>

                {/* Popup Advertisement */}
                <div className="settings-section">
                    <h2 className="section-title">Popup Advertisement</h2>
                    
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Enable Popup Advertisement</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.enable_popup_ad}
                                    onChange={(e) => handleChange('enable_popup_ad', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Popup Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'popup_ad_image')}
                            className="form-control-file"
                        />
                        {currentImages.popup_ad_image && !uploadFiles.popup_ad_image && (
                            <div className="current-image-preview">
                                <img 
                                    src={getStorageUrl(currentImages.popup_ad_image)} 
                                    alt="Current popup" 
                                    style={{maxWidth: '200px', marginTop: '10px'}}
                                />
                                <small>Current image</small>
                            </div>
                        )}
                        {uploadFiles.popup_ad_image && (
                            <small style={{color: 'green', display: 'block', marginTop: '5px'}}>
                                ✓ New image selected: {uploadFiles.popup_ad_image.name}
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Pop Up Advertisement URL</label>
                        <input
                            type="url"
                            value={settings.popup_ad_url}
                            onChange={(e) => handleChange('popup_ad_url', e.target.value)}
                            className="form-control"
                            placeholder="https://example.com"
                        />
                    </div>
                </div>

                {/* Default Image - FOR PAGE HEADERS */}
                <div className="settings-section">
                    <h2 className="section-title">Default Image (Page Headers Background)</h2>
                    <p className="section-description">
                        This image is used as the background for page headers (About page hero section, Menu page header, etc.)
                    </p>
                    
                    <div className="form-group">
                        <label>Default Image *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'default_image')}
                            className="form-control-file"
                        />
                        <small className="form-text">
                            Recommended: 1920x600px, landscape image. Used for About page hero and other page headers.
                        </small>
                        
                        {currentImages.default_image && !uploadFiles.default_image && (
                            <div className="current-image-preview">
                                <img 
                                    src={getStorageUrl(currentImages.default_image)} 
                                    alt="Current default" 
                                    style={{maxWidth: '400px', marginTop: '10px', borderRadius: '8px'}}
                                />
                                <small style={{display: 'block', marginTop: '5px'}}>Current default image</small>
                            </div>
                        )}
                        {uploadFiles.default_image && (
                            <small style={{color: 'green', display: 'block', marginTop: '5px'}}>
                                ✓ New image selected: {uploadFiles.default_image.name}
                            </small>
                        )}
                    </div>
                </div>

                {/* Rest of the sections remain the same */}
                {/* Timings */}
                <div className="settings-section">
                    <h2 className="section-title">Timings</h2>
                    
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Show Open Times</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.show_open_times}
                                    onChange={(e) => handleChange('show_open_times', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Open Time Message</label>
                            <input
                                type="text"
                                value={settings.open_time_message}
                                onChange={(e) => handleChange('open_time_message', e.target.value)}
                                className="form-control"
                                placeholder="We are open!"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Shop Start Time</label>
                            <input
                                type="time"
                                value={settings.shop_start_time}
                                onChange={(e) => handleChange('shop_start_time', e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Shop Close Time</label>
                            <input
                                type="time"
                                value={settings.shop_close_time}
                                onChange={(e) => handleChange('shop_close_time', e.target.value)}
                                className="form-control"
                            />
                        </div>
                    </div>

                    {/* First Time Slot */}
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Show First Time</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.show_first_time}
                                    onChange={(e) => handleChange('show_first_time', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>

                    {settings.show_first_time && (
                        <>
                            <div className="form-group">
                                <label>First Time Message</label>
                                <input
                                    type="text"
                                    value={settings.first_time_message}
                                    onChange={(e) => handleChange('first_time_message', e.target.value)}
                                    className="form-control"
                                    placeholder="Morning hours"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>First Start Time</label>
                                    <input
                                        type="time"
                                        value={settings.first_start_time}
                                        onChange={(e) => handleChange('first_start_time', e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group half-width">
                                    <label>First Stop Time</label>
                                    <input
                                        type="time"
                                        value={settings.first_stop_time}
                                        onChange={(e) => handleChange('first_stop_time', e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Second Time Slot */}
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Show Second Time</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.show_second_time}
                                    onChange={(e) => handleChange('show_second_time', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>

                    {settings.show_second_time && (
                        <>
                            <div className="form-group">
                                <label>Second Time Message</label>
                                <input
                                    type="text"
                                    value={settings.second_time_message}
                                    onChange={(e) => handleChange('second_time_message', e.target.value)}
                                    className="form-control"
                                    placeholder="Evening hours"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>Second Start Time</label>
                                    <input
                                        type="time"
                                        value={settings.second_start_time}
                                        onChange={(e) => handleChange('second_start_time', e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group half-width">
                                    <label>Second Stop Time</label>
                                    <input
                                        type="time"
                                        value={settings.second_stop_time}
                                        onChange={(e) => handleChange('second_stop_time', e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Booking Schedule - keeping it short in the artifact */}
                <div className="settings-section">
                    <h2 className="section-title">Booking Schedule</h2>
                    
                    {days.map((day) => (
                        <div key={day} className="booking-day">
                            <h3 className="day-title">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                            <div className="time-slots">
                                {timeSlots.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        className={`time-slot ${settings.booking_schedule[day]?.includes(time) ? 'active' : ''}`}
                                        onClick={() => handleTimeSlotToggle(day, time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Special Off Days */}
                <div className="settings-section">
                    <h2 className="section-title">Special Off Days</h2>
                    
                    <div className="off-day-input">
                        <input
                            type="date"
                            value={newOffDay}
                            onChange={(e) => setNewOffDay(e.target.value)}
                            className="form-control"
                        />
                        <button type="button" onClick={addOffDay} className="btn-add">
                            Add
                        </button>
                    </div>

                    <div className="off-days-list">
                        {settings.special_off_days.map((day) => (
                            <div key={day} className="off-day-item">
                                <span>{day}</span>
                                <button type="button" onClick={() => removeOffDay(day)} className="btn-remove">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Custom Fields - Stats for About Page */}
                <div className="settings-section">
                    <h2 className="section-title">Statistics (Displayed on About Page)</h2>
                    <p className="section-description">These values are shown in the statistics section on the About page</p>
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>First Stat Label</label>
                            <input
                                type="text"
                                value={settings.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                className="form-control"
                                placeholder="e.g., DAILY ORDERS"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>First Stat Value</label>
                            <input
                                type="text"
                                value={settings.first_value}
                                onChange={(e) => handleChange('first_value', e.target.value)}
                                className="form-control"
                                placeholder="e.g., 100"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Second Stat Label</label>
                            <input
                                type="text"
                                value={settings.second_name}
                                onChange={(e) => handleChange('second_name', e.target.value)}
                                className="form-control"
                                placeholder="e.g., SPECIAL DISHES"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Second Stat Value</label>
                            <input
                                type="text"
                                value={settings.second_value}
                                onChange={(e) => handleChange('second_value', e.target.value)}
                                className="form-control"
                                placeholder="e.g., 50"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Third Stat Label</label>
                            <input
                                type="text"
                                value={settings.third_name}
                                onChange={(e) => handleChange('third_name', e.target.value)}
                                className="form-control"
                                placeholder="e.g., EXPERT CHEFS"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Third Stat Value</label>
                            <input
                                type="text"
                                value={settings.third_value}
                                onChange={(e) => handleChange('third_value', e.target.value)}
                                className="form-control"
                                placeholder="e.g., 10"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Fourth Stat Label</label>
                            <input
                                type="text"
                                value={settings.fourth_name}
                                onChange={(e) => handleChange('fourth_name', e.target.value)}
                                className="form-control"
                                placeholder="e.g., AWARDS WON"
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Fourth Stat Value</label>
                            <input
                                type="text"
                                value={settings.fourth_value}
                                onChange={(e) => handleChange('fourth_value', e.target.value)}
                                className="form-control"
                                placeholder="e.g., 25"
                            />
                        </div>
                    </div>
                </div>

                {/* Google reCAPTCHA */}
                <div className="settings-section">
                    <h2 className="section-title">Google reCAPTCHA</h2>
                    
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <span>Google reCAPTCHA Enable</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.recaptcha_enable}
                                    onChange={(e) => handleChange('recaptcha_enable', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Google reCAPTCHA Key</label>
                        <input
                            type="text"
                            value={settings.recaptcha_key}
                            onChange={(e) => handleChange('recaptcha_key', e.target.value)}
                            className="form-control"
                            placeholder="Your reCAPTCHA site key"
                        />
                    </div>

                    <div className="form-group">
                        <label>Google reCAPTCHA Secret</label>
                        <input
                            type="text"
                            value={settings.recaptcha_secret}
                            onChange={(e) => handleChange('recaptcha_secret', e.target.value)}
                            className="form-control"
                            placeholder="Your reCAPTCHA secret key"
                        />
                    </div>
                </div>

                {/* Extended Code */}
                <div className="settings-section">
                    <h2 className="section-title">Extended Code</h2>
                    
                    <div className="form-group">
                        <label>Head Code <span className="text-muted">(Extended code for head tag)</span></label>
                        <textarea
                            value={settings.head_code}
                            onChange={(e) => handleChange('head_code', e.target.value)}
                            className="form-control code-textarea"
                            rows="8"
                            placeholder="<!-- Meta Pixel Code or other head scripts -->"
                        />
                    </div>

                    <div className="form-group">
                        <label>Body Code <span className="text-muted">(Extended code for body tag)</span></label>
                        <textarea
                            value={settings.body_code}
                            onChange={(e) => handleChange('body_code', e.target.value)}
                            className="form-control code-textarea"
                            rows="8"
                            placeholder="<!-- Body scripts -->"
                        />
                    </div>

                    <div className="form-group">
                        <label>Footer Code <span className="text-muted">(Extended code for bottom of body tag)</span></label>
                        <textarea
                            value={settings.footer_code}
                            onChange={(e) => handleChange('footer_code', e.target.value)}
                            className="form-control code-textarea"
                            rows="8"
                            placeholder="<!-- Footer scripts -->"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-update">
                        {loading ? 'Updating...' : 'Update Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GeneralSettings;
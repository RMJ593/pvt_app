import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DomainSettings.css';

function DomainSettings() {
    const [settings, setSettings] = useState({
        // Theme Style Colors
        main_color: '#e4e590',
        white_color: '#ffffff',
        color_one: '#a7a7a7',
        color_two: '#0e0d0b',
        color_three: '#699b653',
        color_four: '#171819',
        color_five: '#0c0d0c',
        color_six: '#1a1b1c',
        color_seven: '#151616',
        color_eight: '#121111',
        black_color: '#000000',
        text_color: '#ffffff',
        heading_color: '#ffffff',
        
        // Theme Content
        admin_emails: 'curryleaf.newcastle@gmail.com',
        short_about: 'Curry Leaf blends age-old Indian recipes with a fresh, modern twist. Every plate we serve is rooted in tradition and inspired by flavour.',
        contact_address: '169 West Rd, Newcastle upon Tyne NE15 6PQ',
        contact_phone: '+44 7878277198',
        contact_email: 'info@curryleaf.uk',
        meta_description: '',
        meta_keywords: '',
        
        // Images
        website_logo: null,
        meta_image: null,
        
        // Social Media
        facebook_url: 'https://www.facebook.com/curryleafofficial',
        twitter_url: '',
        instagram_url: 'https://www.instagram.com/curryleafofficial/',
        linkedin_url: '',
        youtube_url: 'https://www.youtube.com/@curryleafofficial',
        
        // Extension Code
        head_code: '',
        footer_code: '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/settings');
            if (response.data.success) {
                setSettings(response.data.data);
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
            // Store file for upload
            setSettings({
                ...settings,
                [field]: file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const formData = new FormData();
            
            // Append all settings
            Object.keys(settings).forEach(key => {
                if (settings[key] instanceof File) {
                    formData.append(key, settings[key]);
                } else {
                    formData.append(key, settings[key] || '');
                }
            });

            const response = await axios.post('http://127.0.0.1:8000/api/settings', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data.success) {
                setMessage('Settings updated successfully!');
            }
        } catch (error) {
            console.error('Update error:', error);
            setMessage('Failed to update settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="domain-settings-container">
            <div className="domain-settings-header">
                <h1>Domain Settings</h1>
            </div>

            {message && (
                <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="domain-settings-form">
                {/* THEME STYLE */}
                <div className="settings-section">
                    <h2 className="section-title">Theme Style</h2>
                    
                    <div className="color-grid">
                        <div className="color-item">
                            <label>Main:</label>
                            <div className="color-preview" style={{backgroundColor: settings.main_color}}></div>
                            <input
                                type="text"
                                value={settings.main_color}
                                onChange={(e) => handleChange('main_color', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>White:</label>
                            <div className="color-preview" style={{backgroundColor: settings.white_color}}></div>
                            <input
                                type="text"
                                value={settings.white_color}
                                onChange={(e) => handleChange('white_color', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color One:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_one}}></div>
                            <input
                                type="text"
                                value={settings.color_one}
                                onChange={(e) => handleChange('color_one', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color Two:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_two}}></div>
                            <input
                                type="text"
                                value={settings.color_two}
                                onChange={(e) => handleChange('color_two', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color Three:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_three}}></div>
                            <input
                                type="text"
                                value={settings.color_three}
                                onChange={(e) => handleChange('color_three', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color Four:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_four}}></div>
                            <input
                                type="text"
                                value={settings.color_four}
                                onChange={(e) => handleChange('color_four', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color Five:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_five}}></div>
                            <input
                                type="text"
                                value={settings.color_five}
                                onChange={(e) => handleChange('color_five', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color Six:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_six}}></div>
                            <input
                                type="text"
                                value={settings.color_six}
                                onChange={(e) => handleChange('color_six', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color Seven:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_seven}}></div>
                            <input
                                type="text"
                                value={settings.color_seven}
                                onChange={(e) => handleChange('color_seven', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Color Eight:</label>
                            <div className="color-preview" style={{backgroundColor: settings.color_eight}}></div>
                            <input
                                type="text"
                                value={settings.color_eight}
                                onChange={(e) => handleChange('color_eight', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Black:</label>
                            <div className="color-preview" style={{backgroundColor: settings.black_color}}></div>
                            <input
                                type="text"
                                value={settings.black_color}
                                onChange={(e) => handleChange('black_color', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Text Color:</label>
                            <div className="color-preview" style={{backgroundColor: settings.text_color}}></div>
                            <input
                                type="text"
                                value={settings.text_color}
                                onChange={(e) => handleChange('text_color', e.target.value)}
                                className="color-input"
                            />
                        </div>

                        <div className="color-item">
                            <label>Heading Color:</label>
                            <div className="color-preview" style={{backgroundColor: settings.heading_color}}></div>
                            <input
                                type="text"
                                value={settings.heading_color}
                                onChange={(e) => handleChange('heading_color', e.target.value)}
                                className="color-input"
                            />
                        </div>
                    </div>
                </div>

                {/* THEME CONTENT */}
                <div className="settings-section">
                    <h2 className="section-title">Theme Content</h2>
                    
                    <div className="form-group">
                        <label>Admin Emails to Receive User Responses <span className="text-muted">(add multiple by separating using comma)</span></label>
                        <input
                            type="text"
                            value={settings.admin_emails}
                            onChange={(e) => handleChange('admin_emails', e.target.value)}
                            className="form-control"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Short About Us</label>
                            <textarea
                                value={settings.short_about}
                                onChange={(e) => handleChange('short_about', e.target.value)}
                                className="form-control"
                                rows="4"
                            />
                        </div>

                        <div className="form-group half-width">
                            <label>Contact Address</label>
                            <textarea
                                value={settings.contact_address}
                                onChange={(e) => handleChange('contact_address', e.target.value)}
                                className="form-control"
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Contact Phone</label>
                            <input
                                type="text"
                                value={settings.contact_phone}
                                onChange={(e) => handleChange('contact_phone', e.target.value)}
                                className="form-control"
                            />
                        </div>

                        <div className="form-group half-width">
                            <label>Contact Email</label>
                            <input
                                type="email"
                                value={settings.contact_email}
                                onChange={(e) => handleChange('contact_email', e.target.value)}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Meta Description</label>
                            <textarea
                                value={settings.meta_description}
                                onChange={(e) => handleChange('meta_description', e.target.value)}
                                className="form-control"
                                rows="4"
                            />
                        </div>

                        <div className="form-group half-width">
                            <label>Meta Keywords <span className="text-muted">(Separate each keyword with a comma [,])</span></label>
                            <textarea
                                value={settings.meta_keywords}
                                onChange={(e) => handleChange('meta_keywords', e.target.value)}
                                className="form-control"
                                rows="4"
                            />
                        </div>
                    </div>
                </div>

                {/* IMAGES */}
                <div className="settings-section">
                    <h2 className="section-title">Images</h2>
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Website Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'website_logo')}
                                className="form-control-file"
                            />
                            <small className="form-text">Preferred dimension is 160px x 50px</small>
                            {settings.website_logo && (
                                <div className="image-preview">
                                    <img src={typeof settings.website_logo === 'string' ? settings.website_logo : URL.createObjectURL(settings.website_logo)} alt="Logo" />
                                </div>
                            )}
                        </div>

                        <div className="form-group half-width">
                            <label>Meta Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'meta_image')}
                                className="form-control-file"
                            />
                            <small className="form-text">Preferred dimension is 240px x 231px</small>
                            {settings.meta_image && (
                                <div className="image-preview">
                                    <img src={typeof settings.meta_image === 'string' ? settings.meta_image : URL.createObjectURL(settings.meta_image)} alt="Meta" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SOCIAL MEDIA PAGES */}
                <div className="settings-section">
                    <h2 className="section-title">Social Media Pages</h2>
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Facebook URL</label>
                            <input
                                type="url"
                                value={settings.facebook_url}
                                onChange={(e) => handleChange('facebook_url', e.target.value)}
                                className="form-control"
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>

                        <div className="form-group half-width">
                            <label>Twitter URL</label>
                            <input
                                type="url"
                                value={settings.twitter_url}
                                onChange={(e) => handleChange('twitter_url', e.target.value)}
                                className="form-control"
                                placeholder="https://twitter.com/yourpage"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Instagram URL</label>
                            <input
                                type="url"
                                value={settings.instagram_url}
                                onChange={(e) => handleChange('instagram_url', e.target.value)}
                                className="form-control"
                                placeholder="https://instagram.com/yourpage"
                            />
                        </div>

                        <div className="form-group half-width">
                            <label>LinkedIn URL</label>
                            <input
                                type="url"
                                value={settings.linkedin_url}
                                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                                className="form-control"
                                placeholder="https://linkedin.com/company/yourpage"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>YouTube URL</label>
                        <input
                            type="url"
                            value={settings.youtube_url}
                            onChange={(e) => handleChange('youtube_url', e.target.value)}
                            className="form-control"
                            placeholder="https://youtube.com/yourchannel"
                        />
                    </div>
                </div>

                {/* HOME PAGE EXTENDED CODE */}
                <div className="settings-section">
                    <h2 className="section-title">Home Page Extended Code</h2>
                    
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Head Code <span className="text-muted">(Extended code for head tag)</span></label>
                            <textarea
                                value={settings.head_code}
                                onChange={(e) => handleChange('head_code', e.target.value)}
                                className="form-control code-textarea"
                                rows="8"
                                placeholder="<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};"
                            />
                        </div>

                        <div className="form-group half-width">
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
                </div>

                {/* SUBMIT BUTTON */}
                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-update">
                        {loading ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DomainSettings;


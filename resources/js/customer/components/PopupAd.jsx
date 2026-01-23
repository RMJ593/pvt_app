// PopupAd.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getStorageUrl } from '../../config/api';
import { X } from 'lucide-react';
import './PopupAd.css';

function PopupAd() {
    const [showPopup, setShowPopup] = useState(false);
    const [adData, setAdData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdSettings();
    }, []);

    const fetchAdSettings = async () => {
        try {
            const response = await axios.get('/settings');
            if (response.data.success) {
                const settings = response.data.data;
                
                // Check if popup ad is enabled and has image
                if (settings.enable_popup_ad && settings.popup_ad_image) {
                    setAdData({
                        image: settings.popup_ad_image,
                        url: settings.popup_ad_url
                    });

                    // Check if user has closed the popup in this session
                    const popupClosed = sessionStorage.getItem('popup_ad_closed');
                    if (!popupClosed) {
                        // Show popup after a short delay (e.g., 2 seconds)
                        setTimeout(() => {
                            setShowPopup(true);
                        }, 2000);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching ad settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setShowPopup(false);
        // Store in session storage so it doesn't show again during this session
        sessionStorage.setItem('popup_ad_closed', 'true');
    };

    const handleAdClick = () => {
        if (adData?.url) {
            window.open(adData.url, '_blank');
        }
    };

    // Don't render anything if loading, no ad data, or popup is closed
    if (loading || !adData || !showPopup) {
        return null;
    }

    return (
        <div className="popup-ad-overlay" onClick={handleClose}>
            <div className="popup-ad-container" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close-btn" onClick={handleClose}>
                    <X size={24} />
                </button>
                
                <div 
                    className="popup-ad-content"
                    onClick={handleAdClick}
                    style={{ cursor: adData.url ? 'pointer' : 'default' }}
                >
                    <img 
                        src={getStorageUrl(adData.image)} 
                        alt="Advertisement" 
                        className="popup-ad-image"
                    />
                </div>
            </div>
        </div>
    );
}

export default PopupAd;
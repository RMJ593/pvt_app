import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PageView.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function PageView() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(location.state?.page || null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(!page);

    useEffect(() => {
        fetchSettings();
        if (!page) {
            fetchPageBySlug();
        }
    }, [slug]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/settings');
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

    const fetchPageBySlug = async () => {
        try {
            const response = await axios.get('/pages');
            const allPages = extractArray(response);
            const foundPage = allPages.find(p => p.slug === slug);
            
            if (foundPage) {
                setPage(foundPage);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error fetching page:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // Use default_image from General Settings instead of page banner
    const getBannerUrl = () => {
        if (!settings?.default_image) return null;
        if (settings.default_image.startsWith('http')) return settings.default_image;
        return `${API_BASE_URL}/storage/${settings.default_image}`;
    };

    if (loading) {
        return (
            <div className="page-view">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (!page) {
        return null;
    }

    return (
        <div className="page-view">
            {/* Banner Section with Default Image from General Settings */}
            <section className="page-banner">
                {getBannerUrl() ? (
                    <img src={getBannerUrl()} alt={page.page_title} className="banner-image" />
                ) : (
                    <div className="banner-placeholder"></div>
                )}
                
                <div className="banner-overlay"></div>
                
                <div className="banner-content">
                    {page.small_heading && (
                        <p className="page-subtitle">{page.small_heading}</p>
                    )}
                    
                    <div className="page-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="page-main-title">{page.page_title || page.title}</h1>

                    <button className="back-home-btn" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>
            </section>

            {/* Content Section */}
            {page.content && (
                <section className="page-content-section">
                    <div className="page-content-container">
                        <div 
                            className="page-content"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    </div>
                </section>
            )}
        </div>
    );
}

export default PageView;
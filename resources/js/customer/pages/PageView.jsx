import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PageView.css';
import { API_BASE_URL, getStorageUrl } from '../../config/api';

function PageView() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [page, setPage] = useState(location.state?.page || null);
    const [loading, setLoading] = useState(!page);

    
    useEffect(() => {
        if (!page) {
            fetchPageBySlug();
        }
    }, [slug]);

    const fetchPageBySlug = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pages`);
            const allPages = response.data.data || response.data;
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

    const getBannerUrl = () => {
        if (!page?.banner_image) return null;
        if (page.banner_image.startsWith('http')) return page.banner_image;
        return `http://127.0.0.1:8000/storage/${page.banner_image}`;
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
            {/* Banner Section */}
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
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import './BlogDetailPage.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';


function BlogDetailPage() {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [settings, setSettings] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

   
    useEffect(() => {
        fetchSettings();
        fetchMenuItems();
        fetchBlog();
    }, [id, slug]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`/settings`);
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
            const response = await axios.get(`/menu-links`);
            const items = extractArray(response);
            setMenuItems(items.filter(item => item.link_type === 'nav_link' && item.is_active));
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]);
        }
    };
    const fetchBlog = async () => {
        try {
            let endpoint;
            if (slug) {
                // Try slug-based endpoint first
                endpoint = `/api/blogs?slug=${slug}`;
            } else {
                endpoint = `/api/blogs/${id}`;
            }
            
            const response = await axios.get(endpoint);
            console.log('Raw API response:', response.data);
            
            let blogData = response.data.data || response.data;
            
            // If data is an array, get the first item
            if (Array.isArray(blogData)) {
                blogData = blogData[0];
            }
            
            console.log('Processed blog data:', blogData);
            setBlog(blogData);
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
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

    const getLogoUrl = () => {
        const logoPath = settings?.website_logo || settings?.logo;
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return `http://127.0.0.1:8000/storage/${logoPath}`;
    };

    const getBannerImageUrl = () => {
        console.log('Blog banner_image:', blog?.banner_image); // Debug
        console.log('Blog image:', blog?.image); // Debug
        
        const bannerPath = blog?.banner_image || blog?.image;
        if (!bannerPath) return null;
        if (bannerPath.startsWith('http')) return bannerPath;
        return `http://127.0.0.1:8000/storage/${bannerPath}`;
    };

    const getCategoryName = (category) => {
        if (!category) return '';
        return typeof category === 'object' ? category.name : category;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    if (loading) {
        return (
            <div className="blog-detail-wrapper">
                <TopBar settings={settings} />
                <div className="loading-container">
                    <p>Loading blog...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="blog-detail-wrapper">
                <TopBar settings={settings} />
                <div className="error-container">
                    <h2>Blog not found</h2>
                    <button onClick={() => navigate('/')} className="back-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-detail-wrapper">
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

            {/* Hero Section with Banner Image */}
            <section className="blog-hero-section">
                {getBannerImageUrl() && (
                    <div 
                        className="blog-hero-image"
                        style={{ backgroundImage: `url(${getBannerImageUrl()})` }}
                    />
                )}
                
                <div className="blog-hero-overlay"></div>

                <div className="blog-hero-content">
                    <p className="blog-hero-subtitle">BLOG</p>
                    
                    <div className="divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="blog-hero-title">{blog.title}</h1>
                </div>
            </section>

            {/* Blog Content Section */}
            <section className="blog-content-section">
                <div className="blog-content-container">
                    {/* Category and Meta */}
                    <div className="blog-meta">
                        {(blog.category || blog.blog_category) && (
                            <span className="blog-meta-category">
                                {getCategoryName(blog.category || blog.blog_category)}
                            </span>
                        )}
                        
                        {blog.created_at && (
                            <span className="blog-meta-date">
                                {formatDate(blog.created_at)}
                            </span>
                        )}
                    </div>

                    {/* Blog Content */}
                    {blog.content && (
                        <div 
                            className="blog-content-text"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    )}
                    
                    {!blog.content && blog.small_description && (
                        <div className="blog-content-text">
                            <p>{blog.small_description}</p>
                        </div>
                    )}

                    {/* Author Info if available */}
                    {blog.author && (
                        <div className="blog-author">
                            <p>Written by <strong>{blog.author}</strong></p>
                        </div>
                    )}

                    {/* Back Button */}
                    <div className="blog-actions">
                        <button onClick={() => navigate('/')} className="btn-back-home">
                            BACK TO HOME
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
            <WhatsAppButton phone={settings?.contact_phone || '876543219'} />
        </div>
    );
}

export default BlogDetailPage;

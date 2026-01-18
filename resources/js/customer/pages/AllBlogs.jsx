import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import './AllBlogs.css';
import { getStorageUrl, extractArray } from '../../config/api';

function AllBlogs() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchSettings();
        fetchMenuItems();
        fetchBlogs();
        fetchCategories();
    }, []);

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

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('/menu-links');
            const items = extractArray(response);
            setMenuItems(items.filter(item => item.link_type === 'nav_link' && item.is_active));
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]);
        }
    };

    const fetchBlogs = async () => {
        try {
            const response = await axios.get('/blogs');
            const allBlogs = extractArray(response);
            
            const activeBlogs = allBlogs
                .filter(blog => blog.is_active || blog.status === 'published')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setBlogs(activeBlogs);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/blog-categories');
            const cats = extractArray(response);
            setCategories(cats);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
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
        return getStorageUrl(settings.default_image);
    };

    const getLogoUrl = () => {
        const logoPath = settings?.website_logo || settings?.logo;
        if (!logoPath) return null;
        if (logoPath.startsWith('http')) return logoPath;
        return getStorageUrl(logoPath);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return getStorageUrl(imagePath);
    };

    const handleViewBlog = (blogId, blogSlug) => {
        if (blogSlug) {
            navigate(`/blog/${blogSlug}`);
        } else {
            navigate(`/blog/${blogId}`);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options).replace(/ /g, ' ');
    };

    const getCategoryName = (category) => {
        if (!category) return '';
        return typeof category === 'object' ? category.name : category;
    };

    const truncateText = (text, maxLength = 120) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const filteredBlogs = selectedCategory === 'all' 
        ? blogs 
        : blogs.filter(blog => {
            const categoryId = typeof blog.category === 'object' ? blog.category.id : blog.category_id;
            return categoryId === parseInt(selectedCategory);
        });

    return (
        <div className="all-blogs-page-wrapper">
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
                            <h1>{settings?.site_name || 'Restaurant'}</h1>
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
            <section className="all-blogs-hero-section">
                {getDefaultImageUrl() && (
                    <div 
                        className="all-blogs-hero-image"
                        style={{ backgroundImage: `url(${getDefaultImageUrl()})` }}
                    />
                )}
                
                <div className="all-blogs-hero-overlay"></div>

                <div className="all-blogs-hero-content">
                    <p className="all-blogs-hero-subtitle">FOOD BLOGS</p>
                    
                    <div className="divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h1 className="all-blogs-hero-title">Our Blogs</h1>
                </div>
            </section>

            {/* Blog Listing Section */}
            <div className="all-blogs-content">
                <div className="all-blogs-container">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="blog-categories-filter">
                            <button 
                                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                All Blogs
                            </button>
                            {categories.map(category => (
                                <button 
                                    key={category.id}
                                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <p className="loading-text">Loading blogs...</p>
                    ) : filteredBlogs.length === 0 ? (
                        <p className="no-blogs-text">No blogs available</p>
                    ) : (
                        <div className="all-blogs-grid">
                            {filteredBlogs.map((blog) => {
                                const imageUrl = getImageUrl(blog.image);
                                
                                return (
                                    <div 
                                        key={blog.id} 
                                        className="all-blog-card"
                                        onClick={() => handleViewBlog(blog.id, blog.slug)}
                                    >
                                        <div className="blog-ornament top-ornament"></div>

                                        <div className="all-blog-image-wrapper">
                                            {blog.created_at && (
                                                <div className="all-blog-date">
                                                    {formatDate(blog.created_at)}
                                                </div>
                                            )}
                                            
                                            {imageUrl ? (
                                                <img 
                                                    src={imageUrl} 
                                                    alt={blog.title || 'Blog image'}
                                                    className="all-blog-image"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.querySelector('.all-blog-image-placeholder').style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            
                                            <div className="all-blog-image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                    <path d="M21 15l-5-5L5 21"/>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="blog-ornament bottom-ornament"></div>

                                        <div className="all-blog-content">
                                            {(blog.category || blog.blog_category) && (
                                                <span className="all-blog-category">
                                                    {getCategoryName(blog.category || blog.blog_category)}
                                                </span>
                                            )}
                                            
                                            <h3 className="all-blog-title-text">{blog.title}</h3>
                                            
                                            {(blog.excerpt || blog.small_description) && (
                                                <p className="all-blog-excerpt">
                                                    {truncateText(blog.excerpt || blog.small_description)}
                                                </p>
                                            )}
                                        </div>

                                        <button className="all-read-more-btn">
                                            READ MORE
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
            <WhatsAppButton phone={settings?.contact_phone || '876543219'} />
        </div>
    );
}

export default AllBlogs;
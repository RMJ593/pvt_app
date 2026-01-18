import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import './BlogDetail.css';
import { getStorageUrl, extractArray } from '../../config/api';

function BlogDetail() {
    const navigate = useNavigate();
    const { slug, id } = useParams();
    const [settings, setSettings] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
        fetchMenuItems();
        fetchBlog();
    }, [slug, id]);

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

    const fetchBlog = async () => {
        try {
            const endpoint = slug ? `/blogs/${slug}` : `/blogs/${id}`;
            const response = await axios.get(endpoint);
            const blogData = response.data.data || response.data;
            setBlog(blogData);
            
            // Fetch related blogs from same category
            if (blogData.category_id) {
                fetchRelatedBlogs(blogData.category_id, blogData.id);
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            navigate('/blogs');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedBlogs = async (categoryId, currentBlogId) => {
        try {
            const response = await axios.get('/blogs');
            const allBlogs = extractArray(response);
            
            const related = allBlogs
                .filter(b => {
                    const blogCategoryId = typeof b.category === 'object' ? b.category.id : b.category_id;
                    return blogCategoryId === categoryId && 
                           b.id !== currentBlogId && 
                           (b.is_active || b.status === 'published');
                })
                .slice(0, 3);
            
            setRelatedBlogs(related);
        } catch (error) {
            console.error('Error fetching related blogs:', error);
            setRelatedBlogs([]);
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
        return getStorageUrl(logoPath);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return getStorageUrl(imagePath);
    };

    const getBannerUrl = () => {
        const bannerPath = blog?.banner_image || settings?.default_image;
        if (!bannerPath) return null;
        if (bannerPath.startsWith('http')) return bannerPath;
        return getStorageUrl(bannerPath);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const getCategoryName = (category) => {
        if (!category) return '';
        return typeof category === 'object' ? category.name : category;
    };

    const handleViewBlog = (blogId, blogSlug) => {
        if (blogSlug) {
            navigate(`/blog/${blogSlug}`);
        } else {
            navigate(`/blog/${blogId}`);
        }
        window.scrollTo(0, 0);
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="blog-detail-loading">
                <p>Loading blog...</p>
            </div>
        );
    }

    if (!blog) {
        return null;
    }

    return (
        <div className="blog-detail-page-wrapper">
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
                        onClick={() => navigate('/blogs')} 
                        className="find-table-btn"
                    >
                        BACK TO BLOGS
                    </button>
                </div>
            </nav>

            {/* Hero/Banner Section */}
            <section className="blog-detail-hero-section">
                {getBannerUrl() && (
                    <div 
                        className="blog-detail-hero-image"
                        style={{ backgroundImage: `url(${getBannerUrl()})` }}
                    />
                )}
                
                <div className="blog-detail-hero-overlay"></div>

                <div className="blog-detail-hero-content">
                    {(blog.category || blog.blog_category) && (
                        <span className="blog-detail-category">
                            {getCategoryName(blog.category || blog.blog_category)}
                        </span>
                    )}
                    
                    <h1 className="blog-detail-hero-title">{blog.title}</h1>
                    
                    <div className="blog-detail-meta">
                        <span className="blog-detail-date">
                            {formatDate(blog.created_at)}
                        </span>
                        {blog.author && (
                            <>
                                <span className="meta-separator">•</span>
                                <span className="blog-detail-author">By {blog.author}</span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="blog-detail-content-wrapper">
                <div className="blog-detail-container">
                    <article className="blog-detail-article">
                        {/* Featured Image */}
                        {blog.image && (
                            <div className="blog-detail-featured-image">
                                <img 
                                    src={getImageUrl(blog.image)} 
                                    alt={blog.title}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Small Description */}
                        {blog.small_description && (
                            <div className="blog-detail-intro">
                                <p>{blog.small_description}</p>
                            </div>
                        )}

                        {/* Main Content */}
                        <div 
                            className="blog-detail-body"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        {/* Tags */}
                        {blog.tags && (
                            <div className="blog-detail-tags">
                                <h3>Tags:</h3>
                                <div className="tags-list">
                                    {blog.tags.split(',').map((tag, index) => (
                                        <span key={index} className="tag">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    {/* Related Blogs */}
                    {relatedBlogs.length > 0 && (
                        <section className="related-blogs-section">
                            <h2 className="related-blogs-title">Related Blogs</h2>
                            
                            <div className="related-blogs-grid">
                                {relatedBlogs.map((relatedBlog) => {
                                    const imageUrl = getImageUrl(relatedBlog.image);
                                    
                                    return (
                                        <div 
                                            key={relatedBlog.id} 
                                            className="related-blog-card"
                                            onClick={() => handleViewBlog(relatedBlog.id, relatedBlog.slug)}
                                        >
                                            <div className="related-blog-image-wrapper">
                                                {imageUrl ? (
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={relatedBlog.title}
                                                        className="related-blog-image"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="related-blog-placeholder">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                                            <path d="M21 15l-5-5L5 21"/>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="related-blog-content">
                                                <h3>{relatedBlog.title}</h3>
                                                <p>{truncateText(relatedBlog.small_description)}</p>
                                                <span className="related-blog-date">
                                                    {formatDate(relatedBlog.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <Footer />
            <WhatsAppButton phone={settings?.contact_phone || '876543219'} />
        </div>
    );
}

export default BlogDetail;
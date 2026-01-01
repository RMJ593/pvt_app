import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BlogsSection.css';
import { API_BASE_URL, getStorageUrl } from '../../config/api';

function BlogsSection() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/blogs`);
            const allBlogs = response.data.data || response.data || [];
            
            // Filter active blogs and get latest 6
            const activeBlogs = allBlogs
                .filter(blog => blog.is_active || blog.status === 'published')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 6);
            
            setBlogs(activeBlogs);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewBlog = (blogId, blogSlug) => {
        // Navigate to individual blog page
        if (blogSlug) {
            navigate(`/blog/${blogSlug}`);
        } else {
            navigate(`/blog/${blogId}`);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return getStorageUrl(imagePath);
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

    if (loading) {
        return (
            <section id="blogs" className="blogs-section">
                <div className="blogs-container">
                    <p>Loading blogs...</p>
                </div>
            </section>
        );
    }

    if (blogs.length === 0) {
        return null;
    }

    return (
        <section id="blogs" className="blogs-section">
            <div className="blogs-container">
                <p className="blogs-subtitle">FOOD BLOGS</p>
                
                <div className="blogs-divider">
                    <span>◆</span>
                    <span>◆</span>
                    <span>◆</span>
                </div>

                <h2 className="blogs-title">Latest Blogs</h2>

                <div className="blogs-grid">
                    {blogs.map((blog) => (
                        <div 
                            key={blog.id} 
                            className="blog-card"
                            onClick={() => handleViewBlog(blog.id, blog.slug)}
                        >
                            <div className="blog-ornament top-ornament"></div>

                            <div className="blog-image-wrapper">
                                {blog.created_at && (
                                    <div className="blog-date">
                                        {formatDate(blog.created_at)}
                                    </div>
                                )}
                                
                                {blog.image ? (
                                    <img 
                                        src={getImageUrl(blog.image)} 
                                        alt={blog.title}
                                        className="blog-image"
                                    />
                                ) : (
                                    <div className="blog-image-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <path d="M21 15l-5-5L5 21"/>
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="blog-ornament bottom-ornament"></div>

                            <div className="blog-content">
                                {(blog.category || blog.blog_category) && (
                                    <span className="blog-category">
                                        {getCategoryName(blog.category || blog.blog_category)}
                                    </span>
                                )}
                                
                                <h3 className="blog-title-text">{blog.title}</h3>
                                
                                {blog.excerpt && (
                                    <p className="blog-excerpt">{blog.excerpt}</p>
                                )}
                            </div>

                            <button className="read-more-btn">
                                READ MORE
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default BlogsSection;
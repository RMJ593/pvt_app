import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function PageForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        page_title: '',
        small_heading: '',
        title: '',
        slug: '',
        location: '',
        hero_banner_id: '',
        banner_image: null,
        content: '',
        seo_title: '',
        meta_keywords: '',
        meta_description: '',
        robots: 'index,follow',
        og_type: 'website',
        meta_image: null
    });

    const [heroBanners, setHeroBanners] = useState([]);
    const [bannerPreview, setBannerPreview] = useState('');
    const [metaImagePreview, setMetaImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    
    useEffect(() => {
        fetchHeroBanners();
        if (isEditMode) {
            fetchPage();
        }
    }, [id, isEditMode]);

    const fetchHeroBanners = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/hero-banners`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const bannersData = extractArray(response);
            setHeroBanners(bannersData);
        } catch (error) {
            console.error('Error fetching hero banners:', error);
            setHeroBanners([]);
        }
    };

    const fetchPage = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_BASE_URL}/pages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const page = response.data.data || response.data;
            setFormData({
                page_title: page.page_title || '',
                small_heading: page.small_heading || '',
                title: page.title || '',
                slug: page.slug || '',
                location: page.location || '',
                hero_banner_id: page.hero_banner_id || '',
                banner_image: null,
                content: page.content || '',
                seo_title: page.seo_title || '',
                meta_keywords: page.meta_keywords || '',
                meta_description: page.meta_description || '',
                robots: page.robots || 'index,follow',
                og_type: page.og_type || 'website',
                meta_image: null
            });

            if (page.banner_image) {
                setBannerPreview(page.banner_image);
            }
            if (page.meta_image) {
                setMetaImagePreview(page.meta_image);
            }
        } catch (error) {
            console.error('Error fetching page:', error);
            setError('Failed to load page');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData({ ...formData, [name]: files[0] });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                if (name === 'banner_image') {
                    setBannerPreview(reader.result);
                } else if (name === 'meta_image') {
                    setMetaImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleEditorCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleContentChange = () => {
        if (editorRef.current) {
            setFormData({ ...formData, content: editorRef.current.innerHTML });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const submitData = new FormData();

            // Append text fields
            submitData.append('page_title', formData.page_title || '');
            submitData.append('small_heading', formData.small_heading || '');
            submitData.append('title', formData.title || '');
            submitData.append('slug', formData.slug || '');
            submitData.append('location', formData.location || '');
            submitData.append('content', formData.content || '');
            submitData.append('seo_title', formData.seo_title || '');
            submitData.append('meta_keywords', formData.meta_keywords || '');
            submitData.append('meta_description', formData.meta_description || '');
            submitData.append('robots', formData.robots || 'index,follow');
            submitData.append('og_type', formData.og_type || 'website');
            
            if (formData.hero_banner_id) {
                submitData.append('hero_banner_id', formData.hero_banner_id);
            }

            if (formData.banner_image instanceof File) {
                submitData.append('banner_image', formData.banner_image);
            }
            
            if (formData.meta_image instanceof File) {
                submitData.append('meta_image', formData.meta_image);
            }

            let response;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (isEditMode) {
                response = await axios.post(`${API_BASE_URL}/pages/${id}`, submitData, config);
            } else {
                response = await axios.post(`${API_BASE_URL}/pages`, submitData, config);
            }

            if (response.status === 200 || response.status === 201) {
                window.location.href = '/staff/pages';
            }
        } catch (error) {
            console.error('Error saving page:', error);

            if (error.response) {
                const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
                const errors = error.response.data?.errors;
                
                if (errors) {
                    const errorMessages = Object.entries(errors).map(([field, messages]) => {
                        return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
                    }).join('\n');
                    setError(errorMessages);
                } else {
                    setError(errorMessage);
                }
            } else {
                setError('Failed to save page');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        window.location.href = '/staff/pages';
    };

    return (
        <div className="page-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Page' : 'Add Page'}</h1>
                <button type="button" onClick={handleBackClick} className="btn-back">
                    Back to List
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="page-form">
                <div className="form-group">
                    <label>Page Name *</label>
                    <input
                        type="text"
                        name="page_title"
                        value={formData.page_title}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., About Us"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Small Heading *</label>
                    <input
                        type="text"
                        name="small_heading"
                        value={formData.small_heading}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., Welcome to"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., Our Story"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Page URL *</label>
                    <div className="url-input-group">
                        <span className="url-prefix">http://yourdomain.com/</span>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="form-control url-input"
                            placeholder="about-us"
                            required
                        />
                    </div>
                    <small className="form-text">Place a '/' if it's a landing page. No need to mention the domain name or subdomain. Also place a '/' at the end of URL if there is a varied part at the end.</small>
                </div>

                <div className="form-group">
                    <label>Location *</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g., Header, Footer"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Hero Banner</label>
                    <select
                        name="hero_banner_id"
                        value={formData.hero_banner_id}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select Hero Banner</option>
                        {heroBanners.map(banner => (
                            <option key={banner.id} value={banner.id}>
                                {banner.title || banner.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Banner Image</label>
                    <input
                        type="file"
                        name="banner_image"
                        onChange={handleFileChange}
                        className="form-control"
                        accept="image/*"
                    />
                    <small className="form-text">Preferred dimension is 1880px x 600px</small>
                    {bannerPreview && (
                        <div className="image-preview">
                            <img src={bannerPreview} alt="Banner preview" />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Content</label>
                    <div className="editor-toolbar">
                        <button type="button" onClick={() => handleEditorCommand('bold')} title="Bold">
                            <strong>B</strong>
                        </button>
                        <button type="button" onClick={() => handleEditorCommand('italic')} title="Italic">
                            <em>I</em>
                        </button>
                        <button type="button" onClick={() => handleEditorCommand('underline')} title="Underline">
                            <u>U</u>
                        </button>
                        <button type="button" onClick={() => handleEditorCommand('justifyLeft')} title="Align Left">
                            ◄
                        </button>
                        <button type="button" onClick={() => handleEditorCommand('justifyCenter')} title="Align Center">
                            ═
                        </button>
                        <button type="button" onClick={() => handleEditorCommand('justifyRight')} title="Align Right">
                            ►
                        </button>
                        <button type="button" onClick={() => handleEditorCommand('insertUnorderedList')} title="Bullet List">
                            •
                        </button>
                        <button type="button" onClick={() => handleEditorCommand('insertOrderedList')} title="Numbered List">
                            #
                        </button>
                    </div>
                    <div
                        ref={editorRef}
                        className="content-editor"
                        contentEditable
                        onInput={handleContentChange}
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                </div>

                <div className="form-section">
                    <h3>Page SEO</h3>
                    
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="seo_title"
                            value={formData.seo_title}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="SEO Title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Meta Keywords</label>
                        <input
                            type="text"
                            name="meta_keywords"
                            value={formData.meta_keywords}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="keyword1, keyword2, keyword3"
                        />
                        <small className="form-text">Separate each keyword with a comma (,)</small>
                    </div>

                    <div className="form-group">
                        <label>Meta Description</label>
                        <textarea
                            name="meta_description"
                            value={formData.meta_description}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                            placeholder="Meta Description"
                        />
                    </div>

                    <div className="form-group">
                        <label>Robots</label>
                        <select
                            name="robots"
                            value={formData.robots}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="index,follow">Index, Follow</option>
                            <option value="noindex,follow">No Index, Follow</option>
                            <option value="index,nofollow">Index, No Follow</option>
                            <option value="noindex,nofollow">No Index, No Follow</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>OG Type</label>
                        <input
                            type="text"
                            name="og_type"
                            value={formData.og_type}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="website"
                        />
                    </div>

                    <div className="form-group">
                        <label>Meta Image</label>
                        <input
                            type="file"
                            name="meta_image"
                            onChange={handleFileChange}
                            className="form-control"
                            accept="image/*"
                        />
                        <small className="form-text">Preferred dimension is 249px x 231px</small>
                        {metaImagePreview && (
                            <div className="image-preview small">
                                <img src={metaImagePreview} alt="Meta preview" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Saving...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PageForm;
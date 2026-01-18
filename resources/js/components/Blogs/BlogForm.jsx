import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './Blogs.css';

// Replace the getImageUrl function at the top of BlogForm.js
import { API_BASE_URL, getStorageUrl } from '../../config/api'; // Add this import

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    return getStorageUrl(imagePath);
};

function BlogForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        small_description: '',
        category_id: '',
        tags: '',
        seo_title: '',
        meta_keywords: '',
        meta_description: '',
        robots: 'index,follow',
        og_type: 'article'
    });

    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [bannerImagePreview, setBannerImagePreview] = useState(null);
    const [metaImage, setMetaImage] = useState(null);
    const [metaImagePreview, setMetaImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const robotsOptions = ['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'];
    const ogTypes = ['article', 'website', 'blog', 'news'];

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchBlog();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/blog-categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else if (response.data.success && response.data.data) {
                setCategories(response.data.data);
            } else if (response.data.data) {
                setCategories(response.data.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchBlog = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blog = response.data;
            
            setFormData({
                title: blog.title || '',
                small_description: blog.small_description || '',
                category_id: blog.category_id || '',
                tags: blog.tags || '',
                seo_title: blog.seo_title || '',
                meta_keywords: blog.meta_keywords || '',
                meta_description: blog.meta_description || '',
                robots: blog.robots || 'index,follow',
                og_type: blog.og_type || 'article'
            });

            if (blog.content) {
                const blocksFromHTML = convertFromHTML(blog.content);
                if (blocksFromHTML.contentBlocks) {
                    const contentState = ContentState.createFromBlockArray(
                        blocksFromHTML.contentBlocks,
                        blocksFromHTML.entityMap
                    );
                    setEditorState(EditorState.createWithContent(contentState));
                }
            }

            // Use getImageUrl helper for all images
            if (blog.image) setImagePreview(getImageUrl(blog.image));
            if (blog.banner_image) setBannerImagePreview(getImageUrl(blog.banner_image));
            if (blog.meta_image) setMetaImagePreview(getImageUrl(blog.meta_image));
        } catch (error) {
            console.error('Error fetching blog:', error);
            setError('Failed to load blog');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const onEditorStateChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should not exceed 2MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleBannerImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Banner image size should not exceed 5MB');
                return;
            }
            setBannerImage(file);
            setBannerImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleMetaImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Meta image size should not exceed 2MB');
                return;
            }
            setMetaImage(file);
            setMetaImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!isEditMode && !image) {
            setError('Image is required');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const contentState = editorState.getCurrentContent();
            const htmlContent = draftToHtml(convertToRaw(contentState));

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('small_description', formData.small_description);
            formDataToSend.append('category_id', formData.category_id);
            formDataToSend.append('content', htmlContent);
            formDataToSend.append('tags', formData.tags);
            formDataToSend.append('seo_title', formData.seo_title);
            formDataToSend.append('meta_keywords', formData.meta_keywords);
            formDataToSend.append('meta_description', formData.meta_description);
            formDataToSend.append('robots', formData.robots);
            formDataToSend.append('og_type', formData.og_type);

            if (image) formDataToSend.append('image', image);
            if (bannerImage) formDataToSend.append('banner_image', bannerImage);
            if (metaImage) formDataToSend.append('meta_image', metaImage);

            let response;
            if (isEditMode) {
                formDataToSend.append('_method', 'PUT');
                response = await axios.post(`/blogs/${id}`, formDataToSend, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axios.post('/blogs', formDataToSend, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.status === 200 || response.status === 201) {
                navigate('/staff/blogs');
            }
        } catch (error) {
            console.error('Error saving blog:', error);
            setError(error.response?.data?.message || 'Failed to save blog');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="blog-form-container">
            <div className="form-header">
                <h1>{isEditMode ? 'Edit Blog' : 'Add Blog'}</h1>
                <Link to="/staff/blogs" className="btn-back">
                    ← Back to List
                </Link>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="blog-form">
                <div className="form-section">
                    <h2>Blog Information</h2>

                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter blog title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Small Description *</label>
                        <textarea
                            name="small_description"
                            value={formData.small_description}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                            placeholder="Brief description"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Categories *</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="form-control"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Images</h2>

                    <div className="form-group">
                        <label>Image * {isEditMode && '(Leave empty to keep current)'}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="form-control-file"
                            required={!isEditMode}
                        />
                        <small className="form-text">
                            Preferred dimension: 350px x 450px. Max 2MB.
                        </small>
                    </div>

                    {imagePreview && (
                        <div className="image-preview-blog">
                            <img src={imagePreview} alt="Preview" />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Banner Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerImageChange}
                            className="form-control-file"
                        />
                        <small className="form-text">
                            Preferred dimension: 1880px x 600px. Max 5MB.
                        </small>
                    </div>

                    {bannerImagePreview && (
                        <div className="image-preview-banner">
                            <img src={bannerImagePreview} alt="Banner Preview" />
                        </div>
                    )}
                </div>

                <div className={`form-section ${isFullscreen ? 'fullscreen-editor' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Content</h2>
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="btn-fullscreen"
                        >
                            {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
                        </button>
                    </div>

                    <div className="form-group">
                        <Editor
                            editorState={editorState}
                            onEditorStateChange={onEditorStateChange}
                            wrapperClassName="draft-wrapper"
                            editorClassName="draft-editor"
                            toolbarClassName="draft-toolbar"
                            editorStyle={{
                                border: '1px solid #ddd',
                                padding: '10px',
                                minHeight: isFullscreen ? 'calc(100vh - 300px)' : '400px',
                                backgroundColor: 'white',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Tags</h2>
                    <div className="form-group">
                        <label>Tags (Press Enter after each)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="tag1, tag2, tag3"
                        />
                        <small className="form-text">
                            Separate tags with commas
                        </small>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Page SEO</h2>

                    <div className="form-group">
                        <label>SEO Title</label>
                        <input
                            type="text"
                            name="seo_title"
                            value={formData.seo_title}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Title for search engines"
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
                        <small className="form-text">
                            Separate each keyword with a comma (,)
                        </small>
                    </div>

                    <div className="form-group">
                        <label>Meta Description</label>
                        <textarea
                            name="meta_description"
                            value={formData.meta_description}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                            placeholder="Brief description for search engines"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Robots</label>
                            <select
                                name="robots"
                                value={formData.robots}
                                onChange={handleChange}
                                className="form-control"
                            >
                                {robotsOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group half-width">
                            <label>OG Type</label>
                            <select
                                name="og_type"
                                value={formData.og_type}
                                onChange={handleChange}
                                className="form-control"
                            >
                                {ogTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Meta Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleMetaImageChange}
                            className="form-control-file"
                        />
                        <small className="form-text">
                            Preferred dimension: 249px x 231px. Max 2MB.
                        </small>
                    </div>

                    {metaImagePreview && (
                        <div className="image-preview-meta">
                            <img src={metaImagePreview} alt="Meta Preview" />
                        </div>
                    )}
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

export default BlogForm;
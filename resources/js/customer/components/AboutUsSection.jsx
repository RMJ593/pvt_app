import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AboutUs.css';

// Inline helper functions to avoid import issues
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://tphrc-int-project.onrender.com';

const getStorageUrl = (imagePath) => {
    console.log('🔍 getStorageUrl called with:', imagePath);
    
    if (!imagePath) {
        console.log('❌ No image path provided');
        return null;
    }
    
    // If it's already a full URL (Cloudinary), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        console.log('✅ Cloudinary URL detected, returning as-is:', imagePath);
        return imagePath;
    }
    
    // Local storage path
    const localUrl = `${API_BASE_URL}/storage/${imagePath}`;
    console.log('📁 Local storage URL generated:', localUrl);
    return localUrl;
};

function AboutUsSection() {
    const [aboutImage, setAboutImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState({});

    useEffect(() => {
        console.log('🚀 AboutUsSection mounted!');
        console.log('📍 API_BASE_URL:', API_BASE_URL);
        fetchAboutImage();
    }, []);

    const fetchAboutImage = async () => {
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('🎬 STARTING GALLERY FETCH');
        console.log('═══════════════════════════════════════');
        
        try {
            const url = `${API_BASE_URL}/api/gallery`;
            console.log('📡 Fetching from:', url);
            
            const response = await axios.get(url);
            console.log('✅ API Response received:', response);
            console.log('📦 Response data:', response.data);
            
            // Update debug info
            setDebugInfo({
                apiCalled: true,
                responseReceived: true,
                responseData: response.data
            });
            
            // Handle different response structures
            let galleryData = [];
            
            if (response.data.success && Array.isArray(response.data.data)) {
                console.log('✅ Using response.data.data format');
                galleryData = response.data.data;
            } else if (Array.isArray(response.data)) {
                console.log('✅ Using response.data format');
                galleryData = response.data;
            } else if (response.data.data && typeof response.data.data === 'object') {
                console.log('✅ Converting object to array');
                galleryData = Object.values(response.data.data);
            }

            console.log('📊 Gallery data array:', galleryData);
            console.log('📊 Number of images:', galleryData.length);
            
            if (Array.isArray(galleryData) && galleryData.length > 0) {
                console.log('');
                console.log('🔍 SEARCHING FOR IMAGE1');
                console.log('Available images:');
                galleryData.forEach((img, index) => {
                    console.log(`  ${index + 1}. Title: "${img.title}" | Active: ${img.is_active} | Has Image: ${!!img.image}`);
                });
                
                // Find the image with title "image1" that is active
                const image = galleryData.find(img => {
                    const hasTitle = img.title !== null && img.title !== undefined;
                    const titleLower = hasTitle ? img.title.toLowerCase().trim() : '';
                    const isImage1 = titleLower === 'image1';
                    const isActive = img.is_active === 1 || img.is_active === true;
                    
                    console.log(`  Checking: "${img.title}" => isImage1: ${isImage1}, isActive: ${isActive}`);
                    
                    return isImage1 && isActive;
                });
                
                if (image) {
                    console.log('');
                    console.log('🎉 FOUND IMAGE1!');
                    console.log('Image object:', image);
                    console.log('Image URL:', image.image);
                    
                    const processedUrl = getStorageUrl(image.image);
                    console.log('Processed URL:', processedUrl);
                    
                    setAboutImage(image);
                    setDebugInfo(prev => ({
                        ...prev,
                        imageFound: true,
                        imageData: image,
                        processedUrl: processedUrl
                    }));
                } else {
                    console.log('');
                    console.log('❌ NO ACTIVE IMAGE1 FOUND');
                    setDebugInfo(prev => ({
                        ...prev,
                        imageFound: false,
                        reason: 'No active image with title "image1"'
                    }));
                }
            } else {
                console.log('❌ No gallery images available');
                setDebugInfo(prev => ({
                    ...prev,
                    imageFound: false,
                    reason: 'Gallery data is empty or not an array'
                }));
            }
        } catch (error) {
            console.log('');
            console.log('💥 ERROR FETCHING GALLERY');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            
            setDebugInfo({
                apiCalled: true,
                responseReceived: false,
                error: error.message
            });
        } finally {
            console.log('');
            console.log('🏁 Fetch complete, setting loading to false');
            console.log('═══════════════════════════════════════');
            console.log('');
            setLoading(false);
        }
    };

    console.log('🎨 Rendering AboutUsSection');
    console.log('  - Loading:', loading);
    console.log('  - Has aboutImage:', !!aboutImage);
    console.log('  - aboutImage:', aboutImage);

    return (
        <section className="about-us-section">
            <div className="about-us-container">
                <div className="about-us-content">
                    {/* Left Side - Text Content */}
                    <div className="about-us-text">
                        <p className="about-us-label">Our Story</p>
                        <h2 className="about-us-heading">
                            Every Flavor Tells a Story
                        </h2>
                        <p className="about-us-description">
                            Curry Leaf blends age-old Indian recipes with a fresh, modern twist. 
                            Every plate we serve is rooted in tradition and inspired by flavour.
                        </p>
                        <div className="about-us-contact">
                            <p className="contact-label">Book Through Call</p>
                            <a href="tel:+447878277198" className="contact-phone">
                                +44 787 8277198
                            </a>
                        </div>
                        <Link to="/about" className="btn-read-more">
                            Read More
                        </Link>
                    </div>

                    {/* Right Side - Image from Gallery */}
                    <div className="about-us-image">
                        {loading ? (
                            <div className="image-loading">
                                <p>Loading...</p>
                                <p style={{fontSize: '12px', marginTop: '10px'}}>
                                    Check console (F12) for debug info
                                </p>
                            </div>
                        ) : aboutImage && aboutImage.image ? (
                            <>
                                <img
                                    src={getStorageUrl(aboutImage.image)}
                                    alt={aboutImage.title}
                                    className="about-image"
                                    onError={(e) => {
                                        console.error('❌ IMAGE FAILED TO LOAD');
                                        console.error('Attempted URL:', e.target.src);
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={() => {
                                        console.log('✅ IMAGE LOADED SUCCESSFULLY');
                                    }}
                                />
                                <div style={{
                                    fontSize: '10px', 
                                    marginTop: '5px', 
                                    padding: '5px',
                                    background: '#f0f0f0',
                                    borderRadius: '4px'
                                }}>
                                    <strong>Debug Info:</strong><br/>
                                    Title: {aboutImage.title}<br/>
                                    URL: {aboutImage.image.substring(0, 50)}...
                                </div>
                            </>
                        ) : (
                            <div className="image-placeholder">
                                <p>📷</p>
                                <p style={{fontSize: '14px', marginTop: '10px'}}>
                                    Upload an image titled <strong>"image1"</strong> in the gallery
                                </p>
                                <div style={{
                                    fontSize: '10px', 
                                    marginTop: '10px',
                                    padding: '10px',
                                    background: '#ffe6e6',
                                    borderRadius: '4px',
                                    textAlign: 'left'
                                }}>
                                    <strong>Debug Info:</strong><br/>
                                    API Called: {debugInfo.apiCalled ? '✅' : '❌'}<br/>
                                    Response Received: {debugInfo.responseReceived ? '✅' : '❌'}<br/>
                                    Image Found: {debugInfo.imageFound ? '✅' : '❌'}<br/>
                                    {debugInfo.reason && `Reason: ${debugInfo.reason}`}
                                    {debugInfo.error && `Error: ${debugInfo.error}`}
                                    <br/><br/>
                                    <strong>Check browser console (F12) for detailed logs</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutUsSection;
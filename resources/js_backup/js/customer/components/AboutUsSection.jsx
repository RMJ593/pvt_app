import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getStorageUrl } from '../../config/api';
import './AboutUs.css';

function AboutUsSection() {
    const [aboutImage, setAboutImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAboutImage();
    }, []);

    const fetchAboutImage = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gallery`);
            console.log('About Us - Gallery API response:', response.data);
            
            // Handle different response structures
            let galleryData = [];
            
            if (response.data.success && Array.isArray(response.data.data)) {
                galleryData = response.data.data;
            } else if (Array.isArray(response.data)) {
                galleryData = response.data;
            } else if (response.data.data && typeof response.data.data === 'object') {
                galleryData = Object.values(response.data.data);
            }

            console.log('About Us - Processed gallery data:', galleryData);
            
            if (Array.isArray(galleryData) && galleryData.length > 0) {
                console.log('Available image titles:', galleryData.map(img => img.title));
                
                // Find the image with title "image1" that is active
                const image = galleryData.find(
                    img => img.title && img.title.toLowerCase().trim() === 'image1' && 
                    (img.is_active === 1 || img.is_active === true)
                );
                
                if (image) {
                    console.log('About Us - Found image1:', image);
                    setAboutImage(image);
                } else {
                    console.log('About Us - No active "image1" found');
                }
            } else {
                console.log('About Us - No gallery images available');
            }
        } catch (error) {
            console.error('Error fetching about image:', error);
        } finally {
            setLoading(false);
        }
    };

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
                            <div className="image-loading">Loading...</div>
                        ) : aboutImage && aboutImage.image ? (
                            <img
                                src={getStorageUrl(aboutImage.image)}
                                alt={aboutImage.title}
                                className="about-image"
                                onError={(e) => {
                                    console.error('Failed to load about image');
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="image-placeholder">
                                <p>??</p>
                                <p style={{fontSize: '14px', marginTop: '10px'}}>
                                    Upload an image titled <strong>"image1"</strong> in the gallery
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutUsSection;

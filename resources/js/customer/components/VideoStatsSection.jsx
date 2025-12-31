import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './VideoStatsSection.css';

function VideoStatsSection() {
    const [settings, setSettings] = useState(null);
    const [galleryImage, setGalleryImage] = useState(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const sectionRef = useRef(null);
    const API_BASE_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchSettings();
        fetchGalleryImage();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateCounters();
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [hasAnimated]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/settings`);
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchGalleryImage = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/gallery`);
            console.log('Gallery API response:', response.data); // Debug log
            
            // Handle different response structures
            let images = [];
            if (response.data.success && Array.isArray(response.data.data)) {
                images = response.data.data;
            } else if (Array.isArray(response.data)) {
                images = response.data;
            } else if (response.data.data && typeof response.data.data === 'object') {
                // If data is an object, convert to array
                images = Object.values(response.data.data);
            }

            console.log('Processed images array:', images); // Debug log

            // Ensure images is an array before using .find()
            if (!Array.isArray(images) || images.length === 0) {
                console.warn('No gallery images found or invalid format');
                return;
            }
            
            // Find image with title 'bg'
            const bgImage = images.find(img => 
                img.title?.toLowerCase() === 'bg' && (img.is_active === 1 || img.is_active === true)
            );
            
            if (bgImage) {
                console.log('BG image found:', bgImage);
                setGalleryImage(bgImage);
            } else {
                console.log('BG image not found, looking for any active image');
                // Fallback: use any active image
                const activeImages = images.filter(img => img.is_active === 1 || img.is_active === true);
                if (activeImages.length > 0) {
                    const randomImage = activeImages[Math.floor(Math.random() * activeImages.length)];
                    console.log('Using random active image:', randomImage);
                    setGalleryImage(randomImage);
                } else {
                    console.warn('No active images found');
                }
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
        }
    };

    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };

            updateCounter();
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://127.0.0.1:8000/storage/${imagePath}`;
    };

    const getYoutubeEmbedUrl = (url) => {
        // If no URL provided, use default video
        if (!url) {
            return 'https://www.youtube.com/embed/DI2gyY';
        }
        
        // Extract video ID from various YouTube URL formats
        let videoId;
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1]?.split('?')[0];
        }
        
        return videoId ? `https://www.youtube.com/embed/${videoId}` : 'https://www.youtube.com/embed/DI2gyY';
    };

    const stats = [
        {
            number: settings?.first_value || '100',
            label: settings?.first_name || 'DAILY ORDER'
        },
        {
            number: settings?.second_value || '100',
            label: settings?.second_name || 'SPECIAL DISHES'
        },
        {
            number: settings?.third_value || '10',
            label: settings?.third_name || 'EXPERT CHEF'
        },
        {
            number: settings?.fourth_value || '25',
            label: settings?.fourth_name || 'AWARDS WON'
        }
    ];

    return (
        <section className="video-stats-section" ref={sectionRef}>
            {galleryImage && (
                <div 
                    className="video-stats-background"
                    style={{ backgroundImage: `url(${getImageUrl(galleryImage.image)})` }}
                />
            )}
            
            <div className="video-stats-overlay"></div>

            <div className="video-stats-container">
                {/* Top Section - Video */}
                <div className="video-section">
                    <p className="video-subtitle">AMAZING EXPERIENCE</p>
                    
                    <div className="video-divider">
                        <span>◆</span>
                        <span>◆</span>
                        <span>◆</span>
                    </div>

                    <h2 className="video-title">Watch Our Video</h2>

                    <div className="video-wrapper">
                        <iframe
                            src={getYoutubeEmbedUrl(settings?.youtube_url)}
                            title="Restaurant Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="youtube-iframe"
                        ></iframe>
                    </div>

                    <h3 className="video-description">
                        A Taste That Takes You Back to the<br/>
                        Moments That Matter.
                    </h3>

                    <p className="video-author">{settings?.site_name || 'VIMAL SEBASTAIN'}</p>
                </div>

                {/* Bottom Section - Stats */}
                <div className="stats-divider"></div>

                <div className="stats-section">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <div 
                                className="stat-number" 
                                data-target={stat.number}
                            >
                                0+
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default VideoStatsSection;
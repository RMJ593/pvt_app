import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import './AboutPage.css';
import { API_BASE_URL, getStorageUrl, extractArray } from '../../config/api';

function AboutPage() {
    const [settings, setSettings] = useState(null);
    const [aboutImage, setAboutImage] = useState(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const statsRef = useRef(null);
    
    useEffect(() => {
        fetchSettings();
        fetchGalleryImages();
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

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                observer.unobserve(statsRef.current);
            }
        };
    }, [hasAnimated]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/settings`);
            console.log('Settings response:', response.data);
            
            if (response.data.success) {
                const settingsData = response.data.data;
                console.log('Settings data:', settingsData);
                console.log('Default image path:', settingsData.default_image);
                console.log('Default image URL:', settingsData.default_image ? getStorageUrl(settingsData.default_image) : 'Not set');
                
                setSettings(settingsData);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchGalleryImages = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gallery`);
            const galleryData = extractArray(response);
            
            console.log('About Page - Gallery data:', galleryData);
            
            if (Array.isArray(galleryData) && galleryData.length > 0) {
                const image2 = galleryData.find(
                    img => img.title && img.title.toLowerCase().trim() === 'image2' && 
                    (img.is_active === 1 || img.is_active === true)
                );
                setAboutImage(image2);
                console.log('Found image2:', image2);
            } else {
                console.log('No gallery images available');
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
        }
    };

    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-counter');
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
        <div className="about-page">
            {/* Hero Section with Background */}
            <section 
                className="about-hero"
                style={{
                    backgroundImage: settings?.default_image 
                        ? `url(${getStorageUrl(settings.default_image)})` 
                        : 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))'
                }}
            >
                <div className="about-hero-overlay"></div>
                <div className="about-hero-content">
                    <p className="about-hero-subtitle">About Us</p>
                    <h1 className="about-hero-title">About Us</h1>
                </div>
            </section>

            {/* Welcome Section */}
            <section className="about-welcome">
                <div className="about-container">
                    <p className="welcome-subtitle">Welcome to Curry Leaf</p>
                    <h2 className="welcome-title">
                        Authentic Indian Flavours in the Heart of Newcastle Since 2025 | 
                        Powered by Kitchens of Kerala Pvt Ltd | curryleaf.uk
                    </h2>
                </div>
            </section>

            {/* Three Column Section */}
            <section className="about-content">
                <div className="about-container">
                    <div className="about-grid">
                        {/* Column 1 - Story */}
                        <div className="about-story">
                            <p>
                                Step into Curry Leaf, where the true taste of India comes alive. 
                                We're proud to present a diverse menu that celebrates the vibrant 
                                flavours of both North and South Indian cuisine — from rich, creamy 
                                butter chicken to bold Chettinad curries, crisp golden dosas, and 
                                aromatic biryanis.
                            </p>
                            <p>
                                Every dish is lovingly crafted using time-honoured recipes, authentic 
                                spices, and the warmth of traditional Indian cooking.
                            </p>
                            <p>
                                Whether you're joining us for a relaxed dine-in experience or picking 
                                up a comforting takeaway, we're here to serve you with heartfelt 
                                hospitality and unforgettable flavour. Let Curry Leaf take you on a 
                                delicious journey across India — right here in Newcastle.
                            </p>
                        </div>

                        {/* Column 2 - Image */}
                        <div className="about-image-wrapper">
                            {aboutImage && aboutImage.image ? (
                                <img
                                    src={getStorageUrl(aboutImage.image)}
                                    alt="Curry Leaf Restaurant"
                                    className="about-main-image"
                                    onError={(e) => {
                                        console.error('Failed to load image2');
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="about-image-placeholder">
                                    <p>📷</p>
                                    <p style={{fontSize: '14px', marginTop: '10px'}}>
                                        Upload <strong>"image2"</strong> in gallery
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Column 3 - Hours & Contact */}
                        <div className="about-info">
                            <div className="info-section">
                                <h3 className="info-title">Opening Hours</h3>
                                <div className="info-content">
                                    <p><strong>Sunday's</strong></p>
                                    <p>{settings?.sunday_timing || '12:00PM - 08:00PM'}</p>
                                    
                                    <p style={{ marginTop: '15px' }}><strong>Monday - Friday</strong></p>
                                    <p>{settings?.weekday_timing || '05:00PM - 10:00PM'}</p>
                                </div>
                            </div>

                            <div className="info-section" style={{ marginTop: '30px' }}>
                                <h3 className="info-title">Contact Us</h3>
                                <div className="info-content">
                                    <p>{settings?.address || '169 West Rd, Newcastle upon Tyne NE15 6PQ'}</p>
                                    <p>
                                        <a href={`tel:${settings?.phone || '+447878277198'}`}>
                                            {settings?.phone || '+44 787 8277198'}
                                        </a>
                                    </p>
                                    <p>
                                        <a href={`mailto:${settings?.email || 'info@curryleaf.uk'}`}>
                                            {settings?.email || 'info@curryleaf.uk'}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="about-stats" ref={statsRef}>
                <div className="about-container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item-about">
                                <div 
                                    className="stat-counter" 
                                    data-target={stat.number}
                                >
                                    0+
                                </div>
                                <div className="stat-label-about">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chef Section */}
            <ChefSection />

            {/* Experience Section */}
            <ExperienceSection />

            {/* Services Section */}
            <ServicesSection />

            {/* Gallery Slider Section */}
            <GallerySlider />

            {/* Footer */}
            <Footer />
        </div>
    );
}

// Chef Section Component
function ChefSection() {
    const [chefImage, setChefImage] = useState(null);
   
    useEffect(() => {
        fetchChefImage();
    }, []);

    const fetchChefImage = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gallery`);
            const galleryData = extractArray(response);

            if (Array.isArray(galleryData)) {
                const image = galleryData.find(
                    img => img.title?.toLowerCase().trim() === 'image3' && 
                    (img.is_active === 1 || img.is_active === true)
                );
                setChefImage(image);
            }
        } catch (error) {
            console.error('Error fetching chef image:', error);
        }
    };

    return (
        <section className="chef-section">
            <div className="about-container">
                <div className="chef-grid">
                    <div className="chef-image-wrapper">
                        {chefImage && chefImage.image ? (
                            <img 
                                src={getStorageUrl(chefImage.image)} 
                                alt="Master Chef" 
                                className="chef-image"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <div className="chef-image-placeholder">
                                <p>📷</p>
                                <p>Upload <strong>"image3"</strong></p>
                            </div>
                        )}
                    </div>
                    <div className="chef-content">
                        <p className="chef-subtitle">35 Years of Culinary Excellence</p>
                        <h2 className="chef-title">Our Master Chef</h2>
                        <p className="chef-description">
                            With over three decades of experience, Chef Vimal brings timeless skill and passion 
                            to every plate. Inspired by India's rich culinary heritage — prepared with passion, 
                            perfected with tradition, and served with love — his dishes reflect both authenticity 
                            and artistry.
                        </p>
                        <p className="chef-name">Chef Vimal Sebastain</p>
                        <button className="btn-golden">Meet Our Team</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Experience Section Component
function ExperienceSection() {
    const [experienceImage, setExperienceImage] = useState(null);
    
    useEffect(() => {
        fetchExperienceImage();
    }, []);

    const fetchExperienceImage = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gallery`);
            const galleryData = extractArray(response);

            if (Array.isArray(galleryData)) {
                const image = galleryData.find(
                    img => img.title?.toLowerCase().trim() === 'image4' && 
                    (img.is_active === 1 || img.is_active === true)
                );
                setExperienceImage(image);
            }
        } catch (error) {
            console.error('Error fetching experience image:', error);
        }
    };

    return (
        <section className="experience-section">
            <div className="about-container">
                <div className="experience-grid">
                    <div className="experience-content">
                        <p className="experience-subtitle">Delightful Experience</p>
                        <h2 className="experience-title">Dinner, Event, or Party We've Got You Covered</h2>
                        <p className="experience-description">
                            Whether you're planning an intimate dinner, a formal corporate event, or a vibrant 
                            celebration, we bring your vision to life with style and precision. From elegant 
                            table settings and custom menus to lively entertainment and seamless coordination, 
                            our team ensures every detail is flawlessly executed. Let us turn your gathering 
                            into a memorable experience that your guests will talk about long after the final toast.
                        </p>
                        <button className="btn-golden">Discover Now</button>
                    </div>
                    <div className="experience-image-wrapper">
                        {experienceImage && experienceImage.image ? (
                            <img 
                                src={getStorageUrl(experienceImage.image)} 
                                alt="Experience" 
                                className="experience-image"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <div className="experience-image-placeholder">
                                <p>📷</p>
                                <p>Upload <strong>"image4"</strong></p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Services Section Component
function ServicesSection() {
    const [serviceImage, setServiceImage] = useState(null);
    
    useEffect(() => {
        fetchServiceImage();
    }, []);

    const fetchServiceImage = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gallery`);
            const galleryData = extractArray(response);

            if (Array.isArray(galleryData)) {
                const image = galleryData.find(
                    img => img.title?.toLowerCase().trim() === 'image5' && 
                    (img.is_active === 1 || img.is_active === true)
                );
                setServiceImage(image);
            }
        } catch (error) {
            console.error('Error fetching service image:', error);
        }
    };

    const services = [
        {
            title: 'Door Delivery',
            description: 'Enjoy restaurant-quality meals in the comfort of your home. Our prompt and professional delivery service ensures your food arrives hot, fresh, and full of flavor—right to your doorstep.'
        },
        {
            title: 'Outdoor Catering',
            description: 'From private garden parties to grand outdoor celebrations, our catering service brings gourmet cuisine and exceptional service to any venue. Let us make your event deliciously unforgettable.'
        },
        {
            title: 'Fine Dining',
            description: 'Step into a world of elegance and taste. Our fine dining experience blends luxurious ambiance, attentive service, and an expertly curated menu that celebrates the art of flavour.'
        },
        {
            title: 'Banquets Hall',
            description: 'Host your next celebration in style. Our spacious and beautifully appointed banquet hall is perfect for weddings, birthdays, corporate events, and more—customized to your theme and needs.'
        }
    ];

    return (
        <section className="services-section">
            <div className="about-container">
                <div className="services-wrapper">
                    <div className="service-card service-top-left">
                        <h3>{services[0].title}</h3>
                        <p>{services[0].description}</p>
                    </div>
                    
                    <div className="service-card service-top-right">
                        <h3>{services[1].title}</h3>
                        <p>{services[1].description}</p>
                    </div>

                    <div className="services-center-image">
                        {serviceImage && serviceImage.image ? (
                            <img 
                                src={getStorageUrl(serviceImage.image)} 
                                alt="Services" 
                                className="service-image"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <div className="service-image-placeholder">
                                <p>📷</p>
                                <p>Upload <strong>"image5"</strong></p>
                            </div>
                        )}
                    </div>

                    <div className="service-card service-bottom-left">
                        <h3>{services[2].title}</h3>
                        <p>{services[2].description}</p>
                    </div>
                    
                    <div className="service-card service-bottom-right">
                        <h3>{services[3].title}</h3>
                        <p>{services[3].description}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Gallery Slider Component
function GallerySlider() {
    const [galleryImages, setGalleryImages] = useState([]);
    const sliderRef = useRef(null);
    
    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const fetchGalleryImages = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gallery`);
            const galleryData = extractArray(response);

            if (Array.isArray(galleryData)) {
                // Filter images with titles image6 to image10
                const sliderImages = galleryData.filter(img => {
                    const title = img.title?.toLowerCase().trim();
                    return (title === 'image6' || title === 'image7' || title === 'image8' || 
                            title === 'image9' || title === 'image10') && 
                           (img.is_active === 1 || img.is_active === true);
                });
                
                // Sort by title number
                sliderImages.sort((a, b) => {
                    const numA = parseInt(a.title.replace(/\D/g, ''));
                    const numB = parseInt(b.title.replace(/\D/g, ''));
                    return numA - numB;
                });
                
                setGalleryImages(sliderImages);
            }
        } catch (error) {
            console.error('Error fetching gallery images:', error);
        }
    };

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = 400;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Don't render if no images
    if (galleryImages.length === 0) {
        return (
            <section className="gallery-slider-section">
                <div className="about-container-full">
                    <h2 className="gallery-slider-title">Our Gallery</h2>
                    <div className="gallery-placeholder-message">
                        <p>📷</p>
                        <p>Upload images <strong>"image6"</strong> to <strong>"image10"</strong> in gallery</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="gallery-slider-section">
            <div className="about-container-full">
                <h2 className="gallery-slider-title">Our Gallery</h2>
                <div className="gallery-slider-wrapper">
                    <button className="slider-btn slider-btn-left" onClick={() => scroll('left')}>‹</button>
                    <div className="gallery-slider" ref={sliderRef}>
                        {galleryImages.map((image, index) => (
                            <div key={index} className="gallery-slide">
                                <img 
                                    src={getStorageUrl(image.image)} 
                                    alt={image.title}
                                    onError={(e) => {
                                        console.error('Failed to load:', image.title);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <button className="slider-btn slider-btn-right" onClick={() => scroll('right')}>›</button>
                </div>
            </div>
        </section>
    );
}

export default AboutPage;
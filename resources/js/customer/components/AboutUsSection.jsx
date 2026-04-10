import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './AboutUsSection.css';

// const API_BASE_URL =
//     window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
//         ? 'http://127.0.0.1:8000'
//         : 'https://pvtapp-production-255e.up.railway.app';

const getStorageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${API_BASE_URL}/storage/${imagePath}`;
};

function AboutUsSection() {
    const [defaultImage, setDefaultImage] = useState(null);
    const [colors, setColors] = useState({
        color_one: '#a7a7a7',
        color_four: '#171819',
        color_eight: '#121111',
        black_color: '#000000',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/settings`);
            if (response.data.success) {
                const data = response.data.data;

                setColors({
                    color_one: data.color_one || '#a7a7a7',
                    color_four: data.color_four || '#171819',
                    color_eight: data.color_eight || '#121111',
                    black_color: data.black_color || '#000000',
                });

                if (data.default_image) {
                    setDefaultImage(data.default_image);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            title: 'Quality first',
            desc: 'Every batch third-party tested before dispatch',
        },
        {
            title: 'Regulatory ready',
            desc: 'Full dossier support for 40+ markets',
        },
        {
            title: 'Reliable supply',
            desc: 'Consistent availability, zero stockouts',
        },
        {
            title: 'Ethical trade',
            desc: 'Transparent pricing, fair partnerships',
        },
    ];

    return (
        <section className="pvt-about-section">
            <div className="pvt-about-wrap">

                {/* Left — Image */}
                <div className="pvt-about-img-col">
                    {loading ? (
                        <div className="pvt-img-placeholder">Loading...</div>
                    ) : defaultImage ? (
                        <img
                            src={getStorageUrl(defaultImage)}
                            alt="About PVT Enterprises"
                            className="pvt-about-img"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="pvt-img-placeholder">
                            Set a default image in General Settings
                        </div>
                    )}
                </div>

                {/* Right — Content */}
                <div className="pvt-about-content-col">

                    <p
                        className="pvt-who-label"
                        style={{ color: colors.color_four }}
                    >
                        Who we are
                    </p>

                    <h2
                        className="pvt-tagline"
                        style={{ color: colors.black_color }}
                    >
                        Built on trust, driven by quality
                    </h2>

                    <p
                        className="pvt-desc"
                        style={{ color: colors.color_one }}
                    >
                        PVT Enterprises is a dynamic export startup with over one year of
                        experience in delivering quality products to global markets. We
                        specialize in sourcing and supplying reliable goods while also
                        assisting businesses in streamlining their export processes. Driven
                        by a commitment to quality, efficiency, and customer satisfaction,
                        we aim to build long-term partnerships across international markets.
                        At PVT Enterprises, we combine modern trade practices with a
                        customer-first approach to ensure smooth and trustworthy global
                        transactions.
                    </p>

                    {/* Feature Boxes */}
                    <div className="pvt-boxes-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="pvt-feature-box"
                                style={{ backgroundColor: colors.color_eight }}
                            >
                                <p
                                    className="pvt-feature-title"
                                    style={{ color: colors.color_one }}
                                >
                                    {feature.title}
                                </p>
                                <p
                                    className="pvt-feature-desc"
                                    style={{ color: colors.color_one }}
                                >
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}

export default AboutUsSection;
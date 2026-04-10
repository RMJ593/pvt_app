import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './DeliveryDetails.css';

// const API_BASE_URL =
//     window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
//         ? 'http://127.0.0.1:8000'
//         : 'https://pvtapp-production-255e.up.railway.app';

const steps = [
    {
        number: '01',
        title: 'Product enquiry',
        desc: 'Submit requirements. We respond within 24 hours with pricing.',
    },
    {
        number: '02',
        title: 'Documentation',
        desc: 'All regulatory dossiers, CoA, and export permits prepared for you.',
    },
    {
        number: '03',
        title: 'Quality check',
        desc: 'Every batch third-party QC tested before dispatch. Zero compromise.',
    },
    {
        number: '04',
        title: 'Shipment & track',
        desc: 'Cold-chain or standard freight with real-time tracking end-to-end.',
    },
];

function DeliveryDetails() {
    const [colors, setColors] = useState({
        color_two: '#0e0d0b',
        color_six: '#1a1b1c',
    });

    useEffect(() => {
        fetchColors();
    }, []);

    const fetchColors = async () => {
        try {
            const response = await axios.get('/settings');
            if (response.data.success) {
                const d = response.data.data;
                setColors({
                    color_two: d.color_two || '#0e0d0b',
                    color_six: d.color_six || '#1a1b1c',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    return (
        <section
            className="dd-section"
            style={{ backgroundColor: colors.color_two }}
        >
            <div className="dd-container">
                <p
                    className="dd-small-heading"
                    style={{ color: colors.color_six }}
                >
                    How it works
                </p>
                <h2 className="dd-big-heading">From order to delivery</h2>

                <div className="dd-steps-grid">
                    {steps.map((step, index) => (
                        <div className="dd-step" key={index}>
                            <span className="dd-step-num">{step.number}</span>
                            <p className="dd-step-title">{step.title}</p>
                            <p className="dd-step-desc">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default DeliveryDetails;
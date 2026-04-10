import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopBar from '../components/TopBar';
import Sidebar from '../components/Sidebar';
import WhatsAppButton from '../components/WhatsAppButton';
import AboutUsSection from '../components/AboutUsSection';
import MenuSection from '../components/MenuSection';
import Footer from '../components/Footer';
import SpecialDishesSection from '../components/SpecialDishesSection';
import ChefsSelectionSection from '../components/ChefsSelectionSection';
import SpecialOffersSection from '../components/SpecialOffersSection';
import BookingFormContent from '../components/BookingFormContent';
import BlogsSection from '../components/BlogsSection';
import VideoStatsSection from '../components/VideoStatsSection';
import { getStorageUrl, extractArray } from '../../config/api';
import './Home.css';

function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings, setSettings] = useState(null);
    const [heroBanner, setHeroBanner] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
        fetchHeroBanner();
        fetchMenuItems();
        fetchStats();
    }, []);

    // Apply theme colors from domain settings
    useEffect(() => {
        if (!settings) return;
        const root = document.documentElement.style;
        if (settings.main_color)    root.setProperty('--main-color',    settings.main_color);
        if (settings.color_one)     root.setProperty('--color-1',       settings.color_one);
        if (settings.color_two)     root.setProperty('--color-2',       settings.color_two);
        if (settings.color_three)   root.setProperty('--color-3',       settings.color_three);
        if (settings.color_four)    root.setProperty('--color-4',       settings.color_four);
        if (settings.color_five)    root.setProperty('--color-5',       settings.color_five);
        if (settings.color_six)     root.setProperty('--color-6',       settings.color_six);
        if (settings.color_seven)   root.setProperty('--color-7',       settings.color_seven);
        if (settings.color_eight)   root.setProperty('--color-8',       settings.color_eight);
        if (settings.white_color)   root.setProperty('--white-color',   settings.white_color);
        if (settings.black_color)   root.setProperty('--black-color',   settings.black_color);
        if (settings.text_color)    root.setProperty('--text-color',    settings.text_color);
        if (settings.heading_color) root.setProperty('--heading-color', settings.heading_color);
    }, [settings]);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/settings');
            const data = response.data.data || response.data;
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchHeroBanner = async () => {
        try {
            const response = await axios.get('/hero-banners');
            const banners = response.data?.data || [];
            if (banners.length > 0) {
                const active = banners.find(b => b.is_active) || banners[0];
                setHeroBanner(active);
            }
        } catch (error) {
            console.error('Error fetching hero banner:', error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('/menu-links');
            const items = extractArray(response);
            setMenuItems(items.filter(item => item.link_type === 'top_menu' && item.is_active));
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setMenuItems([]);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/settings');
            const data = response.data.data || response.data;
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getBannerImageUrl = () => {
        if (!heroBanner?.image_path) return null;
        const p = heroBanner.image_path;
        return (p.startsWith('http://') || p.startsWith('https://')) ? p : `/storage/${p}`;
    };

    const getLogoUrl = () => {
        const path = settings?.website_logo || settings?.logo;
        if (!path) return null;
        return getStorageUrl(path);
    };

    const handleNavClick = (item) => {
        if (item.target === '_blank') {
            window.open(item.url, '_blank');
        } else {
            navigate(item.url);
        }
    };

    // Collect non-empty stats
    const statsList = [];
    if (stats) {
        if (stats.first_name  && stats.first_value)  statsList.push({ label: stats.first_name,  value: stats.first_value  });
        if (stats.second_name && stats.second_value) statsList.push({ label: stats.second_name, value: stats.second_value });
        if (stats.third_name  && stats.third_value)  statsList.push({ label: stats.third_name,  value: stats.third_value  });
        if (stats.fourth_name && stats.fourth_value) statsList.push({ label: stats.fourth_name, value: stats.fourth_value });
    }

    return (
        <div className="customer-site">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                menuItems={menuItems}
                settings={settings}
                onNavigate={(id) => {
                    setSidebarOpen(false);
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
            />

            {/* ── NAVBAR ── */}
            <nav
                className="home-navbar"
                style={{ backgroundColor: settings?.white_color || '#ffffff' }}
            >
                <div className="home-navbar__inner">
                    {/* Hamburger (mobile) */}
                    <button
                        className="home-navbar__hamburger"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <span /><span /><span />
                    </button>

                    {/* Logo */}
                    <div className="home-navbar__logo">
                        {getLogoUrl() ? (
                            <img src={getLogoUrl()} alt={settings?.site_name || 'Logo'} />
                        ) : (
                            <span style={{ color: settings?.black_color || '#000', fontWeight: 600, fontSize: '1.2rem' }}>
                                {settings?.site_name || 'Restaurant'}
                            </span>
                        )}
                    </div>

                    {/* Nav links from top menu */}
                    <ul className="home-navbar__links">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    className="home-navbar__link"
                                    onClick={() => handleNavClick(item)}
                                    style={{ color: settings?.black_color || '#1a1a1a' }}
                                >
                                    {item.link_text || item.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* ── HERO / LANDING SECTION ── */}
            <section
                id="home"
                className="home-hero"
                style={{ backgroundColor: settings?.main_color || '#e4e590' }}
            >
                {/* Background image (optional) */}
                {getBannerImageUrl() && (
                    <div
                        className="home-hero__bg-image"
                        style={{ backgroundImage: `url(${getBannerImageUrl()})` }}
                    />
                )}

                {/* Decorative background shapes */}
                <div className="home-hero__deco">
                    <div
                        className="home-hero__deco-circle home-hero__deco-circle--1"
                        style={{ borderColor: settings?.color_three || '#699b65' }}
                    />
                    <div
                        className="home-hero__deco-circle home-hero__deco-circle--2"
                        style={{ borderColor: settings?.color_one || '#a7a7a7' }}
                    />
                    <div
                        className="home-hero__deco-dots"
                        style={{ color: settings?.color_three || '#699b65' }}
                    >
                        {Array.from({ length: 20 }).map((_, i) => (
                            <span key={i} className="home-hero__dot" />
                        ))}
                    </div>
                    <div
                        className="home-hero__deco-line"
                        style={{ backgroundColor: settings?.color_one || '#a7a7a7' }}
                    />
                </div>

                <div className="home-hero__content">
                    {/* LEFT — text */}
                    <div className="home-hero__left">
                        {heroBanner?.subtitle && (
                            <p
                                className="home-hero__small-heading"
                                style={{ color: settings?.black_color || '#000000' }}
                            >
                                {heroBanner.subtitle}
                            </p>
                        )}

                        <h1
                            className="home-hero__main-heading"
                            style={{ color: settings?.color_three || '#699b65' }}
                        >
                            {heroBanner?.title || 'Handcrafted Indian Flavours, Straight from the Heart'}
                        </h1>

                        {heroBanner?.description && (
                            <p
                                className="home-hero__description"
                                style={{ color: settings?.color_two || '#0e0d0b' }}
                            >
                                {heroBanner.description}
                            </p>
                        )}

                        <div className="home-hero__buttons">
                            <button
                                className="home-hero__btn home-hero__btn--primary"
                                style={{
                                    backgroundColor: settings?.color_one || '#a7a7a7',
                                    color: settings?.white_color || '#ffffff',
                                }}
                                onClick={() => navigate('/our-menus')}
                            >
                                Explore Products
                            </button>
                            <button
                                className="home-hero__btn home-hero__btn--secondary"
                                style={{
                                    backgroundColor: settings?.color_eight || '#121111',
                                    color: settings?.white_color || '#ffffff',
                                }}
                                onClick={() => {
                                    const el = document.getElementById('about');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Our Story
                            </button>
                        </div>
                    </div>

                    {/* RIGHT — stats */}
                    {statsList.length > 0 && (
                        <div className="home-hero__right">
                            <div className="home-hero__stats">
                                {statsList.map((stat, i) => (
                                    <div
                                        key={i}
                                        className="home-hero__stat"
                                        style={{
                                            borderColor: settings?.color_three || '#699b65',
                                        }}
                                    >
                                        <span
                                            className="home-hero__stat-value"
                                            style={{ color: settings?.color_three || '#699b65' }}
                                        >
                                            {stat.value}
                                        </span>
                                        <span
                                            className="home-hero__stat-label"
                                            style={{ color: settings?.black_color || '#000000' }}
                                        >
                                            {stat.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── REST OF SECTIONS ── */}
            {/* <MenuSection id="menu" /> */}
            <AboutUsSection id="about" />
            <SpecialDishesSection id="special-dishes" />
            <ChefsSelectionSection id="chefs-selection" />
            <SpecialOffersSection id="special-offers" />
            <BookingFormContent />
            <VideoStatsSection />
            <BlogsSection />
            <Footer />

            <WhatsAppButton phone={settings?.whatsapp_number || '876543219'} />
        </div>
    );
}

export default Home;
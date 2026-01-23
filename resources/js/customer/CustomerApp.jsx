import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CategoryMenu from './pages/CategoryMenu';
import PageView from './pages/PageView';
import MainMenu from './pages/MainMenu';
import CategoryDetail from './pages/CategoryDetail';
import OurMenus from './pages/OurMenus';
import BookingPage from './pages/BookingPage';
import ContactUsPage from './pages/ContactUsPage';
import AboutPage from './pages/AboutPage';
import PopupAd from './components/PopupAd';
import AllBlogs from './pages/AllBlogs';
import BlogDetail from './pages/BlogDetail';

import './styles/customer.css';

function CustomerApp() {
    return (
        <>
            {/* Popup Ad - Shows on all customer pages */}
            <PopupAd />
            
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu/:categoryId" element={<CategoryMenu />} />
                <Route path="/page/:slug" element={<PageView />} />
                <Route path="/our-menu" element={<MainMenu />} />
                <Route path="/menu/category/:categoryId" element={<CategoryDetail />} />
                <Route path="/our-menus" element={<OurMenus />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/blogs" element={<AllBlogs />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/blog/:id" element={<BlogDetail />} /> {/* Fallback for ID-based routing */}
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/about" element={<AboutPage />} />
            </Routes>
        </>
    );
}

export default CustomerApp;
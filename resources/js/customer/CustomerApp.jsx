import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CategoryMenu from './pages/CategoryMenu';
import PageView from './pages/PageView';
import MainMenu from './pages/MainMenu';
import CategoryDetail from './pages/CategoryDetail';
import './styles/customer.css';

function CustomerApp() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu/:categoryId" element={<CategoryMenu />} />
            <Route path="/page/:slug" element={<PageView />} />
            <Route path="/our-menu" element={<MainMenu />} />
            <Route path="/menu/category/:categoryId" element={<CategoryDetail />} />
        </Routes>
    );
}

export default CustomerApp;
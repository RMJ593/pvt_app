import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AdminLayout from './components/Layout/AdminLayout';
import CategoryList from './components/Categories/CategoryList';
import CategoryForm from './components/Categories/CategoryForm';
import ProductList from './components/Products/ProductList';
import ProductForm from './components/Products/ProductForm';
import MenuItemList from './components/MenuItems/MenuItemList';
import MenuItemForm from './components/MenuItems/MenuItemForm';
import TeamMemberList from './components/TeamMembers/TeamMemberList';
import TeamMemberForm from './components/TeamMembers/TeamMemberForm';
import TestimonialList from './components/Testimonials/TestimonialList';
import TestimonialForm from './components/Testimonials/TestimonialForm';
import GalleryList from './components/Gallery/GalleryList';
import GalleryForm from './components/Gallery/GalleryForm';
import HeroBanner from './components/HeroBanner/HeroBanner';
import PageList from './components/Pages/PageList';
import PageForm from './components/Pages/PageForm';
import TopMenuList from './components/TopMenu/TopMenuList';
import TopMenuForm from './components/TopMenu/TopMenuForm';
import FooterLinksList from './components/FooterLinks/FooterLinksList';
import FooterLinksForm from './components/FooterLinks/FooterLinksForm';
import GeneralSettings from './components/Settings/GeneralSettings';
import DomainSettings from './components/DomainSettings/DomainSettings';
import BlogList from './components/Blogs/BlogList';
import BlogForm from './components/Blogs/BlogForm';
import BlogCategoryList from './components/BlogCategories/BlogCategoryList';
import BlogCategoryForm from './components/BlogCategories/BlogCategoryForm';
import MailTemplateList from './components/MailTemplates/MailTemplateList';
import MailTemplateForm from './components/MailTemplates/MailTemplateForm';
import RoleList from './components/Roles/RoleList';
import RoleForm from './components/Roles/RoleForm';
import UserList from './components/Users/UserList';
import UserForm from './components/Users/UserForm';
import UserResponseList from './components/UserResponses/UserResponseList';
import TableBookingList from './components/TableBookings/TableBookingList';
import { getApiUrl } from './config/api';

function AdminApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem('auth_token')
    );
    const [username, setUsername] = useState('Super Admin');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserDetails();
        }
    }, [isAuthenticated]);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(getApiUrl('me'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            let userData = null;
            if (response.data.success && response.data.data) {
                userData = response.data.data;
            } else if (response.data.user) {
                userData = response.data.user;
            } else if (response.data.name) {
                userData = response.data;
            }
            
            if (userData) {
                setUsername(userData.name || userData.username || 'Super Admin');
                setUserEmail(userData.email || '');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleLogin = (token, userData) => {
        localStorage.setItem('auth_token', token);
        setIsAuthenticated(true);
        
        if (userData) {
            setUsername(userData.name || userData.username || 'Super Admin');
            setUserEmail(userData.email || '');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setUsername('Super Admin');
        setUserEmail('');
    };

    return (
        <Routes>
            {/* LOGIN ROUTE at /login */}
            <Route 
                path="/login" 
                element={
                    isAuthenticated ? 
                    <Navigate to="/staff/dashboard" replace /> : 
                    <Login onLogin={handleLogin} />
                } 
            />
            
            {/* PROTECTED STAFF ROUTES */}
            <Route 
                path="/staff/*" 
                element={
                    isAuthenticated ? (
                        <AdminLayout onLogout={handleLogout} username={username} userEmail={userEmail}>
                            <Routes>
                                <Route path="dashboard" element={<Dashboard username={username} />} />
                                
                                <Route path="domain-settings" element={<DomainSettings />} />
                                
                                <Route path="top-menu" element={<TopMenuList />} />
                                <Route path="top-menu/create" element={<TopMenuForm />} />
                                <Route path="top-menu/:id/edit" element={<TopMenuForm />} />
                                
                                <Route path="hero-banners" element={<HeroBannerList />} />
                                
                                <Route path="pages" element={<PageList />} />
                                <Route path="pages/create" element={<PageForm />} />
                                <Route path="pages/:id/edit" element={<PageForm />} />
                                
                                <Route path="categories" element={<CategoryList />} />
                                <Route path="categories/create" element={<CategoryForm />} />
                                <Route path="categories/:id/edit" element={<CategoryForm />} />
                                
                                <Route path="products" element={<ProductList />} />
                                <Route path="products/create" element={<ProductForm />} />
                                <Route path="products/:id/edit" element={<ProductForm />} />
                                
                                <Route path="menu-items" element={<MenuItemList />} />
                                <Route path="menu-items/create" element={<MenuItemForm />} />
                                <Route path="menu-items/:id/edit" element={<MenuItemForm />} />
                                
                                <Route path="team-members" element={<TeamMemberList />} />
                                <Route path="team-members/create" element={<TeamMemberForm />} />
                                <Route path="team-members/:id/edit" element={<TeamMemberForm />} />
                                
                                <Route path="gallery" element={<GalleryList />} />
                                <Route path="gallery/create" element={<GalleryForm />} />
                                <Route path="gallery/:id/edit" element={<GalleryForm />} />
                                
                                <Route path="testimonials" element={<TestimonialList />} />
                                <Route path="testimonials/create" element={<TestimonialForm />} />
                                <Route path="testimonials/:id/edit" element={<TestimonialForm />} />
                                
                                <Route path="user-responses" element={<UserResponseList />} />
                                <Route path="table-bookings" element={<TableBookingList />} />
                                
                                <Route path="settings" element={<GeneralSettings />} />
                                
                                <Route path="footer-links" element={<FooterLinksList />} />
                                <Route path="footer-links/create" element={<FooterLinksForm />} />
                                <Route path="footer-links/:id/edit" element={<FooterLinksForm />} />
                                
                                <Route path="blog-categories" element={<BlogCategoryList />} />
                                <Route path="blog-categories/create" element={<BlogCategoryForm />} />
                                <Route path="blog-categories/:id/edit" element={<BlogCategoryForm />} />
                                
                                <Route path="blogs" element={<BlogList />} />
                                <Route path="blogs/create" element={<BlogForm />} />
                                <Route path="blogs/:id/edit" element={<BlogForm />} />
                                
                                <Route path="mail-templates" element={<MailTemplateList />} />
                                <Route path="mail-templates/create" element={<MailTemplateForm />} />
                                <Route path="mail-templates/:id/edit" element={<MailTemplateForm />} />
                                
                                <Route path="roles" element={<RoleList />} />
                                <Route path="roles/create" element={<RoleForm />} />
                                <Route path="roles/:id/edit" element={<RoleForm />} />
                                
                                <Route path="users" element={<UserList />} />
                                <Route path="users/create" element={<UserForm />} />
                                <Route path="users/:id/edit" element={<UserForm />} />
                                
                                {/* Redirect /staff to /staff/dashboard */}
                                <Route path="/" element={<Navigate to="dashboard" replace />} />
                                
                                {/* Catch-all for unknown staff routes */}
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </AdminLayout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                } 
            />
        </Routes>
    );
}

export default AdminApp;
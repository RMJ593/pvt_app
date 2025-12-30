import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronDown, ChevronRight } from 'lucide-react';
import './AdminLayout.css';

function AdminLayout({ children, onLogout, username = "Super Admin", userEmail = "" }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menusExpanded, setMenusExpanded] = useState(false);
    const [blogExpanded, setBlogExpanded] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { label: 'Dashboard', path: '/staff/dashboard', emoji: '🎨' },
    ];

    const sections = [
        {
            title: 'USERS',
            items: [
                { label: 'Permissions', path: '/staff/permissions', emoji: '🔑' },
                { label: 'Roles', path: '/staff/roles', emoji: '🕵️' },
                { label: 'Users', path: '/staff/users', emoji: '👥' },
                { label: 'User Responses', path: '/staff/user-responses', emoji: '💬' },
                { label: 'Table Bookings', path: '/staff/table-bookings', emoji: '🍴' },
            ]
        },
        {
            title: 'WEB PAGE',
            items: [
                { label: 'Domain Settings', path: '/staff/domain-settings', emoji: '⚙️' },
                { 
                    label: 'Menus & Links', 
                    path: '/staff/menus', 
                    emoji: '⚓',
                    hasSubmenu: true,
                    expandState: menusExpanded,
                    setExpandState: setMenusExpanded,
                    submenu: [
                        { label: 'Top Menus', path: '/staff/top-menu' },
                        { label: 'Footer Links', path: '/staff/footer-links' },
                    ]
                },
                { label: 'Hero Banner', path: '/staff/hero-banners', emoji: '🖼️' },
                { label: 'Pages', path: '/staff/pages', emoji: '📄' },
            ]
        },
        {
            title: 'CONTENT',
            items: [
                { label: 'Team Members', path: '/staff/team-members', emoji: '👥' },
                { label: 'Testimonials', path: '/staff/testimonials', emoji: 'ℹ️' },
                { label: 'Gallery Images', path: '/staff/gallery', emoji: '🎴' },
            ]
        },
        {
            title: 'PRODUCTS',
            items: [
                { label: 'Categories', path: '/staff/categories', emoji: '📁' },
                { label: 'Products', path: '/staff/products', emoji: '🛒' },
            ]
        },
        {
            title: 'BLOG',
            items: [
                { 
                    label: 'Blog Management', 
                    path: '/staff/blog', 
                    emoji: '📝',
                    hasSubmenu: true,
                    expandState: blogExpanded,
                    setExpandState: setBlogExpanded,
                    submenu: [
                        { label: 'Categories', path: '/staff/blog-categories' },
                        { label: 'Blogs', path: '/staff/blogs' },
                    ]
                },
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { label: 'General Settings', path: '/staff/settings', emoji: '🔧' },
                { label: 'Mail Templates', path: '/staff/mail-templates', emoji: '📧' },
                { label: 'Clear Cache', path: '/staff/clear-cache', emoji: '↩️' },
                { label: 'Sync with Website', path: '/staff/sync', emoji: '🔄' },
            ]
        }
    ];

    const renderMenuItem = (item) => {
        if (item.hasSubmenu) {
            const isExpanded = item.expandState;
            const setExpanded = item.setExpandState;
            
            return (
                <div key={item.path} className="sidebar-item-with-submenu">
                    <div
                        className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
                        onClick={() => setExpanded(!isExpanded)}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="sidebar-emoji">{item.emoji}</span>
                        {sidebarOpen && (
                            <>
                                <span className="sidebar-text">{item.label}</span>
                                <span className="dropdown-icon">
                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </span>
                            </>
                        )}
                    </div>
                    {isExpanded && sidebarOpen && (
                        <div className="submenu">
                            {item.submenu.map((subItem) => (
                                <Link
                                    key={subItem.path}
                                    to={subItem.path}
                                    className={`submenu-item ${isActive(subItem.path) ? 'submenu-item-active' : ''}`}
                                >
                                    {subItem.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
            >
                <span className="sidebar-emoji">{item.emoji}</span>
                {sidebarOpen && <span className="sidebar-text">{item.label}</span>}
            </Link>
        );
    };

    return (
        <div className={`admin-container ${sidebarOpen ? '' : 'sidebar-is-closed'}`}>
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="sidebar-header">
                    {sidebarOpen ? (
                        <div className="sidebar-header-open">
                            <div className="logo-container">
                                <div className="extended-logo">EXTENDED LOGO</div>
                            </div>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle">
                                <Menu size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="sidebar-header-closed">
                            <div className="small-logo">L</div>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle">
                                <Menu size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
                        >
                            <span className="sidebar-emoji">{item.emoji}</span>
                            {sidebarOpen && <span className="sidebar-text">{item.label}</span>}
                        </Link>
                    ))}

                    {sections.map((section) => (
                        <div key={section.title} className="sidebar-section">
                            {sidebarOpen && (
                                <div className="sidebar-section-header">
                                    <h3 className="sidebar-section-title">{section.title}</h3>
                                </div>
                            )}
                            {section.items.map((item) => renderMenuItem(item))}
                        </div>
                    ))}
                </nav>
            </aside>

            <div className="main-content">
                <header className="top-header">
                    <div className="header-container">
                        <div className="header-left"></div>
                        <div className="header-center">
                            <button className="sync-button">Sync with Website</button>
                            <a href="https://www.yourrestaurant.com" target="_blank" rel="noopener noreferrer" className="website-link">
                                www.yourrestaurant.com
                            </a>
                        </div>
                        <div className="header-right">
                            <div className="user-info">
                                <p className="user-name">{username}</p>
                                {userEmail && <p className="user-email">{userEmail}</p>}
                                <button onClick={onLogout} className="logout-button">Logout</button>
                            </div>
                            <div className="profile-avatar">{username.charAt(0).toUpperCase()}</div>
                        </div>
                    </div>
                </header>
                <main className="page-content">{children}</main>
            </div>
        </div>
    );
}

export default AdminLayout;
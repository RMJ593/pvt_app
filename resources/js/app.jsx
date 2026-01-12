// resources/js/app.jsx
import './bootstrap'; // This already configures axios
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminApp from './AdminApp';
import CustomerApp from './customer/CustomerApp';

// ✅ NO axios configuration here - it's already done in bootstrap.js

function App() {
    const path = window.location.pathname;

    // Admin routes: /login, /staff/*
    if (path === '/login' || path.startsWith('/staff')) {
        return <AdminApp />;
    }

    // Customer routes: everything else
    return <CustomerApp />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
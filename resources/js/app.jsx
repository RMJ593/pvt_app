// resources/js/app.jsx (or main entry point)
import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import AdminApp from './AdminApp';
import CustomerApp from './customer/CustomerApp';

// ⚠️ GLOBAL AXIOS CONFIGURATION - Must be BEFORE any components load
axios.defaults.baseURL = `${window.location.origin}/api`;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';

console.log('🌍 Global Axios Base URL:', axios.defaults.baseURL);

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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../../config/api';
import './login.css';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // This will call: baseURL + /api/login = window.origin + /api/login
            const response = await axios.post(getApiUrl('login'), {
                email: email,
                password: password
            });
            
            console.log('✅ Login response:', response.data);
            
            // Handle different response formats
            let token, user;
            
            if (response.data.success && response.data.data) {
                token = response.data.data.token;
                user = response.data.data.user;
            } else if (response.data.token) {
                token = response.data.token;
                user = response.data.user;
            }
            
            if (token && user) {
                onLogin(token, user);
                navigate('/staff/dashboard');
            } else {
                setError('Login failed. Invalid response format.');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            
            if (error.response?.status === 401) {
                setError('Invalid email or password');
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Admin Login</h1>
                    <p className="login-subtitle">Restaurant Management System</p>
                </div>
                
                {error && <div className="login-error">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label className="login-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            placeholder="admin@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    
                    <div className="login-form-group">
                        <label className="login-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="login-button">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="/">← Back to Website</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
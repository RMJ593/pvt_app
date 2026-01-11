import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

function Login({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if already logged in
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            navigate('/staff/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post('/api/login', {
                email: email,
                password: password
            });
            
            console.log('Login response:', response.data);
            
            // Check different response formats
            let token, user;
            
            if (response.data.success && response.data.data) {
                // Format: { success: true, data: { token, user } }
                token = response.data.data.token;
                user = response.data.data.user;
            } else if (response.data.token) {
                // Format: { token, user }
                token = response.data.token;
                user = response.data.user;
            }
            
            if (token && user) {
                // Call parent's onLogin function
                onLogin(token, user);
                
                // Navigate to dashboard
                navigate('/staff/dashboard');
            } else {
                setError('Login failed. Invalid response format.');
            }
        } catch (error) {
            console.error('Login error:', error);
            
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
                    <h1 className="login-title">Staff Login</h1>
                    <p className="login-subtitle">Restaurant Management System</p>
                </div>
                
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}
                
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
                            autoFocus
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
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="login-button"
                    >
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
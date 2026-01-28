import axios from 'axios';
import API_BASE_URL from '../config/api.config.js';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        // Get token from cookies if available
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (import.meta.env.MODE === 'development') {
            console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and errors globally
api.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.MODE === 'development') {
            console.log(`✅ API Response: ${response.config.url}`, response.data);
        }
        return response;
    },
    (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            
            console.error(`❌ API Error [${status}]:`, data.message || error.message);
            
            // Handle specific status codes
            switch (status) {
                case 401:
                    // Only redirect to login for protected routes, not public endpoints
                    const publicPaths = ['/', '/blogs', '/blogs/', '/blogs/:slug', '/pricing', '/contactus', '/signup'];
                    const isPublic = publicPaths.some(path => window.location.pathname === path || window.location.pathname.startsWith(path));
                    if (!isPublic && window.location.pathname !== '/login') {
                        Cookies.remove('token');
                        Cookies.remove('id');
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    // Forbidden - do NOT clear cookies, just log
                    console.warn('403 Forbidden: access denied, cookies NOT cleared');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    break;
            }
        } else if (error.request) {
            // Request made but no response
            console.error('❌ No response from server:', error.message);
        } else {
            // Something else happened
            console.error('❌ Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;

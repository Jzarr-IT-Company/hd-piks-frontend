import axios from 'axios';
import API_BASE_URL from '../config/api.config.js';
import Cookies from 'js-cookie';

// Match admin routes like /admin/* so we can send the admin bearer token.
const isAdminUrl = (url = '') => /^\/admin(\/|$)/i.test(String(url || ''));

const publicExactPaths = new Set([
    '/',
    '/pricing',
    '/contactus',
    '/login',
    '/signup',
    '/design-hdpiks',
    '/collections',
    '/termsandcondition',
    '/blog',
    '/blogs1',
    '/blogs2',
    '/blogs3',
    '/blogs4',
    '/company',
    '/company/about-us',
    '/company/contact-us',
    '/company/help-center',
    '/company/legal',
]);

const publicRegexPaths = [
    /^\/admin\/login$/i,
    /^\/collection\/[^/]+$/i,
    /^\/memberdetail\/[^/]+$/i,
    /^\/creatordetail\/[^/]+$/i,
    /^\/collections\/[^/]+$/i,
    /^\/videocollection\/[^/]+$/i,
    /^\/search\/[^/]+$/i,
    /^\/search\/[^/]+\/[^/]+$/i,
    /^\/asset\/[^/]+$/i,
    /^\/asset\/[^/]+\/[^/]+(?:\/[^/]+)?\/[^/]+$/i,
    /^\/ai\/[^/]+$/i,
    /^\/company\/legal\/[^/]+$/i,
    /^\/company\/help-center\/[^/]+$/i,
];

const normalizePathname = (pathname = '') => {
    if (!pathname || pathname === '/') return '/';
    return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const isPublicPath = (pathname = '') => {
    const normalized = normalizePathname(pathname);
    if (publicExactPaths.has(normalized)) return true;
    return publicRegexPaths.some((pattern) => pattern.test(normalized));
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (newToken) => {
    pendingQueue.forEach((cb) => cb(newToken));
    pendingQueue = [];
};

const shouldSkipRefresh = (url = '') => {
    return ['/login', '/signup', '/auth/refresh', '/admin/login'].some((x) => url.includes(x));
};

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        // Get token from cookies if available
        const isAdminContext =
            isAdminUrl(config?.url) ||
            normalizePathname(window.location.pathname).startsWith('/admin');
        const token = Cookies.get(isAdminContext ? 'adminToken' : 'token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log request in development
        if (import.meta.env.MODE === 'development') {
            console.log(`ðŸš€ API Request: ${config.method.toUpperCase()} ${config.url}`);
        }
        
        return config;
    },
    (error) => {
        console.error('âŒ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and errors globally
api.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.MODE === 'development') {
            console.log(`âœ… API Response: ${response.config.url}`, response.data);
        }
        return response;
    },
    async (error) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            
            console.error(`âŒ API Error [${status}]:`, data.message || error.message);
            
            // Handle specific status codes
            switch (status) {
                case 401:
                    // Try one refresh cycle for protected API calls before redirecting.
                    const originalRequest = error.config || {};

                    // Admin sessions do not use the user refresh token flow.
                    const isAdminContext =
                        isAdminUrl(originalRequest.url || '') ||
                        normalizePathname(window.location.pathname).startsWith('/admin');

                    if (isAdminContext) {
                        Cookies.remove('adminToken');
                        Cookies.remove('adminId');
                        if (normalizePathname(window.location.pathname) !== '/admin/login') {
                            window.location.href = '/admin/login';
                        }
                        break;
                    }
                    if (!originalRequest._retry && !shouldSkipRefresh(originalRequest.url || '')) {
                        originalRequest._retry = true;

                        if (isRefreshing) {
                            return new Promise((resolve, reject) => {
                                pendingQueue.push((token) => {
                                    if (!token) {
                                        reject(error);
                                        return;
                                    }
                                    originalRequest.headers = originalRequest.headers || {};
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                    resolve(api(originalRequest));
                                });
                            });
                        }

                        try {
                            isRefreshing = true;
                            const refreshResp = await axios.post(
                                `${API_BASE_URL}/auth/refresh`,
                                {},
                                { withCredentials: true, timeout: 30000 }
                            );
                            const newToken = refreshResp?.data?.accessToken;
                            if (newToken) {
                                // Access token stays short-lived; use session cookie.
                                Cookies.set('token', newToken);
                                flushQueue(newToken);
                                originalRequest.headers = originalRequest.headers || {};
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                return api(originalRequest);
                            }
                            flushQueue(null);
                        } catch (_refreshErr) {
                            flushQueue(null);
                        } finally {
                            isRefreshing = false;
                        }
                    }

                    const pathname = normalizePathname(window.location.pathname);
                    const isPublic = isPublicPath(pathname);
                    if (!isPublic && pathname !== '/login' && pathname !== '/admin/login') {
                        Cookies.remove('token');
                        Cookies.remove('id');
                        const target = pathname.startsWith('/admin') ? '/admin/login' : '/login';
                        window.location.href = target;
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
            console.error('âŒ No response from server:', error.message);
        } else {
            // Something else happened
            console.error('âŒ Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api;





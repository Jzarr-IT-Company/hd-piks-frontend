// (GET_USER_IMAGES is defined below inside API_ENDPOINTS)
// API Configuration for Development and Production
const API_CONFIG = {
    development: 'http://localhost:4000',
    production: 'https://hd-piks-backend02.vercel.app', // no trailing slash
};

const APP_ENV = import.meta.env.VITE_APP_ENV || import.meta.env.MODE; // 'development' or 'production'
const IS_DEV = APP_ENV === 'development';

// Get API base URL based on environment
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (IS_DEV ? API_CONFIG.development : API_CONFIG.production);

if (IS_DEV) {
    // Helps verify that dev is actually using the expected URL
    console.log('[API_CONFIG] MODE:', import.meta.env.MODE);
    console.log('[API_CONFIG] VITE_APP_ENV:', import.meta.env.VITE_APP_ENV);
    console.log('[API_CONFIG] APP_ENV (used):', APP_ENV);
    console.log('[API_CONFIG] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('[API_CONFIG] Resolved API_BASE_URL:', API_BASE_URL);
}

// Export individual endpoints for better organization
export const API_ENDPOINTS = {

    // Follow
    FOLLOW: '/follow',
    UNFOLLOW: '/unfollow',
    GET_FOLLOWERS: userId => `/followers/${userId}`,
    GET_FOLLOWING: userId => `/following/${userId}`,
    // Auth
    SIGNUP: '/signup',
    LOGIN: '/login',
    LOGOUT: '/logout',
    
    // Users
    GET_ALL_USERS: '/users',
    GET_SINGLE_USER: id => `/user/${id}`,
    UPDATE_USER: '/updateUserData',
    DELETE_USER: id => `/user/${id}`,
    APPLY_CONTRIBUTOR: '/applyContributor', // legacy
    GET_CONTRIBUTOR_STATUS: '/getContributorStatus', // legacy
    UPDATE_CONTRIBUTOR_STATUS: '/updateContributorStatus', // legacy

    // Creator (new, separate collection)
    CREATOR_APPLY: '/creator/apply',
    CREATOR_ME: '/creator/me',
    ADMIN_CREATOR_STATUS: '/admin/creator/status',
    GET_ALL_CREATORS: '/creators',
    GET_CREATOR_BY_ID: id => `/creators/${id}`,
    COLLECTIONS: '/collections',
    COLLECTION_ADD_ASSET: '/collections/addAsset',

    // NEW: public sub‑category collections (for HomeBanner, etc.)
    SUBCATEGORY_COLLECTIONS: '/subcategory-collections',
    SUBCATEGORY_COLLECTION_TOP: '/subcategory-collections-top',
    SUBCATEGORY_COLLECTION_BY_SLUG: slug => `/subcategory-collections/${slug}`,

    // NEW: admin sub‑category collections CRUD
    ADMIN_SUBCATEGORY_COLLECTIONS: '/admin/sub-category-collections',
    ADMIN_SUBCATEGORY_COLLECTION: id => `/admin/sub-category-collections/${id}`,

    // Images
    GET_ALL_IMAGES: '/AllImagesfromDB', // legacy full fetch, avoid in new components
    // NEW: paginated public assets endpoint for galleries
    ASSETS: '/assets',

    GET_IMAGES_BY_CREATOR_ID: '/getAllImages', // POST: { id: creatorId }
    GET_IMAGE_BY_ID: id => `/images/${id}`, // NEW
    SAVE_IMAGES: '/saveImages',
    DELETE_IMAGE: '/fileObjectDelete',
    // Search images by keyword/category/title/description.
    // Backend expects a query param, e.g. GET /searchFilterationImages?searchQuery=term
    SEARCH_IMAGES: '/searchFilterationImages',
    FILTER_BY_WORD: '/filterationByWord',
    APPROVE_IMAGES: '/approvedimages',
    REJECT_IMAGES: '/rejectedimages',
    
    // Likes
    SAVE_LIKE: '/saveLikes',
    UNLIKE: '/unLikController',
    
    // Payment
    PAYMENT: '/payment',
    ADD_PAYMENT_DETAIL: '/addPaymentDetail',
    
    // S3
    GET_PRESIGNED_URL: '/getPresignedUploadUrl',
    DELETE_S3_FILE: '/deleteS3File',
    GET_PRESIGNED_PROFILE_IMAGE_URL: '/getPresignedProfileImageUrl',
    SAVE_PROFILE_IMAGE_URL: '/saveProfileImageUrl',
    SAVE_CREATOR_PROFILE_IMAGE_URL: '/creator/saveProfileImageUrl',
    // S3 Multipart
    S3_MULTIPART_INIT: '/s3/multipart/initiate',
    S3_MULTIPART_PART_URL: '/s3/multipart/part-url',
    S3_MULTIPART_COMPLETE: '/s3/multipart/complete',
    S3_MULTIPART_ABORT: '/s3/multipart/abort',

    // Admin
    ADMIN_LOGIN: '/admin/login',
    // Admin Categories CRUD
    ADMIN_CATEGORIES: '/admin/categories',
    ADMIN_CATEGORY: id => `/admin/categories/${id}`,

    // Public categories (no auth, GET /categories -> getPublicCategories)
    PUBLIC_CATEGORIES: '/categories',

    // Blog (Admin)
    ADMIN_BLOGS: '/blogs',
    ADMIN_BLOG: id => `/blogs/${id}`,
};

export default API_BASE_URL;

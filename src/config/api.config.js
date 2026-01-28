// (GET_USER_IMAGES is defined below inside API_ENDPOINTS)
// API Configuration for Development and Production
const API_CONFIG = {
    development: 'http://localhost:5000',
    production: 'https://hdpicks-main-server.vercel.app'
};

// Get API base URL based on environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.MODE === 'development' 
        ? API_CONFIG.development 
        : API_CONFIG.production);

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
    // Images
    GET_ALL_IMAGES: '/AllImagesfromDB', // GET: all approved images and videos and othes assets 
    GET_IMAGES_BY_CREATOR_ID: '/getAllImages', // POST: { id: creatorId }
    SAVE_IMAGES: '/saveImages',
    DELETE_IMAGE: '/fileObjectDelete',
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

    // Blog (Admin)
    ADMIN_BLOGS: '/blogs',
    ADMIN_BLOG: id => `/blogs/${id}`,
};

export default API_BASE_URL;

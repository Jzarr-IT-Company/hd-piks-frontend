import api from './api.js';
import { API_ENDPOINTS } from '../config/api.config.js';

export const getFollowers = async (userId) => {
    const res = await api.get(API_ENDPOINTS.GET_FOLLOWERS(userId));
    return res.data;
};

export const getFollowing = async (userId) => {
    const res = await api.get(API_ENDPOINTS.GET_FOLLOWING(userId));
    return res.data;
};

export const followUser = async (followerId, followingId) => {
    const res = await api.post(API_ENDPOINTS.FOLLOW, { followerId, followingId });
    return res.data;
};

export const unfollowUser = async (followerId, followingId) => {
    const res = await api.post(API_ENDPOINTS.UNFOLLOW, { followerId, followingId });
    return res.data;
};

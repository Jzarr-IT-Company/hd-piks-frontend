import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';
import { useAuth } from '../../Context/AuthContext.jsx';
import { invalidateLikesRelatedQueries } from '../../utils/likesCache.js';

function LikeBttn({ imgId }) {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            if (!imgId) return;
            try {
                const response = await api.get(API_ENDPOINTS.ASSET_LIKE_COUNT(imgId));
                const count = response?.data?.data?.likesCount ?? 0;
                setLikesCount(Number(count || 0));
            } catch {
                setLikesCount(0);
            }
        };
        fetchCount();
    }, [imgId]);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!imgId || !userData?._id) {
                setLiked(false);
                return;
            }
            try {
                const response = await api.get(API_ENDPOINTS.ASSET_LIKE_STATUS(imgId));
                setLiked(Boolean(response?.data?.data?.liked));
            } catch {
                setLiked(false);
            }
        };
        fetchStatus();
    }, [imgId, userData?._id]);

    const handleClick = async () => {
        if (!imgId) return;
        if (!userData?._id) {
            message.info('Please login to like assets.');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        if (loading) return;

        const nextLiked = !liked;
        setLoading(true);
        setLiked(nextLiked);
        setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

        try {
            if (nextLiked) {
                await api.post(API_ENDPOINTS.ASSET_LIKE(imgId));
                message.success('Liked');
            } else {
                await api.delete(API_ENDPOINTS.ASSET_LIKE(imgId));
                message.success('Unliked');
            }
            await invalidateLikesRelatedQueries();
        } catch (error) {
            setLiked(!nextLiked);
            setLikesCount((prev) => Math.max(0, prev + (nextLiked ? -1 : 1)));
            const status = error?.response?.status;
            if (status === 401) {
                message.error('Session expired. Please login again.');
            } else if (status === 409) {
                setLiked(true);
            } else {
                message.error(error?.response?.data?.message || 'Unable to update like');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
       <>
       <button
            onClick={handleClick}
            style={{ fontSize: "17px" }}
            disabled={loading}
            className={`btn border px-4 fw-semibold py-3 d-none d-md-block ${liked ? 'text-danger' : 'text-secondary'}`}
        >
            <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            {liked ? " Liked" : " Like"} ({likesCount})
        </button>
        <button
            onClick={handleClick}
            style={{fontSize:"18px"}}
            disabled={loading}
            className={`btn border fw-semibold d-block d-md-none ${liked ? 'text-danger' : 'text-secondary'}`}
        >
            <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
        </button>
       </>
    );
}

export default LikeBttn;

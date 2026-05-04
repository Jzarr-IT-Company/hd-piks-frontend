import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import api from '../../Services/api.js';
import { API_ENDPOINTS } from '../../config/api.config.js';
import { useAuth } from '../../Context/AuthContext.jsx';
import { invalidateLikesRelatedQueries } from '../../utils/likesCache.js';

function LikeBttnSm({
    imgId,
    compact = false,
    compactSize = 34,
    stopPropagation = false,
    initialLikesCount = undefined,
    initialLiked = undefined,
    skipInvalidate = false,
}) {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        if (initialLikesCount !== undefined && initialLikesCount !== null) {
            setLikesCount(Number(initialLikesCount || 0));
            return;
        }

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
    }, [imgId, initialLikesCount]);

    useEffect(() => {
        if (initialLiked !== undefined && initialLiked !== null) {
            setLiked(Boolean(initialLiked));
            return;
        }

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
    }, [imgId, userData?._id, initialLiked]);

    const handleClick = async (event) => {
        if (stopPropagation && event?.stopPropagation) {
            event.stopPropagation();
        }
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
                const response = await api.post(API_ENDPOINTS.ASSET_LIKE(imgId));
                const count = response?.data?.data?.likesCount;
                if (Number.isFinite(Number(count))) setLikesCount(Number(count));
                message.success('Liked');
            } else {
                const response = await api.delete(API_ENDPOINTS.ASSET_LIKE(imgId));
                const count = response?.data?.data?.likesCount;
                if (Number.isFinite(Number(count))) setLikesCount(Number(count));
                message.success('Unliked');
            }
            if (!skipInvalidate) {
                await invalidateLikesRelatedQueries();
            }
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
        <button
            onClick={handleClick}
            style={{
                fontSize: compact ? "14px" : "11px",
                width: compact ? compactSize : undefined,
                height: compact ? compactSize : undefined,
                borderRadius: compact ? 8 : undefined,
                padding: compact ? 0 : undefined,
                background: compact ? "rgba(255,255,255,0.94)" : undefined,
                color: compact ? (liked ? "#dc2626" : "#111111") : undefined,
                border: compact ? "none" : undefined,
                boxShadow: compact ? "0 6px 18px rgba(15,23,42,0.18)" : undefined,
            }}
            disabled={loading}
            className={`btn ${compact ? '' : 'border px-4 fw-semibold py-3'} ${compact ? '' : (liked ? 'text-danger' : 'text-secondary')}`}
            title={liked ? "Unlike" : "Like"}
            aria-label={liked ? "Unlike asset" : "Like asset"}
        >
            <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            {!compact ? `${liked ? " Liked" : " Like"} (${likesCount})` : null}
        </button>
    );
}

export default LikeBttnSm;

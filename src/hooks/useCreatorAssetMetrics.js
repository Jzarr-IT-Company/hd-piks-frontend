import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../Services/api";
import { API_ENDPOINTS } from "../config/api.config";

export default function useCreatorAssetMetrics(creatorId, userData) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!creatorId) {
            setItems([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await api.post(API_ENDPOINTS.GET_IMAGES_BY_CREATOR_ID, { id: creatorId });
            if (response.data?.status === 200) {
                setItems(response.data?.data || []);
            } else {
                setItems([]);
            }
        } catch (err) {
            setItems([]);
            setError(err?.response?.data?.message || "Failed to load creator metrics");
        } finally {
            setLoading(false);
        }
    }, [creatorId]);

    useEffect(() => {
        load();
    }, [load]);

    const stats = useMemo(() => {
        const downloads = items.reduce((acc, item) => acc + (item.downloads || item.download || 0), 0);
        const likes = items.reduce((acc, item) => acc + (item.likes || 0), 0);
        const files = items.length;
        const earnings = "-- EUR";
        const accountDownloads = userData?.download || 0;
        return { downloads, likes, files, earnings, accountDownloads };
    }, [items, userData]);

    const topDownloaded = useMemo(() => {
        return [...items]
            .sort((a, b) => (b.downloads || b.download || 0) - (a.downloads || a.download || 0))
            .slice(0, 10);
    }, [items]);

    const trendPoints = useMemo(() => {
        const bucket = new Map();
        items.forEach((item) => {
            const rawDate = item?.updatedAt || item?.createdAt;
            if (!rawDate) return;
            const date = new Date(rawDate);
            if (Number.isNaN(date.getTime())) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            bucket.set(key, (bucket.get(key) || 0) + (item.downloads || item.download || 0));
        });
        return Array.from(bucket.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6)
            .map(([label, value]) => ({ label, value }));
    }, [items]);

    return {
        items,
        loading,
        error,
        reload: load,
        stats,
        topDownloaded,
        trendPoints,
    };
}


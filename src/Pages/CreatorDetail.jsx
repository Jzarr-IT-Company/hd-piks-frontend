import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { message } from "antd";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";
import { useCreatorPublicProfileQuery } from "../query/creatorDetailQueries.js";
import { useAuth } from "../Context/AuthContext.jsx";
import { getMediaVariantUrl } from "../utils/mediaVariants.js";

function CreatorDetail() {
    const { creatorId } = useParams();
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [page, setPage] = useState(1);
    const [tab, setTab] = useState("assets");
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(null);
    const [followError, setFollowError] = useState("");

    useEffect(() => {
        setPage(1);
        setTab("assets");
    }, [creatorId]);

    const query = useCreatorPublicProfileQuery(creatorId, page, 12);
    const data = query.data || {};
    const creator = data.creator || {};
    const stats = data.stats || {};
    const pagination = data.pagination || { page: 1, totalPages: 1 };
    const recentAssets = Array.isArray(data.recentAssets) ? data.recentAssets : [];
    const topAssets = Array.isArray(data.topAssets) ? data.topAssets : [];
    const viewerUserId = String(userData?._id || "");
    const creatorUserId = String(creator?.userId || "");
    const isOwnProfile = Boolean(viewerUserId && creatorUserId && viewerUserId === creatorUserId);

    const normalize = useCallback((value) => {
        if (typeof value === "string") return value.trim().toLowerCase();
        if (value == null) return "";
        return String(value).trim().toLowerCase();
    }, []);

    const slugify = useCallback((value) => {
        const base = normalize(value);
        if (!base) return "";
        return base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }, [normalize]);

    const buildAssetUrl = useCallback((asset) => {
        const categorySlug = slugify(asset?.category);
        const subSlug = slugify(asset?.subcategory);
        const subSubSlug = slugify(asset?.subsubcategory);
        const segments = ["/asset"];
        if (categorySlug) segments.push(categorySlug);
        if (subSlug) segments.push(subSlug);
        if (subSubSlug) segments.push(subSubSlug);
        if (asset?._id) segments.push(asset._id);
        return segments.join("/");
    }, [slugify]);

    const visibleAssets = useMemo(() => (
        tab === "top" ? topAssets : recentAssets
    ), [tab, topAssets, recentAssets]);

    useEffect(() => {
        if (!creator?._id || !userData?._id) {
            setIsFollowing(false);
            return;
        }

        let cancelled = false;
        const fetchFollowState = async () => {
            try {
                setFollowError("");
                const res = await api.get(API_ENDPOINTS.CREATOR_FOLLOW_STATUS(creator._id));
                if (cancelled) return;
                const payload = res?.data?.data || {};
                setIsFollowing(Boolean(payload.isFollowing));
                if (typeof payload.followersCount === "number") {
                    setFollowersCount(payload.followersCount);
                }
            } catch (e) {
                if (!cancelled) setIsFollowing(false);
                const status = e?.response?.status;
                if (!cancelled && status === 401) {
                    setFollowError("Session expired. Please login again.");
                }
            }
        };
        fetchFollowState();
        return () => {
            cancelled = true;
        };
    }, [creator?._id, userData?._id]);

    useEffect(() => {
        if (typeof stats.followers === "number") {
            setFollowersCount(stats.followers);
        }
    }, [stats.followers]);

    const handleFollowToggle = async () => {
        setFollowError("");
        if (!userData?._id) {
            alert("Please login to follow creators.");
            navigate("/login", { state: { from: window.location.pathname } });
            return;
        }
        if (!creator?._id) {
            setFollowError("Creator profile not available.");
            return;
        }
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await api.delete(API_ENDPOINTS.UNFOLLOW_CREATOR(creator._id));
                setIsFollowing(false);
                setFollowersCount((prev) => Math.max((prev ?? 0) - 1, 0));
                message.success("Unfollowed successfully");
            } else {
                await api.post(API_ENDPOINTS.FOLLOW_CREATOR(creator._id));
                setIsFollowing(true);
                setFollowersCount((prev) => (prev ?? 0) + 1);
                message.success("Followed successfully");
            }
        } catch (e) {
            const status = e?.response?.status;
            if (status === 409) {
                setIsFollowing(true);
            } else if (status === 401) {
                setFollowError("Session expired. Please login again.");
            } else {
                setFollowError(e?.response?.data?.message || "Failed to update follow status.");
            }
        } finally {
            setFollowLoading(false);
        }
    };

    if (query.isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <CircularProgress />
            </div>
        );
    }

    if (query.isError || !creator?._id) {
        return (
            <div className="container py-5">
                <h4 className="mb-2">Creator not found</h4>
                <p className="text-muted mb-0">This creator profile is not available.</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <img
                                src={creator.profileImageUrl || "https://via.placeholder.com/96x96?text=CR"}
                                alt={creator.displayName || "Creator"}
                                style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }}
                            />
                            <div>
                                <h3 className="mb-1">{creator.displayName || "Creator"}</h3>
                                <p className="text-muted mb-1">{creator.bio || "No bio provided yet."}</p>
                                <p className="text-muted mb-0">
                                    {[creator.city, creator.country].filter(Boolean).join(", ") || "Location not specified"}
                                </p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            {creator.website && (
                                <a href={creator.website} target="_blank" rel="noreferrer" className="btn btn-outline-secondary">
                                    Website
                                </a>
                            )}
                            <button
                                type="button"
                                className={`btn ${isFollowing ? "btn-outline-primary" : "btn-primary"}`}
                                onClick={handleFollowToggle}
                                disabled={followLoading || isOwnProfile}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        </div>
                    </div>
                    {followError && (
                        <div className="text-danger mt-2" style={{ fontSize: 13 }}>
                            {followError}
                        </div>
                    )}
                    <div className="row g-3 mt-2">
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-3">
                                <div className="text-muted small">Followers</div>
                                <div className="fs-4 fw-semibold">{followersCount ?? stats.followers ?? 0}</div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-3">
                                <div className="text-muted small">Likes</div>
                                <div className="fs-4 fw-semibold">{stats.likes || 0}</div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-3">
                                <div className="text-muted small">Downloads</div>
                                <div className="fs-4 fw-semibold">{stats.downloads || 0}</div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="border rounded p-3">
                                <div className="text-muted small">Assets</div>
                                <div className="fs-4 fw-semibold">{stats.assets || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex gap-2 mb-3">
                <button type="button" className={`btn ${tab === "assets" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("assets")}>
                    Latest Assets
                </button>
                <button type="button" className={`btn ${tab === "top" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("top")}>
                    Top Assets
                </button>
                <button type="button" className={`btn ${tab === "about" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setTab("about")}>
                    About
                </button>
            </div>

            {tab === "about" ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <h5 className="mb-3">About creator</h5>
                        <p className="mb-2"><strong>Name:</strong> {creator.displayName || "N/A"}</p>
                        <p className="mb-2"><strong>Bio:</strong> {creator.bio || "N/A"}</p>
                        <p className="mb-2"><strong>Location:</strong> {[creator.city, creator.country].filter(Boolean).join(", ") || "N/A"}</p>
                        <p className="mb-0"><strong>Status:</strong> {creator.status || "N/A"}</p>
                    </div>
                </div>
            ) : (
                <>
                    {visibleAssets.length === 0 ? (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4 text-muted">
                                No assets available yet.
                            </div>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {visibleAssets.map((asset) => (
                                <div className="col-12 col-sm-6 col-lg-4" key={asset._id}>
                                    <div className="card h-100 border-0 shadow-sm">
                                        <Link to={buildAssetUrl(asset)}>
                                            <img
                                                src={getMediaVariantUrl(asset, ["small", "medium", "thumbnail", "original"]) || asset.imageUrl}
                                                alt={asset.title || "Asset"}
                                                style={{ width: "100%", height: 220, objectFit: "cover" }}
                                            />
                                        </Link>
                                        <div className="card-body">
                                            <h6 className="mb-2 text-truncate">{asset.title || "Untitled"}</h6>
                                            <p className="mb-2 text-muted small">
                                                {[asset.category, asset.subcategory].filter(Boolean).join(" / ") || "Uncategorized"}
                                            </p>
                                            <div className="d-flex justify-content-between small">
                                                <span>{asset.downloads || 0} downloads</span>
                                                <span>{asset.likes || 0} likes</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === "assets" && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={pagination.page <= 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            >
                                Prev
                            </button>
                            <span className="small text-muted">
                                Page {pagination.page || 1} / {pagination.totalPages || 1}
                            </span>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
                                onClick={() => setPage((prev) => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CreatorDetail;

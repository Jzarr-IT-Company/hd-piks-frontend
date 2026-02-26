import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import { getMyPurchases } from '../Services/payment.js';
import { getMediaVariantUrl } from '../utils/mediaVariants.js';

const normalizeName = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') return String(value.name || '').trim();
    return String(value).trim();
};

const slugify = (value) =>
    normalizeName(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const formatDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleString();
};

const formatMoney = (amountCents, currency = 'USD') => {
    const cents = Number(amountCents);
    if (!Number.isFinite(cents)) return 'N/A';
    return `${String(currency || 'USD').toUpperCase()} ${(cents / 100).toFixed(2)}`;
};

const buildAssetPath = (asset = {}) => {
    if (!asset?._id) return null;
    const categorySlug = slugify(asset?.category?.name || asset?.category) || 'image';
    const subSlug = slugify(asset?.subcategory?.name || asset?.subcategory) || 'all';
    return `/asset/${categorySlug}/${subSlug}/${asset._id}`;
};

const getPreviewUrl = (asset = {}) =>
    getMediaVariantUrl(asset, ['thumbnail', 'small', 'medium', 'large', 'original']) || asset?.imageUrl || '';

function MyPurchases() {
    const [purchases, setPurchases] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadPurchases = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getMyPurchases({ page, limit: 20 });
            setPurchases(Array.isArray(response?.data) ? response.data : []);
            setPagination(response?.pagination || null);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to load purchases.');
            setPurchases([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadPurchases();
    }, [loadPurchases]);

    const hasPrev = Boolean(pagination?.hasPrevPage);
    const hasNext = Boolean(pagination?.hasNextPage);
    const summary = useMemo(() => {
        if (!pagination) return 'No purchases yet';
        return `Showing ${purchases.length} of ${pagination.totalItems || 0} purchases`;
    }, [purchases.length, pagination]);

    return (
        <DashboardShell>
            <section className="container-fluid py-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 className="fw-bold mb-1">My Purchases</h3>
                        <div className="text-muted small">{summary}</div>
                    </div>
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="row g-3">
                    {loading ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-4 text-center">Loading purchases...</div>
                        </div>
                    ) : purchases.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-4 text-center text-muted">
                                No purchased assets yet.
                            </div>
                        </div>
                    ) : (
                        purchases.map((entry) => {
                            const asset = entry?.asset || null;
                            const assetPath = buildAssetPath(asset || {});
                            const previewUrl = getPreviewUrl(asset || {});
                            return (
                                <div key={entry?.entitlementId || entry?.assetId} className="col-12 col-md-6 col-xl-4">
                                    <div className="card h-100 border-0 shadow-sm">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt={asset?.title || 'Purchased asset'}
                                                className="card-img-top"
                                                style={{ height: 180, objectFit: 'cover' }}
                                            />
                                        ) : null}
                                        <div className="card-body d-flex flex-column">
                                            <h6 className="fw-semibold mb-1">{asset?.title || 'Asset unavailable'}</h6>
                                            <div className="small text-muted mb-2">
                                                Creator: {entry?.creator?.displayName || 'Creator'}
                                            </div>
                                            <div className="small mb-1">
                                                Granted: {formatDate(entry?.grantedAt)}
                                            </div>
                                            <div className="small mb-3">
                                                Latest order: {entry?.latestOrder ? formatMoney(entry.latestOrder.amountCents, entry.latestOrder.currency) : 'N/A'}
                                            </div>
                                            <div className="mt-auto d-flex gap-2">
                                                {assetPath ? (
                                                    <Link to={assetPath} className="btn btn-primary btn-sm">
                                                        Open asset
                                                    </Link>
                                                ) : (
                                                    <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
                                                        Asset unavailable
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={!hasPrev || loading}
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={!hasNext || loading}
                    >
                        Next
                    </button>
                </div>
            </section>
        </DashboardShell>
    );
}

export default MyPurchases;

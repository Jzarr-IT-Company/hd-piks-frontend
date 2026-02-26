import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../Components/DashboardShell/DashboardShell';
import { getMyOrders } from '../Services/payment.js';

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

const formatMoney = (amountCents, currency = 'USD') => {
    const cents = Number(amountCents);
    if (!Number.isFinite(cents)) return 'N/A';
    return `${String(currency || 'USD').toUpperCase()} ${(cents / 100).toFixed(2)}`;
};

const formatDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleString();
};

const buildAssetPath = (asset = {}) => {
    const categorySlug = slugify(asset.categoryName) || 'image';
    const subSlug = slugify(asset.subcategoryName) || 'all';
    if (!asset?._id) return null;
    return `/asset/${categorySlug}/${subSlug}/${asset._id}`;
};

const getStatusBadgeClass = (status) => {
    switch (String(status || '').toLowerCase()) {
        case 'paid':
            return 'bg-success-subtle text-success';
        case 'pending':
            return 'bg-warning-subtle text-warning-emphasis';
        case 'failed':
            return 'bg-danger-subtle text-danger';
        case 'canceled':
            return 'bg-secondary-subtle text-secondary';
        case 'refunded':
            return 'bg-info-subtle text-info-emphasis';
        default:
            return 'bg-light text-dark';
    }
};

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                limit: 20,
            };
            if (statusFilter !== 'all') params.status = statusFilter;
            const response = await getMyOrders(params);
            setOrders(Array.isArray(response?.data) ? response.data : []);
            setPagination(response?.pagination || null);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to load orders.');
            setOrders([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const hasPrev = Boolean(pagination?.hasPrevPage);
    const hasNext = Boolean(pagination?.hasNextPage);
    const summary = useMemo(() => {
        if (!pagination) return 'No orders yet';
        return `Showing ${orders.length} of ${pagination.totalItems || 0} orders`;
    }, [orders.length, pagination]);

    return (
        <DashboardShell>
            <section className="container-fluid py-2">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                        <h3 className="fw-bold mb-1">My Orders</h3>
                        <div className="text-muted small">{summary}</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <label htmlFor="order-status-filter" className="small text-muted mb-0">Status</label>
                        <select
                            id="order-status-filter"
                            className="form-select form-select-sm"
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="canceled">Canceled</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Order</th>
                                    <th>Asset</th>
                                    <th>Creator</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Paid At</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-4">Loading orders...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-4 text-muted">No orders found.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const assetPath = buildAssetPath(order?.asset || {});
                                        return (
                                            <tr key={order?._id}>
                                                <td>
                                                    <div className="fw-semibold">{order?.orderRef || 'N/A'}</div>
                                                    <div className="small text-muted">{order?._id || ''}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold">{order?.asset?.title || 'Untitled asset'}</div>
                                                    {assetPath && (
                                                        <Link to={assetPath} className="small">
                                                            View asset
                                                        </Link>
                                                    )}
                                                </td>
                                                <td>{order?.creator?.displayName || 'Creator'}</td>
                                                <td>{formatMoney(order?.amountCents, order?.currency)}</td>
                                                <td>
                                                    <span className={`badge ${getStatusBadgeClass(order?.paymentStatus)}`}>
                                                        {String(order?.paymentStatus || 'unknown').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{formatDate(order?.paidAt)}</td>
                                                <td>{formatDate(order?.createdAt)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
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

export default MyOrders;

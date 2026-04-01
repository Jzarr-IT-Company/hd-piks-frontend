import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { ImageList, ImageListItem, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { FiDownload, FiShare2, FiCompass, FiFolderPlus, FiEdit3, FiInfo, FiCreditCard } from 'react-icons/fi';
import Cookies from 'js-cookie';
import api from '../../Services/api';
import API_BASE_URL, { API_ENDPOINTS } from '../../config/api.config';
import {
    getAssetPurchaseStatus,
    createAssetCheckout,
    capturePayPalAssetOrder,
    cancelPayPalAssetOrder,
} from '../../Services/payment.js';
import LazyLoadImage2 from '../LazyLoadImage2/LazyLoadImage2';
import BackBtnCompo from '../BackBtnCompo/BackBtnCompo';
import CollectionSelectModal from '../CollectionSelectModal';
import { getMediaVariantUrl, getResponsiveImageProps } from '../../utils/mediaVariants.js';
import { trackAssetDownloadEvent } from '../../utils/downloadTracking.js';
import { loadStripeJs } from '../../utils/stripeClient.js';
import { loadPayPalJs } from '../../utils/paypalClient.js';
import { useAssetDetailQuery, useRelatedAssetsQuery } from '../../query/assetDetailQueries.js';
import { useCreatorImagesQuery, useCreatorsMapQuery } from '../../query/imageQueries.js';
import LikeBttnSm from '../LikeBttnSm/LikeBttnSm.jsx';
import AppFooter from '../AppFooter/AppFooter.jsx';
import './AssetDetailView.css';

function RelatedCardMedia({ item, getCategoryName, getSubcategoryName, getResponsiveImageProps }) {
    const [videoDuration, setVideoDuration] = useState(null);
    const videoRef = useRef(null);

    const isVideoAsset = useMemo(() => {
        const mime = String(item?.fileMetadata?.mimeType || item?.imagetype || '').toLowerCase();
        if (mime.startsWith('video/')) return true;
        const cat = String(getCategoryName(item?.category) || '').trim().toLowerCase();
        if (cat === 'video' || cat === 'videos') return true;
        const url = item?.imageUrl || '';
        return /\.mp4$|\.mov$|\.m4v$|\.webm$/i.test(url);
    }, [item, getCategoryName]);

    const formatDuration = useCallback((durationSeconds) => {
        const total = Math.max(0, Math.floor(Number(durationSeconds) || 0));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, []);

    const durationLabel = useMemo(() => {
        const fromMeta = item?.fileMetadata?.duration;
        if (fromMeta != null && fromMeta !== '') return formatDuration(fromMeta);
        if (videoDuration != null) return formatDuration(videoDuration);
        return null;
    }, [item?.fileMetadata?.duration, videoDuration, formatDuration]);

    const handleMouseEnter = useCallback(() => {
        if (!isVideoAsset || !videoRef.current) return;
        const p = videoRef.current.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
    }, [isVideoAsset]);

    const handleMouseLeave = useCallback(() => {
        if (!isVideoAsset || !videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }, [isVideoAsset]);

    return (
        <div className="related-media-shell" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {isVideoAsset ? (
                <video
                    ref={videoRef}
                    src={getMediaVariantUrl(item, ['360p', '720p', '1080p', 'original']) || item.imageUrl}
                    className="related-media-el"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                        if (Number.isFinite(event?.currentTarget?.duration)) {
                            setVideoDuration(event.currentTarget.duration);
                        }
                    }}
                />
            ) : (
                <LazyLoadImage2
                    {...getResponsiveImageProps(item, {
                        preferredOrder: ['thumbnail', 'small', 'medium', 'large', 'original'],
                        sizes: '(max-width: 576px) 95vw, (max-width: 992px) 45vw, 30vw',
                    })}
                    className="related-media-el"
                    alt={item.title || getSubcategoryName(item.subcategory) || getCategoryName(item.category)}
                />
            )}
            {isVideoAsset && durationLabel && (
                <div className="related-video-duration" aria-label={`Duration ${durationLabel}`}>
                    {durationLabel}
                </div>
            )}
        </div>
    );
}

const normalizeLicenseValue = (value) => String(value || '').trim().toLowerCase();
const isPremiumLicense = (value) => normalizeLicenseValue(value) === 'premium';
const formatPriceUsd = (amountCents) => {
    const numeric = Number(amountCents);
    if (!Number.isFinite(numeric) || numeric < 0) return '';
    return `$${(numeric / 100).toFixed(2)}`;
};

function AssetDetailView() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const relatedCols = isMobile ? 2 : (isTablet ? 2 : 3);
    const relatedGap = isMobile ? 10 : 14;
    const relatedVariant = isMobile ? 'standard' : 'masonry';

    const { userData } = useAuth();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);
    const [followError, setFollowError] = useState('');
    // NEW: download modal state
    const [downloadTarget, setDownloadTarget] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState(null);
    const [assetInfo, setAssetInfo] = useState(null);
    const [assetInfoLoading, setAssetInfoLoading] = useState(false);
    const [assetInfoError, setAssetInfoError] = useState('');
    const [purchaseStatus, setPurchaseStatus] = useState(null);
    const [purchaseStatusLoading, setPurchaseStatusLoading] = useState(false);
    const [purchaseStatusError, setPurchaseStatusError] = useState('');
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showBuyAgainConfirmModal, setShowBuyAgainConfirmModal] = useState(false);
    const [showCheckoutProviderModal, setShowCheckoutProviderModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [paymentIntentMeta, setPaymentIntentMeta] = useState(null);
    const [showPayPalCheckoutModal, setShowPayPalCheckoutModal] = useState(false);
    const [payPalOrderMeta, setPayPalOrderMeta] = useState(null);
    const [payPalCheckoutError, setPayPalCheckoutError] = useState('');
    const [checkoutError, setCheckoutError] = useState('');
    const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
    const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState('');
    const stripeCardMountRef = useRef(null);
    const stripeInstanceRef = useRef(null);
    const stripeElementsRef = useRef(null);
    const stripeCardElementRef = useRef(null);
    const payPalButtonsHostRef = useRef(null);
    const payPalButtonsRef = useRef(null);

    const getObjectId = useCallback((value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            if (value.$oid) return String(value.$oid);
            if (value._id) return String(value._id);
            if (value.id) return String(value.id);
        }
        return String(value || '');
    }, []);

    const normalize = useCallback((val) => {
        if (typeof val === 'string') return val.trim().toLowerCase();
        if (val == null) return '';
        return String(val).trim().toLowerCase();
    }, []);

    const getCategoryName = useCallback((cat) => {
        if (!cat) return '';
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object') return cat.name || '';
        return String(cat);
    }, []);

    const getSubcategoryName = useCallback((sub) => {
        if (!sub) return '';
        if (typeof sub === 'string') return sub;
        if (typeof sub === 'object') return sub.name || '';
        return String(sub);
    }, []);

    const getSubSubcategoryName = useCallback((subsub) => {
        if (!subsub) return '';
        if (typeof subsub === 'string') return subsub;
        if (typeof subsub === 'object') return subsub.name || '';
        return String(subsub);
    }, []);

    const slugify = useCallback(
        (val) => {
            const base = normalize(val || '');
            if (!base) return '';
            return base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        },
        [normalize]
    );

    const buildAssetUrl = useCallback(
        (item) => {
            if (!item) return '/';
            const categorySlug = slugify(getCategoryName(item.category));
            const subSlug = slugify(getSubcategoryName(item.subcategory));
            const subSubSlug = slugify(getSubSubcategoryName(item.subsubcategory));
            const segments = ['/asset'];
            if (categorySlug) segments.push(categorySlug);
            if (subSlug) segments.push(subSlug);
            if (subSubSlug) segments.push(subSubSlug);
            if (item._id) segments.push(item._id);
            return segments.join('/');
        },
        [slugify, getCategoryName, getSubcategoryName, getSubSubcategoryName]
    );

    // Helper: extract extension from URL
    const getExtensionFromUrl = useCallback((url) => {
        if (!url) return '';
        try {
            const u = new URL(url);
            const pathname = u.pathname || '';
            const dotIndex = pathname.lastIndexOf('.');
            if (dotIndex === -1) return '';
            return pathname.substring(dotIndex);
        } catch {
            const qIndex = url.indexOf('?');
            const clean = qIndex === -1 ? url : url.slice(0, qIndex);
            const dotIndex = clean.lastIndexOf('.');
            if (dotIndex === -1) return '';
            return clean.substring(dotIndex);
        }
    }, []);

    // Build ordered list of variants for any item (asset or related)
    const getVariantsForItem = useCallback((item) => {
        if (!item) return [];
        const variants = Array.isArray(item.mediaVariants) ? [...item.mediaVariants] : [];

        if (!variants.length && item.imageUrl) {
            variants.push({
                variant: 'original',
                url: item.imageUrl,
                s3Key: item.s3Key || null,
                dimensions: {
                    width: item.fileMetadata?.dimensions?.width || null,
                    height: item.fileMetadata?.dimensions?.height || null,
                },
                fileSize: item.fileMetadata?.fileSize || null,
            });
        }

        const order = ['thumbnail', 'small', 'medium', 'large', 'original'];
        variants.sort((a, b) => {
            const ai = order.indexOf(a.variant);
            const bi = order.indexOf(b.variant);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });

        return variants;
    }, []);

    const assetQuery = useAssetDetailQuery(id);
    const asset = assetQuery.data || null;
    const creatorId = getObjectId(asset?.creatorId);
    const relatedQuery = useRelatedAssetsQuery(id, Boolean(asset));
    const creatorsMapQuery = useCreatorsMapQuery(creatorId ? [creatorId] : []);
    const owner = creatorsMapQuery.data?.[creatorId] || null;
    const ownerUserId = getObjectId(owner?.userId);
    const viewerUserId = getObjectId(userData?._id);

    const relatedFromApi = relatedQuery.data || {
        similar: [],
        fromCreator: [],
        groups: {
            sameSubcategory: [],
            keywordMatched: [],
            sameCategory: [],
            fallbackLatest: [],
        },
    };
    const similarAssets = Array.isArray(relatedFromApi.similar) ? relatedFromApi.similar : [];
    const creatorFromApi = Array.isArray(relatedFromApi.fromCreator) ? relatedFromApi.fromCreator : [];
    const shouldUseCreatorFallback = Boolean(creatorId) && relatedQuery.isFetched && creatorFromApi.length === 0;
    const creatorFallbackQuery = useCreatorImagesQuery(creatorId, shouldUseCreatorFallback);
    const creatorFallback = useMemo(() => {
        if (!shouldUseCreatorFallback) return [];
        const source = creatorFallbackQuery.data || [];
        return source
            .filter((item) => item.approved === true && item.rejected !== true && item._id !== id)
            .slice(0, 12);
    }, [shouldUseCreatorFallback, creatorFallbackQuery.data, id]);
    const creatorAssets = creatorFromApi.length ? creatorFromApi : creatorFallback;

    const loading = assetQuery.isLoading
        || relatedQuery.isLoading
        || creatorsMapQuery.isLoading
        || (shouldUseCreatorFallback && creatorFallbackQuery.isLoading);

    const error = assetQuery.error?.response?.data?.message
        || assetQuery.error?.message
        || '';

    const sameSubcategorySimilarAssets = useMemo(() => {
        const fromBackendGroup = Array.isArray(relatedFromApi?.groups?.sameSubcategory)
            ? relatedFromApi.groups.sameSubcategory
            : [];
        if (fromBackendGroup.length) return fromBackendGroup;

        if (!asset || !Array.isArray(similarAssets) || similarAssets.length === 0) return [];
        const targetSubcategory = normalize(getSubcategoryName(asset.subcategory));
        if (!targetSubcategory) return [];

        const exactSubcategoryMatches = similarAssets.filter(
            (item) => normalize(getSubcategoryName(item.subcategory)) === targetSubcategory
        );

        return exactSubcategoryMatches;
    }, [asset, similarAssets, relatedFromApi?.groups?.sameSubcategory, normalize, getSubcategoryName]);

    const getCategorySubcategoryTag = useCallback(
        (item) => {
            const categoryLabel = getCategoryName(item?.category) || 'Category';
            const subcategoryLabel = getSubcategoryName(item?.subcategory);
            return subcategoryLabel ? `${categoryLabel}/${subcategoryLabel}` : categoryLabel;
        },
        [getCategoryName, getSubcategoryName]
    );

    const isVideo = useMemo(() => {
        if (!asset) return false;
        const cat = normalize(getCategoryName(asset.category) || '');
        if (cat === 'video' || cat === 'videos') return true;
        const url = asset.imageUrl || '';
        return /\.mp4$|\.mov$|\.m4v$|\.webm$/i.test(url);
    }, [asset, normalize, getCategoryName]);

    const heroMedia = useMemo(() => {
        if (!asset) return { src: '', srcSet: '', sizes: '' };
        if (isVideo) {
            return {
                src: getMediaVariantUrl(asset, ['360p', '720p', '1080p', 'original']),
                srcSet: '',
                sizes: '',
            };
        }
        return getResponsiveImageProps(asset, {
            preferredOrder: ['medium', 'small', 'large', 'original'],
            sizes: '(max-width: 992px) 100vw, 70vw',
        });
    }, [asset, isVideo]);

    const assetMimeType = useMemo(() => {
        return asset?.imagetype || asset?.fileMetadata?.mimeType || '';
    }, [asset]);

    const stripePublishableKey = useMemo(
        () => String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim(),
        []
    );
    const payPalClientId = useMemo(
        () => String(import.meta.env.VITE_PAYPAL_CLIENT_ID || '').trim(),
        []
    );
    const hasStripeCheckout = Boolean(stripePublishableKey);
    const hasPayPalCheckout = Boolean(payPalClientId);
    const showDesktopPurchasePanel = !isTablet;
    const showToolbarPurchaseActions = !showDesktopPurchasePanel;

    const inferredMainAssetPremium = useMemo(
        () => isPremiumLicense(asset?.freePremium),
        [asset?.freePremium]
    );

    const assetDimensions = useMemo(() => {
        const width = asset?.fileMetadata?.dimensions?.width;
        const height = asset?.fileMetadata?.dimensions?.height;
        if (!width || !height) return '';
        return `${width}x${height}`;
    }, [asset]);

    const assetLicenseLabel = useMemo(() => {
        if (!asset?.freePremium) return '';
        const value = normalizeLicenseValue(asset.freePremium);
        if (!value) return '';
        return value.charAt(0).toUpperCase() + value.slice(1);
    }, [asset]);

    const isInfoRoute = useMemo(() => location.pathname.endsWith('/info'), [location.pathname]);

    const detailPathFromRoute = useMemo(() => {
        if (!isInfoRoute) return location.pathname;
        return location.pathname.slice(0, -5);
    }, [isInfoRoute, location.pathname]);

    const refreshPurchaseStatus = useCallback(
        async ({ withRetry = false } = {}) => {
            if (!id) return null;
            setPurchaseStatusLoading(true);
            setPurchaseStatusError('');
            try {
                const attemptFetch = async () => {
                    const nextStatus = await getAssetPurchaseStatus(id);
                    setPurchaseStatus(nextStatus || null);
                    return nextStatus || null;
                };

                if (!withRetry) {
                    return await attemptFetch();
                }

                let latest = null;
                for (let attempt = 0; attempt < 4; attempt += 1) {
                    latest = await attemptFetch();
                    if (latest?.canDownload || latest?.hasEntitlement) break;
                    await new Promise((resolve) => setTimeout(resolve, 1400));
                }
                return latest;
            } catch (error) {
                const message = error?.response?.data?.message || 'Failed to fetch purchase status.';
                setPurchaseStatusError(message);
                setPurchaseStatus((prev) => (
                    prev || {
                        assetId: id,
                        isFree: !inferredMainAssetPremium,
                        isPremium: inferredMainAssetPremium,
                        canDownload: !inferredMainAssetPremium,
                        canBuy: inferredMainAssetPremium,
                        canBuyAgain: false,
                        hasEntitlement: false,
                        priceConfigured: false,
                        priceCents: null,
                        currency: 'USD',
                    }
                ));
                return null;
            } finally {
                setPurchaseStatusLoading(false);
            }
        },
        [id, inferredMainAssetPremium]
    );

    useEffect(() => {
        let mounted = true;
        const loadStatus = async () => {
            if (!mounted || !id) return;
            await refreshPurchaseStatus();
        };
        loadStatus();
        return () => {
            mounted = false;
        };
    }, [id, refreshPurchaseStatus]);

    useEffect(() => {
        setCheckoutError('');
        setPayPalCheckoutError('');
        setCheckoutSuccessMessage('');
        setShowBuyAgainConfirmModal(false);
        setShowCheckoutProviderModal(false);
        setShowCheckoutModal(false);
        setPaymentIntentMeta(null);
        setShowPayPalCheckoutModal(false);
        setPayPalOrderMeta(null);
    }, [id]);

    useEffect(() => {
        if (typeof owner?.followersCount === 'number') {
            setFollowersCount(owner.followersCount);
        }
    }, [owner?.followersCount]);

    useEffect(() => {
        let mounted = true;
        const fetchAssetInfo = async () => {
            if (!isInfoRoute || !id) return;
            setAssetInfoLoading(true);
            setAssetInfoError('');
            try {
                const response = await api.get(API_ENDPOINTS.GET_PUBLIC_ASSET_INFO(id));
                if (!mounted) return;
                setAssetInfo(response?.data?.data || null);
            } catch (err) {
                if (!mounted) return;
                setAssetInfo(null);
                setAssetInfoError(err?.response?.data?.message || 'Failed to load asset info.');
            } finally {
                if (mounted) setAssetInfoLoading(false);
            }
        };
        fetchAssetInfo();
        return () => {
            mounted = false;
        };
    }, [isInfoRoute, id]);

    useEffect(() => {
        setFollowError('');
        const fetchFollowState = async () => {
            if (!creatorId || !userData?._id) return;
            try {
                const res = await api.get(API_ENDPOINTS.CREATOR_FOLLOW_STATUS(creatorId));
                const payload = res?.data?.data || {};
                setIsFollowing(Boolean(payload.isFollowing));
                if (typeof payload.followersCount === 'number') {
                    setFollowersCount(payload.followersCount);
                }
            } catch {
                setIsFollowing(false);
            }
        };
        fetchFollowState();
    }, [creatorId, userData?._id]);

    useEffect(() => {
        let cancelled = false;

        const setupCardElement = async () => {
            if (!showCheckoutModal || !paymentIntentMeta?.clientSecret || !stripeCardMountRef.current) return;
            if (!stripePublishableKey) {
                setCheckoutError('Stripe is not configured. Missing VITE_STRIPE_PUBLISHABLE_KEY.');
                return;
            }

            try {
                setCheckoutError('');
                const StripeFactory = await loadStripeJs();
                if (cancelled) return;

                stripeInstanceRef.current = StripeFactory(stripePublishableKey);
                stripeElementsRef.current = stripeInstanceRef.current.elements({
                    clientSecret: paymentIntentMeta.clientSecret,
                });
                stripeCardElementRef.current = stripeElementsRef.current.create('card', {
                    hidePostalCode: true,
                });
                stripeCardElementRef.current.mount(stripeCardMountRef.current);
            } catch (error) {
                if (!cancelled) {
                    setCheckoutError(error?.message || 'Failed to initialize payment form.');
                }
            }
        };

        setupCardElement();

        return () => {
            cancelled = true;
            if (stripeCardElementRef.current) {
                stripeCardElementRef.current.destroy();
                stripeCardElementRef.current = null;
            }
            stripeElementsRef.current = null;
            stripeInstanceRef.current = null;
        };
    }, [showCheckoutModal, paymentIntentMeta?.clientSecret, stripePublishableKey]);

    const resolvedPurchaseStatus = useMemo(() => {
        const fallbackIsPremium = inferredMainAssetPremium;
        const fallbackIsFree = !fallbackIsPremium;
        const status = purchaseStatus || {};

        return {
            isPremium: Boolean(status.isPremium ?? fallbackIsPremium),
            isFree: Boolean(status.isFree ?? fallbackIsFree),
            hasEntitlement: Boolean(status.hasEntitlement),
            canDownload: Boolean(status.canDownload ?? fallbackIsFree),
            canBuy: Boolean(status.canBuy ?? fallbackIsPremium),
            canBuyAgain: Boolean(status.canBuyAgain),
            canPurchase: Boolean(status.canPurchase ?? fallbackIsPremium),
            requiresLoginForPurchase: Boolean(status.requiresLoginForPurchase),
            priceConfigured: Boolean(status.priceConfigured ?? (status.priceCents != null)),
            priceCents: status.priceCents ?? null,
            currency: String(status.currency || 'USD').toUpperCase(),
        };
    }, [purchaseStatus, inferredMainAssetPremium]);

    const purchasePriceLabel = useMemo(
        () => formatPriceUsd(resolvedPurchaseStatus.priceCents),
        [resolvedPurchaseStatus.priceCents]
    );

    const closeCheckoutModal = useCallback(() => {
        setShowCheckoutModal(false);
        setPaymentIntentMeta(null);
        setCheckoutSubmitting(false);
        setCheckoutError('');
    }, []);

    const closeCheckoutProviderModal = useCallback(() => {
        setShowCheckoutProviderModal(false);
    }, []);

    const closePayPalCheckoutModal = useCallback(() => {
        setShowPayPalCheckoutModal(false);
        setPayPalOrderMeta(null);
        setPayPalCheckoutError('');
        setCheckoutSubmitting(false);
    }, []);

    const startStripeCheckout = useCallback(async () => {
        if (!asset?._id) return;
        if (!hasStripeCheckout) {
            alert('Stripe is not configured. Configure VITE_STRIPE_PUBLISHABLE_KEY.');
            return;
        }

        setCheckoutLoading(true);
        setCheckoutError('');
        setCheckoutSuccessMessage('');
        setPayPalCheckoutError('');
        setPurchaseStatusError('');
        try {
            const payment = await createAssetCheckout(asset._id, 'stripe');
            if (!payment?.clientSecret) {
                throw new Error('Missing Stripe client secret in checkout response.');
            }
            setPaymentIntentMeta(payment);
            setShowCheckoutModal(true);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to start Stripe checkout.';
            setCheckoutError(message);
            alert(message);
        } finally {
            setCheckoutLoading(false);
        }
    }, [asset?._id, hasStripeCheckout]);

    const startPayPalCheckout = useCallback(async () => {
        if (!asset?._id) return;
        if (!hasPayPalCheckout) {
            alert('PayPal is not configured. Configure VITE_PAYPAL_CLIENT_ID.');
            return;
        }

        setCheckoutLoading(true);
        setCheckoutError('');
        setCheckoutSuccessMessage('');
        setPayPalCheckoutError('');
        setPurchaseStatusError('');
        try {
            const payment = await createAssetCheckout(asset._id, 'paypal');
            if (!payment?.paypalOrderId) {
                throw new Error('Missing PayPal order id in checkout response.');
            }
            setPayPalOrderMeta(payment);
            setShowPayPalCheckoutModal(true);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to start PayPal checkout.';
            setPayPalCheckoutError(message);
            alert(message);
        } finally {
            setCheckoutLoading(false);
        }
    }, [asset?._id, hasPayPalCheckout]);

    const handleSelectCheckoutProvider = useCallback(
        async (provider) => {
            setShowCheckoutProviderModal(false);
            if (provider === 'paypal') {
                await startPayPalCheckout();
                return;
            }
            await startStripeCheckout();
        },
        [startPayPalCheckout, startStripeCheckout]
    );

    const handleOpenCheckout = useCallback(async () => {
        if (!asset?._id) return;
        if (!userData?._id) {
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        if (!resolvedPurchaseStatus.canPurchase) {
            alert('This asset cannot be purchased right now.');
            return;
        }
        if (!resolvedPurchaseStatus.priceConfigured) {
            alert('Pricing is not configured for this asset yet.');
            return;
        }
        if (!hasStripeCheckout && !hasPayPalCheckout) {
            alert('No payment provider is configured. Set Stripe and/or PayPal keys.');
            return;
        }
        if (hasStripeCheckout && hasPayPalCheckout) {
            setShowCheckoutProviderModal(true);
            return;
        }
        if (hasStripeCheckout) {
            await startStripeCheckout();
            return;
        }
        await startPayPalCheckout();
    }, [
        asset?._id,
        userData?._id,
        navigate,
        resolvedPurchaseStatus.canPurchase,
        resolvedPurchaseStatus.priceConfigured,
        hasStripeCheckout,
        hasPayPalCheckout,
        startStripeCheckout,
        startPayPalCheckout,
    ]);

    const openBuyAgainConfirmModal = useCallback(() => {
        if (!resolvedPurchaseStatus.canBuyAgain || checkoutLoading) return;
        setShowBuyAgainConfirmModal(true);
    }, [resolvedPurchaseStatus.canBuyAgain, checkoutLoading]);

    const closeBuyAgainConfirmModal = useCallback(() => {
        setShowBuyAgainConfirmModal(false);
    }, []);

    const handleConfirmBuyAgain = useCallback(() => {
        setShowBuyAgainConfirmModal(false);
        handleOpenCheckout();
    }, [handleOpenCheckout]);

    const finalizePendingPayPalOrder = useCallback(
        async ({ status = 'canceled', note = '' } = {}) => {
            const paypalOrderId = payPalOrderMeta?.paypalOrderId || null;
            const orderId = payPalOrderMeta?.orderId || null;
            if (!paypalOrderId && !orderId) return null;
            try {
                return await cancelPayPalAssetOrder({
                    paypalOrderId,
                    orderId,
                    status,
                    note,
                });
            } catch {
                return null;
            }
        },
        [payPalOrderMeta?.paypalOrderId, payPalOrderMeta?.orderId]
    );

    useEffect(() => {
        let cancelled = false;
        const renderPayPalButtons = async () => {
            if (!showPayPalCheckoutModal || !payPalOrderMeta?.paypalOrderId) return;
            if (!payPalClientId) {
                setPayPalCheckoutError('PayPal is not configured. Missing VITE_PAYPAL_CLIENT_ID.');
                return;
            }
            if (!payPalButtonsHostRef.current) return;

            try {
                setPayPalCheckoutError('');
                const paypal = await loadPayPalJs({
                    clientId: payPalClientId,
                    currency: String(payPalOrderMeta?.currency || resolvedPurchaseStatus.currency || 'USD').toUpperCase(),
                });
                if (cancelled) return;

                if (payPalButtonsRef.current?.close) {
                    payPalButtonsRef.current.close();
                    payPalButtonsRef.current = null;
                }
                payPalButtonsHostRef.current.innerHTML = '';

                const buttons = paypal.Buttons({
                    style: {
                        layout: 'vertical',
                        shape: 'rect',
                        label: 'paypal',
                    },
                    createOrder: async () => payPalOrderMeta.paypalOrderId,
                    onApprove: async (data) => {
                        setCheckoutSubmitting(true);
                        setPayPalCheckoutError('');
                        try {
                            await capturePayPalAssetOrder({
                                paypalOrderId: data?.orderID || payPalOrderMeta.paypalOrderId,
                                orderId: payPalOrderMeta.orderId || null,
                            });
                            setCheckoutSuccessMessage('Payment successful. Finalizing your access...');
                            await refreshPurchaseStatus({ withRetry: true });
                            closePayPalCheckoutModal();
                            setCheckoutSuccessMessage('Payment successful. You can download this asset now.');
                        } catch (error) {
                            const message = error?.response?.data?.message || error?.message || 'Failed to capture PayPal payment.';
                            setPayPalCheckoutError(message);
                        } finally {
                            setCheckoutSubmitting(false);
                        }
                    },
                    onCancel: () => {
                        (async () => {
                            setCheckoutSubmitting(true);
                            await finalizePendingPayPalOrder({
                                status: 'canceled',
                                note: 'paypal.checkout_canceled_by_buyer',
                            });
                            closePayPalCheckoutModal();
                            setCheckoutSubmitting(false);
                            setPurchaseStatusError('PayPal checkout cancelled.');
                        })();
                    },
                    onError: (error) => {
                        (async () => {
                            const reason = error?.message || 'paypal.checkout_failed_in_popup';
                            setPayPalCheckoutError(error?.message || 'PayPal checkout failed.');
                            setCheckoutSubmitting(true);
                            await finalizePendingPayPalOrder({
                                status: 'failed',
                                note: reason,
                            });
                            closePayPalCheckoutModal();
                            setCheckoutSubmitting(false);
                            setPurchaseStatusError('PayPal checkout failed. Please try again.');
                        })();
                    },
                });

                payPalButtonsRef.current = buttons;
                await buttons.render(payPalButtonsHostRef.current);
            } catch (error) {
                if (!cancelled) {
                    setPayPalCheckoutError(error?.message || 'Failed to initialize PayPal checkout.');
                }
            }
        };

        renderPayPalButtons();

        return () => {
            cancelled = true;
            if (payPalButtonsRef.current?.close) {
                payPalButtonsRef.current.close();
                payPalButtonsRef.current = null;
            }
            if (payPalButtonsHostRef.current) {
                payPalButtonsHostRef.current.innerHTML = '';
            }
        };
    }, [
        showPayPalCheckoutModal,
        payPalOrderMeta?.paypalOrderId,
        payPalOrderMeta?.orderId,
        payPalOrderMeta?.currency,
        payPalClientId,
        resolvedPurchaseStatus.currency,
        refreshPurchaseStatus,
        closePayPalCheckoutModal,
        finalizePendingPayPalOrder,
    ]);

    const handleSubmitCheckoutPayment = useCallback(async () => {
        if (!stripeInstanceRef.current || !stripeCardElementRef.current || !paymentIntentMeta?.clientSecret) {
            setCheckoutError('Payment form is not ready yet. Please wait a moment.');
            return;
        }

        setCheckoutSubmitting(true);
        setCheckoutError('');
        try {
            const result = await stripeInstanceRef.current.confirmCardPayment(
                paymentIntentMeta.clientSecret,
                {
                    payment_method: {
                        card: stripeCardElementRef.current,
                    },
                }
            );

            if (result?.error) {
                setCheckoutError(result.error.message || 'Payment failed.');
                return;
            }

            const status = result?.paymentIntent?.status || '';
            if (status === 'succeeded' || status === 'processing' || status === 'requires_capture') {
                setCheckoutSuccessMessage('Payment successful. Finalizing your access...');
                await refreshPurchaseStatus({ withRetry: true });
                closeCheckoutModal();
                setCheckoutSuccessMessage('Payment successful. You can download this asset now.');
                return;
            }

            setCheckoutError(`Payment status: ${status || 'unknown'}`);
        } catch (error) {
            setCheckoutError(error?.message || 'Checkout failed.');
        } finally {
            setCheckoutSubmitting(false);
        }
    }, [paymentIntentMeta?.clientSecret, refreshPurchaseStatus, closeCheckoutModal]);

    // Follow/unfollow handlers
    const handleFollow = async () => {
        setFollowError('');
        if (!userData?._id) {
            alert('Please login to follow creators.');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        if (!creatorId) {
            setFollowError('Creator profile not available for this asset.');
            return;
        }
        setFollowLoading(true);
        try {
            await api.post(API_ENDPOINTS.FOLLOW_CREATOR(creatorId));
            setIsFollowing(true);
            setFollowersCount(c => c + 1);
        } catch (e) {
            const status = e?.response?.status;
            if (status === 409) {
                setIsFollowing(true);
            } else if (status === 401) {
                setFollowError('Session expired. Please login again.');
            } else {
                setFollowError(e?.response?.data?.message || 'Failed to follow creator.');
            }
        } finally {
            setFollowLoading(false);
        }
    };
    const handleUnfollow = async () => {
        setFollowError('');
        if (!userData?._id) {
            alert('Please login to continue.');
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        if (!creatorId) {
            setFollowError('Creator profile not available for this asset.');
            return;
        }
        setFollowLoading(true);
        try {
            await api.delete(API_ENDPOINTS.UNFOLLOW_CREATOR(creatorId));
            setIsFollowing(false);
            setFollowersCount(c => Math.max(0, c - 1));
        } catch (e) {
            const status = e?.response?.status;
            if (status === 401) {
                setFollowError('Session expired. Please login again.');
            } else {
                setFollowError(e?.response?.data?.message || 'Failed to unfollow creator.');
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handleOpenRelated = (item) => {
        if (!item?._id) return;
        navigate(buildAssetUrl(item));
    };

    const handleDiscoverSimilar = () => {
        const categoryName = getCategoryName(asset?.category);
        if (!categoryName) return;
        const subName = getSubcategoryName(asset?.subcategory);
        const subSubName = getSubSubcategoryName(asset?.subsubcategory);
        const params = new URLSearchParams();
        params.set('discover', '1');
        if (subName) params.set('dsSub', subName);
        if (subSubName) params.set('dsSubSub', subSubName);
        navigate(`/collection/${encodeURIComponent(normalize(categoryName))}?${params.toString()}`);
    };

    const handleShare = async () => {
        const detailUrl = asset?._id
            ? `${window.location.origin}${buildAssetUrl(asset)}`
            : asset?.imageUrl || window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: asset?.title || 'Asset', url: detailUrl });
                return;
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(detailUrl);
                alert('Link copied to clipboard');
                return;
            }
            window.prompt('Copy link', detailUrl);
        } catch (err) {
            console.error('Share failed', err);
        }
    };

    // CHANGE: open modal for main asset instead of immediate download
    const handleDownload = () => {
        if (!asset) return;
        if (!resolvedPurchaseStatus.canDownload && resolvedPurchaseStatus.isPremium) {
            handleOpenCheckout();
            return;
        }
        setDownloadTarget(asset);
        setShowDownloadModal(true);
    };

    const handleSaveToCollection = () => {
        if (!asset?._id) return;
        const token = Cookies.get('token');
        if (!token) {
            alert('Please login to save assets to a collection.');
            navigate('/login');
            return;
        }
        setSelectedAssetId(asset._id);
        setShowCollectionModal(true);
    };

    const handleEdit = () => {
        if (!asset?._id) return;
        const params = new URLSearchParams();
        params.set('assetId', asset._id);
        if (asset.imageUrl) params.set('assetUrl', asset.imageUrl);
        if (asset.title) params.set('title', asset.title);
        navigate(`/design-hdpiks?${params.toString()}`);
    };

    const handleMoreInfo = () => {
        if (!asset) return;
        const detailPath = buildAssetUrl(asset);
        navigate(`${detailPath}/info`);
    };

    const handleCloseInfoModal = () => {
        navigate(detailPathFromRoute || buildAssetUrl(asset), { replace: true });
    };

    const handleCloseCollectionModal = () => {
        setShowCollectionModal(false);
        setSelectedAssetId(null);
    };

    // CHANGE: for related items, also open the same modal
    const handleDownloadItem = (item) => {
        if (!item) return;
        if (isPremiumLicense(item?.freePremium)) {
            navigate(buildAssetUrl(item));
            return;
        }
        setDownloadTarget(item);
        setShowDownloadModal(true);
    };

    const handleShareItem = async (item) => {
        if (!item) return;
        const detailUrl = item._id
            ? `${window.location.origin}${buildAssetUrl(item)}`
            : item.imageUrl || window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: item.title || 'Asset', url: detailUrl });
                return;
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(detailUrl);
                alert('Link copied to clipboard');
                return;
            }
            window.prompt('Copy link', detailUrl);
        } catch (err) {
            console.error('Share failed', err);
        }
    };

    const handleDiscoverSimilarItem = (item) => {
        const categoryName = getCategoryName(item?.category);
        if (!categoryName) return;
        const subName = getSubcategoryName(item?.subcategory);
        const subSubName = getSubSubcategoryName(item?.subsubcategory);
        const params = new URLSearchParams();
        params.set('discover', '1');
        if (subName) params.set('dsSub', subName);
        if (subSubName) params.set('dsSubSub', subSubName);
        navigate(`/collection/${encodeURIComponent(normalize(categoryName))}?${params.toString()}`);
    };

    const handleEditItem = (item) => {
        if (!item?._id) return;
        const params = new URLSearchParams();
        params.set('assetId', item._id);
        if (item.imageUrl) params.set('assetUrl', item.imageUrl);
        if (item.title) params.set('title', item.title);
        navigate(`/design-hdpiks?${params.toString()}`);
    };

    // NEW: perform actual variant download through backend proxy
    const handleVariantDownload = async (variant, item) => {
        if (!variant || !variant.url) return;

        try {
            const label = variant.variant
                ? variant.variant.charAt(0).toUpperCase() + variant.variant.slice(1)
                : 'Original';

            const w = variant.dimensions?.width;
            const h = variant.dimensions?.height;
            const sizeSuffix = w && h ? `-${w}x${h}px` : '';
            const baseTitle = (item?.title || 'asset').toString().replace(/[^\w.-]+/g, '-');
            const ext = getExtensionFromUrl(variant.url) || '';
            const fileName = `${baseTitle}-${label}${sizeSuffix}${ext}`;

            let href = variant.url;
            const tracked = await trackAssetDownloadEvent({
                assetId: item?._id,
                fileName,
            });

            if (tracked?.downloadUrl) {
                href = tracked.downloadUrl;
            } else if (variant.s3Key) {
                const params = new URLSearchParams();
                params.set('key', variant.s3Key);
                params.set('filename', fileName);
                href = `${API_BASE_URL}/download?${params.toString()}`;
            }

            const link = document.createElement('a');
            link.href = href;
            link.download = fileName;
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            link.remove();

            setShowDownloadModal(false);
            setDownloadTarget(null);
        } catch (error) {
            console.error('Error downloading asset variant:', error);
            alert(error?.message || 'Error downloading file');
        }
    };

    const formatBytes = (bytes) => {
        const size = Number(bytes);
        if (!Number.isFinite(size) || size <= 0) return 'N/A';
        const units = ['B', 'KB', 'MB', 'GB'];
        const index = Math.min(units.length - 1, Math.floor(Math.log(size) / Math.log(1024)));
        const value = size / Math.pow(1024, index);
        return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
    };

    const formatDateTime = (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString();
    };

    if (loading) {
        return (
            <>
                <div className="container top-nav-content py-5">
                    <Skeleton variant="rectangular" width="100%" height={420} className="mb-4" />
                    <div className="d-flex gap-3">
                        {[...Array(4)].map((_, idx) => (
                            <Skeleton key={idx} variant="rectangular" width="100%" height={220} />
                        ))}
                    </div>
                </div>
                <AppFooter />
            </>
        );
    }

    if (error || !asset) {
        return (
            <>
                <div className="container top-nav-content py-5">
                    <BackBtnCompo />
                    <p className="mt-4 text-danger fw-semibold">{error || 'Asset not found'}</p>
                </div>
                <AppFooter />
            </>
        );
    }

    return (
        <>
        <div className="container top-nav-content py-4">
            <BackBtnCompo />

            <div className="asset-hero card shadow-sm border-0 overflow-hidden rounded-4 my-4">
                <div className="asset-hero__media">
                    <div className="asset-hero__media-layout">
                        <div className="asset-hero__media-inner">
                            {isVideo ? (
                                <video src={heroMedia.src || asset.imageUrl} controls className="asset-hero__media-el" />
                            ) : (
                                <img
                                    src={heroMedia.src || asset.imageUrl}
                                    srcSet={heroMedia.srcSet || undefined}
                                    sizes={heroMedia.sizes || undefined}
                                    alt={asset.title || getSubcategoryName(asset.subcategory) || 'Asset'}
                                    className="asset-hero__media-el"
                                />
                            )}
                        </div>
                        {showDesktopPurchasePanel && (
                            <aside className="asset-hero__purchase-panel">
                                <div className="asset-hero__purchase-card">
                                    <div className="asset-hero__purchase-head">
                                        <span className={`asset-hero__purchase-plan ${resolvedPurchaseStatus.isFree ? 'asset-hero__purchase-plan--free' : 'asset-hero__purchase-plan--premium'}`}>
                                            {resolvedPurchaseStatus.isFree ? 'Free Asset' : 'Premium Asset'}
                                        </span>
                                        {resolvedPurchaseStatus.isPremium && purchasePriceLabel && (
                                            <span className="asset-hero__purchase-price">{purchasePriceLabel}</span>
                                        )}
                                    </div>
                                    <div className="asset-hero__purchase-note">
                                        {resolvedPurchaseStatus.canDownload
                                            ? 'You can download this asset now.'
                                            : 'Choose a payment method to unlock download access.'}
                                    </div>
                                    <div className="d-grid gap-2">
                                        {purchaseStatusLoading ? (
                                            <button className="asset-hero__toolbar-btn asset-hero__panel-btn" type="button" disabled>
                                                <FiDownload size={16} />
                                                <span>Checking...</span>
                                            </button>
                                        ) : resolvedPurchaseStatus.canDownload ? (
                                            <button
                                                className="asset-hero__toolbar-btn asset-hero__toolbar-btn--download asset-hero__panel-btn"
                                                type="button"
                                                onClick={handleDownload}
                                            >
                                                <FiDownload size={16} />
                                                <span>{resolvedPurchaseStatus.isFree ? 'Free Download' : 'Download'}</span>
                                            </button>
                                        ) : resolvedPurchaseStatus.canPurchase ? (
                                            <button
                                                className="asset-hero__toolbar-btn asset-hero__toolbar-btn--premium asset-hero__panel-btn"
                                                type="button"
                                                onClick={handleOpenCheckout}
                                                disabled={checkoutLoading}
                                            >
                                                <FiCreditCard size={16} />
                                                <span>
                                                    {checkoutLoading
                                                        ? 'Opening checkout...'
                                                        : `Buy Now${purchasePriceLabel ? ` ${purchasePriceLabel}` : ''}`}
                                                </span>
                                            </button>
                                        ) : (
                                            <button className="asset-hero__toolbar-btn asset-hero__panel-btn" type="button" disabled>
                                                <FiCreditCard size={16} />
                                                <span>{resolvedPurchaseStatus.isPremium ? 'Premium unavailable' : 'Download unavailable'}</span>
                                            </button>
                                        )}
                                        {resolvedPurchaseStatus.canBuyAgain && (
                                            <button
                                                className="asset-hero__toolbar-btn asset-hero__toolbar-btn--premium-alt asset-hero__panel-btn"
                                                type="button"
                                                onClick={openBuyAgainConfirmModal}
                                                disabled={checkoutLoading}
                                            >
                                                <FiCreditCard size={16} />
                                                <span>
                                                    {checkoutLoading
                                                        ? 'Opening checkout...'
                                                        : `Buy Again${purchasePriceLabel ? ` ${purchasePriceLabel}` : ''}`}
                                                </span>
                                            </button>
                                        )}
                                        {(resolvedPurchaseStatus.isPremium || resolvedPurchaseStatus.isFree) && (
                                            <button
                                                className="asset-hero__toolbar-btn asset-hero__toolbar-btn--subscription asset-hero__panel-btn"
                                                type="button"
                                                onClick={() => navigate('/pricing')}
                                            >
                                                <FiCreditCard size={16} />
                                                <span>Buy Subscription</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>

                <div className="asset-hero__toolbar">
                    <LikeBttnSm imgId={asset?._id} compact stopPropagation />
                    <button className="asset-hero__toolbar-btn" type="button" onClick={handleDiscoverSimilar}>
                        <FiCompass size={16} />
                        <span>Similar</span>
                    </button>
                    <button className="asset-hero__toolbar-btn" type="button" onClick={handleEdit}>
                        <FiEdit3 size={16} />
                        <span>Edit</span>
                    </button>
                    <button className="asset-hero__toolbar-btn" type="button" onClick={handleSaveToCollection}>
                        <FiFolderPlus size={16} />
                        <span>Save</span>
                    </button>
                    <button className="asset-hero__toolbar-btn" type="button" onClick={handleShare}>
                        <FiShare2 size={16} />
                        <span>Share</span>
                    </button>
                    {showToolbarPurchaseActions && (
                        <>
                            {purchaseStatusLoading ? (
                                <button className="asset-hero__toolbar-btn" type="button" disabled>
                                    <FiDownload size={16} />
                                    <span>Checking...</span>
                                </button>
                            ) : resolvedPurchaseStatus.canDownload ? (
                                <button className="asset-hero__toolbar-btn asset-hero__toolbar-btn--download" type="button" onClick={handleDownload}>
                                    <FiDownload size={16} />
                                    <span>{resolvedPurchaseStatus.isFree ? 'Free Download' : 'Download'}</span>
                                </button>
                            ) : resolvedPurchaseStatus.canPurchase ? (
                                <button
                                    className="asset-hero__toolbar-btn asset-hero__toolbar-btn--premium"
                                    type="button"
                                    onClick={handleOpenCheckout}
                                    disabled={checkoutLoading}
                                >
                                    <FiCreditCard size={16} />
                                    <span>
                                        {checkoutLoading
                                            ? 'Opening checkout...'
                                            : `Buy Now${purchasePriceLabel ? ` ${purchasePriceLabel}` : ''}`}
                                    </span>
                                </button>
                            ) : (
                                <button className="asset-hero__toolbar-btn" type="button" disabled>
                                    <FiCreditCard size={16} />
                                    <span>{resolvedPurchaseStatus.isPremium ? 'Premium unavailable' : 'Download unavailable'}</span>
                                </button>
                            )}
                            {resolvedPurchaseStatus.canBuyAgain && (
                                <button
                                    className="asset-hero__toolbar-btn asset-hero__toolbar-btn--premium-alt"
                                    type="button"
                                    onClick={openBuyAgainConfirmModal}
                                    disabled={checkoutLoading}
                                >
                                    <FiCreditCard size={16} />
                                    <span>
                                        {checkoutLoading
                                            ? 'Opening checkout...'
                                            : `Buy Again${purchasePriceLabel ? ` ${purchasePriceLabel}` : ''}`}
                                    </span>
                                </button>
                            )}
                            {(resolvedPurchaseStatus.isPremium || resolvedPurchaseStatus.isFree) && (
                                <button
                                    className="asset-hero__toolbar-btn asset-hero__toolbar-btn--subscription"
                                    type="button"
                                    onClick={() => navigate('/pricing')}
                                >
                                    <FiCreditCard size={16} />
                                    <span>Buy Subscription</span>
                                </button>
                            )}
                        </>
                    )}
                    <button className="asset-hero__toolbar-btn" type="button" onClick={handleMoreInfo}>
                        <FiInfo size={16} />
                        <span>More info</span>
                    </button>
                </div>
                {purchaseStatusError && (
                    <div className="alert alert-warning rounded-0 mb-0 py-2 px-3">
                        {purchaseStatusError}
                    </div>
                )}
                {checkoutSuccessMessage && (
                    <div className="alert alert-success rounded-0 mb-0 py-2 px-3">
                        {checkoutSuccessMessage}
                    </div>
                )}

                <div className="asset-hero__meta p-3">
                    <div className="asset-hero__meta-layout">
                        <div className="asset-hero__meta-main">
                            <div className="asset-hero__heading mb-3">
                                <h4 className="mb-1 fw-semibold">{asset?.title || 'Untitled asset'}</h4>
                                <div className="asset-hero__facts">
                                    {assetLicenseLabel && <span className="asset-hero__fact">{assetLicenseLabel}</span>}
                                    {assetMimeType && <span className="asset-hero__fact">{assetMimeType}</span>}
                                    {assetDimensions && <span className="asset-hero__fact">{assetDimensions}</span>}
                                </div>
                            </div>

                            <div className="asset-hero__category-line text-muted mb-3">
                                {[
                                    getCategoryName(asset.category),
                                    getSubcategoryName(asset.subcategory),
                                    getSubSubcategoryName(asset.subsubcategory),
                                ]
                                    .filter(Boolean)
                                    .join(' / ')}
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                                {getSubcategoryName(asset.subcategory) && (
                                    <span className="badge bg-light text-dark">{getSubcategoryName(asset.subcategory)}</span>
                                )}
                                {getSubSubcategoryName(asset.subsubcategory) && (
                                    <span className="badge bg-light text-dark">{getSubSubcategoryName(asset.subsubcategory)}</span>
                                )}
                                {asset.keywords?.slice(0, 4).map((kw) => (
                                    <span key={kw} className="badge bg-secondary-subtle text-dark">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <aside className="asset-hero__creator-panel">
                            <div className="asset-hero__creator-row">
                                <img
                                    src={owner?.profile?.profileImage?.url || owner?.profile?.profileImage || 'https://via.placeholder.com/48'}
                                    alt={owner?.profile?.displayName || owner?.name || 'author'}
                                    className="rounded-circle"
                                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                                />
                                <div className="asset-hero__creator-details">
                                    <div className="asset-hero__author-row fw-semibold mb-1 d-flex align-items-center">
                                        <span className="asset-hero__author-label">Author:</span>
                                        <span className="asset-hero__author-name">
                                            {owner?.profile?.displayName || owner?.name || 'Unknown creator'}
                                        </span>
                                    </div>
                                    <div className="asset-hero__creator-actions">
                                        {!!ownerUserId && ownerUserId !== viewerUserId && (
                                            <button
                                                className={`btn btn-sm ${isFollowing ? 'btn-outline-primary' : 'btn-primary'}`}
                                                style={{ minWidth: 90 }}
                                                onClick={isFollowing ? handleUnfollow : handleFollow}
                                                disabled={followLoading}
                                            >
                                                {isFollowing ? 'Unfollow' : 'Follow'}
                                            </button>
                                        )}
                                        <span className="asset-hero__followers-text">
                                            {followersCount} follower{followersCount === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                    {followError && (
                                        <div className="asset-hero__follow-error text-danger mt-1">
                                            {followError}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

            </div>

            {sameSubcategorySimilarAssets.length > 0 && (
                <div className="related-section mb-4">
                    <div className="related-section__header d-flex justify-content-between align-items-center mb-2">
                        <h5 className="related-section__title fw-semibold mb-0">More like this</h5>
                        <Link className="related-section__link" to={`/collection/${normalize(getCategoryName(asset.category))}`}>See all</Link>
                    </div>
                    <ImageList
                        className="related-grid"
                        sx={{ width: '100%', height: 'auto' }}
                        variant={relatedVariant}
                        cols={relatedCols}
                        gap={relatedGap}
                    >
                        {sameSubcategorySimilarAssets.map((item) => (
                            <ImageListItem
                                key={`similar-${item._id}`}
                                onClick={() => handleOpenRelated(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="related-card">
                                    <RelatedCardMedia
                                        item={item}
                                        getCategoryName={getCategoryName}
                                        getSubcategoryName={getSubcategoryName}
                                        getResponsiveImageProps={getResponsiveImageProps}
                                    />
                                    {getCategorySubcategoryTag(item) ? (
                                        <span className="related-tag position-absolute top-0 start-0 m-2">
                                            {getCategorySubcategoryTag(item)}
                                        </span>
                                    ) : null}
                                    <div className="related-actions">
                                        <LikeBttnSm imgId={item?._id} compact compactSize={isMobile ? 28 : 34} stopPropagation />
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Edit image"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditItem(item);
                                            }}
                                        >
                                            <FiEdit3 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Download"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadItem(item);
                                            }}
                                        >
                                            <FiDownload size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Share"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShareItem(item);
                                            }}
                                        >
                                            <FiShare2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Discover similar"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDiscoverSimilarItem(item);
                                            }}
                                        >
                                            <FiCompass size={16} />
                                        </button>
                                    </div>
                                </div>
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>
            )}

            {creatorAssets.length > 0 && (
                <div className="related-section mb-4">
                    <div className="related-section__header d-flex justify-content-between align-items-center mb-2">
                        <h5 className="related-section__title fw-semibold mb-0">More from this creator</h5>
                        {getObjectId(owner?.userId) ? (
                            <Link className="related-section__link" to={`/creatordetail/${creatorId}`}>See creator profile</Link>
                        ) : (
                            <Link className="related-section__link" to={`/collection/${normalize(getCategoryName(asset.category))}`}>See all</Link>
                        )}
                    </div>
                    <ImageList
                        className="related-grid"
                        sx={{ width: '100%', height: 'auto' }}
                        variant={relatedVariant}
                        cols={relatedCols}
                        gap={relatedGap}
                    >
                        {creatorAssets.map((item) => (
                            <ImageListItem
                                key={`creator-${item._id}`}
                                onClick={() => handleOpenRelated(item)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="related-card">
                                    <RelatedCardMedia
                                        item={item}
                                        getCategoryName={getCategoryName}
                                        getSubcategoryName={getSubcategoryName}
                                        getResponsiveImageProps={getResponsiveImageProps}
                                    />
                                    {getCategorySubcategoryTag(item) ? (
                                        <span className="related-tag position-absolute top-0 start-0 m-2">
                                            {getCategorySubcategoryTag(item)}
                                        </span>
                                    ) : null}
                                    <div className="related-actions">
                                        <LikeBttnSm imgId={item?._id} compact compactSize={isMobile ? 28 : 34} stopPropagation />
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Edit image"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditItem(item);
                                            }}
                                        >
                                            <FiEdit3 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Download"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadItem(item);
                                            }}
                                        >
                                            <FiDownload size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Share"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleShareItem(item);
                                            }}
                                        >
                                            <FiShare2 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="related-btn"
                                            aria-label="Discover similar"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDiscoverSimilarItem(item);
                                            }}
                                        >
                                            <FiCompass size={16} />
                                        </button>
                                    </div>
                                </div>
                            </ImageListItem>
                        ))}
                    </ImageList>
                </div>
            )}

            {sameSubcategorySimilarAssets.length === 0 && creatorAssets.length === 0 && (
                <div className="mb-4">
                    <h5 className="fw-semibold mb-2">More like this</h5>
                    <p className="text-muted mb-0">No assets found in this subcategory yet.</p>
                </div>
            )}

            {isInfoRoute && (
                <div
                    className="asset-info-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1060,
                        padding: 12,
                    }}
                    onClick={handleCloseInfoModal}
                >
                    <div
                        className="asset-info-modal card border-0 shadow rounded-4"
                        style={{
                            width: 'min(980px, 96vw)',
                            maxHeight: '90vh',
                            overflow: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-body p-3 p-md-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h5 className="mb-1">Asset info</h5>
                                    <div className="small text-muted">{asset?.title || assetInfo?.title || 'Asset'}</div>
                                </div>
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleCloseInfoModal}>
                                    Close
                                </button>
                            </div>

                            {assetInfoLoading ? (
                                <div className="d-flex justify-content-center py-4">
                                    <div className="spinner-border text-primary" role="status" />
                                </div>
                            ) : assetInfoError ? (
                                <div className="alert alert-danger mb-0">{assetInfoError}</div>
                            ) : (
                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <div className="border rounded-3 p-3 h-100 bg-light">
                                            <div className="small text-muted">Downloads</div>
                                            <div className="h4 mb-0">{Number(assetInfo?.downloads || 0)}</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="border rounded-3 p-3 h-100 bg-light">
                                            <div className="small text-muted">Likes</div>
                                            <div className="h4 mb-0">{Number(assetInfo?.likes || 0)}</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="border rounded-3 p-3 h-100 bg-light">
                                            <div className="small text-muted">Shares</div>
                                            <div className="h4 mb-0">{Number(assetInfo?.shares || 0)}</div>
                                        </div>
                                    </div>

                                    <div className="col-12 col-lg-7">
                                        <div className="border rounded-3 p-3 h-100">
                                            <h6 className="mb-3">Technical details</h6>
                                            <div className="row gy-2 small">
                                                <div className="col-5 text-muted">License</div>
                                                <div className="col-7">{assetInfo?.freePremium || 'N/A'}</div>
                                                <div className="col-5 text-muted">Format</div>
                                                <div className="col-7">{assetInfo?.fileMetadata?.mimeType || assetInfo?.imagetype || 'N/A'}</div>
                                                <div className="col-5 text-muted">Dimensions</div>
                                                <div className="col-7">
                                                    {assetInfo?.fileMetadata?.dimensions?.width && assetInfo?.fileMetadata?.dimensions?.height
                                                        ? `${assetInfo.fileMetadata.dimensions.width} x ${assetInfo.fileMetadata.dimensions.height}`
                                                        : 'N/A'}
                                                </div>
                                                <div className="col-5 text-muted">File size</div>
                                                <div className="col-7">{formatBytes(assetInfo?.fileMetadata?.fileSize)}</div>
                                                <div className="col-5 text-muted">Category path</div>
                                                <div className="col-7">
                                                    {[assetInfo?.category?.name, assetInfo?.subcategory?.name, assetInfo?.subsubcategory?.name]
                                                        .filter(Boolean)
                                                        .join(' / ') || 'N/A'}
                                                </div>
                                                <div className="col-5 text-muted">Uploaded</div>
                                                <div className="col-7">{formatDateTime(assetInfo?.createdAt)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 col-lg-5">
                                        <div className="border rounded-3 p-3 h-100">
                                            <h6 className="mb-3">Uploader</h6>
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <img
                                                    src={assetInfo?.uploader?.profileImage || 'https://via.placeholder.com/56'}
                                                    alt={assetInfo?.uploader?.name || 'Uploader'}
                                                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <div className="fw-semibold">{assetInfo?.uploader?.name || 'Unknown creator'}</div>
                                                    <div className="small text-muted">{Number(assetInfo?.uploader?.followersCount || 0)} followers</div>
                                                </div>
                                            </div>
                                            {assetInfo?.uploader?.creatorId && (
                                                <Link to={`/creatordetail/${assetInfo.uploader.creatorId}`} className="btn btn-outline-primary btn-sm">
                                                    View creator profile
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* NEW: file size selection modal for main & related assets */}
            {showDownloadModal && downloadTarget && (
                <div
                    className="download-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1050,
                    }}
                    onClick={() => {
                        setShowDownloadModal(false);
                        setDownloadTarget(null);
                    }}
                    >
                        <div
                            className="download-modal"
                            style={{
                            background: '#fff',
                            borderRadius: 12,
                            padding: '16px 20px',
                            minWidth: 260,
                            maxWidth: 320,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mb-2 w-100"
                                onClick={() => {
                                    handleEditItem(downloadTarget);
                                    setShowDownloadModal(false);
                                    setDownloadTarget(null);
                                }}
                            >
                                Edit with HDPiks
                            </button>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#555' }}>
                                FILE SIZE
                            </div>
                        {getVariantsForItem(downloadTarget).map((v) => {
                            const label = v.variant.charAt(0).toUpperCase() + v.variant.slice(1);
                            const w = v.dimensions?.width;
                            const h = v.dimensions?.height;
                            const sizeLabel = w && h ? `${w} × ${h}px` : '';
                            return (
                                <button
                                    key={v._id?.$oid || v.s3Key || v.variant}
                                    type="button"
                                    onClick={() => handleVariantDownload(v, downloadTarget)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '6px 0',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                    }}
                                >
                                    <span>{label}</span>
                                    <span style={{ color: '#666' }}>{sizeLabel}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {showBuyAgainConfirmModal && (
                <div
                    className="download-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1060,
                    }}
                    onClick={closeBuyAgainConfirmModal}
                >
                    <div
                        className="asset-payment-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h5 className="mb-2">Buy again?</h5>
                        <div className="small text-muted mb-3">
                            You already own this asset. Continue only if you want to place a new purchase.
                        </div>
                        <div className="asset-payment-modal__amount">
                            {purchasePriceLabel
                                ? `Amount: ${purchasePriceLabel}`
                                : 'Amount will be confirmed in checkout'}
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                onClick={closeBuyAgainConfirmModal}
                                disabled={checkoutLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                onClick={handleConfirmBuyAgain}
                                disabled={checkoutLoading}
                            >
                                {checkoutLoading ? 'Opening checkout...' : 'Continue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCheckoutProviderModal && (
                <div
                    className="download-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1060,
                    }}
                    onClick={closeCheckoutProviderModal}
                >
                    <div
                        className="asset-payment-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h5 className="mb-2">Choose payment method</h5>
                        <div className="small text-muted mb-3">
                            Select how you want to pay for this asset.
                        </div>
                        <div className="d-grid gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleSelectCheckoutProvider('stripe')}
                                disabled={checkoutLoading || !hasStripeCheckout}
                            >
                                Pay with Card (Stripe)
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleSelectCheckoutProvider('paypal')}
                                disabled={checkoutLoading || !hasPayPalCheckout}
                            >
                                Pay with PayPal
                            </button>
                        </div>
                        <div className="d-flex mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                onClick={closeCheckoutProviderModal}
                                disabled={checkoutLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPayPalCheckoutModal && payPalOrderMeta && (
                <div
                    className="download-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1060,
                    }}
                    onClick={closePayPalCheckoutModal}
                >
                    <div
                        className="asset-payment-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h5 className="mb-2">Complete purchase</h5>
                        <div className="small text-muted mb-3">
                            {asset?.title || 'Asset'} via PayPal
                        </div>
                        <div className="asset-payment-modal__amount">
                            {(payPalOrderMeta?.currency || resolvedPurchaseStatus.currency || 'USD').toUpperCase()} {formatPriceUsd(payPalOrderMeta?.amountCents || resolvedPurchaseStatus.priceCents)?.replace('$', '')}
                        </div>
                        <div
                            ref={payPalButtonsHostRef}
                            className="asset-payment-modal__paypal-buttons"
                        />
                        {payPalCheckoutError && (
                            <div className="alert alert-danger py-2 px-2 mt-3 mb-0">
                                {payPalCheckoutError}
                            </div>
                        )}
                        <div className="d-flex gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                onClick={closePayPalCheckoutModal}
                                disabled={checkoutSubmitting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCheckoutModal && paymentIntentMeta && (
                <div
                    className="download-modal-backdrop"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1060,
                    }}
                    onClick={closeCheckoutModal}
                >
                    <div
                        className="asset-payment-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h5 className="mb-2">Complete purchase</h5>
                        <div className="small text-muted mb-3">
                            {asset?.title || 'Asset'}
                        </div>
                        <div className="asset-payment-modal__amount">
                            {(paymentIntentMeta?.currency || resolvedPurchaseStatus.currency || 'USD').toUpperCase()} {formatPriceUsd(paymentIntentMeta?.amountCents || resolvedPurchaseStatus.priceCents)?.replace('$', '')}
                        </div>
                        <div
                            ref={stripeCardMountRef}
                            className="asset-payment-modal__card-element"
                        />
                        {checkoutError && (
                            <div className="alert alert-danger py-2 px-2 mt-3 mb-0">
                                {checkoutError}
                            </div>
                        )}
                        <div className="d-flex gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                onClick={closeCheckoutModal}
                                disabled={checkoutSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                onClick={handleSubmitCheckoutPayment}
                                disabled={checkoutSubmitting}
                            >
                                {checkoutSubmitting ? 'Processing...' : 'Pay now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CollectionSelectModal
                show={showCollectionModal}
                onClose={handleCloseCollectionModal}
                assetId={selectedAssetId}
                onSuccess={() => {}}
            />
        </div>
        <AppFooter />
        </>
    );
}

export default AssetDetailView;


const IMAGE_VARIANT_FALLBACK_ORDER = ["thumbnail", "small", "medium", "large", "original"];
const VIDEO_VARIANT_FALLBACK_ORDER = ["360p", "720p", "1080p", "original"];
const IMAGE_VARIANT_WIDTHS = {
    thumbnail: 300,
    small: 800,
    medium: 1400,
    large: 2000,
};

const toStr = (value) => (value == null ? "" : String(value).trim());

const isVideoAsset = (asset) => {
    const mime = toStr(asset?.fileMetadata?.mimeType || asset?.imagetype).toLowerCase();
    if (mime.startsWith("video/")) return true;
    const url = toStr(asset?.imageUrl).toLowerCase();
    return /\.mp4$|\.mov$|\.m4v$|\.webm$/.test(url);
};

export const getMediaVariantUrl = (asset, preferredOrder = null) => {
    if (!asset || typeof asset !== "object") return "";
    const original = toStr(asset.imageUrl);
    const variants = Array.isArray(asset.mediaVariants) ? asset.mediaVariants : [];
    if (!variants.length) return original;

    const variantMap = new Map();
    variants.forEach((entry) => {
        const key = toStr(entry?.variant).toLowerCase();
        const url = toStr(entry?.url);
        if (key && url && !variantMap.has(key)) {
            variantMap.set(key, url);
        }
    });

    const fallback = isVideoAsset(asset) ? VIDEO_VARIANT_FALLBACK_ORDER : IMAGE_VARIANT_FALLBACK_ORDER;
    const requestedOrder = Array.isArray(preferredOrder) && preferredOrder.length ? preferredOrder : fallback;
    const normalizedOrder = requestedOrder.map((x) => toStr(x).toLowerCase()).filter(Boolean);

    for (const key of normalizedOrder) {
        if (variantMap.has(key)) return variantMap.get(key);
    }

    if (variantMap.has("original")) return variantMap.get("original");
    return original || variants.find((x) => toStr(x?.url))?.url || "";
};

const getImageVariantCandidates = (asset) => {
    const variants = Array.isArray(asset?.mediaVariants) ? asset.mediaVariants : [];
    return variants
        .map((entry) => {
            const variant = toStr(entry?.variant).toLowerCase();
            const url = toStr(entry?.url);
            if (!variant || !url) return null;
            const width = Number(entry?.dimensions?.width) || IMAGE_VARIANT_WIDTHS[variant] || 0;
            return { variant, url, width };
        })
        .filter(Boolean);
};

export const getResponsiveImageProps = (
    asset,
    {
        preferredOrder = ["small", "medium", "thumbnail", "large", "original"],
        sizes = "(max-width: 576px) 95vw, (max-width: 992px) 50vw, 33vw",
    } = {}
) => {
    const src = getMediaVariantUrl(asset, preferredOrder);
    const isVideo = isVideoAsset(asset);
    if (isVideo) {
        return { src, srcSet: "", sizes: "" };
    }

    const candidates = getImageVariantCandidates(asset);
    if (!candidates.length) {
        return { src, srcSet: "", sizes };
    }

    const uniqueByWidth = new Map();
    candidates.forEach((item) => {
        if (!item.width) return;
        if (!uniqueByWidth.has(item.width)) uniqueByWidth.set(item.width, item.url);
    });
    const sorted = [...uniqueByWidth.entries()].sort((a, b) => a[0] - b[0]);
    const srcSet = sorted.map(([width, url]) => `${url} ${width}w`).join(", ");

    return { src, srcSet, sizes };
};

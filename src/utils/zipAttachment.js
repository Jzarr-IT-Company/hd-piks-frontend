import API_BASE_URL from '../config/api.config.js';
import { trackAssetDownloadEvent } from './downloadTracking.js';

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const getObjectId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        if (typeof value.$oid === 'string') return value.$oid;
        if (typeof value.toString === 'function') {
            const asText = value.toString();
            if (asText && asText !== '[object Object]') return asText;
        }
    }
    return '';
};

const decodeFileSegment = (value) => {
    try {
        return decodeURIComponent(value || '');
    } catch {
        return value || '';
    }
};

const getS3KeyFromUrl = (url) => {
    const text = normalizeText(url);
    if (!text) return '';
    try {
        const parsed = new URL(text);
        return decodeURIComponent((parsed.pathname || '').replace(/^\/+/, ''));
    } catch {
        return '';
    }
};

const looksLikeZip = (value) => normalizeText(value).toLowerCase().split('?')[0].endsWith('.zip');

const pickZipEntry = (zipfolder) => {
    if (Array.isArray(zipfolder)) {
        return zipfolder.find((entry) => {
            if (typeof entry === 'string') return looksLikeZip(entry);
            if (!entry || typeof entry !== 'object') return false;
            const entryUrl = normalizeText(entry.url);
            const entryKey = normalizeText(entry.s3Key || entry.key);
            const entryFileName = normalizeText(entry.fileName);
            return Boolean(
                looksLikeZip(entryUrl)
                || looksLikeZip(entryKey)
                || looksLikeZip(entryFileName)
            );
        }) || null;
    }

    if (typeof zipfolder === 'string' && looksLikeZip(zipfolder)) return zipfolder;
    if (zipfolder && typeof zipfolder === 'object') {
        const entryUrl = normalizeText(zipfolder.url);
        const entryKey = normalizeText(zipfolder.s3Key || zipfolder.key);
        const entryFileName = normalizeText(zipfolder.fileName);
        if (looksLikeZip(entryUrl) || looksLikeZip(entryKey) || looksLikeZip(entryFileName)) {
            return zipfolder;
        }
    }
    return null;
};

const getFileNameFromPath = (value) => {
    const text = normalizeText(value);
    if (!text) return '';
    const clean = text.split('?')[0];
    const segment = clean.split('/').pop() || '';
    return decodeFileSegment(segment);
};

export const getZipAttachmentInfo = (asset) => {
    const entry = pickZipEntry(asset?.zipfolder);
    const fallbackUrl = normalizeText(asset?.zipfolderurl);

    let url = '';
    let s3Key = '';
    let fileName = '';

    if (typeof entry === 'string') {
        s3Key = normalizeText(entry);
    } else if (entry && typeof entry === 'object') {
        url = normalizeText(entry.url);
        s3Key = normalizeText(entry.s3Key || entry.key);
        fileName = normalizeText(entry.fileName);
    }

    if (!url) url = fallbackUrl;
    if (!s3Key && url) s3Key = getS3KeyFromUrl(url);
    if (!fileName) fileName = getFileNameFromPath(url) || getFileNameFromPath(s3Key) || 'asset.zip';
    const zipLike = looksLikeZip(fileName) || looksLikeZip(url) || looksLikeZip(s3Key);

    return {
        url,
        s3Key,
        fileName,
        hasAttachment: Boolean(zipLike && (url || s3Key)),
    };
};

export const downloadZipAttachment = async ({ asset }) => {
    const zipInfo = getZipAttachmentInfo(asset);
    if (!zipInfo.hasAttachment) {
        throw new Error('No ZIP file is attached to this asset.');
    }

    const fallbackName = zipInfo.fileName || 'asset.zip';
    await trackAssetDownloadEvent({
        assetId: getObjectId(asset?._id),
        fileName: fallbackName,
    });

    let href = zipInfo.url;
    if (zipInfo.s3Key) {
        const params = new URLSearchParams();
        params.set('key', zipInfo.s3Key);
        params.set('filename', fallbackName);
        href = `${API_BASE_URL}/download?${params.toString()}`;
    }

    if (!href) {
        throw new Error('Unable to resolve ZIP download URL.');
    }

    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', fallbackName);
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
};

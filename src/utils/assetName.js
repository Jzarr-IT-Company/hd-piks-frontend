export const stripFileExtension = (value = "") => {
    const cleaned = String(value || "")
        .trim()
        .split(/[?#]/)[0]
        .split("/")
        .pop()
        .replace(/\\/g, "");
    return cleaned.replace(/\.[a-z0-9]{1,12}$/i, "").trim();
};

const fromS3GeneratedName = (value = "") =>
    stripFileExtension(value)
        .replace(/^\d{10,}[-_][a-z0-9]{5,12}[-_]/i, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

export const getAssetDisplayName = (asset, fallback = "Untitled asset") => {
    const candidates = [
        asset?.assetDisplayName,
        asset?.fileMetadata?.displayName,
        asset?.fileMetadata?.originalFileName,
        asset?.fileMetadata?.fileName,
        asset?.imageData?.[0]?.fileName,
        asset?.imageData?.[0]?.originalFileName,
        asset?.fileName,
        asset?.s3Key ? fromS3GeneratedName(asset.s3Key) : "",
        asset?.s3Url ? fromS3GeneratedName(asset.s3Url) : "",
        asset?.imageUrl ? fromS3GeneratedName(asset.imageUrl) : "",
        asset?.title,
    ];

    for (const candidate of candidates) {
        const name = stripFileExtension(candidate);
        if (name) return name;
    }
    return fallback;
};

export const getAssetDownloadBaseName = (asset, fallback = "asset") =>
    getAssetDisplayName(asset, fallback).replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || fallback;

export const slugifyAssetValue = (value = "") =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export const getAssetUrlSlug = (asset, fallback = "asset") =>
    slugifyAssetValue(asset?.assetSlug) ||
    slugifyAssetValue(asset?.title) ||
    slugifyAssetValue(getAssetDisplayName(asset, fallback)) ||
    fallback;

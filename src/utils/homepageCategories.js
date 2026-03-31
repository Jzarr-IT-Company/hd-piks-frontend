import videosImg from '../assets/01_Videos_4K.jpeg';
import imagesImg from '../assets/02_Images_4K.jpeg';
import vectorImg from '../assets/03_Vector_4K.jpeg';
import psdImg from '../assets/04_PSD_4K.jpeg';
import aiImagesImg from '../assets/05_AI_Images_4K.jpeg';
import templatesImg from '../assets/06_Templates_4K.jpeg';
import iconsImg from '../assets/07_Icons_4K.jpeg';
import mockupsImg from '../assets/08_Mockups_4K.jpeg';
import nftsImg from '../assets/09_NFTs_4K.jpeg';

const CATEGORY_VISUALS = {
    video: { src: videosImg, tabLabel: 'Video', cardLabel: 'Videos', order: 10 },
    videos: { src: videosImg, tabLabel: 'Video', cardLabel: 'Videos', order: 10 },
    image: { src: imagesImg, tabLabel: 'Image', cardLabel: 'Images', order: 20 },
    images: { src: imagesImg, tabLabel: 'Image', cardLabel: 'Images', order: 20 },
    vector: { src: vectorImg, tabLabel: 'Vector', cardLabel: 'Vector', order: 30 },
    vectors: { src: vectorImg, tabLabel: 'Vector', cardLabel: 'Vector', order: 30 },
    psd: { src: psdImg, tabLabel: 'PSD', cardLabel: 'PSD', order: 40 },
    'ai images': { src: aiImagesImg, tabLabel: 'AI images', cardLabel: 'AI images', order: 50 },
    'ai image': { src: aiImagesImg, tabLabel: 'AI images', cardLabel: 'AI images', order: 50 },
    templates: { src: templatesImg, tabLabel: 'Templates', cardLabel: 'Templates', order: 60 },
    template: { src: templatesImg, tabLabel: 'Templates', cardLabel: 'Templates', order: 60 },
    icons: { src: iconsImg, tabLabel: 'Icons', cardLabel: 'Icons', order: 70 },
    icon: { src: iconsImg, tabLabel: 'Icons', cardLabel: 'Icons', order: 70 },
    mockups: { src: mockupsImg, tabLabel: 'Mockups', cardLabel: 'Mockups', order: 80 },
    mockup: { src: mockupsImg, tabLabel: 'Mockups', cardLabel: 'Mockups', order: 80 },
    nfts: { src: nftsImg, tabLabel: 'NFTS', cardLabel: 'NFTS', order: 90 },
    nft: { src: nftsImg, tabLabel: 'NFTS', cardLabel: 'NFTS', order: 90 },
};

const FALLBACK_CATEGORIES = [
    { _id: 'video', name: 'Video' },
    { _id: 'image', name: 'Image' },
    { _id: 'vector', name: 'Vector' },
    { _id: 'psd', name: 'PSD' },
    { _id: 'ai-images', name: 'Ai images' },
    { _id: 'templates', name: 'Templates' },
    { _id: 'icons', name: 'Icons' },
    { _id: 'mockups', name: 'Mockups' },
    { _id: 'nfts', name: 'NFTS' },
];

export const normalizeHomepageCategoryName = (value) => String(value || '').trim().toLowerCase();

const uniqByNormalizedName = (categories) => {
    const seen = new Set();
    return categories.filter((item) => {
        const normalized = normalizeHomepageCategoryName(item?.name);
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });
};

const sortCategories = (items) => {
    return [...items].sort((left, right) => {
        const leftOrder = left.order ?? 999;
        const rightOrder = right.order ?? 999;
        if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
        }
        const leftName = normalizeHomepageCategoryName(left.filterValue);
        const rightName = normalizeHomepageCategoryName(right.filterValue);
        if (leftName < rightName) return -1;
        if (leftName > rightName) return 1;
        return 0;
    });
};

export const buildHomepageCategoryEntries = (categories) => {
    const roots = Array.isArray(categories) && categories.length
        ? categories.filter((item) => item && !item.parent)
        : FALLBACK_CATEGORIES;

    const uniqueRoots = uniqByNormalizedName(roots);

    const entries = uniqueRoots.map((category) => {
        const rawName = String(category?.name || '').trim();
        const normalized = normalizeHomepageCategoryName(rawName);
        const visual = CATEGORY_VISUALS[normalized] || {};
        return {
            id: category?._id || normalized,
            filterValue: rawName || visual.tabLabel || 'Category',
            slug: normalized,
            tabLabel: visual.tabLabel || rawName || 'Category',
            cardLabel: visual.cardLabel || rawName || 'Category',
            src: visual.src || imagesImg,
            order: visual.order,
        };
    });

    return sortCategories(entries);
};

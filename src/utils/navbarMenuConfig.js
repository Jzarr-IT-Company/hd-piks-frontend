import videosImg from "../assets/01_Videos_4K.png";
import imagesImg from "../assets/02_Images_4K.png";
import vectorImg from "../assets/03_Vector_4K.png";
import psdImg from "../assets/04_PSD_4K.png";
import aiImagesImg from "../assets/05_AI_Images_4K.png";
import templatesImg from "../assets/06_Templates_4K.png";
import iconsImg from "../assets/07_Icons_4K.png";
import mockupsImg from "../assets/08_Mockups_4K.png";
import nftsImg from "../assets/09_NFTs_4K.png";

export const NAVBAR_SUBCATEGORY_LIMIT = 8;

export const slugifyCategory = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export const normalizeCategoryKey = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

export const NAVBAR_PARENT_CATEGORIES = [
    {
        label: "Videos",
        slug: "videos",
        aliases: ["video", "videos"],
        image: videosImg,
        description: "Motion clips, footage, and video-ready creative assets.",
    },
    {
        label: "Images",
        slug: "images",
        aliases: ["image", "images", "photo", "photos"],
        image: imagesImg,
        description: "High-quality photos and visual assets for every project.",
    },
    {
        label: "Vector",
        slug: "vector",
        aliases: ["vector", "vectors"],
        image: vectorImg,
        description: "Scalable illustrations, graphics, and vector artwork.",
    },
    {
        label: "PSD",
        slug: "psd",
        aliases: ["psd", "photoshop"],
        image: psdImg,
        description: "Layered design files for editable creative work.",
    },
    {
        label: "AI images",
        slug: "ai-images",
        aliases: ["ai image", "ai images", "ai generated", "ai generated images"],
        image: aiImagesImg,
        description: "AI-generated visuals for modern creative workflows.",
    },
    {
        label: "Templates",
        slug: "templates",
        aliases: ["template", "templates"],
        image: templatesImg,
        description: "Ready-made layouts and reusable design systems.",
    },
    {
        label: "Icons",
        slug: "icons",
        aliases: ["icon", "icons"],
        image: iconsImg,
        description: "Interface icons, symbols, and visual UI elements.",
    },
    {
        label: "Mockups",
        slug: "mockups",
        aliases: ["mockup", "mockups"],
        image: mockupsImg,
        description: "Presentation mockups for products, brands, and screens.",
    },
    {
        label: "NFTS",
        slug: "nfts",
        aliases: ["nft", "nfts"],
        image: nftsImg,
        description: "Digital collectibles and NFT-style creative assets.",
    },
];

const newestFirst = (left, right) => {
    const leftDate = new Date(left?.createdAt || left?.updatedAt || 0).getTime();
    const rightDate = new Date(right?.createdAt || right?.updatedAt || 0).getTime();
    if (rightDate !== leftDate) return rightDate - leftDate;
    return String(left?.name || "").localeCompare(String(right?.name || ""));
};

const findParentCategory = (categories, config) => {
    const aliases = new Set(config.aliases.map(normalizeCategoryKey));
    return categories.find((category) => aliases.has(normalizeCategoryKey(category?.name)));
};

export const buildNavbarMegaMenu = (categories = []) => {
    const roots = Array.isArray(categories) ? categories.filter(Boolean) : [];

    return NAVBAR_PARENT_CATEGORIES.map((config, index) => {
        const category = findParentCategory(roots, config);
        const children = Array.isArray(category?.children) ? category.children : [];
        const subcategories = [...children]
            .filter((item) => item?.name && item?.showInNavbar !== false)
            .sort((left, right) => {
                const leftOrder = Number.isFinite(Number(left?.navbarOrder)) ? Number(left.navbarOrder) : null;
                const rightOrder = Number.isFinite(Number(right?.navbarOrder)) ? Number(right.navbarOrder) : null;
                if (leftOrder !== null || rightOrder !== null) {
                    return (leftOrder ?? 9999) - (rightOrder ?? 9999);
                }
                return newestFirst(left, right);
            })
            .slice(0, NAVBAR_SUBCATEGORY_LIMIT)
            .map((child) => ({
                id: child._id || child.name,
                label: child.name,
                slug: slugifyCategory(child.slug || child.name),
                path: `/collection/${config.slug}/${slugifyCategory(child.slug || child.name)}`,
            }));

        return {
            id: category?._id || config.slug,
            label: config.label,
            slug: config.slug,
            image: config.image,
            description: config.description,
            order: Number.isFinite(Number(category?.navbarOrder)) ? Number(category.navbarOrder) : index,
            path: `/collection/${config.slug}`,
            subcategories,
        };
    }).sort((left, right) => left.order - right.order);
};

export const resolveCategoryFromSlug = (categories = [], slug = "") => {
    const normalizedSlug = slugifyCategory(slug);
    const roots = Array.isArray(categories) ? categories.filter(Boolean) : [];

    for (const parentConfig of NAVBAR_PARENT_CATEGORIES) {
        if (parentConfig.slug !== normalizedSlug) continue;
        const match = findParentCategory(roots, parentConfig);
        return {
            category: match || null,
            label: match?.name || parentConfig.label,
            config: parentConfig,
        };
    }

    const directMatch = roots.find((item) => slugifyCategory(item?.slug || item?.name) === normalizedSlug);
    return {
        category: directMatch || null,
        label: directMatch?.name || slug,
        config: null,
    };
};

export const resolveSubcategoryFromSlug = (parentCategory, slug = "") => {
    const normalizedSlug = slugifyCategory(slug);
    const children = Array.isArray(parentCategory?.children) ? parentCategory.children : [];
    return children.find((item) => slugifyCategory(item?.slug || item?.name) === normalizedSlug) || null;
};

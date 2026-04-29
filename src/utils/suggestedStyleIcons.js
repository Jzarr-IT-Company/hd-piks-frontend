import {
    Bot,
    BriefcaseBusiness,
    Building2,
    Camera,
    Car,
    ChartNoAxesCombined,
    CloudSun,
    Code,
    Coffee,
    Flower2,
    Gamepad2,
    Heart,
    Image,
    Landmark,
    Laptop,
    Leaf,
    MapPin,
    Megaphone,
    MonitorSmartphone,
    Mountain,
    Palette,
    PawPrint,
    Plane,
    Shapes,
    ShoppingBag,
    Sparkles,
    Sun,
    TreePine,
    Trees,
    Trophy,
    Users,
    Utensils,
    Wifi,
    Zap,
} from "lucide-react";

export const DEFAULT_SUGGESTED_STYLE_ICON = "Zap";
export const DEFAULT_SUGGESTED_ICON_COLOR = "#7c3aed";
export const DEFAULT_SUGGESTED_ICON_BG = "#ede9fe";

const PUBLIC_ICON_MAP = {
    Bot,
    BriefcaseBusiness,
    Building2,
    Camera,
    Car,
    ChartNoAxesCombined,
    CloudSun,
    Code,
    Coffee,
    Flower2,
    Gamepad2,
    Heart,
    Image,
    Landmark,
    Laptop,
    Leaf,
    MapPin,
    Megaphone,
    MonitorSmartphone,
    Mountain,
    Palette,
    PawPrint,
    Plane,
    Shapes,
    ShoppingBag,
    Sparkles,
    Sun,
    TreePine,
    Trees,
    Trophy,
    Users,
    Utensils,
    Wifi,
    Zap,
};

const PUBLIC_ICON_KEY_BY_LOWER = Object.keys(PUBLIC_ICON_MAP).reduce((acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
}, {});

const keywordIconRules = [
    { icon: "Car", keywords: ["car", "auto", "vehicle", "transport", "automotive"] },
    { icon: "PawPrint", keywords: ["wildlife", "animal", "pet", "zoo", "bird", "cat", "dog"] },
    { icon: "Bot", keywords: ["ai", "futuristic", "robot", "technology", "future"] },
    { icon: "Coffee", keywords: ["daily", "life", "lifestyle", "morning", "routine"] },
    { icon: "BriefcaseBusiness", keywords: ["business", "corporate", "office", "work", "professional"] },
    { icon: "Building2", keywords: ["building", "architecture", "city", "urban", "real estate"] },
    { icon: "Megaphone", keywords: ["advertising", "branding", "marketing", "promotion", "campaign"] },
    { icon: "ShoppingBag", keywords: ["sales", "ecommerce", "commerce", "shopping", "store"] },
    { icon: "Landmark", keywords: ["finance", "money", "bank", "investment", "accounting"] },
    { icon: "Mountain", keywords: ["landscape", "landscapes", "mountain", "outdoor", "scenery"] },
    { icon: "Flower2", keywords: ["plant", "plants", "flower", "flowers", "floral", "garden"] },
    { icon: "Leaf", keywords: ["eco", "green", "nature", "organic", "environment"] },
    { icon: "CloudSun", keywords: ["weather", "sky", "cloud", "season", "seasonal"] },
    { icon: "Shapes", keywords: ["abstract", "background", "backgrounds"] },
    { icon: "Image", keywords: ["wallpaper", "wallpapers"] },
    { icon: "Palette", keywords: ["texture", "textures"] },
    { icon: "Sparkles", keywords: ["theme", "themed"] },
    { icon: "TreePine", keywords: ["forest", "tree", "woods"] },
    { icon: "Camera", keywords: ["photo", "photography", "portrait", "camera"] },
    { icon: "Palette", keywords: ["art", "creative", "design", "illustration"] },
    { icon: "Shapes", keywords: ["pattern", "patterns", "shape", "abstract", "geometric"] },
    { icon: "Laptop", keywords: ["software", "coding", "computer", "laptop"] },
    { icon: "Code", keywords: ["code", "developer", "programming"] },
    { icon: "Wifi", keywords: ["internet", "network", "social", "online"] },
    { icon: "MonitorSmartphone", keywords: ["device", "devices", "gadget", "gadgets", "screen"] },
    { icon: "Gamepad2", keywords: ["game", "gaming", "entertainment"] },
    { icon: "Heart", keywords: ["emotion", "love", "family", "people"] },
    { icon: "Users", keywords: ["people", "team", "community", "group"] },
    { icon: "Trophy", keywords: ["sport", "sports", "award", "winner"] },
    { icon: "Utensils", keywords: ["food", "drink", "restaurant", "meal"] },
    { icon: "Plane", keywords: ["travel", "places", "vacation"] },
    { icon: "MapPin", keywords: ["location", "place", "local"] },
    { icon: "Sparkles", keywords: ["disney", "magic", "fantasy", "super", "hero", "heroes"] },
    { icon: "ChartNoAxesCombined", keywords: ["analytics", "growth", "digital marketing"] },
    { icon: "Sun", keywords: ["sun", "summer", "bright"] },
];

const normalizeText = (value) =>
    String(value || "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

export const recommendSuggestedStyleIcon = (...values) => {
    const haystack = normalizeText(values.filter(Boolean).join(" "));
    if (!haystack) return DEFAULT_SUGGESTED_STYLE_ICON;
    const rule = keywordIconRules.find((item) =>
        item.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))
    );
    return rule?.icon || DEFAULT_SUGGESTED_STYLE_ICON;
};

export const normalizeSuggestedStyleIcon = (value, ...contextValues) => {
    const raw = String(value || "").trim();
    const normalizedKnown = PUBLIC_ICON_KEY_BY_LOWER[raw.toLowerCase()];
    const normalized = normalizedKnown || raw;
    if (!normalized || normalized === DEFAULT_SUGGESTED_STYLE_ICON) {
        return recommendSuggestedStyleIcon(...contextValues);
    }
    return normalized;
};

export const getSuggestedStyleIcon = (value) =>
    PUBLIC_ICON_MAP[normalizeSuggestedStyleIcon(value)] || PUBLIC_ICON_MAP[recommendSuggestedStyleIcon(value)] || Zap;

export const getSuggestedStyleIconOption = (value) => ({
    value: value || DEFAULT_SUGGESTED_STYLE_ICON,
    label: String(value || DEFAULT_SUGGESTED_STYLE_ICON)
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .trim(),
});

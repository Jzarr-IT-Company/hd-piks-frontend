import { useQuery } from "@tanstack/react-query";
import api from "../Services/api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const SUBCATEGORY_SLICE_LIMIT = 4;
export const SUGGESTED_STYLE_SLICE_LIMIT = 4;
export const COLLECTION_ASSET_LIMIT = 16;

const normalizePageBlock = (block = {}, fallbackLimit = 4) => {
    const items = Array.isArray(block?.items) ? block.items : [];
    const page = Number(block?.page) || 1;
    const limit = Number(block?.limit) || fallbackLimit;
    const total = Number(block?.total) || items.length;
    const totalPages = Number(block?.totalPages) || Math.max(1, Math.ceil(total / Math.max(limit, 1)));

    return {
        items,
        page,
        limit,
        total,
        totalPages,
        hasPrev: Boolean(block?.hasPrev ?? page > 1),
        hasNext: Boolean(block?.hasNext ?? page < totalPages),
        hasMore: Boolean(block?.hasMore ?? page < totalPages),
    };
};

const fetchCollectionBootstrap = async (params) => {
    const response = await api.get(API_ENDPOINTS.COLLECTION_BOOTSTRAP, { params });
    const payload = response?.data || {};

    return {
        parentCategory: payload.parentCategory || params.parentCategory,
        activeSubcategory: payload.activeSubcategory || params.subcategory || "all",
        activeSubsubcategory: payload.activeSubsubcategory || params.subsubcategory || "all",
        subcategories: normalizePageBlock(payload.subcategories, SUBCATEGORY_SLICE_LIMIT),
        suggestedStyles: normalizePageBlock(payload.suggestedStyles, SUGGESTED_STYLE_SLICE_LIMIT),
        assets: normalizePageBlock(payload.assets, COLLECTION_ASSET_LIMIT),
    };
};

export const useCollectionBootstrapQuery = ({
    parentCategory,
    subcategory = "",
    subsubcategory = "",
    subcategoryPage = 1,
    suggestedPage = 1,
    assetPage = 1,
    enabled = true,
}) => {
    const params = {
        parentCategory,
        subcategory: subcategory && subcategory !== "all" ? subcategory : undefined,
        subsubcategory: subsubcategory && subsubcategory !== "all" ? subsubcategory : undefined,
        subcategoryPage,
        subcategoryLimit: SUBCATEGORY_SLICE_LIMIT,
        suggestedPage,
        suggestedLimit: SUGGESTED_STYLE_SLICE_LIMIT,
        assetPage,
        assetLimit: COLLECTION_ASSET_LIMIT,
    };

    return useQuery({
        queryKey: [
            "collection-bootstrap",
            parentCategory || "",
            params.subcategory || "all",
            params.subsubcategory || "all",
            subcategoryPage,
            suggestedPage,
            assetPage,
        ],
        queryFn: () => fetchCollectionBootstrap(params),
        enabled: enabled && Boolean(parentCategory),
        staleTime: 5 * 60 * 1000,
        keepPreviousData: true,
    });
};

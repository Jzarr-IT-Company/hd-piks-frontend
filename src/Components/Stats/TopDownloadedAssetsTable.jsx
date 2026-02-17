import React, { useEffect, useMemo, useState } from "react";
import { Empty } from "antd";
import { usePublicCategoriesQuery } from "../../query/categoryQueries";

const getEntityNameFromValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return (value.name || value.title || "").trim();
    return "";
};

const getEntityKeyFromValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "object") {
        const idValue = value._id || value.id;
        if (idValue) return String(idValue);
        return (value.name || value.title || "").trim();
    }
    return "";
};

function TopDownloadedAssetsTable({ items }) {
    const [activeTab, setActiveTab] = useState("downloads");
    const [limitMode, setLimitMode] = useState("top10");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState("");
    const categoriesQuery = usePublicCategoriesQuery();
    const categories = categoriesQuery.data || [];

    const taxonomy = useMemo(() => {
        const categoryMap = new Map();
        const subcategoryMap = new Map();
        const subSubcategoryMap = new Map();

        (Array.isArray(categories) ? categories : []).forEach((cat) => {
            const categoryKey = getEntityKeyFromValue(cat?._id || cat?.id || cat?.name);
            const categoryName = getEntityNameFromValue(cat?.name || cat?.title || cat?._id);
            if (categoryKey && categoryName) {
                categoryMap.set(categoryKey, { key: categoryKey, label: categoryName });
            }

            const subcategories = Array.isArray(cat?.children) ? cat.children : [];
            subcategories.forEach((sub) => {
                const subKey = getEntityKeyFromValue(sub?._id || sub?.id || sub?.name);
                const subName = getEntityNameFromValue(sub?.name || sub?.title || sub?._id);
                if (subKey && subName) {
                    subcategoryMap.set(subKey, { key: subKey, label: subName, categoryKey });
                }

                const subSubs = Array.isArray(sub?.children) ? sub.children : [];
                subSubs.forEach((subsub) => {
                    const subSubKey = getEntityKeyFromValue(subsub?._id || subsub?.id || subsub?.name);
                    const subSubName = getEntityNameFromValue(subsub?.name || subsub?.title || subsub?._id);
                    if (subSubKey && subSubName) {
                        subSubcategoryMap.set(subSubKey, {
                            key: subSubKey,
                            label: subSubName,
                            categoryKey,
                            subcategoryKey: subKey,
                        });
                    }
                });
            });
        });

        return { categoryMap, subcategoryMap, subSubcategoryMap };
    }, [categories]);

    const preparedItems = useMemo(() => {
        return (items || []).map((item) => {
            const rawCategoryKey = getEntityKeyFromValue(item.category);
            const rawSubcategoryKey = getEntityKeyFromValue(item.subcategory);
            const rawSubSubcategoryKey = getEntityKeyFromValue(item.subsubcategory);

            const categoryRef = taxonomy.categoryMap.get(rawCategoryKey);
            const subcategoryRef = taxonomy.subcategoryMap.get(rawSubcategoryKey);
            const subSubcategoryRef = taxonomy.subSubcategoryMap.get(rawSubSubcategoryKey);

            return {
                ...item,
                __categoryKey: rawCategoryKey || getEntityNameFromValue(item.category),
                __categoryLabel: categoryRef?.label || getEntityNameFromValue(item.category),
                __subcategoryKey: rawSubcategoryKey || getEntityNameFromValue(item.subcategory),
                __subcategoryLabel: subcategoryRef?.label || getEntityNameFromValue(item.subcategory),
                __subSubcategoryKey: rawSubSubcategoryKey || getEntityNameFromValue(item.subsubcategory),
                __subSubcategoryLabel: subSubcategoryRef?.label || getEntityNameFromValue(item.subsubcategory),
            };
        });
    }, [items, taxonomy]);

    const topDownloaded = useMemo(() => {
        return [...preparedItems]
            .filter((item) => (item.downloads || item.download || 0) > 0)
            .sort((a, b) => (b.downloads || b.download || 0) - (a.downloads || a.download || 0))
            .slice(0, 10);
    }, [preparedItems]);

    const topLiked = useMemo(() => {
        return [...preparedItems]
            .filter((item) => (item.likes || 0) > 0)
            .sort((a, b) => (b.likes || 0) - (a.likes || 0))
            .slice(0, 10);
    }, [preparedItems]);

    const categoryOptions = useMemo(() => {
        const map = new Map();
        preparedItems.forEach((item) => {
            const key = item.__categoryKey;
            const name = item.__categoryLabel;
            if (!key || !name) return;
            if (!map.has(key)) map.set(key, name);
        });
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [preparedItems]);

    const subcategoryOptions = useMemo(() => {
        const map = new Map();
        preparedItems.forEach((item) => {
            const categoryKey = item.__categoryKey;
            if (selectedCategory && categoryKey !== selectedCategory) return;
            const key = item.__subcategoryKey;
            const name = item.__subcategoryLabel;
            if (!key || !name) return;
            if (!map.has(key)) map.set(key, name);
        });
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [preparedItems, selectedCategory]);

    const subSubcategoryOptions = useMemo(() => {
        const map = new Map();
        preparedItems.forEach((item) => {
            const categoryKey = item.__categoryKey;
            const subcategoryKey = item.__subcategoryKey;
            if (selectedCategory && categoryKey !== selectedCategory) return;
            if (selectedSubcategory && subcategoryKey !== selectedSubcategory) return;
            const key = item.__subSubcategoryKey;
            const name = item.__subSubcategoryLabel;
            if (!key || !name) return;
            if (!map.has(key)) map.set(key, name);
        });
        return [...map.entries()].map(([value, label]) => ({ value, label }));
    }, [preparedItems, selectedCategory, selectedSubcategory]);

    const allAssets = useMemo(() => {
        let list = [...preparedItems];
        if (selectedCategory) {
            list = list.filter((item) => item.__categoryKey === selectedCategory);
        }
        if (selectedSubcategory) {
            list = list.filter((item) => item.__subcategoryKey === selectedSubcategory);
        }
        if (selectedSubSubcategory) {
            list = list.filter((item) => item.__subSubcategoryKey === selectedSubSubcategory);
        }

        list.sort((a, b) => {
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        });

        if (limitMode === "top10") return list.slice(0, 10);
        return list;
    }, [preparedItems, selectedCategory, selectedSubcategory, selectedSubSubcategory, sortOrder, limitMode]);

    useEffect(() => {
        if (selectedSubcategory && !subcategoryOptions.some((option) => option.value === selectedSubcategory)) {
            setSelectedSubcategory("");
            setSelectedSubSubcategory("");
        }
    }, [selectedSubcategory, subcategoryOptions]);

    useEffect(() => {
        if (selectedSubSubcategory && !subSubcategoryOptions.some((option) => option.value === selectedSubSubcategory)) {
            setSelectedSubSubcategory("");
        }
    }, [selectedSubSubcategory, subSubcategoryOptions]);

    useEffect(() => {
        if (activeTab === "downloads" && topDownloaded.length === 0 && topLiked.length > 0) {
            setActiveTab("likes");
            return;
        }
        if (activeTab === "likes" && topLiked.length === 0 && topDownloaded.length > 0) {
            setActiveTab("downloads");
        }
    }, [activeTab, topDownloaded.length, topLiked.length]);

    const tableItems = activeTab === "likes"
        ? topLiked
        : activeTab === "all"
            ? allAssets
            : topDownloaded;

    const title = activeTab === "likes"
        ? "Top liked assets"
        : activeTab === "all"
            ? "Latest uploaded assets"
            : "Top downloaded assets";

    const meta = activeTab === "all"
        ? (limitMode === "all" ? `All (${tableItems.length})` : "Top 10")
        : "Top 10";

    return (
        <section className="stats-panel">
            <div className="stats-panel__header">
                <h4 className="stats-panel__title">{title}</h4>
                <span className="stats-panel__meta">{meta}</span>
            </div>
            <div className="stats-tabs">
                <button
                    type="button"
                    className={`stats-tabs__btn ${activeTab === "downloads" ? "is-active" : ""}`}
                    onClick={() => setActiveTab("downloads")}
                >
                    Downloads
                </button>
                <button
                    type="button"
                    className={`stats-tabs__btn ${activeTab === "likes" ? "is-active" : ""}`}
                    onClick={() => setActiveTab("likes")}
                >
                    Likes
                </button>
                <button
                    type="button"
                    className={`stats-tabs__btn ${activeTab === "all" ? "is-active" : ""}`}
                    onClick={() => setActiveTab("all")}
                >
                    All Assets
                </button>
            </div>
            {activeTab === "all" ? (
                <div className="stats-filters">
                    <div className="stats-filters__group">
                        <label className="stats-filters__label">View</label>
                        <select className="stats-filters__select" value={limitMode} onChange={(e) => setLimitMode(e.target.value)}>
                            <option value="top10">Top 10</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                    <div className="stats-filters__group">
                        <label className="stats-filters__label">Order</label>
                        <select className="stats-filters__select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                    <div className="stats-filters__group">
                        <label className="stats-filters__label">Category</label>
                        <select
                            className="stats-filters__select"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setSelectedSubcategory("");
                                setSelectedSubSubcategory("");
                            }}
                        >
                            <option value="">All categories</option>
                            {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="stats-filters__group">
                        <label className="stats-filters__label">Subcategory</label>
                        <select
                            className="stats-filters__select"
                            value={selectedSubcategory}
                            onChange={(e) => {
                                setSelectedSubcategory(e.target.value);
                                setSelectedSubSubcategory("");
                            }}
                        >
                            <option value="">All subcategories</option>
                            {subcategoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="stats-filters__group">
                        <label className="stats-filters__label">Sub-subcategory</label>
                        <select
                            className="stats-filters__select"
                            value={selectedSubSubcategory}
                            onChange={(e) => setSelectedSubSubcategory(e.target.value)}
                        >
                            <option value="">All sub-subcategories</option>
                            {subSubcategoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ) : null}
            {tableItems.length === 0 ? (
                <Empty
                    description={
                        activeTab === "likes"
                            ? "0 likes yet. Liked assets will appear here."
                            : activeTab === "all"
                                ? "No assets uploaded yet."
                                : "0 downloads yet. Downloaded assets will appear here."
                    }
                />
            ) : (
                <div className="stats-table-wrap">
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Asset</th>
                                <th>Type</th>
                                <th>Downloads</th>
                                <th>Likes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableItems.map((item, index) => (
                                <tr key={item._id || `${item.title}-${index}`}>
                                    <td>{index + 1}</td>
                                    <td>{item.title || "Untitled asset"}</td>
                                    <td>{item.imagetype || item.fileMetadata?.mimeType || "-"}</td>
                                    <td>{item.downloads || item.download || 0}</td>
                                    <td>{item.likes || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default TopDownloadedAssetsTable;

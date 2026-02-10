import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import AdminCollectionsPage, { initialForm } from "../components/AdminCollectionsPage.jsx";
import api from "../../Services/api.js";
import { fetchCategories } from "../../Services/category";
import { API_ENDPOINTS } from "../../config/api.config.js";

function AdminCollectionsPageWrapper() {
	const [categories, setCategories] = useState([]);
	const [collections, setCollections] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState(initialForm);

	// NEW state: assets in scope, creators, and preview asset
	const [assets, setAssets] = useState([]);
	const [assetsLoading, setAssetsLoading] = useState(false);
	const [selectedAssetIds, setSelectedAssetIds] = useState([]);
	const [creatorMap, setCreatorMap] = useState({});
	const [previewAsset, setPreviewAsset] = useState(null);

	// load categories
	useEffect(() => {
		(async () => {
			try {
				const tree = await fetchCategories();
				setCategories(Array.isArray(tree) ? tree : []);
			} catch (e) {
				console.error("[AdminCollections] fetchCategories failed", e);
				setCategories([]);
			}
		})();
	}, []);

	// load collections
	const loadCollections = async () => {
		try {
			setLoading(true);
			setError("");
			const res = await api.get(API_ENDPOINTS.ADMIN_SUBCATEGORY_COLLECTIONS);
			setCollections(res.data?.data || []);
		} catch (e) {
			console.error("[AdminCollections] loadCollections failed", e);
			setError(e?.response?.data?.message || "Failed to load collections");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCollections();
	}, []);

	// load assets for current parent + subcategory
	const loadAssetsForScope = async (parentId, subId) => {
		if (!parentId || !subId) {
			setAssets([]);
			setCreatorMap({});
			return;
		}
		try {
			setAssetsLoading(true);
			// get all approved assets and filter client-side
			const res = await api.get(API_ENDPOINTS.GET_ALL_IMAGES);
			const all = res.data?.data || [];
			const filtered = all.filter((asset) => {
				const catId = asset.category && (asset.category._id || asset.category);
				const subCatId = asset.subcategory && (asset.subcategory._id || asset.subcategory);
				return String(catId) === String(parentId) && String(subCatId) === String(subId);
			});
			setAssets(filtered);

			// fetch creator info for these assets
			const ids = Array.from(
				new Set(
					filtered
						.map((a) => a.creatorId && (a.creatorId.$oid || a.creatorId))
						.filter(Boolean)
				)
			);
			const map = {};
			await Promise.all(
				ids.map(async (idStr) => {
					try {
						const resp = await api.get(API_ENDPOINTS.GET_CREATOR_BY_ID(idStr));
						if (resp.data?.data) {
							map[idStr] = resp.data.data;
						}
					} catch (e) {
						console.warn("[AdminCollections] creator fetch failed", idStr, e);
					}
				})
			);
			setCreatorMap(map);
		} catch (e) {
			console.error("[AdminCollections] loadAssetsForScope failed", e);
			setAssets([]);
			setCreatorMap({});
		} finally {
			setAssetsLoading(false);
		}
	};

	// reload assets when scope changes
	useEffect(() => {
		loadAssetsForScope(form.parentCategory, form.subcategory);
	}, [form.parentCategory, form.subcategory]);

	const handleFieldChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name] : type === "checkbox" ? checked : value,
		}));
	};

	const handleParentChange = (e) => {
		const { value } = e.target;
		setForm((prev) => ({
			...prev,
			parentCategory: value,
			subcategory: "",
		}));
		setSelectedAssetIds([]);
		setAssets([]);
		setCreatorMap({});
	};

	const handleNew = () => {
		setEditingId(null);
		setForm(initialForm);
		setSelectedAssetIds([]);
		setPreviewAsset(null);
	};

	const handleEdit = (col) => {
		setEditingId(col._id);
		setForm({
			parentCategory: col.parentCategory?._id || "",
			subcategory: col.subcategory?._id || "",
			name: col.name || "",
			slug: col.slug || "",
			description: col.description || "",
			isTrending: !!col.isTrending,
			active: col.active !== false,
			sortOrder: col.sortOrder || 0,
			assetIdsText: "",
		});
		const ids = Array.isArray(col.assetIds)
			? col.assetIds.map((a) => (a._id || a).toString())
			: [];
		setSelectedAssetIds(ids);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this collection?")) return;
		try {
			await api.delete(API_ENDPOINTS.ADMIN_SUBCATEGORY_COLLECTION(id));
			await loadCollections();
		} catch (e) {
			alert(e?.response?.data?.message || "Delete failed");
		}
	};

	const handleToggleAsset = (assetId) => {
		setSelectedAssetIds((prev) =>
			prev.includes(assetId)
				? prev.filter((id) => id !== assetId)
				: [...prev, assetId]
		);
	};

	const handlePreviewAsset = (asset) => {
		setPreviewAsset(asset);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.parentCategory || !form.subcategory || !form.name.trim()) {
			alert("Parent, subcategory and name are required");
			return;
		}

		const payload = {
			parentCategory: form.parentCategory,
			subcategory: form.subcategory,
			name: form.name.trim(),
			slug: form.slug.trim() || undefined,
			description: form.description.trim() || "",
			isTrending: form.isTrending,
			active: form.active,
			sortOrder: Number(form.sortOrder) || 0,
			assetIds: selectedAssetIds,
		};

		try {
			setSaving(true);
			if (editingId) {
				await api.patch(API_ENDPOINTS.ADMIN_SUBCATEGORY_COLLECTION(editingId), payload);
			} else {
				await api.post(API_ENDPOINTS.ADMIN_SUBCATEGORY_COLLECTIONS, payload);
			}
			handleNew();
			await loadCollections();
		} catch (e) {
			alert(e?.response?.data?.message || "Save failed");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="d-flex">
			<Sidebar />
			<div className="flex-grow-1">
				<AdminCollectionsPage
					categories={categories}
					collections={collections}
					loading={loading}
					error={error}
					form={form}
					editingId={editingId}
					saving={saving}
					assets={assets}
					assetsLoading={assetsLoading}
					selectedAssetIds={selectedAssetIds}
					creatorMap={creatorMap}
					previewAsset={previewAsset}
					onFieldChange={handleFieldChange}
					onParentChange={handleParentChange}
					onSubmit={handleSubmit}
					onNew={handleNew}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onToggleAsset={handleToggleAsset}
					onPreviewAsset={handlePreviewAsset}
					onClosePreview={() => setPreviewAsset(null)}
				/>
			</div>
		</div>
	);
}

export default AdminCollectionsPageWrapper;

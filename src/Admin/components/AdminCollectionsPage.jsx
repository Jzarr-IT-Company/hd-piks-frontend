import React, { useMemo } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Alert,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import collectionIcon from '../../assets/collectionIcon.png';

export const initialForm = {
    parentCategory: '',
    subcategory: '',
    name: '',
    slug: '',
    description: '',
    isTrending: false,
    active: true,
    sortOrder: 0,
    assetIdsText: '',
};

function AdminCollectionsPage({
    categories = [],
    collections = [],
    loading = false,
    error = '',
    form = initialForm,
    editingId = null,
    saving = false,
    assets = [],
    assetsLoading = false,
    selectedAssetIds = [],
    onFieldChange,
    onParentChange,
    onSubmit,
    onNew,
    onEdit,
    onDelete,
    onToggleAsset,
    onPreviewAsset,
    previewAsset,
    onClosePreview,
    creatorMap = {},
}) {
    const parentOptions = useMemo(
        () => categories.filter((c) => !c.parent),
        [categories]
    );

    const subcategoryOptions = useMemo(() => {
        if (!form.parentCategory) return [];
        const parent = categories.find((c) => String(c._id) === String(form.parentCategory));
        return parent?.children || [];
    }, [categories, form.parentCategory]);

    const previewCreator = useMemo(() => {
        if (!previewAsset) return null;
        const id = previewAsset.creatorId && (previewAsset.creatorId.$oid || previewAsset.creatorId);
        return id ? creatorMap[String(id)] : null;
    }, [previewAsset, creatorMap]);

    const isPreviewVideo =
        previewAsset &&
        (previewAsset.imagetype?.startsWith('video/') ||
            previewAsset.fileMetadata?.mimeType?.startsWith('video/'));

    const selectedAssets = useMemo(
        () => assets.filter((a) => selectedAssetIds.includes(a._id)),
        [assets, selectedAssetIds]
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600} mb={2}>
                Sub‑category Collections (Admin)
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={2}>
                {/* LEFT: collections as cards */}
                <Grid item xs={12} md={7}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 1.5,
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={500}>
                                Collections
                            </Typography>
                            <Button size="small" variant="outlined" onClick={onNew}>
                                New collection
                            </Button>
                        </Box>

                        {loading ? (
                            <Typography variant="body2">Loading…</Typography>
                        ) : !collections.length ? (
                            <Typography variant="body2">No collections yet.</Typography>
                        ) : (
                            <Grid container spacing={2}>
                                {collections.map((col) => {
                                    const assetCount = Array.isArray(col.assetIds) ? col.assetIds.length : 0;
                                    const coverUrl =
                                        col.coverImageUrl ||
                                        col.coverAsset?.imageUrl ||
                                        undefined;
                                    const parentName = col.parentCategory?.name || '—';
                                    const subName = col.subcategory?.name || '—';

                                    return (
                                        <Grid item xs={12} sm={6} key={col._id}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        boxShadow: '0 14px 40px rgba(15,23,42,0.35)',
                                                    },
                                                }}
                                                onClick={() => onEdit(col)}
                                            >
                                                {/* Top visual: stacked background + cover + assets badge */}
                                                <Box sx={{ position: 'relative', mb: 1.5, height: 120 }}>
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            top: 8,
                                                            left: 8,
                                                            borderRadius: 2,
                                                            bgcolor: '#020617',
                                                            opacity: 0.3,
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            top: 4,
                                                            left: 4,
                                                            borderRadius: 2,
                                                            bgcolor: '#020617',
                                                            opacity: 0.6,
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            borderRadius: 2,
                                                            overflow: 'hidden',
                                                            bgcolor: '#020617',
                                                            backgroundImage: coverUrl
                                                                ? `url(${coverUrl})`
                                                                : 'linear-gradient(135deg,#0f172a,#1f2937)',
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                        }}
                                                    />
                                                    {/* icon + asset count */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            left: 10,
                                                            bottom: 10,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            bgcolor: 'rgba(15,23,42,0.8)',
                                                            borderRadius: 999,
                                                            px: 1.2,
                                                            py: 0.4,
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={collectionIcon}
                                                            alt="collection"
                                                            sx={{ width: 18, height: 18 }}
                                                        />
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: '#e5e7eb', fontWeight: 500 }}
                                                        >
                                                            {assetCount} assets
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Text area */}
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={600}
                                                        noWrap
                                                        sx={{ mb: 0.25 }}
                                                    >
                                                        {col.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        noWrap
                                                        sx={{ fontSize: 13 }}
                                                    >
                                                        {parentName} / {subName}
                                                    </Typography>
                                                    {col.isTrending && (
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                mt: 0.5,
                                                                gap: 0.5,
                                                            }}
                                                        >
                                                            <WhatshotIcon
                                                                fontSize="small"
                                                                sx={{ color: '#f97316' }}
                                                            />
                                                            <Typography
                                                                variant="caption"
                                                                sx={{ color: '#f97316', fontWeight: 500 }}
                                                            >
                                                                Trending
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Actions row */}
                                                <Box
                                                    sx={{
                                                        mt: 1.2,
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(col);
                                                        }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(col._id);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT: form + selected-assets preview + assets list */}
                <Grid item xs={12} md={5}>
                    <Paper variant="outlined">
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderBottom: '1px solid rgba(0,0,0,0.12)',
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={500}>
                                {editingId ? 'Edit Collection' : 'Create Collection'}
                            </Typography>
                        </Box>
                        <Box
                            component="form"
                            onSubmit={onSubmit}
                            sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
                        >
                            <FormControl size="small" fullWidth>
                                <InputLabel id="parentCategory-label">Parent category</InputLabel>
                                <Select
                                    labelId="parentCategory-label"
                                    label="Parent category"
                                    name="parentCategory"
                                    value={form.parentCategory}
                                    onChange={onParentChange}
                                >
                                    <MenuItem value="">
                                        <em>Select parent</em>
                                    </MenuItem>
                                    {parentOptions.map((p) => (
                                        <MenuItem key={p._id} value={p._id}>
                                            {p.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth disabled={!form.parentCategory}>
                                <InputLabel id="subcategory-label">Subcategory</InputLabel>
                                <Select
                                    labelId="subcategory-label"
                                    label="Subcategory"
                                    name="subcategory"
                                    value={form.subcategory}
                                    onChange={onFieldChange}
                                >
                                    <MenuItem value="">
                                        <em>Select subcategory</em>
                                    </MenuItem>
                                    {subcategoryOptions.map((s) => (
                                        <MenuItem key={s._id} value={s._id}>
                                            {s.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                size="small"
                                label="Name"
                                name="name"
                                value={form.name}
                                onChange={onFieldChange}
                                fullWidth
                            />

                            <TextField
                                size="small"
                                label="Slug (optional)"
                                name="slug"
                                value={form.slug}
                                onChange={onFieldChange}
                                fullWidth
                            />

                            <TextField
                                size="small"
                                label="Description (optional)"
                                name="description"
                                value={form.description}
                                onChange={onFieldChange}
                                fullWidth
                                multiline
                                minRows={2}
                            />

                            <Stack direction="row" spacing={2}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="isTrending"
                                            checked={form.isTrending}
                                            onChange={onFieldChange}
                                            size="small"
                                        />
                                    }
                                    label="Show as top trending"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="active"
                                            checked={form.active}
                                            onChange={onFieldChange}
                                            size="small"
                                        />
                                    }
                                    label="Active"
                                />
                            </Stack>

                            <TextField
                                size="small"
                                type="number"
                                label="Sort order"
                                name="sortOrder"
                                value={form.sortOrder}
                                onChange={onFieldChange}
                                fullWidth
                            />

                            <Box
                                sx={{
                                    mt: 2,
                                    pt: 1.5,
                                    borderTop: '1px solid rgba(0,0,0,0.08)',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                    Assets in this category &amp; subcategory
                                </Typography>

                                {!form.parentCategory || !form.subcategory ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Select a parent category and subcategory to load assets.
                                    </Typography>
                                ) : assetsLoading ? (
                                    <Typography variant="body2">Loading assets…</Typography>
                                ) : !assets.length ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No assets found for this category/subcategory.
                                    </Typography>
                                ) : (
                                    <Box
                                        sx={{
                                            maxHeight: 260,
                                            overflowY: 'auto',
                                            pr: 1,
                                            mt: 0.5,
                                        }}
                                    >
                                        {assets.map((asset) => {
                                            const isSelected = selectedAssetIds.includes(asset._id);
                                            const isVideo =
                                                asset.imagetype &&
                                                asset.imagetype.toString().startsWith('video/');
                                            return (
                                                <Box
                                                    key={asset._id}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        mb: 1,
                                                        p: 0.75,
                                                        borderRadius: 1,
                                                        border: '1px solid rgba(148,163,184,0.5)',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                                                        onClick={() => onPreviewAsset && onPreviewAsset(asset)}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 56,
                                                                height: 40,
                                                                borderRadius: 1,
                                                                overflow: 'hidden',
                                                                bgcolor: '#0f172a',
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {asset.imageUrl ? (
                                                                isVideo ? (
                                                                    <video
                                                                        src={asset.imageUrl}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                        }}
                                                                        muted
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={asset.imageUrl}
                                                                        alt={asset.title || 'asset'}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                        }}
                                                                    />
                                                                )
                                                            ) : null}
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                noWrap
                                                                sx={{ maxWidth: 150, fontWeight: 500 }}
                                                            >
                                                                {asset.title || 'Untitled asset'}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                noWrap
                                                                sx={{ maxWidth: 160 }}
                                                            >
                                                                {asset.fileMetadata?.mimeType || asset.imagetype || ''}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        variant={isSelected ? 'contained' : 'outlined'}
                                                        color={isSelected ? 'primary' : 'inherit'}
                                                        onClick={() => onToggleAsset(asset._id)}
                                                    >
                                                        {isSelected ? 'Remove' : 'Add'}
                                                    </Button>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                            </Box>

                            <Stack direction="row" spacing={1.5} justifyContent="space-between" mt={1}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="small"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                                </Button>
                                {editingId && (
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        size="small"
                                        onClick={onNew}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* PREVIEW MODAL */}
            <Dialog
                open={!!previewAsset}
                onClose={onClosePreview}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Asset preview</DialogTitle>
                <DialogContent dividers>
                    {previewAsset && (
                        <Box>
                            <Box
                                sx={{
                                    width: '100%',
                                    maxHeight: 360,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    mb: 2,
                                    bgcolor: '#000',
                                }}
                            >
                                {isPreviewVideo ? (
                                    <video
                                        src={previewAsset.imageUrl}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                        }}
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={previewAsset.imageUrl}
                                        alt={previewAsset.title || 'asset'}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                )}
                            </Box>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {previewAsset.title || 'Untitled asset'}
                            </Typography>
                            {previewAsset.description && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 1.5, whiteSpace: 'pre-line' }}
                                >
                                    {previewAsset.description}
                                </Typography>
                            )}
                            <Typography variant="body2">
                                <strong>Mime type:</strong>{' '}
                                {previewAsset.fileMetadata?.mimeType || previewAsset.imagetype || 'Unknown'}
                            </Typography>
                            {previewAsset.fileMetadata?.fileSize && (
                                <Typography variant="body2">
                                    <strong>File size:</strong>{' '}
                                    {Math.round(previewAsset.fileMetadata.fileSize / 1024)} KB
                                </Typography>
                            )}
                            {previewCreator && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Uploaded by:</strong>{' '}
                                    {previewCreator.profile?.displayName ||
                                        previewCreator.displayName ||
                                        previewCreator.name ||
                                        previewCreator.email}
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClosePreview}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminCollectionsPage;
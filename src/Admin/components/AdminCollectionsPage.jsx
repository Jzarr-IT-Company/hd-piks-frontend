import React, { useMemo, useState } from 'react';
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
  Chip,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';

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

const toId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') return String(value._id || value.$oid || '');
  return String(value);
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
  const [collectionQuery, setCollectionQuery] = useState('');
  const [collectionSort, setCollectionSort] = useState('updated_desc');
  const [assetQuery, setAssetQuery] = useState('');

  const normalizedSelectedIds = useMemo(
    () => selectedAssetIds.map((id) => String(id)),
    [selectedAssetIds]
  );

  const parentOptions = useMemo(() => categories.filter((c) => !c.parent), [categories]);

  const subcategoryOptions = useMemo(() => {
    if (!form.parentCategory) return [];
    const parent = categories.find((c) => String(c._id) === String(form.parentCategory));
    return parent?.children || [];
  }, [categories, form.parentCategory]);

  const previewCreator = useMemo(() => {
    if (!previewAsset) return null;
    const id = toId(previewAsset.creatorId);
    return id ? creatorMap[id] : null;
  }, [previewAsset, creatorMap]);

  const isPreviewVideo =
    previewAsset &&
    (previewAsset.imagetype?.startsWith('video/') ||
      previewAsset.fileMetadata?.mimeType?.startsWith('video/'));

  const selectedAssets = useMemo(
    () => assets.filter((a) => normalizedSelectedIds.includes(toId(a._id))),
    [assets, normalizedSelectedIds]
  );

  const stats = useMemo(() => {
    const trending = collections.filter((c) => c.isTrending).length;
    const active = collections.filter((c) => c.active).length;
    const totalAssets = collections.reduce(
      (acc, c) => acc + (Array.isArray(c.assetIds) ? c.assetIds.length : 0),
      0
    );
    return {
      totalCollections: collections.length,
      totalAssets,
      trending,
      active,
    };
  }, [collections]);

  const normalizedCollectionQuery = collectionQuery.trim().toLowerCase();

  const filteredCollections = useMemo(() => {
    const queried = collections.filter((col) => {
      if (!normalizedCollectionQuery) return true;
      const parentName = col.parentCategory?.name || '';
      const subName = col.subcategory?.name || '';
      const description = col.description || '';
      return [col.name || '', parentName, subName, description]
        .join(' ')
        .toLowerCase()
        .includes(normalizedCollectionQuery);
    });

    const sorted = [...queried];

    sorted.sort((a, b) => {
      const aAssets = Array.isArray(a.assetIds) ? a.assetIds.length : 0;
      const bAssets = Array.isArray(b.assetIds) ? b.assetIds.length : 0;
      const aUpdated = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bUpdated = new Date(b.updatedAt || b.createdAt || 0).getTime();
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();

      if (collectionSort === 'updated_asc') return aUpdated - bUpdated;
      if (collectionSort === 'updated_desc') return bUpdated - aUpdated;
      if (collectionSort === 'name_asc') return aName.localeCompare(bName);
      if (collectionSort === 'name_desc') return bName.localeCompare(aName);
      if (collectionSort === 'assets_desc') return bAssets - aAssets;
      if (collectionSort === 'assets_asc') return aAssets - bAssets;
      return 0;
    });

    return sorted;
  }, [collections, normalizedCollectionQuery, collectionSort]);

  const filteredAssets = useMemo(() => {
    const q = assetQuery.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((asset) => {
      const title = asset.title || 'Untitled asset';
      const type = asset.fileMetadata?.mimeType || asset.imagetype || '';
      return `${title} ${type}`.toLowerCase().includes(q);
    });
  }, [assets, assetQuery]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Collections Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize collection groups, map assets, and control visibility.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNew}>
          New collection
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Total collections</Typography>
            <Typography variant="h6" fontWeight={700}>{stats.totalCollections}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Mapped assets</Typography>
            <Typography variant="h6" fontWeight={700}>{stats.totalAssets}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Trending</Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main">{stats.trending}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">Active</Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">{stats.active}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.25}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              mb={1.5}
            >
              <TextField
                size="small"
                placeholder="Search collections by name, category, description"
                value={collectionQuery}
                onChange={(e) => setCollectionQuery(e.target.value)}
                sx={{ minWidth: { md: 320 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
                <InputLabel id="collection-sort-label">Sort</InputLabel>
                <Select
                  labelId="collection-sort-label"
                  label="Sort"
                  value={collectionSort}
                  onChange={(e) => setCollectionSort(e.target.value)}
                >
                  <MenuItem value="updated_desc">Recently updated</MenuItem>
                  <MenuItem value="updated_asc">Oldest updated</MenuItem>
                  <MenuItem value="name_asc">Name A-Z</MenuItem>
                  <MenuItem value="name_desc">Name Z-A</MenuItem>
                  <MenuItem value="assets_desc">Most assets</MenuItem>
                  <MenuItem value="assets_asc">Least assets</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {loading ? (
              <Typography variant="body2">Loading...</Typography>
            ) : !filteredCollections.length ? (
              <Paper
                variant="outlined"
                sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderStyle: 'dashed' }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>No collections found</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a new collection or change your search query.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={1.5}>
                {filteredCollections.map((col) => {
                  const assetCount = Array.isArray(col.assetIds) ? col.assetIds.length : 0;
                  const firstAssetCover = Array.isArray(col.assetIds)
                    ? col.assetIds
                      .map((item) => {
                        if (!item || typeof item === 'string') return '';
                        const direct =
                          item.imageUrl || item.url || item.thumbnailUrl || item.s3Url || '';
                        if (direct) return direct;
                        const nestedAsset = item.asset || item.assetId || null;
                        if (!nestedAsset || typeof nestedAsset !== 'object') return '';
                        return (
                          nestedAsset.imageUrl
                          || nestedAsset.url
                          || nestedAsset.thumbnailUrl
                          || nestedAsset.s3Url
                          || ''
                        );
                      })
                      .find(Boolean)
                    : '';
                  const coverUrl =
                    col.coverImageUrl || col.coverAsset?.imageUrl || firstAssetCover || undefined;
                  const parentName = col.parentCategory?.name || '-';
                  const subName = col.subcategory?.name || '-';

                  return (
                    <Grid item xs={12} sm={6} key={col._id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 10px 30px rgba(15,23,42,0.14)',
                          },
                        }}
                      >
                        <Box
                          onClick={() => onEdit(col)}
                          sx={{
                            cursor: 'pointer',
                            height: 130,
                            position: 'relative',
                            bgcolor: '#0f172a',
                            backgroundImage: coverUrl
                              ? `linear-gradient(to bottom, rgba(2,6,23,0.2), rgba(2,6,23,0.75)), url(${coverUrl})`
                              : 'linear-gradient(120deg,#0f172a,#1e293b)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <Chip
                            size="small"
                            icon={<ImageIcon sx={{ color: '#fff !important' }} />}
                            label={`${assetCount} assets`}
                            sx={{
                              position: 'absolute',
                              left: 10,
                              bottom: 10,
                              color: '#fff',
                              bgcolor: 'rgba(2,6,23,0.7)',
                              '.MuiChip-label': { fontWeight: 600 },
                            }}
                          />
                          {col.isTrending && (
                            <Chip
                              size="small"
                              icon={<WhatshotIcon sx={{ color: '#fff !important' }} />}
                              label="Trending"
                              sx={{
                                position: 'absolute',
                                right: 10,
                                top: 10,
                                color: '#fff',
                                bgcolor: 'rgba(249,115,22,0.85)',
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ p: 1.25 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                              {col.name || 'Untitled collection'}
                            </Typography>
                            {!col.active && <Chip size="small" label="Inactive" variant="outlined" />}
                          </Stack>

                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                            {parentName} / {subName}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.8,
                              minHeight: 36,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {col.description || 'No description provided.'}
                          </Typography>

                          <Stack direction="row" spacing={1} sx={{ mt: 1.2 }}>
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              startIcon={<EditOutlinedIcon />}
                              onClick={() => onEdit(col)}
                            >
                              Edit
                            </Button>
                            <Button
                              fullWidth
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon />}
                              onClick={() => onDelete(col._id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: '1px solid rgba(148,163,184,0.35)',
                bgcolor: 'rgba(248,250,252,0.9)',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {editingId ? 'Edit collection' : 'Create collection'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configure taxonomy mapping and add assets.
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
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
              </Stack>

              <TextField
                size="small"
                label="Collection name"
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

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <FormControlLabel
                  control={<Checkbox name="isTrending" checked={form.isTrending} onChange={onFieldChange} size="small" />}
                  label="Top trending"
                />
                <FormControlLabel
                  control={<Checkbox name="active" checked={form.active} onChange={onFieldChange} size="small" />}
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

              <Divider />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Assets in selected taxonomy
                </Typography>
                <TextField
                  size="small"
                  placeholder="Search assets"
                  value={assetQuery}
                  onChange={(e) => setAssetQuery(e.target.value)}
                  sx={{ minWidth: { sm: 180 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {selectedAssets.length > 0 && (
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  {selectedAssets.slice(0, 8).map((asset) => (
                    <Chip
                      key={toId(asset._id)}
                      size="small"
                      label={asset.title || 'Untitled'}
                      onDelete={() => onToggleAsset(toId(asset._id))}
                    />
                  ))}
                  {selectedAssets.length > 8 && (
                    <Chip size="small" label={`+${selectedAssets.length - 8} more`} variant="outlined" />
                  )}
                </Stack>
              )}

              {!form.parentCategory || !form.subcategory ? (
                <Typography variant="body2" color="text.secondary">
                  Select parent category and subcategory to load assets.
                </Typography>
              ) : assetsLoading ? (
                <Typography variant="body2">Loading assets...</Typography>
              ) : !filteredAssets.length ? (
                <Typography variant="body2" color="text.secondary">
                  No assets found for this selection.
                </Typography>
              ) : (
                <Box
                  sx={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    pr: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                  }}
                >
                  {filteredAssets.map((asset) => {
                    const assetId = toId(asset._id);
                    const isSelected = normalizedSelectedIds.includes(assetId);
                    const isVideo = asset.imagetype && asset.imagetype.toString().startsWith('video/');

                    return (
                      <Box
                        key={assetId}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          p: 0.75,
                          borderRadius: 1,
                          border: '1px solid rgba(148,163,184,0.45)',
                          bgcolor: isSelected ? 'rgba(37,99,235,0.06)' : 'transparent',
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flex: 1, minWidth: 0 }}
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
                                <video src={asset.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                              ) : (
                                <img
                                  src={asset.imageUrl}
                                  alt={asset.title || 'asset'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              )
                            ) : null}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                              {asset.title || 'Untitled asset'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {asset.fileMetadata?.mimeType || asset.imagetype || ''}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => onPreviewAsset && onPreviewAsset(asset)} title="Preview">
                            <ImageIcon fontSize="small" />
                          </IconButton>
                          <Button
                            size="small"
                            variant={isSelected ? 'contained' : 'outlined'}
                            color={isSelected ? 'primary' : 'inherit'}
                            onClick={() => onToggleAsset(assetId)}
                          >
                            {isSelected ? 'Remove' : 'Add'}
                          </Button>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              )}

              <Stack direction="row" spacing={1} justifyContent="space-between" mt={0.5}>
                <Button type="submit" variant="contained" size="small" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outlined" size="small" onClick={onNew}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!previewAsset} onClose={onClosePreview} maxWidth="sm" fullWidth>
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
                  <video src={previewAsset.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
                ) : (
                  <img
                    src={previewAsset.imageUrl}
                    alt={previewAsset.title || 'asset'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
              </Box>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {previewAsset.title || 'Untitled asset'}
              </Typography>
              {previewAsset.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, whiteSpace: 'pre-line' }}>
                  {previewAsset.description}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Mime type:</strong> {previewAsset.fileMetadata?.mimeType || previewAsset.imagetype || 'Unknown'}
              </Typography>
              {previewAsset.fileMetadata?.fileSize && (
                <Typography variant="body2">
                  <strong>File size:</strong> {Math.round(previewAsset.fileMetadata.fileSize / 1024)} KB
                </Typography>
              )}
              {previewCreator && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Uploaded by:</strong>{' '}
                  {previewCreator.profile?.displayName || previewCreator.displayName || previewCreator.name || previewCreator.email}
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

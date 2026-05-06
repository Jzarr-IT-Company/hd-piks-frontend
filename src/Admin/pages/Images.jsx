import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  MenuItem,
  InputAdornment,
  TablePagination,
} from '@mui/material';
import { Delete, CheckCircle, Cancel, Visibility, Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import api from '../../Services/api';
import API_BASE_URL, { API_ENDPOINTS } from '../../config/api.config.js';
import { getAssetDisplayName } from '../../utils/assetName.js';

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [creators, setCreators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'delete'
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [seoMetaTagsHtml, setSeoMetaTagsHtml] = useState('');
  const [seoSchemaScriptHtml, setSeoSchemaScriptHtml] = useState('');
  const [seoSaving, setSeoSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [uploaderFilter, setUploaderFilter] = useState('all');
  const [categoryPathFilter, setCategoryPathFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch images first, then load creators/categories if permitted.
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const imgRes = await api.get('/admin/images');
      setImages(imgRes.data.data || []);
    } catch {
      setError('Failed to fetch images');
      setLoading(false);
      return;
    }

    const [creatorRes, categoryRes] = await Promise.allSettled([
      api.get('/admin/creators'),
      api.get('/admin/categories'),
    ]);

    setCreators(
      creatorRes.status === 'fulfilled'
        ? (creatorRes.value?.data?.data || [])
        : []
    );
    setCategories(
      categoryRes.status === 'fulfilled'
        ? (categoryRes.value?.data?.data || [])
        : []
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getFieldId = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') return String(field._id || field.$oid || '');
    return String(field);
  };

  const categoryNameMap = useMemo(() => {
    const map = {};

    const walk = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((cat) => {
        const id = String(cat?._id || cat?.id || '');
        if (id) {
          map[id] = cat?.name || id;
        }
        if (Array.isArray(cat?.children) && cat.children.length) {
          walk(cat.children);
        }
      });
    };

    walk(categories);
    return map;
  }, [categories]);

  const resolveCategoryName = (field) => {
    if (!field) return '';
    if (typeof field === 'object') {
      if (field.name) return field.name;
      const id = getFieldId(field);
      return categoryNameMap[id] || id;
    }
    const id = getFieldId(field);
    return categoryNameMap[id] || id;
  };

  const getStatusLabel = (img) => {
    const status = String(img?.status || '').toLowerCase();
    if (status === 'approved' || img?.approved === true) return 'Approved';
    if (status === 'rejected' || img?.rejected === true) return 'Rejected';
    return 'Pending';
  };

  const getStatusColor = (img) => {
    const status = getStatusLabel(img);
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'warning';
    return 'default';
  };

  const creatorMap = useMemo(() => {
    const map = {};
    creators.forEach((c) => {
      map[String(c._id)] = c;
    });
    return map;
  }, [creators]);

  const handleStatus = async (id, status, reason = null) => {
    try {
      await api.patch(`/admin/images/${id}/status`, { status, reason });
      fetchData();
    } catch {
      alert('Status update failed');
    }
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    await handleStatus(rejectingId, 'rejected', rejectReason);
    setRejectDialogOpen(false);
    setRejectingId(null);
    setRejectReason('');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/images/${id}`);
      fetchData();
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await api.delete('/fileObjectDelete', { data: { id } });
          fetchData();
          return;
        } catch {
          alert('Delete failed');
          return;
        }
      }
      alert('Delete failed');
    }
  };

  const handleApproveClick = (img) => {
    setConfirmAction('approve');
    setConfirmTarget(img);
    setConfirmDialogOpen(true);
  };

  const handleDeleteClick = (img) => {
    setConfirmAction('delete');
    setConfirmTarget(img);
    setConfirmDialogOpen(true);
  };

  const openAssetDetails = (img) => {
    setViewTarget(img);
    setSeoMetaTagsHtml(img?.seo?.metaTagsHtml || '');
    setSeoSchemaScriptHtml(img?.seo?.schemaScriptHtml || '');
    setViewDialogOpen(true);
  };

  const handleSaveSeo = async () => {
    if (!viewTarget?._id) return;
    setSeoSaving(true);
    try {
      const response = await api.patch(API_ENDPOINTS.ADMIN_IMAGE_SEO(viewTarget._id), {
        seo: {
          metaTagsHtml: seoMetaTagsHtml,
          schemaScriptHtml: seoSchemaScriptHtml,
        },
      });
      const updatedAsset = response?.data?.data || null;
      setImages((current) =>
        current.map((item) => (String(item._id) === String(viewTarget._id) ? { ...item, ...(updatedAsset || {}), seo: updatedAsset?.seo || { metaTagsHtml: seoMetaTagsHtml, schemaScriptHtml: seoSchemaScriptHtml } } : item))
      );
      setViewTarget((current) =>
        current ? { ...current, ...(updatedAsset || {}), seo: updatedAsset?.seo || { metaTagsHtml: seoMetaTagsHtml, schemaScriptHtml: seoSchemaScriptHtml } } : current
      );
      setError('');
    } catch (err) {
      const apiMessage = String(err?.response?.data?.errors?.[0] || err?.response?.data?.message || '').trim();
      setError(apiMessage || 'Failed to save asset SEO');
    } finally {
      setSeoSaving(false);
    }
  };

  const handleConfirmProceed = async () => {
    if (!confirmTarget?._id) return;
    if (confirmAction === 'approve') {
      await handleStatus(confirmTarget._id, 'approved');
    } else if (confirmAction === 'delete') {
      await handleDelete(confirmTarget._id);
    }
    setConfirmDialogOpen(false);
    setConfirmAction(null);
    setConfirmTarget(null);
  };

  const getCreatorName = (creatorId) => {
    if (!creatorId) return '-';

    if (typeof creatorId === 'object') {
      const profileName = creatorId?.profile?.displayName || creatorId?.profile?.name;
      const userName = creatorId?.userId?.name;
      const directName = creatorId?.name;
      const name = profileName || directName || userName;
      if (name) return name;
      const fallbackId = creatorId?._id || creatorId?.$oid;
      return fallbackId ? String(fallbackId) : '-';
    }

    const normalizedId = String(creatorId);
    const creator = creatorMap[normalizedId] || creators.find((c) => String(c._id) === normalizedId);
    return (
      creator?.profile?.displayName
      || creator?.name
      || creator?.userId?.name
      || normalizedId
      || '-'
    );
  };

  const getFileQuality = (img) => {
    const w = img?.fileMetadata?.dimensions?.width;
    const h = img?.fileMetadata?.dimensions?.height;
    if (w && h) return `${w} x ${h}`;
    return '-';
  };

  const getFileSize = (img) => {
    return img?.fileMetadata?.fileSizeFormatted || img?.imagesize || '-';
  };

  const getFileType = (img) => {
    return img?.fileMetadata?.mimeType || img?.imagetype || '-';
  };

  const getCategoryPath = (img) => {
    const parts = [
      resolveCategoryName(img?.category),
      resolveCategoryName(img?.subcategory),
      resolveCategoryName(img?.subsubcategory),
    ].filter(Boolean);
    return parts.join(' / ') || '-';
  };

  const getZipUrl = (img) => {
    if (!img) return '';
    if (typeof img.zipfolderurl === 'string' && img.zipfolderurl.trim()) return img.zipfolderurl.trim();
    if (Array.isArray(img.zipfolder)) {
      const first = img.zipfolder.find((z) => typeof z?.url === 'string' && z.url.trim());
      if (first?.url) return first.url.trim();
    }
    return '';
  };

  const getZipKey = (img) => {
    if (!img) return '';
    if (Array.isArray(img.zipfolder)) {
      const first = img.zipfolder.find((z) =>
        typeof z?.s3Key === 'string' && z.s3Key.trim()
        || typeof z?.key === 'string' && z.key.trim()
      );
      if (first?.s3Key) return first.s3Key.trim();
      if (first?.key) return first.key.trim();
    }
    if (img.zipfolder && typeof img.zipfolder === 'object') {
      return String(img.zipfolder.s3Key || img.zipfolder.key || '').trim();
    }
    return '';
  };

  const getZipFileName = (img) => {
    const url = getZipUrl(img);
    if (!url) return '';
    try {
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('/');
      return decodeURIComponent(parts[parts.length - 1] || '');
    } catch {
      return '';
    }
  };

  const getCoverDownloadUrl = (img) => {
    if (!img) return '';
    if (typeof img.imageUrl === 'string' && img.imageUrl.trim()) return img.imageUrl.trim();
    if (typeof img.s3Url === 'string' && img.s3Url.trim()) return img.s3Url.trim();
    if (Array.isArray(img.imageData)) {
      const first = img.imageData.find((d) => typeof d?.url === 'string' && d.url.trim());
      if (first?.url) return first.url.trim();
    }
    return '';
  };

  const getCoverKey = (img) => {
    if (!img) return '';
    if (typeof img.s3Key === 'string' && img.s3Key.trim()) return img.s3Key.trim();
    if (Array.isArray(img.imageData)) {
      const first = img.imageData.find((d) => typeof d?.s3Key === 'string' && d.s3Key.trim());
      if (first?.s3Key) return first.s3Key.trim();
    }
    return '';
  };

  const inferFileName = (value = '', fallback = 'asset') => {
    if (!value) return fallback;
    const clean = String(value).split('?')[0];
    const parts = clean.split('/');
    return decodeURIComponent(parts[parts.length - 1] || fallback);
  };

  const buildProxyDownloadUrl = (s3Key, fallbackName = 'asset') => {
    if (!s3Key) return '';
    return `${API_BASE_URL}/download?key=${encodeURIComponent(s3Key)}&filename=${encodeURIComponent(fallbackName)}`;
  };

  const getCoverDirectOrProxyUrl = (img) => {
    const coverKey = getCoverKey(img);
    if (coverKey) return buildProxyDownloadUrl(coverKey, inferFileName(coverKey, 'cover'));
    return getCoverDownloadUrl(img);
  };

  const getZipDirectOrProxyUrl = (img) => {
    const zipKey = getZipKey(img);
    if (zipKey) return buildProxyDownloadUrl(zipKey, inferFileName(zipKey, 'package.zip'));
    return getZipUrl(img);
  };

  const isZipRequiredCategory = (img) => {
    const top = resolveCategoryName(img?.category).trim().toLowerCase();
    return ['mockups', 'vector', 'psd', 'templates', 'icons', 'nft'].includes(top);
  };

  const isVideo = (img) => {
    const type = getFileType(img);
    return type.startsWith('video/');
  };

  const uploaderOptions = useMemo(() => {
    return Array.from(
      new Set(
        images
          .map((img) => getCreatorName(img.creatorId))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [images, creatorMap]);

  const categoryPathOptions = useMemo(() => {
    return Array.from(
      new Set(
        images
          .map((img) => getCategoryPath(img))
          .filter((path) => path && path !== '-')
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [images]);

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set(
        images
          .map((img) => resolveCategoryName(img?.category))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [images, categoryNameMap]);

  const statusCounts = useMemo(() => {
    const counts = { total: images.length, approved: 0, pending: 0, rejected: 0 };
    images.forEach((img) => {
      const status = getStatusLabel(img);
      if (status === 'Approved') counts.approved += 1;
      else if (status === 'Rejected') counts.rejected += 1;
      else counts.pending += 1;
    });
    return counts;
  }, [images]);

  const filteredImages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return images.filter((img) => {
      const status = getStatusLabel(img);
      const uploader = getCreatorName(img.creatorId);
      const type = getFileType(img);
      const category = resolveCategoryName(img?.category);
      const categoryPath = getCategoryPath(img);
      const title = getAssetDisplayName(img, img.name || img._id || '').toLowerCase();

      const matchesQuery = !q
        || title.includes(q)
        || uploader.toLowerCase().includes(q)
        || type.toLowerCase().includes(q)
        || category.toLowerCase().includes(q)
        || categoryPath.toLowerCase().includes(q)
        || status.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter;
      const matchesUploader = uploaderFilter === 'all' || uploader === uploaderFilter;
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      const matchesCategoryPath = categoryPathFilter === 'all' || categoryPath === categoryPathFilter;

      return matchesQuery && matchesStatus && matchesUploader && matchesCategory && matchesCategoryPath;
    });
  }, [images, query, statusFilter, uploaderFilter, categoryPathFilter, categoryFilter, creatorMap]);

  useEffect(() => {
    setPage(0);
  }, [query, statusFilter, uploaderFilter, categoryPathFilter, categoryFilter]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredImages.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [filteredImages.length, page, rowsPerPage]);

  const pagedImages = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredImages.slice(start, start + rowsPerPage);
  }, [filteredImages, page, rowsPerPage]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Images</Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="h6">{statusCounts.total}</Typography>
        </Paper>
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Approved</Typography>
          <Typography variant="h6" color="success.main">{statusCounts.approved}</Typography>
        </Paper>
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Pending</Typography>
          <Typography variant="h6">{statusCounts.pending}</Typography>
        </Paper>
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Rejected</Typography>
          <Typography variant="h6" color="warning.main">{statusCounts.rejected}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }, gap: 1.5 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, uploader, type or status"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Uploader"
            value={uploaderFilter}
            onChange={(e) => setUploaderFilter(e.target.value)}
          >
            <MenuItem value="all">All uploaders</MenuItem>
            {uploaderOptions.map((uploader) => (
              <MenuItem key={uploader} value={uploader}>{uploader}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="all">All categories</MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Category tree"
            value={categoryPathFilter}
            onChange={(e) => setCategoryPathFilter(e.target.value)}
          >
            <MenuItem value="all">All category trees</MenuItem>
            {categoryPathOptions.map((path) => (
              <MenuItem key={path} value={path}>{path}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Preview</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="center">ZIP</TableCell>
                <TableCell align="center">Download</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedImages.map((img) => (
                <TableRow key={img._id}>
                  <TableCell>
                    <Avatar variant="rounded" src={img.imageUrl || img.url || img.thumbnailUrl || ''} alt={getAssetDisplayName(img, 'Image')} />
                  </TableCell>
                  <TableCell>{getAssetDisplayName(img, img.name || img._id)}</TableCell>
                  <TableCell>{getCategoryPath(img)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color={isZipRequiredCategory(img) && !getZipUrl(img) ? 'error.main' : 'text.primary'}>
                      {isZipRequiredCategory(img)
                        ? `(${getFileType(img)}) (${getZipUrl(img) ? 'zip' : 'zip-missing'})`
                        : `(${getFileType(img)})`}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getZipUrl(img) ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        component="a"
                        href={getZipDirectOrProxyUrl(img)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        ZIP
                      </Button>
                    ) : (
                      <Typography variant="body2" color={isZipRequiredCategory(img) ? 'error.main' : 'text.secondary'}>
                        {isZipRequiredCategory(img) ? 'Required' : '-'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {getCoverDownloadUrl(img) ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        component="a"
                        href={getCoverDirectOrProxyUrl(img)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Cover
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusLabel(img)}
                      color={getStatusColor(img)}
                      variant={img.approved ? 'filled' : 'outlined'}
                    />
                    {img.rejected && img.rejectionReason ? ` (${img.rejectionReason})` : ''}
                  </TableCell>
                  <TableCell>
                    {getCreatorName(img.creatorId)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="info" onClick={() => openAssetDetails(img)} title="View details">
                      <Visibility />
                    </IconButton>
                    <IconButton color="success" onClick={() => handleApproveClick(img)} title="Approve"><CheckCircle /></IconButton>
                    <IconButton color="warning" onClick={() => handleRejectClick(img._id)} title="Reject"><Cancel /></IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(img)} title="Delete"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {pagedImages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No assets match the current filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredImages.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}

      {error && <Typography color="error" variant="body2">{error}</Typography>}

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Rejection Reason</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" disabled={!rejectReason.trim()}>Reject</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Approve/Delete Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>
          {confirmAction === 'delete' ? 'Confirm Delete Asset' : 'Confirm Approve Asset'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {confirmAction === 'delete'
              ? `Are you sure you want to delete "${confirmTarget?.title || 'this asset'}"? This action cannot be undone.`
              : `Approve "${confirmTarget?.title || 'this asset'}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmProceed}
            variant="contained"
            color={confirmAction === 'delete' ? 'error' : 'success'}
          >
            {confirmAction === 'delete' ? 'Delete' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Asset Details</DialogTitle>
        <DialogContent dividers>
          {viewTarget && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 2 }}>
              <Box>
                {isVideo(viewTarget) ? (
                  <video
                    src={viewTarget.imageUrl}
                    controls
                    style={{ width: '100%', borderRadius: 8, background: '#000' }}
                  />
                ) : (
                  <img
                    src={viewTarget.imageUrl}
                    alt={viewTarget.title || 'asset'}
                    style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                  />
                )}
              </Box>
              <Stack spacing={1.1}>
                <Typography variant="h6">{viewTarget.title || 'Untitled'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewTarget.description || 'No description'}
                </Typography>
                <Typography variant="body2"><strong>Uploader:</strong> {getCreatorName(viewTarget.creatorId)}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {getFileType(viewTarget)}</Typography>
                <Typography variant="body2"><strong>Quality:</strong> {getFileQuality(viewTarget)}</Typography>
                <Typography variant="body2"><strong>Size:</strong> {getFileSize(viewTarget)}</Typography>
                <Typography variant="body2">
                  <strong>Category:</strong>{' '}
                  {[
                    resolveCategoryName(viewTarget.category),
                    resolveCategoryName(viewTarget.subcategory),
                    resolveCategoryName(viewTarget.subsubcategory),
                  ]
                    .filter(Boolean)
                    .join(' / ') || '-'}
                </Typography>
                <Typography variant="body2"><strong>Plan:</strong> {viewTarget.freePremium || '-'}</Typography>
                <Typography variant="body2">
                  <strong>Cover file:</strong>{' '}
                  {getCoverDownloadUrl(viewTarget) ? (
                    <a href={getCoverDirectOrProxyUrl(viewTarget)} target="_blank" rel="noopener noreferrer" download>
                      Download cover
                    </a>
                  ) : (
                    '-'
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>ZIP package:</strong>{' '}
                  {getZipUrl(viewTarget) ? (
                    <a href={getZipDirectOrProxyUrl(viewTarget)} target="_blank" rel="noopener noreferrer" download>
                      Download ZIP
                    </a>
                  ) : isZipRequiredCategory(viewTarget) ? (
                    <span style={{ color: '#d32f2f' }}>Missing (required for this category)</span>
                  ) : (
                    '-'
                  )}
                </Typography>
                <Typography variant="body2"><strong>Approved:</strong> {viewTarget.approved ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2"><strong>Rejected:</strong> {viewTarget.rejected ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2">
                  <strong>Keywords:</strong> {Array.isArray(viewTarget.keywords) ? viewTarget.keywords.join(', ') || '-' : '-'}
                </Typography>
                <Typography variant="body2"><strong>Uploaded At:</strong> {viewTarget.createdAt ? new Date(viewTarget.createdAt).toLocaleString() : '-'}</Typography>
                <Typography variant="body2"><strong>Updated At:</strong> {viewTarget.updatedAt ? new Date(viewTarget.updatedAt).toLocaleString() : '-'}</Typography>
                <TextField
                  label="SEO Meta Tags HTML"
                  fullWidth
                  multiline
                  minRows={5}
                  value={seoMetaTagsHtml}
                  onChange={(e) => setSeoMetaTagsHtml(e.target.value)}
                  placeholder={'<meta name="robots" content="index, follow" />\n<meta name="author" content="HDPiks Team" />'}
                />
                <TextField
                  label="SEO Schema Script HTML"
                  fullWidth
                  multiline
                  minRows={8}
                  value={seoSchemaScriptHtml}
                  onChange={(e) => setSeoSchemaScriptHtml(e.target.value)}
                  placeholder={'<script type="application/ld+json">\n{\n  "@context": "https://schema.org"\n}\n</script>'}
                />
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveSeo} variant="contained" disabled={seoSaving || !viewTarget?._id}>
            {seoSaving ? 'Saving...' : 'Save SEO'}
          </Button>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

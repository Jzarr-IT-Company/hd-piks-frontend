import React, { Suspense, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import api from "../../Services/api";
import { API_ENDPOINTS } from "../../config/api.config";
import {
  DEFAULT_SUGGESTED_ICON_BG,
  DEFAULT_SUGGESTED_ICON_COLOR,
  DEFAULT_SUGGESTED_STYLE_ICON,
  getSuggestedStyleIcon,
  normalizeSuggestedStyleIcon,
  recommendSuggestedStyleIcon,
} from "../../utils/suggestedStyleIcons.js";

const SuggestedIconPicker = React.lazy(() => import("../components/SuggestedIconPicker.jsx"));

const buildCategoryTree = (categories = []) => {
  const map = {};
  const roots = [];

  categories.forEach((category) => {
    map[category._id] = { ...category, children: [] };
  });

  categories.forEach((category) => {
    const parentId = category.parent ? String(category.parent) : "";
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[category._id]);
    } else {
      roots.push(map[category._id]);
    }
  });

  return roots;
};

const colorPresets = [
  { color: "#7c3aed", bg: "#ede9fe", label: "Purple" },
  { color: "#ea580c", bg: "#ffedd5", label: "Orange" },
  { color: "#0891b2", bg: "#cffafe", label: "Cyan" },
  { color: "#db2777", bg: "#fce7f3", label: "Pink" },
  { color: "#16a34a", bg: "#dcfce7", label: "Green" },
  { color: "#2563eb", bg: "#dbeafe", label: "Blue" },
];

function IconPreview({ icon, color, bg }) {
  const Icon = getSuggestedStyleIcon(icon);
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: color || DEFAULT_SUGGESTED_ICON_COLOR,
        bgcolor: bg || DEFAULT_SUGGESTED_ICON_BG,
        flexShrink: 0,
      }}
    >
      <Icon size={20} />
    </Box>
  );
}

export default function SuggestedStyles() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [parentId, setParentId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [drafts, setDrafts] = useState({});

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN_CATEGORIES);
      setCategories(response.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const selectedParent = useMemo(
    () => tree.find((item) => String(item._id) === String(parentId)) || null,
    [parentId, tree]
  );
  const subcategoryOptions = selectedParent?.children || [];
  const selectedSubcategory = useMemo(
    () => subcategoryOptions.find((item) => String(item._id) === String(subcategoryId)) || null,
    [subcategoryId, subcategoryOptions]
  );
  const subSubcategories = selectedSubcategory?.children || [];

  useEffect(() => {
    setSubcategoryId("");
  }, [parentId]);

  useEffect(() => {
    const nextDrafts = {};
    subSubcategories.forEach((item, index) => {
      const recommendedIcon = recommendSuggestedStyleIcon(item.name, selectedParent?.name, selectedSubcategory?.name);
      nextDrafts[item._id] = {
        showInSuggestedStyles: Boolean(item.showInSuggestedStyles),
        suggestedOrder: item.suggestedOrder ?? index,
        suggestedIcon: normalizeSuggestedStyleIcon(
          item.suggestedIcon,
          item.name,
          selectedParent?.name,
          selectedSubcategory?.name
        ) || recommendedIcon,
        suggestedIconColor: item.suggestedIconColor || DEFAULT_SUGGESTED_ICON_COLOR,
        suggestedIconBg: item.suggestedIconBg || DEFAULT_SUGGESTED_ICON_BG,
      };
    });
    setDrafts(nextDrafts);
  }, [selectedParent?.name, selectedSubcategory?.name, subSubcategories]);

  const updateDraft = (id, patch) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] || {}),
        ...patch,
      },
    }));
  };

  const saveSubsubcategory = async (item) => {
    const draft = drafts[item._id];
    if (!draft) return;
    setSavingId(item._id);
    setError("");
    try {
      await api.patch(API_ENDPOINTS.ADMIN_CATEGORY(item._id), {
        showInSuggestedStyles: draft.showInSuggestedStyles,
        suggestedOrder: Number(draft.suggestedOrder) || 0,
        suggestedIcon: draft.suggestedIcon || DEFAULT_SUGGESTED_STYLE_ICON,
        suggestedIconColor: draft.suggestedIconColor || DEFAULT_SUGGESTED_ICON_COLOR,
        suggestedIconBg: draft.suggestedIconBg || DEFAULT_SUGGESTED_ICON_BG,
      });
      await fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save suggested style");
    } finally {
      setSavingId("");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Suggested Styles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose which sub-subcategories appear in Pick Suggested Styles and configure their icons.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={fetchCategories} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="suggested-parent-label">Parent category</InputLabel>
              <Select
                labelId="suggested-parent-label"
                label="Parent category"
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
              >
                <MenuItem value="">
                  <em>Select parent category</em>
                </MenuItem>
                {tree.map((parent) => (
                  <MenuItem key={parent._id} value={parent._id}>
                    {parent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" disabled={!parentId}>
              <InputLabel id="suggested-subcategory-label">Sub category</InputLabel>
              <Select
                labelId="suggested-subcategory-label"
                label="Sub category"
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
              >
                <MenuItem value="">
                  <em>Select sub category</em>
                </MenuItem>
                {subcategoryOptions.map((subcategory) => (
                  <MenuItem key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {!subcategoryId ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 2, borderStyle: "dashed" }}>
          <AutoAwesomeIcon color="primary" sx={{ mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700}>Select a parent and sub category</Typography>
          <Typography variant="body2" color="text.secondary">
            Sub-subcategories will appear here for suggested-style curation.
          </Typography>
        </Paper>
      ) : !subSubcategories.length ? (
        <Alert severity="info">No sub-subcategories exist under this sub category yet.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {subSubcategories.map((item) => {
            const draft = drafts[item._id] || {};
            return (
              <Paper key={item._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <IconPreview
                        icon={draft.suggestedIcon}
                        color={draft.suggestedIconColor}
                        bg={draft.suggestedIconBg}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={800} noWrap>
                          {item.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={draft.showInSuggestedStyles ? "Visible" : "Hidden"}
                          color={draft.showInSuggestedStyles ? "success" : "default"}
                          variant={draft.showInSuggestedStyles ? "filled" : "outlined"}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6} md={1.5}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Switch
                        checked={Boolean(draft.showInSuggestedStyles)}
                        onChange={(event) => updateDraft(item._id, { showInSuggestedStyles: event.target.checked })}
                      />
                      <Typography variant="body2">Show</Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Sort order"
                      value={draft.suggestedOrder ?? 0}
                      onChange={(event) => updateDraft(item._id, { suggestedOrder: event.target.value })}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Suspense fallback={<TextField fullWidth size="small" label="Search icon" value="Loading..." disabled />}>
                      <SuggestedIconPicker
                        value={draft.suggestedIcon}
                        context={`${selectedParent?.name || ""} ${selectedSubcategory?.name || ""} ${item.name || ""}`}
                        onChange={(nextIcon) => updateDraft(item._id, { suggestedIcon: nextIcon })}
                      />
                    </Suspense>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {colorPresets.map((preset) => (
                        <Button
                          key={preset.label}
                          size="small"
                          variant={draft.suggestedIconColor === preset.color ? "contained" : "outlined"}
                          onClick={() => updateDraft(item._id, {
                            suggestedIconColor: preset.color,
                            suggestedIconBg: preset.bg,
                          })}
                          sx={{ minWidth: 34, px: 0.8 }}
                          title={preset.label}
                        >
                          <Box sx={{ width: 16, height: 16, borderRadius: 999, bgcolor: preset.color }} />
                        </Button>
                      ))}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={1.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={savingId === item._id}
                      onClick={() => saveSubsubcategory(item)}
                    >
                      {savingId === item._id ? "Saving" : "Save"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

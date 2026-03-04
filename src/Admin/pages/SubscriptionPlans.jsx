import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import api from "../../Services/api";
import { API_ENDPOINTS } from "../../config/api.config";

const EMPTY_FORM = {
  planCode: "",
  name: "",
  badge: "",
  audienceTitle: "",
  summary: "",
  priceMonthlyUsd: "",
  creditsText: "",
  ctaText: "Choose Plan",
  sortOrder: 0,
  isHighlighted: false,
  isActive: true,
  featuresText: "",
  comparisonText: "",
};

const toErrorMessage = (error, fallback = "Request failed") => {
  const body = error?.response?.data;
  if (Array.isArray(body?.errors) && body.errors.length) return String(body.errors[0]);
  if (body?.message) return String(body.message);
  return fallback;
};

const parseLines = (rawText = "") =>
  String(rawText)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const parseComparisonLines = (rawText = "") => {
  const lines = parseLines(rawText);
  return lines
    .map((line, index) => {
      const parts = line.includes("|") ? line.split("|") : line.split(":");
      if (parts.length < 2) return null;
      const feature = String(parts[0] || "").trim();
      const value = String(parts.slice(1).join(line.includes("|") ? "|" : ":") || "").trim();
      if (!feature || !value) return null;
      return { feature, value, order: index };
    })
    .filter(Boolean);
};

const formatUsd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return `$${amount.toFixed(2)}`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const toMultilineComparison = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => `${item?.feature || ""} | ${item?.value || ""}`)
    .filter(Boolean)
    .join("\n");

const toMultilineFeatures = (features = []) =>
  (Array.isArray(features) ? features : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join("\n");

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const sortedPlans = useMemo(
    () =>
      [...plans].sort((a, b) => {
        const aOrder = Number(a?.sortOrder || 0);
        const bOrder = Number(b?.sortOrder || 0);
        if (aOrder !== bOrder) return aOrder - bOrder;
        return String(a?.name || "").localeCompare(String(b?.name || ""));
      }),
    [plans]
  );

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN_SUBSCRIPTION_PLANS);
      setPlans(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load subscription plans"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleOpenCreate = () => {
    setEditPlan(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      planCode: String(plan?.planCode || ""),
      name: String(plan?.name || ""),
      badge: String(plan?.badge || ""),
      audienceTitle: String(plan?.audienceTitle || ""),
      summary: String(plan?.summary || ""),
      priceMonthlyUsd: Number.isFinite(Number(plan?.priceMonthlyUsd))
        ? Number(plan.priceMonthlyUsd).toString()
        : "",
      creditsText: String(plan?.creditsText || ""),
      ctaText: String(plan?.ctaText || "Choose Plan"),
      sortOrder: Number.isFinite(Number(plan?.sortOrder)) ? Number(plan.sortOrder) : 0,
      isHighlighted: Boolean(plan?.isHighlighted),
      isActive: Boolean(plan?.isActive),
      featuresText: toMultilineFeatures(plan?.features),
      comparisonText: toMultilineComparison(plan?.comparisonItems),
    });
    setFormError("");
    setOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    setOpen(false);
    setEditPlan(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleSave = async () => {
    setFormError("");

    const planCode = String(form.planCode || "").trim().toLowerCase().replace(/\s+/g, "-");
    const name = String(form.name || "").trim();
    const priceMonthlyUsd = Number(form.priceMonthlyUsd);
    const sortOrder = Math.trunc(Number(form.sortOrder || 0));

    if (!planCode) {
      setFormError("planCode is required.");
      return;
    }
    if (!name) {
      setFormError("name is required.");
      return;
    }
    if (!Number.isFinite(priceMonthlyUsd) || priceMonthlyUsd < 0) {
      setFormError("priceMonthlyUsd must be zero or a positive number.");
      return;
    }

    const payload = {
      planCode,
      name,
      badge: String(form.badge || "").trim(),
      audienceTitle: String(form.audienceTitle || "").trim(),
      summary: String(form.summary || "").trim(),
      priceMonthlyUsd,
      creditsText: String(form.creditsText || "").trim(),
      ctaText: String(form.ctaText || "").trim() || "Choose Plan",
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isHighlighted: Boolean(form.isHighlighted),
      isActive: Boolean(form.isActive),
      features: parseLines(form.featuresText),
      comparisonItems: parseComparisonLines(form.comparisonText),
    };

    setSaving(true);
    try {
      if (editPlan?._id) {
        await api.patch(API_ENDPOINTS.ADMIN_SUBSCRIPTION_PLAN(editPlan._id), payload);
      } else {
        await api.post(API_ENDPOINTS.ADMIN_SUBSCRIPTION_PLANS, payload);
      }
      handleCloseDialog();
      await loadPlans();
    } catch (err) {
      setFormError(toErrorMessage(err, "Failed to save subscription plan"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!planId) return;
    if (!window.confirm("Delete this subscription plan?")) return;
    try {
      await api.delete(API_ENDPOINTS.ADMIN_SUBSCRIPTION_PLAN(planId));
      await loadPlans();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to delete subscription plan"));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4">Subscription Plans</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the plans and content shown on the public pricing page.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Add Plan
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlans.length ? (
                sortedPlans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {plan.name}
                        </Typography>
                        {plan.badge ? <Chip size="small" label={plan.badge} /> : null}
                        {plan.isHighlighted ? <Chip size="small" color="warning" label="Highlighted" /> : null}
                      </Stack>
                    </TableCell>
                    <TableCell>{plan.planCode || "-"}</TableCell>
                    <TableCell>{formatUsd(plan.priceMonthlyUsd)}</TableCell>
                    <TableCell>{Number(plan.sortOrder || 0)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={plan.isActive ? "Active" : "Inactive"}
                        color={plan.isActive ? "success" : "default"}
                        variant={plan.isActive ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(plan.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenEdit(plan)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(plan._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No subscription plans found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editPlan ? "Edit Subscription Plan" : "Add Subscription Plan"}</DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Plan code"
              fullWidth
              value={form.planCode}
              onChange={(event) => setForm((prev) => ({ ...prev, planCode: event.target.value }))}
              placeholder="essential"
              helperText="Unique key used by backend and frontend"
            />
            <TextField
              label="Plan name"
              fullWidth
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Essential"
            />
            <TextField
              label="Badge"
              fullWidth
              value={form.badge}
              onChange={(event) => setForm((prev) => ({ ...prev, badge: event.target.value }))}
              placeholder="Basic"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Audience title"
              fullWidth
              value={form.audienceTitle}
              onChange={(event) => setForm((prev) => ({ ...prev, audienceTitle: event.target.value }))}
              placeholder="Beginners and casual creators"
            />
            <TextField
              label="Credits text"
              fullWidth
              value={form.creditsText}
              onChange={(event) => setForm((prev) => ({ ...prev, creditsText: event.target.value }))}
              placeholder="1,000 credits / month"
            />
          </Stack>

          <TextField
            margin="dense"
            label="Summary"
            fullWidth
            value={form.summary}
            onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
            placeholder="For hobbyists"
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Monthly price (USD)"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={form.priceMonthlyUsd}
              onChange={(event) => setForm((prev) => ({ ...prev, priceMonthlyUsd: event.target.value }))}
              placeholder="10"
            />
            <TextField
              label="CTA text"
              fullWidth
              value={form.ctaText}
              onChange={(event) => setForm((prev) => ({ ...prev, ctaText: event.target.value }))}
              placeholder="Get Essential"
            />
            <TextField
              label="Sort order"
              fullWidth
              type="number"
              inputProps={{ step: 1 }}
              value={form.sortOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
              placeholder="1"
            />
          </Stack>

          <TextField
            sx={{ mt: 2 }}
            label="Features (one per line)"
            fullWidth
            multiline
            minRows={5}
            value={form.featuresText}
            onChange={(event) => setForm((prev) => ({ ...prev, featuresText: event.target.value }))}
            placeholder={"Access to all image models\nCommercial AI license"}
          />

          <TextField
            sx={{ mt: 2 }}
            label="Comparison rows (one per line: Feature | Value)"
            fullWidth
            multiline
            minRows={5}
            value={form.comparisonText}
            onChange={(event) => setForm((prev) => ({ ...prev, comparisonText: event.target.value }))}
            placeholder={"AI Images / Month | Limited\nStock Photos | Unlimited"}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.isHighlighted)}
                  onChange={(event) => setForm((prev) => ({ ...prev, isHighlighted: event.target.checked }))}
                />
              }
              label="Highlighted"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(form.isActive)}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>

          {formError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

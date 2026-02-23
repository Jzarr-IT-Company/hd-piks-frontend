import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Canvas as FabricCanvas, loadSVGFromString, loadSVGFromURL, util as fabricUtil } from "fabric";
import api from "../../Services/api.js";
import { API_ENDPOINTS } from "../../config/api.config.js";

const INITIAL_FORM = {
  title: "",
  slug: "",
  type: "svg",
  category: "",
  tags: "",
  baseUrl: "",
  baseKey: "",
  previewUrl: "",
  previewKey: "",
  thumbnailUrl: "",
  thumbnailKey: "",
  canvasWidth: "1080",
  canvasHeight: "1080",
  fabricJsonText: "",
  metaText: "",
  isActive: "true",
};

const toSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseTags = (value = "") =>
  String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const isSvgFile = (file) => {
  if (!file) return false;
  const mime = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  return mime.includes("svg") || name.endsWith(".svg");
};

const isPngFile = (file) => {
  if (!file) return false;
  const mime = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  return mime.includes("png") || name.endsWith(".png");
};

const toPrettyJson = (value) => {
  if (!value || typeof value !== "object") return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
};

const parseOptionalJson = (raw, label) => {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`${label} must be valid JSON`);
  }
};

const FONT_FAMILIES = [
  "Segoe UI",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Cormorant Garamond",
  "Cinzel",
  "Bodoni Moda",
  "Lora",
  "Merriweather",
  "Libre Baskerville",
  "EB Garamond",
  "Marcellus",
  "Prata",
  "Great Vibes",
  "Allura",
  "Alex Brush",
  "Parisienne",
  "Sacramento",
  "Dancing Script",
  "Satisfy",
  "Kaushan Script",
  "Pinyon Script",
];

const DEFAULT_TYPOGRAPHY_PRESETS = [
  {
    id: "heading",
    label: "Heading",
    values: {
      fontSize: 72,
      fontFamily: "Playfair Display",
      fontWeight: 700,
      fontStyle: "normal",
      textAlign: "center",
    },
  },
  {
    id: "subheading",
    label: "Subheading",
    values: {
      fontSize: 46,
      fontFamily: "Cormorant Garamond",
      fontWeight: 600,
      fontStyle: "normal",
      textAlign: "center",
    },
  },
  {
    id: "body",
    label: "Body",
    values: {
      fontSize: 30,
      fontFamily: "Lora",
      fontWeight: 400,
      fontStyle: "normal",
      textAlign: "left",
    },
  },
];

const buildInitialTypographyPreset = (index = 0) => {
  const fallback = DEFAULT_TYPOGRAPHY_PRESETS[index] || DEFAULT_TYPOGRAPHY_PRESETS[0];
  return {
    id: String(fallback?.id || `preset-${index + 1}`),
    label: String(fallback?.label || `Preset ${index + 1}`),
    values: {
      fontSize: Number(fallback?.values?.fontSize || 42),
      fontFamily: String(fallback?.values?.fontFamily || "Segoe UI"),
      fontWeight: Number(fallback?.values?.fontWeight || 700),
      fontStyle: String(fallback?.values?.fontStyle || "normal"),
      textAlign: String(fallback?.values?.textAlign || "left"),
    },
  };
};

const buildInitialEditableTextLayer = (index = 0) => ({
  id: `editable-text-${index + 1}`,
  name: `Text ${index + 1}`,
  text: `Text ${index + 1}`,
  xPct: 50,
  yPct: 50,
  widthPct: 35,
  fontSize: 42,
  fontFamily: "Playfair Display",
  fontWeight: 700,
  fontStyle: "normal",
  textAlign: "left",
  fill: "#111111",
  opacity: 100,
  angle: 0,
});

const toHexColor = (value, fallback = "#111111") => {
  const trimmed = String(value || "").trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
};

const normalizeEditableTextLayer = (rawLayer, index = 0) => {
  const layer = rawLayer && typeof rawLayer === "object" ? rawLayer : {};
  const fallback = buildInitialEditableTextLayer(index);
  const toNum = (value, fallbackValue) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallbackValue;
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const textAlignRaw = String(layer.textAlign || fallback.textAlign).toLowerCase();

  return {
    id: String(layer.id || fallback.id).trim() || fallback.id,
    name: String(layer.name || fallback.name).trim() || fallback.name,
    text: String(layer.text || fallback.text),
    xPct: clamp(toNum(layer.xPct ?? layer.x ?? fallback.xPct, fallback.xPct), 0, 100),
    yPct: clamp(toNum(layer.yPct ?? layer.y ?? fallback.yPct, fallback.yPct), 0, 100),
    widthPct: clamp(toNum(layer.widthPct ?? layer.wPct ?? fallback.widthPct, fallback.widthPct), 5, 100),
    fontSize: clamp(toNum(layer.fontSize ?? fallback.fontSize, fallback.fontSize), 6, 360),
    fontFamily: String(layer.fontFamily || fallback.fontFamily).trim() || fallback.fontFamily,
    fontWeight: clamp(toNum(layer.fontWeight ?? fallback.fontWeight, fallback.fontWeight), 100, 900),
    fontStyle: String(layer.fontStyle || fallback.fontStyle).toLowerCase() === "italic" ? "italic" : "normal",
    textAlign: ["left", "center", "right", "justify"].includes(textAlignRaw)
      ? textAlignRaw
      : fallback.textAlign,
    fill: toHexColor(layer.fill || layer.color || fallback.fill, fallback.fill),
    opacity: clamp(toNum(layer.opacity ?? fallback.opacity, fallback.opacity), 0, 100),
    angle: clamp(toNum(layer.angle ?? layer.rotate ?? fallback.angle, fallback.angle), -360, 360),
  };
};

const normalizeEditableTextLayers = (layers) => {
  if (!Array.isArray(layers)) return [];
  return layers.map((layer, index) => normalizeEditableTextLayer(layer, index));
};

const normalizeTypographyPreset = (rawPreset, index = 0) => {
  const fallback = buildInitialTypographyPreset(index);
  const preset = rawPreset && typeof rawPreset === "object" ? rawPreset : {};
  const values = preset.values && typeof preset.values === "object" ? preset.values : preset;
  const toNum = (value, fallbackValue) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallbackValue;
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const textAlignRaw = String(values.textAlign || fallback.values.textAlign).toLowerCase();

  return {
    id: String(preset.id || fallback.id).trim() || fallback.id,
    label: String(preset.label || preset.name || fallback.label).trim() || fallback.label,
    values: {
      fontSize: clamp(toNum(values.fontSize ?? fallback.values.fontSize, fallback.values.fontSize), 6, 360),
      fontFamily:
        String(values.fontFamily || fallback.values.fontFamily).trim() || fallback.values.fontFamily,
      fontWeight: clamp(
        toNum(values.fontWeight ?? fallback.values.fontWeight, fallback.values.fontWeight),
        100,
        900
      ),
      fontStyle:
        String(values.fontStyle || fallback.values.fontStyle).toLowerCase() === "italic"
          ? "italic"
          : "normal",
      textAlign: ["left", "center", "right", "justify"].includes(textAlignRaw)
        ? textAlignRaw
        : fallback.values.textAlign,
    },
  };
};

const normalizeTypographyPresets = (presets) => {
  if (!Array.isArray(presets)) return [];
  const seen = new Set();
  const normalized = [];
  presets.forEach((preset, index) => {
    const item = normalizeTypographyPreset(preset, index);
    if (!item?.id || seen.has(item.id)) return;
    seen.add(item.id);
    normalized.push(item);
  });
  return normalized;
};

const normalizeSvgLoaded = (loaded) => {
  const objects = Array.isArray(loaded) ? loaded[0] || [] : loaded?.objects || [];
  const options = Array.isArray(loaded) ? loaded[1] || {} : loaded?.options || {};
  return { objects, options };
};

const parseSvgFromRawText = async (svgUrl) => {
  const response = await fetch(svgUrl, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to download SVG (HTTP ${response.status})`);
  }
  const raw = await response.text();
  if (!raw || !/<svg[\s>]/i.test(raw)) {
    throw new Error("Base URL did not return a valid SVG document");
  }
  return loadSVGFromString(raw);
};

const markObjectEditableRecursive = (obj) => {
  if (!obj || typeof obj.set !== "function") return;

  obj.set({
    selectable: true,
    evented: true,
    lockMovementX: false,
    lockMovementY: false,
    lockScalingX: false,
    lockScalingY: false,
    lockRotation: false,
  });

  const objType = String(obj.type || "").toLowerCase();
  if (objType === "group") {
    obj.set({
      subTargetCheck: true,
      interactive: true,
    });

    const children = typeof obj.getObjects === "function" ? obj.getObjects() : [];
    children.forEach((child) => markObjectEditableRecursive(child));
  }
};

const flattenCanvasGroups = (canvas, markFn) => {
  if (!canvas || typeof canvas.getObjects !== "function") return 0;
  let flattened = 0;

  const flattenGroupFallback = (groupObj) => {
    if (!groupObj || typeof groupObj.getObjects !== "function") return false;
    const children = [...groupObj.getObjects()];
    if (!children.length) return false;

    const groupMatrix =
      typeof groupObj.calcTransformMatrix === "function" ? groupObj.calcTransformMatrix() : null;

    children.forEach((child) => {
      if (typeof groupObj.remove === "function") {
        groupObj.remove(child);
      }
      if (groupMatrix && typeof fabricUtil.addTransformToObject === "function") {
        fabricUtil.addTransformToObject(child, groupMatrix);
      }
      canvas.add(child);
      if (typeof markFn === "function") markFn(child);
    });

    if (typeof canvas.remove === "function") {
      canvas.remove(groupObj);
    }
    return true;
  };

  for (let pass = 0; pass < 30; pass += 1) {
    const groups = canvas
      .getObjects()
      .filter((obj) => String(obj?.type || "").toLowerCase() === "group");

    if (!groups.length) break;

    let flattenedThisPass = 0;
    groups.forEach((groupObj) => {
      let didFlatten = false;
      try {
        if (
          typeof groupObj.toActiveSelection === "function" &&
          typeof canvas.setActiveObject === "function"
        ) {
          canvas.setActiveObject(groupObj);
          const activeSelection = groupObj.toActiveSelection();
          if (activeSelection && typeof activeSelection.forEachObject === "function") {
            activeSelection.forEachObject((obj) => {
              if (typeof markFn === "function") markFn(obj);
            });
            didFlatten = true;
          }
        }
        if (!didFlatten) {
          didFlatten = flattenGroupFallback(groupObj);
        }
      } catch {
        didFlatten = flattenGroupFallback(groupObj);
      } finally {
        if (typeof canvas.discardActiveObject === "function") {
          canvas.discardActiveObject();
        }
      }
      if (didFlatten) {
        flattenedThisPass += 1;
      }
    });

    flattened += flattenedThisPass;
    if (!flattenedThisPass) break;
  }

  return flattened;
};

export default function TemplatesPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [editableTextLayers, setEditableTextLayers] = useState([]);
  const [editableTextLayersTouched, setEditableTextLayersTouched] = useState(false);
  const [typographyPresets, setTypographyPresets] = useState([]);
  const [typographyPresetsTouched, setTypographyPresetsTouched] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [uploadingField, setUploadingField] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingFabricJson, setGeneratingFabricJson] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const isEditing = Boolean(editingId);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setEditableTextLayers([]);
    setEditableTextLayersTouched(false);
    setTypographyPresets([]);
    setTypographyPresetsTouched(false);
    setSlugTouched(false);
    setEditingId("");
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoadingList(true);
      setError("");
      const response = await api.get(API_ENDPOINTS.ADMIN_TEMPLATES, {
        params: { page: 1, limit: 100, includeInactive: true },
      });
      setTemplates(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch templates");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    if (field === "slug") setSlugTouched(true);

    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !slugTouched && !isEditing) {
        next.slug = toSlug(value);
      }
      return next;
    });
  };

  const addEditableTextLayer = () => {
    setEditableTextLayersTouched(true);
    setEditableTextLayers((prev) => [...prev, buildInitialEditableTextLayer(prev.length)]);
  };

  const removeEditableTextLayer = (index) => {
    setEditableTextLayersTouched(true);
    setEditableTextLayers((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateEditableTextLayer = (index, patch) => {
    setEditableTextLayersTouched(true);
    setEditableTextLayers((prev) =>
      prev.map((layer, idx) =>
        idx === index ? normalizeEditableTextLayer({ ...layer, ...patch }, idx) : layer
      )
    );
  };

  const addTypographyPreset = () => {
    setTypographyPresetsTouched(true);
    setTypographyPresets((prev) => [...prev, buildInitialTypographyPreset(prev.length)]);
  };

  const removeTypographyPreset = (index) => {
    setTypographyPresetsTouched(true);
    setTypographyPresets((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateTypographyPreset = (index, patch) => {
    setTypographyPresetsTouched(true);
    setTypographyPresets((prev) =>
      prev.map((preset, idx) =>
        idx === index
          ? normalizeTypographyPreset(
              {
                ...preset,
                ...patch,
                values: {
                  ...(preset?.values || {}),
                  ...(patch?.values || {}),
                },
              },
              idx
            )
          : preset
      )
    );
  };

  const uploadTemplateFile = useCallback(
    async (field, file) => {
      if (!file) return;
      if (field === "baseUrl") {
        if (form.type === "svg" && !isSvgFile(file)) {
          setError("For SVG template, base file must be .svg");
          return;
        }
        if (form.type === "png" && !isPngFile(file)) {
          setError("For PNG template, base file must be .png");
          return;
        }
      }

      try {
        setError("");
        setNotice("");
        setUploadingField(field);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "hdpiks/templates");
        formData.append("fileName", file.name);
        formData.append("uploadField", field);
        formData.append("templateType", String(form.type || "").toLowerCase());

        const response = await api.post(API_ENDPOINTS.ADMIN_UPLOAD_TEMPLATE_ASSET, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            const total = Number(evt?.total || 0);
            const loaded = Number(evt?.loaded || 0);
            if (total > 0) {
              setUploadProgress(Math.round((loaded / total) * 100));
            }
          },
        });

        const uploaded = response?.data?.data || {};
        const uploadedUrl = String(uploaded.url || "").trim();
        const uploadedKey = String(uploaded.key || "").trim();

        if (!uploadedUrl) {
          throw new Error("Upload succeeded but URL missing in response");
        }

        const keyField =
          field === "baseUrl" ? "baseKey" : field === "previewUrl" ? "previewKey" : "thumbnailKey";

        setForm((prev) => {
          const next = { ...prev, [field]: uploadedUrl, [keyField]: uploadedKey };
          if (field === "baseUrl" && !prev.previewUrl) {
            next.previewUrl = uploadedUrl;
            next.previewKey = uploadedKey;
          }
          if (field === "previewUrl" && !prev.thumbnailUrl) {
            next.thumbnailUrl = uploadedUrl;
            next.thumbnailKey = uploadedKey;
          }
          return next;
        });

        setNotice(`${field} uploaded to S3.`);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Upload failed");
      } finally {
        setUploadingField("");
        setUploadProgress(0);
      }
    },
    [form.type]
  );

  const generateFabricJsonFromBaseSvg = useCallback(async () => {
    let fabricCanvas = null;
    try {
      const baseUrl = String(form.baseUrl || "").trim();
      if (!baseUrl) {
        throw new Error("Please upload/select Base SVG first.");
      }
      if (String(form.type || "").toLowerCase() !== "svg") {
        throw new Error("Fabric JSON generation is only for SVG templates.");
      }

      const width = Math.round(Number(form.canvasWidth));
      const height = Math.round(Number(form.canvasHeight));
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new Error("Canvas width and height must be valid before generating Fabric JSON.");
      }

      setGeneratingFabricJson(true);
      setError("");
      setNotice("");

      let loaded = await loadSVGFromURL(baseUrl);
      let { objects, options } = normalizeSvgLoaded(loaded);

      if (!objects.length) {
        loaded = await parseSvgFromRawText(baseUrl);
        ({ objects, options } = normalizeSvgLoaded(loaded));
      }

      if (!objects.length) {
        throw new Error("SVG has no drawable objects.");
      }

      const tempCanvasEl = document.createElement("canvas");
      tempCanvasEl.width = width;
      tempCanvasEl.height = height;

      fabricCanvas = new FabricCanvas(tempCanvasEl, {
        width,
        height,
        backgroundColor: "transparent",
      });

      const grouped = fabricUtil.groupSVGElements(objects, options);
      const targetW = width * 0.92;
      const targetH = height * 0.9;
      const scale = Math.min(
        targetW / Math.max(1, grouped.width || 1),
        targetH / Math.max(1, grouped.height || 1)
      );

      grouped.scale(scale);
      grouped.set({
        left: width / 2,
        top: height / 2,
        originX: "center",
        originY: "center",
        subTargetCheck: true,
        interactive: true,
        selectable: true,
        evented: true,
      });

      fabricCanvas.add(grouped);

      markObjectEditableRecursive(grouped);
      flattenCanvasGroups(fabricCanvas, markObjectEditableRecursive);
      fabricCanvas.getObjects().forEach((obj) => markObjectEditableRecursive(obj));

      fabricCanvas.requestRenderAll();

      const json = fabricCanvas.toJSON();
      json.width = width;
      json.height = height;
      const topLevelObjects = Array.isArray(json.objects) ? json.objects.length : 0;

      setForm((prev) => ({
        ...prev,
        fabricJsonText: JSON.stringify(json, null, 2),
      }));
      setNotice(`Fabric JSON generated from Base SVG (${topLevelObjects} top-level object(s)).`);
    } catch (err) {
      const message = String(err?.message || "Failed to generate Fabric JSON from SVG.");
      const maybeCors =
        /network|cors|fetch|failed to fetch|download svg|http\s*(403|404|500)/i.test(message);
      setError(
        maybeCors
          ? `${message} If SVG is on S3, ensure bucket CORS allows your frontend origin.`
          : message
      );
    } finally {
      setGeneratingFabricJson(false);
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    }
  }, [form.baseUrl, form.canvasHeight, form.canvasWidth, form.type]);

  const payloadFromForm = useMemo(() => {
    const width = Math.round(Number(form.canvasWidth));
    const height = Math.round(Number(form.canvasHeight));

    return {
      title: String(form.title || "").trim(),
      slug: toSlug(form.slug || form.title),
      type: String(form.type || "").trim().toLowerCase(),
      category: String(form.category || "").trim(),
      tags: parseTags(form.tags),
      baseUrl: String(form.baseUrl || "").trim(),
      baseKey: String(form.baseKey || "").trim() || null,
      previewUrl: String(form.previewUrl || "").trim() || null,
      previewKey: String(form.previewKey || "").trim() || null,
      thumbnailUrl: String(form.thumbnailUrl || "").trim() || null,
      thumbnailKey: String(form.thumbnailKey || "").trim() || null,
      canvas: { width, height },
      isActive: String(form.isActive) === "true",
    };
  }, [form]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setNotice("");

      if (!payloadFromForm.title || !payloadFromForm.slug || !payloadFromForm.category || !payloadFromForm.baseUrl) {
        throw new Error("title, slug, category and baseUrl are required");
      }
      if (!["svg", "png"].includes(payloadFromForm.type)) {
        throw new Error("type must be svg or png");
      }
      if (
        !Number.isFinite(payloadFromForm.canvas.width) ||
        !Number.isFinite(payloadFromForm.canvas.height) ||
        payloadFromForm.canvas.width <= 0 ||
        payloadFromForm.canvas.height <= 0
      ) {
        throw new Error("canvas width and height must be greater than 0");
      }

      const payload = { ...payloadFromForm };
      payload.fabricJson = parseOptionalJson(form.fabricJsonText, "fabricJson");
      const metaFromForm = parseOptionalJson(form.metaText, "meta") || {};
      const normalizedEditableTextLayers = normalizeEditableTextLayers(editableTextLayers);
      if (editableTextLayersTouched) {
        if (normalizedEditableTextLayers.length) {
          metaFromForm.editableTextLayers = normalizedEditableTextLayers;
        } else {
          delete metaFromForm.editableTextLayers;
        }
      }
      const normalizedTypographyPresets = normalizeTypographyPresets(typographyPresets);
      if (typographyPresetsTouched) {
        if (normalizedTypographyPresets.length) {
          metaFromForm.typographyPresets = normalizedTypographyPresets;
        } else {
          delete metaFromForm.typographyPresets;
        }
      }
      payload.meta = metaFromForm;

      if (isEditing) {
        await api.patch(API_ENDPOINTS.ADMIN_TEMPLATE(editingId), payload);
        setNotice("Template updated successfully.");
      } else {
        await api.post(API_ENDPOINTS.ADMIN_TEMPLATES, payload);
        setNotice("Template created successfully.");
      }

      resetForm();
      await fetchTemplates();
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (Array.isArray(backendErrors) && backendErrors.length) {
        setError(backendErrors.join(", "));
      } else {
        setError(err?.response?.data?.message || err?.message || "Failed to save template");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId) => {
    const ok = window.confirm("Delete this template?");
    if (!ok) return;

    try {
      setDeletingId(templateId);
      setError("");
      setNotice("");
      await api.delete(API_ENDPOINTS.ADMIN_TEMPLATE(templateId));
      setNotice("Template deleted.");
      if (editingId === templateId) resetForm();
      await fetchTemplates();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete template");
    } finally {
      setDeletingId("");
    }
  };

  const startEdit = (template) => {
    setEditingId(String(template?._id || ""));
    setSlugTouched(true);
    setForm({
      title: String(template?.title || ""),
      slug: String(template?.slug || ""),
      type: String(template?.type || "svg"),
      category: String(template?.category || ""),
      tags: Array.isArray(template?.tags) ? template.tags.join(", ") : "",
      baseUrl: String(template?.baseUrl || ""),
      baseKey: String(template?.baseKey || ""),
      previewUrl: String(template?.previewUrl || ""),
      previewKey: String(template?.previewKey || ""),
      thumbnailUrl: String(template?.thumbnailUrl || ""),
      thumbnailKey: String(template?.thumbnailKey || ""),
      canvasWidth: String(template?.canvas?.width || 1080),
      canvasHeight: String(template?.canvas?.height || 1080),
      fabricJsonText: toPrettyJson(template?.fabricJson),
      metaText: toPrettyJson(template?.meta),
      isActive: template?.isActive ? "true" : "false",
    });
    setEditableTextLayers(normalizeEditableTextLayers(template?.meta?.editableTextLayers));
    setEditableTextLayersTouched(false);
    setTypographyPresets(normalizeTypographyPresets(template?.meta?.typographyPresets));
    setTypographyPresetsTouched(false);
    setNotice(`Editing "${template?.title || "template"}"`);
    setError("");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Templates
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {isEditing ? "Edit Template" : "Create Template"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField label="Title" value={form.title} onChange={handleChange("title")} fullWidth required />
              <TextField label="Slug" value={form.slug} onChange={handleChange("slug")} fullWidth required />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                select
                SelectProps={{ native: true }}
                label="Type"
                value={form.type}
                onChange={handleChange("type")}
                fullWidth
                required
              >
                <option value="svg">svg</option>
                <option value="png">png</option>
              </TextField>
              <TextField
                label="Category"
                value={form.category}
                onChange={handleChange("category")}
                fullWidth
                required
              />
              <TextField
                label="Tags (comma separated)"
                value={form.tags}
                onChange={handleChange("tags")}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                label="Canvas Width"
                type="number"
                value={form.canvasWidth}
                onChange={handleChange("canvasWidth")}
                fullWidth
                required
              />
              <TextField
                label="Canvas Height"
                type="number"
                value={form.canvasHeight}
                onChange={handleChange("canvasHeight")}
                fullWidth
                required
              />
              <TextField
                select
                SelectProps={{ native: true }}
                label="Status"
                value={form.isActive}
                onChange={handleChange("isActive")}
                fullWidth
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </TextField>
            </Stack>

            <TextField label="Base URL" value={form.baseUrl} onChange={handleChange("baseUrl")} fullWidth required />
            <TextField label="Base S3 Key" value={form.baseKey} onChange={handleChange("baseKey")} fullWidth />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" component="label" disabled={uploadingField === "baseUrl"}>
                {uploadingField === "baseUrl" ? "Uploading base..." : "Upload Base File"}
                <input
                  hidden
                  type="file"
                  accept={form.type === "svg" ? ".svg,image/svg+xml" : ".png,image/png"}
                  onChange={(e) => {
                    uploadTemplateFile("baseUrl", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </Button>
            </Stack>

            <TextField
              label="Preview URL"
              value={form.previewUrl}
              onChange={handleChange("previewUrl")}
              fullWidth
            />
            <TextField label="Preview S3 Key" value={form.previewKey} onChange={handleChange("previewKey")} fullWidth />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" component="label" disabled={uploadingField === "previewUrl"}>
                {uploadingField === "previewUrl" ? "Uploading preview..." : "Upload Preview File"}
                <input
                  hidden
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    uploadTemplateFile("previewUrl", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </Button>
            </Stack>

            <TextField
              label="Thumbnail URL"
              value={form.thumbnailUrl}
              onChange={handleChange("thumbnailUrl")}
              fullWidth
            />
            <TextField
              label="Thumbnail S3 Key"
              value={form.thumbnailKey}
              onChange={handleChange("thumbnailKey")}
              fullWidth
            />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" component="label" disabled={uploadingField === "thumbnailUrl"}>
                {uploadingField === "thumbnailUrl" ? "Uploading thumbnail..." : "Upload Thumbnail File"}
                <input
                  hidden
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    uploadTemplateFile("thumbnailUrl", e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </Button>
            </Stack>

            {!!uploadingField && (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Uploading {uploadingField}...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {uploadProgress}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            <Stack direction="row" spacing={1}>
              <Button
                type="button"
                variant="outlined"
                disabled={generatingFabricJson || form.type !== "svg" || !String(form.baseUrl || "").trim()}
                onClick={generateFabricJsonFromBaseSvg}
              >
                {generatingFabricJson ? "Generating Fabric JSON..." : "Generate Fabric JSON from Base SVG"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                disabled={generatingFabricJson || !String(form.fabricJsonText || "").trim()}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    fabricJsonText: "",
                  }))
                }
              >
                Clear Fabric JSON
              </Button>
            </Stack>

            <TextField
              label="Fabric JSON (optional)"
              value={form.fabricJsonText}
              onChange={handleChange("fabricJsonText")}
              placeholder='{"version":"7.0.0","objects":[...]}'
              multiline
              minRows={6}
              fullWidth
              helperText="If provided, editor loads this Fabric JSON first. For pure SVG templates, this can be left blank."
            />

            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Editable Text Layers (optional)</Typography>
                <Button type="button" variant="outlined" size="small" onClick={addEditableTextLayer}>
                  Add Text Layer
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                Use this when SVG text is converted to paths. Editor will overlay real editable textboxes from these values.
              </Typography>
              {editableTextLayers.length ? (
                <Stack spacing={1.5}>
                  {editableTextLayers.map((layer, index) => (
                    <Box key={`${layer.id}-${index}`} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">Layer {index + 1}</Typography>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removeEditableTextLayer(index)}
                        >
                          Remove
                        </Button>
                      </Stack>
                      <Stack spacing={1}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            label="Layer ID"
                            value={layer.id}
                            onChange={(e) => updateEditableTextLayer(index, { id: e.target.value })}
                            fullWidth
                          />
                          <TextField
                            label="Layer Name"
                            value={layer.name}
                            onChange={(e) => updateEditableTextLayer(index, { name: e.target.value })}
                            fullWidth
                          />
                        </Stack>
                        <TextField
                          label="Default Text"
                          value={layer.text}
                          onChange={(e) => updateEditableTextLayer(index, { text: e.target.value })}
                          fullWidth
                        />
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            label="X (%)"
                            type="number"
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                            value={layer.xPct}
                            onChange={(e) => updateEditableTextLayer(index, { xPct: e.target.value })}
                            fullWidth
                          />
                          <TextField
                            label="Y (%)"
                            type="number"
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                            value={layer.yPct}
                            onChange={(e) => updateEditableTextLayer(index, { yPct: e.target.value })}
                            fullWidth
                          />
                          <TextField
                            label="Width (%)"
                            type="number"
                            inputProps={{ min: 5, max: 100, step: 0.1 }}
                            value={layer.widthPct}
                            onChange={(e) => updateEditableTextLayer(index, { widthPct: e.target.value })}
                            fullWidth
                          />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            label="Font Size"
                            type="number"
                            inputProps={{ min: 6, max: 360 }}
                            value={layer.fontSize}
                            onChange={(e) => updateEditableTextLayer(index, { fontSize: e.target.value })}
                            fullWidth
                          />
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            label="Font Family"
                            value={layer.fontFamily}
                            onChange={(e) => updateEditableTextLayer(index, { fontFamily: e.target.value })}
                            fullWidth
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option
                                key={font}
                                value={font}
                                style={{ fontFamily: `"${font}", "Segoe UI", sans-serif` }}
                              >
                                {font}
                              </option>
                            ))}
                          </TextField>
                          <TextField
                            label="Font Weight"
                            type="number"
                            inputProps={{ min: 100, max: 900, step: 100 }}
                            value={layer.fontWeight}
                            onChange={(e) => updateEditableTextLayer(index, { fontWeight: e.target.value })}
                            fullWidth
                          />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            label="Font Style"
                            value={layer.fontStyle}
                            onChange={(e) => updateEditableTextLayer(index, { fontStyle: e.target.value })}
                            fullWidth
                          >
                            <option value="normal">normal</option>
                            <option value="italic">italic</option>
                          </TextField>
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            label="Text Align"
                            value={layer.textAlign}
                            onChange={(e) => updateEditableTextLayer(index, { textAlign: e.target.value })}
                            fullWidth
                          >
                            <option value="left">left</option>
                            <option value="center">center</option>
                            <option value="right">right</option>
                            <option value="justify">justify</option>
                          </TextField>
                          <TextField
                            label="Opacity (%)"
                            type="number"
                            inputProps={{ min: 0, max: 100, step: 1 }}
                            value={layer.opacity}
                            onChange={(e) => updateEditableTextLayer(index, { opacity: e.target.value })}
                            fullWidth
                          />
                          <TextField
                            label="Rotate (deg)"
                            type="number"
                            inputProps={{ min: -360, max: 360, step: 1 }}
                            value={layer.angle}
                            onChange={(e) => updateEditableTextLayer(index, { angle: e.target.value })}
                            fullWidth
                          />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            label="Fill color"
                            type="color"
                            value={layer.fill}
                            onChange={(e) => updateEditableTextLayer(index, { fill: e.target.value })}
                            fullWidth
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No editable text layers added.
                </Typography>
              )}
            </Box>

            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Typography Presets (optional)</Typography>
                <Button type="button" variant="outlined" size="small" onClick={addTypographyPreset}>
                  Add Preset
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                These presets appear in Design Studio and can be applied with one click.
              </Typography>
              {typographyPresets.length ? (
                <Stack spacing={1.5}>
                  {typographyPresets.map((preset, index) => (
                    <Box key={`${preset.id}-${index}`} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2">Preset {index + 1}</Typography>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => removeTypographyPreset(index)}
                        >
                          Remove
                        </Button>
                      </Stack>
                      <Stack spacing={1}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            label="Preset ID"
                            value={preset.id}
                            onChange={(e) => updateTypographyPreset(index, { id: e.target.value })}
                            fullWidth
                          />
                          <TextField
                            label="Label"
                            value={preset.label}
                            onChange={(e) => updateTypographyPreset(index, { label: e.target.value })}
                            fullWidth
                          />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            label="Font Family"
                            value={preset.values?.fontFamily || "Segoe UI"}
                            onChange={(e) =>
                              updateTypographyPreset(index, {
                                values: { ...(preset.values || {}), fontFamily: e.target.value },
                              })
                            }
                            fullWidth
                          >
                            {FONT_FAMILIES.map((font) => (
                              <option key={font} value={font} style={{ fontFamily: `"${font}", "Segoe UI", sans-serif` }}>
                                {font}
                              </option>
                            ))}
                          </TextField>
                          <TextField
                            label="Font Size"
                            type="number"
                            inputProps={{ min: 6, max: 360, step: 1 }}
                            value={preset.values?.fontSize ?? 42}
                            onChange={(e) =>
                              updateTypographyPreset(index, {
                                values: { ...(preset.values || {}), fontSize: e.target.value },
                              })
                            }
                            fullWidth
                          />
                          <TextField
                            label="Font Weight"
                            type="number"
                            inputProps={{ min: 100, max: 900, step: 100 }}
                            value={preset.values?.fontWeight ?? 700}
                            onChange={(e) =>
                              updateTypographyPreset(index, {
                                values: { ...(preset.values || {}), fontWeight: e.target.value },
                              })
                            }
                            fullWidth
                          />
                        </Stack>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            label="Font Style"
                            value={preset.values?.fontStyle || "normal"}
                            onChange={(e) =>
                              updateTypographyPreset(index, {
                                values: { ...(preset.values || {}), fontStyle: e.target.value },
                              })
                            }
                            fullWidth
                          >
                            <option value="normal">normal</option>
                            <option value="italic">italic</option>
                          </TextField>
                          <TextField
                            select
                            SelectProps={{ native: true }}
                            label="Text Align"
                            value={preset.values?.textAlign || "left"}
                            onChange={(e) =>
                              updateTypographyPreset(index, {
                                values: { ...(preset.values || {}), textAlign: e.target.value },
                              })
                            }
                            fullWidth
                          >
                            <option value="left">left</option>
                            <option value="center">center</option>
                            <option value="right">right</option>
                            <option value="justify">justify</option>
                          </TextField>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No typography presets added.
                </Typography>
              )}
            </Box>

            <TextField
              label="Meta JSON (optional)"
              value={form.metaText}
              onChange={handleChange("metaText")}
              placeholder='{"brand":"MainHdPiks"}'
              multiline
              minRows={3}
              fullWidth
              helperText="Any extra metadata. If you edit sections above, meta.editableTextLayers and meta.typographyPresets are saved from those sections."
            />

            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Template" : "Create Template"}
              </Button>
              <Button type="button" variant="outlined" onClick={resetForm} disabled={saving}>
                {isEditing ? "Cancel Edit" : "Reset Form"}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {!!notice && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1.5 }}>
            {notice}
          </Typography>
        )}
        {!!error && (
          <Typography variant="body2" color="error.main" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Existing Templates
        </Typography>
        {loadingList ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Canvas</TableCell>
                  <TableCell>Fabric JSON</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.title || "-"}</TableCell>
                    <TableCell>{String(item.type || "").toUpperCase() || "-"}</TableCell>
                    <TableCell>{item.category || "-"}</TableCell>
                    <TableCell>{item.slug || "-"}</TableCell>
                    <TableCell>{`${item?.canvas?.width || 0}x${item?.canvas?.height || 0}`}</TableCell>
                    <TableCell>{item?.fabricJson ? "Yes" : "No"}</TableCell>
                    <TableCell>{item?.isActive ? "Yes" : "No"}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" variant="outlined" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={deletingId === item._id}
                          onClick={() => handleDelete(item._id)}
                        >
                          {deletingId === item._id ? "Deleting..." : "Delete"}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!templates.length && (
                  <TableRow>
                    <TableCell colSpan={8}>No templates found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

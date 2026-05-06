import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { FiHome, FiMaximize2, FiRotateCw } from "react-icons/fi";
import {
  Canvas as FabricCanvas,
  Circle as FabricCircle,
  Ellipse as FabricEllipse,
  Line as FabricLine,
  Polygon as FabricPolygon,
  Rect as FabricRect,
  Textbox as FabricTextbox,
  Triangle as FabricTriangle,
  loadSVGFromString,
  loadSVGFromURL,
  util as fabricUtil,
} from "fabric";
import api from "../Services/api";
import { buildCategoryTree, fetchCategories } from "../Services/category";
import { useTemplatesQuery } from "../query/templateQueries";
import AppFooter from "../Components/AppFooter/AppFooter";
import "./DesignHdpiks.css";

const FILTER_PRESETS = [
  { id: "none", label: "Original", values: {} },
  { id: "vivid", label: "Vivid", values: { brightness: 110, contrast: 115, saturation: 130 } },
  { id: "mono", label: "Mono", values: { saturation: 0, contrast: 110 } },
  { id: "warm", label: "Warm", values: { brightness: 104, saturation: 118, sepia: 22 } },
  { id: "cool", label: "Cool", values: { brightness: 98, saturation: 92, contrast: 108 } },
];

const EDIT_DEFAULTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  rotate: 0,
  zoom: 100,
  flipX: false,
  flipY: false,
  resizeWidth: "",
  resizeHeight: "",
  cropX: 0,
  cropY: 0,
  cropW: 100,
  cropH: 100,
};

const TEXT_DEFAULTS = {
  text: "New text",
  x: 50,
  y: 50,
  fontSize: 42,
  rotate: 0,
  fontFamily: "Segoe UI",
  fontStyle: "normal",
  color: "#ffffff",
  fontWeight: 700,
  textAlign: "center",
  opacity: 100,
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

const TOOL_ITEMS = [
  { id: "adjust", label: "Adjust", implemented: true, phase: 1 },
  { id: "transform", label: "Transform", implemented: true, phase: 1 },
  { id: "presets", label: "Presets", implemented: true, phase: 1 },
  { id: "text", label: "Text", implemented: true, phase: 2 },
  { id: "elements", label: "Elements", implemented: true, phase: 2 },
  { id: "templates", label: "Templates", implemented: true, phase: 2 },
  { id: "ai-bg-remove", label: "AI BG Remove", implemented: true, phase: 2 },
];

const FABRIC_EDITABLE_TEXT_CUSTOM_PROPS = [
  "elvifyEditableText",
  "elvifyEditableTextId",
  "elvifyEditableTextName",
  "elvifyTemplateObject",
  "elvifyTemplateTextObject",
  "elvifyUserShape",
  "elvifyShapeType",
];

const SHAPE_ITEMS = [
  { id: "rect", label: "Rectangle" },
  { id: "rounded-rect", label: "Rounded Rect" },
  { id: "circle", label: "Circle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "triangle", label: "Triangle" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
  { id: "star", label: "Star" },
  { id: "polygon", label: "Polygon" },
];

const CANVAS_VIEW_DEFAULTS = {
  workspaceBgColor: "#d1d5db",
  pageBgColor: "#ffffff",
  zoomPct: 100,
};

const CANVAS_VIEW_ZOOM_MIN = 25;
const CANVAS_VIEW_ZOOM_MAX = 300;
const CANVAS_VIEW_ZOOM_STEP = 10;
const PAGE_SIZE_OPTION_VALUES = [64, 128, 256, 512, 720, 800, 1080, 1200, 1440, 1600, 1920, 2048, 2560, 3000, 4000];

function DesignElvify() {
  const imageKitEndpoint = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "").trim();
  const [params] = useSearchParams();
  const sourceImageId = params.get("assetId");
  const originalAssetUrl = (params.get("assetUrl") || "").trim();
  const sourceCategoryId = params.get("category");
  const sourceSubCategoryId = params.get("subcategory");
  const sourceSubSubCategoryId = params.get("subsubcategory");
  const imageRef = useRef(null);
  const canvasShellRef = useRef(null);
  const canvasPageRef = useRef(null);
  const fabricInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const [fabricCanvasNode, setFabricCanvasNode] = useState(null);
  const [fabricReady, setFabricReady] = useState(false);
  const [categoryTree, setCategoryTree] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(sourceCategoryId || "");
  const [selectedSubCategory, setSelectedSubCategory] = useState(sourceSubCategoryId || "");
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(sourceSubSubCategoryId || "");

  const [activeTool, setActiveTool] = useState("adjust");
  const [showOriginal, setShowOriginal] = useState(false);
  const [editValues, setEditValues] = useState(EDIT_DEFAULTS);
  const [exportFormat, setExportFormat] = useState("image/png");
  const [exportQuality, setExportQuality] = useState(92);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [rollingBackVersionId, setRollingBackVersionId] = useState(null);
  const [notice, setNotice] = useState("");
  const [source, setSource] = useState(() => originalAssetUrl);
  const [sourceInput, setSourceInput] = useState(() => originalAssetUrl);
  const [localFileName, setLocalFileName] = useState("");
  const [editHistory, setEditHistory] = useState([]);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [retryKeyByUrl, setRetryKeyByUrl] = useState({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [textLayers, setTextLayers] = useState([]);
  const [selectedTextLayerId, setSelectedTextLayerId] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyIndexRef = useRef(-1);
  const [fabricHistoryMeta, setFabricHistoryMeta] = useState({ index: -1, length: 0 });
  const fabricHistoryStackRef = useRef([]);
  const fabricHistoryIndexRef = useRef(-1);
  const fabricHistorySuspendRef = useRef(false);
  const fabricHistoryTimerRef = useRef(null);
  const dragStateRef = useRef(null);
  const cropDragStateRef = useRef(null);
  const latestLayersRef = useRef([]);
  const [cropAspectMode, setCropAspectMode] = useState("free");
  const [aiBgLoading, setAiBgLoading] = useState(false);
  const [aiBgEnabled, setAiBgEnabled] = useState(false);
  const [aiBgReplace, setAiBgReplace] = useState(false);
  const [aiBgColor, setAiBgColor] = useState("#ffffff");
  const [aiBgPreviewUrl, setAiBgPreviewUrl] = useState("");
  const [templateSearchInput, setTemplateSearchInput] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState("all");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const [useFabricEditor, setUseFabricEditor] = useState(false);
  const [pendingSvgTemplateUrl, setPendingSvgTemplateUrl] = useState("");
  const [pendingSvgTemplateMeta, setPendingSvgTemplateMeta] = useState(null);
  const [pendingFabricTemplate, setPendingFabricTemplate] = useState(null);
  const [activeTemplateMeta, setActiveTemplateMeta] = useState(null);
  const [activeTemplateCanvasSize, setActiveTemplateCanvasSize] = useState(null);
  const [canvasPageSizeOverride, setCanvasPageSizeOverride] = useState(null);
  const [fabricSelectionState, setFabricSelectionState] = useState(null);
  const [fabricEditableTextItems, setFabricEditableTextItems] = useState([]);
  const [pendingShapeType, setPendingShapeType] = useState("");
  const [workspaceBgColor, setWorkspaceBgColor] = useState(CANVAS_VIEW_DEFAULTS.workspaceBgColor);
  const [pageBgColor, setPageBgColor] = useState(CANVAS_VIEW_DEFAULTS.pageBgColor);
  const [canvasViewZoom, setCanvasViewZoom] = useState(CANVAS_VIEW_DEFAULTS.zoomPct);
  const [previewImageSize, setPreviewImageSize] = useState({ width: 0, height: 0 });
  const [canvasShellSize, setCanvasShellSize] = useState({ width: 0, height: 0 });
  const activeToolConfig = useMemo(
    () => TOOL_ITEMS.find((tool) => tool.id === activeTool),
    [activeTool]
  );
  const selectedTextLayer = useMemo(
    () => textLayers.find((layer) => layer.id === selectedTextLayerId) || null,
    [textLayers, selectedTextLayerId]
  );
  const canUndo = useMemo(
    () =>
      useFabricEditor
        ? fabricHistoryMeta.index > 0
        : historyIndex > 0,
    [useFabricEditor, fabricHistoryMeta.index, historyIndex]
  );
  const canRedo = useMemo(
    () =>
      useFabricEditor
        ? fabricHistoryMeta.index >= 0 && fabricHistoryMeta.index < fabricHistoryMeta.length - 1
        : historyIndex >= 0 && historyIndex < historyStack.length - 1,
    [useFabricEditor, fabricHistoryMeta.index, fabricHistoryMeta.length, historyIndex, historyStack.length]
  );
  const fabricFontFamilies = useMemo(() => {
    const current = String(fabricSelectionState?.fontFamily || "").trim();
    if (!current) return FONT_FAMILIES;
    return FONT_FAMILIES.includes(current) ? FONT_FAMILIES : [current, ...FONT_FAMILIES];
  }, [fabricSelectionState?.fontFamily]);
  const typographyPresets = useMemo(() => {
    const presetsFromMeta = normalizeTypographyPresets(
      activeTemplateMeta?.typographyPresets || activeTemplateMeta?.editor?.typographyPresets
    );
    return presetsFromMeta.length
      ? presetsFromMeta
      : normalizeTypographyPresets(DEFAULT_TYPOGRAPHY_PRESETS);
  }, [activeTemplateMeta]);
  const pageCoordinateSize = useMemo(() => {
    const overrideWidth = Number(canvasPageSizeOverride?.width || 0);
    const overrideHeight = Number(canvasPageSizeOverride?.height || 0);
    if (overrideWidth > 0 && overrideHeight > 0) {
      return { width: overrideWidth, height: overrideHeight };
    }

    const templateWidth = Number(activeTemplateCanvasSize?.width || 0);
    const templateHeight = Number(activeTemplateCanvasSize?.height || 0);
    if (templateWidth > 0 && templateHeight > 0) {
      return { width: templateWidth, height: templateHeight };
    }

    const imageWidth = Number(previewImageSize?.width || 0);
    const imageHeight = Number(previewImageSize?.height || 0);
    if (imageWidth > 0 && imageHeight > 0) {
      return { width: imageWidth, height: imageHeight };
    }

    return { width: 1080, height: 1080 };
  }, [canvasPageSizeOverride, activeTemplateCanvasSize, previewImageSize]);
  const canvasPagePixelSize = useMemo(() => {
    const shellWidth = Math.max(240, Number(canvasShellSize?.width || 0));
    const shellHeight = Math.max(240, Number(canvasShellSize?.height || 0));
    const pageWidth = Math.max(1, Number(pageCoordinateSize?.width || 1));
    const pageHeight = Math.max(1, Number(pageCoordinateSize?.height || 1));
    const ratio = pageWidth / pageHeight;

    const padding = 36;
    const availableWidth = Math.max(120, shellWidth - padding * 2);
    const availableHeight = Math.max(120, shellHeight - padding * 2);

    let baseWidth = availableWidth;
    let baseHeight = baseWidth / ratio;
    if (baseHeight > availableHeight) {
      baseHeight = availableHeight;
      baseWidth = baseHeight * ratio;
    }

    const zoomFactor = clamp(canvasViewZoom, CANVAS_VIEW_ZOOM_MIN, CANVAS_VIEW_ZOOM_MAX) / 100;
    return {
      width: Math.max(80, Math.round(baseWidth * zoomFactor)),
      height: Math.max(80, Math.round(baseHeight * zoomFactor)),
      baseWidth: Math.max(80, Math.round(baseWidth)),
      baseHeight: Math.max(80, Math.round(baseHeight)),
    };
  }, [canvasShellSize, pageCoordinateSize, canvasViewZoom]);
  const pageSizeDropdownOptions = useMemo(() => {
    const width = Math.max(64, Math.round(Number(pageCoordinateSize?.width || 1080)));
    const height = Math.max(64, Math.round(Number(pageCoordinateSize?.height || 1080)));
    const merged = [...PAGE_SIZE_OPTION_VALUES];
    if (!merged.includes(width)) merged.push(width);
    if (!merged.includes(height)) merged.push(height);
    return Array.from(new Set(merged)).sort((a, b) => a - b);
  }, [pageCoordinateSize]);
  const templatesQueryEnabled = activeTool === "templates";
  const templatesQuery = useTemplatesQuery(
    {
      search: templateSearch,
      category: templateCategoryFilter || undefined,
      type: templateTypeFilter,
      page: 1,
      limit: 60,
    },
    templatesQueryEnabled
  );
  const templateItems = templatesQuery.data?.items || [];
  const templateCategories = useMemo(() => {
    const unique = new Set(
      templateItems.map((item) => String(item?.category || "").trim()).filter(Boolean)
    );
    return [...unique];
  }, [templateItems]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cats = await fetchCategories();
      if (!mounted) return;
      const hasTree = Array.isArray(cats) && cats.some((c) => Array.isArray(c?.children));
      setCategoryTree(hasTree ? cats : buildCategoryTree(cats));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplateSearch(templateSearchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [templateSearchInput]);

  useEffect(() => {
    if (!templateCategoryFilter) return;
    if (!templateCategories.includes(templateCategoryFilter)) {
      setTemplateCategoryFilter("");
    }
  }, [templateCategories, templateCategoryFilter]);

  useEffect(() => {
    return () => {
      if (fabricHistoryTimerRef.current) {
        clearTimeout(fabricHistoryTimerRef.current);
        fabricHistoryTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const shell = canvasShellRef.current;
    if (!shell) return undefined;

    const updateShellSize = () => {
      const rect = shell.getBoundingClientRect();
      setCanvasShellSize({
        width: Math.round(Number(rect?.width || 0)),
        height: Math.round(Number(rect?.height || 0)),
      });
    };

    updateShellSize();

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateShellSize);
      observer.observe(shell);
    }
    window.addEventListener("resize", updateShellSize);

    return () => {
      window.removeEventListener("resize", updateShellSize);
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const shell = canvasShellRef.current;
    if (!shell) return undefined;

    const handleWheelZoom = (event) => {
      if (!shell.contains(event.target)) return;
      const activeTag = String(event?.target?.tagName || "").toUpperCase();
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      const fineStep = Math.max(2, Math.round(CANVAS_VIEW_ZOOM_STEP / 2));
      const step = event.ctrlKey || event.metaKey ? fineStep : CANVAS_VIEW_ZOOM_STEP;
      setCanvasViewZoom((prev) =>
        clamp(prev + direction * step, CANVAS_VIEW_ZOOM_MIN, CANVAS_VIEW_ZOOM_MAX)
      );
    };

    shell.addEventListener("wheel", handleWheelZoom, { passive: false });
    return () => {
      shell.removeEventListener("wheel", handleWheelZoom);
    };
  }, []);

  useEffect(() => {
    if (!useFabricEditor || !fabricCanvasNode) return undefined;
    if (fabricInstanceRef.current) return undefined;

    const canvas = new FabricCanvas(fabricCanvasNode, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: pageBgColor,
    });
    fabricInstanceRef.current = canvas;
    setFabricReady(true);

    const resizeCanvas = () => {
      const pageEl = canvasPageRef.current;
      if (!pageEl || !fabricInstanceRef.current) return;
      const rect = pageEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      fabricInstanceRef.current.setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
      fabricInstanceRef.current.requestRenderAll();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [useFabricEditor, fabricCanvasNode, pageBgColor]);

  useEffect(() => {
    if (!useFabricEditor || !fabricReady || !fabricInstanceRef.current) return;
    const canvas = fabricInstanceRef.current;
    const pageEl = canvasPageRef.current;
    if (!pageEl) return;
    const rect = pageEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    canvas.setDimensions({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
    fitFabricViewportToPage(canvas, {
      pageWidth: Number(pageCoordinateSize?.width || 0),
      pageHeight: Number(pageCoordinateSize?.height || 0),
    });
    canvas.requestRenderAll();
  }, [
    useFabricEditor,
    fabricReady,
    pageCoordinateSize,
    canvasPagePixelSize.width,
    canvasPagePixelSize.height,
  ]);

  useEffect(() => {
    if (useFabricEditor) return;
    if (fabricInstanceRef.current) {
      fabricInstanceRef.current.dispose();
      fabricInstanceRef.current = null;
    }
    if (fabricHistoryTimerRef.current) {
      clearTimeout(fabricHistoryTimerRef.current);
      fabricHistoryTimerRef.current = null;
    }
    fabricHistorySuspendRef.current = false;
    clearFabricHistory();
    setFabricReady(false);
    setFabricSelectionState(null);
    setFabricEditableTextItems([]);
  }, [useFabricEditor]);

  useEffect(() => {
    if (!useFabricEditor || !fabricReady || !fabricInstanceRef.current) return;
    const canvas = fabricInstanceRef.current;
    canvas.backgroundColor = pageBgColor;
    canvas.requestRenderAll();
  }, [useFabricEditor, fabricReady, pageBgColor]);

  useEffect(() => {
    if (!useFabricEditor || !fabricReady || !fabricInstanceRef.current) {
      setFabricSelectionState(null);
      setFabricEditableTextItems([]);
      return undefined;
    }

    const canvas = fabricInstanceRef.current;
    const syncCanvasUi = () => {
      setFabricSelectionState(getFabricSelectionState(canvas));
      setFabricEditableTextItems(getFabricEditableTextItems(canvas));
    };

    syncCanvasUi();
    canvas.on("selection:created", syncCanvasUi);
    canvas.on("selection:updated", syncCanvasUi);
    canvas.on("selection:cleared", syncCanvasUi);
    canvas.on("object:modified", syncCanvasUi);
    canvas.on("object:added", syncCanvasUi);
    canvas.on("object:removed", syncCanvasUi);
    canvas.on("text:changed", syncCanvasUi);

    return () => {
      canvas.off("selection:created", syncCanvasUi);
      canvas.off("selection:updated", syncCanvasUi);
      canvas.off("selection:cleared", syncCanvasUi);
      canvas.off("object:modified", syncCanvasUi);
      canvas.off("object:added", syncCanvasUi);
      canvas.off("object:removed", syncCanvasUi);
      canvas.off("text:changed", syncCanvasUi);
    };
  }, [useFabricEditor, fabricReady]);

  useEffect(() => {
    if (!useFabricEditor || !fabricReady || !fabricInstanceRef.current) return undefined;
    const canvas = fabricInstanceRef.current;

    if (!fabricHistoryStackRef.current.length) {
      resetFabricHistoryWithCurrentCanvas(canvas);
    } else {
      syncFabricHistoryMeta(fabricHistoryIndexRef.current, fabricHistoryStackRef.current.length);
    }

    const scheduleHistorySnapshot = () => {
      if (fabricHistorySuspendRef.current) return;
      if (fabricHistoryTimerRef.current) {
        clearTimeout(fabricHistoryTimerRef.current);
      }
      fabricHistoryTimerRef.current = setTimeout(() => {
        pushFabricHistorySnapshot(canvas);
      }, 120);
    };

    canvas.on("object:added", scheduleHistorySnapshot);
    canvas.on("object:removed", scheduleHistorySnapshot);
    canvas.on("object:modified", scheduleHistorySnapshot);
    canvas.on("text:changed", scheduleHistorySnapshot);
    canvas.on("path:created", scheduleHistorySnapshot);

    return () => {
      canvas.off("object:added", scheduleHistorySnapshot);
      canvas.off("object:removed", scheduleHistorySnapshot);
      canvas.off("object:modified", scheduleHistorySnapshot);
      canvas.off("text:changed", scheduleHistorySnapshot);
      canvas.off("path:created", scheduleHistorySnapshot);
      if (fabricHistoryTimerRef.current) {
        clearTimeout(fabricHistoryTimerRef.current);
        fabricHistoryTimerRef.current = null;
      }
    };
  }, [useFabricEditor, fabricReady]);

  useEffect(() => {
    if (!useFabricEditor || !fabricReady || !pendingFabricTemplate || !fabricInstanceRef.current) return;
    let isCancelled = false;
    const fallbackSvgUrl = looksLikeSvgUrl(source) ? String(source).trim() : "";

    const loadFabricTemplate = async () => {
      let canvas = null;
      let loadedSuccessfully = false;
      try {
        canvas = fabricInstanceRef.current;
        if (!canvas) return;
        fabricHistorySuspendRef.current = true;
        canvas.clear();
        canvas.backgroundColor = pageBgColor;
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

        const nextJson =
          typeof pendingFabricTemplate.fabricJson === "string"
            ? JSON.parse(pendingFabricTemplate.fabricJson)
            : pendingFabricTemplate.fabricJson;

        if (!nextJson || typeof nextJson !== "object") {
          throw new Error("Template fabricJson is empty or invalid.");
        }

        await canvas.loadFromJSON(nextJson);
        if (isCancelled) return;
        normalizeLoadedFabricObjects(canvas);
        tagLoadedTemplateObjects(canvas);
        const loadedObjectCount =
          typeof canvas.getObjects === "function" ? canvas.getObjects().length : 0;
        if (!loadedObjectCount) {
          throw new Error("Template fabricJson loaded with 0 drawable objects.");
        }
        const referenceWidth =
          Number(nextJson?.width || 0) ||
          Number(pendingFabricTemplate?.canvas?.width || 0) ||
          Number(canvas.getWidth() || 0);
        const referenceHeight =
          Number(nextJson?.height || 0) ||
          Number(pendingFabricTemplate?.canvas?.height || 0) ||
          Number(canvas.getHeight() || 0);
        const injectedEditableTextCount = addEditableTextLayersToFabricCanvas(
          canvas,
          pendingFabricTemplate?.meta?.editableTextLayers,
          {
            referenceWidth,
            referenceHeight,
          }
        );
        fitFabricViewportToPage(canvas, {
          pageWidth: referenceWidth,
          pageHeight: referenceHeight,
        });
        setActiveTemplateCanvasSize({ width: referenceWidth, height: referenceHeight });

        canvas.requestRenderAll();
        ensureFabricCanvasFontsLoaded(canvas);
        loadedSuccessfully = true;
        setNotice(
          injectedEditableTextCount > 0
            ? `Template "${pendingFabricTemplate.title || "Untitled template"}" loaded from fabricJson (${loadedObjectCount} object(s), ${injectedEditableTextCount} editable text layer(s)).`
            : `Template "${pendingFabricTemplate.title || "Untitled template"}" loaded from fabricJson (${loadedObjectCount} object(s)).`
        );
      } catch (err) {
        if (isCancelled) return;
        if (fallbackSvgUrl) {
          setPendingSvgTemplateUrl(fallbackSvgUrl);
          setPendingSvgTemplateMeta({
            title: pendingFabricTemplate?.title || "Untitled template",
            meta: parseTemplateMeta(pendingFabricTemplate?.meta),
            canvas: parseTemplateCanvasSize(pendingFabricTemplate?.canvas),
          });
          setNotice(
            err?.message
              ? `Failed to load template fabricJson: ${err.message}. Falling back to SVG URL...`
              : "Failed to load template fabricJson. Falling back to SVG URL..."
          );
        } else {
          setNotice(
            err?.message
              ? `Failed to load template fabricJson: ${err.message}`
              : "Failed to load template fabricJson."
          );
        }
      } finally {
        fabricHistorySuspendRef.current = false;
        if (!isCancelled && loadedSuccessfully && canvas) {
          resetFabricHistoryWithCurrentCanvas(canvas);
        }
        if (!isCancelled) setPendingFabricTemplate(null);
      }
    };

    loadFabricTemplate();
    return () => {
      isCancelled = true;
    };
  }, [useFabricEditor, fabricReady, pendingFabricTemplate, source]);

  useEffect(() => {
    if (!useFabricEditor || !fabricReady || !pendingSvgTemplateUrl || !fabricInstanceRef.current) return;
    let isCancelled = false;

    const normalizeSvgLoaded = (loaded) => {
      const objects = Array.isArray(loaded) ? loaded[0] : loaded?.objects || [];
      const options = Array.isArray(loaded) ? loaded[1] || {} : loaded?.options || {};
      return { objects, options };
    };

    const parseSvgFromRawText = async (svgUrl) => {
      const response = await fetch(svgUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while downloading SVG`);
      }
      const contentType = String(response.headers.get("content-type") || "").toLowerCase();
      const raw = await response.text();
      if (contentType && !contentType.includes("svg") && raw.startsWith("\uFFFDPNG")) {
        throw new Error(`URL returned PNG content (${contentType || "unknown"})`);
      }
      if (!raw || !/<svg[\s>]/i.test(raw)) {
        throw new Error(`Downloaded file is not a valid SVG document (${contentType || "unknown"})`);
      }
      return loadSVGFromString(raw);
    };

    const loadSvgTemplate = async () => {
      let canvas = null;
      let loadedSuccessfully = false;
      try {
        canvas = fabricInstanceRef.current;
        if (!canvas) return;
        fabricHistorySuspendRef.current = true;
        let loaded = await loadSVGFromURL(pendingSvgTemplateUrl);
        if (isCancelled) return;

        let { objects, options } = normalizeSvgLoaded(loaded);
        if (!objects.length) {
          loaded = await parseSvgFromRawText(pendingSvgTemplateUrl);
          if (isCancelled) return;
          ({ objects, options } = normalizeSvgLoaded(loaded));
        }

        if (!objects.length) {
          setNotice(
            "Template SVG loaded but has no drawable objects. Make sure baseUrl is a real SVG with visible shapes/text."
          );
          return;
        }

        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        canvas.clear();
        canvas.backgroundColor = pageBgColor;
        const grouped = fabricUtil.groupSVGElements(objects, options);
        const referenceWidth =
          Number(pendingSvgTemplateMeta?.canvas?.width || 0) ||
          Math.max(1, Number(grouped?.width || 0));
        const referenceHeight =
          Number(pendingSvgTemplateMeta?.canvas?.height || 0) ||
          Math.max(1, Number(grouped?.height || 0));
        const targetW = Math.max(1, referenceWidth);
        const targetH = Math.max(1, referenceHeight);
        const scale = Math.min(
          targetW / Math.max(1, grouped.width || 1),
          targetH / Math.max(1, grouped.height || 1)
        );
        grouped.scale(scale);
        grouped.set({
          left: targetW / 2,
          top: targetH / 2,
          originX: "center",
          originY: "center",
          selectable: true,
          evented: true,
        });
        canvas.add(grouped);
        markCanvasObjectEditableRecursive(grouped);
        normalizeLoadedFabricObjects(canvas);
        tagLoadedTemplateObjects(canvas);
        const injectedEditableTextCount = addEditableTextLayersToFabricCanvas(
          canvas,
          pendingSvgTemplateMeta?.meta?.editableTextLayers,
          {
            referenceWidth,
            referenceHeight,
          }
        );
        fitFabricViewportToPage(canvas, {
          pageWidth: referenceWidth,
          pageHeight: referenceHeight,
        });
        setActiveTemplateCanvasSize({ width: referenceWidth, height: referenceHeight });
        canvas.requestRenderAll();
        ensureFabricCanvasFontsLoaded(canvas);
        loadedSuccessfully = true;
        setNotice(
          injectedEditableTextCount > 0
            ? `SVG template loaded in Fabric mode (${injectedEditableTextCount} editable text layer(s)).`
            : "SVG template loaded in Fabric mode."
        );
      } catch (_err) {
        if (isCancelled) return;
        setNotice(
          _err?.message
            ? `Failed to load SVG template in Fabric canvas: ${_err.message}`
            : "Failed to load SVG template in Fabric canvas."
        );
      } finally {
        fabricHistorySuspendRef.current = false;
        if (!isCancelled && loadedSuccessfully && canvas) {
          resetFabricHistoryWithCurrentCanvas(canvas);
        }
        if (!isCancelled) {
          setPendingSvgTemplateUrl("");
          setPendingSvgTemplateMeta(null);
        }
      }
    };

    loadSvgTemplate();
    return () => {
      isCancelled = true;
    };
  }, [useFabricEditor, fabricReady, pendingSvgTemplateUrl, pendingSvgTemplateMeta]);

  useEffect(() => {
    if (!pendingShapeType) return;
    if (!useFabricEditor || !fabricReady || !fabricInstanceRef.current) return;
    const canvas = fabricInstanceRef.current;
    const nextShape = createShapeForCanvas(pendingShapeType, {
      pageWidth: Number(pageCoordinateSize?.width || 0),
      pageHeight: Number(pageCoordinateSize?.height || 0),
    });
    if (!nextShape) {
      setPendingShapeType("");
      return;
    }
    markUserShapeObject(nextShape, pendingShapeType);
    markCanvasObjectEditableRecursive(nextShape);
    canvas.add(nextShape);
    if (typeof canvas.setActiveObject === "function") {
      canvas.setActiveObject(nextShape);
    }
    if (typeof nextShape.setCoords === "function") {
      nextShape.setCoords();
    }
    canvas.requestRenderAll();
    refreshFabricSelectionState();
    const shapeLabel = SHAPE_ITEMS.find((item) => item.id === pendingShapeType)?.label || "Shape";
    setNotice(`${shapeLabel} added to canvas.`);
    setPendingShapeType("");
  }, [pendingShapeType, useFabricEditor, fabricReady, pageCoordinateSize]);

  useEffect(() => {
    const onPointerMove = (event) => {
      const drag = cropDragStateRef.current;
      if (!drag) return;
      const page = canvasPageRef.current;
      if (!page) return;
      const rect = page.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dxPct = ((event.clientX - drag.startClientX) / rect.width) * 100;
      const dyPct = ((event.clientY - drag.startClientY) / rect.height) * 100;

      let nextX = drag.startCropX;
      let nextY = drag.startCropY;
      let nextW = drag.startCropW;
      let nextH = drag.startCropH;

      if (drag.mode === "move") {
        nextX = clamp(drag.startCropX + dxPct, 0, 100 - drag.startCropW);
        nextY = clamp(drag.startCropY + dyPct, 0, 100 - drag.startCropH);
      } else if (drag.mode === "resize-br") {
        nextW = clamp(drag.startCropW + dxPct, 1, 100 - drag.startCropX);
        nextH = clamp(drag.startCropH + dyPct, 1, 100 - drag.startCropY);
      } else if (drag.mode === "resize-tr") {
        const startBottom = drag.startCropY + drag.startCropH;
        nextY = clamp(drag.startCropY + dyPct, 0, startBottom - 1);
        nextH = clamp(startBottom - nextY, 1, 100);
        nextW = clamp(drag.startCropW + dxPct, 1, 100 - drag.startCropX);
      } else if (drag.mode === "resize-bl") {
        const startRight = drag.startCropX + drag.startCropW;
        nextX = clamp(drag.startCropX + dxPct, 0, startRight - 1);
        nextW = clamp(startRight - nextX, 1, 100);
        nextH = clamp(drag.startCropH + dyPct, 1, 100 - drag.startCropY);
      } else if (drag.mode === "resize-tl") {
        const startRight = drag.startCropX + drag.startCropW;
        const startBottom = drag.startCropY + drag.startCropH;
        nextX = clamp(drag.startCropX + dxPct, 0, startRight - 1);
        nextY = clamp(drag.startCropY + dyPct, 0, startBottom - 1);
        nextW = clamp(startRight - nextX, 1, 100);
        nextH = clamp(startBottom - nextY, 1, 100);
      } else if (drag.mode === "resize-r") {
        nextW = clamp(drag.startCropW + dxPct, 1, 100 - drag.startCropX);
      } else if (drag.mode === "resize-l") {
        const startRight = drag.startCropX + drag.startCropW;
        nextX = clamp(drag.startCropX + dxPct, 0, startRight - 1);
        nextW = clamp(startRight - nextX, 1, 100);
      } else if (drag.mode === "resize-t") {
        const startBottom = drag.startCropY + drag.startCropH;
        nextY = clamp(drag.startCropY + dyPct, 0, startBottom - 1);
        nextH = clamp(startBottom - nextY, 1, 100);
      } else if (drag.mode === "resize-b") {
        nextH = clamp(drag.startCropH + dyPct, 1, 100 - drag.startCropY);
      }

      const lockAspect = drag.lockAspect || event.shiftKey;
      if (lockAspect && drag.mode !== "move") {
        const ratio = Math.max(0.01, drag.aspectRatio || 1);
        const dominantByWidth = Math.abs(dxPct) >= Math.abs(dyPct);
        const startRight = drag.startCropX + drag.startCropW;
        const startBottom = drag.startCropY + drag.startCropH;
        const startCenterX = drag.startCropX + drag.startCropW / 2;
        const startCenterY = drag.startCropY + drag.startCropH / 2;

        if (drag.mode === "resize-br") {
          if (dominantByWidth) {
            nextH = clamp(nextW / ratio, 1, 100 - drag.startCropY);
            nextW = clamp(nextH * ratio, 1, 100 - drag.startCropX);
          } else {
            nextW = clamp(nextH * ratio, 1, 100 - drag.startCropX);
            nextH = clamp(nextW / ratio, 1, 100 - drag.startCropY);
          }
        } else if (drag.mode === "resize-tr") {
          if (dominantByWidth) {
            nextH = clamp(nextW / ratio, 1, startBottom);
            nextY = clamp(startBottom - nextH, 0, 100 - nextH);
            nextW = clamp(nextH * ratio, 1, 100 - drag.startCropX);
          } else {
            nextW = clamp(nextH * ratio, 1, 100 - drag.startCropX);
            nextH = clamp(nextW / ratio, 1, startBottom);
            nextY = clamp(startBottom - nextH, 0, 100 - nextH);
          }
        } else if (drag.mode === "resize-bl") {
          if (dominantByWidth) {
            nextH = clamp(nextW / ratio, 1, 100 - drag.startCropY);
            nextW = clamp(nextH * ratio, 1, startRight);
            nextX = clamp(startRight - nextW, 0, 100 - nextW);
          } else {
            nextW = clamp(nextH * ratio, 1, startRight);
            nextX = clamp(startRight - nextW, 0, 100 - nextW);
            nextH = clamp(nextW / ratio, 1, 100 - drag.startCropY);
          }
        } else if (drag.mode === "resize-tl") {
          if (dominantByWidth) {
            nextH = clamp(nextW / ratio, 1, startBottom);
            nextW = clamp(nextH * ratio, 1, startRight);
          } else {
            nextW = clamp(nextH * ratio, 1, startRight);
            nextH = clamp(nextW / ratio, 1, startBottom);
          }
          nextX = clamp(startRight - nextW, 0, 100 - nextW);
          nextY = clamp(startBottom - nextH, 0, 100 - nextH);
        } else if (drag.mode === "resize-r" || drag.mode === "resize-l") {
          nextH = clamp(nextW / ratio, 1, 100);
          nextY = clamp(startCenterY - nextH / 2, 0, 100 - nextH);
          if (drag.mode === "resize-l") {
            nextX = clamp(startRight - nextW, 0, 100 - nextW);
          }
        } else if (drag.mode === "resize-t" || drag.mode === "resize-b") {
          nextW = clamp(nextH * ratio, 1, 100);
          nextX = clamp(startCenterX - nextW / 2, 0, 100 - nextW);
          if (drag.mode === "resize-t") {
            nextY = clamp(startBottom - nextH, 0, 100 - nextH);
          }
        }
      }

      updateCropValues({
        cropX: Math.round(nextX * 100) / 100,
        cropY: Math.round(nextY * 100) / 100,
        cropW: Math.round(nextW * 100) / 100,
        cropH: Math.round(nextH * 100) / 100,
      });
    };

    const onPointerUp = () => {
      cropDragStateRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!sourceImageId) {
      setEditHistory([]);
      return () => {
        mounted = false;
      };
    }
    (async () => {
      try {
        const resp = await api.get(`/imagekit/edit-history/${sourceImageId}`);
        if (!mounted) return;
        const versions = resp?.data?.data?.versions || [];
        setEditHistory(Array.isArray(versions) ? versions : []);
      } catch (err) {
        if (!mounted) return;
        setEditHistory([]);
        if (err?.response?.status === 401) {
          setNotice("Login required to view edit history. Local editing is still available.");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sourceImageId, historyRefreshKey]);

  useEffect(() => {
    // New source should start with a clean retry state.
    setRetryKeyByUrl({});
    setAiBgEnabled(false);
    setAiBgPreviewUrl("");
    setAiBgReplace(false);
    setPreviewImageSize({ width: 0, height: 0 });
  }, [source]);

  useEffect(() => {
    if (historyStack.length === 0) {
      setHistoryStack([snapshotState([])]);
      setHistoryIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyStack.length]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  useEffect(() => {
    latestLayersRef.current = textLayers;
  }, [textLayers]);

  const selectedCategoryNode = useMemo(
    () => categoryTree.find((c) => c._id === selectedCategory),
    [categoryTree, selectedCategory]
  );

  const selectedSubCategoryNode = useMemo(
    () => selectedCategoryNode?.children?.find((c) => c._id === selectedSubCategory),
    [selectedCategoryNode, selectedSubCategory]
  );

  const effectiveSource = useMemo(() => {
    if (aiBgEnabled && aiBgPreviewUrl) return aiBgPreviewUrl;
    return source;
  }, [aiBgEnabled, aiBgPreviewUrl, source]);

  const canUseImageKitTransforms = useMemo(
    () =>
      isImageKitAssetUrl(effectiveSource, imageKitEndpoint) &&
      !hasEmbeddedRemoteSource(effectiveSource) &&
      !aiBgEnabled,
    [effectiveSource, imageKitEndpoint, aiBgEnabled]
  );

  const imageKitPreviewUrl = useMemo(() => {
    if (!canUseImageKitTransforms) return effectiveSource;
    return buildImageKitTransformUrl(effectiveSource, editValues);
  }, [canUseImageKitTransforms, effectiveSource, editValues]);

  const previewSrc = canUseImageKitTransforms ? imageKitPreviewUrl : effectiveSource;

  const computedFilter = useMemo(() => {
    if (canUseImageKitTransforms) return "none";
    if (showOriginal) return "none";
    const { brightness, contrast, saturation, blur, grayscale, sepia } = editValues;
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
  }, [canUseImageKitTransforms, editValues, showOriginal]);

  const computedTransform = useMemo(() => {
    if (showOriginal) return "scale(1)";
    const { rotate, zoom, flipX, flipY } = editValues;
    const sx = flipX ? -1 : 1;
    const sy = flipY ? -1 : 1;
    const rotateValue = canUseImageKitTransforms ? 0 : rotate;
    return `scale(${sx * (zoom / 100)}, ${sy * (zoom / 100)}) rotate(${rotateValue}deg)`;
  }, [canUseImageKitTransforms, editValues, showOriginal]);

  const cropStyle = useMemo(() => {
    const x = clamp(editValues.cropX, 0, 99);
    const y = clamp(editValues.cropY, 0, 99);
    const w = Math.min(clamp(editValues.cropW, 1, 100), 100 - x);
    const h = Math.min(clamp(editValues.cropH, 1, 100), 100 - y);
    const right = Math.max(0, 100 - (x + w));
    const bottom = Math.max(0, 100 - (y + h));
    return { clipPath: `inset(${y}% ${right}% ${bottom}% ${x}%)` };
  }, [editValues.cropX, editValues.cropY, editValues.cropW, editValues.cropH]);

  const originalPreviewSrc = useMemo(() => {
    if (!canUseImageKitTransforms) return source;
    return removeImageKitTransform(source);
  }, [canUseImageKitTransforms, source]);

  const displayPreviewSrc = useMemo(() => {
    const activeUrl = showOriginal ? originalPreviewSrc : previewSrc;
    return withRetryCacheBuster(activeUrl, retryKeyByUrl);
  }, [showOriginal, originalPreviewSrc, previewSrc, retryKeyByUrl]);

  useEffect(() => {
    setPreviewLoading(Boolean(source));
  }, [displayPreviewSrc, source]);

  const isViewingOriginal = useMemo(() => {
    if (!originalAssetUrl || !source) return false;
    return normalizeComparableUrl(source) === normalizeComparableUrl(originalAssetUrl);
  }, [source, originalAssetUrl]);

  const sortedEditHistory = useMemo(() => {
    if (!Array.isArray(editHistory)) return [];
    return [...editHistory].sort((a, b) => {
      const aNum = Number(a?.versionNumber || 0);
      const bNum = Number(b?.versionNumber || 0);
      if (aNum !== bNum) return bNum - aNum;
      return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
    });
  }, [editHistory]);

  const updateValue = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const setCanvasViewZoomSafe = (nextZoomPct) => {
    const safe = clamp(
      Math.round(Number(nextZoomPct || CANVAS_VIEW_DEFAULTS.zoomPct)),
      CANVAS_VIEW_ZOOM_MIN,
      CANVAS_VIEW_ZOOM_MAX
    );
    setCanvasViewZoom(safe);
  };

  const zoomInCanvasView = () => {
    setCanvasViewZoom((prev) => clamp(prev + CANVAS_VIEW_ZOOM_STEP, CANVAS_VIEW_ZOOM_MIN, CANVAS_VIEW_ZOOM_MAX));
  };

  const zoomOutCanvasView = () => {
    setCanvasViewZoom((prev) => clamp(prev - CANVAS_VIEW_ZOOM_STEP, CANVAS_VIEW_ZOOM_MIN, CANVAS_VIEW_ZOOM_MAX));
  };

  const resetCanvasViewZoom = () => {
    setCanvasViewZoom(CANVAS_VIEW_DEFAULTS.zoomPct);
  };

  const updateCanvasPageSize = (dimension, rawValue) => {
    const raw = String(rawValue ?? "").trim();
    if (!raw) return;
    const parsed = Math.round(Number(raw));
    if (!Number.isFinite(parsed)) return;
    const safeSize = clamp(parsed, 64, 10000);

    setCanvasPageSizeOverride((prev) => {
      const prevWidth = Number(prev?.width || pageCoordinateSize?.width || 1080);
      const prevHeight = Number(prev?.height || pageCoordinateSize?.height || 1080);
      if (dimension === "height") {
        return { width: prevWidth, height: safeSize };
      }
      return { width: safeSize, height: prevHeight };
    });
  };

  const resetCanvasPageSize = () => {
    setCanvasPageSizeOverride(null);
  };

  const syncFabricHistoryMeta = (index, length) => {
    setFabricHistoryMeta({
      index: Number(index ?? -1),
      length: Number(length ?? 0),
    });
  };

  const clearFabricHistory = () => {
    fabricHistoryStackRef.current = [];
    fabricHistoryIndexRef.current = -1;
    syncFabricHistoryMeta(-1, 0);
  };

  const serializeFabricCanvasSnapshot = (canvas) => {
    if (!canvas || typeof canvas.toJSON !== "function") return "";
    try {
      const json = canvas.toJSON(FABRIC_EDITABLE_TEXT_CUSTOM_PROPS);
      return JSON.stringify(json);
    } catch {
      return "";
    }
  };

  const pushFabricHistorySnapshot = (canvas, options = {}) => {
    const { force = false, ignoreSuspend = false } = options;
    if (!canvas) return false;
    if (!ignoreSuspend && fabricHistorySuspendRef.current) return false;
    const serialized = serializeFabricCanvasSnapshot(canvas);
    if (!serialized) return false;

    let stack = Array.isArray(fabricHistoryStackRef.current) ? fabricHistoryStackRef.current : [];
    let index = Number(fabricHistoryIndexRef.current);
    if (!Number.isFinite(index)) index = stack.length - 1;
    if (index < 0) index = stack.length - 1;

    const currentSerialized = stack[index] || "";
    if (!force && serialized === currentSerialized) return false;

    const trimmed = stack.slice(0, index + 1);
    let nextStack = [...trimmed, serialized];
    const maxEntries = 120;
    if (nextStack.length > maxEntries) {
      nextStack = nextStack.slice(nextStack.length - maxEntries);
    }
    const nextIndex = nextStack.length - 1;

    fabricHistoryStackRef.current = nextStack;
    fabricHistoryIndexRef.current = nextIndex;
    syncFabricHistoryMeta(nextIndex, nextStack.length);
    return true;
  };

  const resetFabricHistoryWithCurrentCanvas = (canvas) => {
    const serialized = serializeFabricCanvasSnapshot(canvas);
    if (!serialized) {
      clearFabricHistory();
      return;
    }
    fabricHistoryStackRef.current = [serialized];
    fabricHistoryIndexRef.current = 0;
    syncFabricHistoryMeta(0, 1);
  };

  const applyFabricHistorySnapshot = async (canvas, targetIndex) => {
    if (!canvas) return false;
    const stack = Array.isArray(fabricHistoryStackRef.current) ? fabricHistoryStackRef.current : [];
    const nextIndex = Number(targetIndex);
    if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= stack.length) return false;
    const serialized = stack[nextIndex];
    if (!serialized) return false;

    let parsed = null;
    try {
      parsed = JSON.parse(serialized);
    } catch {
      return false;
    }

    fabricHistorySuspendRef.current = true;
    try {
      if (typeof canvas.discardActiveObject === "function") {
        canvas.discardActiveObject();
      }
      canvas.clear();
      canvas.backgroundColor = pageBgColor;
      await canvas.loadFromJSON(parsed);
      normalizeLoadedFabricObjects(canvas);
      fitFabricViewportToPage(canvas, {
        pageWidth: Number(pageCoordinateSize?.width || 0),
        pageHeight: Number(pageCoordinateSize?.height || 0),
      });
      canvas.requestRenderAll();
      ensureFabricCanvasFontsLoaded(canvas);

      fabricHistoryIndexRef.current = nextIndex;
      syncFabricHistoryMeta(nextIndex, stack.length);
      refreshFabricSelectionState();
      return true;
    } catch {
      return false;
    } finally {
      fabricHistorySuspendRef.current = false;
    }
  };

  const addShapeToCanvas = (shapeType) => {
    const safeShapeType = String(shapeType || "").trim().toLowerCase();
    if (!safeShapeType) return;
    if (!SHAPE_ITEMS.some((item) => item.id === safeShapeType)) return;
    if (!useFabricEditor) {
      setUseFabricEditor(true);
      setPendingShapeType(safeShapeType);
      setNotice("Fabric mode enabled for shape editing.");
      return;
    }
    if (!fabricReady || !fabricInstanceRef.current) {
      setPendingShapeType(safeShapeType);
      setNotice("Preparing canvas...");
      return;
    }
    setPendingShapeType(safeShapeType);
  };

  const refreshFabricSelectionState = () => {
    const canvas = fabricInstanceRef.current;
    setFabricSelectionState(getFabricSelectionState(canvas));
    setFabricEditableTextItems(getFabricEditableTextItems(canvas));
  };

  const mutateSelectedFabricObjects = (mutator) => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const targets = getActiveFabricLeafTargets(canvas);
    if (!targets.length) {
      setNotice("Select an object on canvas to edit.");
      return;
    }

    targets.forEach((obj) => {
      if (!obj || typeof obj.set !== "function") return;
      mutator(obj);
      if (typeof obj.setCoords === "function") obj.setCoords();
    });
    canvas.requestRenderAll();
    pushFabricHistorySnapshot(canvas);
    refreshFabricSelectionState();
  };

  const mutateSelectedFabricTextObjects = (mutator) => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const targets = getActiveFabricLeafTargets(canvas).filter((obj) => isFabricTextObject(obj));
    if (!targets.length) {
      setNotice("Selected object has no editable text. It may be converted to vector paths.");
      return;
    }

    targets.forEach((obj) => {
      if (!obj || typeof obj.set !== "function") return;
      mutator(obj);
      if (typeof obj.setCoords === "function") obj.setCoords();
    });
    canvas.requestRenderAll();
    pushFabricHistorySnapshot(canvas);
    refreshFabricSelectionState();
  };

  const updateSelectedFabricFill = (color) => {
    mutateSelectedFabricObjects((obj) => {
      if ("fill" in obj) obj.set({ fill: color });
    });
  };

  const updateSelectedFabricStroke = (color) => {
    mutateSelectedFabricObjects((obj) => {
      if ("stroke" in obj) obj.set({ stroke: color });
    });
  };

  const updateSelectedFabricStrokeWidth = (nextWidth) => {
    const safeWidth = clamp(nextWidth, 0, 48);
    mutateSelectedFabricObjects((obj) => {
      if ("strokeWidth" in obj) obj.set({ strokeWidth: safeWidth });
    });
  };

  const updateSelectedFabricOpacity = (nextOpacity) => {
    const safeOpacity = clamp(nextOpacity, 0, 100) / 100;
    mutateSelectedFabricObjects((obj) => {
      if ("opacity" in obj) obj.set({ opacity: safeOpacity });
    });
  };

  const updateSelectedFabricCornerRadius = (nextRadius) => {
    const safeRadius = clamp(nextRadius, 0, 240);
    mutateSelectedFabricObjects((obj) => {
      const type = String(obj?.type || "").toLowerCase();
      if (type === "rect") {
        obj.set({ rx: safeRadius, ry: safeRadius });
      }
    });
  };

  const updateSelectedFabricTextValue = (text) => {
    mutateSelectedFabricTextObjects((obj) => {
      obj.set({ text });
    });
  };

  const updateSelectedFabricFontSize = (fontSize) => {
    const safeFontSize = clamp(fontSize, 6, 360);
    mutateSelectedFabricTextObjects((obj) => {
      if ("fontSize" in obj) obj.set({ fontSize: safeFontSize });
    });
  };

  const updateSelectedFabricFontFamily = (fontFamily) => {
    const safeFontFamily = String(fontFamily || "").trim() || "Segoe UI";
    mutateSelectedFabricTextObjects((obj) => {
      if ("fontFamily" in obj) obj.set({ fontFamily: safeFontFamily });
    });
    ensureFabricFontLoaded(safeFontFamily, fabricInstanceRef.current);
  };

  const updateSelectedFabricFontWeight = (fontWeight) => {
    mutateSelectedFabricTextObjects((obj) => {
      if ("fontWeight" in obj) obj.set({ fontWeight });
    });
  };

  const updateSelectedFabricFontStyle = (fontStyle) => {
    mutateSelectedFabricTextObjects((obj) => {
      if ("fontStyle" in obj) obj.set({ fontStyle });
    });
  };

  const updateSelectedFabricTextAlign = (textAlign) => {
    mutateSelectedFabricTextObjects((obj) => {
      if ("textAlign" in obj) obj.set({ textAlign });
    });
  };

  const applyTypographyPresetToTextLayer = (presetId) => {
    const preset = typographyPresets.find((item) => item.id === presetId);
    if (!preset || !selectedTextLayerId) return;
    updateSelectedTextLayer({ ...preset.values });
  };

  const applyTypographyPresetToFabricText = (presetId) => {
    const preset = typographyPresets.find((item) => item.id === presetId);
    if (!preset) return;
    const safeValues = {
      ...preset.values,
      fontFamily: String(preset.values?.fontFamily || "").trim() || "Segoe UI",
      fontSize: clamp(Number(preset.values?.fontSize || 42), 6, 360),
    };
    mutateSelectedFabricTextObjects((obj) => {
      obj.set(safeValues);
    });
    ensureFabricFontLoaded(safeValues.fontFamily, fabricInstanceRef.current);
  };

  const focusEditableTextLayer = (textLayerId) => {
    const canvas = fabricInstanceRef.current;
    if (!canvas || !textLayerId) return;

    const textTargets = getCanvasTextObjects(canvas);
    const target = textTargets.find((obj, index) => getFabricTextRuntimeId(obj, index) === textLayerId);
    if (!target) {
      setNotice("Editable text layer not found on canvas.");
      return;
    }

    if (typeof canvas.discardActiveObject === "function") {
      canvas.discardActiveObject();
    }
    if (typeof canvas.setActiveObject === "function") {
      canvas.setActiveObject(target);
    }
    if (typeof target.setCoords === "function") {
      target.setCoords();
    }
    if (typeof target.enterEditing === "function") {
      try {
        target.enterEditing();
      } catch {
        // Ignore for non-editable Fabric text nodes.
      }
    }
    canvas.requestRenderAll();
    refreshFabricSelectionState();
  };

  const removeSelectedFabricObjects = () => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const targets = getActiveFabricSelectionTargets(canvas);
    if (!targets.length) return;

    targets.forEach((obj) => {
      if (obj) canvas.remove(obj);
    });
    if (typeof canvas.discardActiveObject === "function") {
      canvas.discardActiveObject();
    }
    canvas.requestRenderAll();
    pushFabricHistorySnapshot(canvas);
    refreshFabricSelectionState();
    setNotice("Selected object removed.");
  };

  const moveSelectedFabricObjects = (direction) => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const targets = getActiveFabricSelectionTargets(canvas);
    if (!targets.length) return;
    const safeDirection = direction === "down" ? "down" : "up";
    const orderedTargets =
      safeDirection === "down" ? [...targets].reverse() : [...targets];

    orderedTargets.forEach((obj) => {
      if (!obj) return;
      if (safeDirection === "up") {
        if (typeof canvas.bringObjectForward === "function") {
          canvas.bringObjectForward(obj);
        } else if (typeof canvas.bringForward === "function") {
          canvas.bringForward(obj);
        }
      } else if (typeof canvas.sendObjectBackwards === "function") {
        canvas.sendObjectBackwards(obj);
      } else if (typeof canvas.sendBackwards === "function") {
        canvas.sendBackwards(obj);
      }
    });

    canvas.requestRenderAll();
    pushFabricHistorySnapshot(canvas);
    refreshFabricSelectionState();
  };

  const removeSelectedTemplateObjects = () => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const targets = getActiveFabricLeafTargets(canvas).filter(
      (obj) => isTemplateCanvasObject(obj) && !isEditableOverlayTextObject(obj)
    );
    const uniqueTargets = [...new Set(targets)];
    if (!uniqueTargets.length) {
      setNotice("Select built-in template objects to delete.");
      return;
    }

    uniqueTargets.forEach((obj) => {
      if (obj) canvas.remove(obj);
    });
    if (typeof canvas.discardActiveObject === "function") {
      canvas.discardActiveObject();
    }
    canvas.requestRenderAll();
    pushFabricHistorySnapshot(canvas);
    refreshFabricSelectionState();
    setNotice(`${uniqueTargets.length} template object(s) removed.`);
  };

  const removeAllBuiltInTemplateTextObjects = () => {
    const canvas = fabricInstanceRef.current;
    if (!canvas) return;
    const targets = getCanvasLeafObjects(canvas).filter((obj) => isBuiltInTemplateTextObject(obj));
    const uniqueTargets = [...new Set(targets)];
    if (!uniqueTargets.length) {
      setNotice(
        "No built-in real text objects found. If text is converted to paths, select those objects and use Delete selected template object."
      );
      return;
    }

    uniqueTargets.forEach((obj) => {
      if (obj) canvas.remove(obj);
    });
    if (typeof canvas.discardActiveObject === "function") {
      canvas.discardActiveObject();
    }
    canvas.requestRenderAll();
    pushFabricHistorySnapshot(canvas);
    refreshFabricSelectionState();
    setNotice(`${uniqueTargets.length} built-in text object(s) removed.`);
  };

  const snapshotState = (layersArg = textLayers) => ({
    textLayers: layersArg.map((layer) => ({ ...layer })),
  });

  const pushHistorySnapshot = (nextLayers) => {
    const snapshot = snapshotState(nextLayers);
    setHistoryStack((prev) => {
      const safeIndex = Math.max(0, historyIndexRef.current);
      const truncated = prev.slice(0, safeIndex + 1);
      const merged = [...truncated, snapshot];
      setHistoryIndex(merged.length - 1);
      return merged;
    });
  };

  const addFabricEditableTextLayer = ({ attachToSelectedShape = false } = {}) => {
    const canvas = fabricInstanceRef.current;
    if (!useFabricEditor || !fabricReady || !canvas) {
      setNotice("Fabric canvas is not ready yet.");
      return;
    }

    const selectedLeafTargets = getActiveFabricLeafTargets(canvas);
    const selectedShape = selectedLeafTargets.find((obj) => obj && !isFabricTextObject(obj)) || null;
    if (attachToSelectedShape && !selectedShape) {
      setNotice("Select a shape first, then click 'Add text on selected shape'.");
      return;
    }

    const pageWidth = Math.max(320, Number(pageCoordinateSize?.width || 0) || 1080);
    const pageHeight = Math.max(320, Number(pageCoordinateSize?.height || 0) || 1080);
    let centerX = pageWidth / 2;
    let centerY = pageHeight / 2;
    let textWidth = clamp(Math.round(pageWidth * 0.42), 140, 760);

    if (selectedShape) {
      const centerPoint =
        typeof selectedShape.getCenterPoint === "function"
          ? selectedShape.getCenterPoint()
          : null;
      centerX = Number(centerPoint?.x ?? selectedShape?.left ?? centerX);
      centerY = Number(centerPoint?.y ?? selectedShape?.top ?? centerY);
      const scaledWidth =
        typeof selectedShape.getScaledWidth === "function"
          ? Number(selectedShape.getScaledWidth() || 0)
          : Number(selectedShape?.width || 0) * Number(selectedShape?.scaleX || 1);
      if (scaledWidth > 0) {
        textWidth = clamp(Math.round(scaledWidth * 0.84), 120, 760);
      }
    }

    const existingTextCount = getFabricEditableTextItems(canvas).length;
    const textId = `editable-text-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const textName = `Text ${existingTextCount + 1}`;
    const textObj = new FabricTextbox(TEXT_DEFAULTS.text, {
      left: centerX,
      top: centerY,
      width: textWidth,
      originX: "center",
      originY: "center",
      fontSize: 42,
      fontFamily: "Playfair Display",
      fontWeight: 700,
      fontStyle: "normal",
      textAlign: "center",
      fill: "#111111",
      opacity: 1,
      angle: 0,
      editable: true,
      selectable: true,
      evented: true,
      splitByGrapheme: false,
    });
    textObj.set({
      elvifyEditableText: true,
      elvifyEditableTextId: textId,
      elvifyEditableTextName: textName,
      elvifyTemplateObject: false,
      elvifyTemplateTextObject: false,
      elvifyUserShape: false,
      elvifyShapeType: "",
    });
    markCanvasObjectEditableRecursive(textObj);
    canvas.add(textObj);
    if (typeof canvas.setActiveObject === "function") {
      canvas.setActiveObject(textObj);
    }
    if (typeof canvas.bringObjectToFront === "function") {
      canvas.bringObjectToFront(textObj);
    } else if (typeof canvas.bringToFront === "function") {
      canvas.bringToFront(textObj);
    }
    if (typeof textObj.setCoords === "function") {
      textObj.setCoords();
    }
    if (typeof textObj.enterEditing === "function") {
      try {
        textObj.enterEditing();
      } catch {
        // Ignore if editing cannot be entered immediately.
      }
    }
    canvas.requestRenderAll();
    ensureFabricFontLoaded("Playfair Display", canvas);
    pushFabricHistorySnapshot(canvas);
    refreshFabricSelectionState();
    setNotice(
      attachToSelectedShape
        ? "Text added on selected shape."
        : "Text added to canvas."
    );
  };

  const addTextLayer = () => {
    if (useFabricEditor) {
      addFabricEditableTextLayer({ attachToSelectedShape: false });
      return;
    }
    const id = `txt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nextLayers = [
      ...textLayers,
      {
        id,
        name: `Text ${textLayers.length + 1}`,
        ...TEXT_DEFAULTS,
      },
    ];
    setTextLayers(nextLayers);
    setSelectedTextLayerId(id);
    pushHistorySnapshot(nextLayers);
  };

  const addTextOnSelectedShape = () => {
    addFabricEditableTextLayer({ attachToSelectedShape: true });
  };

  const updateSelectedTextLayer = (patch, { recordHistory = true } = {}) => {
    if (!selectedTextLayerId) return;
    const nextLayers = textLayers.map((layer) =>
      layer.id === selectedTextLayerId ? { ...layer, ...patch } : layer
    );
    setTextLayers(nextLayers);
    if (recordHistory) pushHistorySnapshot(nextLayers);
  };

  const removeSelectedTextLayer = () => {
    if (useFabricEditor) {
      removeSelectedFabricObjects();
      return;
    }
    if (!selectedTextLayerId) return;
    const nextLayers = textLayers.filter((layer) => layer.id !== selectedTextLayerId);
    setTextLayers(nextLayers);
    setSelectedTextLayerId(nextLayers[0]?.id || null);
    pushHistorySnapshot(nextLayers);
  };

  const undoEditorChange = async () => {
    if (useFabricEditor) {
      const canvas = fabricInstanceRef.current;
      if (!canvas) return;
      const nextIndex = fabricHistoryIndexRef.current - 1;
      if (nextIndex < 0) return;
      await applyFabricHistorySnapshot(canvas, nextIndex);
      return;
    }

    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    const snapshot = historyStack[nextIndex];
    if (!snapshot) return;
    setHistoryIndex(nextIndex);
    setTextLayers(snapshot.textLayers || []);
    setSelectedTextLayerId(snapshot.textLayers?.[0]?.id || null);
  };

  const redoEditorChange = async () => {
    if (useFabricEditor) {
      const canvas = fabricInstanceRef.current;
      if (!canvas) return;
      const nextIndex = fabricHistoryIndexRef.current + 1;
      if (nextIndex >= fabricHistoryStackRef.current.length) return;
      await applyFabricHistorySnapshot(canvas, nextIndex);
      return;
    }

    if (historyIndex >= historyStack.length - 1) return;
    const nextIndex = historyIndex + 1;
    const snapshot = historyStack[nextIndex];
    if (!snapshot) return;
    setHistoryIndex(nextIndex);
    setTextLayers(snapshot.textLayers || []);
    setSelectedTextLayerId(snapshot.textLayers?.[0]?.id || null);
  };

  const moveSelectedTextLayer = (direction) => {
    if (useFabricEditor) {
      moveSelectedFabricObjects(direction === "down" ? "down" : "up");
      return;
    }
    if (!selectedTextLayerId) return;
    const idx = textLayers.findIndex((layer) => layer.id === selectedTextLayerId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= textLayers.length) return;

    const nextLayers = [...textLayers];
    const temp = nextLayers[idx];
    nextLayers[idx] = nextLayers[targetIdx];
    nextLayers[targetIdx] = temp;
    setTextLayers(nextLayers);
    pushHistorySnapshot(nextLayers);
  };

  useEffect(() => {
    const onPointerMove = (event) => {
      const drag = dragStateRef.current;
      if (!drag) return;
      const page = canvasPageRef.current;
      if (!page) return;
      const rect = page.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      if (drag.mode === "move") {
        const dxPct = ((event.clientX - drag.startClientX) / rect.width) * 100;
        const dyPct = ((event.clientY - drag.startClientY) / rect.height) * 100;
        const nextX = clamp(drag.startX + dxPct, 0, 100);
        const nextY = clamp(drag.startY + dyPct, 0, 100);
        drag.moved = true;

        setTextLayers((prev) =>
          prev.map((layer) =>
            layer.id === drag.layerId
              ? { ...layer, x: nextX, y: nextY }
              : layer
          )
        );
        return;
      }

      if (drag.mode === "resize") {
        const dx = event.clientX - drag.centerX;
        const dy = event.clientY - drag.centerY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        if (!Number.isFinite(currentDistance) || currentDistance <= 0) return;
        const ratio = currentDistance / Math.max(1, drag.startDistance);
        const nextFontSize = clamp(Math.round(drag.startFontSize * ratio), 10, 220);
        drag.moved = true;
        setTextLayers((prev) =>
          prev.map((layer) =>
            layer.id === drag.layerId
              ? { ...layer, fontSize: nextFontSize }
              : layer
          )
        );
        return;
      }

      if (drag.mode === "rotate") {
        const currentAngle = Math.atan2(event.clientY - drag.centerY, event.clientX - drag.centerX);
        let delta = ((currentAngle - drag.startAngle) * 180) / Math.PI;
        // normalize to [-180, 180] for stable rotation
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        const nextRotate = clamp(Math.round(drag.startRotate + delta), -180, 180);
        drag.moved = true;
        setTextLayers((prev) =>
          prev.map((layer) =>
            layer.id === drag.layerId
              ? { ...layer, rotate: nextRotate }
              : layer
          )
        );
      }
    };

    const onPointerUp = () => {
      const drag = dragStateRef.current;
      if (drag?.moved) {
        pushHistorySnapshot(latestLayersRef.current);
      }
      dragStateRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (preset) => {
    setEditValues((prev) => ({
      ...prev,
      ...preset.values,
    }));
  };

  const applyCropAspect = (aspect) => {
    if (aspect === "free") {
      setCropAspectMode("free");
      updateValue("cropX", 0);
      updateValue("cropY", 0);
      updateValue("cropW", 100);
      updateValue("cropH", 100);
      return;
    }

    const [aw, ah] = aspect.split(":").map(Number);
    if (!aw || !ah) return;
    const ratio = aw / ah;
    let cropW = 100;
    let cropH = Math.round((100 / ratio) * 100) / 100;
    if (cropH > 100) {
      cropH = 100;
      cropW = Math.round((100 * ratio) * 100) / 100;
    }
    const cropX = Math.round(((100 - cropW) / 2) * 100) / 100;
    const cropY = Math.round(((100 - cropH) / 2) * 100) / 100;
    setCropAspectMode(aspect);
    updateValue("cropX", cropX);
    updateValue("cropY", cropY);
    updateValue("cropW", cropW);
    updateValue("cropH", cropH);
  };

  const updateCropValues = (nextCrop) => {
    setEditValues((prev) => ({
      ...prev,
      cropX: Number.isFinite(nextCrop.cropX) ? nextCrop.cropX : prev.cropX,
      cropY: Number.isFinite(nextCrop.cropY) ? nextCrop.cropY : prev.cropY,
      cropW: Number.isFinite(nextCrop.cropW) ? nextCrop.cropW : prev.cropW,
      cropH: Number.isFinite(nextCrop.cropH) ? nextCrop.cropH : prev.cropH,
    }));
  };

  const beginCropDrag = (mode, event) => {
    event.stopPropagation();
    const safeW = Math.max(1, Number(editValues.cropW || 1));
    const safeH = Math.max(1, Number(editValues.cropH || 1));
    cropDragStateRef.current = {
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCropX: Number(editValues.cropX || 0),
      startCropY: Number(editValues.cropY || 0),
      startCropW: safeW,
      startCropH: safeH,
      aspectRatio: safeW / safeH,
      lockAspect: cropAspectMode !== "free",
    };
  };

  const clearAiBgRemove = (message = "AI background remove reset.") => {
    setAiBgEnabled(false);
    setAiBgPreviewUrl("");
    setAiBgReplace(false);
    if (message) setNotice(message);
  };

  const applyAiBgRemovePreview = async () => {
    if (!source) return;
    if (!isHttpUrl(source)) {
      setNotice("AI BG Remove requires a valid asset URL.");
      return;
    }
    setAiBgLoading(true);
    setNotice("");
    try {
      const resp = await api.post("/imagekit/bg-remove-preview", {
        assetUrl: source,
        replaceBg: aiBgReplace,
        bgColor: aiBgColor,
      });
      const nextPreviewUrl = resp?.data?.data?.previewUrl;
      if (!nextPreviewUrl) throw new Error("Missing preview URL");
      setAiBgPreviewUrl(nextPreviewUrl);
      setAiBgEnabled(true);
      setNotice(aiBgReplace ? "Background removed and replaced." : "Background removed.");
    } catch (err) {
      if (err?.response?.status === 401) {
        setNotice("Please login to use AI background remove.");
      } else {
        setNotice("AI background remove failed. Please try again.");
      }
    } finally {
      setAiBgLoading(false);
    }
  };

  const resetAll = () => {
    setEditValues(EDIT_DEFAULTS);
    setActiveTemplateId("");
    setUseFabricEditor(false);
    setPendingSvgTemplateUrl("");
    setPendingSvgTemplateMeta(null);
    setPendingFabricTemplate(null);
    setActiveTemplateMeta(null);
    setActiveTemplateCanvasSize(null);
    setCanvasPageSizeOverride(null);
    setFabricSelectionState(null);
    setFabricEditableTextItems([]);
    setPendingShapeType("");
    setTextLayers([]);
    setSelectedTextLayerId(null);
    setWorkspaceBgColor(CANVAS_VIEW_DEFAULTS.workspaceBgColor);
    setPageBgColor(CANVAS_VIEW_DEFAULTS.pageBgColor);
    setCanvasViewZoom(CANVAS_VIEW_DEFAULTS.zoomPct);
    setHistoryStack([snapshotState([])]);
    setHistoryIndex(0);
    if (originalAssetUrl) {
      setSource(originalAssetUrl);
      setSourceInput(originalAssetUrl);
      setShowOriginal(false);
    }
    setAiBgEnabled(false);
    setAiBgPreviewUrl("");
    setAiBgReplace(false);
    setNotice("All edits reset. Original asset restored.");
  };

  const loadFromInputUrl = () => {
    if (!sourceInput.trim()) return;
    setUseFabricEditor(false);
    setPendingSvgTemplateUrl("");
    setPendingSvgTemplateMeta(null);
    setPendingFabricTemplate(null);
    setActiveTemplateMeta(null);
    setActiveTemplateCanvasSize(null);
    setCanvasPageSizeOverride(null);
    setFabricSelectionState(null);
    setFabricEditableTextItems([]);
    setPendingShapeType("");
    setSource(sourceInput.trim());
    setActiveTemplateId("");
    setLocalFileName("");
    setNotice("Image loaded from URL.");
  };

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUseFabricEditor(false);
    setPendingSvgTemplateUrl("");
    setPendingSvgTemplateMeta(null);
    setPendingFabricTemplate(null);
    setActiveTemplateMeta(null);
    setActiveTemplateCanvasSize(null);
    setCanvasPageSizeOverride(null);
    setFabricSelectionState(null);
    setFabricEditableTextItems([]);
    setPendingShapeType("");
    setSource(objectUrl);
    setActiveTemplateId("");
    setSourceInput("");
    setLocalFileName(file.name || "");
    setNotice("Local image loaded.");
  };

  const applyTemplateToEditor = (template) => {
    if (!template) return;
    const baseUrl = String(template.baseUrl || "").trim();
    const previewUrl = String(template.previewUrl || "").trim();
    const thumbUrl = String(template.thumbnailUrl || "").trim();
    const templateType = String(template?.type || "").toLowerCase();
    const parsedFabricJson = parseTemplateFabricJson(template?.fabricJson);
    const parsedTemplateMeta = parseTemplateMeta(template?.meta);
    const parsedTemplateCanvas = parseTemplateCanvasSize(template?.canvas);
    const nextWorkspaceBgColor = normalizeFabricColorHex(
      String(
        parsedTemplateMeta?.workspaceBgColor ||
          parsedTemplateMeta?.workspaceBackgroundColor ||
          workspaceBgColor
      ),
      workspaceBgColor
    );
    const nextPageBgColor = normalizeFabricColorHex(
      String(parsedTemplateMeta?.pageBgColor || parsedTemplateMeta?.pageBackgroundColor || pageBgColor),
      pageBgColor
    );
    const hasFabricJson = hasRenderableFabricJson(parsedFabricJson);
    const nextSource =
      templateType === "svg"
        ? [baseUrl, previewUrl, thumbUrl].find((url) => looksLikeSvgUrl(url)) || baseUrl || ""
        : baseUrl || previewUrl || thumbUrl || "";
    const shouldLoadSvgFirst = templateType === "svg" && !hasFabricJson && Boolean(nextSource);
    if (!hasFabricJson && !nextSource) {
      setNotice(
        templateType === "svg"
          ? "SVG template is missing a valid .svg base URL. Re-upload base SVG from admin templates."
          : "Template base URL is missing."
      );
      return;
    }

    setSource(nextSource);
    setSourceInput(nextSource);
    setLocalFileName(template?.title || "");
    setActiveTemplateId(String(template?._id || ""));
    setEditValues(EDIT_DEFAULTS);
    setTextLayers([]);
    setSelectedTextLayerId(null);
    setHistoryStack([snapshotState([])]);
    setHistoryIndex(0);
    clearAiBgRemove("");
    setFabricSelectionState(null);
    setFabricEditableTextItems([]);
    setPendingShapeType("");
    setActiveTemplateMeta(parsedTemplateMeta);
    setActiveTemplateCanvasSize(parsedTemplateCanvas);
    setCanvasPageSizeOverride(null);
    setWorkspaceBgColor(nextWorkspaceBgColor);
    setPageBgColor(nextPageBgColor);
    setCanvasViewZoom(CANVAS_VIEW_DEFAULTS.zoomPct);

    if (hasFabricJson) {
      setUseFabricEditor(true);
      setPendingSvgTemplateUrl("");
      setPendingSvgTemplateMeta(null);
      setPendingFabricTemplate({
        title: template?.title || "Untitled template",
        fabricJson: parsedFabricJson,
        meta: parsedTemplateMeta,
        canvas: parsedTemplateCanvas,
      });
      setNotice(`Template "${template?.title || "Untitled template"}" loading from fabricJson...`);
      return;
    }

    if (shouldLoadSvgFirst) {
      setPendingFabricTemplate(null);
      setUseFabricEditor(true);
      setPendingSvgTemplateUrl(nextSource);
      setPendingSvgTemplateMeta({
        title: template?.title || "Untitled template",
        meta: parsedTemplateMeta,
        canvas: parsedTemplateCanvas,
      });
      setNotice(`Template "${template?.title || "Untitled template"}" loading in Fabric mode...`);
      return;
    }

    setPendingFabricTemplate(null);
    setPendingSvgTemplateMeta(null);

    if (templateType === "svg") {
      setUseFabricEditor(true);
      setPendingSvgTemplateUrl(nextSource);
      setPendingSvgTemplateMeta({
        title: template?.title || "Untitled template",
        meta: parsedTemplateMeta,
        canvas: parsedTemplateCanvas,
      });
      setNotice(`Template "${template?.title || "Untitled template"}" loading in Fabric mode...`);
    } else {
      setUseFabricEditor(false);
      setPendingSvgTemplateUrl("");
      setPendingSvgTemplateMeta(null);
      setNotice(`Template "${template?.title || "Untitled template"}" loaded.`);
    }
  };

  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
  };

  const handleSubCategoryChange = (id) => {
    setSelectedSubCategory(id);
    setSelectedSubSubCategory("");
  };

  const exportImage = async () => {
    const blob = useFabricEditor
      ? await buildFabricEditedBlob({
          fabricCanvas: fabricInstanceRef.current,
          exportFormat,
          exportQuality,
          targetWidth: Number(pageCoordinateSize?.width || 0),
          targetHeight: Number(pageCoordinateSize?.height || 0),
        })
      : await buildEditedBlob({
          imageEl: imageRef.current,
          exportFormat,
          exportQuality,
          editValues,
          textLayers,
          pageBackgroundColor: pageBgColor,
          useDirectImagePixels: canUseImageKitTransforms,
        });
    if (!blob) return;

    setSaving(true);
    setNotice("");
    try {
      const downloadUrl = URL.createObjectURL(blob);
      const extension = exportFormat.split("/")[1] || "png";
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `elvify-edit-${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setNotice(useFabricEditor ? "Export complete (Fabric template)." : "Export complete.");
    } catch {
      setNotice("Export failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveEditedToElvify = async () => {
    if (!source) {
      setNotice("Load an image first.");
      return;
    }

    if (!sourceImageId && !selectedCategory) {
      setNotice("For local images, select category before saving.");
      return;
    }

    const fabricCanvas = fabricInstanceRef.current;
    const editableTextLayerOverrides = useFabricEditor
      ? extractEditableTextLayersFromCanvas(fabricCanvas, {
          referenceWidth: Number(activeTemplateCanvasSize?.width || 0),
          referenceHeight: Number(activeTemplateCanvasSize?.height || 0),
        })
      : [];
    const mergedTemplateMeta = mergeTemplateMetaWithEditableTextLayers(
      activeTemplateMeta,
      editableTextLayerOverrides
    );

    const blob = useFabricEditor
      ? await buildFabricEditedBlob({
          fabricCanvas,
          exportFormat,
          exportQuality,
          targetWidth: Number(pageCoordinateSize?.width || 0),
          targetHeight: Number(pageCoordinateSize?.height || 0),
        })
      : await buildEditedBlob({
          imageEl: imageRef.current,
          exportFormat,
          exportQuality,
          editValues,
          textLayers,
          pageBackgroundColor: pageBgColor,
          useDirectImagePixels: canUseImageKitTransforms,
        });
    if (!blob) return;

    setUploading(true);
    setNotice("");
    try {
      const authResp = await api.get("/imagekit/auth");
      const authData = authResp?.data?.data;
      if (!authData?.publicKey || !authData?.authenticationParameters) {
        throw new Error("ImageKit auth params missing from backend");
      }

      const imageKitUpload = await uploadBlobToImageKit({
        blob,
        fileName: `elvify-edited-${Date.now()}.${mimeToExt(exportFormat)}`,
        authData,
      });

      await api.post("/imagekit/edited-asset", {
        sourceImageId: sourceImageId || undefined,
        category: selectedCategory || undefined,
        subcategory: selectedSubCategory || undefined,
        subsubcategory: selectedSubSubCategory || undefined,
        imageUrl: imageKitUpload.url,
        title: `Edited - ${params.get("title") || localFileName || "Elvify Asset"}`,
        editConfig: {
          ...editValues,
          textLayers,
          editorEngine: useFabricEditor ? "fabric" : "dom-canvas",
          fabricJson:
            useFabricEditor && fabricCanvas
              ? fabricCanvas.toJSON(FABRIC_EDITABLE_TEXT_CUSTOM_PROPS)
              : null,
          editableTextLayers: editableTextLayerOverrides,
          templateMeta: mergedTemplateMeta,
          aiBgRemove: {
            enabled: aiBgEnabled,
            replaceBg: aiBgReplace,
            bgColor: aiBgColor,
          },
          canvasView: {
            workspaceBgColor,
            pageBgColor,
            zoomPct: canvasViewZoom,
            pageSize: {
              width: Number(pageCoordinateSize?.width || 0),
              height: Number(pageCoordinateSize?.height || 0),
            },
          },
          format: exportFormat,
          quality: exportQuality,
          previewMode: canUseImageKitTransforms ? "imagekit-tr" : "canvas",
        },
        fileMetadata: {
          mimeType: imageKitUpload.fileType || exportFormat,
          fileSize: Number(imageKitUpload.size || blob.size),
        },
      });

      setNotice("Edited asset saved to Elvify successfully.");
      setHistoryRefreshKey((v) => v + 1);
    } catch (err) {
      if (err?.response?.status === 401) {
        setNotice("Please login to save edited assets to Elvify.");
      } else {
        setNotice(err?.response?.data?.message || err?.message || "Failed to save edited asset.");
      }
    } finally {
      setUploading(false);
    }
  };

  const rollbackVersion = async (targetVersionId) => {
    if (!sourceImageId || !targetVersionId) return;
    setRollingBack(true);
    setRollingBackVersionId(targetVersionId);
    setNotice("");
    try {
      await api.post("/imagekit/rollback-version", {
        originalImageId: sourceImageId,
        targetVersionId,
      });
      setNotice("Rollback applied successfully.");
      setHistoryRefreshKey((v) => v + 1);
      const rolledBackVersion = editHistory.find((item) => item?._id === targetVersionId);
      if (rolledBackVersion?.imageUrl) {
        setSource(rolledBackVersion.imageUrl);
        setSourceInput(rolledBackVersion.imageUrl);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setNotice("Please login to use rollback history.");
      } else {
        setNotice(err?.response?.data?.message || err?.message || "Failed to rollback version.");
      }
    } finally {
      setRollingBack(false);
      setRollingBackVersionId(null);
    }
  };

  const handlePreviewImageError = (event) => {
    setPreviewLoading(false);
    const attemptedUrl =
      event?.currentTarget?.currentSrc ||
      event?.currentTarget?.src ||
      (showOriginal ? originalPreviewSrc : previewSrc);

    const normalized = stripCacheBuster(attemptedUrl);
    if (!isHttpUrl(normalized)) {
      setNotice("Failed to load image source.");
      return;
    }

    // Retry once for this URL with a cache-busting query param.
    if (!retryKeyByUrl[normalized]) {
      setRetryKeyByUrl((prev) => ({ ...prev, [normalized]: Date.now() }));
      setNotice("Retrying image load...");
      return;
    }

    setNotice("Failed to load image source.");
  };

  const handleToolSelect = (tool) => {
    if (!tool?.implemented) {
      setNotice(`${tool?.label || "This tool"} is planned for Phase ${tool?.phase || "next"}.`);
      return;
    }
    setActiveTool(tool.id);
  };

  return (
    <>
      <div className="design-studio">
        <header className="design-studio__topbar">
          <Link className="design-studio__brand design-studio__brand-link" to="/" aria-label="Go to Elvify homepage">
            <span className="design-studio__logo" title="Go to homepage">
              <FiHome size={20} aria-hidden="true" />
            </span>
            <div>
              <h1>Elvify Design Studio</h1>
              <p>Edit images with professional controls</p>
            </div>
          </Link>
          <div className="design-studio__top-actions">
            <button className="ghost-btn" onClick={undoEditorChange} disabled={!canUndo}>
              Undo
            </button>
            <button className="ghost-btn" onClick={redoEditorChange} disabled={!canRedo}>
              Redo
            </button>
            <button className="ghost-btn" onClick={resetAll}>
              Reset
            </button>
            <button className="ghost-btn" onMouseDown={() => setShowOriginal(true)} onMouseUp={() => setShowOriginal(false)} onMouseLeave={() => setShowOriginal(false)}>
              Compare
            </button>
            <button className="ghost-btn" onClick={saveEditedToElvify} disabled={uploading || saving}>
              {uploading ? "Saving..." : "Save to Elvify"}
            </button>
            <button className="primary-btn" onClick={exportImage} disabled={saving || uploading}>
              {saving ? "Exporting..." : "Export"}
            </button>
          </div>
        </header>

        <main className="design-studio__layout">
          <aside className="design-studio__sidebar">
            <h2>Tools</h2>
            {TOOL_ITEMS.map((tool) => (
              <button
                key={tool.id}
                className={`${activeTool === tool.id ? "tool-btn active" : "tool-btn"}${!tool.implemented ? " tool-btn--locked" : ""}`}
                onClick={() => handleToolSelect(tool)}
                title={tool.implemented ? tool.label : `${tool.label} - planned for Phase ${tool.phase}`}
              >
                <span>{tool.label}</span>
                {!tool.implemented ? <span className="tool-phase-badge">P{tool.phase}</span> : null}
              </button>
            ))}
            <p className="studio-hint">Phase 2 alpha live: Text, Elements, Templates, and layer history foundation.</p>
            <div className="source-panel">
              <h3>Source</h3>
              <label>Asset URL</label>
              <input
                type="text"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                placeholder="Paste image URL"
              />
              <button className="ghost-btn" onClick={loadFromInputUrl}>
                Load URL
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                style={{ display: "none" }}
              />
              <button className="ghost-btn" onClick={() => fileInputRef.current?.click()}>
              Upload from Device
            </button>
            <div className="taxonomy-panel">
              <h4>Save Category</h4>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Select category</option>
                {categoryTree.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedSubCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!selectedCategoryNode?.children?.length}
              >
                <option value="">Select subcategory</option>
                {(selectedCategoryNode?.children || []).map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedSubSubCategory}
                onChange={(e) => setSelectedSubSubCategory(e.target.value)}
                disabled={!selectedSubCategoryNode?.children?.length}
              >
                <option value="">Select sub-subcategory</option>
                {(selectedSubCategoryNode?.children || []).map((subsub) => (
                  <option key={subsub._id} value={subsub._id}>
                    {subsub.name}
                  </option>
                ))}
              </select>
            </div>
            {sourceImageId ? (
              <div className="taxonomy-panel">
                <h4>Edit History</h4>
                {sortedEditHistory.length ? (
                  <div className="history-list">
                    {originalAssetUrl ? (
                      <>
                        <h5 className="history-group-title">Original Asset</h5>
                        <article
                          className={`history-card history-card--original${isViewingOriginal ? " is-selected" : ""}`}
                          title="Original uploaded asset"
                        >
                          <button
                            type="button"
                            className="history-thumb-btn"
                            onClick={() => {
                              setSource(originalAssetUrl);
                              setSourceInput(originalAssetUrl);
                            }}
                          >
                            <img
                              src={originalAssetUrl}
                              alt="Original asset preview"
                              className="history-thumb"
                              loading="lazy"
                            />
                          </button>

                          <div className="history-meta">
                            <div className="history-meta-top">
                              <strong>Original</strong>
                              {isViewingOriginal ? <span className="history-badge">Viewing</span> : null}
                            </div>
                            <p>Base uploaded asset</p>
                          </div>

                          <div className="history-actions">
                            <button
                              type="button"
                              className="ghost-btn"
                              onClick={() => {
                                setSource(originalAssetUrl);
                                setSourceInput(originalAssetUrl);
                              }}
                              disabled={isViewingOriginal}
                            >
                              Use Original
                            </button>
                            <button
                              type="button"
                              className="ghost-btn"
                              onClick={resetAll}
                            >
                              Reset Edits
                            </button>
                          </div>
                        </article>
                      </>
                    ) : null}
                    <h5 className="history-group-title">Edited Assets</h5>
                    {sortedEditHistory.map((version, index) => {
                      const isCurrent = Boolean(version?.isCurrentVersion);
                      const isRollingThis = rollingBackVersionId && rollingBackVersionId === version?._id;
                      const isViewingVersion =
                        normalizeComparableUrl(source) === normalizeComparableUrl(version?.imageUrl);
                      const resolvedVersion = Number.isFinite(Number(version?.versionNumber))
                        ? Number(version.versionNumber)
                        : sortedEditHistory.length - index;
                      const versionLabel = `v${resolvedVersion}`;
                      return (
                        <article
                          key={version?._id}
                          className={`history-card${isViewingVersion ? " is-selected" : ""}`}
                          title={isCurrent ? "Current version" : "Edited version"}
                        >
                          <button
                            type="button"
                            className="history-thumb-btn"
                            onClick={() => {
                              if (version?.imageUrl) {
                                setSource(version.imageUrl);
                                setSourceInput(version.imageUrl);
                              }
                            }}
                          >
                            {version?.imageUrl ? (
                              <img
                                src={version.imageUrl}
                                alt={`${versionLabel} preview`}
                                className="history-thumb"
                                loading="lazy"
                              />
                            ) : (
                              <div className="history-thumb history-thumb--empty">No preview</div>
                            )}
                          </button>

                          <div className="history-meta">
                            <div className="history-meta-top">
                              <strong>{versionLabel}</strong>
                              {isViewingVersion ? (
                                <span className="history-badge">Viewing</span>
                              ) : isCurrent ? (
                                <span className="history-badge history-badge--muted">Current</span>
                              ) : null}
                            </div>
                            <p>{formatHistoryDate(version?.createdAt)}</p>
                          </div>

                          <div className="history-actions">
                            <button
                              type="button"
                              className="ghost-btn"
                              onClick={() => {
                                if (version?.imageUrl) {
                                  setSource(version.imageUrl);
                                  setSourceInput(version.imageUrl);
                                }
                              }}
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              className="ghost-btn"
                              onClick={() => rollbackVersion(version?._id)}
                              disabled={rollingBack || isCurrent}
                            >
                              {isRollingThis ? "Applying..." : "Rollback"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="studio-hint">No edited versions yet.</p>
                )}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="design-studio__canvas-area">
          <div
            className="canvas-shell"
            ref={canvasShellRef}
            onClick={() => setSelectedTextLayerId(null)}
            style={{ backgroundColor: workspaceBgColor }}
          >
            <div
              className="canvas-page"
              ref={canvasPageRef}
              style={{
                width: `${canvasPagePixelSize.width}px`,
                height: `${canvasPagePixelSize.height}px`,
                backgroundColor: pageBgColor,
              }}
            >
              <canvas
                ref={setFabricCanvasNode}
                className={`fabric-template-canvas${useFabricEditor ? "" : " fabric-template-canvas--hidden"}`}
              />
              {!useFabricEditor ? (
                source ? (
                  <>
                    {previewLoading ? (
                      <div className="canvas-loading-overlay" aria-live="polite" aria-busy="true">
                        <CircularProgress size={42} thickness={4.5} />
                      </div>
                    ) : null}
                    <img
                      ref={imageRef}
                      src={displayPreviewSrc}
                      alt="Editor preview"
                      className="canvas-image"
                      style={{
                        filter: computedFilter,
                        transform: computedTransform,
                        ...cropStyle,
                        opacity: previewLoading ? 0 : 1,
                      }}
                      crossOrigin="anonymous"
                      onLoad={(event) => {
                        const imgEl = event.currentTarget;
                        setPreviewLoading(false);
                        setPreviewImageSize({
                          width: Number(imgEl?.naturalWidth || 0),
                          height: Number(imgEl?.naturalHeight || 0),
                        });
                      }}
                      onError={handlePreviewImageError}
                    />
                    {textLayers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`canvas-text-layer${selectedTextLayerId === layer.id ? " is-selected" : ""}`}
                        style={{
                          left: `${layer.x}%`,
                          top: `${layer.y}%`,
                          fontSize: `${layer.fontSize}px`,
                          fontFamily: layer.fontFamily || "Segoe UI",
                          fontStyle: layer.fontStyle || "normal",
                          color: layer.color,
                          fontWeight: Number(layer.fontWeight) || 700,
                          textAlign: layer.textAlign || "center",
                          opacity: clamp(layer.opacity, 0, 100) / 100,
                          transform: `translate(-50%, -50%) rotate(${Number(layer.rotate || 0)}deg)`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextLayerId(layer.id);
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setSelectedTextLayerId(layer.id);
                          dragStateRef.current = {
                            mode: "move",
                            layerId: layer.id,
                            startClientX: e.clientX,
                            startClientY: e.clientY,
                            startX: Number(layer.x || 50),
                            startY: Number(layer.y || 50),
                            moved: false,
                          };
                        }}
                        title={layer.name}
                      >
                        {layer.text || "Text"}
                        {selectedTextLayerId === layer.id ? (
                          <>
                            <button
                              type="button"
                              className="text-handle text-handle--resize"
                              title="Resize text"
                              aria-label="Resize text"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                const page = canvasPageRef.current;
                                if (!page) return;
                                const rect = page.getBoundingClientRect();
                                const centerX = rect.left + (Number(layer.x || 50) / 100) * rect.width;
                                const centerY = rect.top + (Number(layer.y || 50) / 100) * rect.height;
                                const dx = e.clientX - centerX;
                                const dy = e.clientY - centerY;
                                dragStateRef.current = {
                                  mode: "resize",
                                  layerId: layer.id,
                                  centerX,
                                  centerY,
                                  startDistance: Math.sqrt(dx * dx + dy * dy),
                                  startFontSize: Number(layer.fontSize || 42),
                                  moved: false,
                                };
                              }}
                            >
                              <FiMaximize2 size={12} />
                            </button>
                            <button
                              type="button"
                              className="text-handle text-handle--rotate"
                              title="Rotate text"
                              aria-label="Rotate text"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                const page = canvasPageRef.current;
                                if (!page) return;
                                const rect = page.getBoundingClientRect();
                                const centerX = rect.left + (Number(layer.x || 50) / 100) * rect.width;
                                const centerY = rect.top + (Number(layer.y || 50) / 100) * rect.height;
                                const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                                dragStateRef.current = {
                                  mode: "rotate",
                                  layerId: layer.id,
                                  centerX,
                                  centerY,
                                  startAngle,
                                  startRotate: Number(layer.rotate || 0),
                                  moved: false,
                                };
                              }}
                            >
                              <FiRotateCw size={12} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    ))}
                    {activeTool === "transform" ? (
                      <div className="crop-overlay" aria-hidden="true">
                        <div
                          className="crop-box"
                          style={{
                            left: `${clamp(editValues.cropX, 0, 99)}%`,
                            top: `${clamp(editValues.cropY, 0, 99)}%`,
                            width: `${Math.min(clamp(editValues.cropW, 1, 100), 100 - clamp(editValues.cropX, 0, 99))}%`,
                            height: `${Math.min(clamp(editValues.cropH, 1, 100), 100 - clamp(editValues.cropY, 0, 99))}%`,
                          }}
                          onPointerDown={(e) => beginCropDrag("move", e)}
                        >
                          <div
                            className="crop-handle crop-handle--tl"
                            onPointerDown={(e) => beginCropDrag("resize-tl", e)}
                          />
                          <div
                            className="crop-handle crop-handle--tr"
                            onPointerDown={(e) => beginCropDrag("resize-tr", e)}
                          />
                          <div
                            className="crop-handle crop-handle--bl"
                            onPointerDown={(e) => beginCropDrag("resize-bl", e)}
                          />
                          <div
                            className="crop-handle crop-handle--br"
                            onPointerDown={(e) => beginCropDrag("resize-br", e)}
                          />
                          <div
                            className="crop-edge crop-edge--t"
                            onPointerDown={(e) => beginCropDrag("resize-t", e)}
                          />
                          <div
                            className="crop-edge crop-edge--r"
                            onPointerDown={(e) => beginCropDrag("resize-r", e)}
                          />
                          <div
                            className="crop-edge crop-edge--b"
                            onPointerDown={(e) => beginCropDrag("resize-b", e)}
                          />
                          <div
                            className="crop-edge crop-edge--l"
                            onPointerDown={(e) => beginCropDrag("resize-l", e)}
                          />
                          <div className="crop-badge">{cropAspectMode === "free" ? "Free crop" : `Aspect ${cropAspectMode}`}</div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  null
                )
              ) : null}
            </div>
          </div>
          {!canUseImageKitTransforms ? (
            <p className="studio-hint">
              {imageKitEndpoint
                ? "Preview is using browser filters. Load an ImageKit asset URL to enable real-time `tr:` transformations."
                : "Preview is using browser filters. Add `VITE_IMAGEKIT_URL_ENDPOINT` and open an ImageKit asset URL to use real-time `tr:` transformations."}
            </p>
          ) : (
            <p className="studio-hint">
              Live preview uses ImageKit URL transformations (`tr:`).
            </p>
          )}
          {notice ? <p className="studio-notice">{notice}</p> : null}
        </section>

        <aside className="design-studio__properties">
          <h2>Properties</h2>

          {activeTool === "adjust" && (
            <div className="control-group">
              <Control label="Brightness" value={editValues.brightness} min={50} max={150} onChange={(v) => updateValue("brightness", v)} />
              <Control label="Contrast" value={editValues.contrast} min={50} max={150} onChange={(v) => updateValue("contrast", v)} />
              <Control label="Saturation" value={editValues.saturation} min={0} max={180} onChange={(v) => updateValue("saturation", v)} />
              <Control label="Blur" value={editValues.blur} min={0} max={12} onChange={(v) => updateValue("blur", v)} />
              <Control label="Grayscale" value={editValues.grayscale} min={0} max={100} onChange={(v) => updateValue("grayscale", v)} />
              <Control label="Sepia" value={editValues.sepia} min={0} max={100} onChange={(v) => updateValue("sepia", v)} />
            </div>
          )}

          {activeTool === "transform" && (
            <div className="control-group">
              <Control label="Rotate" value={editValues.rotate} min={-180} max={180} onChange={(v) => updateValue("rotate", v)} />
              <Control label="Zoom" value={editValues.zoom} min={30} max={200} onChange={(v) => updateValue("zoom", v)} />
              <div className="resize-grid">
                <label>
                  Resize Width (px)
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    max="5000"
                    value={editValues.resizeWidth}
                    onChange={(e) => updateValue("resizeWidth", e.target.value)}
                    placeholder="auto"
                  />
                </label>
                <label>
                  Resize Height (px)
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    max="5000"
                    value={editValues.resizeHeight}
                    onChange={(e) => updateValue("resizeHeight", e.target.value)}
                    placeholder="auto"
                  />
                </label>
              </div>
              <div className="crop-panel">
                <div className="crop-presets">
                  <button className="ghost-btn" onClick={() => applyCropAspect("free")}>Free</button>
                  <button className="ghost-btn" onClick={() => applyCropAspect("1:1")}>1:1</button>
                  <button className="ghost-btn" onClick={() => applyCropAspect("16:9")}>16:9</button>
                  <button className="ghost-btn" onClick={() => applyCropAspect("4:5")}>4:5</button>
                </div>
                <Control label="Crop X (%)" value={editValues.cropX} min={0} max={99} onChange={(v) => updateValue("cropX", v)} />
                <Control label="Crop Y (%)" value={editValues.cropY} min={0} max={99} onChange={(v) => updateValue("cropY", v)} />
                <Control label="Crop Width (%)" value={editValues.cropW} min={1} max={100} onChange={(v) => updateValue("cropW", v)} />
                <Control label="Crop Height (%)" value={editValues.cropH} min={1} max={100} onChange={(v) => updateValue("cropH", v)} />
              </div>
              <div className="flip-controls">
                <button
                  className={editValues.flipX ? "ghost-btn active" : "ghost-btn"}
                  onClick={() => updateValue("flipX", !editValues.flipX)}
                >
                  Flip Horizontal
                </button>
                <button
                  className={editValues.flipY ? "ghost-btn active" : "ghost-btn"}
                  onClick={() => updateValue("flipY", !editValues.flipY)}
                >
                  Flip Vertical
                </button>
              </div>
            </div>
          )}

          {activeTool === "presets" && (
            <div className="preset-grid">
              {FILTER_PRESETS.map((preset) => (
                <button key={preset.id} className="preset-card" onClick={() => applyPreset(preset)}>
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {activeTool === "elements" && (
            <div className="control-group">
              <h3>Add shapes</h3>
              <div className="shape-grid">
                {SHAPE_ITEMS.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    className="ghost-btn"
                    onClick={() => addShapeToCanvas(shape.id)}
                  >
                    {shape.label}
                  </button>
                ))}
              </div>

              {useFabricEditor ? (
                fabricSelectionState ? (
                  <>
                    <h3>Selected object</h3>
                    <p className="studio-hint">
                      {fabricSelectionState.count > 1
                        ? `${fabricSelectionState.count} objects selected`
                        : `Type: ${fabricSelectionState.typeLabel}`}
                    </p>

                    {fabricSelectionState.hasFill ? (
                      <label>
                        Fill
                        <div className="studio-color-picker">
                          <span
                            className="studio-color-picker__swatch"
                            style={{ backgroundColor: fabricSelectionState.fillHex || "#000000" }}
                            aria-hidden="true"
                          />
                          <input
                            className="studio-color-picker__input"
                            type="color"
                            value={fabricSelectionState.fillHex || "#000000"}
                            onChange={(e) => updateSelectedFabricFill(e.target.value)}
                            aria-label="Selected object fill color"
                          />
                          <span className="studio-color-picker__value">
                            {(fabricSelectionState.fillHex || "#000000").toUpperCase()}
                          </span>
                        </div>
                      </label>
                    ) : null}

                    {fabricSelectionState.hasStroke ? (
                      <>
                        <label>
                          Stroke
                          <div className="studio-color-picker">
                            <span
                              className="studio-color-picker__swatch"
                              style={{ backgroundColor: fabricSelectionState.strokeHex || "#000000" }}
                              aria-hidden="true"
                            />
                            <input
                              className="studio-color-picker__input"
                              type="color"
                              value={fabricSelectionState.strokeHex || "#000000"}
                              onChange={(e) => updateSelectedFabricStroke(e.target.value)}
                              aria-label="Selected object stroke color"
                            />
                            <span className="studio-color-picker__value">
                              {(fabricSelectionState.strokeHex || "#000000").toUpperCase()}
                            </span>
                          </div>
                        </label>
                        <Control
                          label="Stroke Width"
                          value={fabricSelectionState.strokeWidth}
                          min={0}
                          max={48}
                          onChange={updateSelectedFabricStrokeWidth}
                        />
                      </>
                    ) : null}

                    <Control
                      label="Opacity"
                      value={fabricSelectionState.opacity}
                      min={0}
                      max={100}
                      onChange={updateSelectedFabricOpacity}
                    />

                    {fabricSelectionState.canEditCornerRadius ? (
                      <Control
                        label="Corner Radius"
                        value={fabricSelectionState.cornerRadius}
                        min={0}
                        max={240}
                        onChange={updateSelectedFabricCornerRadius}
                      />
                    ) : null}

                    <div className="text-tool-actions">
                      <button
                        className="ghost-btn"
                        onClick={() => moveSelectedFabricObjects("up")}
                      >
                        Layer Up
                      </button>
                      <button
                        className="ghost-btn"
                        onClick={() => moveSelectedFabricObjects("down")}
                      >
                        Layer Down
                      </button>
                    </div>

                    <button className="ghost-btn" onClick={removeSelectedFabricObjects}>
                      Delete selected object
                    </button>
                  </>
                ) : (
                  <p className="studio-hint">Select a shape on canvas to edit it.</p>
                )
              ) : (
                <p className="studio-hint">Click any shape above to start editing in Fabric mode.</p>
              )}
            </div>
          )}

          {activeTool === "text" && (
            <div className="control-group">
              {useFabricEditor ? (
                <>
                  <div className="text-tool-actions">
                    <button className="ghost-btn" onClick={addTextLayer}>New text</button>
                    <button
                      className="ghost-btn"
                      onClick={addTextOnSelectedShape}
                      disabled={!fabricSelectionState?.hasNonTextSelection}
                    >
                      Add text on shape
                    </button>
                  </div>
                  <div className="text-tool-actions">
                    <button
                      className="ghost-btn"
                      onClick={() => moveSelectedTextLayer("up")}
                      disabled={!fabricSelectionState}
                    >
                      Layer Up
                    </button>
                    <button
                      className="ghost-btn"
                      onClick={() => moveSelectedTextLayer("down")}
                      disabled={!fabricSelectionState}
                    >
                      Layer Down
                    </button>
                  </div>
                  <button className="ghost-btn" onClick={removeSelectedTextLayer} disabled={!fabricSelectionState}>
                    Delete selected
                  </button>

                  {fabricEditableTextItems.length ? (
                    <div className="text-layer-list">
                      {fabricEditableTextItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`text-layer-item${
                            fabricSelectionState?.editableTextId === item.id ? " active" : ""
                          }`}
                          onClick={() => focusEditableTextLayer(item.id)}
                          title={item.textPreview}
                        >
                          <span
                            className="text-layer-item__name"
                            style={{ fontFamily: `"${item.fontFamily}", "Segoe UI", sans-serif` }}
                          >
                            {item.name}
                          </span>
                          <span className="text-layer-item__preview">{item.textPreview}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="studio-hint">No Fabric text layer yet. Click New text.</p>
                  )}

                  {fabricSelectionState?.canEditText ? (
                    <>
                      <label>
                        Text
                        <textarea
                          className="form-control"
                          rows={3}
                          value={fabricSelectionState.text}
                          onChange={(e) => updateSelectedFabricTextValue(e.target.value)}
                          placeholder="Edit selected text"
                        />
                      </label>
                      <Control
                        label="Font Size"
                        value={fabricSelectionState.fontSize}
                        min={6}
                        max={360}
                        onChange={updateSelectedFabricFontSize}
                      />
                      <label>
                        Font Family
                        <select
                          value={fabricSelectionState.fontFamily || "Segoe UI"}
                          onChange={(e) => updateSelectedFabricFontFamily(e.target.value)}
                        >
                          {fabricFontFamilies.map((font) => (
                            <option
                              key={font}
                              value={font}
                              style={{ fontFamily: `"${font}", "Segoe UI", sans-serif` }}
                            >
                              {font}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div>
                        <span className="studio-hint">Typography presets</span>
                        <div className="typography-preset-grid">
                          {typographyPresets.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              className="ghost-btn"
                              onClick={() => applyTypographyPresetToFabricText(preset.id)}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="font-style-actions">
                        <button
                          className={Number(fabricSelectionState.fontWeight) >= 700 ? "ghost-btn active" : "ghost-btn"}
                          onClick={() =>
                            updateSelectedFabricFontWeight(
                              Number(fabricSelectionState.fontWeight) >= 700 ? 400 : 700
                            )
                          }
                        >
                          Bold
                        </button>
                        <button
                          className={fabricSelectionState.fontStyle === "italic" ? "ghost-btn active" : "ghost-btn"}
                          onClick={() =>
                            updateSelectedFabricFontStyle(
                              fabricSelectionState.fontStyle === "italic" ? "normal" : "italic"
                            )
                          }
                        >
                          Italic
                        </button>
                      </div>
                      <label>
                        Color
                        <div className="studio-color-picker">
                          <span
                            className="studio-color-picker__swatch"
                            style={{ backgroundColor: fabricSelectionState.fillHex || "#111111" }}
                            aria-hidden="true"
                          />
                          <input
                            className="studio-color-picker__input"
                            type="color"
                            value={fabricSelectionState.fillHex || "#111111"}
                            onChange={(e) => updateSelectedFabricFill(e.target.value)}
                            aria-label="Selected text color"
                          />
                          <span className="studio-color-picker__value">
                            {(fabricSelectionState.fillHex || "#111111").toUpperCase()}
                          </span>
                        </div>
                      </label>
                      <label>
                        Alignment
                        <select
                          value={fabricSelectionState.textAlign || "left"}
                          onChange={(e) => updateSelectedFabricTextAlign(e.target.value)}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                    </>
                  ) : (
                    <p className="studio-hint">
                      Select a text object to edit content and typography.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-tool-actions">
                    <button className="ghost-btn" onClick={addTextLayer}>New text</button>
                    <button className="ghost-btn" onClick={removeSelectedTextLayer} disabled={!selectedTextLayerId}>
                      Delete selected
                    </button>
                  </div>
                  <div className="text-tool-actions">
                    <button className="ghost-btn" onClick={() => moveSelectedTextLayer("up")} disabled={!selectedTextLayerId}>
                      Layer Up
                    </button>
                    <button className="ghost-btn" onClick={() => moveSelectedTextLayer("down")} disabled={!selectedTextLayerId}>
                      Layer Down
                    </button>
                  </div>

                  {textLayers.length ? (
                    <div className="text-layer-list">
                      {textLayers.map((layer) => (
                        <button
                          key={layer.id}
                          className={`text-layer-item${selectedTextLayerId === layer.id ? " active" : ""}`}
                          onClick={() => setSelectedTextLayerId(layer.id)}
                        >
                          {layer.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="studio-hint">No text layer yet. Click New text.</p>
                  )}

                  {selectedTextLayer ? (
                    <>
                      <label>
                        Text
                        <input
                          className="form-control"
                          type="text"
                          value={selectedTextLayer.text}
                          onChange={(e) => updateSelectedTextLayer({ text: e.target.value })}
                        />
                      </label>
                      <Control
                        label="Font Size"
                        value={selectedTextLayer.fontSize}
                        min={10}
                        max={160}
                        onChange={(v) => updateSelectedTextLayer({ fontSize: v })}
                      />
                      <label>
                        Font Family
                        <select
                          value={selectedTextLayer.fontFamily || "Segoe UI"}
                          onChange={(e) => updateSelectedTextLayer({ fontFamily: e.target.value })}
                        >
                          {FONT_FAMILIES.map((font) => (
                            <option key={font} value={font} style={{ fontFamily: `"${font}", "Segoe UI", sans-serif` }}>
                              {font}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div>
                        <span className="studio-hint">Typography presets</span>
                        <div className="typography-preset-grid">
                          {typographyPresets.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              className="ghost-btn"
                              onClick={() => applyTypographyPresetToTextLayer(preset.id)}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="font-style-actions">
                        <button
                          className={Number(selectedTextLayer.fontWeight) >= 700 ? "ghost-btn active" : "ghost-btn"}
                          onClick={() =>
                            updateSelectedTextLayer({
                              fontWeight: Number(selectedTextLayer.fontWeight) >= 700 ? 400 : 700,
                            })
                          }
                        >
                          Bold
                        </button>
                        <button
                          className={selectedTextLayer.fontStyle === "italic" ? "ghost-btn active" : "ghost-btn"}
                          onClick={() =>
                            updateSelectedTextLayer({
                              fontStyle: selectedTextLayer.fontStyle === "italic" ? "normal" : "italic",
                            })
                          }
                        >
                          Italic
                        </button>
                      </div>
                      <Control
                        label="Position X (%)"
                        value={selectedTextLayer.x}
                        min={0}
                        max={100}
                        onChange={(v) => updateSelectedTextLayer({ x: v })}
                      />
                      <Control
                        label="Position Y (%)"
                        value={selectedTextLayer.y}
                        min={0}
                        max={100}
                        onChange={(v) => updateSelectedTextLayer({ y: v })}
                      />
                      <Control
                        label="Opacity"
                        value={selectedTextLayer.opacity}
                        min={0}
                        max={100}
                        onChange={(v) => updateSelectedTextLayer({ opacity: v })}
                      />
                      <Control
                        label="Rotate"
                        value={selectedTextLayer.rotate || 0}
                        min={-180}
                        max={180}
                        onChange={(v) => updateSelectedTextLayer({ rotate: v })}
                      />
                      <label>
                        Color
                        <div className="studio-color-picker">
                          <span
                            className="studio-color-picker__swatch"
                            style={{ backgroundColor: selectedTextLayer.color || "#ffffff" }}
                            aria-hidden="true"
                          />
                          <input
                            className="studio-color-picker__input"
                            type="color"
                            value={selectedTextLayer.color}
                            onChange={(e) => updateSelectedTextLayer({ color: e.target.value })}
                            aria-label="Text color"
                          />
                          <span className="studio-color-picker__value">
                            {(selectedTextLayer.color || "#FFFFFF").toUpperCase()}
                          </span>
                        </div>
                      </label>
                      <label>
                        Alignment
                        <select
                          value={selectedTextLayer.textAlign}
                          onChange={(e) => updateSelectedTextLayer({ textAlign: e.target.value })}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                    </>
                  ) : null}
                </>
              )}
            </div>
          )}

          {activeTool === "templates" && (
            <div className="control-group">
              {useFabricEditor ? (
                <>
                  {fabricEditableTextItems.length ? (
                    <>
                      <h3>Editable text layers</h3>
                      <div className="text-layer-list">
                        {fabricEditableTextItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`text-layer-item${
                              fabricSelectionState?.editableTextId === item.id ? " active" : ""
                            }`}
                            onClick={() => focusEditableTextLayer(item.id)}
                            title={item.textPreview}
                          >
                            <span
                              className="text-layer-item__name"
                              style={{ fontFamily: `"${item.fontFamily}", "Segoe UI", sans-serif` }}
                            >
                              {item.name}
                            </span>
                            <span className="text-layer-item__preview">{item.textPreview}</span>
                          </button>
                        ))}
                      </div>
                      <hr />
                    </>
                  ) : null}

                  <h3>Selected object</h3>
                  {fabricSelectionState ? (
                    <>
                      <p className="studio-hint">
                        {fabricSelectionState.count > 1
                          ? `${fabricSelectionState.count} objects selected`
                          : `Type: ${fabricSelectionState.typeLabel}`}
                      </p>

                      {fabricSelectionState.hasFill ? (
                        <label>
                          Fill
                          <div className="studio-color-picker">
                            <span
                              className="studio-color-picker__swatch"
                              style={{ backgroundColor: fabricSelectionState.fillHex || "#000000" }}
                              aria-hidden="true"
                            />
                            <input
                              className="studio-color-picker__input"
                              type="color"
                              value={fabricSelectionState.fillHex || "#000000"}
                              onChange={(e) => updateSelectedFabricFill(e.target.value)}
                              aria-label="Selected object fill color"
                            />
                            <span className="studio-color-picker__value">
                              {(fabricSelectionState.fillHex || "#000000").toUpperCase()}
                            </span>
                          </div>
                        </label>
                      ) : null}

                      {fabricSelectionState.hasStroke ? (
                        <>
                          <label>
                            Stroke
                            <div className="studio-color-picker">
                              <span
                                className="studio-color-picker__swatch"
                                style={{ backgroundColor: fabricSelectionState.strokeHex || "#000000" }}
                                aria-hidden="true"
                              />
                              <input
                                className="studio-color-picker__input"
                                type="color"
                                value={fabricSelectionState.strokeHex || "#000000"}
                                onChange={(e) => updateSelectedFabricStroke(e.target.value)}
                                aria-label="Selected object stroke color"
                              />
                              <span className="studio-color-picker__value">
                                {(fabricSelectionState.strokeHex || "#000000").toUpperCase()}
                              </span>
                            </div>
                          </label>
                          <Control
                            label="Stroke Width"
                            value={fabricSelectionState.strokeWidth}
                            min={0}
                            max={48}
                            onChange={updateSelectedFabricStrokeWidth}
                          />
                        </>
                      ) : null}

                      <Control
                        label="Opacity"
                        value={fabricSelectionState.opacity}
                        min={0}
                        max={100}
                        onChange={updateSelectedFabricOpacity}
                      />

                      {fabricSelectionState.canEditText ? (
                        <>
                          <label>
                            Text
                            <textarea
                              className="form-control"
                              rows={3}
                              value={fabricSelectionState.text}
                              onChange={(e) => updateSelectedFabricTextValue(e.target.value)}
                              placeholder="Edit selected text"
                            />
                          </label>
                          <Control
                            label="Font Size"
                            value={fabricSelectionState.fontSize}
                            min={6}
                            max={360}
                            onChange={updateSelectedFabricFontSize}
                          />
                          <label>
                            Font Family
                            <select
                              value={fabricSelectionState.fontFamily || "Segoe UI"}
                              onChange={(e) => updateSelectedFabricFontFamily(e.target.value)}
                            >
                              {fabricFontFamilies.map((font) => (
                                <option
                                  key={font}
                                  value={font}
                                  style={{ fontFamily: `"${font}", "Segoe UI", sans-serif` }}
                                >
                                  {font}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div>
                            <span className="studio-hint">Typography presets</span>
                            <div className="typography-preset-grid">
                              {typographyPresets.map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  className="ghost-btn"
                                  onClick={() => applyTypographyPresetToFabricText(preset.id)}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="font-style-actions">
                            <button
                              className={Number(fabricSelectionState.fontWeight) >= 700 ? "ghost-btn active" : "ghost-btn"}
                              onClick={() =>
                                updateSelectedFabricFontWeight(
                                  Number(fabricSelectionState.fontWeight) >= 700 ? 400 : 700
                                )
                              }
                            >
                              Bold
                            </button>
                            <button
                              className={fabricSelectionState.fontStyle === "italic" ? "ghost-btn active" : "ghost-btn"}
                              onClick={() =>
                                updateSelectedFabricFontStyle(
                                  fabricSelectionState.fontStyle === "italic" ? "normal" : "italic"
                                )
                              }
                            >
                              Italic
                            </button>
                          </div>
                          <label>
                            Alignment
                            <select
                              value={fabricSelectionState.textAlign || "left"}
                              onChange={(e) => updateSelectedFabricTextAlign(e.target.value)}
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </label>
                        </>
                      ) : (
                        <p className="studio-hint">
                          Text content is editable only when the selected object is real text.
                        </p>
                      )}

                      <div className="text-tool-actions">
                        <button
                          className="ghost-btn"
                          onClick={removeSelectedTemplateObjects}
                          disabled={!fabricSelectionState.templateObjectCount}
                        >
                          Delete selected template object
                        </button>
                        <button className="ghost-btn" onClick={removeAllBuiltInTemplateTextObjects}>
                          Delete all built-in text
                        </button>
                      </div>
                      <button className="ghost-btn" onClick={removeSelectedFabricObjects}>
                        Delete selected object
                      </button>
                    </>
                  ) : (
                    <p className="studio-hint">Select an object on canvas to edit fill, stroke, or text.</p>
                  )}
                  <hr />
                </>
              ) : null}

              <label>
                Search templates
                <input
                  className="form-control"
                  type="text"
                  placeholder="Search by title, tag, category..."
                  value={templateSearchInput}
                  onChange={(e) => setTemplateSearchInput(e.target.value)}
                />
              </label>
              <label>
                Type
                <select
                  value={templateTypeFilter}
                  onChange={(e) => setTemplateTypeFilter(e.target.value)}
                >
                  <option value="all">All types</option>
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                </select>
              </label>
              <div className="template-category-chips">
                <button
                  className={`template-chip${!templateCategoryFilter ? " active" : ""}`}
                  onClick={() => setTemplateCategoryFilter("")}
                >
                  All
                </button>
                {templateCategories.map((category) => (
                  <button
                    key={category}
                    className={`template-chip${templateCategoryFilter === category ? " active" : ""}`}
                    onClick={() => setTemplateCategoryFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {templatesQuery.isLoading ? (
                <p className="studio-hint">Loading templates...</p>
              ) : null}
              {templatesQuery.isError ? (
                <p className="studio-hint">Failed to load templates. Please retry.</p>
              ) : null}
              {!templatesQuery.isLoading && !templateItems.length ? (
                <p className="studio-hint">No templates matched the current filters.</p>
              ) : null}
              {templateItems.length ? (
                <div className="template-grid">
                  {templateItems.map((template) => (
                    <button
                      key={template._id}
                      className={`template-card${activeTemplateId === String(template._id) ? " active" : ""}`}
                      onClick={() => applyTemplateToEditor(template)}
                      title={`Use template: ${template.title || "Untitled"}`}
                    >
                      <span className="template-card__thumb-wrap">
                        {template.thumbnailUrl || template.previewUrl ? (
                          <img
                            className="template-card__thumb"
                            src={template.thumbnailUrl || template.previewUrl}
                            alt={template.title || "Template"}
                            loading="lazy"
                          />
                        ) : (
                          <span className="template-card__placeholder">No preview</span>
                        )}
                        <span className="template-card__type">{String(template.type || "").toUpperCase() || "N/A"}</span>
                      </span>
                      <span className="template-card__title">{template.title || "Untitled template"}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {activeTool === "ai-bg-remove" && (
            <div className="control-group">
              <p className="studio-hint">
                Remove image background using Elvify AI
              </p>
              <label className="toggle-control">
                Replace transparent background with color
                <input
                  type="checkbox"
                  checked={aiBgReplace}
                  onChange={(e) => setAiBgReplace(e.target.checked)}
                />
              </label>
              <label>
                Background Color
                <div className="studio-color-picker">
                  <span
                    className="studio-color-picker__swatch"
                    style={{ backgroundColor: aiBgColor || "#ffffff" }}
                    aria-hidden="true"
                  />
                  <input
                    className="studio-color-picker__input"
                    type="color"
                    value={aiBgColor}
                    onChange={(e) => setAiBgColor(e.target.value)}
                    disabled={!aiBgReplace}
                    aria-label="Background replacement color"
                  />
                  <span className="studio-color-picker__value">{(aiBgColor || "#FFFFFF").toUpperCase()}</span>
                </div>
              </label>
              <div className="text-tool-actions">
                <button className="primary-btn" onClick={applyAiBgRemovePreview} disabled={aiBgLoading}>
                  {aiBgLoading ? "Applying..." : "AI BG Remove"}
                </button>
                <button className="ghost-btn" onClick={() => clearAiBgRemove()} disabled={aiBgLoading}>
                  Reset AI BG
                </button>
              </div>
              {aiBgEnabled ? (
                <p className="studio-hint">AI BG Remove preview is active for export and Save to Elvify.</p>
              ) : null}
            </div>
          )}

          {!activeToolConfig?.implemented ? (
            <div className="control-group">
              <p className="studio-hint">
                <strong>{activeToolConfig?.label || "Tool"}</strong> is scheduled for Phase {activeToolConfig?.phase || "next"}.
              </p>
            </div>
          ) : null}

          <div className="export-panel">
            <h3>Canvas view</h3>
            <label>Zoom</label>
            <div className="canvas-zoom-row">
              <button type="button" className="ghost-btn" onClick={zoomOutCanvasView}>
                -
              </button>
              <input
                className="form-control canvas-zoom-input"
                type="number"
                min={CANVAS_VIEW_ZOOM_MIN}
                max={CANVAS_VIEW_ZOOM_MAX}
                step={CANVAS_VIEW_ZOOM_STEP}
                value={canvasViewZoom}
                onChange={(e) => setCanvasViewZoomSafe(e.target.value)}
              />
              <span className="canvas-zoom-unit">%</span>
              <button type="button" className="ghost-btn" onClick={zoomInCanvasView}>
                +
              </button>
              <button type="button" className="ghost-btn" onClick={resetCanvasViewZoom}>
                Fit
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setCanvasViewZoomSafe(CANVAS_VIEW_DEFAULTS.zoomPct)}
              >
                100%
              </button>
            </div>
            <p className="studio-hint">Tip: use mouse wheel over canvas to zoom in/out.</p>
            <label>Page size (px)</label>
            <p className="studio-hint">Select width and height from the preset list.</p>
            <div className="canvas-size-grid">
              <label>
                Width
                <select
                  className="form-control"
                  value={Math.round(Number(pageCoordinateSize?.width || 1080))}
                  onChange={(e) => updateCanvasPageSize("width", e.target.value)}
                >
                  {pageSizeDropdownOptions.map((size) => (
                    <option key={`w-${size}`} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Height
                <select
                  className="form-control"
                  value={Math.round(Number(pageCoordinateSize?.height || 1080))}
                  onChange={(e) => updateCanvasPageSize("height", e.target.value)}
                >
                  {pageSizeDropdownOptions.map((size) => (
                    <option key={`h-${size}`} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="button" className="ghost-btn" onClick={resetCanvasPageSize}>
              Reset page size
            </button>
            <label>
              Workspace background
              <div className="studio-color-picker">
                <span
                  className="studio-color-picker__swatch"
                  style={{ backgroundColor: workspaceBgColor || "#d1d5db" }}
                  aria-hidden="true"
                />
                <input
                  className="studio-color-picker__input"
                  type="color"
                  value={workspaceBgColor}
                  onChange={(e) => setWorkspaceBgColor(e.target.value)}
                  aria-label="Workspace background color"
                />
                <span className="studio-color-picker__value">{(workspaceBgColor || "#D1D5DB").toUpperCase()}</span>
              </div>
            </label>
            <label>
              Page background
              <div className="studio-color-picker">
                <span
                  className="studio-color-picker__swatch"
                  style={{ backgroundColor: pageBgColor || "#ffffff" }}
                  aria-hidden="true"
                />
                <input
                  className="studio-color-picker__input"
                  type="color"
                  value={pageBgColor}
                  onChange={(e) => setPageBgColor(e.target.value)}
                  aria-label="Page background color"
                />
                <span className="studio-color-picker__value">{(pageBgColor || "#FFFFFF").toUpperCase()}</span>
              </div>
            </label>
          </div>

          <div className="export-panel">
            <h3>Export settings</h3>
            <label>Format</label>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WEBP</option>
            </select>
            <label>Quality: {exportQuality}%</label>
            <input
              type="range"
              min={40}
              max={100}
              value={exportQuality}
              onChange={(e) => setExportQuality(Number(e.target.value))}
            />
          </div>
          </aside>
        </main>
      </div>
      <AppFooter />
    </>
  );
}

function isImageKitAssetUrl(url, endpoint) {
  if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) return false;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("imagekit.io")) return true;
    if (endpoint) {
      const endpointHost = new URL(endpoint).hostname;
      return parsed.hostname === endpointHost;
    }
  } catch {
    return false;
  }
  return false;
}

function hasEmbeddedRemoteSource(url) {
  if (!url || typeof url !== "string") return false;
  return /\/https?:\/\//i.test(url) || /\/https?:\//i.test(url);
}

function removeImageKitTransform(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/");
    const trIndex = segments.findIndex((segment) => segment.startsWith("tr:"));
    if (trIndex !== -1) {
      segments.splice(trIndex, 1);
      parsed.pathname = segments.join("/");
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}

function buildImageKitTransformUrl(url, editValues) {
  try {
    const parsed = new URL(removeImageKitTransform(url));
    const segments = parsed.pathname.split("/").filter(Boolean);
    const host = parsed.hostname.toLowerCase();

    // Avoid ImageKit ELIMIT on very large images (>25MP) by constraining max bounds
    // without upscaling. If user provides resize values, use those.
    const requestedW = parsePositiveInt(editValues.resizeWidth);
    const requestedH = parsePositiveInt(editValues.resizeHeight);
    const transforms = ["c-at_max"];
    transforms.push(`w-${Math.min(requestedW || 5000, 5000)}`);
    transforms.push(`h-${Math.min(requestedH || 5000, 5000)}`);
    transforms.push("f-auto", "q-85");

    const brightness = Math.round(editValues.brightness - 100);
    const contrast = Math.round(editValues.contrast - 100);
    const saturation = Math.round(editValues.saturation - 100);
    const blur = Math.round(editValues.blur);
    const grayscale = Math.round(editValues.grayscale);
    const sepia = Math.round(editValues.sepia);
    const rotate = Math.round(editValues.rotate);
    if (brightness !== 0) transforms.push(`e-brightness-${brightness}`);
    if (contrast !== 0) transforms.push(`e-contrast-${contrast}`);
    if (saturation !== 0) transforms.push(`e-saturation-${saturation}`);
    if (blur > 0) transforms.push(`bl-${blur}`);
    if (grayscale > 0) transforms.push("e-grayscale");
    if (sepia > 0) transforms.push(`e-sepia-${sepia}`);
    if (rotate !== 0) transforms.push(`rt-${rotate}`);

    const trSegment = `tr:${transforms.join(",")}`;
    // For default ImageKit domain (ik.imagekit.io/<id>/...), keep first segment (<id>) before tr.
    if (host === "ik.imagekit.io" && segments.length > 0 && !segments[0].startsWith("tr:")) {
      segments.splice(1, 0, trSegment);
    } else {
      segments.unshift(trSegment);
    }
    parsed.pathname = `/${segments.join("/")}`;

    return parsed.toString();
  } catch {
    return url;
  }
}

function parseTemplateFabricJson(fabricJson) {
  if (!fabricJson) return null;
  if (typeof fabricJson === "object") return fabricJson;
  if (typeof fabricJson !== "string") return null;
  const trimmed = fabricJson.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function parseTemplateMeta(meta) {
  if (!meta) return {};
  if (typeof meta === "string") {
    const trimmed = meta.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  if (typeof meta !== "object") return {};
  try {
    return JSON.parse(JSON.stringify(meta));
  } catch {
    return { ...meta };
  }
}

function parseTemplateCanvasSize(canvas) {
  if (!canvas || typeof canvas !== "object") return null;
  const width = Number(canvas?.width || 0);
  const height = Number(canvas?.height || 0);
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

function normalizeTypographyPreset(rawPreset, index = 0) {
  const fallback = DEFAULT_TYPOGRAPHY_PRESETS[index] || DEFAULT_TYPOGRAPHY_PRESETS[0];
  const preset = rawPreset && typeof rawPreset === "object" ? rawPreset : {};
  const values = preset.values && typeof preset.values === "object" ? preset.values : preset;

  const id = String(preset.id || fallback?.id || `preset-${index + 1}`).trim() || `preset-${index + 1}`;
  const label =
    String(preset.label || preset.name || fallback?.label || `Preset ${index + 1}`).trim() ||
    `Preset ${index + 1}`;
  const fontFamily =
    String(values.fontFamily || fallback?.values?.fontFamily || "Segoe UI").trim() || "Segoe UI";
  const fontWeight = clamp(
    Number(values.fontWeight ?? fallback?.values?.fontWeight ?? 700),
    100,
    900
  );
  const fontSize = clamp(Number(values.fontSize ?? fallback?.values?.fontSize ?? 42), 6, 360);
  const fontStyle = String(values.fontStyle || fallback?.values?.fontStyle || "normal").toLowerCase() === "italic"
    ? "italic"
    : "normal";
  const textAlignRaw = String(values.textAlign || fallback?.values?.textAlign || "left").toLowerCase();
  const textAlign = ["left", "center", "right", "justify"].includes(textAlignRaw)
    ? textAlignRaw
    : "left";

  return {
    id,
    label,
    values: {
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      textAlign,
    },
  };
}

function normalizeTypographyPresets(rawPresets) {
  if (!Array.isArray(rawPresets)) return [];
  const seen = new Set();
  const normalized = [];
  rawPresets.forEach((preset, index) => {
    const nextPreset = normalizeTypographyPreset(preset, index);
    if (!nextPreset?.id || seen.has(nextPreset.id)) return;
    seen.add(nextPreset.id);
    normalized.push(nextPreset);
  });
  return normalized;
}

function normalizeEditableTextLayer(rawLayer, index = 0) {
  const layer = rawLayer && typeof rawLayer === "object" ? rawLayer : {};
  const fallbackText = `Text ${index + 1}`;

  const idRaw = String(layer.id || "").trim();
  const id = idRaw || `editable-text-${index + 1}`;
  const text = String(layer.text || "").trim() || fallbackText;
  const name = String(layer.name || "").trim() || fallbackText;
  const xPct = clamp(
    Number(layer.xPct ?? layer.x ?? layer.leftPct ?? 50),
    0,
    100
  );
  const yPct = clamp(
    Number(layer.yPct ?? layer.y ?? layer.topPct ?? 50),
    0,
    100
  );
  const widthPct = clamp(Number(layer.widthPct ?? layer.wPct ?? 35), 5, 100);
  const fontSize = clamp(Number(layer.fontSize ?? 42), 6, 360);
  const fontFamily = String(layer.fontFamily || "Segoe UI").trim() || "Segoe UI";
  const fontWeightRaw = Number(layer.fontWeight ?? 700);
  const fontWeight = Number.isFinite(fontWeightRaw) ? clamp(fontWeightRaw, 100, 900) : 700;
  const fontStyle = String(layer.fontStyle || "normal").toLowerCase() === "italic" ? "italic" : "normal";
  const textAlignRaw = String(layer.textAlign || "left").toLowerCase();
  const textAlign = ["left", "center", "right", "justify"].includes(textAlignRaw)
    ? textAlignRaw
    : "left";
  const fill = normalizeFabricColorHex(String(layer.fill || layer.color || "#111111"), "#111111");
  const opacity = clamp(Number(layer.opacity ?? 100), 0, 100);
  const angle = clamp(Number(layer.angle ?? layer.rotate ?? 0), -360, 360);

  return {
    id,
    name,
    text,
    xPct,
    yPct,
    widthPct,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textAlign,
    fill,
    opacity,
    angle,
  };
}

function normalizeEditableTextLayers(rawLayers) {
  if (!Array.isArray(rawLayers)) return [];
  return rawLayers.map((layer, index) => normalizeEditableTextLayer(layer, index));
}

function addEditableTextLayersToFabricCanvas(canvas, rawLayers, referenceSize = {}) {
  if (!canvas || typeof canvas.add !== "function" || typeof FabricTextbox !== "function") return 0;
  const layers = normalizeEditableTextLayers(rawLayers);
  if (!layers.length) return 0;

  const baseWidth =
    Number(referenceSize?.referenceWidth || referenceSize?.width || 0) ||
    Number(canvas.getWidth() || 0) ||
    1080;
  const baseHeight =
    Number(referenceSize?.referenceHeight || referenceSize?.height || 0) ||
    Number(canvas.getHeight() || 0) ||
    1080;

  let injectedCount = 0;
  layers.forEach((layer) => {
    const widthPx = Math.max(24, (layer.widthPct / 100) * baseWidth);
    const leftPx = (layer.xPct / 100) * baseWidth;
    const topPx = (layer.yPct / 100) * baseHeight;

    const textObj = new FabricTextbox(layer.text, {
      left: leftPx,
      top: topPx,
      width: widthPx,
      fontSize: layer.fontSize,
      fontFamily: layer.fontFamily,
      fontWeight: layer.fontWeight,
      fontStyle: layer.fontStyle,
      textAlign: layer.textAlign,
      fill: layer.fill,
      opacity: layer.opacity / 100,
      angle: layer.angle,
      originX: "left",
      originY: "top",
      editable: true,
      selectable: true,
      evented: true,
      splitByGrapheme: false,
    });

    textObj.set({
      elvifyEditableText: true,
      elvifyEditableTextId: layer.id,
      elvifyEditableTextName: layer.name,
      elvifyTemplateObject: false,
      elvifyTemplateTextObject: false,
    });

    markCanvasObjectEditableRecursive(textObj);
    canvas.add(textObj);
    injectedCount += 1;
  });

  return injectedCount;
}

function extractEditableTextLayersFromCanvas(canvas, referenceSize = {}) {
  if (!canvas || typeof canvas.getObjects !== "function") return [];
  const baseWidth =
    Number(referenceSize?.referenceWidth || referenceSize?.width || 0) ||
    Number(canvas.getWidth() || 0) ||
    1080;
  const baseHeight =
    Number(referenceSize?.referenceHeight || referenceSize?.height || 0) ||
    Number(canvas.getHeight() || 0) ||
    1080;

  return canvas
    .getObjects()
    .filter((obj) => isFabricTextObject(obj) && (obj?.elvifyEditableText || obj?.elvifyEditableTextId))
    .map((obj, index) => {
      const scaledWidth =
        typeof obj?.getScaledWidth === "function"
          ? obj.getScaledWidth()
          : Number(obj?.width || 0) * Number(obj?.scaleX || 1);
      const left = Number(obj?.left || 0);
      const top = Number(obj?.top || 0);
      return normalizeEditableTextLayer(
        {
          id: String(obj?.elvifyEditableTextId || `editable-text-${index + 1}`),
          name: String(obj?.elvifyEditableTextName || `Text ${index + 1}`),
          text: String(obj?.text || ""),
          xPct: baseWidth > 0 ? (left / baseWidth) * 100 : 0,
          yPct: baseHeight > 0 ? (top / baseHeight) * 100 : 0,
          widthPct: baseWidth > 0 ? (Math.max(24, scaledWidth) / baseWidth) * 100 : 35,
          fontSize: Number(obj?.fontSize || 42),
          fontFamily: String(obj?.fontFamily || "Segoe UI"),
          fontWeight: Number(obj?.fontWeight || 700),
          fontStyle: String(obj?.fontStyle || "normal"),
          textAlign: String(obj?.textAlign || "left"),
          fill: String(obj?.fill || "#111111"),
          opacity: clamp(Number(obj?.opacity || 1) * 100, 0, 100),
          angle: Number(obj?.angle || 0),
        },
        index
      );
    });
}

function mergeTemplateMetaWithEditableTextLayers(templateMeta, editableTextLayers) {
  const meta = parseTemplateMeta(templateMeta);
  const normalizedLayers = normalizeEditableTextLayers(editableTextLayers);
  if (normalizedLayers.length) {
    meta.editableTextLayers = normalizedLayers;
  } else {
    delete meta.editableTextLayers;
  }
  return meta;
}

function hasRenderableFabricJson(fabricJson) {
  if (!fabricJson || typeof fabricJson !== "object") return false;
  const objects = Array.isArray(fabricJson.objects) ? fabricJson.objects : [];
  return Boolean(
    objects.length ||
      fabricJson.backgroundImage ||
      fabricJson.overlayImage ||
      fabricJson.backgroundColor ||
      fabricJson.overlayColor
  );
}

function buildRegularPolygonPoints(pointCount = 6, radius = 100) {
  const points = [];
  const safeCount = Math.max(3, Math.round(Number(pointCount) || 6));
  const safeRadius = Math.max(8, Number(radius) || 100);
  for (let index = 0; index < safeCount; index += 1) {
    const angle = ((Math.PI * 2) / safeCount) * index - Math.PI / 2;
    points.push({
      x: Math.cos(angle) * safeRadius,
      y: Math.sin(angle) * safeRadius,
    });
  }
  return points;
}

function buildStarPoints(pointCount = 5, outerRadius = 120, innerRadius = 56) {
  const points = [];
  const safeCount = Math.max(4, Math.round(Number(pointCount) || 5));
  const safeOuterRadius = Math.max(12, Number(outerRadius) || 120);
  const safeInnerRadius = Math.max(8, Math.min(Number(innerRadius) || 56, safeOuterRadius - 1));
  for (let index = 0; index < safeCount * 2; index += 1) {
    const angle = ((Math.PI * 2) / (safeCount * 2)) * index - Math.PI / 2;
    const radius = index % 2 === 0 ? safeOuterRadius : safeInnerRadius;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return points;
}

function createShapeForCanvas(shapeType, options = {}) {
  const safeType = String(shapeType || "").trim().toLowerCase();
  const pageWidth = Math.max(320, Number(options?.pageWidth || 0) || 1080);
  const pageHeight = Math.max(320, Number(options?.pageHeight || 0) || 1080);
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  const shared = {
    left: centerX,
    top: centerY,
    originX: "center",
    originY: "center",
    fill: "#dbeafe",
    stroke: "#1e3a8a",
    strokeWidth: 2,
    opacity: 1,
    selectable: true,
    evented: true,
  };

  if (safeType === "rect") {
    return new FabricRect({
      ...shared,
      width: 340,
      height: 220,
      rx: 0,
      ry: 0,
    });
  }

  if (safeType === "rounded-rect") {
    return new FabricRect({
      ...shared,
      width: 340,
      height: 220,
      rx: 34,
      ry: 34,
    });
  }

  if (safeType === "circle") {
    return new FabricCircle({
      ...shared,
      radius: 120,
    });
  }

  if (safeType === "ellipse") {
    return new FabricEllipse({
      ...shared,
      rx: 170,
      ry: 110,
    });
  }

  if (safeType === "triangle") {
    return new FabricTriangle({
      ...shared,
      width: 280,
      height: 240,
    });
  }

  if (safeType === "line") {
    return new FabricLine([centerX - 180, centerY, centerX + 180, centerY], {
      stroke: "#1e3a8a",
      fill: "",
      strokeWidth: 8,
      strokeLineCap: "round",
      selectable: true,
      evented: true,
      opacity: 1,
    });
  }

  if (safeType === "arrow") {
    return new FabricPolygon(
      [
        { x: -150, y: -42 },
        { x: 30, y: -42 },
        { x: 30, y: -86 },
        { x: 180, y: 0 },
        { x: 30, y: 86 },
        { x: 30, y: 42 },
        { x: -150, y: 42 },
      ],
      {
        ...shared,
        strokeWidth: 2,
      }
    );
  }

  if (safeType === "star") {
    return new FabricPolygon(buildStarPoints(5, 140, 62), {
      ...shared,
    });
  }

  if (safeType === "polygon") {
    return new FabricPolygon(buildRegularPolygonPoints(6, 140), {
      ...shared,
    });
  }

  return null;
}

function markUserShapeObject(obj, shapeType) {
  if (!obj || typeof obj.set !== "function") return;
  obj.set({
    elvifyUserShape: true,
    elvifyShapeType: String(shapeType || "").trim().toLowerCase() || "shape",
    elvifyTemplateObject: false,
    elvifyTemplateTextObject: false,
  });
}

function getActiveFabricSelectionTargets(canvas) {
  if (!canvas || typeof canvas.getActiveObject !== "function") return [];
  const active = canvas.getActiveObject();
  if (!active) return [];

  const activeType = String(active?.type || "").toLowerCase();
  if (activeType === "activeselection" && typeof active.getObjects === "function") {
    return active.getObjects().filter(Boolean);
  }

  return [active];
}

function collectFabricLeafObjects(obj, acc = []) {
  if (!obj) return acc;
  const type = String(obj?.type || "").toLowerCase();
  if ((type === "group" || type === "activeselection") && typeof obj.getObjects === "function") {
    obj.getObjects().forEach((child) => collectFabricLeafObjects(child, acc));
    return acc;
  }
  acc.push(obj);
  return acc;
}

function getActiveFabricLeafTargets(canvas) {
  const selected = getActiveFabricSelectionTargets(canvas);
  if (!selected.length) return [];
  return selected.reduce((acc, obj) => collectFabricLeafObjects(obj, acc), []);
}

function isFabricTextObject(obj) {
  const type = String(obj?.type || "").toLowerCase();
  return type === "text" || type === "textbox" || type === "i-text" || typeof obj?.text === "string";
}

function isEditableOverlayTextObject(obj) {
  return Boolean(obj?.elvifyEditableText || obj?.elvifyEditableTextId);
}

function isTemplateCanvasObject(obj) {
  return Boolean(obj?.elvifyTemplateObject);
}

function isBuiltInTemplateTextObject(obj) {
  return isTemplateCanvasObject(obj) && !isEditableOverlayTextObject(obj) && isFabricTextObject(obj);
}

function getCanvasLeafObjects(canvas) {
  if (!canvas || typeof canvas.getObjects !== "function") return [];
  return canvas.getObjects().reduce((acc, obj) => collectFabricLeafObjects(obj, acc), []);
}

function getCanvasTextObjects(canvas) {
  return getCanvasLeafObjects(canvas).filter((obj) => isFabricTextObject(obj));
}

function tagLoadedTemplateObjects(canvas) {
  const objects = getCanvasLeafObjects(canvas);
  objects.forEach((obj) => {
    if (!obj || typeof obj.set !== "function") return;
    if (isEditableOverlayTextObject(obj)) return;
    obj.set({
      elvifyTemplateObject: true,
      elvifyTemplateTextObject: isFabricTextObject(obj),
    });
  });
}

function getFabricTextRuntimeId(obj, index = 0) {
  if (!obj || !isFabricTextObject(obj)) return "";
  const explicitId = String(obj?.elvifyEditableTextId || "").trim();
  if (explicitId) return explicitId;

  const existing = String(obj?.elvifyRuntimeTextId || "").trim();
  if (existing) return existing;

  const sourceId = String(obj?.__uid || obj?.id || "").trim();
  const runtimeId = sourceId ? `fabric-text-${sourceId}` : `fabric-text-${index + 1}`;
  try {
    obj.elvifyRuntimeTextId = runtimeId;
  } catch {
    // Ignore assignment failures for non-extensible Fabric objects.
  }
  return runtimeId;
}

function getFabricEditableTextItems(canvas) {
  const allTextObjects = getCanvasTextObjects(canvas);
  if (!allTextObjects.length) return [];

  const placeholderTextObjects = allTextObjects.filter(
    (obj) => Boolean(obj?.elvifyEditableText || obj?.elvifyEditableTextId)
  );
  const textObjects = placeholderTextObjects.length ? placeholderTextObjects : allTextObjects;

  const seenIds = new Set();
  const items = [];

  textObjects.forEach((obj, index) => {
    const id = getFabricTextRuntimeId(obj, index);
    if (!id || seenIds.has(id)) return;
    seenIds.add(id);

    const rawText = String(obj?.text || "").replace(/\s+/g, " ").trim();
    const textPreview = rawText
      ? rawText.length > 70
        ? `${rawText.slice(0, 70)}...`
        : rawText
      : "(empty)";
    const fallbackName = `Text ${items.length + 1}`;
    const name =
      String(obj?.elvifyEditableTextName || "").trim() ||
      (rawText ? rawText.slice(0, 28) : fallbackName);

    items.push({
      id,
      name,
      textPreview,
      fontFamily: String(obj?.fontFamily || "Segoe UI"),
      isPlaceholder: Boolean(obj?.elvifyEditableText || obj?.elvifyEditableTextId),
    });
  });

  return items;
}

function ensureFabricFontLoaded(fontFamily, canvas) {
  const family = String(fontFamily || "").trim();
  if (!family || !canvas) return;
  if (typeof document === "undefined" || !document.fonts || typeof document.fonts.load !== "function") return;

  Promise.resolve(document.fonts.load(`400 16px "${family}"`))
    .catch(() => null)
    .finally(() => {
      if (typeof canvas?.requestRenderAll === "function") {
        canvas.requestRenderAll();
      }
    });
}

function ensureFabricCanvasFontsLoaded(canvas) {
  if (!canvas) return;
  const families = getCanvasTextObjects(canvas)
    .map((obj) => String(obj?.fontFamily || "").trim())
    .filter(Boolean);
  if (!families.length) return;

  const uniqueFamilies = [...new Set(families)];
  uniqueFamilies.forEach((fontFamily) => ensureFabricFontLoaded(fontFamily, canvas));
}

function formatFabricTypeLabel(type) {
  const raw = String(type || "object").trim();
  if (!raw) return "Object";
  if (raw.toLowerCase() === "i-text") return "IText";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function rgbToHexComponent(value) {
  const safe = Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
  return safe.toString(16).padStart(2, "0");
}

function parseRgbColorToHex(value) {
  if (typeof value !== "string") return "";
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return "";
  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return "";

  const parsePart = (part) => {
    if (part.endsWith("%")) {
      const pct = Number(part.replace("%", ""));
      if (!Number.isFinite(pct)) return null;
      return Math.max(0, Math.min(255, (pct / 100) * 255));
    }
    const num = Number(part);
    return Number.isFinite(num) ? num : null;
  };

  const r = parsePart(parts[0]);
  const g = parsePart(parts[1]);
  const b = parsePart(parts[2]);
  if (r === null || g === null || b === null) return "";

  return `#${rgbToHexComponent(r)}${rgbToHexComponent(g)}${rgbToHexComponent(b)}`;
}

let cssColorParserCtx = null;
function normalizeFabricColorHex(value, fallback = "#000000") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
    }
    return `#${hex.toLowerCase()}`;
  }

  const rgbHex = parseRgbColorToHex(trimmed);
  if (rgbHex) return rgbHex;

  if (typeof document !== "undefined") {
    if (!cssColorParserCtx) {
      const canvas = document.createElement("canvas");
      cssColorParserCtx = canvas.getContext("2d");
    }
    if (cssColorParserCtx) {
      cssColorParserCtx.fillStyle = "#000000";
      cssColorParserCtx.fillStyle = trimmed;
      const normalized = String(cssColorParserCtx.fillStyle || "").trim();
      const fromNormalized = parseRgbColorToHex(normalized);
      if (fromNormalized) return fromNormalized;
      const normalizedHex = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (normalizedHex) {
        const hex = normalizedHex[1];
        if (hex.length === 3) {
          return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
        }
        return `#${hex.toLowerCase()}`;
      }
    }
  }

  return fallback;
}

function getFabricSelectionState(canvas) {
  const selected = getActiveFabricLeafTargets(canvas);
  if (!selected.length) return null;

  const primary = selected[0];
  const selectedTemplateObjects = selected.filter(
    (obj) => isTemplateCanvasObject(obj) && !isEditableOverlayTextObject(obj)
  );
  const selectedBuiltInTextObjects = selected.filter((obj) => isBuiltInTemplateTextObject(obj));
  const hasNonTextSelection = selected.some((obj) => !isFabricTextObject(obj));
  const textObjects = selected.filter((obj) => isFabricTextObject(obj));
  const firstText = textObjects[0] || null;
  const firstTextIndex = firstText ? textObjects.indexOf(firstText) : -1;
  const editableTextId =
    firstTextIndex >= 0 ? getFabricTextRuntimeId(firstText, firstTextIndex) : "";
  const firstFillObject = selected.find((obj) => obj && "fill" in obj) || null;
  const firstStrokeObject = selected.find((obj) => obj && "stroke" in obj) || null;
  const firstStrokeWidthObject = selected.find((obj) => obj && "strokeWidth" in obj) || null;
  const firstOpacityObject = selected.find((obj) => obj && "opacity" in obj) || primary;
  const isSingleSelection = selected.length === 1;
  const singleObject = isSingleSelection ? selected[0] : null;
  const singleObjectType = String(singleObject?.type || "").toLowerCase();
  const canEditCornerRadius = singleObjectType === "rect";
  const cornerRadiusRaw = Number(singleObject?.rx ?? singleObject?.ry ?? 0);
  const cornerRadius = Math.max(
    0,
    Math.min(240, Math.round(Number.isFinite(cornerRadiusRaw) ? cornerRadiusRaw : 0))
  );

  const opacityValue = Number(firstOpacityObject?.opacity);
  const opacity = Math.max(0, Math.min(100, Math.round((Number.isFinite(opacityValue) ? opacityValue : 1) * 100)));

  const fontSizeValue = Number(firstText?.fontSize);
  const fontSize = Math.max(6, Math.min(360, Math.round(Number.isFinite(fontSizeValue) ? fontSizeValue : 42)));
  const textAlignRaw = String(firstText?.textAlign || "left").toLowerCase();
  const textAlign = ["left", "center", "right", "justify"].includes(textAlignRaw) ? textAlignRaw : "left";

  return {
    count: selected.length,
    typeLabel: formatFabricTypeLabel(primary?.type || "object"),
    hasFill: Boolean(firstFillObject),
    hasStroke: Boolean(firstStrokeObject),
    fillHex: normalizeFabricColorHex(String(firstFillObject?.fill || ""), "#000000"),
    strokeHex: normalizeFabricColorHex(String(firstStrokeObject?.stroke || ""), "#000000"),
    strokeWidth: Math.max(0, Math.min(48, Math.round(Number(firstStrokeWidthObject?.strokeWidth || 0)))),
    opacity,
    editableTextId,
    templateObjectCount: selectedTemplateObjects.length,
    builtInTemplateTextCount: selectedBuiltInTextObjects.length,
    hasNonTextSelection,
    canEditCornerRadius,
    cornerRadius,
    canEditText: Boolean(firstText),
    text: String(firstText?.text || ""),
    fontSize,
    fontFamily: String(firstText?.fontFamily || "Segoe UI"),
    fontWeight: Number(firstText?.fontWeight || 400),
    fontStyle: String(firstText?.fontStyle || "normal"),
    textAlign,
  };
}

function markCanvasObjectEditableRecursive(obj) {
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

  const type = String(obj.type || "").toLowerCase();
  if (type === "group") {
    obj.set({
      subTargetCheck: true,
      interactive: true,
    });
    const children = typeof obj.getObjects === "function" ? obj.getObjects() : [];
    children.forEach((child) => markCanvasObjectEditableRecursive(child));
  }
}

function flattenCanvasGroups(canvas) {
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
      markCanvasObjectEditableRecursive(child);
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
            activeSelection.forEachObject((obj) => markCanvasObjectEditableRecursive(obj));
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
}

function normalizeLoadedFabricObjects(canvas) {
  if (!canvas) return;
  const objects = typeof canvas.getObjects === "function" ? canvas.getObjects() : [];
  objects.forEach((obj) => markCanvasObjectEditableRecursive(obj));
  flattenCanvasGroups(canvas);
  canvas.getObjects().forEach((obj) => markCanvasObjectEditableRecursive(obj));

  canvas.requestRenderAll();
}

function fitFabricViewportToPage(canvas, options = {}) {
  if (!canvas) return;
  const canvasWidth = Number(canvas.getWidth() || 0);
  const canvasHeight = Number(canvas.getHeight() || 0);
  if (canvasWidth <= 0 || canvasHeight <= 0) return;

  const pageWidth = Math.max(1, Number(options?.pageWidth || options?.width || 0) || 1);
  const pageHeight = Math.max(1, Number(options?.pageHeight || options?.height || 0) || 1);
  const padding = clamp(Number(options?.padding ?? 0), 0, 120);

  const zoom = Math.min(
    (canvasWidth - padding * 2) / pageWidth,
    (canvasHeight - padding * 2) / pageHeight
  );
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const offsetX = (canvasWidth - pageWidth * safeZoom) / 2;
  const offsetY = (canvasHeight - pageHeight * safeZoom) / 2;
  canvas.setViewportTransform([safeZoom, 0, 0, safeZoom, offsetX, offsetY]);
}

async function buildEditedBlob({
  imageEl,
  exportFormat,
  exportQuality,
  editValues,
  textLayers = [],
  pageBackgroundColor = "#ffffff",
  useDirectImagePixels = false,
}) {
  const img = imageEl;
  if (!img) return null;
  if (!img.complete) return null;

  const naturalWidth = img.naturalWidth || 1400;
  const naturalHeight = img.naturalHeight || 900;
  const requestedW = parsePositiveInt(editValues.resizeWidth);
  const requestedH = parsePositiveInt(editValues.resizeHeight);
  const cropX = clamp(editValues.cropX, 0, 99);
  const cropY = clamp(editValues.cropY, 0, 99);
  const cropW = Math.min(clamp(editValues.cropW, 1, 100), 100 - cropX);
  const cropH = Math.min(clamp(editValues.cropH, 1, 100), 100 - cropY);

  const sourceCropX = Math.round((naturalWidth * cropX) / 100);
  const sourceCropY = Math.round((naturalHeight * cropY) / 100);
  const sourceCropW = Math.max(1, Math.round((naturalWidth * cropW) / 100));
  const sourceCropH = Math.max(1, Math.round((naturalHeight * cropH) / 100));

  let targetWidth = sourceCropW;
  let targetHeight = sourceCropH;
  if (requestedW && requestedH) {
    targetWidth = requestedW;
    targetHeight = requestedH;
  } else if (requestedW) {
    targetWidth = requestedW;
    targetHeight = Math.round((naturalHeight * requestedW) / naturalWidth);
  } else if (requestedH) {
    targetHeight = requestedH;
    targetWidth = Math.round((naturalWidth * requestedH) / naturalHeight);
  }

  const maxExportDimension = 5000;
  const maxExportPixels = 24_000_000;
  const dimensionRatio = Math.min(
    1,
    maxExportDimension / targetWidth,
    maxExportDimension / targetHeight
  );
  const pixelRatio = Math.min(1, Math.sqrt(maxExportPixels / (targetWidth * targetHeight)));
  const downscaleRatio = Math.min(dimensionRatio, pixelRatio);
  const outputWidth = Math.max(1, Math.round(targetWidth * downscaleRatio));
  const outputHeight = Math.max(1, Math.round(targetHeight * downscaleRatio));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.save();
  ctx.fillStyle = pageBackgroundColor || "#ffffff";
  ctx.fillRect(0, 0, outputWidth, outputHeight);
  ctx.restore();

  const { brightness, contrast, saturation, blur, grayscale, sepia, rotate, zoom, flipX, flipY } =
    editValues;
  if (!useDirectImagePixels) {
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
  }

  ctx.save();
  ctx.translate(outputWidth / 2, outputHeight / 2);
  const rotationToApply = useDirectImagePixels ? 0 : rotate;
  ctx.rotate((rotationToApply * Math.PI) / 180);
  const sx = (flipX ? -1 : 1) * (zoom / 100);
  const sy = (flipY ? -1 : 1) * (zoom / 100);
  ctx.scale(sx, sy);
  ctx.drawImage(
    img,
    sourceCropX,
    sourceCropY,
    sourceCropW,
    sourceCropH,
    -outputWidth / 2,
    -outputHeight / 2,
    outputWidth,
    outputHeight
  );
  ctx.restore();
  // Draw text overlays in normal canvas coordinates (not image transform space).
  ctx.filter = "none";

  const layers = Array.isArray(textLayers) ? textLayers : [];
  layers.forEach((layer) => {
    const fontSize = Math.max(10, Number(layer?.fontSize || 24));
    const color = layer?.color || "#ffffff";
    const text = layer?.text || "";
    const x = clamp(Number(layer?.x || 50), 0, 100);
    const y = clamp(Number(layer?.y || 50), 0, 100);
    const align = ["left", "center", "right"].includes(layer?.textAlign) ? layer.textAlign : "center";
    const opacity = clamp(Number(layer?.opacity || 100), 0, 100) / 100;
    const weight = Number(layer?.fontWeight || 700);
    const fontStyle = layer?.fontStyle === "italic" ? "italic" : "normal";
    const family = layer?.fontFamily || "Segoe UI";
    const rotate = Number(layer?.rotate || 0);
    const targetX = (x / 100) * outputWidth;
    const targetY = (y / 100) * outputHeight;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.font = `${fontStyle} ${weight} ${fontSize}px "${family}", "Segoe UI", Arial, sans-serif`;
    ctx.translate(targetX, targetY);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  });

  const quality = exportQuality / 100;
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, exportFormat, exportFormat === "image/png" ? undefined : quality)
  );
  return blob || null;
}

async function buildFabricEditedBlob({
  fabricCanvas,
  exportFormat,
  exportQuality,
  targetWidth = 0,
  targetHeight = 0,
}) {
  if (!fabricCanvas) return null;
  const format =
    exportFormat === "image/jpeg"
      ? "jpeg"
      : exportFormat === "image/webp"
      ? "webp"
      : "png";
  const quality = clamp(Number(exportQuality || 92), 1, 100) / 100;
  const canvasWidth = Number(fabricCanvas.getWidth() || 0);
  const canvasHeight = Number(fabricCanvas.getHeight() || 0);
  const widthMultiplier = canvasWidth > 0 ? Number(targetWidth || 0) / canvasWidth : 0;
  const heightMultiplier = canvasHeight > 0 ? Number(targetHeight || 0) / canvasHeight : 0;
  const requestedMultiplier = Math.max(widthMultiplier || 0, heightMultiplier || 0);
  const multiplier =
    Number.isFinite(requestedMultiplier) && requestedMultiplier > 0
      ? Math.min(requestedMultiplier, 8)
      : 1;
  const dataUrl = fabricCanvas.toDataURL({
    format,
    quality,
    multiplier,
    enableRetinaScaling: true,
  });
  return dataUrlToBlob(dataUrl);
}

function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const parts = dataUrl.split(",");
  if (parts.length < 2) return null;
  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || "image/png";
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function looksLikeSvgUrl(url) {
  if (!url) return false;
  const clean = String(url).trim().toLowerCase();
  if (!clean) return false;
  return clean.includes(".svg");
}

async function uploadBlobToImageKit({ blob, fileName, authData }) {
  const formData = new FormData();
  if (typeof blob === "string") {
    formData.append("file", blob);
  } else {
    formData.append("file", blob);
  }
  formData.append("fileName", fileName);
  formData.append("publicKey", authData.publicKey);
  formData.append("token", authData.authenticationParameters.token);
  formData.append("signature", authData.authenticationParameters.signature);
  formData.append("expire", String(authData.authenticationParameters.expire));
  formData.append("useUniqueFileName", "true");
  formData.append("folder", "/elvify/edited");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "ImageKit upload failed");
  }
  return response.json();
}

function mimeToExt(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function stripCacheBuster(url) {
  if (!isHttpUrl(url)) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("hdcb");
    return parsed.toString();
  } catch {
    return url;
  }
}

function withRetryCacheBuster(url, retryKeyByUrl = {}) {
  if (!isHttpUrl(url)) return url;
  try {
    const normalized = stripCacheBuster(url);
    const retryKey = retryKeyByUrl[normalized];
    if (!retryKey) return normalized;
    const parsed = new URL(normalized);
    parsed.searchParams.set("hdcb", String(retryKey));
    return parsed.toString();
  } catch {
    return url;
  }
}

function normalizeComparableUrl(url) {
  if (!isHttpUrl(url)) return url || "";
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("hdcb");
    return parsed.toString();
  } catch {
    return url || "";
  }
}

function formatHistoryDate(value) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parsePositiveInt(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  const rounded = Math.floor(num);
  return rounded > 0 ? rounded : 0;
}

function clamp(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function Control({ label, value, min, max, onChange }) {
  return (
    <label className="range-control">
      <span>
        {label} <strong>{value}</strong>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export default DesignElvify;

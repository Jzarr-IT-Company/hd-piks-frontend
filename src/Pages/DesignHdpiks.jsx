import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../Services/api";
import { buildCategoryTree, fetchCategories } from "../Services/category";
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

function DesignHdpiks() {
  const imageKitEndpoint = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || "").trim();
  const [params] = useSearchParams();
  const sourceImageId = params.get("assetId");
  const sourceCategoryId = params.get("category");
  const sourceSubCategoryId = params.get("subcategory");
  const sourceSubSubCategoryId = params.get("subsubcategory");
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);
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
  const [notice, setNotice] = useState("");
  const [source, setSource] = useState(() => params.get("assetUrl") || "");
  const [sourceInput, setSourceInput] = useState(() => params.get("assetUrl") || "");
  const [localFileName, setLocalFileName] = useState("");

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

  const selectedCategoryNode = useMemo(
    () => categoryTree.find((c) => c._id === selectedCategory),
    [categoryTree, selectedCategory]
  );

  const selectedSubCategoryNode = useMemo(
    () => selectedCategoryNode?.children?.find((c) => c._id === selectedSubCategory),
    [selectedCategoryNode, selectedSubCategory]
  );

  const canUseImageKitTransforms = useMemo(
    () => isImageKitAssetUrl(source, imageKitEndpoint),
    [source, imageKitEndpoint]
  );

  const imageKitPreviewUrl = useMemo(() => {
    if (!canUseImageKitTransforms) return source;
    return buildImageKitTransformUrl(source, editValues);
  }, [canUseImageKitTransforms, source, editValues]);

  const previewSrc = canUseImageKitTransforms ? imageKitPreviewUrl : source;

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

  const updateValue = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    setEditValues((prev) => ({
      ...prev,
      ...preset.values,
    }));
  };

  const applyCropAspect = (aspect) => {
    if (aspect === "free") {
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
    updateValue("cropX", cropX);
    updateValue("cropY", cropY);
    updateValue("cropW", cropW);
    updateValue("cropH", cropH);
  };

  const resetAll = () => {
    setEditValues(EDIT_DEFAULTS);
    setNotice("All edits reset.");
  };

  const loadFromInputUrl = () => {
    if (!sourceInput.trim()) return;
    setSource(sourceInput.trim());
    setLocalFileName("");
    setNotice("Image loaded from URL.");
  };

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setSource(objectUrl);
    setSourceInput("");
    setLocalFileName(file.name || "");
    setNotice("Local image loaded.");
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
    const blob = await buildEditedBlob({
      imageEl: imageRef.current,
      exportFormat,
      exportQuality,
      editValues,
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
      a.download = `hdpiks-edit-${Date.now()}.${extension}`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      setNotice("Export complete.");
    } catch (err) {
      setNotice("Export failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveEditedToHdpiks = async () => {
    if (!source) {
      setNotice("Load an image first.");
      return;
    }

    if (!sourceImageId && !selectedCategory) {
      setNotice("For local images, select category before saving.");
      return;
    }

    const blob = await buildEditedBlob({
      imageEl: imageRef.current,
      exportFormat,
      exportQuality,
      editValues,
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
        fileName: `hdpiks-edited-${Date.now()}.${mimeToExt(exportFormat)}`,
        authData,
      });

      await api.post("/imagekit/edited-asset", {
        sourceImageId: sourceImageId || undefined,
        category: selectedCategory || undefined,
        subcategory: selectedSubCategory || undefined,
        subsubcategory: selectedSubSubCategory || undefined,
        imageUrl: imageKitUpload.url,
        title: `Edited - ${params.get("title") || localFileName || "HDPiks Asset"}`,
        editConfig: {
          ...editValues,
          format: exportFormat,
          quality: exportQuality,
          previewMode: canUseImageKitTransforms ? "imagekit-tr" : "canvas",
        },
        fileMetadata: {
          mimeType: imageKitUpload.fileType || exportFormat,
          fileSize: Number(imageKitUpload.size || blob.size),
        },
      });

      setNotice("Edited asset saved to HDPiks successfully.");
    } catch (err) {
      setNotice(err?.response?.data?.message || err?.message || "Failed to save edited asset.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="design-studio">
      <header className="design-studio__topbar">
        <div className="design-studio__brand">
          <span className="design-studio__logo">HD</span>
          <div>
            <h1>HDPiks Design Studio</h1>
            <p>Edit images with professional controls</p>
          </div>
        </div>
        <div className="design-studio__top-actions">
          <button className="ghost-btn" onClick={resetAll}>
            Reset
          </button>
          <button className="ghost-btn" onMouseDown={() => setShowOriginal(true)} onMouseUp={() => setShowOriginal(false)} onMouseLeave={() => setShowOriginal(false)}>
            Compare
          </button>
          <button className="ghost-btn" onClick={saveEditedToHdpiks} disabled={uploading || saving}>
            {uploading ? "Saving..." : "Save to HDPiks"}
          </button>
          <button className="primary-btn" onClick={exportImage} disabled={saving || uploading}>
            {saving ? "Exporting..." : "Export"}
          </button>
        </div>
      </header>

      <main className="design-studio__layout">
        <aside className="design-studio__sidebar">
          <h2>Tools</h2>
          <button
            className={activeTool === "adjust" ? "tool-btn active" : "tool-btn"}
            onClick={() => setActiveTool("adjust")}
          >
            Adjust
          </button>
          <button
            className={activeTool === "transform" ? "tool-btn active" : "tool-btn"}
            onClick={() => setActiveTool("transform")}
          >
            Transform
          </button>
          <button
            className={activeTool === "presets" ? "tool-btn active" : "tool-btn"}
            onClick={() => setActiveTool("presets")}
          >
            Presets
          </button>
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
          </div>
        </aside>

        <section className="design-studio__canvas-area">
          <div className="canvas-shell">
            {source ? (
              <img
                ref={imageRef}
                src={showOriginal ? originalPreviewSrc : previewSrc}
                alt="Editor preview"
                className="canvas-image"
                style={{ filter: computedFilter, transform: computedTransform, ...cropStyle }}
                crossOrigin="anonymous"
                onError={() => setNotice("Failed to load image source.")}
              />
            ) : (
              <div className="canvas-empty-state">No image loaded yet</div>
            )}
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

async function buildEditedBlob({
  imageEl,
  exportFormat,
  exportQuality,
  editValues,
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

  const quality = exportQuality / 100;
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, exportFormat, exportFormat === "image/png" ? undefined : quality)
  );
  return blob || null;
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
  formData.append("folder", "/hdpiks/edited");

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

export default DesignHdpiks;

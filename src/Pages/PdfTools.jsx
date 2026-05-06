import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowDownToLine,
    ArrowUpDown,
    CheckCircle2,
    Download,
    Edit3,
    FileArchive,
    FileImage,
    FileText,
    Files,
    Highlighter,
    Loader2,
    MousePointer2,
    Plus,
    Presentation,
    Sheet,
    Type,
    Upload,
    XCircle,
} from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import TopNavOnly from "../Components/AppNavbar/TopNavOnly";
import AppFooter from "../Components/AppFooter/AppFooter";
import { API_ENDPOINTS } from "../config/api.config.js";
import {
    createPdfToolJob,
    downloadPdfToolJob,
    exportEditedPdf,
    getPdfToolFileBlobUrl,
    getPdfToolJob,
    uploadPdfToolFiles,
} from "../Services/pdfTools.js";
import "./PdfTools.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${pdfWorker}${pdfWorker.includes("?") ? "&" : "?"}v=elvify-pdf-worker-2`;

const tools = [
    {
        key: "editor",
        title: "PDF Editor",
        description: "Edit detected text visually, add new text, and highlight areas.",
        endpoint: "",
        accept: ".pdf,application/pdf",
        multiple: false,
        icon: Edit3,
    },
    {
        key: "merge",
        title: "Merge PDF",
        description: "Combine multiple PDF files into one clean document.",
        endpoint: API_ENDPOINTS.PDF_TOOLS_JOB_MERGE,
        accept: ".pdf,application/pdf",
        multiple: true,
        icon: Files,
    },
    {
        key: "compress",
        title: "Compress PDF",
        description: "Reduce PDF file size using document compression presets.",
        endpoint: API_ENDPOINTS.PDF_TOOLS_JOB_COMPRESS,
        accept: ".pdf,application/pdf",
        multiple: false,
        icon: FileArchive,
        options: "compress",
    },
    {
        key: "word",
        title: "Word to PDF",
        description: "Convert DOC and DOCX files to PDF.",
        endpoint: API_ENDPOINTS.PDF_TOOLS_JOB_OFFICE_TO_PDF,
        accept: ".doc,.docx",
        multiple: false,
        icon: FileText,
    },
    {
        key: "excel",
        title: "Excel to PDF",
        description: "Convert XLS and XLSX spreadsheets to PDF.",
        endpoint: API_ENDPOINTS.PDF_TOOLS_JOB_OFFICE_TO_PDF,
        accept: ".xls,.xlsx",
        multiple: false,
        icon: Sheet,
    },
    {
        key: "ppt",
        title: "PPT to PDF",
        description: "Convert PPT and PPTX presentations to PDF.",
        endpoint: API_ENDPOINTS.PDF_TOOLS_JOB_OFFICE_TO_PDF,
        accept: ".ppt,.pptx",
        multiple: false,
        icon: Presentation,
    },
    {
        key: "image",
        title: "Image to PDF",
        description: "Turn JPG, PNG, or WEBP images into a paged PDF.",
        endpoint: API_ENDPOINTS.PDF_TOOLS_JOB_IMAGE_TO_PDF,
        accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
        multiple: true,
        icon: FileImage,
    },
];

const formatBytes = (size) => {
    const value = Number(size || 0);
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
};

const getErrorMessage = (error, fallback) =>
    String(error?.response?.data?.message || error?.message || fallback || "Request failed.");

function PdfTools() {
    const [activeKey, setActiveKey] = useState("editor");
    const activeTool = useMemo(() => tools.find((tool) => tool.key === activeKey) || tools[0], [activeKey]);

    return (
        <>
            <TopNavOnly />
            <main className="pdf-tools-page">
                <aside className="pdf-tools-sidebar">
                    <div className="pdf-tools-brand">
                        <div className="pdf-tools-brand-mark">PDF</div>
                        <div>
                            <strong>PDF Tools</strong>
                            <span>Elvify workspace</span>
                        </div>
                    </div>
                    <nav className="pdf-tools-nav">
                        {tools.map((tool) => {
                            const Icon = tool.icon;
                            return (
                                <button
                                    className={tool.key === activeKey ? "pdf-tools-nav-button active" : "pdf-tools-nav-button"}
                                    key={tool.key}
                                    onClick={() => setActiveKey(tool.key)}
                                    type="button"
                                    title={tool.title}
                                >
                                    <Icon size={18} />
                                    <span>{tool.title}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>
                {activeTool.key === "editor" ? (
                    <PdfEditor />
                ) : (
                    <ToolPanel key={activeTool.key} tool={activeTool} />
                )}
            </main>
            <AppFooter />
        </>
    );
}

function ToolPanel({ tool }) {
    const inputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [compressLevel, setCompressLevel] = useState("ebook");
    const [jobId, setJobId] = useState(null);
    const [job, setJob] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!jobId || job?.status === "completed" || job?.status === "failed") return undefined;
        const timer = window.setInterval(async () => {
            try {
                setJob(await getPdfToolJob(jobId));
            } catch (err) {
                setError(getErrorMessage(err, "Could not refresh job."));
            }
        }, 1200);
        return () => window.clearInterval(timer);
    }, [jobId, job?.status]);

    const addFiles = (fileList) => {
        if (!fileList) return;
        const nextFiles = Array.from(fileList);
        setFiles(tool.multiple ? [...files, ...nextFiles] : nextFiles.slice(0, 1));
        setError("");
        setJobId(null);
        setJob(null);
    };

    const moveFile = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= files.length) return;
        const next = [...files];
        [next[index], next[target]] = [next[target], next[index]];
        setFiles(next);
    };

    const processFiles = async () => {
        if (!files.length) {
            setError("Choose at least one file first.");
            return;
        }

        setBusy(true);
        setError("");
        setJob(null);
        setJobId(null);
        try {
            const uploaded = await uploadPdfToolFiles(files);
            const payload = tool.options === "compress" ? { level: compressLevel } : {};
            const created = await createPdfToolJob(tool.endpoint, uploaded.files.map((file) => file.id), payload);
            setJobId(created.jobId);
            setJob(await getPdfToolJob(created.jobId));
        } catch (err) {
            setError(getErrorMessage(err, "Processing failed."));
        } finally {
            setBusy(false);
        }
    };

    const Icon = tool.icon;

    return (
        <section className="pdf-tools-workspace">
            <header className="pdf-tools-workspace-header">
                <div className="pdf-tools-title-block">
                    <div className="pdf-tools-title-icon">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h1>{tool.title}</h1>
                        <p>{tool.description}</p>
                    </div>
                </div>
            </header>

            <div className="pdf-tools-grid">
                <section className="pdf-tools-panel">
                    <button
                        className="pdf-tools-drop-zone"
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                            event.preventDefault();
                            addFiles(event.dataTransfer.files);
                        }}
                        type="button"
                    >
                        <Upload size={30} />
                        <strong>Drop files here or browse</strong>
                        <span>{tool.multiple ? "Multiple files supported" : "One file required"}</span>
                    </button>
                    <input
                        ref={inputRef}
                        className="pdf-tools-hidden-input"
                        type="file"
                        multiple={tool.multiple}
                        accept={tool.accept}
                        onChange={(event) => addFiles(event.target.files)}
                    />

                    {tool.options === "compress" ? (
                        <label className="pdf-tools-field">
                            <span>Compression level</span>
                            <select value={compressLevel} onChange={(event) => setCompressLevel(event.target.value)}>
                                <option value="screen">Smallest</option>
                                <option value="ebook">Balanced</option>
                                <option value="printer">Print quality</option>
                                <option value="prepress">High quality</option>
                            </select>
                        </label>
                    ) : null}

                    <div className="pdf-tools-file-list">
                        {files.map((file, index) => (
                            <div className="pdf-tools-file-row" key={`${file.name}-${index}`}>
                                <div>
                                    <strong>{file.name}</strong>
                                    <span>{formatBytes(file.size)}</span>
                                </div>
                                {tool.multiple ? (
                                    <div className="pdf-tools-row-actions">
                                        <button title="Move up" type="button" onClick={() => moveFile(index, -1)}>
                                            <ArrowUpDown size={16} />
                                        </button>
                                        <button title="Move down" type="button" onClick={() => moveFile(index, 1)}>
                                            <ArrowUpDown size={16} />
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    <button className="pdf-tools-primary-button" type="button" onClick={processFiles} disabled={busy}>
                        {busy ? <Loader2 className="pdf-tools-spin" size={18} /> : <Upload size={18} />}
                        <span>{busy ? "Uploading" : `Start ${tool.title}`}</span>
                    </button>
                </section>

                <section className="pdf-tools-panel pdf-tools-status-panel">
                    <h2>Job Status</h2>
                    {!job && !error ? <p className="pdf-tools-muted">Your processing result will appear here.</p> : null}
                    {error ? (
                        <div className="pdf-tools-state error">
                            <XCircle size={24} />
                            <span>{error}</span>
                        </div>
                    ) : null}
                    {job ? (
                        <div className="pdf-tools-job-box">
                            <div className={`pdf-tools-state ${job.status}`}>
                                {job.status === "completed" ? (
                                    <CheckCircle2 size={24} />
                                ) : (
                                    <Loader2 className="pdf-tools-spin" size={24} />
                                )}
                                <span>{job.status}</span>
                            </div>
                            <div className="pdf-tools-progress-track">
                                <div className="pdf-tools-progress-fill" style={{ width: `${job.progress}%` }} />
                            </div>
                            {job.error ? <p className="pdf-tools-error-text">{job.error}</p> : null}
                            {job.status === "completed" ? (
                                <button className="pdf-tools-download-button" type="button" onClick={() => downloadPdfToolJob(job)}>
                                    <ArrowDownToLine size={18} />
                                    <span>Download {job.outputName || "PDF"}</span>
                                </button>
                            ) : null}
                        </div>
                    ) : null}
                </section>
            </div>
        </section>
    );
}

function PdfEditor() {
    const inputRef = useRef(null);
    const [sourceFile, setSourceFile] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [pdfDocument, setPdfDocument] = useState(null);
    const [pages, setPages] = useState([]);
    const [elements, setElements] = useState([]);
    const [zoom, setZoom] = useState(1);
    const [mode, setMode] = useState("select");
    const [focusedElementId, setFocusedElementId] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [downloadJob, setDownloadJob] = useState(null);
    const sourceBlobUrlRef = useRef("");

    useEffect(() => () => {
        if (sourceBlobUrlRef.current) URL.revokeObjectURL(sourceBlobUrlRef.current);
    }, []);

    useEffect(() => {
        if (!uploadedFile) return undefined;
        let cancelled = false;

        const loadPdf = async () => {
            setBusy(true);
            setError("");
            setDownloadJob(null);
            try {
                if (sourceBlobUrlRef.current) URL.revokeObjectURL(sourceBlobUrlRef.current);
                const blobUrl = await getPdfToolFileBlobUrl(uploadedFile.id);
                sourceBlobUrlRef.current = blobUrl;
                const loadingTask = pdfjs.getDocument(blobUrl);
                const pdf = await loadingTask.promise;
                if (cancelled) return;

                const nextPages = [];
                const nextElements = [];
                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                    const page = await pdf.getPage(pageNumber);
                    const viewport = page.getViewport({ scale: 1 });
                    nextPages.push({
                        pageIndex: pageNumber - 1,
                        width: viewport.width,
                        height: viewport.height,
                        canvasRef: null,
                    });

                    const textContent = await page.getTextContent();
                    textContent.items.forEach((item) => {
                        if (!item.str?.trim()) return;
                        const transform = pdfjs.Util.transform(viewport.transform, item.transform);
                        const x = transform[4];
                        const fontHeight = Math.hypot(transform[2], transform[3]) || Math.abs(transform[3]) || 12;
                        const y = transform[5] - fontHeight;
                        nextElements.push({
                            id: `text-${pageNumber}-${nextElements.length}`,
                            pageIndex: pageNumber - 1,
                            type: "detected-text",
                            value: item.str,
                            originalValue: item.str,
                            x,
                            y,
                            width: Math.max(item.width || 0, item.str.length * fontHeight * 0.5),
                            height: fontHeight * 1.25,
                            pageWidth: viewport.width,
                            pageHeight: viewport.height,
                            fontSize: fontHeight,
                            color: "#111111",
                        });
                    });
                }

                setPdfDocument(pdf);
                setPages(nextPages);
                setElements(nextElements);
            } catch (err) {
                setError(getErrorMessage(err, "Could not load PDF."));
            } finally {
                setBusy(false);
            }
        };

        loadPdf();
        return () => {
            cancelled = true;
        };
    }, [uploadedFile]);

    useEffect(() => {
        if (!pdfDocument || !pages.length) return undefined;
        let cancelled = false;
        const renderPages = async () => {
            for (const pageView of pages) {
                if (!pageView.canvasRef) continue;
                const page = await pdfDocument.getPage(pageView.pageIndex + 1);
                if (cancelled) return;
                const viewport = page.getViewport({ scale: zoom });
                const canvas = pageView.canvasRef;
                const context = canvas.getContext("2d");
                if (!context) continue;
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvas, canvasContext: context, viewport }).promise;
            }
        };

        renderPages();
        return () => {
            cancelled = true;
        };
    }, [pdfDocument, pages, zoom]);

    const choosePdf = async (fileList) => {
        const file = fileList?.[0];
        if (!file) return;
        setSourceFile(file);
        setBusy(true);
        setError("");
        setDownloadJob(null);
        try {
            const result = await uploadPdfToolFiles([file]);
            setUploadedFile(result.files[0]);
        } catch (err) {
            setError(getErrorMessage(err, "Upload failed."));
        } finally {
            setBusy(false);
        }
    };

    const updateElement = (id, patch) => {
        setElements((current) =>
            current.map((element) =>
                element.id === id
                    ? {
                          ...element,
                          ...patch,
                          changed: true,
                      }
                    : element
            )
        );
    };

    const addElement = (page, x, y) => {
        if (mode === "select") return;
        const isText = mode === "text";
        setElements((current) => [
            ...current,
            {
                id: `${mode}-${Date.now()}`,
                pageIndex: page.pageIndex,
                type: isText ? "text" : "highlight",
                value: isText ? "New text" : undefined,
                x: x / zoom,
                y: y / zoom,
                width: isText ? 160 : 180,
                height: isText ? 28 : 22,
                pageWidth: page.width,
                pageHeight: page.height,
                fontSize: 16,
                color: isText ? "#111111" : "#fff176",
                opacity: isText ? 1 : 0.45,
                changed: true,
                selected: true,
            },
        ]);
        setMode("select");
    };

    const exportPdf = async () => {
        if (!uploadedFile) return;
        setBusy(true);
        setError("");
        setDownloadJob(null);
        try {
            const changedElements = elements.filter((element) => element.changed);
            const result = await exportEditedPdf(uploadedFile.id, changedElements);
            const job = await getPdfToolJob(result.jobId);
            setDownloadJob(job);
        } catch (err) {
            setError(getErrorMessage(err, "Export failed."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="pdf-tools-workspace pdf-tools-editor-workspace">
            <header className="pdf-tools-workspace-header pdf-tools-editor-header">
                <div className="pdf-tools-title-block">
                    <div className="pdf-tools-title-icon">
                        <Type size={24} />
                    </div>
                    <div>
                        <h1>PDF Editor</h1>
                        <p>Edit detected text visually, add text, highlight, and export a fresh PDF.</p>
                    </div>
                </div>
                <div className="pdf-tools-editor-actions">
                    <button className={mode === "select" ? "pdf-tools-tool-button active" : "pdf-tools-tool-button"} type="button" onClick={() => setMode("select")} title="Select">
                        <MousePointer2 size={17} />
                    </button>
                    <button className={mode === "text" ? "pdf-tools-tool-button active" : "pdf-tools-tool-button"} type="button" onClick={() => setMode("text")} title="Add text">
                        <Plus size={17} />
                        <Type size={17} />
                    </button>
                    <button className={mode === "highlight" ? "pdf-tools-tool-button active" : "pdf-tools-tool-button"} type="button" onClick={() => setMode("highlight")} title="Highlight">
                        <Highlighter size={17} />
                    </button>
                    <label className="pdf-tools-zoom-control">
                        <span>Zoom</span>
                        <input min="0.6" max="1.8" step="0.1" type="range" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
                    </label>
                    <button className="pdf-tools-primary-button compact" type="button" disabled={!uploadedFile || busy} onClick={exportPdf}>
                        {busy ? <Loader2 className="pdf-tools-spin" size={18} /> : <Download size={18} />}
                        <span>Export</span>
                    </button>
                </div>
            </header>

            {!uploadedFile ? (
                <section className="pdf-tools-panel pdf-tools-editor-upload">
                    <button className="pdf-tools-drop-zone" type="button" onClick={() => inputRef.current?.click()}>
                        <Upload size={30} />
                        <strong>Upload PDF to edit</strong>
                        <span>Existing text will become editable overlay fields</span>
                    </button>
                    <input ref={inputRef} className="pdf-tools-hidden-input" type="file" accept=".pdf,application/pdf" onChange={(event) => choosePdf(event.target.files)} />
                </section>
            ) : null}

            {sourceFile ? (
                <div className="pdf-tools-editor-meta">
                    <strong>{sourceFile.name}</strong>
                    <span>{formatBytes(sourceFile.size)}</span>
                </div>
            ) : null}

            {error ? <div className="pdf-tools-editor-notice pdf-tools-error-text">{error}</div> : null}
            {downloadJob ? (
                <button className="pdf-tools-download-button pdf-tools-editor-download" type="button" onClick={() => downloadPdfToolJob(downloadJob)}>
                    <Download size={18} />
                    <span>Download edited PDF</span>
                </button>
            ) : null}

            {uploadedFile ? (
                <div className="pdf-tools-pdf-stage">
                    {pages.map((page) => (
                        <div
                            className="pdf-tools-pdf-page"
                            key={page.pageIndex}
                            style={{ width: page.width * zoom, height: page.height * zoom }}
                            onDoubleClick={(event) => {
                                const rect = event.currentTarget.getBoundingClientRect();
                                addElement(page, event.clientX - rect.left, event.clientY - rect.top);
                            }}
                        >
                            <canvas
                                ref={(node) => {
                                    page.canvasRef = node;
                                }}
                            />
                            <div className="pdf-tools-text-layer">
                                {elements
                                    .filter((element) => element.pageIndex === page.pageIndex)
                                    .map((element) => (
                                        <EditableElement
                                            key={element.id}
                                            element={element}
                                            zoom={zoom}
                                            isFocused={focusedElementId === element.id}
                                            onFocus={() => setFocusedElementId(element.id)}
                                            onBlur={() => setFocusedElementId((current) => (current === element.id ? "" : current))}
                                            onChange={updateElement}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </section>
    );
}

function EditableElement({ element, zoom, isFocused, onFocus, onBlur, onChange }) {
    const dragRef = useRef(null);
    const isDetectedText = element.type === "detected-text";
    const isEditingDetectedText = isDetectedText && (isFocused || element.changed);
    const className = [
        "pdf-tools-editor-element",
        element.type === "highlight" ? "highlight" : "",
        isDetectedText ? "detected" : "",
        isEditingDetectedText ? "is-editing" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={className}
            style={{
                left: element.x * zoom,
                top: element.y * zoom,
                width: element.width * zoom,
                minHeight: element.height * zoom,
                fontSize: Math.max(8, element.fontSize * zoom),
                color: element.color,
                background: element.type === "highlight" ? element.color : undefined,
                opacity: element.type === "highlight" ? element.opacity : 1,
            }}
            onPointerDown={(event) => {
                if (event.target.tagName === "INPUT") return;
                dragRef.current = { startX: event.clientX, startY: event.clientY, x: element.x, y: element.y };
                event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
                if (!dragRef.current) return;
                const dx = (event.clientX - dragRef.current.startX) / zoom;
                const dy = (event.clientY - dragRef.current.startY) / zoom;
                onChange(element.id, { x: dragRef.current.x + dx, y: dragRef.current.y + dy });
            }}
            onPointerUp={() => {
                dragRef.current = null;
            }}
        >
            {element.type === "highlight" ? (
                <span />
            ) : (
                <input
                    value={element.value || ""}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={(event) => onChange(element.id, { value: event.target.value })}
                    style={{ fontSize: Math.max(8, element.fontSize * zoom), color: element.color }}
                />
            )}
            <span
                className="pdf-tools-resize-handle"
                onPointerDown={(event) => {
                    event.stopPropagation();
                    const startX = event.clientX;
                    const startY = event.clientY;
                    const startWidth = element.width;
                    const startHeight = element.height;
                    const target = event.currentTarget;
                    target.setPointerCapture(event.pointerId);
                    target.onpointermove = (moveEvent) => {
                        onChange(element.id, {
                            width: Math.max(20, startWidth + (moveEvent.clientX - startX) / zoom),
                            height: Math.max(10, startHeight + (moveEvent.clientY - startY) / zoom),
                        });
                    };
                    target.onpointerup = () => {
                        target.onpointermove = null;
                        target.onpointerup = null;
                    };
                }}
            />
        </div>
    );
}

export default PdfTools;

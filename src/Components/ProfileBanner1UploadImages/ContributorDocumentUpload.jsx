import React, { useMemo, useState } from "react";
import axios from "axios";
import { FileText, Upload, X } from "lucide-react";
import { message } from "antd";
import api from "../../Services/api";
import { API_ENDPOINTS } from "../../config/api.config";

function ContributorDocumentUpload({
  label,
  helperText,
  documentValue,
  setDocumentValue,
  required = false,
}) {
  const [loading, setLoading] = useState(false);

  const previewBoxStyle = {
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    minHeight: "180px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    overflow: "hidden",
  };

  const preview = useMemo(() => {
    if (!documentValue?.url) return null;
    const mimeType = String(documentValue.mimeType || "").toLowerCase();
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType.includes("pdf") || documentValue.url.toLowerCase().endswith(".pdf");
    return { isImage, isPdf };
  }, [documentValue]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLoading(true);
    try {
      const presignRes = await api.post(API_ENDPOINTS.GET_PRESIGNED_PROFILE_IMAGE_URL, {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
      });

      const { presignedUrl, s3Url, s3Key, uploadHeaders } = presignRes.data.data;

      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          ...(uploadHeaders || {}),
        },
      });

      setDocumentValue({
        url: s3Url,
        s3Key,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      });
      message.success(`${label} uploaded`);
    } catch (error) {
      console.error(`Error uploading ${label}:`, error);
      const apiMessage = error?.response?.data?.message;
      message.error(apiMessage || `Failed to upload ${label}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setDocumentValue(null);
  };

  return (
    <div className="contrib-doc">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
        <div>
          <label className="profile-label d-flex align-items-center gap-2 mb-1">
            <FileText size={16} />
            <span>{label}</span>
            {required ? <span className="text-danger">*</span> : null}
          </label>
          {helperText ? <div className="small text-muted">{helperText}</div> : null}
        </div>
        {documentValue?.url ? (
          <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={handleRemove}>
            <X size={14} className="me-1" /> Remove
          </button>
        ) : null}
      </div>

      <div className="contrib-doc__box" style={previewBoxStyle}>
        {preview?.isImage ? (
          <img src={documentValue.url} alt={label} className="contrib-doc__image" style={{ maxWidth: "100%", maxHeight: "220px", objectFit: "contain", borderRadius: "12px" }} />
        ) : documentValue?.url ? (
          <div className="contrib-doc__file d-flex align-items-center gap-3" style={{ width: "100%" }}>
            <FileText size={28} />
            <div className="contrib-doc__meta d-flex flex-column gap-1">
              <strong>{documentValue.fileName || `${label} file`}</strong>
              <span>{preview?.isPdf ? "PDF document" : (documentValue.mimeType || "Uploaded document")}</span>
              <a href={documentValue.url} target="_blank" rel="noreferrer">Preview file</a>
            </div>
          </div>
        ) : (
          <div className="contrib-doc__empty d-flex flex-column align-items-center justify-content-center gap-2 text-muted">
            <Upload size={22} />
            <span>No file uploaded yet</span>
          </div>
        )}
      </div>

      <div className="mt-2">
        <input
          type="file"
          id={`doc-upload-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
          className="d-none"
          accept="image/*,.pdf,.jpeg,.jpg,.png,.webp"
          onChange={handleUpload}
        />
        <label
          htmlFor={`doc-upload-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
          className={`btn btn-outline-dark ${loading ? "disabled" : ""}`}
        >
          {loading ? "Uploading..." : documentValue?.url ? `Replace ${label}` : `Upload ${label}`}
        </label>
      </div>
    </div>
  );
}

export default ContributorDocumentUpload;

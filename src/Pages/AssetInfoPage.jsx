import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../Services/api";
import { API_ENDPOINTS } from "../config/api.config";
import { getAssetDisplayName } from "../utils/assetName";

const formatBytes = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return "N/A";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(value) / Math.log(1024)));
  const sized = value / Math.pow(1024, idx);
  return `${sized.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleString();
};

function AssetInfoPage() {
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchInfo = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(API_ENDPOINTS.GET_PUBLIC_ASSET_INFO(id));
        if (!mounted) return;
        setAsset(res?.data?.data || null);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load asset info.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetchInfo();
    return () => {
      mounted = false;
    };
  }, [id]);

  const detailPath = useMemo(() => {
    const current = location.pathname || "";
    return current.endsWith("/info") ? current.slice(0, -5) : `/asset/${id}`;
  }, [location.pathname, id]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger rounded-3 mb-3">{error || "Asset not found."}</div>
        <Link to={detailPath} className="btn btn-outline-primary btn-sm">Back to asset</Link>
      </div>
    );
  }

  const width = asset?.fileMetadata?.dimensions?.width;
  const height = asset?.fileMetadata?.dimensions?.height;
  const dimensions = width && height ? `${width} x ${height}` : "N/A";
  const uploader = asset?.uploader || {};
  const assetDisplayName = getAssetDisplayName(asset, "Asset info");

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <h3 className="mb-1">{assetDisplayName}</h3>
            <div className="text-muted small">Asset ID: {asset?._id}</div>
          </div>
          <div className="d-flex gap-2">
            <Link to={detailPath} className="btn btn-outline-secondary btn-sm">Back to asset</Link>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigator.clipboard?.writeText(asset?._id || "")}
            >
              Copy asset ID
            </button>
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100 bg-light">
              <div className="text-muted small">Downloads</div>
              <div className="h4 mb-0">{Number(asset?.downloads || 0)}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100 bg-light">
              <div className="text-muted small">Likes</div>
              <div className="h4 mb-0">{Number(asset?.likes || 0)}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100 bg-light">
              <div className="text-muted small">Shares</div>
              <div className="h4 mb-0">{Number(asset?.shares || 0)}</div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="border rounded-3 p-3 h-100">
              <h5 className="mb-3">Technical details</h5>
              <div className="row gy-2 small">
                <div className="col-5 text-muted">License</div>
                <div className="col-7">{asset?.freePremium || "N/A"}</div>
                <div className="col-5 text-muted">Format</div>
                <div className="col-7">{asset?.fileMetadata?.mimeType || asset?.imagetype || "N/A"}</div>
                <div className="col-5 text-muted">Dimensions</div>
                <div className="col-7">{dimensions}</div>
                <div className="col-5 text-muted">File size</div>
                <div className="col-7">{formatBytes(asset?.fileMetadata?.fileSize)}</div>
                <div className="col-5 text-muted">Category path</div>
                <div className="col-7">
                  {[asset?.category?.name, asset?.subcategory?.name, asset?.subsubcategory?.name]
                    .filter(Boolean)
                    .join(" / ") || "N/A"}
                </div>
                <div className="col-5 text-muted">Uploaded</div>
                <div className="col-7">{formatDate(asset?.createdAt)}</div>
                <div className="col-5 text-muted">Last updated</div>
                <div className="col-7">{formatDate(asset?.updatedAt)}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="border rounded-3 p-3 h-100">
              <h5 className="mb-3">Uploader</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={uploader?.profileImage || "https://via.placeholder.com/56"}
                  alt={uploader?.name || "Uploader"}
                  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "50%" }}
                />
                <div>
                  <div className="fw-semibold">{uploader?.name || "Unknown creator"}</div>
                  <div className="small text-muted">
                    {Number(uploader?.followersCount || 0)} followers
                  </div>
                </div>
              </div>
              {uploader?.creatorId && (
                <Link to={`/creatordetail/${uploader.creatorId}`} className="btn btn-outline-primary btn-sm mb-3">
                  View creator profile
                </Link>
              )}
              <div className="small text-muted">
                Creator total downloads: <span className="text-dark fw-semibold">{Number(uploader?.totalDownloads || 0)}</span>
              </div>
              <hr />
              <h6 className="mb-2">Keywords</h6>
              <div className="d-flex flex-wrap gap-2">
                {Array.isArray(asset?.keywords) && asset.keywords.length ? (
                  asset.keywords.slice(0, 20).map((kw) => (
                    <span key={kw} className="badge text-bg-light border">{kw}</span>
                  ))
                ) : (
                  <span className="text-muted small">No keywords available.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetInfoPage;

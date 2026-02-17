import React from "react";
import { Skeleton } from "antd";

export function QueryGridSkeleton({ count = 8 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="col-6 col-md-3">
                    <div className="lazy-image-wrapper" style={{ paddingBottom: "70%" }}>
                        <Skeleton.Image active style={{ width: "100%", height: "100%", borderRadius: 16 }} />
                    </div>
                </div>
            ))}
        </>
    );
}

export function QueryErrorRetry({ message = "Failed to load data", onRetry }) {
    return (
        <div className="alert alert-danger d-flex justify-content-between align-items-center py-2 mb-3">
            <span>{message}</span>
            <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={onRetry}>
                Retry
            </button>
        </div>
    );
}


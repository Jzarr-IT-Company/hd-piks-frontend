import React from "react";
import { Empty } from "antd";

function DownloadsTrendChart({ trendPoints }) {
    const max = Math.max(...trendPoints.map((p) => p.value), 1);

    return (
        <section className="stats-panel">
            <div className="stats-panel__header">
                <h4 className="stats-panel__title">Download trend (monthly)</h4>
            </div>
            {trendPoints.length === 0 ? (
                <Empty description="No trend data yet" />
            ) : (
                <div className="stats-bars">
                    {trendPoints.map((point) => (
                        <div className="stats-bars__item" key={point.label}>
                            <div className="stats-bars__value">{point.value}</div>
                            <div
                                className="stats-bars__bar"
                                style={{ height: `${Math.max(16, Math.round((point.value / max) * 140))}px` }}
                            />
                            <div className="stats-bars__label">{point.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default DownloadsTrendChart;


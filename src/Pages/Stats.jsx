import React from "react";
import { Alert, Spin } from "antd";
import DashboardShell from "../Components/DashboardShell/DashboardShell";
import { useAuth } from "../Context/AuthContext";
import useCreatorAssetMetrics from "../hooks/useCreatorAssetMetrics";
import StatsKpiCards from "../Components/Stats/StatsKpiCards";
import DownloadsTrendChart from "../Components/Stats/DownloadsTrendChart";
import TopDownloadedAssetsTable from "../Components/Stats/TopDownloadedAssetsTable";

function Stats() {
    const { userData, creatorData } = useAuth();
    const creatorId = creatorData?._id || userData?.creatorId?._id || userData?.creatorId;
    const {
        items,
        loading,
        error,
        stats,
        trendPoints,
    } = useCreatorAssetMetrics(creatorId, userData);

    return (
        <DashboardShell>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                    <Spin />
                </div>
            ) : (
                <>
                    {error ? <Alert type="error" showIcon message={error} className="mb-3" /> : null}
                    <StatsKpiCards stats={stats} />
                    <DownloadsTrendChart trendPoints={trendPoints} />
                    <TopDownloadedAssetsTable items={items} />
                </>
            )}
        </DashboardShell>
    );
}

export default Stats;

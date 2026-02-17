export const getContributorState = (userData, creatorData) => {
    const status = creatorData?.status || "not-applied";
    const rejectionReason = creatorData?.rejectionReason || "";
    const isApproved = userData?.role === "creator" || status === "approved";
    const isPending = status === "pending";
    const isRejected = status === "rejected";
    const isNotApplied = status === "not-applied";

    const statusLabel = isApproved
        ? "Approved"
        : isPending
            ? "Pending"
            : isRejected
                ? "Rejected"
                : "Not applied";

    const statusMessage = isApproved
        ? "Your creator profile is approved. You can switch to the contributor dashboard."
        : isPending
            ? "Your application is under review. This can take 2-4 business days."
            : isRejected
                ? `Application rejected${rejectionReason ? `: ${rejectionReason}` : ""}. Update your creator profile to reapply.`
                : "Start your creator application to sell your work.";

    return {
        status,
        rejectionReason,
        isApproved,
        isPending,
        isRejected,
        isNotApplied,
        statusLabel,
        statusMessage,
    };
};


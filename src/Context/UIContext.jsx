import React, { createContext, useContext, useMemo, useState } from "react";

const UIContext = createContext(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useUI must be used within UIProvider");
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [closeSidebar, setCloseSidebar] = useState(false);
    const [homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration] = useState("Photos");

    const value = useMemo(
        () => ({
            closeSidebar,
            setCloseSidebar,
            homeBannerSearchbarFilteration,
            setHomeBannerSearchbarFilteration,
        }),
        [closeSidebar, homeBannerSearchbarFilteration]
    );

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};


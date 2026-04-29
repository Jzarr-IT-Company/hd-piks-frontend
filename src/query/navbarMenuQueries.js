import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicCategories } from "./categoryQueries.js";
import { buildNavbarMegaMenu } from "../utils/navbarMenuConfig.js";

export const navbarMenuQueryKeys = {
    categories: ["navbar", "mega-menu-categories"],
};

export const useNavbarMegaMenuQuery = () => {
    const query = useQuery({
        queryKey: navbarMenuQueryKeys.categories,
        queryFn: fetchPublicCategories,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const menuItems = useMemo(
        () => buildNavbarMegaMenu(query.data || []),
        [query.data]
    );

    return {
        ...query,
        menuItems,
    };
};

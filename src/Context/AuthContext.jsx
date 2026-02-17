import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useCreatorMeQuery, useCurrentUserQuery } from "../query/authQueries.js";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [username, setUsername] = useState("");
    const [semail, setsEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userData, setUserData] = useState({});
    const [creatorData, setCreatorData] = useState(undefined);

    const id = Cookies.get("id");
    const token = Cookies.get("token");
    const isLoggedIn = Boolean(token && id);

    const currentUserQuery = useCurrentUserQuery(id, isLoggedIn);
    const creatorMeQuery = useCreatorMeQuery(isLoggedIn);

    useEffect(() => {
        if (!isLoggedIn) {
            setUserData({});
            return;
        }
        if (currentUserQuery.data) {
            setUserData(currentUserQuery.data);
        }
    }, [isLoggedIn, currentUserQuery.data]);

    useEffect(() => {
        if (!isLoggedIn) {
            setCreatorData(null);
            return;
        }
        if (creatorMeQuery.isLoading) {
            setCreatorData(undefined);
            return;
        }
        if (creatorMeQuery.data !== undefined) {
            setCreatorData(creatorMeQuery.data);
            return;
        }
        if (creatorMeQuery.isError) {
            setCreatorData(null);
        }
    }, [isLoggedIn, creatorMeQuery.isLoading, creatorMeQuery.data, creatorMeQuery.isError]);

    const value = useMemo(
        () => ({
            id,
            token,
            isLoggedIn,
            username,
            setUsername,
            semail,
            setsEmail,
            password,
            setPassword,
            confirmPassword,
            setConfirmPassword,
            userData,
            setUserData,
            creatorData,
            setCreatorData,
            authBootstrapLoading: currentUserQuery.isLoading || creatorMeQuery.isLoading,
        }),
        [
            id,
            token,
            isLoggedIn,
            username,
            semail,
            password,
            confirmPassword,
            userData,
            creatorData,
            currentUserQuery.isLoading,
            creatorMeQuery.isLoading,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


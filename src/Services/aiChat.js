import api from "./api.js";
import API_BASE_URL, { API_ENDPOINTS } from "../config/api.config.js";
import Cookies from "js-cookie";

const toCleanString = (value) => String(value || "").trim();

const parseSseEventBlock = (blockText) => {
    const raw = String(blockText || "").trim();
    if (!raw) return null;

    const lines = raw.split(/\r?\n/);
    let eventName = "message";
    const dataLines = [];

    lines.forEach((line) => {
        if (line.startsWith("event:")) {
            eventName = line.slice(6).trim() || "message";
            return;
        }
        if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trimStart());
        }
    });

    return {
        eventName,
        dataText: dataLines.join("\n"),
    };
};

const parseJsonSafe = (value) => {
    const text = toCleanString(value);
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

export const sendTextAiChat = async ({ message, conversationId = null }) => {
    const response = await api.post(API_ENDPOINTS.AI_TEXT_CHAT, {
        message,
        conversationId: conversationId || undefined,
    });
    return response?.data?.data || null;
};

export const sendTextAiChatStream = async ({
    message,
    conversationId = null,
    signal,
    onReady,
    onMeta,
    onChunk,
    onDone,
    onError,
}) => {
    const token = Cookies.get("token");
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AI_TEXT_CHAT_STREAM}`, {
        method: "POST",
        credentials: "include",
        signal,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            message,
            conversationId: conversationId || undefined,
        }),
    });

    if (!response.ok) {
        let payload = null;
        try {
            payload = await response.json();
        } catch {
            payload = null;
        }
        const error = new Error(
            toCleanString(payload?.message || response.statusText || "Failed to stream text chat")
        );
        error.response = {
            status: response.status,
            data: payload || {},
        };
        throw error;
    }

    const reader = response.body?.getReader?.();
    if (!reader) {
        const error = new Error("Streaming is not supported in this browser.");
        error.response = { status: 500, data: { message: error.message } };
        throw error;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let donePayload = null;
    let streamError = null;

    const emitEvent = (eventName, payload) => {
        if (eventName === "ready" && typeof onReady === "function") onReady(payload || {});
        if (eventName === "meta" && typeof onMeta === "function") onMeta(payload || {});
        if (eventName === "chunk" && typeof onChunk === "function") onChunk(payload || {});
        if (eventName === "done" && typeof onDone === "function") onDone(payload || {});
        if (eventName === "error" && typeof onError === "function") onError(payload || {});
        if (eventName === "error") {
            streamError = payload || {};
        }
        if (eventName === "done") {
            donePayload = payload || null;
        }
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() || "";

        blocks.forEach((block) => {
            const parsed = parseSseEventBlock(block);
            if (!parsed) return;
            const payload = parseJsonSafe(parsed.dataText) || {};
            emitEvent(parsed.eventName, payload);
        });
    }

    if (toCleanString(buffer)) {
        const parsed = parseSseEventBlock(buffer);
        if (parsed) {
            const payload = parseJsonSafe(parsed.dataText) || {};
            emitEvent(parsed.eventName, payload);
        }
    }

    if (streamError) {
        const error = new Error(
            toCleanString(streamError?.message || "Failed to stream text chat response")
        );
        error.response = {
            status: Number(streamError?.status || 500) || 500,
            data: streamError,
        };
        throw error;
    }

    return donePayload;
};

export const uploadPdfForAiChat = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(API_ENDPOINTS.AI_PDF_UPLOAD, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response?.data?.data || null;
};

export const sendPdfAiChat = async ({
    documentId,
    question,
    conversationId = null,
}) => {
    const response = await api.post(API_ENDPOINTS.AI_PDF_CHAT, {
        documentId,
        question,
        conversationId: conversationId || undefined,
    });
    return response?.data?.data || null;
};

export const listAiPdfDocuments = async () => {
    const response = await api.get(API_ENDPOINTS.AI_PDF_DOCS);
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const deleteAiPdfDocument = async (documentId) => {
    const response = await api.delete(API_ENDPOINTS.AI_PDF_DOC(documentId));
    return response?.data?.data || null;
};

export const listAiConversations = async ({
    kind = "text",
    documentId = null,
    limit = 40,
} = {}) => {
    const response = await api.get(API_ENDPOINTS.AI_CONVERSATIONS, {
        params: {
            kind: kind || "text",
            documentId: documentId || undefined,
            limit,
        },
    });
    return Array.isArray(response?.data?.data) ? response.data.data : [];
};

export const getAiConversationMessages = async (conversationId, { limit = 200 } = {}) => {
    const response = await api.get(API_ENDPOINTS.AI_CONVERSATION_MESSAGES(conversationId), {
        params: { limit },
    });
    return response?.data?.data || null;
};

export const deleteAiConversation = async (conversationId) => {
    const response = await api.delete(API_ENDPOINTS.AI_CONVERSATION(conversationId));
    return response?.data?.data || null;
};

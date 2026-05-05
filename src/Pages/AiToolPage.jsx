import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Services/api";
import { API_ENDPOINTS } from "../config/api.config.js";
import {
	sendTextAiChatStream,
	uploadPdfForAiChat,
	sendPdfAiChat,
	listAiPdfDocuments,
	deleteAiPdfDocument,
	listAiConversations,
	getAiConversationMessages,
	deleteAiConversation,
} from "../Services/aiChat.js";
import { generateAiVoiceover, listAiVoiceoverVoices } from "../Services/aiVoiceover.js";
import TopNavOnly from "../Components/AppNavbar/TopNavOnly";
import AppFooter from "../Components/AppFooter/AppFooter";
import AiToolArticleSection from "../Components/AiToolArticleSection";
import AiCareerAdvisorTool from "../Components/AiCareerAdvisor/AiCareerAdvisorTool";
import AiBusinessAdvisorTool from "../Components/AiBusinessAdvisor/AiBusinessAdvisorTool";
import AiEcommerceAdvisorTool from "../Components/AiEcommerceAdvisor/AiEcommerceAdvisorTool";
import { AI_TOOL_ARTICLES } from "../content/aiToolArticles";
import "./AiToolPage.css";

const primaryBtnStyle = {
	borderRadius: 999,
	padding: "8px 20px",
	background: "linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))",
	color: "#ffffff",
	border: "1px solid rgb(143, 92, 255)",
	boxShadow: "0 1px 3px rgba(15,23,42,0.25)",
	fontSize: 14,
	fontWeight: 500,
};

const AI_IMAGE_STYLE_OPTIONS = [
	{ value: "photorealistic", label: "Photorealistic" },
	{ value: "illustration", label: "Illustration" },
	{ value: "3d-render", label: "3D render" },
	{ value: "cinematic", label: "Cinematic" },
	{ value: "anime", label: "Anime" },
];

const AI_IMAGE_RATIO_OPTIONS = [
	{ value: "1:1", label: "1:1 Square" },
	{ value: "4:5", label: "4:5 Portrait" },
	{ value: "3:4", label: "3:4 Portrait" },
	{ value: "16:9", label: "16:9 Landscape" },
	{ value: "9:16", label: "9:16 Portrait" },
	{ value: "3:2", label: "3:2 Landscape" },
	{ value: "2:3", label: "2:3 Portrait" },
];

const AI_IMAGE_COUNT_OPTIONS = [
	{ value: 1, label: "1 image" },
	{ value: 2, label: "2 images" },
	{ value: 3, label: "3 images" },
	{ value: 4, label: "4 images" },
];

const AI_PROMPT_PRESETS = [
	{
		id: "product-ad",
		label: "Product Ad",
		style: "photorealistic",
		aspectRatio: "1:1",
		prompt:
			"Premium skincare bottle on a reflective marble surface, soft studio lighting, subtle water droplets, clean luxury product ad composition",
	},
	{
		id: "food-poster",
		label: "Food Poster",
		style: "cinematic",
		aspectRatio: "4:5",
		prompt:
			"Top-down gourmet burger with fries and sauce splashes, dramatic side lighting, rich textures, appetizing commercial food photography",
	},
	{
		id: "travel-scene",
		label: "Travel Scene",
		style: "photorealistic",
		aspectRatio: "16:9",
		prompt:
			"Golden hour mountain valley with a winding road and mist, ultra-detailed landscape, cinematic depth and natural color grading",
	},
	{
		id: "anime-portrait",
		label: "Anime Portrait",
		style: "anime",
		aspectRatio: "3:4",
		prompt:
			"Confident anime character portrait in futuristic streetwear, neon city background, sharp linework, vibrant colors, dynamic framing",
	},
];

const getTextAiWelcomeMessage = (mode = "text") =>
	mode === "pdf"
		? "PDF mode is active. Upload a PDF, select it, then ask grounded questions from that document."
		: "Hi, I am Text AI. Share your prompt and I can help with captions, ads, rewrite, and long-form content.";

const formatBytesToMbLabel = (bytes) => {
	const size = Number(bytes || 0);
	if (!Number.isFinite(size) || size <= 0) return "-";
	return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const extensionFromMime = (mimeType) => {
	const mime = String(mimeType || "").toLowerCase();
	if (mime.includes("png")) return "png";
	if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
	if (mime.includes("webp")) return "webp";
	return "png";
};

const sanitizeFileName = (value, fallback = "image") => {
	const cleaned = String(value || fallback)
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^a-zA-Z0-9._-]/g, "");
	return cleaned || fallback;
};

const BG_REMOVE_MAX_DIMENSION = 1800;
const BG_REMOVE_PREPROCESS_SIZE_BYTES = 8 * 1024 * 1024;
const BG_REMOVE_MIN_PROCESSING_VISUAL_MS = 2000;
const BG_REMOVE_REVEAL_MS = 1350;
const AI_GENERATE_MIN_VISUAL_MS = 1600;
const VOICEOVER_TEXT_MAX_LENGTH = 2500;
const VOICEOVER_DEFAULT_MODEL = "eleven_multilingual_v2";

const extensionFromAudioMime = (mimeType) => {
	const mime = String(mimeType || "").toLowerCase();
	if (mime.includes("wav")) return "wav";
	if (mime.includes("ogg")) return "ogg";
	if (mime.includes("webm")) return "webm";
	return "mp3";
};

const blobFromBase64Audio = (base64Audio, mimeType = "audio/mpeg") => {
	const normalized = String(base64Audio || "").trim();
	if (!normalized) return null;
	const binaryString = window.atob(normalized);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i += 1) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return new Blob([bytes], { type: String(mimeType || "audio/mpeg") });
};

const loadImageElement = (src) =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error("Failed to read image"));
		img.decoding = "async";
		img.src = src;
	});

const blobFromCanvas = (canvas, type, quality) =>
	new Promise((resolve) => {
		canvas.toBlob((blob) => resolve(blob || null), type, quality);
	});

const sleep = (ms) =>
	new Promise((resolve) => {
		window.setTimeout(resolve, ms);
	});

const preloadImage = (url, timeoutMs = 12000) =>
	new Promise((resolve) => {
		const image = new Image();
		let settled = false;
		let timeout = null;
		const finish = (ok) => {
			if (settled) return;
			settled = true;
			if (timeout) window.clearTimeout(timeout);
			resolve(ok);
		};
		image.onload = () => finish(true);
		image.onerror = () => finish(false);
		timeout = window.setTimeout(() => finish(false), timeoutMs);
		image.src = url;
	});

const preprocessImageForBgRemove = async (file) => {
	if (!file || !String(file.type || "").startsWith("image/")) return file;

	const objectUrl = URL.createObjectURL(file);
	try {
		const img = await loadImageElement(objectUrl);
		const sourceWidth = Number(img.naturalWidth || 0);
		const sourceHeight = Number(img.naturalHeight || 0);
		const maxSide = Math.max(sourceWidth, sourceHeight);
		const mustResize = maxSide > BG_REMOVE_MAX_DIMENSION || Number(file.size || 0) > BG_REMOVE_PREPROCESS_SIZE_BYTES;
		if (!mustResize) return file;

		const scale = maxSide > 0 ? Math.min(1, BG_REMOVE_MAX_DIMENSION / maxSide) : 1;
		const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
		const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

		const canvas = document.createElement("canvas");
		canvas.width = targetWidth;
		canvas.height = targetHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) return file;
		ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

		const outputType = "image/jpeg";
		const outputBlob = await blobFromCanvas(canvas, outputType, 0.9);
		if (!outputBlob) return file;

		const baseName = sanitizeFileName(String(file.name || "image").replace(/\.[a-z0-9]+$/i, ""), "image");
		return new File([outputBlob], `${baseName}-optimized.jpg`, {
			type: outputType,
			lastModified: Date.now(),
		});
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
};

function AiToolPage() {
	const { id } = useParams();
	const bgRemoveInputRef = useRef(null);
	const aiGenerateStageTimersRef = useRef([]);
	const textAiListRef = useRef(null);
	const textAiPdfInputRef = useRef(null);
	const [aiPrompt, setAiPrompt] = useState("");
	const [aiStyle, setAiStyle] = useState("photorealistic");
	const [aiAspectRatio, setAiAspectRatio] = useState("1:1");
	const [aiImageCount, setAiImageCount] = useState(1);
	const [aiGenerating, setAiGenerating] = useState(false);
	const [aiGenerationStep, setAiGenerationStep] = useState("idle");
	const [aiGenerateError, setAiGenerateError] = useState("");
	const [aiEnhanceError, setAiEnhanceError] = useState("");
	const [aiEnhancing, setAiEnhancing] = useState(false);
	const [aiSelectedPresetId, setAiSelectedPresetId] = useState("");
	const [aiResultsAnimationKey, setAiResultsAnimationKey] = useState(0);
	const [aiGeneratedImages, setAiGeneratedImages] = useState([]);
	const [aiSelectedImagePreview, setAiSelectedImagePreview] = useState(null);
	const [bgRemoveUploading, setBgRemoveUploading] = useState(false);
	const [bgRemoveProcessing, setBgRemoveProcessing] = useState(false);
	const [bgRemoveError, setBgRemoveError] = useState("");
	const [bgRemoveUploadProgress, setBgRemoveUploadProgress] = useState(0);
	const [bgRemoveProcessingProgress, setBgRemoveProcessingProgress] = useState(0);
	const [bgRemoveOriginalPreviewUrl, setBgRemoveOriginalPreviewUrl] = useState("");
	const [bgRemoveResultUrl, setBgRemoveResultUrl] = useState("");
	const [bgRemoveFileName, setBgRemoveFileName] = useState("");
	const [bgRemoveDragActive, setBgRemoveDragActive] = useState(false);
	const [bgRemovePreviewPhase, setBgRemovePreviewPhase] = useState("idle");
	const [bgRemoveMode, setBgRemoveMode] = useState("fast");
	const [textAiInput, setTextAiInput] = useState("");
	const [textAiSending, setTextAiSending] = useState(false);
	const [textAiError, setTextAiError] = useState("");
	const [textAiMode, setTextAiMode] = useState("text");
	const [textAiConversationId, setTextAiConversationId] = useState(null);
	const [textAiPdfConversationId, setTextAiPdfConversationId] = useState(null);
	const [textAiPdfDocs, setTextAiPdfDocs] = useState([]);
	const [textAiSelectedPdfDocId, setTextAiSelectedPdfDocId] = useState("");
	const [textAiPdfDocsLoading, setTextAiPdfDocsLoading] = useState(false);
	const [textAiPdfUploadBusy, setTextAiPdfUploadBusy] = useState(false);
	const [textAiPdfDeleteBusyId, setTextAiPdfDeleteBusyId] = useState("");
	const [textAiConversations, setTextAiConversations] = useState([]);
	const [textAiConversationsLoading, setTextAiConversationsLoading] = useState(false);
	const [textAiConversationOpeningId, setTextAiConversationOpeningId] = useState("");
	const [textAiConversationDeleteBusyId, setTextAiConversationDeleteBusyId] = useState("");
	const [textAiMessages, setTextAiMessages] = useState(() => [
		{
			role: "assistant",
			content: getTextAiWelcomeMessage("text"),
		},
	]);
	const [voiceoverText, setVoiceoverText] = useState("");
	const [voiceoverVoices, setVoiceoverVoices] = useState([]);
	const [voiceoverVoicesLoading, setVoiceoverVoicesLoading] = useState(false);
	const [voiceoverVoiceId, setVoiceoverVoiceId] = useState("");
	const [voiceoverModelId, setVoiceoverModelId] = useState(VOICEOVER_DEFAULT_MODEL);
	const [voiceoverStability, setVoiceoverStability] = useState(0.5);
	const [voiceoverSimilarityBoost, setVoiceoverSimilarityBoost] = useState(0.75);
	const [voiceoverStyle, setVoiceoverStyle] = useState(0);
	const [voiceoverUseSpeakerBoost, setVoiceoverUseSpeakerBoost] = useState(true);
	const [voiceoverGenerating, setVoiceoverGenerating] = useState(false);
	const [voiceoverError, setVoiceoverError] = useState("");
	const [voiceoverAudioUrl, setVoiceoverAudioUrl] = useState("");
	const [voiceoverAudioMeta, setVoiceoverAudioMeta] = useState(null);

	const titleMap = {
		"ai-advisor": "AI Career Advisor",
		"ai-text-voiceover": "AI Text Voiceover",
		"ai-bg-remove": "AI Background Remover",
		"ai-generator": "AI Image Generator",
		"ai-video-generator": "AI Video Generator",
		"ai-business": "Business with AI",
		"ai-commerce": "AI Ecommerce advisor",
		"text-ai": "Text AI Assistant",
	};

	const descMap = {
		"ai-advisor":
			"Get realistic career direction, income growth strategy, skill-gap analysis, and a step-by-step roadmap based on your profile.",
		"ai-text-voiceover":
			"Turn any image or script into an engaging voiceover for reels, explainers, and social content.",
		"ai-bg-remove":
			"Upload an image and instantly remove the background with AI. Ideal for product shots and thumbnails.",
		"ai-generator":
			"Describe your idea and let AI generate stunning visuals for your projects.",
		"ai-video-generator":
			"Generate high-quality videos with a prompt or an image, choosing from multiple generation models.",
		"ai-business":
			"Get practical business ideas, budget-aware execution plans, marketing strategy, and profitability estimates based on your background.",
		"ai-commerce": "Get a realistic ecommerce launch plan with platform selection, product ideas, investment breakdown, marketing blueprint, and growth timeline.",
		"text-ai":
			"Chat-style writing assistant for captions, ads, script drafts, and polished brand copy.",
	};

	const pageTitle = titleMap[id] || "AI Tool";
	const pageDesc =
		descMap[id] ||
		"Use AI-powered tools to enhance and generate creative assets for your projects.";
	const pageArticle = AI_TOOL_ARTICLES[id] || null;

	const clearAiGenerateStageTimers = () => {
		aiGenerateStageTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
		aiGenerateStageTimersRef.current = [];
	};

	const mapAiErrorMessage = (error, defaultMessage) => {
		const statusCode = Number(error?.response?.status || 0);
		const errorCode = String(error?.response?.data?.errorCode || "").trim().toLowerCase();
		const clientErrorCode = String(error?.code || "").trim().toUpperCase();
		const serverMessage = String(error?.response?.data?.message || "").trim();
		const fallbackMessage = serverMessage || error?.message || defaultMessage;

		if (errorCode === "quota_exceeded") {
			return "Daily/plan quota reached. Please check billing or try again later.";
		}
		if (errorCode === "rate_limited") {
			return "Too many requests right now. Wait a few seconds and retry.";
		}
		if (errorCode === "provider_timeout" || statusCode === 504) {
			return "Generation timed out. Try a shorter prompt or retry.";
		}
		if (clientErrorCode === "ECONNABORTED" || /timeout/i.test(String(error?.message || ""))) {
			return "Generation is taking longer than expected. Please retry or reduce image count.";
		}
		if (errorCode === "provider_auth_error") {
			return "AI provider key/config is invalid on server. Please check backend env.";
		}
		if (statusCode === 429) {
			return "Request limit reached. Please retry after a short wait.";
		}
		if (statusCode >= 500) {
			return "AI service is temporarily unavailable. Please try again.";
		}
		return fallbackMessage;
	};

	const scheduleAiGenerationStages = () => {
		clearAiGenerateStageTimers();
		const steps = [
			{ afterMs: 500, step: "generating" },
			{ afterMs: 1900, step: "finalizing" },
		];
		steps.forEach(({ afterMs, step }) => {
			const timerId = window.setTimeout(() => {
				setAiGenerationStep((current) =>
					current === "error" || current === "done" ? current : step
				);
			}, afterMs);
			aiGenerateStageTimersRef.current.push(timerId);
		});
	};

	const handleApplyPromptPreset = (preset) => {
		if (!preset) return;
		setAiSelectedPresetId(preset.id);
		setAiPrompt(String(preset.prompt || ""));
		if (preset.style) setAiStyle(String(preset.style));
		if (preset.aspectRatio) setAiAspectRatio(String(preset.aspectRatio));
		setAiEnhanceError("");
	};

	const mapTextAiErrorMessage = (error, fallback) => {
		const statusCode = Number(error?.response?.status || 0);
		const serverMessage = String(error?.response?.data?.message || "").trim();
		const providerMessage = String(error?.response?.data?.providerMessage || "").trim();
		const message = String(
			(serverMessage && serverMessage.toLowerCase() !== "bad request"
				? serverMessage
				: providerMessage || serverMessage) ||
				error?.message ||
				fallback ||
				"Request failed."
		).trim();
		if (statusCode === 401) return "Please login to use AI chat.";
		if (statusCode === 413) return "File is too large. Please upload a smaller PDF.";
		if (statusCode === 429) return "Too many requests. Please wait and retry.";
		if (statusCode >= 500) return "AI service is temporarily unavailable. Please try again.";
		return message || fallback || "Request failed.";
	};

	const mapVoiceoverErrorMessage = (error, fallback) => {
		const statusCode = Number(error?.response?.status || 0);
		const errorCode = String(error?.response?.data?.errorCode || "").trim().toLowerCase();
		const message = String(
			error?.response?.data?.message || error?.message || fallback || "Voiceover request failed."
		).trim();

		if (statusCode === 401) {
			if (errorCode === "provider_auth_error") {
				return "Voice provider authentication failed on server.";
			}
			return "Voiceover request was not authorized. Please verify backend deployment and provider configuration.";
		}
		if (errorCode === "provider_auth_error") return "Voice provider authentication failed on server.";
		if (errorCode === "quota_exceeded" || statusCode === 429) {
			return "Voice generation quota reached. Please retry later.";
		}
		if (errorCode === "provider_timeout" || statusCode === 504) {
			return "Voice generation timed out. Try shorter text and retry.";
		}
		if (statusCode >= 500) return "Voice service is temporarily unavailable. Please try again.";
		return message || fallback || "Voiceover request failed.";
	};

	const isConversationResettableError = (error) => {
		const errorCode = String(error?.response?.data?.errorCode || "").trim().toLowerCase();
		const message = String(error?.response?.data?.message || "").trim().toLowerCase();
		return (
			errorCode === "conversation_not_found" ||
			message === "conversation_not_found" ||
			errorCode === "conversation_kind_mismatch" ||
			message === "conversation_kind_mismatch" ||
			errorCode === "conversation_document_mismatch" ||
			message === "conversation_document_mismatch"
		);
	};

	const getSelectedPdfDoc = () =>
		textAiPdfDocs.find((item) => String(item?.id || "") === String(textAiSelectedPdfDocId || ""));

	const getActiveTextAiConversationId = () =>
		textAiMode === "pdf" ? String(textAiPdfConversationId || "") : String(textAiConversationId || "");

	const toUiChatMessages = (messages, mode = textAiMode) => {
		const mapped = Array.isArray(messages)
			? messages
					.map((item) => {
						const role = String(item?.role || "").toLowerCase() === "user" ? "user" : "assistant";
						const content = String(item?.content || "");
						if (!content.trim()) return null;
						return {
							id: String(item?.id || ""),
							role,
							content,
							citations: Array.isArray(item?.citations) ? item.citations : [],
						};
					})
					.filter(Boolean)
			: [];
		if (mapped.length) return mapped;
		return [
			{
				role: "assistant",
				content: getTextAiWelcomeMessage(mode),
			},
		];
	};

	const loadTextAiPdfDocs = async ({ keepCurrentSelection = true } = {}) => {
		try {
			setTextAiPdfDocsLoading(true);
			const docs = await listAiPdfDocuments();
			setTextAiPdfDocs(Array.isArray(docs) ? docs : []);
			if (!keepCurrentSelection) {
				setTextAiSelectedPdfDocId(String(docs?.[0]?.id || ""));
				return;
			}
			const hasCurrent = docs.some(
				(item) => String(item?.id || "") === String(textAiSelectedPdfDocId || "")
			);
			if (!hasCurrent) {
				setTextAiSelectedPdfDocId(String(docs?.[0]?.id || ""));
			}
		} catch (error) {
			setTextAiError(mapTextAiErrorMessage(error, "Failed to load PDF documents."));
		} finally {
			setTextAiPdfDocsLoading(false);
		}
	};

	const loadTextAiConversations = async ({ keepCurrentSelection = true } = {}) => {
		try {
			setTextAiConversationsLoading(true);
			const docsFilter = textAiMode === "pdf" ? textAiSelectedPdfDocId || null : null;
			const conversations = await listAiConversations({
				kind: textAiMode,
				documentId: docsFilter,
				limit: 60,
			});
			setTextAiConversations(Array.isArray(conversations) ? conversations : []);

			if (!keepCurrentSelection) return;
			const activeId = getActiveTextAiConversationId();
			if (!activeId) return;
			const exists = conversations.some(
				(item) => String(item?.id || "") === String(activeId || "")
			);
			if (exists) return;
			if (textAiMode === "pdf") {
				setTextAiPdfConversationId(null);
			} else {
				setTextAiConversationId(null);
			}
			setTextAiMessages([
				{
					role: "assistant",
					content: getTextAiWelcomeMessage(textAiMode),
				},
			]);
		} catch (error) {
			setTextAiError(mapTextAiErrorMessage(error, "Failed to load chat history."));
		} finally {
			setTextAiConversationsLoading(false);
		}
	};

	const handleOpenTextAiConversation = async (conversation) => {
		const conversationId = String(conversation?.id || "").trim();
		if (!conversationId || textAiSending) return;

		try {
			setTextAiConversationOpeningId(conversationId);
			setTextAiError("");
			const payload = await getAiConversationMessages(conversationId, { limit: 220 });
			const conversationMeta = payload?.conversation || {};
			const conversationKind =
				String(conversationMeta?.kind || conversation?.kind || textAiMode).toLowerCase() ===
				"pdf"
					? "pdf"
					: "text";

			if (conversationKind === "pdf") {
				setTextAiMode("pdf");
				setTextAiPdfConversationId(conversationId);
				setTextAiConversationId(null);
				const nextDocId = String(conversationMeta?.documentId || "").trim();
				if (nextDocId) {
					setTextAiSelectedPdfDocId(nextDocId);
				}
			} else {
				setTextAiMode("text");
				setTextAiConversationId(conversationId);
				setTextAiPdfConversationId(null);
			}

			setTextAiMessages(toUiChatMessages(payload?.messages, conversationKind));
		} catch (error) {
			setTextAiError(mapTextAiErrorMessage(error, "Failed to open conversation."));
		} finally {
			setTextAiConversationOpeningId("");
		}
	};

	const handleDeleteTextAiConversation = async (conversation, event) => {
		event?.preventDefault?.();
		event?.stopPropagation?.();
		const conversationId = String(conversation?.id || "").trim();
		if (!conversationId || textAiConversationDeleteBusyId || textAiSending) return;

		try {
			setTextAiError("");
			setTextAiConversationDeleteBusyId(conversationId);
			await deleteAiConversation(conversationId);

			const activeConversationId = getActiveTextAiConversationId();
			if (conversationId === String(activeConversationId || "")) {
				if (textAiMode === "pdf") {
					setTextAiPdfConversationId(null);
				} else {
					setTextAiConversationId(null);
				}
				setTextAiMessages([
					{
						role: "assistant",
						content: getTextAiWelcomeMessage(textAiMode),
					},
				]);
				setTextAiInput("");
			}

			await loadTextAiConversations({ keepCurrentSelection: true });
		} catch (error) {
			setTextAiError(mapTextAiErrorMessage(error, "Failed to delete conversation."));
		} finally {
			setTextAiConversationDeleteBusyId("");
		}
	};

	const handleOpenPdfPicker = () => {
		if (textAiPdfUploadBusy || textAiSending) return;
		textAiPdfInputRef.current?.click();
	};

	const handleUploadPdfForChat = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		const mime = String(file.type || "").toLowerCase();
		if (mime !== "application/pdf") {
			setTextAiError("Only PDF files are supported.");
			return;
		}

		try {
			setTextAiError("");
			setTextAiPdfUploadBusy(true);
			const response = await uploadPdfForAiChat(file);
			const uploadedDocId = String(response?.document?.id || "");
			await loadTextAiPdfDocs({ keepCurrentSelection: false });
			if (uploadedDocId) {
				setTextAiSelectedPdfDocId(uploadedDocId);
			}
			setTextAiMode("pdf");
		} catch (error) {
			setTextAiError(mapTextAiErrorMessage(error, "Failed to upload PDF for chat."));
		} finally {
			setTextAiPdfUploadBusy(false);
		}
	};

	const handleDeletePdfDoc = async (documentId) => {
		const normalizedId = String(documentId || "").trim();
		if (!normalizedId || textAiPdfDeleteBusyId) return;
		try {
			setTextAiError("");
			setTextAiPdfDeleteBusyId(normalizedId);
			await deleteAiPdfDocument(normalizedId);
			if (normalizedId === textAiSelectedPdfDocId) {
				setTextAiSelectedPdfDocId("");
			}
			await loadTextAiPdfDocs({ keepCurrentSelection: true });
		} catch (error) {
			setTextAiError(mapTextAiErrorMessage(error, "Failed to delete PDF document."));
		} finally {
			setTextAiPdfDeleteBusyId("");
		}
	};

	const handleSendTextAiMessage = async () => {
		const userText = String(textAiInput || "").trim();
		if (!userText || textAiSending) return;

		setTextAiInput("");
		setTextAiSending(true);
		setTextAiError("");
		setTextAiMessages((prev) => [
			...prev,
			{
				id: `user-${Date.now()}`,
				role: "user",
				content: userText,
			},
		]);

		try {
			if (textAiMode === "pdf") {
				const selectedDoc = getSelectedPdfDoc();
				if (!selectedDoc?.id) {
					throw new Error("Please select a PDF document first.");
				}
				if (String(selectedDoc?.status || "").toLowerCase() !== "ready") {
					throw new Error("Selected PDF is still processing. Please wait.");
				}

				const currentConversationId = textAiPdfConversationId || null;
				let data = null;
				try {
					data = await sendPdfAiChat({
						documentId: selectedDoc.id,
						question: userText,
						conversationId: currentConversationId,
					});
				} catch (error) {
					if (currentConversationId && isConversationResettableError(error)) {
						setTextAiPdfConversationId(null);
						data = await sendPdfAiChat({
							documentId: selectedDoc.id,
							question: userText,
							conversationId: null,
						});
					} else {
						throw error;
					}
				}

				const nextConversationId = String(data?.conversationId || "").trim();
				if (nextConversationId) {
					setTextAiPdfConversationId(nextConversationId);
				}

				const assistantText = String(data?.message?.content || "").trim() || "No answer returned.";
				const citations = Array.isArray(data?.message?.citations) ? data.message.citations : [];

				setTextAiMessages((prev) => [
					...prev,
					{ id: String(data?.message?.id || ""), role: "assistant", content: assistantText, citations },
				]);
			} else {
				const currentConversationId = textAiConversationId || null;
				const assistantPlaceholderId = `assistant-stream-${Date.now()}`;
				let streamedContent = "";
				setTextAiMessages((prev) => [
					...prev,
					{
						id: assistantPlaceholderId,
						role: "assistant",
						content: "",
						isStreaming: true,
					},
				]);

				const runTextStream = async (conversationIdForRequest) => {
					let streamDoneData = null;
					const streamResult = await sendTextAiChatStream({
						message: userText,
						conversationId: conversationIdForRequest,
						onMeta: (payload) => {
							const nextConversationId = String(payload?.conversationId || "").trim();
							if (nextConversationId) {
								setTextAiConversationId(nextConversationId);
							}
						},
						onChunk: (payload) => {
							const nextContent = String(payload?.content || "");
							const delta = String(payload?.delta || "");
							streamedContent = nextContent || `${streamedContent}${delta}`;
							setTextAiMessages((prev) =>
								prev.map((item) =>
									item?.id === assistantPlaceholderId
										? { ...item, content: streamedContent, isStreaming: true }
										: item
								)
							);
						},
						onDone: (payload) => {
							streamDoneData = payload?.data || null;
						},
					});
					return streamDoneData || streamResult?.data || null;
				};

				let data = null;
				try {
					data = await runTextStream(currentConversationId);
				} catch (error) {
					if (currentConversationId && isConversationResettableError(error)) {
						setTextAiConversationId(null);
						setTextAiMessages((prev) =>
							prev.map((item) =>
								item?.id === assistantPlaceholderId
									? { ...item, content: "", isStreaming: true }
									: item
							)
						);
						streamedContent = "";
						data = await runTextStream(null);
					} else {
						throw error;
					}
				}

				const nextConversationId = String(data?.conversationId || "").trim();
				if (nextConversationId) {
					setTextAiConversationId(nextConversationId);
				}
				const assistantText =
					String(data?.message?.content || "").trim() ||
					String(streamedContent || "").trim() ||
					"No answer returned.";
				setTextAiMessages((prev) =>
					prev.map((item) =>
						item?.id === assistantPlaceholderId
							? {
									...item,
									id: String(data?.message?.id || assistantPlaceholderId),
									content: assistantText,
									isStreaming: false,
							  }
							: item
					)
				);
			}
			await loadTextAiConversations({ keepCurrentSelection: true });
		} catch (error) {
			setTextAiError(mapTextAiErrorMessage(error, "Failed to generate response."));
			setTextAiMessages((prev) => [
				...prev.filter((item) => !item?.isStreaming),
				{
					role: "assistant",
					content: "I could not process that request right now. Please retry.",
				},
			]);
		} finally {
			setTextAiSending(false);
		}
	};

	const handleTextAiInputKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSendTextAiMessage();
		}
	};

	const handleStartNewTextAiChat = () => {
		setTextAiMessages([
			{
				role: "assistant",
				content: getTextAiWelcomeMessage(textAiMode),
			},
		]);
		setTextAiInput("");
		setTextAiSending(false);
		setTextAiError("");
		if (textAiMode === "text") {
			setTextAiConversationId(null);
		} else {
			setTextAiPdfConversationId(null);
		}
	};

	const loadVoiceoverVoices = async ({ keepSelection = true } = {}) => {
		try {
			setVoiceoverVoicesLoading(true);
			setVoiceoverError("");
			const voices = await listAiVoiceoverVoices();
			setVoiceoverVoices(Array.isArray(voices) ? voices : []);
			if (!keepSelection) {
				setVoiceoverVoiceId(String(voices?.[0]?.voiceId || ""));
				return;
			}
			const hasCurrentSelection = voices.some(
				(item) => String(item?.voiceId || "") === String(voiceoverVoiceId || "")
			);
			if (!hasCurrentSelection) {
				setVoiceoverVoiceId(String(voices?.[0]?.voiceId || ""));
			}
		} catch (error) {
			setVoiceoverError(mapVoiceoverErrorMessage(error, "Failed to load voices."));
		} finally {
			setVoiceoverVoicesLoading(false);
		}
	};

	const handleVoiceoverTextChange = (event) => {
		const nextText = String(event?.target?.value || "");
		setVoiceoverText(nextText.slice(0, VOICEOVER_TEXT_MAX_LENGTH));
	};

	const handleGenerateVoiceover = async () => {
		const trimmedText = String(voiceoverText || "").trim();
		if (!trimmedText || voiceoverGenerating) return;
		if (!voiceoverVoiceId) {
			setVoiceoverError("Please select a voice.");
			return;
		}

		try {
			setVoiceoverGenerating(true);
			setVoiceoverError("");
			const payload = await generateAiVoiceover({
				text: trimmedText,
				voiceId: voiceoverVoiceId,
				modelId: voiceoverModelId || VOICEOVER_DEFAULT_MODEL,
				stability: voiceoverStability,
				similarityBoost: voiceoverSimilarityBoost,
				style: voiceoverStyle,
				useSpeakerBoost: voiceoverUseSpeakerBoost,
			});
			const nextBase64Audio = String(payload?.audioBase64 || "").trim();
			if (!nextBase64Audio) {
				throw new Error("Voice provider returned empty audio.");
			}
			const mimeType = String(payload?.mimeType || "audio/mpeg");
			const audioBlob = blobFromBase64Audio(nextBase64Audio, mimeType);
			if (!audioBlob) {
				throw new Error("Failed to build audio preview.");
			}
			if (voiceoverAudioUrl && voiceoverAudioUrl.startsWith("blob:")) {
				URL.revokeObjectURL(voiceoverAudioUrl);
			}
			const nextAudioUrl = URL.createObjectURL(audioBlob);
			setVoiceoverAudioUrl(nextAudioUrl);
			setVoiceoverAudioMeta({
				mimeType,
				voiceId: String(payload?.voiceId || voiceoverVoiceId),
				modelId: String(payload?.modelId || voiceoverModelId || VOICEOVER_DEFAULT_MODEL),
				textLength: Number(payload?.textLength || trimmedText.length),
				outputFormat: String(payload?.outputFormat || ""),
			});
		} catch (error) {
			setVoiceoverError(mapVoiceoverErrorMessage(error, "Failed to generate voiceover."));
		} finally {
			setVoiceoverGenerating(false);
		}
	};

	const handleDownloadVoiceover = () => {
		const href = String(voiceoverAudioUrl || "").trim();
		if (!href) return;
		const ext = extensionFromAudioMime(voiceoverAudioMeta?.mimeType || "audio/mpeg");
		const link = document.createElement("a");
		link.href = href;
		link.download = `hdpiks-voiceover-${Date.now()}.${ext}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleGenerateAiImage = async () => {
		const trimmedPrompt = aiPrompt.trim();
		if (!trimmedPrompt || aiGenerating) return;

		try {
			const requestStartTime = Date.now();
			setAiGenerating(true);
			setAiGenerationStep("sending");
			setAiGenerateError("");
			setAiEnhanceError("");
			setAiGeneratedImages([]);
			scheduleAiGenerationStages();

			const requestTimeoutMs = Math.min(
				240000,
				Math.max(90000, Number(aiImageCount || 1) * 65000)
			);
			const response = await api.post(
				API_ENDPOINTS.AI_GENERATE_IMAGE,
				{
					prompt: trimmedPrompt,
					style: aiStyle,
					aspectRatio: aiAspectRatio,
					count: aiImageCount,
				},
				{ timeout: requestTimeoutMs }
			);

			const images = Array.isArray(response?.data?.data?.images)
				? response.data.data.images
				: [];

			if (!images.length) {
				setAiGeneratedImages([]);
				setAiGenerateError("No image returned. Try another prompt.");
				setAiGenerationStep("error");
				return;
			}

			const elapsedMs = Date.now() - requestStartTime;
			if (elapsedMs < AI_GENERATE_MIN_VISUAL_MS) {
				await sleep(AI_GENERATE_MIN_VISUAL_MS - elapsedMs);
			}

			setAiGeneratedImages(images);
			setAiResultsAnimationKey((value) => value + 1);
			setAiGenerationStep("done");
		} catch (error) {
			const message = mapAiErrorMessage(error, "Image generation failed. Please try again.");
			setAiGenerateError(message);
			setAiGenerationStep("error");
		} finally {
			clearAiGenerateStageTimers();
			setAiGenerating(false);
		}
	};

	const handleEnhancePrompt = async () => {
		const trimmedPrompt = aiPrompt.trim();
		if (!trimmedPrompt || aiEnhancing || aiGenerating) return;

		try {
			setAiEnhancing(true);
			setAiEnhanceError("");
			const response = await api.post(API_ENDPOINTS.AI_ENHANCE_PROMPT, {
				prompt: trimmedPrompt,
				style: aiStyle,
				aspectRatio: aiAspectRatio,
			});
			const enhancedPrompt = String(response?.data?.data?.enhancedPrompt || "").trim();
			if (!enhancedPrompt) {
				throw new Error("Prompt enhancement returned empty text.");
			}
			setAiPrompt(enhancedPrompt);
			setAiSelectedPresetId("");
		} catch (error) {
			setAiEnhanceError(mapAiErrorMessage(error, "Failed to enhance prompt. Please try again."));
		} finally {
			setAiEnhancing(false);
		}
	};

	const handleDownloadGeneratedImage = (image, index) => {
		const fallbackMime = "image/png";
		const mimeType = String(image?.mimeType || fallbackMime).trim() || fallbackMime;
		const href =
			String(image?.dataUrl || "").trim() ||
			(String(image?.base64 || "").trim()
				? `data:${mimeType};base64,${String(image.base64).trim()}`
				: "");

		if (!href) return;

		const ext = extensionFromMime(mimeType);
		const link = document.createElement("a");
		link.href = href;
		link.download = `hdpiks-ai-${Date.now()}-${index + 1}.${ext}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const getGeneratedImageSrc = (image) => {
		const fallbackMime = "image/png";
		const mimeType = String(image?.mimeType || fallbackMime).trim() || fallbackMime;
		return (
			String(image?.dataUrl || "").trim() ||
			(String(image?.base64 || "").trim()
				? `data:${mimeType};base64,${String(image.base64).trim()}`
				: "")
		);
	};

	const handleOpenGeneratedImagePreview = (image, index) => {
		const src = getGeneratedImageSrc(image);
		if (!src) return;
		setAiSelectedImagePreview({
			src,
			alt: `Generated ${index + 1}`,
		});
	};

	const handleCloseGeneratedImagePreview = () => {
		setAiSelectedImagePreview(null);
	};

	const handleDownloadAllGeneratedImages = () => {
		if (!Array.isArray(aiGeneratedImages) || !aiGeneratedImages.length) return;
		aiGeneratedImages.forEach((image, index) => {
			window.setTimeout(() => {
				handleDownloadGeneratedImage(image, index);
			}, index * 150);
		});
	};

	useEffect(() => {
		return () => {
			if (bgRemoveOriginalPreviewUrl && bgRemoveOriginalPreviewUrl.startsWith("blob:")) {
				URL.revokeObjectURL(bgRemoveOriginalPreviewUrl);
			}
		};
	}, [bgRemoveOriginalPreviewUrl]);

	useEffect(() => {
		return () => {
			if (bgRemoveResultUrl && bgRemoveResultUrl.startsWith("blob:")) {
				URL.revokeObjectURL(bgRemoveResultUrl);
			}
		};
	}, [bgRemoveResultUrl]);

	useEffect(() => {
		return () => {
			clearAiGenerateStageTimers();
		};
	}, []);

	useEffect(() => {
		if (!aiSelectedImagePreview) return undefined;
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				handleCloseGeneratedImagePreview();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [aiSelectedImagePreview]);

	useEffect(() => {
		if (id !== "text-ai") return;
		const listEl = textAiListRef.current;
		if (!listEl) return;
		listEl.scrollTop = listEl.scrollHeight;
	}, [id, textAiMessages, textAiSending]);

	useEffect(() => {
		if (id !== "ai-text-voiceover") return;
		loadVoiceoverVoices({ keepSelection: true });
	}, [id]);

	useEffect(() => {
		if (id !== "text-ai") return;
		loadTextAiPdfDocs({ keepCurrentSelection: true });
	}, [id]);

	useEffect(() => {
		if (id !== "text-ai") return;
		loadTextAiConversations({ keepCurrentSelection: true });
	}, [id, textAiMode, textAiSelectedPdfDocId]);

	useEffect(() => {
		if (id !== "text-ai") return undefined;
		const hasProcessingDoc = textAiPdfDocs.some(
			(item) => String(item?.status || "").toLowerCase() === "processing"
		);
		if (!hasProcessingDoc) return undefined;

		const intervalId = window.setInterval(() => {
			loadTextAiPdfDocs({ keepCurrentSelection: true });
		}, 4000);

		return () => window.clearInterval(intervalId);
	}, [id, textAiPdfDocs]);

	useEffect(() => {
		if (id !== "text-ai") return;
		const hasActiveConversation =
			textAiMode === "pdf"
				? Boolean(String(textAiPdfConversationId || "").trim())
				: Boolean(String(textAiConversationId || "").trim());
		if (hasActiveConversation) return;
		setTextAiMessages([
			{
				role: "assistant",
				content: getTextAiWelcomeMessage(textAiMode),
			},
		]);
		setTextAiInput("");
		setTextAiError("");
	}, [id, textAiMode, textAiConversationId, textAiPdfConversationId]);

	useEffect(() => {
		if (!bgRemoveResultUrl) return;
		setBgRemovePreviewPhase("revealing");
		const timer = window.setTimeout(() => {
			setBgRemovePreviewPhase("final");
		}, BG_REMOVE_REVEAL_MS);
		return () => window.clearTimeout(timer);
	}, [bgRemoveResultUrl]);

	useEffect(() => {
		if (!bgRemoveProcessing) {
			setBgRemoveProcessingProgress(bgRemoveResultUrl ? 100 : 0);
			return;
		}

		setBgRemoveProcessingProgress((prev) => (prev > 10 ? prev : 10));
		const timer = window.setInterval(() => {
			setBgRemoveProcessingProgress((prev) => {
				if (prev >= 92) return prev;
				const next = prev + 4 + Math.random() * 6;
				return Math.min(92, Math.round(next));
			});
		}, 380);

		return () => window.clearInterval(timer);
	}, [bgRemoveProcessing, bgRemoveResultUrl]);

	useEffect(
		() => () => {
			if (voiceoverAudioUrl && voiceoverAudioUrl.startsWith("blob:")) {
				URL.revokeObjectURL(voiceoverAudioUrl);
			}
		},
		[voiceoverAudioUrl]
	);

	const bgRemoveBusy = bgRemoveUploading || bgRemoveProcessing;
	const bgRemoveHasPreview = Boolean(bgRemoveOriginalPreviewUrl);
	const bgRemoveFinalView = Boolean(bgRemoveResultUrl && bgRemovePreviewPhase === "final");
	const bgRemovePreviewBaseUrl = bgRemoveFinalView ? bgRemoveResultUrl : bgRemoveOriginalPreviewUrl;
	const bgRemoveStepProgress = bgRemoveUploading
		? Math.round(Math.max(0, Math.min(55, (bgRemoveUploadProgress || 0) * 0.55)))
		: bgRemoveProcessing
		? 55 + Math.round(Math.max(0, Math.min(45, (bgRemoveProcessingProgress || 0) * 0.45)))
		: bgRemoveResultUrl
		? 100
		: 0;
	const getBgRemoveStepState = (stepKey) => {
		if (stepKey === "upload") {
			if (bgRemoveUploading) return "active";
			if (bgRemoveProcessing || bgRemoveResultUrl) return "done";
			return "idle";
		}
		if (stepKey === "process") {
			if (bgRemoveProcessing) return "active";
			if (bgRemoveResultUrl) return "done";
			return "idle";
		}
		if (stepKey === "final") {
			if (bgRemoveResultUrl) return "done";
			return "idle";
		}
		return "idle";
	};

	const aiGenerationSteps = [
		{ key: "sending", label: "Sending prompt" },
		{ key: "generating", label: "Generating visual" },
		{ key: "finalizing", label: "Finalizing output" },
	];

	const aiStepOrder = {
		idle: 0,
		sending: 1,
		generating: 2,
		finalizing: 3,
		done: 4,
		error: 4,
	};

	const getAiGenerationStepState = (stepKey) => {
		const currentOrder = aiStepOrder[aiGenerationStep] || 0;
		const stepOrder = aiStepOrder[stepKey] || 0;
		if (aiGenerationStep === "error" && stepOrder <= 3) return "error";
		if (currentOrder > stepOrder) return "done";
		if (currentOrder === stepOrder && aiGenerating) return "active";
		return "idle";
	};

	const openBgRemoveFilePicker = () => {
		if (bgRemoveBusy) return;
		bgRemoveInputRef.current?.click();
	};

	const resetBgRemovePreview = () => {
		if (bgRemoveResultUrl && bgRemoveResultUrl.startsWith("blob:")) {
			URL.revokeObjectURL(bgRemoveResultUrl);
		}
		setBgRemoveResultUrl("");
		setBgRemoveError("");
		setBgRemoveUploadProgress(0);
		setBgRemoveProcessingProgress(0);
		setBgRemovePreviewPhase("idle");
	};

	const processBgRemovePublic = async (file) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("mode", bgRemoveMode);
		const response = await api.post(API_ENDPOINTS.AI_BG_REMOVE, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
			responseType: "blob",
		});
		const blob = response?.data;
		if (!(blob instanceof Blob) || !blob.size) {
			throw new Error("No background-removed image returned.");
		}
		return URL.createObjectURL(blob);
	};

	const runBgRemoveFlow = async (inputFile) => {
		const file = inputFile;
		if (!file) return;

		const fileType = String(file.type || "").toLowerCase();
		const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
		if (!allowed.includes(fileType)) {
			setBgRemoveError("Please upload PNG, JPG, or WEBP image.");
			return;
		}

		const maxBytes = 10 * 1024 * 1024;
		if (Number(file.size || 0) > maxBytes) {
			setBgRemoveError("Max file size is 10MB.");
			return;
		}

		if (bgRemoveOriginalPreviewUrl && bgRemoveOriginalPreviewUrl.startsWith("blob:")) {
			URL.revokeObjectURL(bgRemoveOriginalPreviewUrl);
		}

		const localPreview = URL.createObjectURL(file);
		setBgRemoveOriginalPreviewUrl(localPreview);
		resetBgRemovePreview();
		setBgRemovePreviewPhase("original");
		setBgRemoveFileName(String(file.name || "image"));

		try {
			setBgRemoveUploading(true);
			setBgRemoveUploadProgress(15);
			const uploadFile = await preprocessImageForBgRemove(file);
			setBgRemoveUploadProgress(100);
			setBgRemoveUploading(false);
			setBgRemoveProcessing(true);
			setBgRemoveProcessingProgress(15);
			setBgRemovePreviewPhase("processing");
			const processingStartTime = Date.now();
			const previewUrl = await processBgRemovePublic(uploadFile);
			await preloadImage(previewUrl);
			const elapsedMs = Date.now() - processingStartTime;
			if (elapsedMs < BG_REMOVE_MIN_PROCESSING_VISUAL_MS) {
				await sleep(BG_REMOVE_MIN_PROCESSING_VISUAL_MS - elapsedMs);
			}
			setBgRemoveProcessingProgress(100);
			setBgRemoveResultUrl(previewUrl);
		} catch (error) {
			if (error?.response?.data instanceof Blob) {
				try {
					const payload = JSON.parse(await error.response.data.text());
					error.response.data = payload;
				} catch {
					// Keep the original error when the binary response is not JSON.
				}
			}
			const statusCode = Number(error?.response?.status || 0);
			const rawMessage = String(
				error?.response?.data?.message ||
					error?.message ||
					"Background remove failed. Please try again."
			);
			const isImageKitLimitError =
				rawMessage.toLowerCase().includes("elimit") ||
				rawMessage.toLowerCase().includes("size of the input image");
			const message =
				statusCode === 429
					? "Too many requests. Please wait a moment and try again."
					: statusCode === 413
					? "File is too large. Please upload a smaller image."
					: statusCode === 401
					? "Background remover is temporarily unavailable."
					: isImageKitLimitError
					? "Image is still too large for background removal. Please upload a smaller image."
					: rawMessage;
			setBgRemoveError(message);
		} finally {
			setBgRemoveUploading(false);
			setBgRemoveProcessing(false);
		}
	};

	const handleBgRemoveFileChange = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		await runBgRemoveFlow(file);
	};

	const handleBgRemoveDrag = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (bgRemoveBusy) return;
		setBgRemoveDragActive(true);
	};

	const handleBgRemoveDragLeave = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const nextTarget = event.relatedTarget;
		if (nextTarget && event.currentTarget.contains(nextTarget)) return;
		setBgRemoveDragActive(false);
	};

	const handleBgRemoveDrop = async (event) => {
		event.preventDefault();
		event.stopPropagation();
		setBgRemoveDragActive(false);
		if (bgRemoveBusy) return;
		const file = event.dataTransfer?.files?.[0];
		await runBgRemoveFlow(file);
	};

	const handleDownloadBgRemovedImage = async () => {
		if (!bgRemoveResultUrl || bgRemoveBusy) return;

		const baseName = (bgRemoveFileName || "image").replace(/\.[a-z0-9]+$/i, "") || "image";
		const fileName = `${baseName}-bg-removed.png`;

		try {
			const response = await fetch(bgRemoveResultUrl);
			if (!response.ok) throw new Error("download failed");
			const blob = await response.blob();
			const blobUrl = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(blobUrl);
		} catch {
			const link = document.createElement("a");
			link.href = bgRemoveResultUrl;
			link.target = "_blank";
			link.rel = "noopener noreferrer";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const renderContent = () => {
		switch (id) {
			case "ai-advisor":
				return <AiCareerAdvisorTool primaryBtnStyle={primaryBtnStyle} />;
			case "text-ai": {
				const selectedPdfDoc = getSelectedPdfDoc();
				const isSelectedPdfReady = String(selectedPdfDoc?.status || "").toLowerCase() === "ready";
				const activeConversationId = getActiveTextAiConversationId();
				const hasStreamingAssistant = textAiMessages.some((item) => Boolean(item?.isStreaming));
				return (
					<div className="row g-4">
						<div className="col-md-4">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel">
								<h5 className="fw-semibold mb-2">Assistant mode</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Switch between normal text chat and PDF-grounded chat.
								</p>

								<div className="text-ai-mode-toggle mb-3">
									<button
										type="button"
										className={`text-ai-mode-btn ${textAiMode === "text" ? "is-active" : ""}`}
										onClick={() => setTextAiMode("text")}
										disabled={textAiSending || textAiPdfUploadBusy}
									>
										Text chat
									</button>
									<button
										type="button"
										className={`text-ai-mode-btn ${textAiMode === "pdf" ? "is-active" : ""}`}
										onClick={() => setTextAiMode("pdf")}
										disabled={textAiSending || textAiPdfUploadBusy}
									>
										PDF chat
									</button>
								</div>

								{textAiMode === "pdf" ? (
									<>
										<input
											ref={textAiPdfInputRef}
											type="file"
											accept="application/pdf"
											onChange={handleUploadPdfForChat}
											style={{ display: "none" }}
										/>
										<button
											type="button"
											className="btn btn-sm btn-outline-primary mb-3"
											onClick={handleOpenPdfPicker}
											disabled={textAiPdfUploadBusy || textAiSending}
										>
											{textAiPdfUploadBusy ? "Uploading PDF..." : "Upload PDF"}
										</button>

										<div className="text-ai-pdf-doc-list">
											{Array.isArray(textAiPdfDocs) && textAiPdfDocs.length ? (
												textAiPdfDocs.map((doc) => {
													const docId = String(doc?.id || "");
													const isSelected = docId === String(textAiSelectedPdfDocId || "");
													const status = String(doc?.status || "").toLowerCase();
													return (
														<div
															key={`pdf-doc-${docId}`}
															className={`text-ai-pdf-doc-item ${
																isSelected ? "is-selected" : ""
															}`}
														>
															<button
																type="button"
																className="text-ai-pdf-doc-select"
																onClick={() => setTextAiSelectedPdfDocId(docId)}
																disabled={textAiSending || textAiPdfDeleteBusyId === docId}
															>
																<span className="text-ai-pdf-doc-name">
																	{doc?.originalName || "PDF document"}
																</span>
																<span className="text-ai-pdf-doc-meta">
																	{formatBytesToMbLabel(doc?.sizeBytes)} -{" "}
																	{status === "ready" ? "Ready" : status || "Processing"}
																</span>
															</button>
															<button
																type="button"
																className="text-ai-pdf-doc-remove"
																onClick={() => handleDeletePdfDoc(docId)}
																disabled={textAiPdfDeleteBusyId === docId || textAiSending}
																aria-label="Delete PDF"
															>
																{textAiPdfDeleteBusyId === docId ? "..." : "x"}
															</button>
														</div>
													);
												})
											) : (
												<div className="text-muted" style={{ fontSize: 13 }}>
													{textAiPdfDocsLoading
														? "Loading PDF documents..."
														: "No PDF uploaded yet."}
												</div>
											)}
										</div>
									</>
								) : null}

								<button
									type="button"
									className="text-ai-new-chat-top-btn mt-3"
									onClick={handleStartNewTextAiChat}
									disabled={textAiSending || textAiPdfUploadBusy}
								>
									<span className="text-ai-new-chat-icon">+</span>
									<span>New chat</span>
								</button>

								<div className="text-ai-history-wrap mt-3">
									<div className="text-ai-history-head">
										<span>Chat history</span>
										{textAiConversationsLoading ? (
											<span className="text-ai-history-loading">Loading...</span>
										) : null}
									</div>
									<div className="text-ai-history-list">
										{Array.isArray(textAiConversations) && textAiConversations.length ? (
											textAiConversations.map((item) => {
												const conversationId = String(item?.id || "");
												const isActive =
													conversationId &&
													conversationId === String(activeConversationId || "");
												const isDeleting =
													String(textAiConversationDeleteBusyId || "") === conversationId;
												return (
													<div
														key={`text-ai-conversation-${conversationId}`}
														className={`text-ai-history-row ${isActive ? "is-active" : ""}`}
													>
														<button
															type="button"
															className={`text-ai-history-item ${isActive ? "is-active" : ""}`}
															onClick={() => handleOpenTextAiConversation(item)}
															disabled={
																textAiSending ||
																textAiPdfUploadBusy ||
																isDeleting ||
																textAiConversationOpeningId === conversationId
															}
														>
															<span className="text-ai-history-title">
																{item?.title || "New chat"}
															</span>
															<span className="text-ai-history-preview">
																{item?.lastMessagePreview ||
																	(item?.documentName
																		? `PDF: ${item.documentName}`
																		: "Open conversation")}
															</span>
														</button>
														<button
															type="button"
															className="text-ai-history-delete"
															onClick={(event) =>
																handleDeleteTextAiConversation(item, event)
															}
															disabled={
																textAiSending ||
																textAiPdfUploadBusy ||
																isDeleting
															}
															aria-label="Delete conversation"
															title="Delete conversation"
														>
															{isDeleting ? "..." : "X"}
														</button>
													</div>
												);
											})
										) : (
											<div className="text-muted" style={{ fontSize: 13 }}>
												No chat history yet.
											</div>
										)}
									</div>
								</div>

								{textAiError ? (
									<p className="text-danger mt-3 mb-0" style={{ fontSize: 13 }}>
										{textAiError}
									</p>
								) : null}
							</div>
						</div>
						<div className="col-md-8">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 d-flex flex-column ai-tool-panel">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h5 className="fw-semibold mb-0">
										{textAiMode === "pdf" ? "PDF Chat" : "Text AI Chat"}
									</h5>
									<small className="text-muted">{textAiMessages.length} messages</small>
								</div>
								{textAiMode === "pdf" ? (
									<div className="text-ai-pdf-selected mb-3">
										{selectedPdfDoc?.id
											? `Selected PDF: ${selectedPdfDoc.originalName} (${isSelectedPdfReady ? "ready" : "processing"})`
											: "Select a ready PDF document to ask grounded questions."}
									</div>
								) : null}
								<div ref={textAiListRef} className="text-ai-chat-list">
									{textAiMessages.map((message, index) => (
										<div
											key={`text-ai-msg-${String(message?.id || index)}`}
											className={`text-ai-bubble ${
												message.role === "user" ? "is-user" : "is-assistant"
											}`}
										>
											<div className="text-ai-bubble-role">
												{message.role === "user" ? "You" : "Text AI"}
											</div>
											<div
												className={`text-ai-bubble-content ${
													message?.isStreaming ? "is-streaming" : ""
												}`}
											>
												{message.content}
												{message?.isStreaming ? (
													<span className="text-ai-stream-cursor" />
												) : null}
											</div>
											{Array.isArray(message?.citations) && message.citations.length ? (
												<div className="text-ai-citations">
													{message.citations.slice(0, 4).map((citation, citationIndex) => (
														<div
															key={`citation-${index}-${citationIndex}`}
															className="text-ai-citation-item"
														>
															{`Chunk ${Number(citation?.chunkIndex ?? 0) + 1} - ${String(
																citation?.score ?? ""
															)}`}
														</div>
													))}
												</div>
											) : null}
										</div>
									))}
									{textAiSending && !hasStreamingAssistant ? (
										<div className="text-ai-bubble is-assistant">
											<div className="text-ai-bubble-role">Text AI</div>
											<div className="text-ai-typing-dots">
												<span />
												<span />
												<span />
											</div>
										</div>
									) : null}
								</div>
								<div className="text-ai-input-wrap mt-3">
									<textarea
										className="form-control"
										rows={3}
										placeholder={
											textAiMode === "pdf"
												? "Ask question from selected PDF... e.g. summarize section 2."
												: "Ask Text AI anything... e.g. write a LinkedIn post for my design launch."
										}
										value={textAiInput}
										onChange={(event) => setTextAiInput(event.target.value)}
										onKeyDown={handleTextAiInputKeyDown}
										disabled={
											textAiSending ||
											textAiPdfUploadBusy ||
											(textAiMode === "pdf" && (!selectedPdfDoc?.id || !isSelectedPdfReady))
										}
									/>
									<div className="d-flex justify-content-end mt-2">
										<button
											type="button"
											style={primaryBtnStyle}
											onClick={handleSendTextAiMessage}
											disabled={
												!textAiInput.trim() ||
												textAiSending ||
												textAiPdfUploadBusy ||
												(textAiMode === "pdf" && (!selectedPdfDoc?.id || !isSelectedPdfReady))
											}
										>
											{textAiSending ? "Generating..." : "Send"}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			}
			case "ai-text-voiceover": {
				const voiceoverCharCount = String(voiceoverText || "").length;
				const selectedVoice = voiceoverVoices.find(
					(item) => String(item?.voiceId || "") === String(voiceoverVoiceId || "")
				);
				const canGenerateVoiceover =
					Boolean(String(voiceoverText || "").trim()) &&
					Boolean(String(voiceoverVoiceId || "").trim()) &&
					!voiceoverGenerating;

				return (
					<div className="row g-4">
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 h-100 bg-white ai-tool-panel">
								<h5 className="fw-semibold mb-2">1. Enter your script</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Paste or type the text you want to convert into a natural-sounding voiceover.
									Short, clear sentences work best.
								</p>
								<textarea
									className="form-control mb-2"
									rows={7}
									placeholder="e.g. Welcome to our channel! In this video, we will explore the most stunning wallpapers for your devices..."
									value={voiceoverText}
									onChange={handleVoiceoverTextChange}
									disabled={voiceoverGenerating}
								/>
								<div className="d-flex justify-content-between align-items-center">
									<small className="text-muted">
										Tip: Aim for 60-120 seconds of audio for best engagement.
									</small>
									<small className={voiceoverCharCount >= VOICEOVER_TEXT_MAX_LENGTH ? "text-danger" : "text-muted"}>
										{voiceoverCharCount} / {VOICEOVER_TEXT_MAX_LENGTH} characters
									</small>
								</div>
							</div>
						</div>

						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 h-100 bg-white ai-tool-panel">
								<h5 className="fw-semibold mb-2">2. Customize voice & preview</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Choose a voice and tune generation controls. Generate preview, listen, then download.
								</p>

								<div className="mb-3">
									<label className="form-label mb-1 d-flex justify-content-between align-items-center">
										<span>Voice</span>
										<button
											type="button"
											className="btn btn-link p-0"
											style={{ fontSize: 12 }}
											onClick={() => loadVoiceoverVoices({ keepSelection: true })}
											disabled={voiceoverVoicesLoading || voiceoverGenerating}
										>
											{voiceoverVoicesLoading ? "Loading..." : "Refresh"}
										</button>
									</label>
									<select
										className="form-select form-select-sm"
										value={voiceoverVoiceId}
										onChange={(event) => setVoiceoverVoiceId(String(event.target.value || ""))}
										disabled={voiceoverVoicesLoading || voiceoverGenerating}
									>
										{voiceoverVoicesLoading ? <option value="">Loading voices...</option> : null}
										{!voiceoverVoicesLoading && !voiceoverVoices.length ? <option value="">No voices found</option> : null}
										{voiceoverVoices.map((voice) => (
											<option key={voice.voiceId} value={voice.voiceId}>
												{voice.name}
												{voice.category ? ` - ${voice.category}` : ""}
											</option>
										))}
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1">Model</label>
									<select
										className="form-select form-select-sm"
										value={voiceoverModelId}
										onChange={(event) => setVoiceoverModelId(String(event.target.value || ""))}
										disabled={voiceoverGenerating}
									>
										<option value="eleven_multilingual_v2">Eleven Multilingual V2</option>
										<option value="eleven_turbo_v2_5">Eleven Turbo V2.5</option>
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1 d-flex justify-content-between">
										<span>Stability</span>
										<span className="text-muted" style={{ fontSize: 12 }}>
											{voiceoverStability.toFixed(2)}
										</span>
									</label>
									<input
										type="range"
										className="form-range"
										min="0"
										max="1"
										step="0.01"
										value={voiceoverStability}
										onChange={(event) => setVoiceoverStability(Number(event.target.value || 0.5))}
										disabled={voiceoverGenerating}
									/>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1 d-flex justify-content-between">
										<span>Similarity boost</span>
										<span className="text-muted" style={{ fontSize: 12 }}>
											{voiceoverSimilarityBoost.toFixed(2)}
										</span>
									</label>
									<input
										type="range"
										className="form-range"
										min="0"
										max="1"
										step="0.01"
										value={voiceoverSimilarityBoost}
										onChange={(event) => setVoiceoverSimilarityBoost(Number(event.target.value || 0.75))}
										disabled={voiceoverGenerating}
									/>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1 d-flex justify-content-between">
										<span>Style</span>
										<span className="text-muted" style={{ fontSize: 12 }}>
											{voiceoverStyle.toFixed(2)}
										</span>
									</label>
									<input
										type="range"
										className="form-range"
										min="0"
										max="1"
										step="0.01"
										value={voiceoverStyle}
										onChange={(event) => setVoiceoverStyle(Number(event.target.value || 0))}
										disabled={voiceoverGenerating}
									/>
								</div>

								<div className="form-check mb-3">
									<input
										id="voiceover-speaker-boost"
										className="form-check-input"
										type="checkbox"
										checked={voiceoverUseSpeakerBoost}
										onChange={(event) => setVoiceoverUseSpeakerBoost(Boolean(event.target.checked))}
										disabled={voiceoverGenerating}
									/>
									<label className="form-check-label" htmlFor="voiceover-speaker-boost">
										Use speaker boost
									</label>
								</div>

								<div className="d-flex gap-2 mt-3">
									<button
										type="button"
										style={primaryBtnStyle}
										onClick={handleGenerateVoiceover}
										disabled={!canGenerateVoiceover}
									>
										{voiceoverGenerating ? "Generating..." : "Generate Preview"}
									</button>
									<button
										type="button"
										style={{
											...primaryBtnStyle,
											background: "#020617",
											borderColor: "#020617",
											boxShadow: "none",
										}}
										onClick={handleDownloadVoiceover}
										disabled={!voiceoverAudioUrl || voiceoverGenerating}
									>
										Download Voiceover
									</button>
								</div>

								{selectedVoice?.previewUrl ? (
									<div className="mt-3">
										<div className="fw-semibold mb-1" style={{ fontSize: 13 }}>
											Selected voice sample
										</div>
										<audio controls preload="none" src={selectedVoice.previewUrl} style={{ width: "100%" }} />
									</div>
								) : null}

								{voiceoverAudioUrl ? (
									<div className="mt-3">
										<div className="fw-semibold mb-1" style={{ fontSize: 13 }}>
											Generated preview
										</div>
										<audio controls src={voiceoverAudioUrl} style={{ width: "100%" }} />
										{voiceoverAudioMeta ? (
											<div className="text-muted mt-2" style={{ fontSize: 12 }}>
												Voice: {voiceoverAudioMeta.voiceId} | Model: {voiceoverAudioMeta.modelId} | Text length: {" "}
												{voiceoverAudioMeta.textLength}
											</div>
										) : null}
									</div>
								) : null}

								{voiceoverError ? (
									<p className="text-danger mt-3 mb-0" style={{ fontSize: 13 }}>
										{voiceoverError}
									</p>
								) : null}
							</div>
						</div>
					</div>
				);
			}
			case "ai-bg-remove":
				return (
					<div className="row g-4">
						<div className="col-md-7">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel">
								<h5 className="fw-semibold mb-2">Upload image</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Upload a JPG, PNG, or WEBP image and watch the transform from original to clean cutout.
								</p>
								<div className="ai-bg-mode-control mb-3" aria-label="Background remover mode">
									{[
										{ value: "fast", label: "Fast", helper: "Quick cutout" },
										{ value: "hd", label: "HD", helper: "Refined edges" },
									].map((option) => (
										<button
											key={option.value}
											type="button"
											className={`ai-bg-mode-button ${bgRemoveMode === option.value ? "is-active" : ""}`}
											onClick={() => setBgRemoveMode(option.value)}
											disabled={bgRemoveBusy}
										>
											<span>{option.label}</span>
											<small>{option.helper}</small>
										</button>
									))}
								</div>
								<input
									ref={bgRemoveInputRef}
									type="file"
									accept="image/png,image/jpeg,image/jpg,image/webp"
									onChange={handleBgRemoveFileChange}
									style={{ display: "none" }}
								/>
								<div
									className={`ai-bg-dropzone ${bgRemoveDragActive ? "is-active" : ""} ${
										bgRemoveBusy ? "is-busy" : ""
									}`}
									onDragEnter={handleBgRemoveDrag}
									onDragOver={handleBgRemoveDrag}
									onDragLeave={handleBgRemoveDragLeave}
									onDrop={handleBgRemoveDrop}
									onClick={openBgRemoveFilePicker}
									role="button"
									tabIndex={0}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											openBgRemoveFilePicker();
										}
									}}
								>
									<div className="ai-bg-dropzone-glow" />
									<div className="ai-bg-dropzone-content">
										{bgRemoveHasPreview ? (
											<div className="ai-bg-drop-preview">
												<img src={bgRemoveOriginalPreviewUrl} alt="Current upload" />
												{bgRemoveProcessing ? <div className="ai-bg-drop-preview-scan" /> : null}
											</div>
										) : (
											<div className="ai-bg-drop-placeholder">
												<span className="ai-bg-drop-placeholder-icon">IMG</span>
												<p className="mb-0">Drop image here or click to upload</p>
											</div>
										)}
									</div>
									<button
										type="button"
										className="mt-3"
										style={{ ...primaryBtnStyle, position: "relative", zIndex: 2 }}
										onClick={(event) => {
											event.stopPropagation();
											openBgRemoveFilePicker();
										}}
										disabled={bgRemoveBusy}
									>
										{bgRemoveUploading
											? `Uploading... ${Math.max(0, Math.min(100, Math.round(bgRemoveUploadProgress || 0)))}%`
											: bgRemoveProcessing
											? "Removing background..."
											: "Upload Image"}
									</button>
									<p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
										Max 10MB - JPG, PNG, WEBP
									</p>
									<div className="ai-bg-progress-wrap">
										<div className="ai-bg-progress-track">
											<div
												className={`ai-bg-progress-fill ${bgRemoveBusy ? "is-animating" : ""}`}
												style={{ width: `${bgRemoveStepProgress}%` }}
											/>
										</div>
										<div className="ai-bg-step-list">
											{[
												{ key: "upload", label: "Upload to HDPiks" },
												{ key: "process", label: bgRemoveMode === "hd" ? "HD edge refinement" : "AI background remove" },
												{ key: "final", label: "Ready to download" },
											].map((step) => {
												const state = getBgRemoveStepState(step.key);
												return (
													<div key={step.key} className={`ai-bg-step-item is-${state}`}>
														<span className="ai-bg-step-dot" />
														<span>{step.label}</span>
													</div>
												);
											})}
										</div>
									</div>
									{bgRemoveError ? (
										<p className="text-danger mt-2 mb-0" style={{ fontSize: 12, position: "relative", zIndex: 2 }}>
											{bgRemoveError}
										</p>
									) : null}
								</div>
							</div>
						</div>
						<div className="col-md-5">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel">
								<h5 className="fw-semibold mb-2">Preview</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Live transformation preview: original image to final background-removed output.
								</p>
								<div className="ai-bg-preview-stage">
									{bgRemoveHasPreview ? (
										<div
											className={`ai-bg-compare-wrap ${bgRemoveProcessing ? "is-processing" : ""} ${
												bgRemoveFinalView ? "is-final" : ""
											}`}
										>
											<img
												className="ai-bg-compare-image"
												src={bgRemovePreviewBaseUrl}
												alt={bgRemoveFinalView ? "Background removed" : "Original upload"}
											/>
											{bgRemoveResultUrl && !bgRemoveFinalView ? (
												<>
													<div
														className={`ai-bg-compare-overlay ${
															bgRemovePreviewPhase === "revealing"
																? "is-revealing"
																: bgRemovePreviewPhase === "final"
																? "is-final"
																: ""
														}`}
													>
														<img
															className="ai-bg-compare-image"
															src={bgRemoveResultUrl}
															alt="Background removed"
														/>
													</div>
													{bgRemovePreviewPhase === "revealing" ? <div className="ai-bg-compare-beam" /> : null}
												</>
											) : null}
											{bgRemoveProcessing && !bgRemoveResultUrl ? (
												<div className="ai-bg-preview-processing">
													<div className="ai-bg-preview-shimmer" />
													<p className="mb-0">Analyzing edges and removing background...</p>
												</div>
											) : null}
											<div className="ai-bg-preview-badge ai-bg-preview-badge-left">
												{bgRemoveFinalView ? "Bg removed" : "Original"}
											</div>
											{!bgRemoveFinalView ? (
												<div className="ai-bg-preview-badge ai-bg-preview-badge-right">
													{bgRemoveResultUrl ? "Bg removed" : "Result"}
												</div>
											) : null}
										</div>
									) : (
										<div className="ai-bg-preview-empty">
											<span>Your preview will appear here after upload.</span>
										</div>
									)}
								</div>
								<div className="ai-bg-preview-mini-grid">
									<div className="ai-bg-preview-mini">
										<div className="ai-bg-preview-mini-title">Original</div>
										{bgRemoveOriginalPreviewUrl ? (
											<img src={bgRemoveOriginalPreviewUrl} alt="Original thumbnail" />
										) : (
											<div className="ai-bg-preview-mini-placeholder">Pending</div>
										)}
									</div>
									<div className="ai-bg-preview-mini">
										<div className="ai-bg-preview-mini-title">Background removed</div>
										{bgRemoveResultUrl ? (
											<img src={bgRemoveResultUrl} alt="Processed thumbnail" />
										) : (
											<div className={`ai-bg-preview-mini-placeholder ${bgRemoveProcessing ? "is-loading" : ""}`}>
												{bgRemoveProcessing ? "Processing..." : "Pending"}
											</div>
										)}
									</div>
								</div>
								<div className="d-flex gap-2 mt-3 flex-wrap">
									<button
										type="button"
										style={primaryBtnStyle}
										onClick={handleDownloadBgRemovedImage}
										disabled={!bgRemoveResultUrl || bgRemoveBusy}
									>
										Download PNG
									</button>
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary"
										onClick={openBgRemoveFilePicker}
										disabled={bgRemoveBusy}
									>
										Upload another
									</button>
								</div>
							</div>
						</div>
					</div>
				);
			case "ai-generator":
				return (
					<div className="row g-4">
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel">
								<h5 className="fw-semibold mb-2">Describe your image</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Enter a prompt, choose style/ratio/count, then generate production-ready visuals.
								</p>
								<div className="ai-prompt-presets mb-3">
									{AI_PROMPT_PRESETS.map((preset) => (
										<button
											key={preset.id}
											type="button"
											className={`ai-preset-chip ${aiSelectedPresetId === preset.id ? "is-active" : ""}`}
											onClick={() => handleApplyPromptPreset(preset)}
											disabled={aiGenerating || aiEnhancing}
										>
											{preset.label}
										</button>
									))}
								</div>
								<textarea
									className="form-control mb-3"
									rows={4}
									placeholder="e.g. neon city skyline at night, cinematic lighting"
									value={aiPrompt}
									onChange={(e) => setAiPrompt(e.target.value)}
									disabled={aiGenerating || aiEnhancing}
								/>
								<div className="d-flex justify-content-end mb-3">
									<small className="text-muted">{aiPrompt.trim().length}/2000</small>
								</div>
								<div className="mb-3">
									<label className="form-label mb-1">Style</label>
									<select
										className="form-select form-select-sm"
										value={aiStyle}
										onChange={(e) => setAiStyle(e.target.value)}
										disabled={aiGenerating || aiEnhancing}
									>
										{AI_IMAGE_STYLE_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
								<div className="mb-3">
									<label className="form-label mb-1">Aspect ratio</label>
									<select
										className="form-select form-select-sm"
										value={aiAspectRatio}
										onChange={(e) => setAiAspectRatio(e.target.value)}
										disabled={aiGenerating || aiEnhancing}
									>
										{AI_IMAGE_RATIO_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
								<div className="mb-3">
									<label className="form-label mb-1">Number of images</label>
									<select
										className="form-select form-select-sm"
										value={aiImageCount}
										onChange={(e) => setAiImageCount(Number(e.target.value || 1))}
										disabled={aiGenerating || aiEnhancing}
									>
										{AI_IMAGE_COUNT_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
								<div className="d-flex gap-2 flex-wrap">
									<button
										type="button"
										className="btn btn-sm btn-outline-secondary"
										onClick={handleEnhancePrompt}
										disabled={aiEnhancing || aiGenerating || !aiPrompt.trim()}
									>
										{aiEnhancing ? "Enhancing..." : "Enhance prompt"}
									</button>
									<button
										type="button"
										style={primaryBtnStyle}
										onClick={handleGenerateAiImage}
										disabled={aiGenerating || aiEnhancing || !aiPrompt.trim()}
									>
										{aiGenerating ? "Generating..." : "Generate Image"}
									</button>
								</div>
								{aiGenerationStep !== "idle" ? (
									<div className="ai-gen-stage mt-3">
										<div className="ai-gen-stage-list">
											{aiGenerationSteps.map((step) => {
												const state = getAiGenerationStepState(step.key);
												return (
													<div key={step.key} className={`ai-gen-stage-item is-${state}`}>
														<span className="ai-gen-stage-dot" />
														<span>{step.label}</span>
													</div>
												);
											})}
										</div>
									</div>
								) : null}
								{aiEnhanceError ? (
									<p className="text-danger mt-3 mb-0" style={{ fontSize: 13 }}>
										{aiEnhanceError}
									</p>
								) : null}
								{aiGenerateError ? (
									<p className="text-danger mt-3 mb-0" style={{ fontSize: 13 }}>
										{aiGenerateError}
									</p>
								) : null}
							</div>
						</div>
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel">
								<div className="d-flex justify-content-between align-items-center mb-2 gap-2">
									<h5 className="fw-semibold mb-0">Results</h5>
									{!aiGenerating && aiGeneratedImages.length > 1 ? (
										<button
											type="button"
											className="btn btn-sm btn-outline-secondary"
											onClick={handleDownloadAllGeneratedImages}
										>
											Download all
										</button>
									) : null}
								</div>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Your generated images appear here with individual downloads.
								</p>
								{aiGenerating ? (
									<div className="row g-2">
										{Array.from({ length: aiImageCount }).map((_, index) => (
											<div className={aiImageCount === 1 ? "col-12" : "col-sm-6"} key={`ai-skeleton-${index}`}>
												<div className="ai-gen-skeleton-card">
													<div className="ai-gen-skeleton-image" />
													<div className="ai-gen-skeleton-line" />
												</div>
											</div>
										))}
									</div>
								) : aiGeneratedImages.length ? (
									<div className="row g-2">
										{aiGeneratedImages.map((image, index) => {
											const imageSrc = getGeneratedImageSrc(image);
											return (
												<div
													className={aiGeneratedImages.length === 1 ? "col-12" : "col-sm-6"}
													key={`ai-generated-${aiResultsAnimationKey}-${index}`}
												>
													<div className="border rounded-3 p-2 ai-gen-result-card">
														<div className="border rounded-3 overflow-hidden bg-light ai-gen-result-media">
															{imageSrc ? (
																<button
																	type="button"
																	className="ai-gen-result-preview-btn"
																	onClick={() => handleOpenGeneratedImagePreview(image, index)}
																	aria-label={`View generated image ${index + 1}`}
																>
																	<img
																		src={imageSrc}
																		alt={`Generated ${index + 1}`}
																		className="ai-gen-result-image"
																	/>
																</button>
															) : (
																<div className="ai-gen-result-missing">
																	Image preview unavailable.
																</div>
															)}
														</div>
														<div className="d-flex justify-content-end mt-2">
															<button
																type="button"
																style={primaryBtnStyle}
																onClick={() => handleDownloadGeneratedImage(image, index)}
															>
																Download
															</button>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								) : (
									<div
										className="border rounded-3 bg-light d-flex align-items-center justify-content-center"
										style={{ minHeight: 220 }}
									>
										<span className="text-muted" style={{ fontSize: 13 }}>
											No generated image yet.
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				);
			case "ai-business":
				return <AiBusinessAdvisorTool primaryBtnStyle={primaryBtnStyle} />;
			case "ai-commerce":
                return <AiEcommerceAdvisorTool primaryBtnStyle={primaryBtnStyle} />;
            case "ai-video-generator":
				return (
					<div className="row g-4">
						{/* Left: prompt / image input */}
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel">
								<h5 className="fw-semibold mb-2">1. Describe or upload your scene</h5>
								<p className="text-muted mb-2" style={{ fontSize: 14 }}>
									Generate high-quality videos with a prompt or an image, choosing from multiple
									generation models. Type your scene or upload an image generated with our AI tools
									or from your gallery.
								</p>
								<ul className="text-muted mb-3" style={{ fontSize: 13 }}>
									<li>Short, clear prompts work best.</li>
									<li>Use an image to guide style, subject or composition.</li>
								</ul>

								<textarea
									className="form-control mb-3"
									rows={4}
									placeholder="e.g. slow pan over a futuristic neon city at night, rain reflections on the street"
								/>

								<div className="mb-3">
									<label className="form-label mb-1">Or upload a reference image</label>
									<div
										className="border rounded-3 d-flex flex-column justify-content-center align-items-center"
										style={{ minHeight: 140, borderStyle: "dashed" }}
									>
										<p className="mb-2" style={{ fontSize: 14 }}>
											Drop image here or click to upload
										</p>
										<button type="button" style={primaryBtnStyle}>
											Upload Image
										</button>
										<p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
											Optional · JPG, PNG · max 30MB
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Right: model, duration, resolution, results */}
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel">
								<h5 className="fw-semibold mb-2">2. Choose model & settings</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Pick a generation model, duration and resolution, then generate a video preview.
								</p>

								<div className="mb-3">
									<label className="form-label mb-1">Generation model</label>
									<select className="form-select form-select-sm">
										<option>Standard (fast)</option>
										<option>Cinematic (high quality)</option>
										<option>Stylized (artistic)</option>
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1">Duration</label>
									<select className="form-select form-select-sm">
										<option>5 seconds</option>
										<option>10 seconds</option>
										<option>15 seconds</option>
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1">Resolution</label>
									<select className="form-select form-select-sm">
										<option>720p (HD)</option>
										<option>1080p (Full HD)</option>
									</select>
								</div>

								<button type="button" style={primaryBtnStyle}>
									Generate Video
								</button>

								<hr className="my-4" />

								<h6 className="fw-semibold mb-2">Preview & download</h6>
								<div
									className="border rounded-3 bg-light d-flex align-items-center justify-content-center"
									style={{ minHeight: 160 }}
								>
									<span className="text-muted" style={{ fontSize: 13 }}>
										Your video preview will appear here.
									</span>
								</div>
								<div className="d-flex gap-2 mt-3">
									<button
										type="button"
										style={{
											...primaryBtnStyle,
											background: "#020617",
											borderColor: "#020617",
											boxShadow: "none",
										}}
									>
										Download MP4
									</button>
									<button
										type="button"
										style={{
											...primaryBtnStyle,
											background: "transparent",
											color: "#020617",
											border: "1px solid #d1d5db",
											boxShadow: "none",
										}}
									>
										Save to Collection
									</button>
								</div>
							</div>
						</div>
					</div>
				);

			default:
				return (
					<div className="p-3 p-md-4 border rounded-4 bg-white ai-tool-panel">
						<p className="text-muted mb-0" style={{ fontSize: 14 }}>
							Select an AI tool from the homepage AI tools bar to get started.
						</p>
					</div>
				);
		}
	};

	return (
		<>
			<TopNavOnly />
			<div className="ai-tool-page">
				<div className="ai-tool-ambient ai-tool-ambient-1" />
				<div className="ai-tool-ambient ai-tool-ambient-2" />
				<div className="container py-4 ai-tool-page-container">
					<header className="ai-tool-header">
						<h1 className="fw-bold mb-2 ai-tool-title">{pageTitle}</h1>
						<p className="text-muted mb-0 ai-tool-subtitle">{pageDesc}</p>
					</header>
					{renderContent()}
					{pageArticle ? <AiToolArticleSection article={pageArticle} /> : null}
				</div>
				{aiSelectedImagePreview ? (
					<div
						className="ai-gen-lightbox"
						role="dialog"
						aria-modal="true"
						aria-label="Generated image preview"
						onClick={handleCloseGeneratedImagePreview}
					>
						<div
							className="ai-gen-lightbox-content"
							onClick={(event) => event.stopPropagation()}
						>
							<button
								type="button"
								className="ai-gen-lightbox-close"
								aria-label="Close preview"
								onClick={handleCloseGeneratedImagePreview}
							>
								&times;
							</button>
							<img
								src={aiSelectedImagePreview.src}
								alt={aiSelectedImagePreview.alt}
							/>
						</div>
					</div>
				) : null}
			</div>
			<AppFooter />
		</>
	);
}

export default AiToolPage;





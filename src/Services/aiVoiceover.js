import api from "./api.js";
import { API_ENDPOINTS } from "../config/api.config.js";

export const listAiVoiceoverVoices = async () => {
    const response = await api.get(API_ENDPOINTS.AI_VOICEOVER_VOICES);
    const voices = response?.data?.data?.voices;
    return Array.isArray(voices) ? voices : [];
};

export const generateAiVoiceover = async ({
    text,
    voiceId,
    modelId,
    stability,
    similarityBoost,
    style,
    useSpeakerBoost,
}) => {
    const response = await api.post(API_ENDPOINTS.AI_VOICEOVER_GENERATE, {
        text,
        voiceId,
        modelId,
        stability,
        similarityBoost,
        style,
        useSpeakerBoost,
    });
    return response?.data?.data || null;
};

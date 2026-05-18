import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowLeft,
    ArrowDown,
    ArrowDownToLine,
    ArrowUp,
    Clapperboard,
    FolderPlus,
    Loader2,
    Volume2,
    VolumeX,
    Pause,
    Play,
    Save,
    SplitSquareVertical,
    Trash2,
    Upload,
    Video,
} from "lucide-react";
import TopNavOnly from "../Components/AppNavbar/TopNavOnly";
import AppFooter from "../Components/AppFooter/AppFooter";
import {
    createVideoEditorExport,
    deleteVideoEditorProject,
    createVideoEditorProject,
    downloadVideoEditorExport,
    getVideoEditorExportJob,
    getVideoEditorProject,
    listVideoEditorProjects,
    updateVideoEditorProject,
    uploadVideoEditorAssets,
} from "../Services/videoEditor.js";
import "./VideoEditor.css";

const EXPORT_PRESETS = [
    { id: "reel-9x16", label: "Reel / Shorts", ratio: "9:16" },
    { id: "square-1x1", label: "Square", ratio: "1:1" },
    { id: "landscape-16x9", label: "Landscape", ratio: "16:9" },
];

const VIDEO_TOOL_OPTIONS = [
    {
        id: "merge",
        label: "Merge Videos",
        description: "Combine two or more clips into one final video.",
        icon: Video,
        active: true,
    },
    {
        id: "trim",
        label: "Trim Video",
        description: "Cut a single video down to the exact range you want.",
        icon: Clapperboard,
        active: true,
    },
    {
        id: "audio",
        label: "Add Audio to Video",
        description: "Mute original sound and add your own music track.",
        icon: Volume2,
        active: true,
    },
    {
        id: "split",
        label: "Split Video",
        description: "Coming soon",
        icon: SplitSquareVertical,
        active: false,
    },
    {
        id: "editor",
        label: "Video Editor",
        description: "Coming soon",
        icon: Clapperboard,
        active: false,
    },
    {
        id: "crop",
        label: "Crop Video",
        description: "Coming soon",
        icon: Video,
        active: false,
    },
    {
        id: "rotate",
        label: "Rotate Video",
        description: "Coming soon",
        icon: ArrowDownToLine,
        active: false,
    },
    {
        id: "speed",
        label: "Change Video Speed",
        description: "Coming soon",
        icon: Play,
        active: false,
    },
    {
        id: "loop",
        label: "Loop Video",
        description: "Coming soon",
        icon: Video,
        active: false,
    },
    {
        id: "volume",
        label: "Change Video Volume",
        description: "Coming soon",
        icon: Volume2,
        active: false,
    },
];

const THUMBNAIL_COUNT = 12;
const FRONTEND_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];
const FRONTEND_AUDIO_EXTENSIONS = [".mp3", ".wav"];

const formatDuration = (valueMs) => {
    const totalSeconds = Math.max(0, Math.round(Number(valueMs || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatDurationPrecise = (valueMs) => {
    const totalSeconds = Math.max(0, Number(valueMs || 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${seconds.toFixed(1).padStart(4, "0")}`;
};

const toSecondsInput = (valueMs) => (Math.max(0, Number(valueMs || 0)) / 1000).toFixed(2);
const fromSecondsInput = (value) => Math.max(0, Math.round(Number(value || 0) * 1000));

const cloneClips = (clips = []) => clips.map((clip) => ({ ...clip }));
const cloneAudioTracks = (tracks = []) => tracks.map((track) => ({ ...track }));
const deriveClipDurationMs = (clip) => Math.max(0, Number(clip.trimEndMs || 0) - Number(clip.trimStartMs || 0));
const deriveAudioTrackDurationMs = (track) => Math.max(0, Number(track?.trimEndMs || 0) - Number(track?.trimStartMs || 0));

const defaultAudioSettings = () => ({
    keepOriginalAudio: true,
    originalVolume: 1,
});

const buildDefaultAudioTrack = (asset) => ({
    id: `audio-${String(asset?.id || Date.now())}`,
    assetId: asset?.id,
    kind: "audio",
    label: asset?.originalName || "Background audio",
    startMs: 0,
    trimStartMs: 0,
    trimEndMs: Number(asset?.durationMs || 0),
    sourceDurationMs: Number(asset?.durationMs || 0),
    volume: 1,
    muted: false,
});

const getFrontendEditorUploadKind = (file = {}) => {
    const mimeType = String(file?.type || "").toLowerCase();
    const lowerName = String(file?.name || "").toLowerCase();
    if (mimeType.startsWith("video/") || FRONTEND_VIDEO_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
        return "video";
    }
    if (mimeType.startsWith("audio/") || FRONTEND_AUDIO_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
        return "audio";
    }
    return "";
};

const normalizeTimeline = (clips = []) => {
    let nextStart = 0;
    return clips.map((clip) => {
        const normalized = { ...clip, timelineStartMs: nextStart };
        nextStart += deriveClipDurationMs(normalized);
        return normalized;
    });
};

const createBrowserTimelineThumbnails = async (videoUrl, durationMs) => {
    const durationSeconds = Math.max(0.1, Number(durationMs || 0) / 1000);
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = videoUrl;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return [];

    await new Promise((resolve, reject) => {
        video.addEventListener("loadeddata", resolve, { once: true });
        video.addEventListener("error", reject, { once: true });
    });

    const targetHeight = 72;
    const targetWidth = 128;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const frames = [];
    for (let index = 0; index < THUMBNAIL_COUNT; index += 1) {
        const second = durationSeconds * (index / Math.max(THUMBNAIL_COUNT - 1, 1));
        await new Promise((resolve) => {
            const onSeeked = () => {
                try {
                    context.clearRect(0, 0, targetWidth, targetHeight);
                    context.drawImage(video, 0, 0, targetWidth, targetHeight);
                    frames.push({
                        id: `thumb-${index}`,
                        src: canvas.toDataURL("image/jpeg", 0.72),
                        second,
                    });
                } catch {
                    frames.push({
                        id: `thumb-${index}`,
                        src: "",
                        second,
                    });
                }
                resolve();
            };
            video.currentTime = Math.min(durationSeconds, second);
            video.addEventListener("seeked", onSeeked, { once: true });
        });
    }

    return frames;
};

function VideoEditor() {
    const uploadInputRef = useRef(null);
    const uploadProjectIdRef = useRef("");
    const playerRef = useRef(null);
    const audioPreviewRef = useRef(null);
    const animationFrameRef = useRef(0);
    const continueMergePlaybackRef = useRef(false);
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState("");
    const [projectBundle, setProjectBundle] = useState(null);
    const [draftName, setDraftName] = useState("");
    const [draftPresetId, setDraftPresetId] = useState("reel-9x16");
    const [draftClips, setDraftClips] = useState([]);
    const [draftAudioTracks, setDraftAudioTracks] = useState([]);
    const [draftAudioSettings, setDraftAudioSettings] = useState(defaultAudioSettings);
    const [selectedClipId, setSelectedClipId] = useState("");
    const [selectedAudioTrackId, setSelectedAudioTrackId] = useState("");
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [creatingProject, setCreatingProject] = useState(false);
    const [deletingProjectId, setDeletingProjectId] = useState("");
    const [savingProject, setSavingProject] = useState(false);
    const [uploadingAssets, setUploadingAssets] = useState(false);
    const [exportBusy, setExportBusy] = useState(false);
    const [activeExportJob, setActiveExportJob] = useState(null);
    const [error, setError] = useState("");
    const [thumbnails, setThumbnails] = useState([]);
    const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playheadMs, setPlayheadMs] = useState(0);
    const [activeTool, setActiveTool] = useState("hub");
    const [editorMode, setEditorMode] = useState("trim");
    const [mergeClipIndex, setMergeClipIndex] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const loadProjects = async () => {
            try {
                setProjectsLoading(true);
                const result = await listVideoEditorProjects();
                if (cancelled) return;
                setProjects(result);
                if (!activeProjectId && result[0]?.id) {
                    setActiveProjectId(String(result[0].id));
                }
            } catch (loadError) {
                if (!cancelled) setError(loadError?.response?.data?.message || loadError?.message || "Could not load editor projects.");
            } finally {
                if (!cancelled) setProjectsLoading(false);
            }
        };
        loadProjects();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!activeProjectId) return undefined;
        let cancelled = false;
        const loadProject = async () => {
            try {
                const bundle = await getVideoEditorProject(activeProjectId);
                if (cancelled || !bundle) return;
                setProjectBundle(bundle);
                setDraftName(bundle.project?.name || "");
                setDraftPresetId(bundle.project?.aspectRatioPreset || "reel-9x16");
                setDraftClips(cloneClips(bundle.project?.clips || []));
                setDraftAudioTracks(cloneAudioTracks(bundle.project?.audioTracks || []));
                setDraftAudioSettings({
                    ...defaultAudioSettings(),
                    ...(bundle.project?.audioSettings || {}),
                });
                setSelectedClipId((current) => current || String(bundle.project?.clips?.[0]?.id || ""));
                setSelectedAudioTrackId((current) => current || String(bundle.project?.audioTracks?.[0]?.id || ""));
                setError("");
            } catch (loadError) {
                if (!cancelled) setError(loadError?.response?.data?.message || loadError?.message || "Could not load project.");
            }
        };
        loadProject();
        return () => {
            cancelled = true;
        };
    }, [activeProjectId]);

    useEffect(() => {
        if (!activeExportJob?.id) return undefined;
        if (activeExportJob.status === "completed" || activeExportJob.status === "failed") return undefined;
        const timer = window.setInterval(async () => {
            try {
                const nextJob = await getVideoEditorExportJob(activeExportJob.id);
                setActiveExportJob(nextJob);
                if (nextJob?.status === "completed") {
                    const refreshedProjects = await listVideoEditorProjects();
                    setProjects(refreshedProjects);
                }
            } catch (pollError) {
                setError(pollError?.response?.data?.message || pollError?.message || "Could not refresh export job.");
            }
        }, 1600);
        return () => window.clearInterval(timer);
    }, [activeExportJob]);

    const activeAssets = projectBundle?.assets || [];
    const assetsById = useMemo(
        () => new Map(activeAssets.map((asset) => [String(asset.id), asset])),
        [activeAssets]
    );
    const audioAssets = useMemo(
        () => activeAssets.filter((asset) => String(asset?.kind || "").toLowerCase() === "audio"),
        [activeAssets]
    );
    const selectedClip = draftClips.find((clip) => String(clip.id) === String(selectedClipId)) || draftClips[0] || null;
    const selectedAsset = selectedClip ? assetsById.get(String(selectedClip.assetId)) : null;
    const selectedAudioTrack =
        draftAudioTracks.find((track) => String(track.id) === String(selectedAudioTrackId)) || draftAudioTracks[0] || null;
    const selectedAudioAsset = selectedAudioTrack ? assetsById.get(String(selectedAudioTrack.assetId)) : null;
    const timelineDurationMs = draftClips.reduce((sum, clip) => sum + deriveClipDurationMs(clip), 0);
    const selectedClipIndex = draftClips.findIndex((clip) => String(clip.id) === String(selectedClip?.id));
    const selectedClipDurationMs = selectedClip ? deriveClipDurationMs(selectedClip) : 0;
    const selectedSourceDurationMs = Math.max(
        0,
        Number(selectedClip?.sourceDurationMs || selectedAsset?.durationMs || 0)
    );
    const clipTray = useMemo(
        () =>
            draftClips.map((clip) => ({
                ...clip,
                asset: assetsById.get(String(clip.assetId)) || null,
                previewThumb:
                    assetsById.get(String(clip.assetId))?.thumbnails?.find((thumb) => thumb?.src)?.src ||
                    "",
                timelineThumbs:
                    assetsById.get(String(clip.assetId))?.thumbnails?.filter((thumb) => thumb?.src) || [],
                sourceDurationMs: Number(
                    clip.sourceDurationMs ||
                        assetsById.get(String(clip.assetId))?.durationMs ||
                        0
                ),
            })),
        [draftClips, assetsById]
    );
    const selectedTrayClip =
        clipTray.find((clip) => String(clip.id) === String(selectedClip?.id || selectedClipId)) || null;
    const selectedTimelineThumbnails = useMemo(
        () =>
            Array.isArray(selectedTrayClip?.timelineThumbs)
                ? selectedTrayClip.timelineThumbs.filter((thumb) => thumb?.src)
                : [],
        [selectedTrayClip?.id, selectedTrayClip?.timelineThumbs]
    );
    const activeTrimThumbnails = useMemo(
        () => (selectedTimelineThumbnails.length ? selectedTimelineThumbnails : thumbnails),
        [selectedTimelineThumbnails, thumbnails]
    );
    const timelineOverviewClips = useMemo(() => {
        const total = Math.max(
            timelineDurationMs,
            clipTray.reduce((sum, clip) => sum + deriveClipDurationMs(clip), 0),
            1
        );

        return clipTray.map((clip, index) => {
            const clipDurationMs = deriveClipDurationMs(clip);
            const sourceDurationMs = Math.max(1, Number(clip.sourceDurationMs || 0));
            const widthPercent = Math.max(10, (clipDurationMs / total) * 100);
            const trimStartPercent = Math.max(0, (Number(clip.trimStartMs || 0) / sourceDurationMs) * 100);
            const trimWidthPercent = Math.max(
                6,
                ((Number(clip.trimEndMs || 0) - Number(clip.trimStartMs || 0)) / sourceDurationMs) * 100
            );
            return {
                ...clip,
                index,
                clipDurationMs,
                widthPercent,
                trimStartPercent,
                trimWidthPercent,
            };
        });
    }, [clipTray, timelineDurationMs]);
    const mergedAudioSummary = useMemo(() => {
        const audibleClips = clipTray.filter((clip) => !clip.muted).length;
        const mutedClips = clipTray.filter((clip) => clip.muted).length;
        return {
            audibleClips,
            mutedClips,
        };
    }, [clipTray]);
    const hasUploadedClips = draftClips.length > 0;
    const isHubView = activeTool === "hub";
    const showToolUpload = activeTool !== "hub" && !hasUploadedClips;
    const showStudioWorkspace = activeTool !== "hub" && hasUploadedClips;
    const isMergeMode = activeTool === "merge";
    const isTrimMode = activeTool === "trim";
    const isAudioMode = activeTool === "audio";
    const mergePreviewClip = clipTray[mergeClipIndex] || clipTray[0] || null;
    const mergePreviewAsset = mergePreviewClip ? assetsById.get(String(mergePreviewClip.assetId)) : null;
    const previewLabel =
        editorMode === "merge"
            ? `Merged preview | clip ${Math.min(mergeClipIndex + 1, Math.max(clipTray.length, 1))} of ${clipTray.length || 1}`
            : selectedClip?.label || selectedAsset?.originalName || "";
    const previewSource =
        editorMode === "merge"
            ? mergePreviewAsset?.s3Url || mergePreviewAsset?.imageUrl || mergePreviewAsset?.url || ""
            : selectedAsset?.s3Url || selectedAsset?.imageUrl || selectedAsset?.url || "";
    const previewMuted = isAudioMode
        ? Boolean(selectedClip?.muted) || draftAudioSettings.keepOriginalAudio === false || Number(draftAudioSettings.originalVolume || 0) <= 0
        : editorMode === "merge"
            ? Boolean(mergePreviewClip?.muted)
            : Boolean(selectedClip?.muted);
    const mergeTimelineCursorMs = useMemo(() => {
        if (!mergePreviewClip) return 0;
        return clipTray.slice(0, mergeClipIndex).reduce((sum, clip) => sum + deriveClipDurationMs(clip), 0);
    }, [clipTray, mergeClipIndex, mergePreviewClip]);

    useEffect(() => {
        if ((activeTool === "merge" || activeTool === "trim") && editorMode !== activeTool) {
            setEditorMode(activeTool);
        }
    }, [activeTool, editorMode]);

    useEffect(() => {
        if (!clipTray.length) {
            setMergeClipIndex(0);
            return;
        }
        if (mergeClipIndex > clipTray.length - 1) {
            setMergeClipIndex(0);
        }
    }, [clipTray, mergeClipIndex]);

    useEffect(() => {
        if (!audioAssets.length) {
            setSelectedAudioTrackId("");
            return;
        }

        if (!selectedAudioTrackId || !draftAudioTracks.some((track) => String(track.id) === String(selectedAudioTrackId))) {
            setSelectedAudioTrackId(String(draftAudioTracks[0]?.id || ""));
        }
    }, [audioAssets, draftAudioTracks, selectedAudioTrackId]);

    useEffect(() => {
        if (editorMode !== "merge" || !mergePreviewClip || !previewSource) {
            return undefined;
        }

        const video = playerRef.current;
        if (!video) return undefined;

        const localStartMs = Number(mergePreviewClip.trimStartMs || 0);
        const localEndMs = Math.max(
            localStartMs,
            Number(mergePreviewClip.trimEndMs || mergePreviewClip.sourceDurationMs || mergePreviewAsset?.durationMs || localStartMs)
        );

        const finalizeMergePlayback = () => {
            continueMergePlaybackRef.current = false;
            setIsPlaying(false);
            setPlayheadMs(mergeTimelineCursorMs + deriveClipDurationMs(mergePreviewClip));
        };

        const moveToNextMergeClip = (shouldContinuePlayback) => {
            const nextIndex = mergeClipIndex + 1;
            if (nextIndex < clipTray.length) {
                continueMergePlaybackRef.current = shouldContinuePlayback;
                const nextClipId = String(clipTray[nextIndex]?.id || "");
                setSelectedClipId(nextClipId);
                setMergeClipIndex(nextIndex);
                return;
            }

            continueMergePlaybackRef.current = false;
            finalizeMergePlayback();
            video.pause();
            video.currentTime = localEndMs / 1000;
        };

        const syncMergeTime = () => {
            const currentMs = Math.round((video.currentTime || 0) * 1000);
            const boundedCurrentMs = Math.min(localEndMs, Math.max(localStartMs, currentMs));
            const clipProgressMs = Math.max(0, boundedCurrentMs - localStartMs);
            setPlayheadMs(mergeTimelineCursorMs + clipProgressMs);

            if (boundedCurrentMs >= localEndMs - 80) {
                const shouldContinuePlayback = continueMergePlaybackRef.current || !video.paused;
                if (shouldContinuePlayback) {
                    continueMergePlaybackRef.current = true;
                }
                video.pause();
                moveToNextMergeClip(shouldContinuePlayback);
            }
        };

        const handleLoadedMetadata = async () => {
            const targetSeconds = localStartMs / 1000;
            if (Math.abs((video.currentTime || 0) - targetSeconds) > 0.05) {
                video.currentTime = targetSeconds;
            }
            setPlayheadMs(mergeTimelineCursorMs);
            if (continueMergePlaybackRef.current) {
                try {
                    await video.play();
                } catch {
                    continueMergePlaybackRef.current = false;
                    setIsPlaying(false);
                }
            }
        };

        const handlePlay = () => {
            continueMergePlaybackRef.current = true;
            setIsPlaying(true);
        };

        const handlePause = () => {
            if (!continueMergePlaybackRef.current) {
                setIsPlaying(false);
            }
        };

        const handleEnded = () => {
            const shouldContinuePlayback = continueMergePlaybackRef.current || !video.paused;
            moveToNextMergeClip(shouldContinuePlayback);
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("timeupdate", syncMergeTime);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);

        if (video.readyState >= 1) {
            void handleLoadedMetadata();
        }

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("timeupdate", syncMergeTime);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
        };
    }, [
        editorMode,
        mergeClipIndex,
        mergePreviewAsset?.durationMs,
        mergePreviewClip,
        mergeTimelineCursorMs,
        previewSource,
        clipTray,
    ]);

    useEffect(() => {
        if (editorMode !== "merge") return;
        const selectedIndex = clipTray.findIndex((clip) => String(clip.id) === String(selectedClipId));
        if (selectedIndex >= 0 && selectedIndex !== mergeClipIndex) {
            setMergeClipIndex(selectedIndex);
        }
    }, [editorMode, selectedClipId, clipTray, mergeClipIndex]);

    useEffect(() => {
        if (!selectedClip || !selectedAsset?.s3Url) {
            setThumbnails([]);
            if (editorMode === "trim") {
                setPlayheadMs(0);
                setIsPlaying(false);
            }
            return undefined;
        }

        let cancelled = false;
        if (editorMode === "trim") {
            setPlayheadMs(selectedClip.trimStartMs);
            setIsPlaying(false);
        }

        if (selectedTimelineThumbnails.length) {
            setThumbnails(selectedTimelineThumbnails);
            setThumbnailsLoading(false);
            return () => {
                cancelled = true;
            };
        }

        setThumbnailsLoading(true);
        createBrowserTimelineThumbnails(selectedAsset.s3Url, selectedClip.sourceDurationMs || selectedAsset.durationMs)
            .then((frames) => {
                if (!cancelled) setThumbnails(frames);
            })
            .catch(() => {
                if (!cancelled) setThumbnails([]);
            })
            .finally(() => {
                if (!cancelled) setThumbnailsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [
        editorMode,
        selectedClip?.id,
        selectedClip?.trimStartMs,
        selectedClip?.sourceDurationMs,
        selectedAsset?.s3Url,
        selectedAsset?.durationMs,
        selectedTimelineThumbnails,
    ]);

    useEffect(() => {
        if (editorMode !== "trim") return undefined;
        const video = playerRef.current;
        if (!video || !selectedClip) return undefined;

        const syncCurrentTime = () => {
            const currentMs = Math.round((video.currentTime || 0) * 1000);
            if (currentMs >= selectedClip.trimEndMs) {
                video.pause();
                video.currentTime = selectedClip.trimEndMs / 1000;
                setIsPlaying(false);
                setPlayheadMs(selectedClip.trimEndMs);
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                return;
            }
            setPlayheadMs(Math.max(selectedClip.trimStartMs, currentMs));
            animationFrameRef.current = requestAnimationFrame(syncCurrentTime);
        };

        const handleLoadedMetadata = () => {
            video.currentTime = selectedClip.trimStartMs / 1000;
            setPlayheadMs(selectedClip.trimStartMs);
        };

        const handlePlay = () => {
            setIsPlaying(true);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(syncCurrentTime);
        };

        const handlePause = () => {
            setIsPlaying(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        if (video.readyState >= 1) {
            handleLoadedMetadata();
        }

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [editorMode, selectedClip?.id, selectedClip?.trimStartMs, selectedClip?.trimEndMs]);

    useEffect(() => {
        const video = playerRef.current;
        if (!video) return;
        if (!isAudioMode) {
            video.volume = 1;
            return;
        }
        video.volume = Math.max(0, Math.min(1, Number(draftAudioSettings.originalVolume || 0)));
    }, [isAudioMode, draftAudioSettings.originalVolume, previewSource]);

    useEffect(() => {
        const video = playerRef.current;
        const audio = audioPreviewRef.current;
        if (!isAudioMode || !video || !audio || !selectedAudioTrack || !selectedAudioAsset?.s3Url) {
            if (audio) {
                audio.pause();
            }
            return undefined;
        }

        const trackStartMs = Math.max(0, Number(selectedAudioTrack.startMs || 0));
        const trackTrimStartMs = Math.max(0, Number(selectedAudioTrack.trimStartMs || 0));
        const trackTrimEndMs = Math.max(trackTrimStartMs, Number(selectedAudioTrack.trimEndMs || selectedAudioTrack.sourceDurationMs || 0));
        const trackDurationMs = Math.max(0, trackTrimEndMs - trackTrimStartMs);
        const syncAudioPreview = async () => {
            const videoMs = Math.max(0, Math.round((video.currentTime || 0) * 1000));
            const trackOffsetMs = videoMs - trackStartMs;
            const canPlayTrack =
                !selectedAudioTrack.muted &&
                trackDurationMs > 0 &&
                trackOffsetMs >= 0 &&
                trackOffsetMs <= trackDurationMs &&
                !video.paused;

            audio.volume = Math.max(0, Math.min(1, Number(selectedAudioTrack.volume || 0)));

            if (!canPlayTrack) {
                audio.pause();
                return;
            }

            const targetAudioSeconds = (trackTrimStartMs + trackOffsetMs) / 1000;
            if (Math.abs((audio.currentTime || 0) - targetAudioSeconds) > 0.35) {
                audio.currentTime = targetAudioSeconds;
            }

            if (audio.paused) {
                try {
                    await audio.play();
                } catch {
                    // Preview sync is best effort.
                }
            }
        };

        const pauseAudioPreview = () => {
            audio.pause();
        };

        const events = ["play", "pause", "timeupdate", "seeked", "loadedmetadata"];
        events.forEach((eventName) => {
            video.addEventListener(eventName, eventName === "pause" ? pauseAudioPreview : syncAudioPreview);
        });

        void syncAudioPreview();

        return () => {
            events.forEach((eventName) => {
                video.removeEventListener(eventName, eventName === "pause" ? pauseAudioPreview : syncAudioPreview);
            });
            audio.pause();
        };
    }, [
        isAudioMode,
        selectedAudioTrack?.id,
        selectedAudioTrack?.muted,
        selectedAudioTrack?.startMs,
        selectedAudioTrack?.trimStartMs,
        selectedAudioTrack?.trimEndMs,
        selectedAudioTrack?.volume,
        selectedAudioAsset?.s3Url,
        previewSource,
    ]);

    const handleCreateProject = async () => {
        try {
            setCreatingProject(true);
            setError("");
            const created = await createVideoEditorProject({
                name: `New Project ${projects.length + 1}`,
                aspectRatioPreset: "reel-9x16",
            });
            const nextProjects = await listVideoEditorProjects();
            setProjects(nextProjects);
            if (created?.project?.id) {
                const nextProjectId = String(created.project.id);
                setActiveProjectId(nextProjectId);
                return nextProjectId;
            }
            return "";
        } catch (createError) {
            setError(createError?.response?.data?.message || createError?.message || "Could not create project.");
            return "";
        } finally {
            setCreatingProject(false);
        }
    };

    const handleUploadFiles = async (fileList) => {
        const projectId = uploadProjectIdRef.current || activeProjectId;
        if (!projectId || !fileList?.length) return;
        const nextFiles = Array.from(fileList || []);
        if (isAudioMode) {
            const videoFiles = nextFiles.filter((file) => getFrontendEditorUploadKind(file) === "video");
            const audioFiles = nextFiles.filter((file) => getFrontendEditorUploadKind(file) === "audio");
            if (!draftClips.length && !videoFiles.length) {
                setError("Upload a source video first, then add your music track.");
                if (uploadInputRef.current) uploadInputRef.current.value = "";
                uploadProjectIdRef.current = "";
                return;
            }
            if (videoFiles.length > 1) {
                setError("Add Audio to Video supports one source video at a time. Please upload a single video.");
                if (uploadInputRef.current) uploadInputRef.current.value = "";
                uploadProjectIdRef.current = "";
                return;
            }
            if (audioFiles.length > 1) {
                setError("Please upload one music file at a time in Add Audio to Video.");
                if (uploadInputRef.current) uploadInputRef.current.value = "";
                uploadProjectIdRef.current = "";
                return;
            }
            if (draftClips.length && videoFiles.length) {
                setError("This audio project already has a source video. Upload music, or create a new project to use a different video.");
                if (uploadInputRef.current) uploadInputRef.current.value = "";
                uploadProjectIdRef.current = "";
                return;
            }
        }
        try {
            setUploadingAssets(true);
            setError("");
            const bundle = await uploadVideoEditorAssets(projectId, nextFiles);
            setProjectBundle(bundle);
            setDraftName(bundle.project?.name || "");
            setDraftPresetId(bundle.project?.aspectRatioPreset || "reel-9x16");
            setDraftClips(cloneClips(bundle.project?.clips || []));
            setDraftAudioSettings({
                ...defaultAudioSettings(),
                ...(bundle.project?.audioSettings || {}),
            });
            setSelectedClipId(String(bundle.project?.clips?.[bundle.project.clips.length - 1]?.id || ""));
            const projectAudioTracks = cloneAudioTracks(bundle.project?.audioTracks || []);
            if (isAudioMode) {
                const latestUploadedAudioAsset = [...(bundle.assets || [])]
                    .reverse()
                    .find((asset) => String(asset?.kind || "").toLowerCase() === "audio");
                if (latestUploadedAudioAsset) {
                    const nextTrack = buildDefaultAudioTrack(latestUploadedAudioAsset);
                    setDraftAudioTracks([nextTrack]);
                    setSelectedAudioTrackId(String(nextTrack.id));
                } else {
                    setDraftAudioTracks(projectAudioTracks);
                    setSelectedAudioTrackId(String(projectAudioTracks[0]?.id || ""));
                }
            } else {
                setDraftAudioTracks(projectAudioTracks);
                setSelectedAudioTrackId(String(projectAudioTracks[0]?.id || ""));
            }
            setActiveProjectId(projectId);
            const refreshedProjects = await listVideoEditorProjects();
            setProjects(refreshedProjects);
        } catch (uploadError) {
            setError(uploadError?.response?.data?.message || uploadError?.message || "Could not upload editor files.");
        } finally {
            setUploadingAssets(false);
            uploadProjectIdRef.current = "";
            if (uploadInputRef.current) uploadInputRef.current.value = "";
        }
    };

    const handleOpenUploadPicker = async () => {
        let projectId = activeProjectId;
        if (!projectId) {
            projectId = await handleCreateProject();
        }
        if (!projectId) return;
        uploadProjectIdRef.current = String(projectId);
        uploadInputRef.current?.click();
    };

    const handleDeleteProject = async (projectId) => {
        if (!projectId || deletingProjectId) return;
        const targetProject = projects.find((project) => String(project.id) === String(projectId));
        const shouldDelete = window.confirm(`Delete project "${targetProject?.name || "Untitled Project"}"? This will remove its uploaded clips and export history.`);
        if (!shouldDelete) return;

        try {
            setDeletingProjectId(String(projectId));
            setError("");
            await deleteVideoEditorProject(projectId);
            const refreshedProjects = await listVideoEditorProjects();
            setProjects(refreshedProjects);

            if (String(activeProjectId) === String(projectId)) {
                const nextProjectId = refreshedProjects[0]?.id ? String(refreshedProjects[0].id) : "";
                setActiveProjectId(nextProjectId);
                if (!nextProjectId) {
                    setProjectBundle(null);
                    setDraftName("");
                    setDraftPresetId("reel-9x16");
                    setDraftClips([]);
                    setDraftAudioTracks([]);
                    setDraftAudioSettings(defaultAudioSettings());
                    setSelectedClipId("");
                    setSelectedAudioTrackId("");
                    setActiveExportJob(null);
                    setThumbnails([]);
                    setPlayheadMs(0);
                    setIsPlaying(false);
                }
            }
        } catch (deleteError) {
            setError(deleteError?.response?.data?.message || deleteError?.message || "Could not delete project.");
        } finally {
            setDeletingProjectId("");
        }
    };

    const updateClip = (clipId, patch) => {
        setDraftClips((current) =>
            current.map((clip) => {
                if (String(clip.id) !== String(clipId)) return clip;
                const sourceDurationMs = Number(clip.sourceDurationMs || 0);
                const nextTrimStartMs =
                    patch.trimStartMs !== undefined
                        ? Math.max(0, Math.min(sourceDurationMs, patch.trimStartMs))
                        : clip.trimStartMs;
                const nextTrimEndMs =
                    patch.trimEndMs !== undefined
                        ? Math.max(nextTrimStartMs, Math.min(sourceDurationMs, patch.trimEndMs))
                        : clip.trimEndMs;
                return {
                    ...clip,
                    ...patch,
                    trimStartMs: nextTrimStartMs,
                    trimEndMs: nextTrimEndMs,
                };
            })
        );
    };

    const updateAudioTrack = (trackId, patch) => {
        setDraftAudioTracks((current) =>
            current.map((track) => {
                if (String(track.id) !== String(trackId)) return track;
                const sourceDurationMs = Number(track.sourceDurationMs || 0);
                const nextTrimStartMs =
                    patch.trimStartMs !== undefined
                        ? Math.max(0, Math.min(sourceDurationMs, patch.trimStartMs))
                        : track.trimStartMs;
                const nextTrimEndMs =
                    patch.trimEndMs !== undefined
                        ? Math.max(nextTrimStartMs, Math.min(sourceDurationMs, patch.trimEndMs))
                        : track.trimEndMs;
                const nextStartMs =
                    patch.startMs !== undefined
                        ? Math.max(0, Math.min(timelineDurationMs, patch.startMs))
                        : track.startMs;
                return {
                    ...track,
                    ...patch,
                    startMs: nextStartMs,
                    trimStartMs: nextTrimStartMs,
                    trimEndMs: nextTrimEndMs,
                    volume:
                        patch.volume !== undefined
                            ? Math.max(0, Math.min(2, Number(patch.volume || 0)))
                            : track.volume,
                };
            })
        );
    };

    const attachAudioAssetToProject = (assetId) => {
        const asset = audioAssets.find((item) => String(item.id) === String(assetId));
        if (!asset) return;
        const nextTrack = buildDefaultAudioTrack(asset);
        setDraftAudioTracks([nextTrack]);
        setSelectedAudioTrackId(String(nextTrack.id));
    };

    const removeSelectedAudioTrack = () => {
        setDraftAudioTracks([]);
        setSelectedAudioTrackId("");
    };

    const moveClip = (index, direction) => {
        setDraftClips((current) => {
            const target = index + direction;
            if (target < 0 || target >= current.length) return current;
            const next = cloneClips(current);
            [next[index], next[target]] = [next[target], next[index]];
            return normalizeTimeline(next);
        });
    };

    const toggleClipMute = (clipId) => {
        setDraftClips((current) =>
            current.map((clip) =>
                String(clip.id) === String(clipId)
                    ? {
                          ...clip,
                          muted: !clip.muted,
                      }
                    : clip
            )
        );
    };

    const splitClip = (clipId) => {
        setDraftClips((current) => {
            const index = current.findIndex((clip) => String(clip.id) === String(clipId));
            if (index === -1) return current;
            const clip = current[index];
            const duration = deriveClipDurationMs(clip);
            if (duration < 1000) return current;
            const splitPoint = clip.trimStartMs + Math.round(duration / 2);
            const firstHalf = {
                ...clip,
                trimEndMs: splitPoint,
            };
            const secondHalf = {
                ...clip,
                id: `${clip.id}-split-${Date.now()}`,
                trimStartMs: splitPoint,
                label: `${clip.label || "Clip"} Part 2`,
            };
            const next = cloneClips(current);
            next.splice(index, 1, firstHalf, secondHalf);
            return normalizeTimeline(next);
        });
    };

    const removeClip = (clipId) => {
        setDraftClips((current) => {
            const next = current.filter((clip) => String(clip.id) !== String(clipId));
            if (!next.length) setSelectedClipId("");
            else if (String(selectedClipId) === String(clipId)) setSelectedClipId(String(next[0].id));
            return normalizeTimeline(next);
        });
    };

    const handleSaveProject = async () => {
        if (!activeProjectId) return;
        try {
            setSavingProject(true);
            setError("");
            const bundle = await updateVideoEditorProject(activeProjectId, {
                name: draftName,
                aspectRatioPreset: draftPresetId,
                clips: normalizeTimeline(draftClips),
                audioTracks: cloneAudioTracks(draftAudioTracks),
                audioSettings: {
                    keepOriginalAudio: draftAudioSettings.keepOriginalAudio !== false,
                    originalVolume: Number(draftAudioSettings.originalVolume || 0),
                },
            });
            setProjectBundle(bundle);
            setDraftClips(cloneClips(bundle.project?.clips || []));
            setDraftAudioTracks(cloneAudioTracks(bundle.project?.audioTracks || []));
            setDraftAudioSettings({
                ...defaultAudioSettings(),
                ...(bundle.project?.audioSettings || {}),
            });
            const refreshedProjects = await listVideoEditorProjects();
            setProjects(refreshedProjects);
        } catch (saveError) {
            setError(saveError?.response?.data?.message || saveError?.message || "Could not save project.");
        } finally {
            setSavingProject(false);
        }
    };

    const handleExport = async () => {
        if (!activeProjectId) return;
        try {
            setExportBusy(true);
            setError("");
            await handleSaveProject();
            const created = await createVideoEditorExport(activeProjectId, draftPresetId);
            const job = await getVideoEditorExportJob(created.jobId);
            setActiveExportJob(job);
        } catch (exportError) {
            setError(exportError?.response?.data?.message || exportError?.message || "Could not start export.");
        } finally {
            setExportBusy(false);
        }
    };

    const togglePlayback = async () => {
        const video = playerRef.current;
        if (!video) return;
        if (editorMode === "merge") {
            if (!mergePreviewClip) return;
            const localStartMs = Number(mergePreviewClip.trimStartMs || 0);
            const localEndMs = Math.max(
                localStartMs,
                Number(mergePreviewClip.trimEndMs || mergePreviewClip.sourceDurationMs || mergePreviewAsset?.durationMs || localStartMs)
            );
            if (video.paused) {
                if (Math.round((video.currentTime || 0) * 1000) >= localEndMs) {
                    const nextIndex = mergeClipIndex + 1;
                    if (nextIndex < clipTray.length) {
                        continueMergePlaybackRef.current = true;
                        setSelectedClipId(String(clipTray[nextIndex]?.id || ""));
                        setMergeClipIndex(nextIndex);
                        return;
                    }
                    video.currentTime = localStartMs / 1000;
                    setPlayheadMs(mergeTimelineCursorMs);
                } else if (Math.round((video.currentTime || 0) * 1000) < localStartMs) {
                    video.currentTime = localStartMs / 1000;
                    setPlayheadMs(mergeTimelineCursorMs);
                }
                try {
                    await video.play();
                } catch {
                    continueMergePlaybackRef.current = false;
                    setIsPlaying(false);
                }
                return;
            }
            continueMergePlaybackRef.current = false;
            video.pause();
            return;
        }
        if (!selectedClip) return;
        if (video.paused) {
            if (video.currentTime * 1000 >= selectedClip.trimEndMs) {
                video.currentTime = selectedClip.trimStartMs / 1000;
            }
            try {
                await video.play();
            } catch {
                setIsPlaying(false);
            }
            return;
        }
        video.pause();
    };

    const handleResetTrim = () => {
        if (!selectedClip || !selectedAsset) return;
        updateClip(selectedClip.id, {
            trimStartMs: 0,
            trimEndMs: selectedAsset.durationMs || selectedClip.sourceDurationMs || 0,
        });
        const video = playerRef.current;
        if (video) {
            video.currentTime = 0;
        }
        setPlayheadMs(editorMode === "merge" ? mergeTimelineCursorMs : 0);
    };

    const handleSeek = (nextMs) => {
        if (!selectedClip) return;
        const bounded = Math.max(selectedClip.trimStartMs, Math.min(selectedClip.trimEndMs, nextMs));
        const nextPlayheadMs =
            editorMode === "merge"
                ? mergeTimelineCursorMs + Math.max(0, bounded - Number(selectedClip.trimStartMs || 0))
                : bounded;
        setPlayheadMs(nextPlayheadMs);
        const video = playerRef.current;
        if (video) {
            video.currentTime = bounded / 1000;
        }
    };

    const localPlayheadMs =
        editorMode === "merge" && selectedClip
            ? Math.max(
                  Number(selectedClip.trimStartMs || 0),
                  Math.min(
                      Number(selectedClip.trimEndMs || 0),
                      Number(selectedClip.trimStartMs || 0) + Math.max(0, playheadMs - mergeTimelineCursorMs)
                  )
              )
            : playheadMs;

    const trimStartPercent = selectedSourceDurationMs
        ? (Math.max(0, selectedClip?.trimStartMs || 0) / selectedSourceDurationMs) * 100
        : 0;
    const trimEndPercent = selectedSourceDurationMs
        ? (Math.max(0, selectedClip?.trimEndMs || 0) / selectedSourceDurationMs) * 100
        : 100;
    const playheadPercent = selectedSourceDurationMs
        ? (Math.max(0, localPlayheadMs) / selectedSourceDurationMs) * 100
        : 0;
    const mergePlayheadPercent = timelineDurationMs
        ? (Math.max(0, playheadMs) / timelineDurationMs) * 100
        : 0;
    const toolCopy = {
        merge: {
            title: "Merge Videos",
            subtitle: "Upload two or more videos and place them in the final order before export.",
            cta: "Choose Videos",
        },
        trim: {
            title: "Trim Video",
            subtitle: "Upload a video and trim it down to the exact section you want to keep.",
            cta: "Choose Video",
        },
        audio: {
            title: "Add Audio to Video",
            subtitle: "Upload a video, mute the original sound if needed, and replace it with your own music.",
            cta: "Choose Video or Music",
        },
    };
    const activeToolConfig = toolCopy[activeTool] || toolCopy.merge;

    const activateTool = (toolId) => {
        setActiveTool(toolId);
        setEditorMode(toolId === "merge" ? "merge" : "trim");
    };

    const uploadAccept =
        activeTool === "audio"
            ? ".mp4,.mov,.webm,.mp3,.wav,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/mp3,audio/wav,audio/x-wav"
            : ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm";
    const uploadMultiple = activeTool === "merge";

    return (
        <>
            <TopNavOnly />
            <main className={`video-editor-page ${isHubView || showToolUpload ? "video-editor-page--landing" : "video-editor-page--studio"}`}>
                <div className={`video-editor-shell ${isHubView || showToolUpload ? "video-editor-shell--landing" : "video-editor-shell--studio"}`}>
                    <input
                        ref={uploadInputRef}
                        type="file"
                        accept={uploadAccept}
                        multiple={uploadMultiple}
                        hidden
                        onChange={(event) => handleUploadFiles(event.target.files)}
                    />

                    {isHubView ? (
                        <section className="video-editor-tools">
                            <div className="video-editor-tools__inner">
                                <h1 className="video-editor-tools__title">Video Tools</h1>
                                <div className="video-editor-tools__grid">
                                    {VIDEO_TOOL_OPTIONS.map((tool) => {
                                        const ToolIcon = tool.icon;
                                        return (
                                            <button
                                                key={tool.id}
                                                type="button"
                                                className={`video-editor-tools__item ${tool.active ? "is-active" : "is-disabled"}`}
                                                onClick={() => {
                                                    if (!tool.active) return;
                                                    activateTool(tool.id);
                                                }}
                                                disabled={!tool.active}
                                            >
                                                <span className="video-editor-tools__item-icon">
                                                    <ToolIcon size={22} />
                                                </span>
                                                <span className="video-editor-tools__item-copy">
                                                    <strong>{tool.label}</strong>
                                                    <small>{tool.description}</small>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    ) : showToolUpload ? (
                        <section className="video-editor-landing">
                            <button type="button" className="video-editor-landing__back" onClick={() => setActiveTool("hub")}>
                                <ArrowLeft size={18} />
                                <span>Back to tools</span>
                            </button>
                            <span className="video-editor-landing__eyebrow">Elvify Studio</span>
                            <h1 className="video-editor-landing__title">{activeToolConfig.title}</h1>
                            <p className="video-editor-landing__subtitle">{activeToolConfig.subtitle}</p>
                            <button
                                type="button"
                                className="video-editor-landing__cta"
                                onClick={handleOpenUploadPicker}
                                disabled={creatingProject || uploadingAssets}
                            >
                                {creatingProject || uploadingAssets ? <Loader2 className="video-editor-spin" size={22} /> : <Upload size={22} />}
                                <span>{creatingProject ? "Creating project..." : uploadingAssets ? "Uploading clips..." : activeToolConfig.cta}</span>
                            </button>
                            <p className="video-editor-landing__hint">or drag and drop files here</p>

                            {error ? <div className="video-editor-alert video-editor-alert--landing">{error}</div> : null}

                            <div className="video-editor-landing__footer">
                                <span>{projectsLoading ? "Loading saved projects..." : `${projects.length} saved project(s)`}</span>
                                {projects.length ? (
                                    <button
                                        type="button"
                                        className="video-editor-landing__resume"
                                        onClick={() => {
                                            const latestProject = projects[0];
                                            setActiveProjectId(String(latestProject.id));
                                            activateTool(
                                                activeTool === "audio"
                                                    ? "audio"
                                                    : Number(latestProject.clipCount || 0) > 1
                                                        ? "merge"
                                                        : "trim"
                                            );
                                        }}
                                    >
                                        Resume latest project
                                    </button>
                                ) : null}
                            </div>
                        </section>
                    ) : showStudioWorkspace ? (
                        <>
                    <aside className="video-editor-sidebar video-editor-sidebar--studio">
                        <div className="video-editor-sidebar__brand">
                            <div className="video-editor-sidebar__brand-mark">
                                <Clapperboard size={22} />
                            </div>
                            <div>
                                <strong>Video Editor</strong>
                                <span>Trim, split, merge, export</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="video-editor-sidebar__create"
                            onClick={handleCreateProject}
                            disabled={creatingProject}
                        >
                            {creatingProject ? <Loader2 className="video-editor-spin" size={16} /> : <FolderPlus size={16} />}
                            <span>{creatingProject ? "Creating..." : "New Project"}</span>
                        </button>

                        <div className="video-editor-sidebar__section">
                            <div className="video-editor-sidebar__section-head">
                                <span>Projects</span>
                            </div>
                            <div className="video-editor-project-list">
                                {projectsLoading ? (
                                    <div className="video-editor-empty video-editor-empty--dark">Loading projects...</div>
                                ) : projects.length ? (
                                    projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className={`video-editor-project-list__item ${String(project.id) === String(activeProjectId) ? "is-active" : ""}`}
                                        >
                                            <button
                                                type="button"
                                                className="video-editor-project-list__select"
                                                onClick={() => setActiveProjectId(String(project.id))}
                                            >
                                                <strong>{project.name}</strong>
                                                <span>{project.clipCount || 0} clips</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="video-editor-project-list__delete"
                                                onClick={() => handleDeleteProject(project.id)}
                                                disabled={deletingProjectId === String(project.id)}
                                                aria-label={`Delete ${project.name}`}
                                            >
                                                {deletingProjectId === String(project.id) ? (
                                                    <Loader2 className="video-editor-spin" size={14} />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="video-editor-empty video-editor-empty--dark">No projects yet. Let&apos;s create the first one.</div>
                                )}
                            </div>
                        </div>
                    </aside>

                    <section className="video-editor-workspace video-editor-workspace--studio">
                        <header className="video-editor-header video-editor-header--studio">
                            <div className="video-editor-header__meta">
                                <button type="button" className="video-editor-header__back" onClick={() => setActiveTool("hub")}>
                                    <ArrowLeft size={16} />
                                    <span>Video Tools</span>
                                </button>
                                <input
                                    className="video-editor-header__name"
                                    value={draftName}
                                    onChange={(event) => setDraftName(event.target.value)}
                                    placeholder="Untitled Video Project"
                                />
                                <div className="video-editor-header__submeta">
                                    <span>{formatDuration(timelineDurationMs)} total timeline</span>
                                    <span>{formatDuration(draftClips.reduce((acc, clip) => acc + deriveClipDurationMs(clip), 0))} clips</span>
                                    <span>{draftClips.length} clip(s)</span>
                                </div>
                            </div>

                            <div className="video-editor-header__actions">
                                <label className="video-editor-select-wrap">
                                    <span>Preset</span>
                                    <select value={draftPresetId} onChange={(event) => setDraftPresetId(event.target.value)}>
                                        {EXPORT_PRESETS.map((preset) => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.label} ({preset.ratio})
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <button type="button" className="video-editor-secondary-btn" onClick={handleOpenUploadPicker} disabled={!activeProjectId || uploadingAssets}>
                                    {uploadingAssets ? <Loader2 className="video-editor-spin" size={16} /> : <Upload size={16} />}
                                    <span>{uploadingAssets ? "Uploading..." : isAudioMode ? "Upload Video / Music" : "Upload Clips"}</span>
                                </button>
                                <button type="button" className="video-editor-secondary-btn" onClick={handleSaveProject} disabled={!activeProjectId || savingProject}>
                                    {savingProject ? <Loader2 className="video-editor-spin" size={16} /> : <Save size={16} />}
                                    <span>{savingProject ? "Saving..." : "Save"}</span>
                                </button>
                                <button type="button" className="video-editor-primary-btn" onClick={handleExport} disabled={!activeProjectId || exportBusy || !draftClips.length}>
                                    {exportBusy ? <Loader2 className="video-editor-spin" size={16} /> : <ArrowDownToLine size={16} />}
                                    <span>{exportBusy ? "Queueing..." : isAudioMode ? "Export Video" : "Export MP4"}</span>
                                </button>
                            </div>

                        </header>

                        {error ? <div className="video-editor-alert">{error}</div> : null}

                        {!activeProjectId ? (
                            <div className="video-editor-empty video-editor-empty--large video-editor-empty--dark">
                                Create a project to start building your first edit.
                            </div>
                        ) : (
                            <div className="video-editor-studio">
                                <section className="video-editor-stage video-editor-stage--workspace">
                                    <aside className="video-editor-stage__panel">
                                        <div className="video-editor-stage__panel-head">
                                            <strong>{isMergeMode ? "Merge Videos" : isAudioMode ? "Add Audio to Video" : "Trim Video"}</strong>
                                        </div>
                                        <div className="video-editor-stage__panel-tabs">
                                            <button type="button" className="video-editor-stage__panel-tab is-active">
                                                Video
                                            </button>
                                            <button type="button" className={`video-editor-stage__panel-tab ${isAudioMode ? "is-active" : ""}`} disabled={!isAudioMode}>
                                                Audio
                                            </button>
                                        </div>
                                        <div className="video-editor-stage__toolgrid">
                                            {isMergeMode ? (
                                                <>
                                                    <button type="button" className="video-editor-stage__toolcard is-active">
                                                        <Video size={18} />
                                                        <span>Merge Videos</span>
                                                    </button>
                                                    <button type="button" className="video-editor-stage__toolcard" onClick={() => selectedClip && splitClip(selectedClip.id)} disabled={!selectedClip}>
                                                        <SplitSquareVertical size={18} />
                                                        <span>Split</span>
                                                    </button>
                                                    <button type="button" className="video-editor-stage__toolcard" onClick={() => selectedClip && toggleClipMute(selectedClip.id)} disabled={!selectedClip}>
                                                        {selectedClip?.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                        <span>{selectedClip?.muted ? "Unmute" : "Mute"}</span>
                                                    </button>
                                                </>
                                            ) : isAudioMode ? (
                                                <>
                                                    <button type="button" className="video-editor-stage__toolcard is-active">
                                                        <Volume2 size={18} />
                                                        <span>Add Audio</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="video-editor-stage__toolcard"
                                                        onClick={() =>
                                                            setDraftAudioSettings((current) => ({
                                                                ...current,
                                                                keepOriginalAudio: !current.keepOriginalAudio,
                                                            }))
                                                        }
                                                    >
                                                        {draftAudioSettings.keepOriginalAudio ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                                        <span>{draftAudioSettings.keepOriginalAudio ? "Keep Original" : "Mute Original"}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="video-editor-stage__toolcard"
                                                        onClick={handleOpenUploadPicker}
                                                    >
                                                        <Upload size={18} />
                                                        <span>Upload Music</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button type="button" className="video-editor-stage__toolcard is-active">
                                                        <Clapperboard size={18} />
                                                        <span>Trim Video</span>
                                                    </button>
                                                    <button type="button" className="video-editor-stage__toolcard" onClick={() => selectedClip && splitClip(selectedClip.id)} disabled={!selectedClip}>
                                                        <SplitSquareVertical size={18} />
                                                        <span>Split</span>
                                                    </button>
                                                    <button type="button" className="video-editor-stage__toolcard" onClick={() => selectedClip && toggleClipMute(selectedClip.id)} disabled={!selectedClip}>
                                                        {selectedClip?.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                        <span>{selectedClip?.muted ? "Unmute" : "Mute"}</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <div className="video-editor-stage__actions-list">
                                            <button type="button" className="video-editor-stage__action-row" onClick={handleOpenUploadPicker}>
                                                <Upload size={18} />
                                                <span>{isAudioMode ? "Upload video or music" : "Add more clips"}</span>
                                            </button>
                                            <button type="button" className="video-editor-stage__action-row" onClick={handleSaveProject} disabled={savingProject}>
                                                <Save size={18} />
                                                <span>{savingProject ? "Saving project..." : "Save current arrangement"}</span>
                                            </button>
                                            <button type="button" className="video-editor-stage__action-row" onClick={handleExport} disabled={exportBusy || !draftClips.length}>
                                                <ArrowDownToLine size={18} />
                                                <span>{exportBusy ? "Preparing export..." : isAudioMode ? "Export video with audio" : "Export merged MP4"}</span>
                                            </button>
                                        </div>
                                    </aside>

                                    <div className="video-editor-stage__main">
                                        <div className="video-editor-stage__toolbar">
                                            {isMergeMode ? (
                                                <>
                                                    <button type="button" className="video-editor-stage__tool is-active">
                                                        <Video size={16} />
                                                        <span>Merge Videos</span>
                                                    </button>
                                                    <button type="button" className="video-editor-stage__tool" onClick={() => selectedClip && splitClip(selectedClip.id)} disabled={!selectedClip}>
                                                        <SplitSquareVertical size={16} />
                                                        <span>Split</span>
                                                    </button>
                                                </>
                                            ) : isAudioMode ? (
                                                <>
                                                    <button type="button" className="video-editor-stage__tool is-active">
                                                        <Volume2 size={16} />
                                                        <span>Add Audio to Video</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="video-editor-stage__tool"
                                                        onClick={() =>
                                                            setDraftAudioSettings((current) => ({
                                                                ...current,
                                                                keepOriginalAudio: !current.keepOriginalAudio,
                                                            }))
                                                        }
                                                    >
                                                        {draftAudioSettings.keepOriginalAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                                        <span>{draftAudioSettings.keepOriginalAudio ? "Original Audio On" : "Original Audio Muted"}</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button type="button" className="video-editor-stage__tool is-active">
                                                        <Clapperboard size={16} />
                                                        <span>Trim Video</span>
                                                    </button>
                                                    <button type="button" className="video-editor-stage__tool" onClick={() => selectedClip && splitClip(selectedClip.id)} disabled={!selectedClip}>
                                                        <SplitSquareVertical size={16} />
                                                        <span>Split</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <div className="video-editor-stage__viewer">
                                            {previewSource ? (
                                                <>
                                                    <div className="video-editor-stage__clip-name">
                                                        {previewLabel}
                                                    </div>
                                                    <div className="video-editor-stage__video-surface">
                                                        <div className="video-editor-stage__video-wrap">
                                                            <video
                                                                ref={playerRef}
                                                                controls={editorMode !== "merge"}
                                                                preload="auto"
                                                                playsInline
                                                                src={previewSource}
                                                                muted={previewMuted}
                                                                key={`${editorMode}-${previewSource}-${mergeClipIndex}-${selectedClip?.id || ""}`}
                                                            />
                                                            {isAudioMode && selectedAudioAsset?.s3Url ? (
                                                                <audio
                                                                    ref={audioPreviewRef}
                                                                    preload="auto"
                                                                    src={selectedAudioAsset.s3Url}
                                                                />
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="video-editor-stage__audio-state">
                                                        {isAudioMode ? (
                                                            <>
                                                                {draftAudioSettings.keepOriginalAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                                                <span>
                                                                    {draftAudioSettings.keepOriginalAudio
                                                                        ? `Original video audio is on${selectedAudioTrack ? " while your uploaded music layers over it." : "."}`
                                                                        : selectedAudioTrack
                                                                            ? "Original video audio is muted and your uploaded music will replace it."
                                                                            : "Original video audio is muted. Upload a music file to replace it."}
                                                                </span>
                                                            </>
                                                        ) : previewMuted ? (
                                                            <>
                                                                <VolumeX size={16} />
                                                                <span>
                                                                    {editorMode === "merge"
                                                                        ? "Current merged segment is muted in export."
                                                                        : "This clip is muted in the final export."}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Volume2 size={16} />
                                                                <span>
                                                                    {editorMode === "merge"
                                                                        ? "Current merged segment audio will be kept in export."
                                                                        : "This clip audio will be kept in the final export."}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {editorMode === "merge" ? (
                                                        <div className="video-editor-stage__merge-state">
                                                            <span>Playing the final export order across all clips.</span>
                                                            <strong>
                                                                {formatDuration(playheadMs)} / {formatDuration(timelineDurationMs)}
                                                            </strong>
                                                        </div>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <div className="video-editor-empty video-editor-empty--dark">
                                                    Upload a clip and select it to start trimming.
                                                </div>
                                            )}
                                        </div>

                                        {isAudioMode ? (
                                            <section className="video-editor-audio-workspace">
                                                <div className="video-editor-audio-workspace__head">
                                                    <div>
                                                        <strong>Background music</strong>
                                                        <span>
                                                            {selectedAudioTrack
                                                                ? `${selectedAudioTrack.label} | starts at ${toSecondsInput(selectedAudioTrack.startMs)}s`
                                                                : draftClips.length
                                                                    ? "Upload an mp3 or wav file and place it on the video."
                                                                    : "Upload one video first, then add your music track."}
                                                        </span>
                                                    </div>
                                                    <button type="button" className="video-editor-secondary-btn" onClick={handleOpenUploadPicker}>
                                                        <Upload size={16} />
                                                        <span>{audioAssets.length ? "Upload / replace music" : "Upload music"}</span>
                                                    </button>
                                                </div>

                                                <div className="video-editor-audio-assets">
                                                    {audioAssets.length ? (
                                                        audioAssets.map((asset) => {
                                                            const isSelected = String(selectedAudioTrack?.assetId || "") === String(asset.id);
                                                            return (
                                                                <button
                                                                    key={asset.id}
                                                                    type="button"
                                                                    className={`video-editor-audio-asset ${isSelected ? "is-active" : ""}`}
                                                                    onClick={() => attachAudioAssetToProject(asset.id)}
                                                                >
                                                                    <strong>{asset.originalName}</strong>
                                                                    <span>{formatDuration(asset.durationMs || 0)}</span>
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="video-editor-audio-empty">
                                                            Upload a music file to replace or layer over the original video sound.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="video-editor-audio-grid">
                                                    <label className="video-editor-audio-control">
                                                        <span>Mute original audio</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={!draftAudioSettings.keepOriginalAudio}
                                                            onChange={(event) =>
                                                                setDraftAudioSettings((current) => ({
                                                                    ...current,
                                                                    keepOriginalAudio: !event.target.checked,
                                                                }))
                                                            }
                                                        />
                                                    </label>

                                                    <label className="video-editor-audio-control">
                                                        <span>Original volume</span>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.05"
                                                            value={Math.max(0, Math.min(1, Number(draftAudioSettings.originalVolume || 0)))}
                                                            onChange={(event) =>
                                                                setDraftAudioSettings((current) => ({
                                                                    ...current,
                                                                    originalVolume: Number(event.target.value),
                                                                }))
                                                            }
                                                        />
                                                        <small>{Math.round(Number(draftAudioSettings.originalVolume || 0) * 100)}%</small>
                                                    </label>

                                                    {selectedAudioTrack ? (
                                                        <>
                                                            <label className="video-editor-audio-control">
                                                                <span>Music start</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.1"
                                                                    value={toSecondsInput(selectedAudioTrack.startMs)}
                                                                    onChange={(event) =>
                                                                        updateAudioTrack(selectedAudioTrack.id, {
                                                                            startMs: fromSecondsInput(event.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </label>
                                                            <label className="video-editor-audio-control">
                                                                <span>Music trim start</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.1"
                                                                    value={toSecondsInput(selectedAudioTrack.trimStartMs)}
                                                                    onChange={(event) =>
                                                                        updateAudioTrack(selectedAudioTrack.id, {
                                                                            trimStartMs: fromSecondsInput(event.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </label>
                                                            <label className="video-editor-audio-control">
                                                                <span>Music trim end</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.1"
                                                                    value={toSecondsInput(selectedAudioTrack.trimEndMs)}
                                                                    onChange={(event) =>
                                                                        updateAudioTrack(selectedAudioTrack.id, {
                                                                            trimEndMs: fromSecondsInput(event.target.value),
                                                                        })
                                                                    }
                                                                />
                                                            </label>
                                                            <label className="video-editor-audio-control">
                                                                <span>Music volume</span>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="1"
                                                                    step="0.05"
                                                                    value={Number(selectedAudioTrack.volume || 0)}
                                                                    onChange={(event) =>
                                                                        updateAudioTrack(selectedAudioTrack.id, {
                                                                            volume: Number(event.target.value),
                                                                        })
                                                                    }
                                                                />
                                                                <small>{Math.round(Number(selectedAudioTrack.volume || 0) * 100)}%</small>
                                                            </label>
                                                            <button
                                                                type="button"
                                                                className="video-editor-audio-toggle"
                                                                onClick={() =>
                                                                    updateAudioTrack(selectedAudioTrack.id, {
                                                                        muted: !selectedAudioTrack.muted,
                                                                    })
                                                                }
                                                            >
                                                                {selectedAudioTrack.muted ? "Unmute music" : "Mute music"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="video-editor-audio-toggle video-editor-audio-toggle--danger"
                                                                onClick={removeSelectedAudioTrack}
                                                            >
                                                                Remove music
                                                            </button>
                                                            <div className="video-editor-audio-note">
                                                                Music length: {formatDuration(deriveAudioTrackDurationMs(selectedAudioTrack))} | Source {formatDuration(selectedAudioTrack.sourceDurationMs)}
                                                            </div>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </section>
                                        ) : null}

                                        {isTrimMode ? (
                                            <div className="video-editor-clip-tray">
                                                {clipTray.length ? (
                                                    clipTray.map((clip, index) => (
                                                        <button
                                                            key={clip.id}
                                                            type="button"
                                                            className={`video-editor-clip-pill ${String(clip.id) === String(selectedClipId) ? "is-active" : ""}`}
                                                            onClick={() => setSelectedClipId(String(clip.id))}
                                                        >
                                                            <div className="video-editor-clip-pill__thumb">
                                                                {clip.previewThumb ? (
                                                                    <img src={clip.previewThumb} alt={`${clip.label || clip.asset?.originalName || `Clip ${index + 1}`} preview`} />
                                                                ) : (
                                                                    <div className="video-editor-clip-pill__thumb-fallback">
                                                                        <Video size={18} />
                                                                    </div>
                                                                )}
                                                                <span className="video-editor-clip-pill__index">
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                            <div className="video-editor-clip-pill__main">
                                                                <strong>{clip.label || clip.asset?.originalName || `Clip ${index + 1}`}</strong>
                                                                <span>{formatDuration(deriveClipDurationMs(clip))}</span>
                                                                <small>
                                                                    Source {formatDuration(clip.sourceDurationMs)}
                                                                </small>
                                                                <small className={`video-editor-clip-pill__audio ${clip.muted ? "is-muted" : ""}`}>
                                                                    {clip.muted ? "Muted in export" : "Original audio on"}
                                                                </small>
                                                            </div>
                                                            <div className="video-editor-clip-pill__actions">
                                                                <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); moveClip(index, -1); }}>
                                                                    <ArrowUp size={14} />
                                                                </span>
                                                                <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); moveClip(index, 1); }}>
                                                                    <ArrowDown size={14} />
                                                                </span>
                                                                <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); splitClip(clip.id); }}>
                                                                    <SplitSquareVertical size={14} />
                                                                </span>
                                                                <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); toggleClipMute(clip.id); }}>
                                                                    {clip.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                                                </span>
                                                                <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); removeClip(clip.id); }}>
                                                                    <Trash2 size={14} />
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="video-editor-empty video-editor-empty--dark">
                                                        Uploaded clips will appear here as your trim tray.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="video-editor-stage__merge-notice">
                                                <strong>Merged timeline preview</strong>
                                                <span>Your videos are shown as one ordered sequence below. Move clips up or down there to change the final merge order.</span>
                                            </div>
                                        )}

                                        {activeExportJob ? (
                                            <div className="video-editor-export-card video-editor-export-card--studio">
                                                <div className="video-editor-export-card__state">
                                                    <strong>Export Status</strong>
                                                    <span className={`is-${activeExportJob.status}`}>{activeExportJob.status}</span>
                                                </div>
                                                <div className="video-editor-progress">
                                                    <div className="video-editor-progress__fill" style={{ width: `${activeExportJob.progress || 0}%` }} />
                                                </div>
                                                {activeExportJob.error ? <p>{activeExportJob.error}</p> : null}
                                                {activeExportJob.status === "completed" ? (
                                                    <button type="button" className="video-editor-primary-btn" onClick={() => downloadVideoEditorExport(activeExportJob)}>
                                                        <ArrowDownToLine size={16} />
                                                        <span>Download Export</span>
                                                    </button>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                </section>

                                <section className="video-editor-timeline">
                                    {timelineOverviewClips.length ? (
                                        <div className={`video-editor-timeline__sequence ${isMergeMode ? "video-editor-timeline__sequence--merge" : ""}`}>
                                            {!isMergeMode ? (
                                                <>
                                            <div className="video-editor-timeline__sequence-head">
                                                <strong>Final merged sequence</strong>
                                                <span>
                                                    {timelineOverviewClips.length} clip(s) - {formatDuration(timelineDurationMs)} - {mergedAudioSummary.audibleClips} with audio
                                                </span>
                                            </div>
                                            <div className="video-editor-timeline__sequence-help">
                                                This top row is the final export order. Select any clip below to trim it, split it, mute it, or move it before export.
                                            </div>
                                                </>
                                            ) : null}
                                            <div className={`video-editor-timeline__sequence-row ${isMergeMode ? "is-merge" : ""}`}>
                                                {timelineOverviewClips.map((clip) => (
                                                    <button
                                                        key={`sequence-${clip.id}`}
                                                        type="button"
                                                        className={`video-editor-timeline__sequence-clip ${String(clip.id) === String(selectedClipId) ? "is-active" : ""} ${isMergeMode ? "video-editor-timeline__sequence-clip--merge" : ""}`}
                                                        style={{ flex: `${clip.widthPercent} 1 0%` }}
                                                        onClick={() => {
                                                            setSelectedClipId(String(clip.id));
                                                            if (editorMode === "merge") {
                                                                setMergeClipIndex(clip.index);
                                                            }
                                                        }}
                                                    >
                                                        <div className="video-editor-timeline__sequence-track">
                                                            {(clip.timelineThumbs.length ? clip.timelineThumbs : [{ id: `fallback-${clip.id}`, src: clip.previewThumb }]).map((thumb, thumbIndex) => (
                                                                <div key={`${clip.id}-thumb-${thumb.id || thumbIndex}`} className="video-editor-timeline__sequence-frame">
                                                                    {thumb?.src ? (
                                                                        <img
                                                                            src={thumb.src}
                                                                            alt={`${clip.label || clip.asset?.originalName || `Clip ${clip.index + 1}`} frame ${thumbIndex + 1}`}
                                                                        />
                                                                    ) : (
                                                                        <div className="video-editor-timeline__sequence-thumb-fallback">
                                                                            <Video size={16} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <div
                                                                className="video-editor-timeline__sequence-trim-window"
                                                                style={{
                                                                    left: `${clip.trimStartPercent}%`,
                                                                    width: `${clip.trimWidthPercent}%`,
                                                                }}
                                                            />
                                                            <div className="video-editor-timeline__sequence-overlay">
                                                                <span className="video-editor-timeline__sequence-order">#{clip.index + 1}</span>
                                                                <span className="video-editor-timeline__sequence-title">
                                                                    {clip.label || clip.asset?.originalName || `Clip ${clip.index + 1}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {!isMergeMode ? (
                                                            <>
                                                                <div className="video-editor-timeline__sequence-info">
                                                                    <strong>{clip.label || clip.asset?.originalName || `Clip ${clip.index + 1}`}</strong>
                                                                    <span>{formatDuration(clip.clipDurationMs)}</span>
                                                                    <small className={clip.muted ? "is-muted" : ""}>
                                                                        {clip.muted ? "Muted" : "Audio on"}
                                                                    </small>
                                                                    <small className="video-editor-timeline__sequence-trim-copy">
                                                                        Keeping {formatDuration(clip.clipDurationMs)} from {formatDuration(clip.sourceDurationMs)}
                                                                    </small>
                                                                </div>
                                                                <div className="video-editor-timeline__sequence-controls">
                                                                    <span
                                                                        className="video-editor-timeline__sequence-move"
                                                                        role="button"
                                                                        tabIndex={0}
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            moveClip(clip.index, -1);
                                                                        }}
                                                                    >
                                                                        <ArrowUp size={14} />
                                                                    </span>
                                                                    <span
                                                                        className="video-editor-timeline__sequence-move"
                                                                        role="button"
                                                                        tabIndex={0}
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            moveClip(clip.index, 1);
                                                                        }}
                                                                    >
                                                                        <ArrowDown size={14} />
                                                                    </span>
                                                                </div>
                                                            </>
                                                        ) : null}
                                                        <span
                                                            className="video-editor-timeline__sequence-audio-toggle"
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                toggleClipMute(clip.id);
                                                            }}
                                                        >
                                                            {clip.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            {editorMode === "merge" ? (
                                                <div className="video-editor-timeline__merge-progress">
                                                    <div className="video-editor-timeline__merge-progress-bar">
                                                        <div
                                                            className="video-editor-timeline__merge-progress-fill"
                                                            style={{ width: `${mergePlayheadPercent}%` }}
                                                        />
                                                    </div>
                                                    <div className="video-editor-timeline__merge-progress-copy">
                                                        <span>{formatDuration(playheadMs)}</span>
                                                        <span>{formatDuration(timelineDurationMs)}</span>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    {selectedClip ? (
                                        <>
                                            <div className="video-editor-timeline__meta">
                                                <span>{formatDurationPrecise(selectedClip.trimStartMs || 0)}</span>
                                                <span className="video-editor-timeline__meta-center">
                                                    {`${selectedClip.label || selectedAsset?.originalName || `Clip ${selectedClipIndex + 1}`} - ${
                                                        isMergeMode ? "trim this merged segment directly" : `${formatDuration(selectedClipDurationMs)} selected`
                                                    }`}
                                                </span>
                                                <span>{formatDurationPrecise(selectedClip.trimEndMs || 0)}</span>
                                            </div>

                                            <div className="video-editor-timeline__strip">
                                                {thumbnailsLoading && !activeTrimThumbnails.length ? (
                                                    <div className="video-editor-timeline__loading">Generating filmstrip...</div>
                                                ) : activeTrimThumbnails.length ? (
                                                    activeTrimThumbnails.map((thumb) => (
                                                        <div key={thumb.id} className="video-editor-timeline__thumb">
                                                            {thumb.src ? (
                                                                <img
                                                                    src={thumb.src}
                                                                    alt={`Frame at ${formatDurationPrecise(Number(thumb.second || 0) * 1000)}`}
                                                                />
                                                            ) : (
                                                                <div className="video-editor-timeline__thumb-fallback" />
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="video-editor-timeline__placeholder">
                                                        {Array.from({ length: THUMBNAIL_COUNT }).map((_, index) => (
                                                            <div key={`placeholder-${index}`} className="video-editor-timeline__thumb video-editor-timeline__thumb--placeholder" />
                                                        ))}
                                                        <div className="video-editor-timeline__placeholder-note">
                                                            <strong>{selectedClip.label || selectedAsset?.originalName || "Selected clip"}</strong>
                                                            <span>Preview frames are still loading. You can already set trim start and end below.</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div
                                                    className="video-editor-timeline__selection"
                                                    style={{
                                                        left: `${trimStartPercent}%`,
                                                        width: `${Math.max(0, trimEndPercent - trimStartPercent)}%`,
                                                    }}
                                                >
                                                    <span className="video-editor-timeline__handle video-editor-timeline__handle--left" />
                                                    <span className="video-editor-timeline__handle video-editor-timeline__handle--right" />
                                                </div>
                                                <div className="video-editor-timeline__playhead" style={{ left: `${playheadPercent}%` }} />
                                            </div>

                                            <div className="video-editor-timeline__controls">
                                                <div className="video-editor-timeline__seekbar">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={Math.max(1, selectedSourceDurationMs)}
                                                        step="50"
                                                        value={selectedClip.trimStartMs}
                                                        onChange={(event) => {
                                                            const nextStart = fromSecondsInput(Number(event.target.value) / 1000);
                                                            updateClip(selectedClip.id, {
                                                                trimStartMs: Math.min(nextStart, selectedClip.trimEndMs - 100),
                                                            });
                                                            handleSeek(nextStart);
                                                        }}
                                                    />
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={Math.max(1, selectedSourceDurationMs)}
                                                        step="50"
                                                        value={selectedClip.trimEndMs}
                                                        onChange={(event) => {
                                                            const nextEnd = fromSecondsInput(Number(event.target.value) / 1000);
                                                            updateClip(selectedClip.id, {
                                                                trimEndMs: Math.max(nextEnd, selectedClip.trimStartMs + 100),
                                                            });
                                                            handleSeek(Math.min(localPlayheadMs, nextEnd));
                                                        }}
                                                    />
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max={Math.max(1, selectedSourceDurationMs)}
                                                        step="50"
                                                        value={localPlayheadMs}
                                                        onChange={(event) => handleSeek(fromSecondsInput(Number(event.target.value) / 1000))}
                                                    />
                                                </div>

                                                <div className="video-editor-timeline__bottom">
                                                    <button
                                                        type="button"
                                                        className="video-editor-control-btn video-editor-control-btn--play"
                                                        onClick={togglePlayback}
                                                        disabled={editorMode === "merge" ? !mergePreviewClip : !selectedAsset}
                                                    >
                                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                                    </button>

                                                    <div className="video-editor-timebox-group">
                                                        <label className="video-editor-timebox">
                                                            <span>Start</span>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                value={toSecondsInput(selectedClip.trimStartMs)}
                                                                onChange={(event) =>
                                                                    updateClip(selectedClip.id, {
                                                                        trimStartMs: fromSecondsInput(event.target.value),
                                                                    })
                                                                }
                                                            />
                                                        </label>
                                                        <label className="video-editor-timebox">
                                                            <span>End</span>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                value={toSecondsInput(selectedClip.trimEndMs)}
                                                                onChange={(event) =>
                                                                    updateClip(selectedClip.id, {
                                                                        trimEndMs: fromSecondsInput(event.target.value),
                                                                    })
                                                                }
                                                            />
                                                        </label>
                                                    </div>

                                                    <button type="button" className="video-editor-control-btn" onClick={() => splitClip(selectedClip.id)}>
                                                        <SplitSquareVertical size={18} />
                                                    </button>
                                                    <button type="button" className="video-editor-control-btn" onClick={handleResetTrim}>
                                                        Reset
                                                    </button>
                                                    <button type="button" className="video-editor-save-btn" onClick={handleSaveProject} disabled={savingProject}>
                                                        {savingProject ? <Loader2 className="video-editor-spin" size={18} /> : "Save"}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="video-editor-empty video-editor-empty--dark">
                                            Select a clip in the merged strip above to trim it directly.
                                        </div>
                                    )}
                                </section>
                                
                                
                            </div>
                        )}
                        </section>
                        </>
                    ) : null}
                </div>
            </main>

            <AppFooter />
        </>
    );
}

export default VideoEditor;

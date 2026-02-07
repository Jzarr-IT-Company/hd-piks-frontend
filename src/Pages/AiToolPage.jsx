import React from "react";
import { useParams, Link } from "react-router-dom";

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

const secondaryBtnStyle = {
	borderRadius: 999,
	padding: "6px 16px",
	backgroundColor: "#020617",
	color: "#ffffff",
	border: "1px solid #020617",
	fontSize: 13,
	textDecoration: "none",
	display: "inline-flex",
	alignItems: "center",
	gap: 6,
};

function AiToolPage() {
	const { id } = useParams();

	const titleMap = {
		"ai-text-voiceover": "AI Image Voiceover",
		"ai-bg-remove": "AI Background Remover",
		"ai-generator": "AI Image Generator",
		"ai-video-generator": "AI Video Generator",
	};

	const descMap = {
		"ai-text-voiceover":
			"Turn any image or script into an engaging voiceover for reels, explainers, and social content.",
		"ai-bg-remove":
			"Upload an image and instantly remove the background with AI. Ideal for product shots and thumbnails.",
		"ai-generator":
			"Describe your idea and let AI generate stunning visuals for your projects.",
		"ai-video-generator":
			"Generate high-quality videos with a prompt or an image, choosing from multiple generation models.",
	};

	const pageTitle = titleMap[id] || "AI Tool";
	const pageDesc =
		descMap[id] ||
		"Use AI-powered tools to enhance and generate creative assets for your projects.";

	const renderContent = () => {
		switch (id) {
			case "ai-text-voiceover":
				return (
					<div className="row g-4">
						{/* Left: script input */}
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 h-100 bg-white">
								<h5 className="fw-semibold mb-2">1. Enter your script</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Paste or type the text you want to convert into a natural‑sounding voiceover.
									Short, clear sentences work best.
								</p>
								<textarea
									className="form-control mb-2"
									rows={7}
									placeholder="e.g. Welcome to our channel! In this video, we’ll explore the most stunning wallpapers for your devices..."
								/>
								<div className="d-flex justify-content-between align-items-center">
									<small className="text-muted">
										Tip: Aim for 60–120 seconds of audio for best engagement.
									</small>
									<small className="text-muted">0 / 1,000 characters</small>
								</div>
							</div>
						</div>

						{/* Right: voice settings & preview */}
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 h-100 bg-white">
								<h5 className="fw-semibold mb-2">2. Customize voice & preview</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Choose the voice style, language and pace. Generate a preview before downloading the
									final audio file.
								</p>

								<div className="mb-3">
									<label className="form-label mb-1">Voice style</label>
									<select className="form-select form-select-sm">
										<option>Friendly (default)</option>
										<option>Professional</option>
										<option>Energetic</option>
										<option>Calm</option>
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1">Language</label>
									<select className="form-select form-select-sm">
										<option>English (US)</option>
										<option>English (UK)</option>
										<option>Spanish</option>
										<option>French</option>
									</select>
								</div>

								<div className="mb-3">
									<label className="form-label mb-1 d-flex justify-content-between">
										<span>Speech speed</span>
										<span className="text-muted" style={{ fontSize: 12 }}>
											Normal
										</span>
									</label>
									<input type="range" className="form-range" min="0.5" max="1.5" step="0.1" defaultValue="1" />
								</div>

								<div className="d-flex gap-2 mt-3">
									<button type="button" style={primaryBtnStyle}>
										Generate Preview
									</button>
									<button
										type="button"
										style={{
											...primaryBtnStyle,
											background: "#020617",
											borderColor: "#020617",
											boxShadow: "none",
										}}
									>
										Download Voiceover
									</button>
								</div>
							</div>
						</div>
					</div>
				);
			case "ai-bg-remove":
				return (
					<div className="row g-4">
						<div className="col-md-7">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100">
								<h5 className="fw-semibold mb-2">Upload image</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Upload a PNG or JPG and we’ll remove the background in seconds.
								</p>
								<div
									className="border rounded-3 d-flex flex-column justify-content-center align-items-center"
									style={{ minHeight: 220, borderStyle: "dashed" }}
								>
									<p className="mb-2" style={{ fontSize: 14 }}>
										Drop image here or click to upload
									</p>
									<button type="button" style={primaryBtnStyle}>
										Upload Image
									</button>
									<p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
										Max 30MB • JPG, PNG
									</p>
								</div>
							</div>
						</div>
						<div className="col-md-5">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100">
								<h5 className="fw-semibold mb-2">Preview</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									See original vs background-removed side by side.
								</p>
								<div className="d-flex gap-2">
									<div
										className="flex-fill border rounded-3 bg-light"
										style={{ minHeight: 120 }}
									/>
									<div
										className="flex-fill border rounded-3 bg-light"
										style={{ minHeight: 120 }}
									/>
								</div>
								<button type="button" className="mt-3" style={primaryBtnStyle}>
									Download PNG
								</button>
							</div>
						</div>
					</div>
				);
			case "ai-generator":
				return (
					<div className="row g-4">
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100">
								<h5 className="fw-semibold mb-2">Describe your image</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Enter a detailed prompt and choose style and aspect ratio.
								</p>
								<textarea
									className="form-control mb-3"
									rows={4}
									placeholder="e.g. neon city skyline at night, cinematic lighting"
								/>
								<div className="mb-3">
									<label className="form-label mb-1">Style</label>
									<select className="form-select form-select-sm">
										<option>Photorealistic</option>
										<option>Illustration</option>
										<option>3D render</option>
									</select>
								</div>
								<div className="mb-3">
									<label className="form-label mb-1">Aspect ratio</label>
									<select className="form-select form-select-sm">
										<option>1:1 Square</option>
										<option>16:9 Landscape</option>
										<option>9:16 Portrait</option>
									</select>
								</div>
								<button type="button" style={primaryBtnStyle}>
									Generate Image
								</button>
							</div>
						</div>
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100">
								<h5 className="fw-semibold mb-2">Results</h5>
								<p className="text-muted mb-3" style={{ fontSize: 14 }}>
									Your generated images will appear here. Click to preview or download.
								</p>
								<div className="row g-2">
									<div className="col-6">
										<div
											className="border rounded-3 bg-light"
											style={{ minHeight: 120 }}
										/>
									</div>
									<div className="col-6">
										<div
											className="border rounded-3 bg-light"
											style={{ minHeight: 120 }}
										/>
									</div>
									<div className="col-6">
										<div
											className="border rounded-3 bg-light"
											style={{ minHeight: 120 }}
										/>
									</div>
									<div className="col-6">
										<div
											className="border rounded-3 bg-light"
											style={{ minHeight: 120 }}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			case "ai-video-generator":
				return (
					<div className="row g-4">
						{/* Left: prompt / image input */}
						<div className="col-md-6">
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100">
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
							<div className="p-3 p-md-4 border rounded-4 bg-white h-100">
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
					<div className="p-3 p-md-4 border rounded-4 bg-white">
						<p className="text-muted mb-0" style={{ fontSize: 14 }}>
							Select an AI tool from the homepage AI tools bar to get started.
						</p>
					</div>
				);
		}
	};

	return (
		<div className="container py-4">
			<div className="mb-3">
				<Link to="/" style={secondaryBtnStyle}>
					<span>←</span>
					<span>Back to Home</span>
				</Link>
			</div>
			<h1 className="fw-bold mb-2" style={{ fontSize: "1.8rem" }}>
				{pageTitle}
			</h1>
			<p className="text-muted mb-4" style={{ maxWidth: 640 }}>
				{pageDesc}
			</p>
			{renderContent()}
		</div>
	);
}

export default AiToolPage;

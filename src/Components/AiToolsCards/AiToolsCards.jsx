import React from "react";
import { useNavigate } from "react-router-dom";
import { FiCpu, FiImage, FiScissors } from "react-icons/fi";

const DEFAULT_AI_TOOLS = [
	{ id: "ai-text-voiceover", label: "AI Text Voiceover", icon: <FiImage size={16} /> },
	{ id: "ai-bg-remove", label: "AI Background Remover", icon: <FiScissors size={16} /> },
	{ id: "ai-generator", label: "AI Image Generator", icon: <FiCpu size={16} /> },
	// NEW: separate video generator tool
	{ id: "ai-video-generator", label: "AI Video Generator", icon: <FiCpu size={16} /> },
];

function AiToolsCards({ tools = DEFAULT_AI_TOOLS, onSelect }) {
	const navigate = useNavigate();

	const handleClick = (tool) => {
		if (onSelect) onSelect(tool);
		navigate(`/ai/${encodeURIComponent(tool.id)}`);
	};

	return (
		<div
			className="d-flex flex-wrap justify-content-center gap-3 mb-3"
			style={{ rowGap: 10 }}
		>
			{tools.map((tool) => (
				<button
					key={tool.id}
					type="button"
					onClick={() => handleClick(tool)}
					className="btn btn-sm"
					style={{
						borderRadius: 999,
						fontSize: 13,
						padding: "8px 18px",
						background: "linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))",
						color: "#ffffff",
						border: "1px solid rgb(143, 92, 255)",
						boxShadow: "0 1px 3px rgba(15,23,42,0.25)",
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						whiteSpace: "nowrap",
					}}
				>
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{tool.icon}
					</span>
					<span>{tool.label}</span>
				</button>
			))}
		</div>
	);
}

export default AiToolsCards;

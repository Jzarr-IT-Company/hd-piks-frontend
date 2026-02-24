import React from "react";
import { useNavigate } from "react-router-dom";
import { FiCpu, FiEdit3, FiImage, FiMessageSquare, FiScissors } from "react-icons/fi";
import "./AiToolsCards.css";

const DEFAULT_AI_TOOLS = [
	{ id: "ai-text-voiceover", label: "AI Text Voiceover", icon: <FiImage size={16} /> },
	{ id: "ai-bg-remove", label: "AI Background Remover", icon: <FiScissors size={16} /> },
	{ id: "ai-generator", label: "AI Image Generator", icon: <FiCpu size={16} /> },
	{ id: "ai-video-generator", label: "AI Video Generator", icon: <FiCpu size={16} /> },
	{ id: "text-ai", label: "Text AI", icon: <FiMessageSquare size={16} /> },
	{ id: "image-editor", label: "Image Editor", icon: <FiEdit3 size={16} />, path: "/design-hdpiks" },
];

function AiToolsCards({ tools = DEFAULT_AI_TOOLS, onSelect }) {
	const navigate = useNavigate();

	const handleClick = (tool) => {
		if (onSelect) onSelect(tool);
		if (tool?.path) {
			navigate(tool.path);
			return;
		}
		navigate(`/ai/${encodeURIComponent(tool.id)}`);
	};

	return (
		<div className="ai-tools-cards-grid">
			{tools.map((tool) => (
				<div key={tool.id} className="ai-tools-card-item">
					<button
						type="button"
						onClick={() => handleClick(tool)}
						className="btn btn-sm w-100 ai-tools-card-button"
					>
						<span className="ai-tools-card-icon">
							{tool.icon}
						</span>
						<span className="ai-tools-card-label">{tool.label}</span>
					</button>
				</div>
			))}
		</div>
	);
}

export default AiToolsCards;

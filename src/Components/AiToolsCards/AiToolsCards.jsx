import React from "react";
import { useNavigate } from "react-router-dom";
import { FiCpu, FiImage, FiScissors } from "react-icons/fi";

const DEFAULT_AI_TOOLS = [
	{ id: "ai-text-voiceover", label: "AI Text Voiceover", icon: <FiImage size={16} /> },
	{ id: "ai-bg-remove", label: "AI Background Remover", icon: <FiScissors size={16} /> },
	{ id: "ai-generator", label: "AI Image Generator", icon: <FiCpu size={16} /> },
	{ id: "ai-video-generator", label: "AI Video Generator", icon: <FiCpu size={16} /> },
];

function AiToolsCards({ tools = DEFAULT_AI_TOOLS, onSelect }) {
	const navigate = useNavigate();

	const handleClick = (tool) => {
		if (onSelect) onSelect(tool);
		navigate(`/ai/${encodeURIComponent(tool.id)}`);
	};

	return (
		<div className="row g-2 justify-content-center">
			{tools.map((tool) => (
				<div
					key={tool.id}
					className="col-6 col-md-auto d-flex justify-content-center"
				>
					<button
						type="button"
						onClick={() => handleClick(tool)}
						className="btn btn-sm w-100"
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 8,
							padding: "8px 14px",
							borderRadius: 999,
							background: "linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))",
							color: "#ffffff",
							border: "1px solid rgb(143, 92, 255)",
							boxShadow: "0 1px 3px rgba(15,23,42,0.25)",
							fontSize: 12,
							fontWeight: 500,
							whiteSpace: "normal",
							textAlign: "center",
							lineHeight: 1.2,
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
				</div>
			))}
		</div>
	);
}

export default AiToolsCards;

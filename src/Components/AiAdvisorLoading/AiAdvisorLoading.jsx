import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import "./AiAdvisorLoading.css";

const DEFAULT_STEPS = [
    "Analyzing your profile",
    "Matching best opportunities",
    "Preparing strategy and roadmap",
    "Finalizing your report",
];

function AiAdvisorLoading({
    title = "AI is building your report",
    subtitle = "This usually takes a few moments. Please keep this page open while we prepare the response.",
    steps = DEFAULT_STEPS,
}) {
    const safeSteps = Array.isArray(steps) && steps.length ? steps : DEFAULT_STEPS;
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setActiveStep((current) => (current + 1) % safeSteps.length);
        }, 1400);
        return () => window.clearInterval(timerId);
    }, [safeSteps.length]);

    return (
        <div className="ai-advisor-loading-card">
            <div className="ai-advisor-loading-head">
                <div className="ai-advisor-loading-badge">
                    <Sparkles size={16} />
                    <span>Generating</span>
                </div>
                <div className="ai-advisor-loading-orbit" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
            <h5 className="ai-advisor-loading-title">{title}</h5>
            <p className="ai-advisor-loading-subtitle">{subtitle}</p>
            <div className="ai-advisor-loading-progress" aria-hidden="true">
                <div className="ai-advisor-loading-progress-bar" />
            </div>
            <div className="ai-advisor-loading-steps">
                {safeSteps.map((step, index) => (
                    <div
                        key={step}
                        className={`ai-advisor-loading-step ${index === activeStep ? "is-active" : ""} ${index < activeStep ? "is-complete" : ""}`}
                    >
                        <span className="ai-advisor-loading-dot" />
                        <span>{step}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AiAdvisorLoading;

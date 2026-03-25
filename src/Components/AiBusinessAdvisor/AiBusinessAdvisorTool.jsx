import React, { useEffect, useRef, useState } from "react";
import {    CircleDollarSign,
    Compass,
    Download,
    Megaphone,
    ShieldAlert,
    Sparkles,
    Target,
    WalletCards,
} from "lucide-react";
import { generateBusinessAdvisorReport } from "../../Services/aiChat";
import { downloadSimplePdf } from "../../utils/pdfDownload";
import AiAdvisorLoading from "../AiAdvisorLoading/AiAdvisorLoading";
import "../AiCareerAdvisor/AiCareerAdvisorTool.css";
import "./AiBusinessAdvisorTool.css";

const EDUCATION_LEVELS = ["Matric", "Intermediate", "Bachelor", "Master", "PhD"];
const CURRENT_PROFESSIONS = ["Student", "Job", "Freelancer", "Business"];
const INVESTMENT_BUDGETS = ["50k", "100k", "500k", "1M+"];
const RISK_TOLERANCE = ["Low", "Medium", "High"];
const YES_NO_OPTIONS = ["Yes", "No"];
const BUSINESS_TYPE_OPTIONS = ["Online", "Offline", "Hybrid"];
const WORK_STYLE_OPTIONS = ["Solo", "Team", "Partnership"];
const COMMITMENT_OPTIONS = ["Full-time", "Part-time"];
const TARGET_MARKETS = ["Local", "National", "International"];
const LOCATION_ADVANTAGES = ["Big city", "Small city", "Rural"];
const BUSINESS_GOALS = ["Side income", "Full business", "Scale startup"];
const GROWTH_EXPECTATIONS = ["Fast", "Moderate", "Slow"];

const INITIAL_FORM = {
    basicInformation: {
        fullName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
    },
    personalAndFinancialBackground: {
        age: "",
        educationLevel: "",
        currentProfession: "",
        monthlyIncome: "",
        availableInvestmentBudget: "",
        riskTolerance: "",
    },
    skillsAndExperience: {
        skills: "",
        previousBusinessExperience: "",
        industryExperience: "",
    },
    interestsAndBusinessPreferences: {
        interestedIndustries: "",
        businessTypePreference: "",
        workStyle: "",
    },
    timeCommitment: {
        availableTimePerDay: "",
        commitmentType: "",
    },
    marketAndLocationFactors: {
        targetMarket: "",
        locationAdvantage: "",
    },
    goalsAndExpectations: {
        goalOfBusiness: "",
        expectedMonthlyIncome: "",
        growthExpectation: "",
    },
    constraints: {
        budgetLimitations: "",
        timeConstraints: "",
        skillLimitations: "",
    },
};

const splitList = (value) =>
    String(value || "")
        .split(/\r?\n|,|;/)
        .map((item) => item.trim())
        .filter(Boolean);

const escapeHtml = (value) =>
    String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

function InputField({ label, value, onChange, placeholder = "", type = "text" }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            <input className="form-control" type={type} value={value} placeholder={placeholder} onChange={onChange} />
        </div>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            <select className="form-select" value={value} onChange={onChange}>
                <option value="">Select</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextareaField({ label, value, onChange, placeholder = "", rows = 3 }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            <textarea className="form-control" rows={rows} value={value} placeholder={placeholder} onChange={onChange} />
        </div>
    );
}

function AiBusinessAdvisorTool({ primaryBtnStyle }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const resultRef = useRef(null);

    useEffect(() => {
        if (!resultRef.current || !result) return;
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [result]);

    const updateField = (section, field, value) => {
        setForm((current) => ({
            ...current,
            [section]: {
                ...current[section],
                [field]: value,
            },
        }));
    };

    const buildPayload = () => ({
        basicInformation: form.basicInformation,
        personalAndFinancialBackground: form.personalAndFinancialBackground,
        skillsAndExperience: {
            ...form.skillsAndExperience,
            skills: splitList(form.skillsAndExperience.skills),
        },
        interestsAndBusinessPreferences: {
            ...form.interestsAndBusinessPreferences,
            interestedIndustries: splitList(form.interestsAndBusinessPreferences.interestedIndustries),
        },
        timeCommitment: form.timeCommitment,
        marketAndLocationFactors: form.marketAndLocationFactors,
        goalsAndExpectations: form.goalsAndExpectations,
        constraints: form.constraints,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const response = await generateBusinessAdvisorReport({
                profile: buildPayload(),
            });
            setResult(response);
        } catch (submitError) {
            setError(
                String(
                    submitError?.response?.data?.message ||
                        submitError?.message ||
                        "Failed to generate business advisor report"
                ).trim()
            );
        } finally {
            setLoading(false);
        }
    };

    const report = result?.report || null;

    const handleDownloadPdf = () => {
        if (!report) return;
        const createdAt = result?.generatedAt ? new Date(result.generatedAt) : new Date();
        const reportDate = Number.isNaN(createdAt.getTime()) ? new Date().toLocaleString() : createdAt.toLocaleString();
        const candidateName =
            result?.profile?.basicInformation?.fullName ||
            form?.basicInformation?.fullName ||
            "Business Advisor Report";

        const sections = [
            {
                heading: "1. Best Business Ideas",
                lines: (report.bestBusinessIdeas || []).flatMap((item) => [
                    item.title + (item.explanation ? ": " + item.explanation : ""),
                    item.estimatedInvestment ? "- Estimated investment: " + item.estimatedInvestment : "",
                    item.businessModel ? "- Business model: " + item.businessModel : "",
                    item.estimatedTimeToProfit ? "- Time to profit: " + item.estimatedTimeToProfit : "",
                ].filter(Boolean)),
            },
            {
                heading: "2. Recommended Business Model",
                lines: [
                    "Primary Model: " + (report.recommendedBusinessModel?.primaryModel || "-"),
                    report.recommendedBusinessModel?.reason || "",
                    report.recommendedBusinessModel?.alternatives?.length ? "Alternatives: " + report.recommendedBusinessModel.alternatives.join(", ") : "",
                ].filter(Boolean),
            },
            {
                heading: "3. Investment Breakdown",
                lines: (report.investmentBreakdown || []).map((item) => item.item + ": " + (item.cost || "-") + (item.notes ? " | " + item.notes : "")),
            },
            { heading: "4. Marketing Strategy", lines: report.marketingStrategy || ["-"] },
            { heading: "5. Growth Timeline: 0-3 months", lines: report.growthTimeline?.phase0To3Months || ["-"] },
            { heading: "5. Growth Timeline: 3-6 months", lines: report.growthTimeline?.phase3To6Months || ["-"] },
            { heading: "5. Growth Timeline: 6-12 months", lines: report.growthTimeline?.phase6To12Months || ["-"] },
            {
                heading: "6. Profitability Estimate",
                lines: [
                    "Break-even: " + (report.profitabilityEstimate?.breakEven || "-"),
                    "Expected profit: " + (report.profitabilityEstimate?.expectedProfit || "-"),
                    "Timeline: " + (report.profitabilityEstimate?.timeline || "-"),
                ],
            },
            { heading: "7. Step-by-Step Action Plan", lines: report.stepByStepActionPlan || ["-"] },
            { heading: "8. Risk Analysis", lines: report.riskAnalysis || ["-"] },
        ];

        downloadSimplePdf({
            fileName: candidateName + "-business-advisor-report",
            title: "HDPiks Business Advisor",
            subtitle: "Generated on " + reportDate,
            sections,
        });
    };

    return (
        <>
            <div className="row g-4">
                <div className="col-lg-7">
                    <form className="p-3 p-md-4 border rounded-4 bg-white ai-tool-panel" onSubmit={handleSubmit}>
                        <div className="ai-career-intro mb-4">
                            <div>
                                <h5 className="fw-semibold mb-2">Build your business profile</h5>
                                <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                                    Share your budget, skills, interests, and growth expectations. The advisor will return business ideas,
                                    execution strategy, investment planning, and a realistic profitability path.
                                </p>
                            </div>
                            <div className="ai-career-intro-badge">
                                <Sparkles size={18} />
                                <span>AI business advisor</span>
                            </div>
                        </div>

                        <div className="ai-career-sections">
                            <section className="ai-career-section-card">
                                <h6>1. Basic Information</h6>
                                <div className="row g-3">
                                    <div className="col-md-6"><InputField label="Full Name (optional)" value={form.basicInformation.fullName} onChange={(e) => updateField("basicInformation", "fullName", e.target.value)} /></div>
                                    <div className="col-md-6"><InputField label="Email" value={form.basicInformation.email} onChange={(e) => updateField("basicInformation", "email", e.target.value)} /></div>
                                    <div className="col-md-6"><InputField label="Phone (optional)" value={form.basicInformation.phone} onChange={(e) => updateField("basicInformation", "phone", e.target.value)} /></div>
                                    <div className="col-md-3"><InputField label="City" value={form.basicInformation.city} onChange={(e) => updateField("basicInformation", "city", e.target.value)} /></div>
                                    <div className="col-md-3"><InputField label="Country" value={form.basicInformation.country} onChange={(e) => updateField("basicInformation", "country", e.target.value)} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>2. Personal & Financial Background</h6>
                                <div className="row g-3">
                                    <div className="col-md-4"><InputField label="Age" value={form.personalAndFinancialBackground.age} onChange={(e) => updateField("personalAndFinancialBackground", "age", e.target.value)} /></div>
                                    <div className="col-md-4"><SelectField label="Education Level" value={form.personalAndFinancialBackground.educationLevel} onChange={(e) => updateField("personalAndFinancialBackground", "educationLevel", e.target.value)} options={EDUCATION_LEVELS} /></div>
                                    <div className="col-md-4"><SelectField label="Current Profession" value={form.personalAndFinancialBackground.currentProfession} onChange={(e) => updateField("personalAndFinancialBackground", "currentProfession", e.target.value)} options={CURRENT_PROFESSIONS} /></div>
                                    <div className="col-md-4"><InputField label="Monthly Income" value={form.personalAndFinancialBackground.monthlyIncome} onChange={(e) => updateField("personalAndFinancialBackground", "monthlyIncome", e.target.value)} placeholder="e.g. 80,000 PKR" /></div>
                                    <div className="col-md-4"><SelectField label="Available Investment Budget" value={form.personalAndFinancialBackground.availableInvestmentBudget} onChange={(e) => updateField("personalAndFinancialBackground", "availableInvestmentBudget", e.target.value)} options={INVESTMENT_BUDGETS} /></div>
                                    <div className="col-md-4"><SelectField label="Risk Tolerance" value={form.personalAndFinancialBackground.riskTolerance} onChange={(e) => updateField("personalAndFinancialBackground", "riskTolerance", e.target.value)} options={RISK_TOLERANCE} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>3. Skills & Experience</h6>
                                <div className="row g-3">
                                    <div className="col-md-6"><TextareaField label="Skills" value={form.skillsAndExperience.skills} onChange={(e) => updateField("skillsAndExperience", "skills", e.target.value)} placeholder="Sales, marketing, coding, designing..." /></div>
                                    <div className="col-md-3"><SelectField label="Previous Business Experience" value={form.skillsAndExperience.previousBusinessExperience} onChange={(e) => updateField("skillsAndExperience", "previousBusinessExperience", e.target.value)} options={YES_NO_OPTIONS} /></div>
                                    <div className="col-md-3"><InputField label="Industry Experience" value={form.skillsAndExperience.industryExperience} onChange={(e) => updateField("skillsAndExperience", "industryExperience", e.target.value)} placeholder="IT, food, retail..." /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>4. Interests & Business Preferences</h6>
                                <div className="row g-3">
                                    <div className="col-md-6"><TextareaField label="Interested Industries" value={form.interestsAndBusinessPreferences.interestedIndustries} onChange={(e) => updateField("interestsAndBusinessPreferences", "interestedIndustries", e.target.value)} placeholder="E-commerce, services, food, tech..." /></div>
                                    <div className="col-md-3"><SelectField label="Business Type Preference" value={form.interestsAndBusinessPreferences.businessTypePreference} onChange={(e) => updateField("interestsAndBusinessPreferences", "businessTypePreference", e.target.value)} options={BUSINESS_TYPE_OPTIONS} /></div>
                                    <div className="col-md-3"><SelectField label="Work Style" value={form.interestsAndBusinessPreferences.workStyle} onChange={(e) => updateField("interestsAndBusinessPreferences", "workStyle", e.target.value)} options={WORK_STYLE_OPTIONS} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>5. Time Commitment</h6>
                                <div className="row g-3">
                                    <div className="col-md-6"><InputField label="Available Time per Day" value={form.timeCommitment.availableTimePerDay} onChange={(e) => updateField("timeCommitment", "availableTimePerDay", e.target.value)} placeholder="e.g. 2-4 hours" /></div>
                                    <div className="col-md-6"><SelectField label="Commitment" value={form.timeCommitment.commitmentType} onChange={(e) => updateField("timeCommitment", "commitmentType", e.target.value)} options={COMMITMENT_OPTIONS} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>6. Market & Location Factors</h6>
                                <div className="row g-3">
                                    <div className="col-md-6"><SelectField label="Target Market" value={form.marketAndLocationFactors.targetMarket} onChange={(e) => updateField("marketAndLocationFactors", "targetMarket", e.target.value)} options={TARGET_MARKETS} /></div>
                                    <div className="col-md-6"><SelectField label="Location Advantage" value={form.marketAndLocationFactors.locationAdvantage} onChange={(e) => updateField("marketAndLocationFactors", "locationAdvantage", e.target.value)} options={LOCATION_ADVANTAGES} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>7. Goals & Expectations</h6>
                                <div className="row g-3">
                                    <div className="col-md-4"><SelectField label="Goal of Business" value={form.goalsAndExpectations.goalOfBusiness} onChange={(e) => updateField("goalsAndExpectations", "goalOfBusiness", e.target.value)} options={BUSINESS_GOALS} /></div>
                                    <div className="col-md-4"><InputField label="Expected Monthly Income" value={form.goalsAndExpectations.expectedMonthlyIncome} onChange={(e) => updateField("goalsAndExpectations", "expectedMonthlyIncome", e.target.value)} placeholder="e.g. 200,000 PKR" /></div>
                                    <div className="col-md-4"><SelectField label="Growth Expectation" value={form.goalsAndExpectations.growthExpectation} onChange={(e) => updateField("goalsAndExpectations", "growthExpectation", e.target.value)} options={GROWTH_EXPECTATIONS} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>8. Constraints</h6>
                                <div className="row g-3">
                                    <div className="col-md-4"><InputField label="Budget Limitations" value={form.constraints.budgetLimitations} onChange={(e) => updateField("constraints", "budgetLimitations", e.target.value)} /></div>
                                    <div className="col-md-4"><InputField label="Time Constraints" value={form.constraints.timeConstraints} onChange={(e) => updateField("constraints", "timeConstraints", e.target.value)} /></div>
                                    <div className="col-md-4"><InputField label="Skill Limitations" value={form.constraints.skillLimitations} onChange={(e) => updateField("constraints", "skillLimitations", e.target.value)} /></div>
                                </div>
                            </section>
                        </div>

                        {error ? <p className="text-danger mt-3 mb-0" style={{ fontSize: 13 }}>{error}</p> : null}

                        <div className="d-flex justify-content-end mt-4">
                            <button type="submit" style={primaryBtnStyle} disabled={loading}>
                                {loading ? "Generating report..." : "Generate Business Plan"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="col-lg-5">
                    <div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel ai-career-side-panel">
                        <h5 className="fw-semibold mb-3">What the advisor will return</h5>
                        <div className="ai-career-side-list">
                            <div className="ai-career-side-item"><Target size={18} /><div><strong>Top business ideas</strong><span>3-5 practical options matched to your budget, skills, and market.</span></div></div>
                            <div className="ai-career-side-item"><WalletCards size={18} /><div><strong>Investment plan</strong><span>Simple cost breakdown for setup, marketing, and launch priorities.</span></div></div>
                            <div className="ai-career-side-item"><Megaphone size={18} /><div><strong>Marketing strategy</strong><span>Channels, campaigns, and traction ideas suited to your business type.</span></div></div>
                            <div className="ai-career-side-item"><Compass size={18} /><div><strong>Growth timeline</strong><span>0-3 months, 3-6 months, and 6-12 months execution roadmap.</span></div></div>
                            <div className="ai-career-side-item"><CircleDollarSign size={18} /><div><strong>Profitability estimate</strong><span>Break-even expectation, profit potential, and realistic pace of growth.</span></div></div>
                            <div className="ai-career-side-item"><ShieldAlert size={18} /><div><strong>Risk analysis</strong><span>Likely blockers, competition risk, and how to reduce avoidable mistakes.</span></div></div>
                        </div>
                        {loading ? (
                <div className="row g-4 mt-1">
                    <div className="col-12">
                        <AiAdvisorLoading
                            title="AI is building your business plan"
                            subtitle="We are evaluating your budget, business fit, and growth potential to prepare a practical plan."
                            steps={[
                                "Reviewing your business profile",
                                "Comparing idea and model options",
                                "Preparing investment and growth strategy",
                                "Finalizing your report",
                            ]}
                        />
                    </div>
                </div>
            ) : null}

            {report ? (
                            <div className="ai-career-side-result mt-4">
                                <div className="ai-career-side-result-label">Primary business model</div>
                                <p className="mb-1 fw-semibold">{report.recommendedBusinessModel?.primaryModel || "-"}</p>
                                {report.recommendedBusinessModel?.reason ? <p className="mb-0">{report.recommendedBusinessModel.reason}</p> : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {report ? (
                <div ref={resultRef} className="row g-4 mt-1">
                    <div className="col-12">
                        <div className="p-3 p-md-4 border rounded-4 bg-white ai-tool-panel">
                            <div className="ai-career-report-head">
                                <div>
                                    <h4 className="fw-semibold mb-1">Business Advisor Report</h4>
                                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>Personalized output generated from your business profile.</p>
                                </div>
                                <button type="button" className="ai-career-download-btn" onClick={handleDownloadPdf}><Download size={16} /><span>Download PDF</span></button>
                            </div>

                            <div className="ai-career-report-stack">
                                <section className="ai-career-report-section">
                                    <h6>1. Best Business Ideas</h6>
                                    <div className="row g-3">
                                        {report.bestBusinessIdeas.map((item, index) => (
                                            <div key={`${item.title}-${index}`} className="col-md-6 col-xl-4">
                                                <article className="ai-career-path-card">
                                                    <h6>{item.title}</h6>
                                                    {item.explanation ? <p>{item.explanation}</p> : null}
                                                    <div className="ai-career-mini-list">
                                                        {item.estimatedInvestment ? <><strong>Estimated investment</strong><span>{item.estimatedInvestment}</span></> : null}
                                                        {item.businessModel ? <><strong>Business model</strong><span>{item.businessModel}</span></> : null}
                                                        {item.estimatedTimeToProfit ? <><strong>Time to profit</strong><span>{item.estimatedTimeToProfit}</span></> : null}
                                                    </div>
                                                </article>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>2. Recommended Business Model</h6>
                                    <article className="ai-business-model-card">
                                        <strong className="ai-business-model-primary">{report.recommendedBusinessModel?.primaryModel || "-"}</strong>
                                        {report.recommendedBusinessModel?.reason ? <p>{report.recommendedBusinessModel.reason}</p> : null}
                                        {report.recommendedBusinessModel?.alternatives?.length ? (
                                            <div className="ai-career-mini-list"><strong>Alternatives</strong><span>{report.recommendedBusinessModel.alternatives.join(", ")}</span></div>
                                        ) : null}
                                    </article>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>3. Investment Breakdown</h6>
                                    <div className="ai-business-table-wrap">
                                        <table className="ai-business-investment-table">
                                            <thead><tr><th>Item</th><th>Cost</th><th>Notes</th></tr></thead>
                                            <tbody>
                                                {report.investmentBreakdown.length ? report.investmentBreakdown.map((item, index) => (
                                                    <tr key={`${item.item}-${index}`}><td>{item.item}</td><td>{item.cost || "-"}</td><td>{item.notes || "-"}</td></tr>
                                                )) : <tr><td colSpan={3}>No breakdown available.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <section className="ai-career-report-section"><h6>4. Marketing Strategy</h6><ul className="ai-career-bullet-list">{report.marketingStrategy.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>
                                <section className="ai-career-report-section">
                                    <h6>5. Growth Timeline</h6>
                                    <div className="row g-3">
                                        <div className="col-md-4"><article className="ai-career-roadmap-card"><strong>0-3 months</strong><ul className="ai-career-bullet-list compact">{report.growthTimeline.phase0To3Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div>
                                        <div className="col-md-4"><article className="ai-career-roadmap-card"><strong>3-6 months</strong><ul className="ai-career-bullet-list compact">{report.growthTimeline.phase3To6Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div>
                                        <div className="col-md-4"><article className="ai-career-roadmap-card"><strong>6-12 months</strong><ul className="ai-career-bullet-list compact">{report.growthTimeline.phase6To12Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div>
                                    </div>
                                </section>
                                <section className="ai-career-report-section"><h6>6. Profitability Estimate</h6><div className="ai-career-salary-grid"><div className="ai-career-salary-card"><span>Break-even</span><strong>{report.profitabilityEstimate?.breakEven || "-"}</strong></div><div className="ai-career-salary-card"><span>Expected profit</span><strong>{report.profitabilityEstimate?.expectedProfit || "-"}</strong></div><div className="ai-career-salary-card"><span>Timeline</span><strong>{report.profitabilityEstimate?.timeline || "-"}</strong></div></div></section>
                                <section className="ai-career-report-section"><h6>7. Step-by-Step Action Plan</h6><ul className="ai-career-bullet-list">{report.stepByStepActionPlan.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>
                                <section className="ai-career-report-section"><h6>8. Risk Analysis</h6><ul className="ai-career-bullet-list">{report.riskAnalysis.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default AiBusinessAdvisorTool;




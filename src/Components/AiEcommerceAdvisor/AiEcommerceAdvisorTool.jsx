import React, { useEffect, useRef, useState } from "react";
import {
    Download,
    PackageSearch,
    ShieldAlert,
    ShoppingBag,
    Sparkles,
    Store,
    TrendingUp,
    WalletCards,
    Wrench,
} from "lucide-react";
import { generateEcommerceAdvisorReport } from "../../Services/aiChat";
import { downloadSimplePdf } from "../../utils/pdfDownload";
import AiAdvisorLoading from "../AiAdvisorLoading/AiAdvisorLoading";
import "../AiCareerAdvisor/AiCareerAdvisorTool.css";
import "./AiEcommerceAdvisorTool.css";

const BUDGET_OPTIONS = ["10k", "50k", "100k", "500k+"];
const YES_NO_OPTIONS = ["Yes", "No"];
const INVESTMENT_TYPE_OPTIONS = ["Low", "Medium", "High"];
const ECOMMERCE_EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Expert"];
const WORK_PREFERENCE_OPTIONS = ["Passive income", "Active business"];
const DAILY_TIME_OPTIONS = ["1-2 hrs", "3-5 hrs", "Full-time"];
const GOAL_OPTIONS = ["Side income", "Full-time business"];
const MARKET_OPTIONS = ["Local", "International"];
const STRATEGY_MODE_OPTIONS = ["Fast Profit", "Long-term Brand"];
const KNOWLEDGE_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const PRODUCT_TYPE_OPTIONS = ["Physical", "Digital", "Both"];

const INITIAL_FORM = {
    basicInfo: {
        age: "",
        country: "",
        city: "",
    },
    budgetAndResources: {
        availableBudget: "",
        hasLaptopInternet: "",
        investmentType: "",
    },
    skillsAndExperience: {
        skills: "",
        ecommerceExperience: "",
        businessKnowledgeLevel: "",
    },
    interests: {
        productInterests: "",
        workPreference: "",
        productTypePreference: "",
    },
    timeAvailability: {
        dailyTime: "",
    },
    goals: {
        goal: "",
        expectedMonthlyIncome: "",
        strategyMode: "",
    },
    marketPreference: {
        sellingMarket: "",
    },
    financialInputs: {
        productCost: "",
        expectedSellingPrice: "",
        adBudget: "",
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

function AiEcommerceAdvisorTool({ primaryBtnStyle }) {
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
        basicInfo: form.basicInfo,
        budgetAndResources: form.budgetAndResources,
        skillsAndExperience: {
            ...form.skillsAndExperience,
            skills: splitList(form.skillsAndExperience.skills),
        },
        interests: {
            ...form.interests,
            productInterests: splitList(form.interests.productInterests),
        },
        timeAvailability: form.timeAvailability,
        goals: form.goals,
        marketPreference: form.marketPreference,
        financialInputs: form.financialInputs,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const response = await generateEcommerceAdvisorReport({
                profile: buildPayload(),
            });
            setResult(response);
        } catch (submitError) {
            setError(
                String(
                    submitError?.response?.data?.message ||
                        submitError?.message ||
                        "Failed to generate ecommerce advisor report"
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
        const title = report?.bestEcommercePlatform?.platform || "Ecommerce Advisor Report";

        const renderList = (items) => {
            const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
            if (!safeItems.length) return '<p class="pdf-empty">-</p>';
            return '<ul>' + safeItems.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>';
        };

        const renderProductIdeas = () => {
            if (!Array.isArray(report.winningProductIdeas) || !report.winningProductIdeas.length) {
                return '<p class="pdf-empty">-</p>';
            }
            return report.winningProductIdeas.map((item) => (
                '<div class="pdf-card">' +
                    '<h3>' + escapeHtml(item.productName) + '</h3>' +
                    '<div><strong>Demand:</strong> ' + escapeHtml(item.demandLevel || '-') + '</div>' +
                    '<div><strong>Competition:</strong> ' + escapeHtml(item.competitionLevel || '-') + '</div>' +
                    '<div><strong>Estimated margin:</strong> ' + escapeHtml(item.estimatedProfitMargin || '-') + '</div>' +
                    '<div><strong>Supplier:</strong> ' + escapeHtml(item.supplierSuggestion || '-') + '</div>' +
                    (item.reason ? '<p>' + escapeHtml(item.reason) + '</p>' : '') +
                '</div>'
            )).join('');
        };

        const renderInvestmentTable = () => {
            const rows = Array.isArray(report.investmentBreakdown) ? report.investmentBreakdown.filter((item) => item?.item) : [];
            if (!rows.length) return '<p class="pdf-empty">-</p>';
            return '<table class="pdf-table"><thead><tr><th>Item</th><th>Cost</th><th>Notes</th></tr></thead><tbody>' +
                rows.map((item) => '<tr><td>' + escapeHtml(item.item) + '</td><td>' + escapeHtml(item.cost || '-') + '</td><td>' + escapeHtml(item.notes || '-') + '</td></tr>').join('') +
                '</tbody></table>';
        };

        const renderToolCards = () => {
            const rows = Array.isArray(report.toolsAndResources) ? report.toolsAndResources.filter((item) => item?.name) : [];
            if (!rows.length) return '<p class="pdf-empty">-</p>';
            return rows.map((item) => '<div class="pdf-card"><h3>' + escapeHtml(item.name) + '</h3><div><strong>Category:</strong> ' + escapeHtml(item.category || '-') + '</div>' + (item.reason ? '<p>' + escapeHtml(item.reason) + '</p>' : '') + '</div>').join('');
        };

        const popup = window.open('', '_blank', 'width=960,height=1200');
        if (!popup) return;

        const html = '<!doctype html><html><head><meta charset="utf-8" />' +
            '<title>' + escapeHtml(title) + ' - Ecommerce Advisor Report</title>' +
            '<style>' +
            'body{font-family:Arial,sans-serif;color:#0f172a;margin:32px;}' +
            '.pdf-head{margin-bottom:28px;border-bottom:2px solid #e2e8f0;padding-bottom:16px;}' +
            '.pdf-badge{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;color:#7c3aed;text-transform:uppercase;margin-bottom:8px;}' +
            'h1{margin:0 0 8px;font-size:30px;}' +
            '.pdf-meta{color:#475569;font-size:14px;}' +
            '.pdf-section{margin:0 0 24px;page-break-inside:avoid;}' +
            '.pdf-section h2{margin:0 0 10px;font-size:20px;color:#1e1b4b;}' +
            '.pdf-section p,.pdf-section li,.pdf-section div,.pdf-section td,.pdf-section th{font-size:14px;line-height:1.7;}' +
            '.pdf-section ul{margin:0;padding-left:20px;}' +
            '.pdf-card{border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:12px;}' +
            '.pdf-card h3{margin:0 0 8px;font-size:16px;}' +
            '.pdf-table{width:100%;border-collapse:collapse;}' +
            '.pdf-table th,.pdf-table td{border:1px solid #e2e8f0;padding:10px;text-align:left;vertical-align:top;}' +
            '.pdf-empty{color:#64748b;}' +
            '@media print{body{margin:18px;}.pdf-section{break-inside:avoid;}}' +
            '</style></head><body>' +
            '<div class="pdf-head"><div class="pdf-badge">HDPiks Ecommerce Advisor</div><h1>' + escapeHtml(title) + '</h1><div class="pdf-meta">Generated on ' + escapeHtml(reportDate) + '</div></div>' +
            '<section class="pdf-section"><h2>1. Best Ecommerce Platform</h2><div class="pdf-card"><div><strong>Platform:</strong> ' + escapeHtml(report.bestEcommercePlatform?.platform || '-') + '</div>' + (report.bestEcommercePlatform?.reason ? '<p>' + escapeHtml(report.bestEcommercePlatform.reason) + '</p>' : '') + (report.bestEcommercePlatform?.alternatives?.length ? '<div><strong>Alternatives:</strong> ' + escapeHtml(report.bestEcommercePlatform.alternatives.join(', ')) + '</div>' : '') + '</div></section>' +
            '<section class="pdf-section"><h2>2. Recommended Business Model</h2><div class="pdf-card"><div><strong>Model:</strong> ' + escapeHtml(report.recommendedBusinessModel?.primaryModel || '-') + '</div>' + (report.recommendedBusinessModel?.reason ? '<p>' + escapeHtml(report.recommendedBusinessModel.reason) + '</p>' : '') + '</div></section>' +
            '<section class="pdf-section"><h2>3. Winning Product Ideas</h2>' + renderProductIdeas() + '</section>' +
            '<section class="pdf-section"><h2>4. Niche & Target Audience</h2><div class="pdf-card"><div><strong>Niche:</strong> ' + escapeHtml(report.nicheAndTargetAudience?.niche || '-') + '</div><div><strong>Sub-niche:</strong> ' + escapeHtml(report.nicheAndTargetAudience?.subNiche || '-') + '</div><div><strong>Target audience:</strong> ' + escapeHtml(report.nicheAndTargetAudience?.targetAudience || '-') + '</div></div></section>' +
            '<section class="pdf-section"><h2>5. Investment Breakdown</h2>' + renderInvestmentTable() + '</section>' +
            '<section class="pdf-section"><h2>6. Profit Calculation</h2><div class="pdf-card"><div><strong>Product cost:</strong> ' + escapeHtml(report.profitCalculation?.productCost || '-') + '</div><div><strong>Selling price:</strong> ' + escapeHtml(report.profitCalculation?.sellingPrice || '-') + '</div><div><strong>Ad budget:</strong> ' + escapeHtml(report.profitCalculation?.adBudget || '-') + '</div><div><strong>Profit per sale:</strong> ' + escapeHtml(report.profitCalculation?.profitPerSale || '-') + '</div><div><strong>Break-even:</strong> ' + escapeHtml(report.profitCalculation?.breakEvenEstimate || '-') + '</div><div><strong>Income after 3 months:</strong> ' + escapeHtml(report.profitCalculation?.estimatedMonthlyIncome3Months || '-') + '</div><div><strong>Income after 6 months:</strong> ' + escapeHtml(report.profitCalculation?.estimatedMonthlyIncome6Months || '-') + '</div></div></section>' +
            '<section class="pdf-section"><h2>7. Marketing Blueprint</h2><div class="pdf-card"><h3>Channels</h3>' + renderList(report.marketingBlueprint?.channels) + '<h3>Content Strategy</h3>' + renderList(report.marketingBlueprint?.contentStrategy) + '<h3>Budget Allocation</h3>' + renderList(report.marketingBlueprint?.budgetAllocation) + '</div></section>' +
            '<section class="pdf-section"><h2>8. Store Setup Plan</h2><div class="pdf-card"><h3>Platform Plan</h3>' + renderList(report.storeSetupPlan?.platformPlan) + '<h3>Steps</h3>' + renderList(report.storeSetupPlan?.steps) + '</div></section>' +
            '<section class="pdf-section"><h2>9. Growth Timeline</h2><div class="pdf-card"><h3>0-1 month</h3>' + renderList(report.growthTimeline?.phase0To1Month) + '<h3>1-3 months</h3>' + renderList(report.growthTimeline?.phase1To3Months) + '<h3>3-6 months</h3>' + renderList(report.growthTimeline?.phase3To6Months) + '</div></section>' +
            '<section class="pdf-section"><h2>10. Tools & Resources</h2>' + renderToolCards() + '</section>' +
            '<section class="pdf-section"><h2>11. Risk Analysis</h2>' + renderList(report.riskAnalysis) + '</section>' +
            '<section class="pdf-section"><h2>12. Final Strategy Recommendation</h2><p>' + escapeHtml(report.finalStrategyRecommendation || '-') + '</p></section>' +
            '</body></html>';

        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        window.setTimeout(() => popup.print(), 350);
    };

    return (
        <>
            <div className="row g-4">
                <div className="col-lg-7">
                    <form className="p-3 p-md-4 border rounded-4 bg-white ai-tool-panel" onSubmit={handleSubmit}>
                        <div className="ai-career-intro mb-4">
                            <div>
                                <h5 className="fw-semibold mb-2">Build your ecommerce launch profile</h5>
                                <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                                    Share your budget, product interests, resources, pricing, and strategy. The advisor will return the best platform,
                                    product ideas, profit plan, setup path, and growth strategy.
                                </p>
                            </div>
                            <div className="ai-career-intro-badge">
                                <Sparkles size={18} />
                                <span>AI ecommerce advisor</span>
                            </div>
                        </div>

                        <div className="ai-career-sections">
                            <section className="ai-career-section-card">
                                <h6>1. Basic Info</h6>
                                <div className="row g-3">
                                    <div className="col-md-4"><InputField label="Age" value={form.basicInfo.age} onChange={(e) => updateField("basicInfo", "age", e.target.value)} /></div>
                                    <div className="col-md-4"><InputField label="Country" value={form.basicInfo.country} onChange={(e) => updateField("basicInfo", "country", e.target.value)} /></div>
                                    <div className="col-md-4"><InputField label="City" value={form.basicInfo.city} onChange={(e) => updateField("basicInfo", "city", e.target.value)} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>2. Budget & Resources</h6>
                                <div className="row g-3">
                                    <div className="col-md-4"><SelectField label="Available Budget" value={form.budgetAndResources.availableBudget} onChange={(e) => updateField("budgetAndResources", "availableBudget", e.target.value)} options={BUDGET_OPTIONS} /></div>
                                    <div className="col-md-4"><SelectField label="Laptop / Internet" value={form.budgetAndResources.hasLaptopInternet} onChange={(e) => updateField("budgetAndResources", "hasLaptopInternet", e.target.value)} options={YES_NO_OPTIONS} /></div>
                                    <div className="col-md-4"><SelectField label="Investment Type" value={form.budgetAndResources.investmentType} onChange={(e) => updateField("budgetAndResources", "investmentType", e.target.value)} options={INVESTMENT_TYPE_OPTIONS} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>3. Skills & Experience</h6>
                                <div className="row g-3">
                                    <div className="col-md-5"><TextareaField label="Skills" value={form.skillsAndExperience.skills} onChange={(e) => updateField("skillsAndExperience", "skills", e.target.value)} placeholder="Marketing, design, product sourcing, none..." /></div>
                                    <div className="col-md-4"><SelectField label="Ecommerce Experience" value={form.skillsAndExperience.ecommerceExperience} onChange={(e) => updateField("skillsAndExperience", "ecommerceExperience", e.target.value)} options={ECOMMERCE_EXPERIENCE_OPTIONS} /></div>
                                    <div className="col-md-3"><SelectField label="Knowledge Level" value={form.skillsAndExperience.businessKnowledgeLevel} onChange={(e) => updateField("skillsAndExperience", "businessKnowledgeLevel", e.target.value)} options={KNOWLEDGE_LEVEL_OPTIONS} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>4. Interests</h6>
                                <div className="row g-3">
                                    <div className="col-md-5"><TextareaField label="Product Interests" value={form.interests.productInterests} onChange={(e) => updateField("interests", "productInterests", e.target.value)} placeholder="Fashion, handmade, tech, digital products..." /></div>
                                    <div className="col-md-4"><SelectField label="Work Preference" value={form.interests.workPreference} onChange={(e) => updateField("interests", "workPreference", e.target.value)} options={WORK_PREFERENCE_OPTIONS} /></div>
                                    <div className="col-md-3"><SelectField label="Product Type" value={form.interests.productTypePreference} onChange={(e) => updateField("interests", "productTypePreference", e.target.value)} options={PRODUCT_TYPE_OPTIONS} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>5. Time, Goals & Market</h6>
                                <div className="row g-3">
                                    <div className="col-md-3"><SelectField label="Daily Time" value={form.timeAvailability.dailyTime} onChange={(e) => updateField("timeAvailability", "dailyTime", e.target.value)} options={DAILY_TIME_OPTIONS} /></div>
                                    <div className="col-md-3"><SelectField label="Goal" value={form.goals.goal} onChange={(e) => updateField("goals", "goal", e.target.value)} options={GOAL_OPTIONS} /></div>
                                    <div className="col-md-3"><InputField label="Expected Monthly Income" value={form.goals.expectedMonthlyIncome} onChange={(e) => updateField("goals", "expectedMonthlyIncome", e.target.value)} placeholder="e.g. 150k PKR" /></div>
                                    <div className="col-md-3"><SelectField label="Sell Market" value={form.marketPreference.sellingMarket} onChange={(e) => updateField("marketPreference", "sellingMarket", e.target.value)} options={MARKET_OPTIONS} /></div>
                                    <div className="col-md-6"><SelectField label="Strategy Mode" value={form.goals.strategyMode} onChange={(e) => updateField("goals", "strategyMode", e.target.value)} options={STRATEGY_MODE_OPTIONS} /></div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>6. Financial Inputs</h6>
                                <div className="row g-3">
                                    <div className="col-md-4"><InputField label="Product Cost" value={form.financialInputs.productCost} onChange={(e) => updateField("financialInputs", "productCost", e.target.value)} placeholder="e.g. 1500" /></div>
                                    <div className="col-md-4"><InputField label="Expected Selling Price" value={form.financialInputs.expectedSellingPrice} onChange={(e) => updateField("financialInputs", "expectedSellingPrice", e.target.value)} placeholder="e.g. 3500" /></div>
                                    <div className="col-md-4"><InputField label="Ad Budget" value={form.financialInputs.adBudget} onChange={(e) => updateField("financialInputs", "adBudget", e.target.value)} placeholder="e.g. 20000" /></div>
                                </div>
                            </section>
                        </div>

                        {error ? <p className="text-danger mt-3 mb-0" style={{ fontSize: 13 }}>{error}</p> : null}

                        <div className="d-flex justify-content-end mt-4">
                            <button type="submit" style={primaryBtnStyle} disabled={loading}>
                                {loading ? "Generating report..." : "Generate Ecommerce Plan"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="col-lg-5">
                    <div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel ai-career-side-panel">
                        <h5 className="fw-semibold mb-3">What the advisor will return</h5>
                        <div className="ai-career-side-list">
                            <div className="ai-career-side-item"><Store size={18} /><div><strong>Best platform</strong><span>Shopify, Amazon, Etsy, or WordPress based on your profile and budget.</span></div></div>
                            <div className="ai-career-side-item"><ShoppingBag size={18} /><div><strong>Product ideas</strong><span>Winning product suggestions with demand, competition, and margin signals.</span></div></div>
                            <div className="ai-career-side-item"><WalletCards size={18} /><div><strong>Investment + profit</strong><span>Startup cost guidance, profit per sale, and break-even expectations.</span></div></div>
                            <div className="ai-career-side-item"><TrendingUp size={18} /><div><strong>Marketing blueprint</strong><span>Channels, content direction, and budget allocation for growth.</span></div></div>
                            <div className="ai-career-side-item"><Wrench size={18} /><div><strong>Setup + tools</strong><span>Platform setup steps, useful apps, and supplier/tool suggestions.</span></div></div>
                            <div className="ai-career-side-item"><ShieldAlert size={18} /><div><strong>Risk analysis</strong><span>Main ecommerce risks and how to reduce avoidable failure points.</span></div></div>
                        </div>
                        {loading ? (
                <div className="row g-4 mt-1">
                    <div className="col-12">
                        <AiAdvisorLoading
                            title="AI is generating your ecommerce plan"
                            subtitle="We are selecting the right platform, product ideas, profit path, and setup strategy for your profile."
                            steps={[
                                "Analyzing your ecommerce inputs",
                                "Matching platform and product ideas",
                                "Preparing profit and marketing blueprint",
                                "Finalizing your report",
                            ]}
                        />
                    </div>
                </div>
            ) : null}

            {report ? (
                            <div className="ai-career-side-result mt-4">
                                <div className="ai-career-side-result-label">Primary platform</div>
                                <p className="mb-1 fw-semibold">{report.bestEcommercePlatform?.platform || "-"}</p>
                                {report.bestEcommercePlatform?.reason ? <p className="mb-0">{report.bestEcommercePlatform.reason}</p> : null}
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
                                    <h4 className="fw-semibold mb-1">Ecommerce Advisor Report</h4>
                                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>Personalized output generated from your ecommerce profile.</p>
                                </div>
                                <button type="button" className="ai-career-download-btn" onClick={handleDownloadPdf}><Download size={16} /><span>Download PDF</span></button>
                            </div>

                            <div className="ai-career-report-stack">
                                <section className="ai-career-report-section"><h6>1. Best Ecommerce Platform</h6><article className="ai-ecommerce-feature-card"><strong className="ai-ecommerce-pill">{report.bestEcommercePlatform?.platform || "-"}</strong>{report.bestEcommercePlatform?.reason ? <p>{report.bestEcommercePlatform.reason}</p> : null}{report.bestEcommercePlatform?.alternatives?.length ? <div className="ai-career-mini-list"><strong>Alternatives</strong><span>{report.bestEcommercePlatform.alternatives.join(", ")}</span></div> : null}</article></section>
                                <section className="ai-career-report-section"><h6>2. Recommended Business Model</h6><article className="ai-ecommerce-feature-card"><strong className="ai-ecommerce-pill alt">{report.recommendedBusinessModel?.primaryModel || "-"}</strong>{report.recommendedBusinessModel?.reason ? <p>{report.recommendedBusinessModel.reason}</p> : null}</article></section>
                                <section className="ai-career-report-section"><h6>3. Winning Product Ideas</h6><div className="row g-3">{report.winningProductIdeas.map((item, index) => <div key={`${item.productName}-${index}`} className="col-md-6 col-xl-4"><article className="ai-career-path-card"><h6>{item.productName}</h6><div className="ai-career-mini-list"><strong>Demand</strong><span>{item.demandLevel || "-"}</span><strong>Competition</strong><span>{item.competitionLevel || "-"}</span><strong>Margin</strong><span>{item.estimatedProfitMargin || "-"}</span><strong>Supplier</strong><span>{item.supplierSuggestion || "-"}</span></div>{item.reason ? <p>{item.reason}</p> : null}</article></div>)}</div></section>
                                <section className="ai-career-report-section"><h6>4. Niche & Target Audience</h6><div className="row g-3"><div className="col-md-4"><article className="ai-career-inline-card"><strong>Niche</strong><p className="mb-0">{report.nicheAndTargetAudience?.niche || "-"}</p></article></div><div className="col-md-4"><article className="ai-career-inline-card"><strong>Sub-niche</strong><p className="mb-0">{report.nicheAndTargetAudience?.subNiche || "-"}</p></article></div><div className="col-md-4"><article className="ai-career-inline-card"><strong>Target Audience</strong><p className="mb-0">{report.nicheAndTargetAudience?.targetAudience || "-"}</p></article></div></div></section>
                                <section className="ai-career-report-section"><h6>5. Investment Breakdown</h6><div className="ai-ecommerce-table-wrap"><table className="ai-ecommerce-table"><thead><tr><th>Item</th><th>Cost</th><th>Notes</th></tr></thead><tbody>{report.investmentBreakdown.length ? report.investmentBreakdown.map((item, index) => <tr key={`${item.item}-${index}`}><td>{item.item}</td><td>{item.cost || "-"}</td><td>{item.notes || "-"}</td></tr>) : <tr><td colSpan={3}>No breakdown available.</td></tr>}</tbody></table></div></section>
                                <section className="ai-career-report-section"><h6>6. Profit Calculation</h6><div className="ai-ecommerce-metric-grid"><div className="ai-career-salary-card"><span>Product Cost</span><strong>{report.profitCalculation?.productCost || "-"}</strong></div><div className="ai-career-salary-card"><span>Selling Price</span><strong>{report.profitCalculation?.sellingPrice || "-"}</strong></div><div className="ai-career-salary-card"><span>Ad Budget</span><strong>{report.profitCalculation?.adBudget || "-"}</strong></div><div className="ai-career-salary-card"><span>Profit per Sale</span><strong>{report.profitCalculation?.profitPerSale || "-"}</strong></div><div className="ai-career-salary-card"><span>Break-even</span><strong>{report.profitCalculation?.breakEvenEstimate || "-"}</strong></div><div className="ai-career-salary-card"><span>3-Month Income</span><strong>{report.profitCalculation?.estimatedMonthlyIncome3Months || "-"}</strong></div><div className="ai-career-salary-card"><span>6-Month Income</span><strong>{report.profitCalculation?.estimatedMonthlyIncome6Months || "-"}</strong></div></div></section>
                                <section className="ai-career-report-section"><h6>7. Marketing Blueprint</h6><div className="row g-3"><div className="col-md-4"><article className="ai-career-roadmap-card"><strong>Channels</strong><ul className="ai-career-bullet-list compact">{report.marketingBlueprint?.channels.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div><div className="col-md-4"><article className="ai-career-roadmap-card"><strong>Content Strategy</strong><ul className="ai-career-bullet-list compact">{report.marketingBlueprint?.contentStrategy.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div><div className="col-md-4"><article className="ai-career-roadmap-card"><strong>Budget Allocation</strong><ul className="ai-career-bullet-list compact">{report.marketingBlueprint?.budgetAllocation.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div></div></section>
                                <section className="ai-career-report-section"><h6>8. Store Setup Plan</h6><div className="row g-3"><div className="col-md-6"><article className="ai-career-roadmap-card"><strong>Platform Plan</strong><ul className="ai-career-bullet-list compact">{report.storeSetupPlan?.platformPlan.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div><div className="col-md-6"><article className="ai-career-roadmap-card"><strong>Step-by-Step Setup</strong><ul className="ai-career-bullet-list compact">{report.storeSetupPlan?.steps.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div></div></section>
                                <section className="ai-career-report-section"><h6>9. Growth Timeline</h6><div className="row g-3"><div className="col-md-4"><article className="ai-career-roadmap-card"><strong>0-1 month</strong><ul className="ai-career-bullet-list compact">{report.growthTimeline?.phase0To1Month.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div><div className="col-md-4"><article className="ai-career-roadmap-card"><strong>1-3 months</strong><ul className="ai-career-bullet-list compact">{report.growthTimeline?.phase1To3Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div><div className="col-md-4"><article className="ai-career-roadmap-card"><strong>3-6 months</strong><ul className="ai-career-bullet-list compact">{report.growthTimeline?.phase3To6Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></article></div></div></section>
                                <section className="ai-career-report-section"><h6>10. Tools & Resources</h6><div className="row g-3">{report.toolsAndResources.map((item, index) => <div key={`${item.name}-${index}`} className="col-md-6"><article className="ai-career-inline-card"><strong>{item.name}</strong><div className="ai-career-meta-line">{item.category || "General"}</div>{item.reason ? <p className="mb-0">{item.reason}</p> : null}</article></div>)}</div></section>
                                <section className="ai-career-report-section"><h6>11. Risk Analysis</h6><ul className="ai-career-bullet-list">{report.riskAnalysis.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>
                                <section className="ai-career-report-section"><h6>12. Final Strategy Recommendation</h6><p className="mb-0">{report.finalStrategyRecommendation}</p></section>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default AiEcommerceAdvisorTool;



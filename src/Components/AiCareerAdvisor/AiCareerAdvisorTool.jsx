import React, { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, CircleDollarSign, Compass, Download, Laptop2, Sparkles, Target } from "lucide-react";
import { generateCareerAdvisorReport } from "../../Services/aiChat";
import { downloadSimplePdf } from "../../utils/pdfDownload";
import AiAdvisorLoading from "../AiAdvisorLoading/AiAdvisorLoading";
import "./AiCareerAdvisorTool.css";

const EDUCATION_LEVELS = ["Matric", "Intermediate", "Bachelor", "Master", "PhD"];
const EDUCATION_STATUS = ["Studying", "Completed", "Dropout"];
const EMPLOYMENT_STATUS = ["Student", "Job", "Unemployed", "Freelancer"];
const WORK_STYLES = ["Office", "Remote", "Freelance", "Business"];
const WORK_TYPES = ["Technical", "Creative", "Management"];
const PERSONALITY_TYPES = ["Introvert", "Extrovert", "Analytical", "Creative"];
const YES_NO_OPTIONS = ["Yes", "No"];

const INITIAL_FORM = {
    basicInformation: {
        fullName: "",
        fatherName: "",
        email: "",
        phoneNumber: "",
        age: "",
        gender: "",
        city: "",
        country: "",
    },
    educationDetails: {
        highestEducationLevel: "",
        schoolName: "",
        collegeName: "",
        universityName: "",
        degreeTitle: "",
        fieldOfStudy: "",
        currentStatus: "",
        gpaOrPercentage: "",
    },
    certificationsAndSkills: {
        certifications: "",
        technicalSkills: "",
        softSkills: "",
        languagesKnown: "",
    },
    careerJobInfo: {
        currentEmploymentStatus: "",
        currentJobTitle: "",
        companyName: "",
        industry: "",
        experienceYears: "",
        currentSalary: "",
        previousJobs: "",
    },
    interestsAndPreferences: {
        interestAreas: "",
        workStyle: "",
        preferredWorkType: "",
        personalityType: "",
    },
    goalsAndExpectations: {
        shortTermGoal: "",
        longTermGoal: "",
        expectedSalary: "",
        dreamJobOrCareer: "",
        willingToStudyFurther: "",
        budgetForEducation: "",
    },
    growthConstraints: {
        availableTimeForStudy: "",
        financialConstraints: "",
        familyResponsibilities: "",
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

function AiCareerAdvisorTool({ primaryBtnStyle }) {
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
        educationDetails: form.educationDetails,
        certificationsAndSkills: {
            certifications: splitList(form.certificationsAndSkills.certifications),
            technicalSkills: splitList(form.certificationsAndSkills.technicalSkills),
            softSkills: splitList(form.certificationsAndSkills.softSkills),
            languagesKnown: splitList(form.certificationsAndSkills.languagesKnown),
        },
        careerJobInfo: {
            ...form.careerJobInfo,
            previousJobs: splitList(form.careerJobInfo.previousJobs),
        },
        interestsAndPreferences: {
            ...form.interestsAndPreferences,
            interestAreas: splitList(form.interestsAndPreferences.interestAreas),
        },
        goalsAndExpectations: form.goalsAndExpectations,
        growthConstraints: form.growthConstraints,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await generateCareerAdvisorReport({
                profile: buildPayload(),
            });
            setResult(response);
        } catch (submitError) {
            setError(
                String(
                    submitError?.response?.data?.message ||
                        submitError?.message ||
                        "Failed to generate career advisor report"
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
            "Career Advisor Report";

        const sections = [
            { heading: "1. Career Summary", lines: [report.careerSummary || "-"] },
            {
                heading: "2. Best Career Paths",
                lines: (report.bestCareerPaths || []).flatMap((item) => [
                    item.title + (item.explanation ? ": " + item.explanation : ""),
                    item.platforms?.length ? "- Platforms: " + item.platforms.join(", ") : "",
                    item.tools?.length ? "- Tools: " + item.tools.join(", ") : "",
                    item.estimatedTimeToFirstIncome ? "- Time to first income: " + item.estimatedTimeToFirstIncome : "",
                ].filter(Boolean)),
            },
            { heading: "3. Why These Careers Fit You", lines: report.whyTheseCareersFitYou || ["-"] },
            { heading: "4. Skill Gap Analysis", lines: report.skillGapAnalysis || ["-"] },
            {
                heading: "5. Recommended Skills to Learn",
                lines: (report.recommendedSkillsToLearn || []).map((item) => item.skill + (item.reason ? ": " + item.reason : "")),
            },
            {
                heading: "6. Recommended Courses / Degrees",
                lines: (report.recommendedCoursesOrDegrees || []).map((item) => {
                    const meta = [item.provider, item.type].filter(Boolean).join(" | ");
                    return item.name + (meta ? " (" + meta + ")" : "") + (item.reason ? ": " + item.reason : "");
                }),
            },
            { heading: "7. Career Roadmap: 0-3 months", lines: report.careerRoadmap?.phase0To3Months || ["-"] },
            { heading: "7. Career Roadmap: 3-6 months", lines: report.careerRoadmap?.phase3To6Months || ["-"] },
            { heading: "7. Career Roadmap: 6-12 months", lines: report.careerRoadmap?.phase6To12Months || ["-"] },
            { heading: "8. Income Growth Plan", lines: report.incomeGrowthPlan || ["-"] },
            {
                heading: "9. Salary Estimate",
                lines: [
                    "Current: " + (report.salaryEstimate?.current || "-"),
                    "Projected: " + (report.salaryEstimate?.projected || "-"),
                    "Timeline: " + (report.salaryEstimate?.timeline || "-"),
                ],
            },
            {
                heading: "10. Alternative Career Options",
                lines: (report.alternativeCareerOptions || []).map((item) => item.title + (item.reason ? ": " + item.reason : "")),
            },
            { heading: "11. Final Advice", lines: [report.finalAdvice || "-"] },
        ];

        downloadSimplePdf({
            fileName: candidateName + "-career-advisor-report",
            title: "HDPiks Career Advisor",
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
                                <h5 className="fw-semibold mb-2">Build your career profile</h5>
                                <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                                    Fill in your background, goals, skills, and constraints. The advisor will return
                                    targeted career paths, income strategy, and a practical roadmap.
                                </p>
                            </div>
                            <div className="ai-career-intro-badge">
                                <Sparkles size={18} />
                                <span>AI advisor</span>
                            </div>
                        </div>

                        <div className="ai-career-sections">
                            <section className="ai-career-section-card">
                                <h6>1. Basic Information</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Full Name</label>
                                        <input className="form-control" value={form.basicInformation.fullName} onChange={(e) => updateField("basicInformation", "fullName", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Father Name (optional)</label>
                                        <input className="form-control" value={form.basicInformation.fatherName} onChange={(e) => updateField("basicInformation", "fatherName", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input className="form-control" value={form.basicInformation.email} onChange={(e) => updateField("basicInformation", "email", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Phone Number</label>
                                        <input className="form-control" value={form.basicInformation.phoneNumber} onChange={(e) => updateField("basicInformation", "phoneNumber", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Age</label>
                                        <input className="form-control" value={form.basicInformation.age} onChange={(e) => updateField("basicInformation", "age", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Gender</label>
                                        <input className="form-control" value={form.basicInformation.gender} onChange={(e) => updateField("basicInformation", "gender", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">City</label>
                                        <input className="form-control" value={form.basicInformation.city} onChange={(e) => updateField("basicInformation", "city", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Country</label>
                                        <input className="form-control" value={form.basicInformation.country} onChange={(e) => updateField("basicInformation", "country", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>2. Education Details</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Highest Education Level</label>
                                        <select className="form-select" value={form.educationDetails.highestEducationLevel} onChange={(e) => updateField("educationDetails", "highestEducationLevel", e.target.value)}>
                                            <option value="">Select</option>
                                            {EDUCATION_LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Current Status</label>
                                        <select className="form-select" value={form.educationDetails.currentStatus} onChange={(e) => updateField("educationDetails", "currentStatus", e.target.value)}>
                                            <option value="">Select</option>
                                            {EDUCATION_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">School Name</label>
                                        <input className="form-control" value={form.educationDetails.schoolName} onChange={(e) => updateField("educationDetails", "schoolName", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">College Name</label>
                                        <input className="form-control" value={form.educationDetails.collegeName} onChange={(e) => updateField("educationDetails", "collegeName", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">University Name</label>
                                        <input className="form-control" value={form.educationDetails.universityName} onChange={(e) => updateField("educationDetails", "universityName", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Degree Title</label>
                                        <input className="form-control" value={form.educationDetails.degreeTitle} onChange={(e) => updateField("educationDetails", "degreeTitle", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Field of Study</label>
                                        <input className="form-control" value={form.educationDetails.fieldOfStudy} onChange={(e) => updateField("educationDetails", "fieldOfStudy", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">GPA / Percentage (optional)</label>
                                        <input className="form-control" value={form.educationDetails.gpaOrPercentage} onChange={(e) => updateField("educationDetails", "gpaOrPercentage", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>3. Certifications & Skills</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Certifications</label>
                                        <textarea className="form-control" rows={3} placeholder="Comma separated" value={form.certificationsAndSkills.certifications} onChange={(e) => updateField("certificationsAndSkills", "certifications", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Technical Skills</label>
                                        <textarea className="form-control" rows={3} placeholder="React, Excel, Python" value={form.certificationsAndSkills.technicalSkills} onChange={(e) => updateField("certificationsAndSkills", "technicalSkills", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Soft Skills</label>
                                        <textarea className="form-control" rows={3} placeholder="Communication, Leadership" value={form.certificationsAndSkills.softSkills} onChange={(e) => updateField("certificationsAndSkills", "softSkills", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Languages Known</label>
                                        <textarea className="form-control" rows={3} placeholder="English, Urdu" value={form.certificationsAndSkills.languagesKnown} onChange={(e) => updateField("certificationsAndSkills", "languagesKnown", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>4. Career / Job Info</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Current Employment Status</label>
                                        <select className="form-select" value={form.careerJobInfo.currentEmploymentStatus} onChange={(e) => updateField("careerJobInfo", "currentEmploymentStatus", e.target.value)}>
                                            <option value="">Select</option>
                                            {EMPLOYMENT_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Current Job Title</label>
                                        <input className="form-control" value={form.careerJobInfo.currentJobTitle} onChange={(e) => updateField("careerJobInfo", "currentJobTitle", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Company Name</label>
                                        <input className="form-control" value={form.careerJobInfo.companyName} onChange={(e) => updateField("careerJobInfo", "companyName", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Industry</label>
                                        <input className="form-control" value={form.careerJobInfo.industry} onChange={(e) => updateField("careerJobInfo", "industry", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Experience (Years)</label>
                                        <input className="form-control" value={form.careerJobInfo.experienceYears} onChange={(e) => updateField("careerJobInfo", "experienceYears", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Current Salary</label>
                                        <input className="form-control" value={form.careerJobInfo.currentSalary} onChange={(e) => updateField("careerJobInfo", "currentSalary", e.target.value)} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Previous Jobs (optional)</label>
                                        <textarea className="form-control" rows={3} placeholder="Comma separated" value={form.careerJobInfo.previousJobs} onChange={(e) => updateField("careerJobInfo", "previousJobs", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>5. Interests & Preferences</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Interest Areas</label>
                                        <textarea className="form-control" rows={3} placeholder="IT, Business, Design, Medical" value={form.interestsAndPreferences.interestAreas} onChange={(e) => updateField("interestsAndPreferences", "interestAreas", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Work Style</label>
                                        <select className="form-select" value={form.interestsAndPreferences.workStyle} onChange={(e) => updateField("interestsAndPreferences", "workStyle", e.target.value)}>
                                            <option value="">Select</option>
                                            {WORK_STYLES.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Preferred Work Type</label>
                                        <select className="form-select" value={form.interestsAndPreferences.preferredWorkType} onChange={(e) => updateField("interestsAndPreferences", "preferredWorkType", e.target.value)}>
                                            <option value="">Select</option>
                                            {WORK_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Personality Type (optional)</label>
                                        <select className="form-select" value={form.interestsAndPreferences.personalityType} onChange={(e) => updateField("interestsAndPreferences", "personalityType", e.target.value)}>
                                            <option value="">Select</option>
                                            {PERSONALITY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>6. Goals & Expectations</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Short-term Goal (1-2 years)</label>
                                        <textarea className="form-control" rows={3} value={form.goalsAndExpectations.shortTermGoal} onChange={(e) => updateField("goalsAndExpectations", "shortTermGoal", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Long-term Goal (5-10 years)</label>
                                        <textarea className="form-control" rows={3} value={form.goalsAndExpectations.longTermGoal} onChange={(e) => updateField("goalsAndExpectations", "longTermGoal", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Expected Salary</label>
                                        <input className="form-control" value={form.goalsAndExpectations.expectedSalary} onChange={(e) => updateField("goalsAndExpectations", "expectedSalary", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Dream Job / Career</label>
                                        <input className="form-control" value={form.goalsAndExpectations.dreamJobOrCareer} onChange={(e) => updateField("goalsAndExpectations", "dreamJobOrCareer", e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Willing to Study Further?</label>
                                        <select className="form-select" value={form.goalsAndExpectations.willingToStudyFurther} onChange={(e) => updateField("goalsAndExpectations", "willingToStudyFurther", e.target.value)}>
                                            <option value="">Select</option>
                                            {YES_NO_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Budget for Education</label>
                                        <input className="form-control" value={form.goalsAndExpectations.budgetForEducation} onChange={(e) => updateField("goalsAndExpectations", "budgetForEducation", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            <section className="ai-career-section-card">
                                <h6>7. Growth Constraints</h6>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Available Time for Study</label>
                                        <input className="form-control" placeholder="Daily / weekly hours" value={form.growthConstraints.availableTimeForStudy} onChange={(e) => updateField("growthConstraints", "availableTimeForStudy", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Financial Constraints</label>
                                        <input className="form-control" value={form.growthConstraints.financialConstraints} onChange={(e) => updateField("growthConstraints", "financialConstraints", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Family Responsibilities</label>
                                        <input className="form-control" value={form.growthConstraints.familyResponsibilities} onChange={(e) => updateField("growthConstraints", "familyResponsibilities", e.target.value)} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {error ? (
                            <p className="text-danger mt-3 mb-0" style={{ fontSize: 13 }}>
                                {error}
                            </p>
                        ) : null}

                        <div className="d-flex justify-content-end mt-4">
                            <button type="submit" style={primaryBtnStyle} disabled={loading}>
                                {loading ? "Generating report..." : "Generate Career Advice"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="col-lg-5">
                    <div className="p-3 p-md-4 border rounded-4 bg-white h-100 ai-tool-panel ai-career-side-panel">
                        <h5 className="fw-semibold mb-3">What the advisor will return</h5>
                        <div className="ai-career-side-list">
                            <div className="ai-career-side-item">
                                <Target size={18} />
                                <div>
                                    <strong>Top career paths</strong>
                                    <span>3-5 realistic options based on your current profile.</span>
                                </div>
                            </div>
                            <div className="ai-career-side-item">
                                <Compass size={18} />
                                <div>
                                    <strong>Roadmap</strong>
                                    <span>0-3 months, 3-6 months, and 6-12 months execution plan.</span>
                                </div>
                            </div>
                            <div className="ai-career-side-item">
                                <BriefcaseBusiness size={18} />
                                <div>
                                    <strong>Platforms and tools</strong>
                                    <span>Fiverr, Upwork, LinkedIn, plus practical software stack suggestions.</span>
                                </div>
                            </div>
                            <div className="ai-career-side-item">
                                <CircleDollarSign size={18} />
                                <div>
                                    <strong>Income growth plan</strong>
                                    <span>Expected earning path, salary progression, and time to first income.</span>
                                </div>
                            </div>
                            <div className="ai-career-side-item">
                                <Laptop2 size={18} />
                                <div>
                                    <strong>Skill-gap review</strong>
                                    <span>Missing skills, affordable learning route, and market-relevant priorities.</span>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                <div className="row g-4 mt-1">
                    <div className="col-12">
                        <AiAdvisorLoading
                            title="AI is preparing your career report"
                            subtitle="We are reviewing your profile, matching realistic roles, and building your roadmap."
                            steps={[
                                "Analyzing your background",
                                "Matching suitable career paths",
                                "Preparing skills and salary insights",
                                "Finalizing your report",
                            ]}
                        />
                    </div>
                </div>
            ) : null}

            {report ? (
                            <div className="ai-career-side-result mt-4">
                                <div className="ai-career-side-result-label">Latest summary</div>
                                <p className="mb-0">{report.careerSummary}</p>
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
                                    <h4 className="fw-semibold mb-1">Career Advisor Report</h4>
                                    <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                                        Personalized output generated from your profile.
                                    </p>
                                </div>
                                <button type="button" className="ai-career-download-btn" onClick={handleDownloadPdf}>
                                    <Download size={16} />
                                    <span>Download PDF</span>
                                </button>
                            </div>

                            <div className="ai-career-report-stack">
                                <section className="ai-career-report-section">
                                    <h6>1. Career Summary</h6>
                                    <p className="mb-0">{report.careerSummary}</p>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>2. Best Career Paths</h6>
                                    <div className="row g-3">
                                        {report.bestCareerPaths.map((item, index) => (
                                            <div key={`${item.title}-${index}`} className="col-md-6 col-xl-4">
                                                <article className="ai-career-path-card">
                                                    <h6>{item.title}</h6>
                                                    {item.explanation ? <p>{item.explanation}</p> : null}
                                                    {item.platforms.length ? (
                                                        <div className="ai-career-chip-row">
                                                            {item.platforms.map((platform) => (
                                                                <span key={platform} className="ai-career-chip">{platform}</span>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                    {item.tools.length ? (
                                                        <div className="ai-career-mini-list">
                                                            <strong>Tools</strong>
                                                            <span>{item.tools.join(", ")}</span>
                                                        </div>
                                                    ) : null}
                                                    {item.estimatedTimeToFirstIncome ? (
                                                        <div className="ai-career-mini-list">
                                                            <strong>Time to first income</strong>
                                                            <span>{item.estimatedTimeToFirstIncome}</span>
                                                        </div>
                                                    ) : null}
                                                </article>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>3. Why These Careers Fit You</h6>
                                    <ul className="ai-career-bullet-list">
                                        {report.whyTheseCareersFitYou.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                    </ul>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>4. Skill Gap Analysis</h6>
                                    <ul className="ai-career-bullet-list">
                                        {report.skillGapAnalysis.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                    </ul>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>5. Recommended Skills to Learn</h6>
                                    <div className="row g-3">
                                        {report.recommendedSkillsToLearn.map((item, index) => (
                                            <div key={`${item.skill}-${index}`} className="col-md-6">
                                                <article className="ai-career-inline-card">
                                                    <strong>{item.skill}</strong>
                                                    {item.reason ? <p className="mb-0">{item.reason}</p> : null}
                                                </article>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>6. Recommended Courses / Degrees</h6>
                                    <div className="row g-3">
                                        {report.recommendedCoursesOrDegrees.map((item, index) => (
                                            <div key={`${item.name}-${index}`} className="col-md-6">
                                                <article className="ai-career-inline-card">
                                                    <strong>{item.name}</strong>
                                                    <div className="ai-career-meta-line">
                                                        {[item.provider, item.type].filter(Boolean).join(" | ")}
                                                    </div>
                                                    {item.reason ? <p className="mb-0">{item.reason}</p> : null}
                                                </article>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>7. Career Roadmap</h6>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <article className="ai-career-roadmap-card">
                                                <strong>0-3 months</strong>
                                                <ul className="ai-career-bullet-list compact">
                                                    {report.careerRoadmap.phase0To3Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                                </ul>
                                            </article>
                                        </div>
                                        <div className="col-md-4">
                                            <article className="ai-career-roadmap-card">
                                                <strong>3-6 months</strong>
                                                <ul className="ai-career-bullet-list compact">
                                                    {report.careerRoadmap.phase3To6Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                                </ul>
                                            </article>
                                        </div>
                                        <div className="col-md-4">
                                            <article className="ai-career-roadmap-card">
                                                <strong>6-12 months</strong>
                                                <ul className="ai-career-bullet-list compact">
                                                    {report.careerRoadmap.phase6To12Months.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                                </ul>
                                            </article>
                                        </div>
                                    </div>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>8. Income Growth Plan</h6>
                                    <ul className="ai-career-bullet-list">
                                        {report.incomeGrowthPlan.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                                    </ul>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>9. Salary Estimate</h6>
                                    <div className="ai-career-salary-grid">
                                        <div className="ai-career-salary-card">
                                            <span>Current</span>
                                            <strong>{report.salaryEstimate.current || "-"}</strong>
                                        </div>
                                        <div className="ai-career-salary-card">
                                            <span>Projected</span>
                                            <strong>{report.salaryEstimate.projected || "-"}</strong>
                                        </div>
                                        <div className="ai-career-salary-card">
                                            <span>Timeline</span>
                                            <strong>{report.salaryEstimate.timeline || "-"}</strong>
                                        </div>
                                    </div>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>10. Alternative Career Options</h6>
                                    <div className="row g-3">
                                        {report.alternativeCareerOptions.map((item, index) => (
                                            <div key={`${item.title}-${index}`} className="col-md-6">
                                                <article className="ai-career-inline-card">
                                                    <strong>{item.title}</strong>
                                                    {item.reason ? <p className="mb-0">{item.reason}</p> : null}
                                                </article>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="ai-career-report-section">
                                    <h6>11. Final Advice</h6>
                                    <p className="mb-0">{report.finalAdvice}</p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}

export default AiCareerAdvisorTool;



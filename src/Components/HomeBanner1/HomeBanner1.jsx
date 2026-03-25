import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, GraduationCap, ShoppingCart } from 'lucide-react';
import './HomeBanner1.css';

function HomeBanner1() {
    const navigate = useNavigate();

    const tools = [
        {
            id: 'ai-career-advisor',
            title: 'AI Career Advisor',
            description: 'Get role guidance, learning paths, and personalized growth suggestions powered by AI.',
            action: 'Open Tool',
            route: '/ai/ai-advisor',
            icon: GraduationCap,
        },
        {
            id: 'business-with-ai',
            title: 'Business with AI',
            description: 'Generate business-ready visuals and content ideas to speed up campaigns and branding.',
            action: 'Start Now',
            route: '/ai/ai-business',
            icon: BriefcaseBusiness,
        },
        {
            id: 'ecommerce',
            title: 'AI Ecommerce advisor',
            description: 'Create and refine product-ready assets for storefronts, ads, and online product listings.',
            action: 'Launch',
            route: '/ai/ai-commerce',
            icon: ShoppingCart,
        },
    ];

    return (
        <div className="container py-4 mt-4 home-banner1-section">
            <div className="mb-4 text-center text-md-start">
                <h3 className="fw-bold display-5 mb-1">Exclusive Tools</h3>
                <p className="fw-semibold text-muted mb-0">
                    Power up your workflow with focused AI tools for creators and teams.
                </p>
            </div>

            <div className="row g-3">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <div key={tool.id} className="col-12 col-md-6 col-lg-4 d-flex">
                            <article className="exclusive-tools-card w-100">
                                <div className="exclusive-tools-icon">
                                    <Icon size={22} />
                                </div>
                                <h4>{tool.title}</h4>
                                <p>{tool.description}</p>
                                <button
                                    type="button"
                                    className="exclusive-tools-action"
                                    onClick={() => {
                                        navigate(tool.route);
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    {tool.action}
                                    <ArrowRight size={16} />
                                </button>
                            </article>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default HomeBanner1;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Clapperboard, GraduationCap, ShoppingCart, Sparkles } from 'lucide-react';
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
        {
            id: 'video-editor',
            title: 'Video Editor',
            description: 'Trim, split, merge, and export short-form videos inside your Elvify workspace.',
            action: 'Edit Video',
            route: '/video-editor',
            icon: Clapperboard,
        },
    ];

    return (
        <div className="container py-4 mt-4 home-banner1-section">
            <div className="home-banner1-pdf-strip">
                <div className="home-banner1-pdf-strip__content">
                    <h3 className="home-banner1-pdf-strip__title">PDF Tools</h3>
                    <p className="home-banner1-pdf-strip__desc">
                        Edit, merge, compress, and convert files in your Elvify workspace.
                    </p>
                    <button
                        type="button"
                        className="home-banner1-pdf-strip__btn"
                        onClick={() => {
                            navigate('/pdf-tools');
                            window.scrollTo(0, 0);
                        }}
                    >
                        Open Tool
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <section className="exclusive-tools-showcase">
                <div className="exclusive-tools-showcase__glow exclusive-tools-showcase__glow--left" aria-hidden="true" />
                <div className="exclusive-tools-showcase__glow exclusive-tools-showcase__glow--right" aria-hidden="true" />
                <div className="exclusive-tools-showcase__dots exclusive-tools-showcase__dots--top" aria-hidden="true" />
                <div className="exclusive-tools-showcase__dots exclusive-tools-showcase__dots--bottom" aria-hidden="true" />

                <div className="exclusive-tools-showcase__header text-center">
                    <div className="exclusive-tools-showcase__eyebrow">
                        <Sparkles size={14} />
                        <span>Built for creators. Designed for results.</span>
                    </div>
                    <h3 className="home-section-heading exclusive-tools-showcase__title mb-1">Exclusive Tools</h3>
                    <p className="home-section-subtitle exclusive-tools-showcase__subtitle mb-0">
                        Power up your workflow with focused AI tools for creators and teams.
                    </p>
                </div>

                <div className="row g-4 justify-content-center">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <div key={tool.id} className="col-12 col-md-6 col-lg-3 d-flex">
                                <article className="exclusive-tools-card w-100">
                                    <span className="exclusive-tools-card__sparkle" aria-hidden="true">
                                        <Sparkles size={18} />
                                    </span>
                                    <div className="exclusive-tools-icon">
                                        <Icon size={26} />
                                    </div>
                                    <h4>{tool.title}</h4>
                                    <span className="exclusive-tools-card__accent" aria-hidden="true" />
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
            </section>
        </div>
    );
}

export default HomeBanner1;

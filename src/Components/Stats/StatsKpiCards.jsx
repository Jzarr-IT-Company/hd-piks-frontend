import React from "react";

function StatsKpiCards({ stats }) {
    const cards = [
        { label: "Earnings", value: stats.earnings, sub: "Current month" },
        { label: "Downloads", value: stats.downloads, sub: "All assets" },
        { label: "Likes", value: stats.likes, sub: "All assets" },
        { label: "Files", value: stats.files, sub: "Published + pending" },
    ];

    return (
        <section className="dash-cards">
            <div className="dash-cards__header">
                <h4 className="dash-cards__title">Performance overview</h4>
            </div>
            {cards.map((card) => (
                <div className="dash-card" key={card.label}>
                    <div className="dash-card__label">{card.label}</div>
                    <div className="dash-card__value">{card.value}</div>
                    <div className="dash-card__sub">{card.sub}</div>
                </div>
            ))}
        </section>
    );
}

export default StatsKpiCards;


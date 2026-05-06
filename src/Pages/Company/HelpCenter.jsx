import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopNavOnly from "../../Components/AppNavbar/TopNavOnly";
import AppFooter from "../../Components/AppFooter/AppFooter";
import { HELP_FAQS, HELP_FILTERS, HELP_TOPICS } from "./helpCenterData";
import "./HelpCenter.css";

const normalize = (value = "") => String(value || "").toLowerCase().trim();

const includesQuery = (topic, query) => {
  const blob = `${topic.title} ${topic.summary} ${topic.category} ${topic.badge}`;
  return normalize(blob).includes(normalize(query));
};

const includesFaqQuery = (faq, query) => {
  const blob = `${faq.question} ${faq.answer} ${faq.category}`;
  return normalize(blob).includes(normalize(query));
};

function HelpCenter() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);

  const filteredTopics = useMemo(() => {
    return HELP_TOPICS.filter((topic) => {
      const filterMatch =
        activeFilter === "All" ||
        topic.category === activeFilter ||
        topic.title === activeFilter;
      const queryMatch = includesQuery(topic, query);
      return filterMatch && queryMatch;
    });
  }, [activeFilter, query]);

  const filteredFaqs = useMemo(() => {
    return HELP_FAQS.filter((faq) => {
      const filterMatch = activeFilter === "All" || faq.category === activeFilter;
      const queryMatch = includesFaqQuery(faq, query);
      return filterMatch && queryMatch;
    });
  }, [activeFilter, query]);

  const visibleFaqs = useMemo(() => {
    if (query.trim() || activeFilter !== "All") return filteredFaqs;
    return filteredFaqs.slice(0, 8);
  }, [activeFilter, filteredFaqs, query]);

  const featuredTopics = filteredTopics.slice(0, 3);

  return (
    <>
      <TopNavOnly />
      <main className="help-center-page top-nav-content">
        <div className="container py-4 py-md-5">
          <section className="help-hero">
            <p className="help-hero__label">Support - Guides - FAQs</p>
            <h1 className="help-hero__title">Find answers fast.</h1>
            <p className="help-hero__subtitle">
              Get help with downloads, licensing, subscriptions, payments, refunds, and account
              access on Elvify.
            </p>

            <div className="help-hero__controls">
              <label className="help-search" htmlFor="help-center-search">
                <i className="fas fa-search" aria-hidden="true" />
                <input
                  id="help-center-search"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search help articles... e.g., download, license, cancel, refund"
                />
              </label>

              <div className="help-filters" role="tablist" aria-label="Help filters">
                {HELP_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`help-filter-btn${activeFilter === filter ? " is-active" : ""}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="help-featured-grid">
              {featuredTopics.map((topic) => (
                topic.href ? (
                  <Link
                    key={topic.id}
                    to={topic.href}
                    className="help-topic-link"
                    aria-label={`Open ${topic.title}`}
                  >
                    <article className="help-topic-card help-topic-card--featured">
                      <header className="help-topic-card__header">
                        <h2>{topic.title}</h2>
                      </header>
                      <p>{topic.summary}</p>
                    </article>
                  </Link>
                ) : (
                  <article key={topic.id} className="help-topic-card help-topic-card--featured">
                    <header className="help-topic-card__header">
                      <h2>{topic.title}</h2>
                    </header>
                    <p>{topic.summary}</p>
                  </article>
                )
              ))}
            </div>
          </section>

          <section className="help-section">
            <div className="help-section__head">
              <h2>Popular Topics</h2>
              <span>Browse categories</span>
            </div>

            <div className="help-topic-grid">
              {filteredTopics.map((topic) => (
                topic.href ? (
                  <Link
                    key={topic.id}
                    to={topic.href}
                    className="help-topic-link"
                    aria-label={`Open ${topic.title}`}
                  >
                    <article className="help-topic-card">
                      <header className="help-topic-card__header">
                        <h3>{topic.title}</h3>
                        <span>{topic.badge}</span>
                      </header>
                      <p>{topic.summary}</p>
                    </article>
                  </Link>
                ) : (
                  <article key={topic.id} className="help-topic-card">
                    <header className="help-topic-card__header">
                      <h3>{topic.title}</h3>
                      <span>{topic.badge}</span>
                    </header>
                    <p>{topic.summary}</p>
                  </article>
                )
              ))}
            </div>

            {!filteredTopics.length ? (
              <div className="help-empty-state">No matching topics found for your search.</div>
            ) : null}
          </section>

          <section className="help-section">
            <div className="help-section__head">
              <h2>Popular Questions</h2>
              <span>Click to expand</span>
            </div>

            <div className="help-faq-list">
              {visibleFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <article key={faq.id} className={`help-faq-item${isOpen ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="help-faq-item__button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    >
                      <span className="help-faq-item__question">{faq.question}</span>
                      <span className="help-faq-item__meta">
                        <span className="help-faq-item__tag">{faq.category}</span>
                        <span className="help-faq-item__toggle">{isOpen ? "-" : "+"}</span>
                      </span>
                    </button>
                    {isOpen ? <p className="help-faq-item__answer">{faq.answer}</p> : null}
                  </article>
                );
              })}
            </div>

            {!visibleFaqs.length ? (
              <div className="help-empty-state">No matching questions found for your search.</div>
            ) : null}
          </section>

          <section className="help-support-cta">
            <div>
              <h2>Still need help?</h2>
              <p>Contact our support team and we will respond as soon as possible.</p>
            </div>
            <div className="help-support-cta__actions">
              <Link to="/company/contact-us" className="help-btn help-btn--secondary">
                Contact Support
              </Link>
              <Link to="/pricing" className="help-btn">
                View Pricing
              </Link>
            </div>
          </section>
        </div>
      </main>
      <AppFooter />
    </>
  );
}

export default HelpCenter;


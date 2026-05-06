import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useParams } from "react-router-dom";
import TopNavOnly from "../../Components/AppNavbar/TopNavOnly";
import AppFooter from "../../Components/AppFooter/AppFooter";
import {
  HELP_CENTER_TOPICS,
  buildFaqSchemaForTopic,
  findHelpCenterTopicBySlug,
} from "./helpCenterTopics";
import "./HelpCenter.css";
import "./HelpCenterTopic.css";

function HelpCenterTopic() {
  const { topicSlug } = useParams();
  const [openFaqId, setOpenFaqId] = useState(null);

  const topic = useMemo(
    () => findHelpCenterTopicBySlug(topicSlug),
    [topicSlug]
  );

  const schema = useMemo(
    () => (topic ? buildFaqSchemaForTopic(topic) : null),
    [topic]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setOpenFaqId(null);
  }, [topicSlug]);

  if (!topic) {
    return <Navigate to="/company/help-center" replace />;
  }

  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/company/help-center/${topic.slug}`
      : `/company/help-center/${topic.slug}`;

  return (
    <>
      <Helmet>
        <title>{topic.title} | Elvify Help Center</title>
        <meta name="description" content={topic.summary} />
        <link rel="canonical" href={pageUrl} />
        {schema ? (
          <script type="application/ld+json">{JSON.stringify(schema)}</script>
        ) : null}
      </Helmet>

      <TopNavOnly />
      <main className="help-center-page help-topic-page top-nav-content">
        <div className="container py-4 py-md-5">
          <section className="help-hero">
            <p className="help-hero__label">Help Center - Downloads</p>
            <h1 className="help-hero__title">{topic.cardTitle}</h1>
            <p className="help-hero__subtitle">{topic.summary}</p>
            <div className="help-topic-page__crumbs">
              <Link to="/company/help-center">Help Center</Link>
              <span>/</span>
              <strong>{topic.cardTitle}</strong>
            </div>
          </section>

          <div className="help-topic-page__layout">
            <section className="help-section help-topic-page__content">
              <div className="help-section__head">
                <h2>{topic.title}</h2>
                <span>{topic.faqs.length} questions</span>
              </div>

              <div className="help-faq-list">
                {topic.faqs.map((faq, index) => {
                  const faqId = `${topic.slug}-${index + 1}`;
                  const isOpen = openFaqId === faqId;

                  return (
                    <article key={faqId} className={`help-faq-item${isOpen ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="help-faq-item__button"
                        onClick={() => setOpenFaqId(isOpen ? null : faqId)}
                      >
                        <span className="help-faq-item__question">{faq.question}</span>
                        <span className="help-faq-item__meta">
                          <span className="help-faq-item__tag">{topic.badge}</span>
                          <span className="help-faq-item__toggle">{isOpen ? "-" : "+"}</span>
                        </span>
                      </button>
                      {isOpen ? <p className="help-faq-item__answer">{faq.answer}</p> : null}
                    </article>
                  );
                })}
              </div>
            </section>

            <aside className="help-section help-topic-page__sidebar">
              <div className="help-section__head">
                <h2>Help FAQ Pages</h2>
              </div>
              <nav className="help-topic-page__topic-list" aria-label="Help center FAQ pages">
                {HELP_CENTER_TOPICS.map((item) => {
                  const isActive = item.slug === topic.slug;
                  return (
                    <Link
                      key={item.slug}
                      to={`/company/help-center/${item.slug}`}
                      className={`help-topic-page__topic-link${isActive ? " is-active" : ""}`}
                    >
                      <span>{item.cardTitle}</span>
                      <small>{item.badge}</small>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}

export default HelpCenterTopic;

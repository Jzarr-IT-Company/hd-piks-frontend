import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import TopNavOnly from "../../Components/AppNavbar/TopNavOnly";
import AppFooter from "../../Components/AppFooter/AppFooter";
import { LEGAL_DOCUMENTS, findLegalDocumentBySlug } from "./legalDocuments";
import "./Legal.css";

const cleanSectionHeading = (heading = "") =>
  String(heading || "")
    .trim()
    .replace(/^\d+(?:\.\d+)*\s*[.)-]?\s*/, "");

const toAnchorId = (docSlug, sectionHeading, index) =>
  `${docSlug}-${index + 1}-${cleanSectionHeading(sectionHeading)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

function Legal() {
  const navigate = useNavigate();
  const { docSlug } = useParams();

  const activeDoc = useMemo(() => {
    if (!docSlug) return LEGAL_DOCUMENTS[0];
    return findLegalDocumentBySlug(docSlug) || null;
  }, [docSlug]);

  useEffect(() => {
    if (docSlug && !activeDoc) {
      navigate("/company/legal", { replace: true });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [docSlug, activeDoc, navigate]);

  const doc = activeDoc || LEGAL_DOCUMENTS[0];
  const sectionAnchorIds = useMemo(
    () =>
      doc.sections.map((section, index) =>
        toAnchorId(doc.slug, section.heading, index)
      ),
    [doc]
  );
  const [activeSectionId, setActiveSectionId] = useState(
    sectionAnchorIds[0] || ""
  );

  useEffect(() => {
    setActiveSectionId(sectionAnchorIds[0] || "");
  }, [sectionAnchorIds]);

  useEffect(() => {
    if (!sectionAnchorIds.length) return undefined;

    const sectionElements = sectionAnchorIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!sectionElements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visibleEntries.length) return;
        setActiveSectionId(String(visibleEntries[0].target.id || ""));
      },
      {
        root: null,
        rootMargin: "-22% 0px -62% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    sectionElements.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sectionAnchorIds]);

  return (
    <>
      <TopNavOnly />
      <main className="legal-page top-nav-content">
        <div className="container py-4 py-md-5">
          <div className="legal-page__mobile-select">
            <label className="form-label mb-2 fw-semibold">Legal document</label>
            <select
              value={doc.slug}
              onChange={(event) =>
                navigate(`/company/legal/${event.target.value}`)
              }
            >
              {LEGAL_DOCUMENTS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="legal-page__layout">
            <aside className="legal-page__sidebar">
              <section className="legal-page__side-group">
                <div className="legal-page__side-title">Legal</div>
                <nav className="legal-page__doc-list" aria-label="Legal documents">
                  {LEGAL_DOCUMENTS.map((item) => {
                    const isActive = item.slug === doc.slug;
                    return (
                      <Link
                        key={item.slug}
                        to={`/company/legal/${item.slug}`}
                        className={`legal-page__doc-link${isActive ? " is-active" : ""}`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </nav>
              </section>

              <section className="legal-page__side-group legal-page__side-group--nested">
                <div className="legal-page__side-title mb-2">On this page</div>
                <nav className="legal-page__toc" aria-label="Document sections">
                  {doc.sections.map((section, index) => {
                    const sectionId = toAnchorId(doc.slug, section.heading, index);
                    const isActive = sectionId === activeSectionId;
                    return (
                      <a
                        key={`${doc.slug}-toc-${index}`}
                        className={`legal-page__toc-link${isActive ? " is-active" : ""}`}
                        href={`#${sectionId}`}
                        aria-current={isActive ? "location" : undefined}
                      >
                        {cleanSectionHeading(section.heading)}
                      </a>
                    );
                  })}
                </nav>
              </section>
            </aside>

            <article className="legal-page__content">
              <header className="legal-page__heading">
                <h1>{doc.title}</h1>
                <div className="legal-page__meta">
                  Effective date: {doc.effectiveDate}
                </div>
              </header>

              <p className="legal-page__intro">{doc.intro}</p>

              {doc.sections.map((section, index) => (
                <section
                  key={`${doc.slug}-section-${index}`}
                  className="legal-page__section"
                  id={toAnchorId(doc.slug, section.heading, index)}
                >
                  <h2>
                    {cleanSectionHeading(section.heading)}
                  </h2>
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${doc.slug}-${index}-p-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}

export default Legal;

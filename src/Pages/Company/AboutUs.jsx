import React, { useEffect, useMemo } from 'react';
import TopNavOnly from '../../Components/AppNavbar/TopNavOnly';
import AppFooter from '../../Components/AppFooter/AppFooter';
import { ABOUT_US_DOCUMENT } from './aboutUsDocument';
import './AboutUs.css';

const cleanHeading = (value = '') => String(value || '').trim().replace(/:+$/, '');

const toAnchorId = (heading, index) =>
  `about-us-${index + 1}-${cleanHeading(heading)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;

const isLikelyHeading = (line) => {
  const text = String(line || '').trim();
  if (!text) return false;
  if (text.length > 95) return false;
  if (/^(?:[-*]|\u2022)/.test(text)) return false;
  if (text.endsWith(':')) return true;
  if (/[.!?]$/.test(text)) return false;

  const words = text
    .replace(/[^\w\s&/\-]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 2 || words.length > 10) return false;

  const titledWords = words.filter((word) => /^[A-Z]/.test(word)).length;
  return titledWords / words.length >= 0.5;
};

const buildSectionsFromParagraphs = (paragraphs) => {
  const lines = Array.isArray(paragraphs) ? paragraphs.map((item) => String(item || '').trim()).filter(Boolean) : [];
  if (!lines.length) return [];

  const sections = [];
  let current = { heading: 'Overview', paragraphs: [] };

  lines.forEach((line) => {
    if (isLikelyHeading(line)) {
      const nextHeading = cleanHeading(line);
      if (!nextHeading) return;

      if (current.heading !== 'Overview' && current.paragraphs.length === 0) {
        current.heading = nextHeading;
        return;
      }

      if (current.heading !== 'Overview' || current.paragraphs.length > 0) {
        sections.push(current);
      }
      current = { heading: nextHeading, paragraphs: [] };
      return;
    }

    current.paragraphs.push(line);
  });

  if (current.heading !== 'Overview' || current.paragraphs.length > 0) {
    sections.push(current);
  }

  return sections.filter((section) => section.paragraphs.length > 0);
};

function AboutUs() {
  const title = ABOUT_US_DOCUMENT?.title || 'About Us';
  const effectiveDate = ABOUT_US_DOCUMENT?.effectiveDate || '';
  const paragraphs = Array.isArray(ABOUT_US_DOCUMENT?.paragraphs) ? ABOUT_US_DOCUMENT.paragraphs : [];

  const sections = useMemo(() => buildSectionsFromParagraphs(paragraphs), [paragraphs]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <>
      <TopNavOnly />
      <main className="about-us-page top-nav-content">
        <div className="container py-4 py-md-5">
          <div className="about-us-page__mobile-select">
            <label className="form-label mb-2 fw-semibold">Jump to section</label>
            <select
              defaultValue=""
              onChange={(event) => {
                const anchorId = event.target.value;
                if (!anchorId) return;
                const element = document.getElementById(anchorId);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <option value="" disabled>
                Select section
              </option>
              {sections.map((section, index) => (
                <option key={`about-us-select-${index}`} value={toAnchorId(section.heading, index)}>
                  {section.heading}
                </option>
              ))}
            </select>
          </div>

          <div className="about-us-page__layout">
            <aside className="about-us-page__sidebar">
              <div className="about-us-page__side-title">About Us</div>
              <nav className="about-us-page__section-list" aria-label="About page sections">
                {sections.map((section, index) => (
                  <a
                    key={`about-us-link-${index}`}
                    className="about-us-page__section-link"
                    href={`#${toAnchorId(section.heading, index)}`}
                  >
                    {section.heading}
                  </a>
                ))}
              </nav>
            </aside>

            <article className="about-us-page__content">
              <header className="about-us-page__heading">
                <h1>{title}</h1>
                {effectiveDate ? (
                  <div className="about-us-page__meta">Effective date: {effectiveDate}</div>
                ) : null}
              </header>

              {sections.length ? (
                sections.map((section, index) => (
                  <section
                    key={`about-us-section-${index}`}
                    id={toAnchorId(section.heading, index)}
                    className="about-us-page__section"
                  >
                    <h2>{section.heading}</h2>
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={`about-us-p-${index}-${paragraphIndex}`}>{paragraph}</p>
                    ))}
                  </section>
                ))
              ) : (
                <p className="text-muted mb-0">About content is not available right now.</p>
              )}
            </article>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}

export default AboutUs;


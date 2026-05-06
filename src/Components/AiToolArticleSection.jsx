import React, { useMemo, useState } from 'react';
import './AiToolArticleSection.css';

const PREVIEW_PARAGRAPH_COUNT = 3;

function AiToolArticleSection({ article }) {
  const [expanded, setExpanded] = useState(false);

  const previewParagraphs = useMemo(
    () => (Array.isArray(article?.paragraphs) ? article.paragraphs.slice(0, PREVIEW_PARAGRAPH_COUNT) : []),
    [article]
  );

  if (!article) return null;

  const paragraphs = expanded ? article.paragraphs : previewParagraphs;

  return (
    <section className="articles-section ai-tool-articles mt-4 mt-md-5">
      <div className="articles-card ai-tool-articles__card">
        <div className="articles-header">
          <h2 className="articles-title">Elvify Articles</h2>
        </div>

        <article className="article-item ai-tool-article-item">
          <div className="article-image-wrap ai-tool-article-image-wrap">
            <img src={article.image} alt={article.title} className="article-image" />
          </div>

          <div className="article-body ai-tool-article-body">
            <h3 className="article-heading">{article.title}</h3>

            <div className={`article-content ${expanded ? 'article-content--expanded' : 'article-content--preview'} ai-tool-article-content`}>
              {paragraphs.map((paragraph, index) => (
                <p key={`${article.title}-${index}`}>{paragraph}</p>
              ))}
            </div>

            <button
              type="button"
              className="article-toggle"
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AiToolArticleSection;


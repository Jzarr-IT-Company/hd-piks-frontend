import React, { useMemo, useState } from 'react';
import './Testmonials.css';
import ultimateGuideImg from '../../assets/ultimateGuid.jpeg';
import bestPlatformImg from '../../assets/bestPlatform.jpeg';
import { ULTIMATE_GUIDE_LINES, BEST_PLATFORMS_LINES } from '../articlesContent';

const normalizeLines = (lines) => {
  const normalized = [];
  lines.forEach((line) => {
    if (line === '?' && normalized.length) {
      normalized[normalized.length - 1] = `${normalized[normalized.length - 1]}?`;
      return;
    }
    normalized.push(line);
  });
  return normalized;
};

const BULLET = '\u2022';
const MISENCODED_BULLET = '\u00e2\u0080\u00a2';

const buildBlocks = (lines = []) => {
  const blocks = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length) {
      blocks.push({ type: 'ul', items: currentList });
      currentList = [];
    }
  };

  lines.forEach((line) => {
    const sanitizedLine = line.replace(new RegExp(MISENCODED_BULLET, 'g'), BULLET);
    if (sanitizedLine.includes(BULLET)) {
      const items = sanitizedLine.split(BULLET).map((item) => item.trim()).filter(Boolean);
      if (items.length) {
        currentList.push(...items);
      }
      return;
    }
    flushList();
    blocks.push({ type: 'p', text: sanitizedLine });
  });

  flushList();
  return blocks;
};

const getPreviewBlocks = (blocks, limit = 2) => {
  const preview = [];
  blocks.some((block) => {
    if (preview.length >= limit) {
      return true;
    }
    if (block.type === 'ul') {
      preview.push({ ...block, items: block.items.slice(0, 3) });
    } else {
      preview.push(block);
    }
    return preview.length >= limit;
  });
  return preview;
};

function ArticlesSection() {
  const [expanded, setExpanded] = useState({ ultimate: false, best: false });

  const articles = useMemo(() => {
    const ultimateLines = normalizeLines(ULTIMATE_GUIDE_LINES);
    const bestLines = normalizeLines(BEST_PLATFORMS_LINES);
    return [
      {
        id: 'ultimate',
        title: ultimateLines[0] || 'The Ultimate Guide',
        image: ultimateGuideImg,
        blocks: buildBlocks(ultimateLines.slice(1)),
      },
      {
        id: 'best',
        title: bestLines[0] || 'Best Platforms',
        image: bestPlatformImg,
        blocks: buildBlocks(bestLines.slice(1)),
      },
    ];
  }, []);

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="articles-section py-5">
      <div className="container">
        <div className="articles-card">
          <div className="articles-header">
            <h2 className="articles-title">HDPiks Articles</h2>
          </div>

          <div className="articles-grid">
            {articles.map((article) => {
              const isOpen = expanded[article.id];
              const blocks = isOpen ? article.blocks : getPreviewBlocks(article.blocks, 4);
              return (
                <article key={article.id} className="article-item">
                  <div className="article-image-wrap">
                    <img src={article.image} alt={article.title} className="article-image" />
                  </div>
                  <div className="article-body">
                    <h3 className="article-heading">{article.title}</h3>
                    <div className={`article-content ${isOpen ? 'article-content--expanded' : 'article-content--preview'}`}>
                      {blocks.map((block, idx) => {
                        if (block.type === 'ul') {
                          return (
                            <ul key={`${article.id}-list-${idx}`} className="article-list">
                              {block.items.map((item, itemIdx) => (
                                <li key={`${article.id}-item-${idx}-${itemIdx}`}>{item}</li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={`${article.id}-para-${idx}`}>{block.text}</p>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className="article-toggle"
                      onClick={() => toggle(article.id)}
                    >
                      {isOpen ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArticlesSection;

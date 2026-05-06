import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomeFaqBeforeDownload.css';

const FAQS = [
  {
    tag: 'Images',
    question: 'How can I download images from Elvify?',
    answer:
      'Create an account, sign in, open the image page you want, and use the download button to save it.',
  },
  {
    tag: 'Free',
    question: 'How can I download free images?',
    answer:
      'Log in to your account, open the image page, and click the Free Download button when the asset is available for free.',
  },
  {
    tag: 'Account',
    question: 'Do I need an account to download images from Elvify?',
    answer: 'Yes. Users need an Elvify account before they can download assets from the platform.',
  },
  {
    tag: 'Video',
    question: 'Can I download videos on mobile devices?',
    answer: 'Yes. Elvify supports video downloads on mobile phones, tablets, and desktop devices.',
  },
  {
    tag: 'Pricing',
    question: 'Are all images on Elvify free?',
    answer:
      'No. Elvify offers both free and premium images. Premium assets require purchase or an active plan.',
  },
  {
    tag: 'Quality',
    question: 'Are Elvify videos high quality?',
    answer: 'Yes. Elvify provides high-quality videos suitable for digital, content, and marketing projects.',
  },
];

export default function HomeFaqBeforeDownload() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="home-faq py-4 py-md-5">
      <div className="container">
        <div className="home-faq__card">
          <div className="home-faq__header">
            <div className="home-faq__header-text">
              <span className="home-faq__kicker">Quick Answers</span>
              <h2 className="home-faq__title">FAQs Before You Download</h2>
              <p className="home-faq__desc">
                Get the most common Elvify download, account, and video questions answered in one place.
              </p>
            </div>
            <Link to="/company/help-center" className="home-faq__help-btn">
              Help Center
            </Link>
          </div>

          <div className="home-faq__grid">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              const answerId = `home-faq-answer-${index}`;
              return (
                <div key={faq.question} className={`home-faq__item ${isOpen ? 'home-faq__item--open' : ''}`}>
                  <div className="home-faq__item-head">
                    <span className="home-faq__tag">{faq.tag.toUpperCase()}</span>
                    <button
                      type="button"
                      className={`home-faq__toggle ${isOpen ? 'home-faq__toggle--open' : ''}`}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => toggle(index)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="home-faq__question"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    {faq.question}
                  </button>
                  {isOpen && (
                    <p id={answerId} className="home-faq__answer">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

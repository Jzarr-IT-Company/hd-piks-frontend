import { HELP_CENTER_TOPICS } from "./helpCenterTopics";

const STATIC_TOPICS = [
  {
    id: "contributors",
    title: "Contributors",
    category: "Contact Support",
    badge: "Upload",
    summary: "Upload flow, moderation status, creator guidelines, and contributor-side support.",
  },
  {
    id: "support",
    title: "Contact Support",
    category: "Contact Support",
    badge: "Help",
    summary: "Get direct help from the Elvify support team for unresolved account or billing issues.",
    href: "/company/contact-us",
  },
];

const CONTENT_TOPICS = HELP_CENTER_TOPICS.map((topic) => ({
  id: topic.slug,
  title: topic.cardTitle,
  category: topic.category,
  badge: topic.badge,
  summary: topic.summary,
  href: `/company/help-center/${topic.slug}`,
}));

const CONTENT_FAQS = HELP_CENTER_TOPICS.flatMap((topic) =>
  topic.faqs.map((faq, index) => ({
    id: `${topic.slug}-${index + 1}`,
    category: topic.category,
    question: faq.question,
    answer: faq.answer,
    topicSlug: topic.slug,
  }))
);

export const HELP_FILTERS = [
  "All",
  "Downloads",
  "License",
  "Pricing",
  "Payments",
  "Refunds",
  "Contact Support",
];

export const HELP_TOPICS = [...CONTENT_TOPICS, ...STATIC_TOPICS];

export const HELP_FAQS = [...CONTENT_FAQS];

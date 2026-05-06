import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

const META_TAG_REGEX = /<meta\b[^>]*>/gi;

const getAttributeValue = (tag, attributeName) => {
  const regex = new RegExp(`${attributeName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(regex);
  return match ? match[2] || match[3] || match[4] || "" : "";
};

const parseMetaTagsHtml = (html) => {
  const raw = normalizeText(html);
  if (!raw) return [];

  const matches = raw.match(META_TAG_REGEX) || [];
  return matches
    .map((tag, index) => {
      const name = getAttributeValue(tag, "name");
      const property = getAttributeValue(tag, "property");
      const httpEquiv = getAttributeValue(tag, "http-equiv");
      const charSet = getAttributeValue(tag, "charset");
      const content = getAttributeValue(tag, "content");

      if (!name && !property && !httpEquiv && !charSet) return null;

      return {
        key: `meta-${index}-${name || property || httpEquiv || charSet}`,
        name: name || undefined,
        property: property || undefined,
        httpEquiv: httpEquiv || undefined,
        charSet: charSet || undefined,
        content: content || undefined,
      };
    })
    .filter(Boolean);
};

const extractMetaKeys = (metaTags) => {
  const keys = new Set();
  metaTags.forEach((tag) => {
    if (tag.name) keys.add(`name:${tag.name.toLowerCase()}`);
    if (tag.property) keys.add(`property:${tag.property.toLowerCase()}`);
    if (tag.httpEquiv) keys.add(`httpEquiv:${tag.httpEquiv.toLowerCase()}`);
    if (tag.charSet) keys.add("charset");
  });
  return keys;
};

const parseSchemaScriptHtml = (html) => {
  const raw = normalizeText(html);
  if (!raw) return [];

  const regex = /<script\b[^>]*type\s*=\s*("application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts = [];
  let match;

  while ((match = regex.exec(raw)) !== null) {
    const jsonText = normalizeText(match[2]);
    if (!jsonText) continue;
    scripts.push(jsonText);
  }

  return scripts;
};

function SeoHead({
  title,
  description,
  canonicalUrl,
  metaTagsHtml = "",
  schemaScriptHtml = "",
}) {
  const parsedMetaTags = useMemo(() => parseMetaTagsHtml(metaTagsHtml), [metaTagsHtml]);
  const parsedSchemaScripts = useMemo(() => parseSchemaScriptHtml(schemaScriptHtml), [schemaScriptHtml]);
  const metaKeys = useMemo(() => extractMetaKeys(parsedMetaTags), [parsedMetaTags]);

  return (
    <Helmet>
      {title ? <title>{title}</title> : null}
      {description && !metaKeys.has("name:description") ? (
        <meta name="description" content={description} />
      ) : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      {parsedMetaTags.map((tag) => (
        <meta
          key={tag.key}
          {...(tag.name ? { name: tag.name } : {})}
          {...(tag.property ? { property: tag.property } : {})}
          {...(tag.httpEquiv ? { httpEquiv: tag.httpEquiv } : {})}
          {...(tag.charSet ? { charSet: tag.charSet } : {})}
          {...(tag.content ? { content: tag.content } : {})}
        />
      ))}
      {parsedSchemaScripts.map((scriptContent, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {scriptContent}
        </script>
      ))}
    </Helmet>
  );
}

export default SeoHead;

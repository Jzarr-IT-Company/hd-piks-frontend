import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBlogBySlug, fetchPublicBlogs } from '../Services/blog';
import { Box, Typography, CircularProgress, Chip, Stack } from '@mui/material';
import { Helmet } from 'react-helmet-async';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchBlogBySlug(slug)
      .then(data => {
        setBlog(data);
        setLoading(false);
        // Fetch related blogs after main blog is loaded
        if (data && data.categories && data.categories.length > 0) {
          fetchPublicBlogs().then(allBlogs => {
            // Find blogs with at least one matching category, exclude current blog
            const related = (allBlogs || []).filter(b =>
              b._id !== data._id &&
              b.categories && b.categories.some(cat => data.categories.some(c => c._id === cat._id))
            );
            setRelatedBlogs(related.slice(0, 5)); // Limit to 5
          });
        } else {
          setRelatedBlogs([]);
        }
      })
      .catch(() => {
        setError('Blog not found');
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;
  if (!blog) return null;

  // Prefer SEO fields if present, fallback to title/description
  const seoTitle = blog.seoTitle || blog.title || '';
  const metaDescription = blog.metaDescription || (blog.description ? blog.description.replace(/<[^>]+>/g, '').slice(0, 160) : '');
  const canonicalUrl = blog.canonicalUrl || window.location.href;
  const featureImage = blog.featureImage || (blog.media && blog.media.length > 0 ? blog.media[0].url : undefined);
  const ogType = 'article';
  const ogUrl = canonicalUrl;
  const twitterCard = 'summary_large_image';
  const schemaCode = blog.schemaCode ? (typeof blog.schemaCode === 'string' ? blog.schemaCode : JSON.stringify(blog.schemaCode)) : null;

  return (
    <>
      <Helmet>
        <title>{seoTitle} | HDpiks</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={metaDescription} />
        {featureImage && <meta property="og:image" content={featureImage} />}
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={ogUrl} />
        <link rel="canonical" href={canonicalUrl} />
        {/* Twitter Card tags */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {featureImage && <meta name="twitter:image" content={featureImage} />}
        {/* JSON-LD schema.org structured data */}
        {schemaCode && (
          <script type="application/ld+json">{schemaCode}</script>
        )}
      </Helmet>
      {/* Banner Feature Image */}
      {featureImage && (
        <Box
          sx={{
            width: '100%',
            aspectRatio: { xs: '16/9', sm: '21/9' },
            maxWidth: 1200,
            mx: 'auto',
            mb: { xs: 2, md: 4 },
            position: 'relative',
            borderRadius: { xs: 0, md: 3 },
            overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            background: '#f7f7f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={featureImage}
            alt={blog.title}
            style={{
              width: '100%',
              height: 'auto',
              minHeight: 180,
              maxHeight: 420,
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              borderRadius: 'inherit',
              transition: 'all 0.3s',
            }}
          />
        </Box>
      )}
      <Box sx={{
        maxWidth: 1200,
        mx: 'auto',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        alignItems: 'flex-start',
        p: { xs: 2, md: 4 }
      }}>
        {/* Main Content */}
        <Box sx={{ flex: 2, background: '#fff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', p: { xs: 2, md: 4 } }}>
          <Typography variant="h2" sx={{ fontWeight: 800, textAlign: 'left', mb: 1.5, fontSize: { xs: 28, md: 38 } }} gutterBottom>
            {blog.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'left', mb: 2, fontStyle: 'italic', fontSize: 16 }}>
            By {blog.author?.name || 'Admin'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ''}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {blog.status}
            </Typography>
            {blog.tags && blog.tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {blog.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
              </Stack>
            )}
          </Box>
          <Box sx={{ my: 4, fontSize: 18, color: '#222', lineHeight: 1.8 }}>
            <div style={{ wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: blog.description }} />
          </Box>

          {/* Media Gallery Section */}
          {blog.media && blog.media.length > 0 && (
            <Box sx={{ my: 5 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'left' }}>Media Gallery</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: '1fr 1fr 1fr',
                    lg: '1fr 1fr 1fr 1fr'
                  },
                  gap: 3
                }}
              >
                {blog.media.filter(m => m.type === 'image').map((media, idx) => (
                  <Box key={idx} sx={{ textAlign: 'center', mb: 2 }}>
                    <img
                      src={media.url}
                      alt={media.alt || `media-${idx}`}
                      style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 220, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    />
                    {media.caption && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{media.caption}</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
        {/* Sidebar: Categories & Related Blogs */}
        <Box sx={{ flex: 1, minWidth: 260, background: '#fafbfc', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', p: 3, mt: { xs: 4, md: 0 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Related Categories</Typography>
          {blog.categories && blog.categories.length > 0 ? (
            <Stack spacing={1} sx={{ mb: 4 }}>
              {blog.categories.map(cat => (
                <Box key={cat._id || cat.name}>
                  <Typography
                    variant="body1"
                    component="a"
                    href={cat.slug ? `/blog/category/${cat.slug}` : undefined}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: 16,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {cat.name}
                  </Typography>
                  {/* Subcategories if present */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <Stack spacing={0.5} sx={{ ml: 2, mt: 0.5 }}>
                      {cat.subcategories.map(sub => (
                        <Typography
                          key={sub._id || sub.name}
                          variant="body2"
                          component="a"
                          href={sub.slug ? `/blog/category/${sub.slug}` : undefined}
                          sx={{
                            color: 'secondary.main',
                            fontWeight: 500,
                            fontSize: 14,
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {sub.name}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>No categories</Typography>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Related Blogs</Typography>
          {relatedBlogs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No related blogs found.</Typography>
          ) : (
            <Stack spacing={2}>
              {relatedBlogs.map(rel => (
                <Box
                  key={rel._id}
                  sx={{
                    background: '#fff',
                    borderRadius: 2,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }
                  }}
                  onClick={() => window.location.href = `/blog/${rel.slug}`}
                >
                  {rel.featureImage && (
                    <img
                      src={rel.featureImage}
                      alt={rel.title}
                      style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, marginRight: 10 }}
                    />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: 'primary.main', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {rel.title}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
}

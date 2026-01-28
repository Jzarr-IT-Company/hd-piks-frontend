import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublicBlogs } from '../Services/blog';
import { Card, CardMedia, CardContent, Typography, Button, Grid, Box, CircularProgress, TextField, InputAdornment, IconButton, Chip, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Helmet } from 'react-helmet-async';

function getExcerpt(html, lines = 3) {
  // Remove HTML tags and get first N lines
  const text = html.replace(/<[^>]+>/g, '').split('\n').join(' ');
  const words = text.split(' ');
  return words.slice(0, 30).join(' ') + (words.length > 30 ? '...' : '');
}

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicBlogs()
      .then(data => {
        setBlogs(data || []);
        setFilteredBlogs(data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredBlogs(blogs);
    } else {
      const keyword = search.toLowerCase();
      setFilteredBlogs(
        blogs.filter(blog =>
          blog.title.toLowerCase().includes(keyword) ||
          (blog.description && blog.description.toLowerCase().includes(keyword)) ||
          (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(keyword))) ||
          (blog.categories && blog.categories.some(cat => cat.name?.toLowerCase().includes(keyword)))
        )
      );
    }
  }, [search, blogs]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  // Use the latest blog for dynamic meta tags if available
  const latestBlog = blogs && blogs.length > 0 ? blogs[0] : null;
  const seoTitle = latestBlog ? `${latestBlog.seoTitle || latestBlog.title} | HDpiks` : 'Latest Blogs | HDpiks';
  const metaDescription = latestBlog ? (latestBlog.metaDescription || (latestBlog.description ? latestBlog.description.replace(/<[^>]+>/g, '').slice(0, 160) : '')) : 'Browse the latest blogs on HDpiks. Discover insights, trends, and stories in technology, design, and more.';
  const featureImage = latestBlog ? (latestBlog.featureImage || (latestBlog.media && latestBlog.media.length > 0 ? latestBlog.media[0].url : undefined)) : undefined;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={metaDescription} />
        {featureImage && <meta property="og:image" content={featureImage} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
        <Typography variant="h3" sx={{ mb: 4, fontWeight: 800, textAlign: 'center', fontSize: { xs: 28, md: 36 } }}>Latest Blogs</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by keyword, category, or tag..."
            variant="outlined"
            sx={{ width: { xs: '100%', sm: 400 }, background: '#fff', borderRadius: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Grid container spacing={4}>
          {filteredBlogs.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 6 }}>
                No blogs found for your search.
              </Typography>
            </Grid>
          ) : (
            filteredBlogs.map(blog => (
              <Grid item xs={12} sm={6} md={4} key={blog._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 3 }}>
                  {blog.featureImage && (
                    <CardMedia
                      component="img"
                      image={blog.featureImage}
                      alt={blog.title}
                      sx={{ height: 200, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{blog.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {getExcerpt(blog.description)}
                    </Typography>
                    {blog.tags && blog.tags.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                        {blog.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
                      </Stack>
                    )}
                    {/* {blog.categories && blog.categories.length > 0 && (
                      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                        {blog.categories.map(cat => <Chip key={cat._id || cat.name} label={cat.name} size="small" color="primary" />)}
                      </Stack>
                    )} */}
                    <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/blog/${blog.slug}`)}>
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </>
  );
};

export default BlogsList;

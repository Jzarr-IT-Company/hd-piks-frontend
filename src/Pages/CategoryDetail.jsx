import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPublicBlogs } from '../Services/blog';
import { Box, Typography, Card, CardMedia, CardContent, Button, Grid, CircularProgress, Chip, Stack, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function CategoryDetail() {
  const { slug } = useParams();

  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');


  useEffect(() => {
    setLoading(true);
    fetchPublicBlogs().then(allBlogs => {
      // Filter blogs where any category or subcategory matches the slug
      const filtered = (allBlogs || []).filter(blog =>
        blog.categories && blog.categories.some(cat =>
          cat.slug === slug ||
          (cat.subcategories && cat.subcategories.some(sub => sub.slug === slug))
        )
      );
      setBlogs(filtered);
      setFilteredBlogs(filtered);
      // Set category name for heading
      let foundCat = null;
      for (const blog of filtered) {
        for (const cat of blog.categories) {
          if (cat.slug === slug) foundCat = cat;
          if (cat.subcategories) {
            for (const sub of cat.subcategories) {
              if (sub.slug === slug) foundCat = sub;
            }
          }
        }
      }
      setCategoryName(foundCat ? foundCat.name : '');
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!search) {
      setFilteredBlogs(blogs);
    } else {
      const keyword = search.toLowerCase();
      setFilteredBlogs(
        blogs.filter(blog =>
          blog.title.toLowerCase().includes(keyword) ||
          (blog.description && blog.description.toLowerCase().includes(keyword)) ||
          (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(keyword)))
        )
      );
    }
  }, [search, blogs]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 800, textAlign: 'center', fontSize: { xs: 26, md: 34 } }}>
        {categoryName ? `Blogs in "${categoryName}"` : 'Blogs in Category'}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search blogs in this category..."
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
              No blogs found for this category.
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
                    {blog.metaDescription || (blog.description ? blog.description.replace(/<[^>]+>/g, '').slice(0, 120) : '')}
                  </Typography>
                  {blog.tags && blog.tags.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                      {blog.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
                    </Stack>
                  )}
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
  );
}

export default CategoryDetail;
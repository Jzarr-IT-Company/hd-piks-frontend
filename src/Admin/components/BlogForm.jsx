import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, FormControlLabel, Switch, MenuItem, Select, InputLabel, FormControl, Typography, Chip, OutlinedInput, Stack, IconButton, Card, CardContent, CardMedia, Paper, CircularProgress } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { getCategoryMenuItems } from './CategorySelectTree';
import AttachmentList from './AttachmentList';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchCategories } from '../../Services/category';
import { fetchBlogCategories } from '../../Services/blogCategory';
import { fetchBlogBySlug } from '../../Services/blog';
import BlogCategories from '../pages/BlogCategories';
import Dialog from '@mui/material/Dialog';
import { uploadMedia } from '../../Services/media';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
  // emoji modules removed
};

const statusOptions = ['draft', 'published', 'scheduled', 'archived'];
const languageOptions = ['en', 'es', 'fr', 'de', 'zh', 'ar', 'ru', 'hi'];

export default function BlogForm({ blog, onClose, onSave }) {
  const [title, setTitle] = useState(blog?.title || '');
  const [slug, setSlug] = useState(blog?.slug || '');
  const [content, setContent] = useState(blog?.description || '');
  const [status, setStatus] = useState(blog?.status || 'draft');
  const [allowComments, setAllowComments] = useState(blog?.allowComments ?? true);
  const [categories, setCategories] = useState(
    blog?.categories
      ? blog.categories.map(c => (typeof c === 'object' && c !== null ? c._id : c))
      : []
  );
  const [allCategories, setAllCategories] = useState([]);
  const [blogCatDialogOpen, setBlogCatDialogOpen] = useState(false);
  const [tags, setTags] = useState(blog?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [featureImage, setFeatureImage] = useState(blog?.featureImage || '');
  const [featureImagePreview, setFeatureImagePreview] = useState(blog?.featureImage || '');
  const [featureImageUploading, setFeatureImageUploading] = useState(false);
  const [featureImageError, setFeatureImageError] = useState('');

  // Clean up preview object URL when component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (featureImagePreview && featureImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(featureImagePreview);
      }
    };
  }, [featureImagePreview]);
  const [seoTitle, setSeoTitle] = useState(blog?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(blog?.metaDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(blog?.canonicalUrl || '');
  const [publishedAt, setPublishedAt] = useState(blog?.publishedAt ? dayjs(blog.publishedAt) : null);
  const [isFeatured, setIsFeatured] = useState(blog?.isFeatured ?? false);
  const [language, setLanguage] = useState(blog?.language || 'en');
  const [attachments, setAttachments] = useState(blog?.attachments || []);
  const [attachmentInput, setAttachmentInput] = useState('');
  // Media state
  const [media, setMedia] = useState(blog?.media || []);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [mediaAlt, setMediaAlt] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaUploading, setMediaUploading] = useState(false);
  const [schemaCode, setSchemaCode] = useState(blog?.schemaCode || '');
  // Slug uniqueness state
  const [slugError, setSlugError] = useState('');
  const [checkingSlug, setCheckingSlug] = useState(false);
  // Media upload handler
  const handleMediaFileChange = (e) => {
    setMediaFile(e.target.files[0]);
  };
  const handleAddMedia = async () => {
    if (!mediaFile) return;
    setMediaUploading(true);
    try {
      const url = await uploadMedia(mediaFile);
      setMedia([
        ...media,
        { type: mediaType, url, alt: mediaAlt, caption: mediaCaption },
      ]);
      setMediaFile(null);
      setMediaAlt('');
      setMediaCaption('');
    } finally {
      setMediaUploading(false);
    }
  };
  const handleDeleteMedia = (idx) => {
    setMedia(media.filter((_, i) => i !== idx));
  };

  // Fetch blog categories for blog form
  const loadBlogCategories = async () => {
    const cats = await fetchBlogCategories();
    setAllCategories(cats);
  };
  useEffect(() => {
    loadBlogCategories();
  }, []);


  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };
  const handleDeleteTag = (tagToDelete) => setTags(tags.filter(tag => tag !== tagToDelete));

  const handleAddAttachment = () => {
    if (attachmentInput && !attachments.includes(attachmentInput)) {
      setAttachments([...attachments, attachmentInput]);
      setAttachmentInput('');
    }
  };
  const handleDeleteAttachment = (att) => setAttachments(attachments.filter(a => a !== att));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSlugError('');
    setCheckingSlug(true);
    try {
      // Only check uniqueness if slug changed or creating new
      if (!blog || slug !== blog.slug) {
        let existing = null;
        try {
          existing = await fetchBlogBySlug(slug);
        } catch (err) {
          // If 404, slug is available; any other error, show error
          if (err.response && err.response.status === 404) {
            existing = null;
          } else {
            setSlugError('Error checking slug uniqueness.');
            setCheckingSlug(false);
            return;
          }
        }
        if (existing && (!blog || existing._id !== blog._id)) {
          setSlugError('Slug already exists. Please choose a unique slug.');
          setCheckingSlug(false);
          return;
        }
      }
      setCheckingSlug(false);
      onSave({
        title,
        slug,
        description: content,
        status,
        allowComments,
        categories,
        tags,
        featureImage,
        seoTitle,
        metaDescription,
        canonicalUrl,
        publishedAt: publishedAt ? publishedAt.toISOString() : null,
        isFeatured,
        language,
        attachments,
        media,
        schemaCode,
      });
      onClose();
    } catch (err) {
      setSlugError('Error checking slug uniqueness.');
      setCheckingSlug(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Blog Details</Typography>
      <TextField label="Title" fullWidth margin="normal" value={title} onChange={e => setTitle(e.target.value)} required />
      <TextField
        label="Slug"
        fullWidth
        margin="normal"
        value={slug}
        onChange={e => {
          setSlug(e.target.value);
          setSlugError('');
        }}
        required
        error={!!slugError}
        helperText={slugError}
        disabled={checkingSlug}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
          {statusOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InputLabel shrink>Categories</InputLabel>
          <Button size="small" sx={{ ml: 'auto' }} onClick={() => setBlogCatDialogOpen(true)}>
            Add Category
          </Button>
        </Box>
        <Select
          multiple
          value={categories}
          onChange={e => setCategories(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
          input={<OutlinedInput label="Categories" />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(id => {
                const cat = allCategories.find(c => c._id === id);
                return <Chip key={id} label={cat?.name || id} />;
              })}
            </Box>
          )}
        >
          {allCategories.length === 0 ? (
            <MenuItem disabled>No categories</MenuItem>
          ) : (
            getCategoryMenuItems(allCategories)
          )}
        </Select>
      </FormControl>
      <Dialog open={blogCatDialogOpen} onClose={() => setBlogCatDialogOpen(false)} maxWidth="md" fullWidth>
        <BlogCategories />
        <Box sx={{ p: 2, textAlign: 'right' }}>
          <Button onClick={async () => { setBlogCatDialogOpen(false); await loadBlogCategories(); }}>Done</Button>
        </Box>
      </Dialog>
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1">Tags</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField label="Add tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} size="small" />
          <Button onClick={handleAddTag} variant="outlined">Add</Button>
        </Stack>
        <Box sx={{ mt: 1 }}>
          {tags.map(tag => (
            <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
      </Box>
      <Card sx={{ my: 3, p: 2, borderRadius: 3, background: '#fafbfc', boxShadow: 2, maxWidth: 420, mx: 'auto' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Feature Image (Main Blog Image)</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180, background: '#f5f5f5', borderRadius: 2, border: '1px dashed #bdbdbd', cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="feature-image-upload"
              onChange={async (e) => {
                setFeatureImageError('');
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  // Show instant preview
                  const previewUrl = URL.createObjectURL(file);
                  setFeatureImagePreview(previewUrl);
                  setFeatureImageUploading(true);
                  try {
                    // Upload to S3 and set real URL after
                    const url = await uploadMedia(file);
                    setFeatureImage(url);
                    // Optionally update preview to S3 url after upload
                    setFeatureImagePreview(url);
                  } catch (err) {
                    setFeatureImageError('Upload failed. Please try again.');
                  } finally {
                    setFeatureImageUploading(false);
                  }
                }
              }}
            />
            {featureImageUploading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <CircularProgress size={40} sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">Uploading...</Typography>
              </Box>
            ) : featureImagePreview ? (
              <CardMedia
                component="img"
                image={featureImagePreview}
                alt="Feature Preview"
                sx={{ width: 'auto', maxHeight: 180, maxWidth: '100%', borderRadius: 2, boxShadow: 1 }}
                onClick={() => document.getElementById('feature-image-upload').click()}
              />
            ) : (
              <Stack alignItems="center" justifyContent="center" sx={{ width: '100%' }} onClick={() => document.getElementById('feature-image-upload').click()}>
                <ImageIcon sx={{ fontSize: 64, color: '#e0e0e0' }} />
                <Typography variant="body2" color="text.secondary">Click to upload Feature Image</Typography>
              </Stack>
            )}
            {featureImageError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>{featureImageError}</Typography>
            )}

          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            Main image for blog preview and sharing.
          </Typography>
        </CardContent>
      </Card>
      <Typography sx={{ mt: 2, mb: 1 }}>Content</Typography>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={quillModules}
        style={{ minHeight: 200, marginBottom: 40 }}
        ref={editor => {
          if (editor && editor.editor && !editor._customPasteHandler) {
            editor._customPasteHandler = true;
            editor.editor.root.addEventListener('paste', (e) => {
              if (e.clipboardData && e.clipboardData.getData) {
                const html = e.clipboardData.getData('text/html');
                if (html) {
                  e.preventDefault();
                  // Use Quill clipboard to convert HTML to Delta
                  const quill = editor.getEditor();
                  const delta = quill.clipboard.convert(html);
                  quill.setContents(delta, 'user');
                }
              }
            });
          }
        }}
      />

      {/* Media Gallery Section */}
      <Paper sx={{ my: 3, mt: 5, p: 2, borderRadius: 2, background: '#fafbfc', border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Media Gallery (Images, Videos, etc.)</Typography>
        <Box
          sx={{
            border: '2px dashed #bdbdbd',
            borderRadius: 2,
            p: 2,
            mb: 2,
            textAlign: 'center',
            background: mediaFile ? '#f5f5f5' : '#fafbfc',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onClick={() => document.getElementById('media-file-input').click()}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleMediaFileChange({ target: { files: e.dataTransfer.files } });
            }
          }}
        >
          <input
            id="media-file-input"
            type="file"
            accept="image/*,video/*,.pdf,.zip,.xlsx,.xls,.csv,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.webm,.mkv"
            style={{ display: 'none' }}
            onChange={handleMediaFileChange}
          />
          {mediaFile ? (
            <Typography variant="body2" color="text.secondary">Selected: {mediaFile.name}</Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">Click or drag & drop to select a file</Typography>
          )}
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select value={mediaType} label="Type" onChange={e => setMediaType(e.target.value)}>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="spreadsheet">Spreadsheet</MenuItem>
              <MenuItem value="zip">Zip</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Alt Text" value={mediaAlt} onChange={e => setMediaAlt(e.target.value)} size="small" sx={{ width: 120 }} />
          <TextField label="Caption" value={mediaCaption} onChange={e => setMediaCaption(e.target.value)} size="small" sx={{ width: 180 }} />
          <Button
            onClick={handleAddMedia}
            disabled={!mediaFile || mediaUploading}
            variant="contained"
            color="primary"
            sx={{ minWidth: 120 }}
          >
            {mediaUploading ? <CircularProgress size={20} /> : 'Add Media'}
          </Button>
          {mediaFile && !mediaUploading && (
            <Button onClick={() => { setMediaFile(null); }} color="secondary" variant="outlined">Clear</Button>
          )}
        </Stack>
        {mediaFile && mediaType === 'image' && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img
              src={URL.createObjectURL(mediaFile)}
              alt="Preview"
              style={{ maxWidth: 120, maxHeight: 80, borderRadius: 4, objectFit: 'cover', border: '1px solid #ccc' }}
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {media.map((item, idx) => (
            <Box key={idx} sx={{ width: 140, textAlign: 'center', border: '1px solid #eee', borderRadius: 2, p: 1, background: '#fff' }}>
              {item.type === 'image' && <img src={item.url} alt={item.alt} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />}
              {item.type === 'video' && <video src={item.url} controls style={{ width: '100%', height: 80, borderRadius: 4 }} />}
              {item.type === 'pdf' && <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>PDF</Box>}
              {item.type === 'spreadsheet' && <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Sheet</Box>}
              {item.type === 'zip' && <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>ZIP</Box>}
              {item.type === 'other' && <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Other</Box>}
              <TextField
                label="Alt"
                value={item.alt}
                onChange={e => {
                  const newMedia = [...media];
                  newMedia[idx].alt = e.target.value;
                  setMedia(newMedia);
                }}
                size="small"
                sx={{ mt: 1, width: '100%' }}
              />
              <TextField
                label="Caption"
                value={item.caption}
                onChange={e => {
                  const newMedia = [...media];
                  newMedia[idx].caption = e.target.value;
                  setMedia(newMedia);
                }}
                size="small"
                sx={{ mt: 1, width: '100%' }}
              />
              <IconButton onClick={() => handleDeleteMedia(idx)} color="error" sx={{ mt: 1 }}><DeleteIcon /></IconButton>
            </Box>
          ))}
        </Box>
      </Paper>
      <Typography variant="h6" sx={{ mt: 3 }}>SEO</Typography>
      <TextField label="SEO Title" fullWidth margin="normal" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
      <TextField label="Meta Description" fullWidth margin="normal" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} multiline rows={2} />
      <TextField label="Canonical URL" fullWidth margin="normal" value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)} />
      <TextField
        label="Schema Code (JSON-LD or script)"
        fullWidth
        margin="normal"
        value={schemaCode}
        onChange={e => setSchemaCode(e.target.value)}
        multiline
        minRows={3}
        placeholder="Paste JSON-LD or script here"
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Published At"
          value={publishedAt}
          onChange={setPublishedAt}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />
      </LocalizationProvider>
      <FormControlLabel control={<Switch checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />} label="Featured Blog" sx={{ mt: 2 }} />
      <FormControl fullWidth margin="normal">
        <InputLabel>Language</InputLabel>
        <Select value={language} label="Language" onChange={e => setLanguage(e.target.value)}>
          {languageOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </Select>
      </FormControl>
      <Box sx={{ my: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField label="Add attachment URL" value={attachmentInput} onChange={e => setAttachmentInput(e.target.value)} size="small" />
          <IconButton onClick={handleAddAttachment} color="primary"><AddPhotoAlternateIcon /></IconButton>
        </Stack>
        <AttachmentList attachments={attachments} />
      </Box>
      {/* Media Upload Section */}
      {/* <Box sx={{ my: 3 }}>
        <Typography variant="h6">Media (Images, Videos, etc.)</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <input type="file" accept="image/*,video/*,.pdf,.zip,.xlsx,.xls,.csv,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.webm,.mkv" onChange={handleMediaFileChange} />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select value={mediaType} label="Type" onChange={e => setMediaType(e.target.value)}>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="spreadsheet">Spreadsheet</MenuItem>
              <MenuItem value="zip">Zip</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Alt" value={mediaAlt} onChange={e => setMediaAlt(e.target.value)} size="small" sx={{ width: 120 }} />
          <TextField label="Caption" value={mediaCaption} onChange={e => setMediaCaption(e.target.value)} size="small" sx={{ width: 180 }} />
          <Button onClick={handleAddMedia} disabled={!mediaFile || mediaUploading} variant="contained">{mediaUploading ? 'Uploading...' : 'Add Media'}</Button>
        </Stack>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {media.map((m, idx) => (
            <Box key={idx} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 1, minWidth: 120, maxWidth: 180, textAlign: 'center', position: 'relative' }}>
              {m.type === 'image' ? (
                <img src={m.url} alt={m.alt} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
              ) : m.type === 'video' ? (
                <video src={m.url} controls style={{ width: '100%', height: 80, borderRadius: 4 }} />
              ) : (
                <a href={m.url} target="_blank" rel="noopener noreferrer">{m.type.toUpperCase()}</a>
              )}
              <Typography variant="caption" display="block">{m.caption}</Typography>
              <IconButton size="small" onClick={() => handleDeleteMedia(idx)} sx={{ position: 'absolute', top: 2, right: 2 }}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          ))}
        </Box>
      </Box> */}
      <FormControlLabel control={<Switch checked={allowComments} onChange={e => setAllowComments(e.target.checked)} />} label="Allow Comments" sx={{ mt: 2 }} />
      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, width: '100%' }} disabled={featureImageUploading}>Save Blog</Button>
    </Box>
  );
}

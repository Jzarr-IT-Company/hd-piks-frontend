import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArchiveIcon from '@mui/icons-material/Archive';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function getFileIcon(url) {
  if (url.match(/\.pdf$/i)) return <PictureAsPdfIcon />;
  if (url.match(/\.(zip|rar|7z)$/i)) return <ArchiveIcon />;
  if (url.match(/\.(docx?|xlsx?|pptx?)$/i)) return <DescriptionIcon />;
  return <InsertDriveFileIcon />;
}

function getFileName(url) {
  try {
    return decodeURIComponent(url.split('/').pop());
  } catch {
    return url;
  }
}

export default function AttachmentList({ attachments }) {
  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1">Attachments</Typography>
      {(!attachments || attachments.length === 0) ? (
        <Typography variant="body2" color="text.secondary">No attachments</Typography>
      ) : (
        <Stack spacing={1}>
          {attachments.map((url, idx) => (
            <a href={url} target="_blank" rel="noopener noreferrer" key={idx} style={{ textDecoration: 'none' }}>
              <Button variant="outlined" startIcon={getFileIcon(url)} sx={{ textTransform: 'none' }}>
                {getFileName(url)}
              </Button>
            </a>
          ))}
        </Stack>
      )}
    </Box>
  );
}

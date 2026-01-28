import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function renderTree(nodes, categories, onEdit, onDelete, level = 0) {
  return nodes.map(node => (
    <Box key={node._id} sx={{ pl: level * 3, display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: level === 0 ? 600 : 400 }}>
        {node.name}
      </Typography>
      <IconButton size="small" onClick={() => onEdit(node)}><EditIcon fontSize="small" /></IconButton>
      <IconButton size="small" color="error" onClick={() => onDelete(node._id)}><DeleteIcon fontSize="small" /></IconButton>
      {/* Render children */}
      <Box sx={{ width: '100%' }}>
        {categories.filter(c => c.parent === node._id).length > 0 &&
          renderTree(categories.filter(c => c.parent === node._id), categories, onEdit, onDelete, level + 1)
        }
      </Box>
    </Box>
  ));
}

export default function SimpleTreeView({ categories, onEdit, onDelete }) {
  // Get root nodes (no parent)
  const roots = categories.filter(cat => !cat.parent);
  return (
    <Box>
      {renderTree(roots, categories, onEdit, onDelete)}
    </Box>
  );
}

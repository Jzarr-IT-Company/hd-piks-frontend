import React from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function buildTree(categories, parent = null) {
  return categories
    .filter(cat => (cat.parent ? cat.parent === parent : !parent))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(cat => ({
      ...cat,
      children: buildTree(categories, cat._id),
    }));
}

export default function BlogCategoryTreeView({ categories, onEdit, onDelete }) {
  const tree = buildTree(categories);
  const renderTree = nodes =>
    nodes.map(node => (
      <TreeItem
        key={node._id}
        nodeId={node._id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>{node.name}</span>
            <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(node); }}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); onDelete(node._id); }}><DeleteIcon fontSize="small" /></IconButton>
          </Box>
        }
      >
        {node.children && node.children.length > 0 ? renderTree(node.children) : null}
      </TreeItem>
    ));
  return (
    <TreeView defaultCollapseIcon={null} defaultExpandIcon={null} sx={{ flexGrow: 1, overflowY: 'auto' }}>
      {renderTree(tree)}
    </TreeView>
  );
}

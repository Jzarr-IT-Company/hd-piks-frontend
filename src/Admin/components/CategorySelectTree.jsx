import { MenuItem } from '@mui/material';

// Helper to build tree structure from flat list
function buildCategoryTree(categories) {
  const map = {};
  categories.forEach(cat => (map[cat._id] = { ...cat, children: [] }));
  const roots = [];
  categories.forEach(cat => {
    if (cat.parent && map[cat.parent]) {
      map[cat.parent].children.push(map[cat._id]);
    } else {
      roots.push(map[cat._id]);
    }
  });
  return roots;
}

// Recursive rendering of MenuItems with indentation
export function getCategoryMenuItems(categories, level = 0) {
  const tree = buildCategoryTree(categories);
  function renderTreeOptions(nodes, level = 0) {
    return nodes.flatMap(node => [
      <MenuItem key={node._id} value={node._id} sx={{ pl: 2 + level * 2 }}>
        {node.name}
      </MenuItem>,
      ...renderTreeOptions(node.children, level + 1)
    ]);
  }
  return renderTreeOptions(tree);
}

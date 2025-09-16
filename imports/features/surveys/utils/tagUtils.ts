// Utility functions for tag operations

export interface Layer {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Layer[];
  depth?: number;
  isDisabled?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  depth?: number;
  isDisabled?: boolean;
}

/**
 * Build hierarchical tag structure from flat layers
 */
export const buildTagHierarchy = (layers: Layer[]): Layer[] => {
  const layerMap = new Map<string, Layer & { children: Layer[] }>();
  const rootLayers: Layer[] = [];

  // First pass: create a map of all layers with empty children arrays
  layers.forEach(layer => {
    layerMap.set(layer._id, { ...layer, children: [] });
  });

  // Second pass: build the hierarchy
  layers.forEach(layer => {
    const layerWithChildren = layerMap.get(layer._id)!;
    
    if (layer.parentId && layerMap.has(layer.parentId)) {
      // This layer has a parent, add it to parent's children
      const parent = layerMap.get(layer.parentId)!;
      parent.children.push(layerWithChildren);
    } else {
      // This is a root layer
      rootLayers.push(layerWithChildren);
    }
  });

  // Calculate depth for each layer
  const calculateDepth = (layer: Layer, depth = 0) => {
    layer.depth = depth;
    if (layer.children) {
      layer.children.forEach(child => calculateDepth(child, depth + 1));
    }
  };

  rootLayers.forEach(layer => calculateDepth(layer));

  return rootLayers;
};

/**
 * Build flat list of tags with depth information
 */
export const buildFlatTagList = (layers: Layer[]): Layer[] => {
  const result: Layer[] = [];
  
  const flattenWithDepth = (tags: Layer[], depth = 0) => {
    tags.forEach(tag => {
      result.push({ ...tag, depth });
      if (tag.children && tag.children.length > 0) {
        flattenWithDepth(tag.children, depth + 1);
      }
    });
  };
  
  flattenWithDepth(layers);
  return result;
};

/**
 * Sort tags by name (case insensitive)
 */
export const sortTags = (tags: Layer[]): Layer[] => {
  return [...tags].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

/**
 * Prepare hierarchical options for React Select
 */
export const prepareSelectOptions = (tags: Layer[]): SelectOption[] => {
  const flatTags = buildFlatTagList(tags);
  
  return flatTags.map(tag => ({
    value: tag._id,
    label: tag.name,
    depth: tag.depth || 0,
    isDisabled: tag.isDisabled || false
  }));
};

/**
 * Find tag by ID in hierarchical structure
 */
export const findTagById = (tags: Layer[], tagId: string): Layer | null => {
  for (const tag of tags) {
    if (tag._id === tagId) {
      return tag;
    }
    if (tag.children) {
      const found = findTagById(tag.children, tagId);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get all parent tags for a given tag
 */
export const getParentTags = (tags: Layer[], tagId: string): Layer[] => {
  const parents: Layer[] = [];
  
  const findParents = (tagList: Layer[], targetId: string, currentParents: Layer[] = []): boolean => {
    for (const tag of tagList) {
      const newParents = [...currentParents, tag];
      
      if (tag._id === targetId) {
        parents.push(...currentParents);
        return true;
      }
      
      if (tag.children && findParents(tag.children, targetId, newParents)) {
        return true;
      }
    }
    return false;
  };
  
  findParents(tags, tagId);
  return parents;
};

/**
 * Get all child tags for a given tag
 */
export const getChildTags = (tags: Layer[], tagId: string): Layer[] => {
  const children: Layer[] = [];
  
  const findChildren = (tagList: Layer[], targetId: string): boolean => {
    for (const tag of tagList) {
      if (tag._id === targetId) {
        if (tag.children) {
          children.push(...buildFlatTagList(tag.children));
        }
        return true;
      }
      
      if (tag.children && findChildren(tag.children, targetId)) {
        return true;
      }
    }
    return false;
  };
  
  findChildren(tags, tagId);
  return children;
};

/**
 * Filter tags by search query
 */
export const filterTagsByQuery = (tags: Layer[], query: string): Layer[] => {
  if (!query.trim()) return tags;
  
  const searchLower = query.toLowerCase();
  
  const filterRecursive = (tagList: Layer[]): Layer[] => {
    return tagList.filter(tag => {
      const matchesQuery = tag.name.toLowerCase().includes(searchLower) ||
                          (tag.description && tag.description.toLowerCase().includes(searchLower));
      
      const filteredChildren = tag.children ? filterRecursive(tag.children) : [];
      
      return matchesQuery || filteredChildren.length > 0;
    }).map(tag => ({
      ...tag,
      children: tag.children ? filterRecursive(tag.children) : []
    }));
  };
  
  return filterRecursive(tags);
};

/**
 * Validate tag selection (e.g., prevent selecting parent and child together)
 */
export const validateTagSelection = (selectedTagIds: string[], allTags: Layer[]): {
  isValid: boolean;
  conflicts: string[];
} => {
  const conflicts: string[] = [];
  
  for (const selectedId of selectedTagIds) {
    const selectedTag = findTagById(allTags, selectedId);
    if (!selectedTag) continue;
    
    // Check if any parent of this tag is also selected
    const parents = getParentTags(allTags, selectedId);
    const parentConflicts = parents.filter(parent => selectedTagIds.includes(parent._id));
    
    if (parentConflicts.length > 0) {
      conflicts.push(`Cannot select "${selectedTag.name}" when parent tags are selected`);
    }
    
    // Check if any child of this tag is also selected
    const children = getChildTags(allTags, selectedId);
    const childConflicts = children.filter(child => selectedTagIds.includes(child._id));
    
    if (childConflicts.length > 0) {
      conflicts.push(`Cannot select "${selectedTag.name}" when child tags are selected`);
    }
  }
  
  return {
    isValid: conflicts.length === 0,
    conflicts
  };
};

/**
 * Format tags for display with proper indentation
 */
export const formatTagsForDisplay = (tags: Layer[]): string[] => {
  const flatTags = buildFlatTagList(tags);
  
  return flatTags.map(tag => {
    const indent = '  '.repeat(tag.depth || 0);
    return `${indent}${tag.name}`;
  });
};







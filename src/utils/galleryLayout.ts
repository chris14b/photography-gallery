import type {Photo} from '../types';

interface LayoutItem {
  photo: Photo;
  width: number;
  height: number;
  aspectRatio: number;
}

interface LayoutRow {
  items: LayoutItem[];
  width: number;
  height: number;
}

interface LayoutOptions {
  containerWidth: number;
  targetRowHeight: number;
  spacing: number;
  maxRows?: number;
}

/**
 * Calculate the layout for a justified gallery
 * @param photos Array of photos to layout
 * @param options Layout options
 * @returns Array of layout rows
 */
export const calculateLayout = (
  photos: Photo[],
  options: LayoutOptions
): LayoutRow[] => {
  const { containerWidth, targetRowHeight, spacing, maxRows } = options;
  
  // Calculate aspect ratio for each photo
  const layoutItems: LayoutItem[] = photos.map(photo => {
    const aspectRatio = photo.width / photo.height;
    return {
      photo,
      width: targetRowHeight * aspectRatio,
      height: targetRowHeight,
      aspectRatio
    };
  });
  
  const rows: LayoutRow[] = [];
  let currentRow: LayoutItem[] = [];
  let currentRowWidth = 0;
  
  // Group photos into rows
  layoutItems.forEach(item => {
    // If adding this photo would exceed container width, start a new row
    if (currentRowWidth + item.width + (currentRow.length * spacing) > containerWidth && currentRow.length > 0) {
      // Calculate row height to fill container width
      const rowWidth = currentRowWidth;
      const totalSpacing = (currentRow.length - 1) * spacing;
      const scale = (containerWidth - totalSpacing) / rowWidth;
      
      // Adjust item dimensions to fill the row
      const rowItems = currentRow.map(rowItem => ({
        ...rowItem,
        width: Math.floor(rowItem.width * scale),
        height: Math.floor(rowItem.height * scale)
      }));
      
      // Add row to layout
      rows.push({
        items: rowItems,
        width: containerWidth,
        height: Math.floor(targetRowHeight * scale)
      });
      
      // Start a new row
      currentRow = [item];
      currentRowWidth = item.width;
    } else {
      // Add photo to current row
      currentRow.push(item);
      currentRowWidth += item.width;
      
      // Add spacing between photos
      if (currentRow.length > 1) {
        currentRowWidth += spacing;
      }
    }
  });
  
  // Handle the last row
  if (currentRow.length > 0) {
    // For the last row, we have two options:
    // 1. Scale it to fill the container width (like other rows)
    // 2. Leave it as is with the target height
    
    // Option 1: Scale to fill container width
    const rowWidth = currentRowWidth;
    const totalSpacing = (currentRow.length - 1) * spacing;
    const scale = (containerWidth - totalSpacing) / rowWidth;
    
    const rowItems = currentRow.map(rowItem => ({
      ...rowItem,
      width: Math.floor(rowItem.width * scale),
      height: Math.floor(rowItem.height * scale)
    }));
    
    rows.push({
      items: rowItems,
      width: containerWidth,
      height: Math.floor(targetRowHeight * scale)
    });
  }
  
  // Limit the number of rows if specified
  return maxRows ? rows.slice(0, maxRows) : rows;
};

/**
 * Calculate the layout for a justified gallery and return a flat array of items
 * with position information
 */
export const getGalleryLayout = (
  photos: Photo[],
  options: LayoutOptions
) => {
  const rows = calculateLayout(photos, options);
  const layout: {
    photo: Photo;
    width: number;
    height: number;
    row: number;
  }[] = [];
  
  rows.forEach((row, rowIndex) => {
    row.items.forEach(item => {
      layout.push({
        photo: item.photo,
        width: item.width,
        height: item.height,
        row: rowIndex
      });
    });
  });
  
  return { layout, rows };
};
/**
 * Custom hook to calculate photo dimensions for album layout
 * 
 * @param containerWidth - Width of the container in pixels
 * @returns Object exposing calculateDimensions(width, height, options)
 */
export function usePhotoDimensions(containerWidth: number) {
  
  
  /**
   * Calculate photo dimensions while maintaining aspect ratio and respecting layout
   * @param width - Original photo width
   * @param height - Original photo height
   * @param options - Optional layout options
   *   - layout: 'side' places details beside the photo; 'below' places details under the photo
   *   - gap: horizontal gap between photo and details when layout is 'side'
   *   - infoWidth: fixed width reserved for the details panel when layout is 'side'
   * @returns Object with calculated width and height
   */
  const calculateDimensions = (
    width: number,
    height: number,
    options?: { layout?: 'side' | 'below'; gap?: number; infoWidth?: number }
  ): { width: number; height: number } => {
    const aspectRatio = width / height;
    const layout = options?.layout ?? 'below';
    const gap = options?.gap ?? 32; // matches PortraitPhotoContainer gap
    const infoWidth = options?.infoWidth ?? 300; // matches InfoContainer side width

    // Available width for the photo depending on layout
    // Inline responsive width calculation (previously in getMaxPhotoWidth)
    let baseMaxWidth: number;
    if (window.innerWidth < 768) {
      baseMaxWidth = containerWidth * 0.98;
    } else if (window.innerWidth < 1200) {
      baseMaxWidth = Math.min(containerWidth * 0.96, 1200);
    } else {
      baseMaxWidth = Math.min(containerWidth * 0.95, 1600);
    }
    const maxWidth = layout === 'side'
      ? Math.max(0, baseMaxWidth - (infoWidth + gap))
      : baseMaxWidth;

    // Max height depends on layout (not on photo orientation)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let maxHeight: number;
    if (vw < 768) {
      maxHeight = layout === 'side' ? vh * 0.8 : vh * 0.7;
    } else if (vw < 1200) {
      maxHeight = layout === 'side' ? vh * 0.9 : vh * 0.8;
    } else {
      maxHeight = layout === 'side' ? vh * 0.98 : vh * 0.92;
    }

    // Start with maximum width within constraints
    let calculatedWidth = maxWidth;
    let calculatedHeight = calculatedWidth / aspectRatio;

    // If the height exceeds maxHeight, adjust dimensions
    if (calculatedHeight > maxHeight) {
      calculatedHeight = maxHeight;
      calculatedWidth = calculatedHeight * aspectRatio;
    }

    return { width: calculatedWidth, height: calculatedHeight };
  };
  
  return {
    calculateDimensions
  };
}
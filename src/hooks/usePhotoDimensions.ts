/**
 * Custom hook to calculate photo dimensions for album layout
 * 
 * @param containerWidth - Width of the container in pixels
 * @returns Functions to calculate maximum photo width and height
 */
export function usePhotoDimensions(containerWidth: number) {
  /**
   * Calculate maximum photo width based on container width and screen size
   * @returns Maximum width in pixels
   */
  const getMaxPhotoWidth = (): number => {
    // Responsive width calculation based on screen size
    if (window.innerWidth < 768) {
      // Mobile devices: use 98% of container width
      return containerWidth * 0.98;
    } else if (window.innerWidth < 1200) {
      // Tablets and small desktops: use 96% of container width
      return Math.min(containerWidth * 0.96, 1200);
    } else {
      // Large desktops: use 95% of container width, cap at 1600px
      return Math.min(containerWidth * 0.95, 1600);
    }
  };
  
  /**
   * Calculate maximum photo height based on screen size and orientation
   * @param isPortrait - Whether the photo is in portrait orientation
   * @returns Maximum height in pixels
   */
  const getMaxPhotoHeight = (isPortrait = false): number => {
    // Responsive height calculation based on screen size
    if (window.innerWidth < 768) {
      // Mobile devices
      return window.innerHeight * (isPortrait ? 0.8 : 0.7); // Extra height for portrait photos
    } else if (window.innerWidth < 1200) {
      // Tablets and small desktops
      return window.innerHeight * (isPortrait ? 0.9 : 0.8); // Extra height for portrait photos
    } else {
      // Large desktops
      return window.innerHeight * (isPortrait ? 0.95 : 0.9); // Extra height for portrait photos
    }
  };
  
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
    const infoWidth = options?.infoWidth ?? 240; // matches PortraitPhotoInfo width

    // Available width for the photo depending on layout
    const baseMaxWidth = getMaxPhotoWidth();
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
      maxHeight = layout === 'side' ? vh * 0.95 : vh * 0.9;
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
    getMaxPhotoWidth,
    getMaxPhotoHeight,
    calculateDimensions
  };
}
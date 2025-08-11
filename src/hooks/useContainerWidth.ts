import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to measure and track a container's width, updating on window resize
 * 
 * @returns An object containing:
 * - containerRef: Ref to attach to the container element
 * - containerWidth: Current width of the container in pixels
 */
export function useContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
      }
    };
    
    // Initial width calculation
    updateWidth();
    
    // Update width on window resize
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  return { containerRef, containerWidth };
}
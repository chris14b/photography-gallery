import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';

export type LazyImageLayout = 'side' | 'below';

interface LazyImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  /**
   * How to size the image by default for common gallery layouts.
   * - 'below': img is width:100%, height:auto
   * - 'side': img is width:auto, height:94vh (capped by max-height)
   */
  layout?: LazyImageLayout;
  /** Fill the parent container (width:100%, height:100%) */
  fillContainer?: boolean;
  /** CSS object-fit for image; defaults to 'contain' for below/side usage */
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Optional className applied to the <img> element */
  imgClassName?: string;
  /** Optional style overrides applied to the <img> element */
  imgStyle?: React.CSSProperties;
  /** IntersectionObserver options; defaults to threshold 0.1, rootMargin 200px */
  observerOptions?: IntersectionObserverInit;
  /** Called when the underlying <img> has loaded */
  onImageLoad?: () => void;
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  z-index: 1;

  &::after {
    content: '';
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: ${({ theme }) => theme.colors.accent};
  }

  @media (prefers-reduced-motion: no-preference) {
    &::after {
      animation: spin 1s linear infinite;
      will-change: transform;
      transform: translateZ(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      border: 2px solid ${({ theme }) => theme.colors.accent};
      opacity: 0.7;
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg) translateZ(0); }
    to { transform: rotate(360deg) translateZ(0); }
  }
`;

const StyledImg = styled.img<{ $layout: LazyImageLayout; $fit: NonNullable<LazyImageProps['fit']>; $fill: boolean }>`
  display: block;
  max-width: 100%;
  max-height: 94vh;
  transition: opacity 0.3s ease, transform 0.3s ease;
  will-change: opacity, transform;
  backface-visibility: hidden;
  position: relative;
  z-index: 2;
  object-fit: ${p => p.$fit};

  width: ${p => (p.$fill ? '100%' : p.$layout === 'side' ? 'auto' : '100%')};
  height: ${p => (p.$fill ? '100%' : p.$layout === 'side' ? '94vh' : 'auto')};

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  loading = 'lazy',
  layout = 'below',
  fillContainer = false,
  fit,
  className,
  imgClassName,
  imgStyle,
  observerOptions,
  onImageLoad,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  const opts = useMemo<IntersectionObserverInit>(() => ({
    threshold: 0.1,
    rootMargin: '200px',
    ...(observerOptions || {}),
  }), [observerOptions]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, opts);

    observer.observe(node);
    return () => observer.disconnect();
  }, [opts]);

  const handleLoad = () => {
    setIsLoaded(true);
    onImageLoad?.();
  };

  const computedFit: NonNullable<LazyImageProps['fit']> = fit ?? (layout === 'below' ? 'contain' : 'contain');

  return (
    <Wrapper className={className} ref={containerRef} {...rest}>
      {isVisible ? (
        <>
          <StyledImg
            src={src}
            alt={alt}
            loading={loading}
            onLoad={handleLoad}
            style={{ opacity: isLoaded ? 1 : 0, ...imgStyle }}
            className={imgClassName}
            $layout={layout}
            $fit={computedFit}
            $fill={fillContainer}
          />
          {!isLoaded && <Placeholder />}
        </>
      ) : (
        <Placeholder />
      )}
    </Wrapper>
  );
};

export default LazyImage;

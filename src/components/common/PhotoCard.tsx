import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import type {Photo} from '../../types';

interface PhotoCardProps {
  photo: Photo;
  width: number;
  height: number;
}

interface StyledCardProps {
  width: number;
  height: number;
}

const Card = styled.div<StyledCardProps>`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 0;
  overflow: hidden;
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  cursor: default;
  width: 100%;
  height: 100%;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Maintains aspect ratio while filling container */
  transition: opacity 0.3s ease;
  position: relative;
  z-index: 1;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  
  &::after {
    content: '';
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: ${({ theme }) => theme.colors.accent};
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, width, height }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset loaded state when photo changes
    setIsLoaded(false);
  }, [photo.src]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px'
      }
    );

    if (imageContainerRef.current) {
      observer.observe(imageContainerRef.current);
    }

    return () => {
      if (imageContainerRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Card width={width} height={height}>
      <ImageContainer ref={imageContainerRef}>
        {isVisible ? (
          <>
            <Image
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              onLoad={handleImageLoad}
              style={{ opacity: isLoaded ? 1 : 0 }}
            />
            {!isLoaded && <Placeholder />}
          </>
        ) : (
          <Placeholder />
        )}
      </ImageContainer>
    </Card>
  );
};

export default PhotoCard;
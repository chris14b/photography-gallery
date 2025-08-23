import React from 'react';
import styled from 'styled-components';
import LazyImage from '../../common/LazyImage';
import type { Photo } from '../../../types';
import { PhotoCaption, PhotoLocation, InfoContainer } from '../../../styles/components/AlbumStyles';
import LocationIcon from '../../common/LocationIcon';

interface PhotoWithInfoProps {
  photo: Photo;
  layout: 'side' | 'below';
  /**
   * When layout is 'side', reverse controls whether info appears before the photo (row-reverse)
   * and aligns text to the right to match existing PortraitPhoto behavior.
   */
  reverse?: boolean;
}

const Container = styled.div<{ $direction: 'row' | 'row-reverse' | 'column' }>`
  display: flex;
  flex-direction: ${p => p.$direction};
  width: 100%;
  align-items: center; /* Center vertically for side, horizontally for below */
  justify-content: center;
  gap: ${p => (p.$direction === 'column' ? '0' : '32px')};

  @media (max-width: 768px) {
    flex-direction: column; /* Stack vertically on mobile */
    gap: 16px;
  }
`;

const PhotoWrapper = styled.div<{ $isColumn: boolean }>`
  display: flex;
  justify-content: center;
  /* In side layout, do not allow the photo to flex-grow; keep it snug next to the info */
  flex: ${p => (p.$isColumn ? '0 1 auto' : '0 0 auto')};
  width: ${p => (p.$isColumn ? '100%' : 'auto')};
  margin-bottom: ${p => (p.$isColumn ? '20px' : '0')};
  max-width: ${p => (p.$isColumn ? 'min(95vw, 1600px)' : '100%')};

  @media (max-width: 768px) {
    max-width: 100%; /* Full width on mobile */
    justify-content: center; /* Center on mobile */
  }
`;

const PhotoWithInfo: React.FC<PhotoWithInfoProps> = React.memo(({ photo, layout, reverse }) => {
  const isSide = layout === 'side';
  const direction: 'row' | 'row-reverse' | 'column' = isSide ? (reverse ? 'row-reverse' : 'row') : 'column';
  const align: 'left' | 'right' | 'center' = isSide ? (reverse ? 'right' : 'left') : 'center';

  return (
    <Container $direction={direction}>
      <PhotoWrapper $isColumn={!isSide}>
        <LazyImage src={photo.src} alt={photo.alt} layout={isSide ? 'side' : 'below'} />
      </PhotoWrapper>

      <InfoContainer $align={align}>
        {isSide ? (
          <>
            {photo.caption && <PhotoCaption>{photo.caption}</PhotoCaption>}
            {photo.location && (
              <PhotoLocation>
                <LocationIcon />
                {photo.location}
              </PhotoLocation>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {photo.caption && (
              <PhotoCaption as="span" style={{ marginBottom: 0 }}>
                {photo.caption}
              </PhotoCaption>
            )}
            {photo.location && (
              <PhotoLocation>
                <LocationIcon />
                {photo.location}
              </PhotoLocation>
            )}
          </div>
        )}
      </InfoContainer>
    </Container>
  );
});

PhotoWithInfo.displayName = 'PhotoWithInfo';

export default PhotoWithInfo;

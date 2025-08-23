import React from 'react';
import styled from 'styled-components';
import PhotoCard from '../../common/PhotoCard';
import type { Photo } from '../../../types';
import { PhotoCaption, PhotoLocation, InfoContainer } from '../../../styles/components/AlbumStyles';
import LocationIcon from '../../common/LocationIcon';

interface PhotoWithInfoProps {
  photo: Photo;
  width: number;
  height: number;
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
  width: ${p => (p.$isColumn ? '100%' : 'auto')};
  margin-bottom: ${p => (p.$isColumn ? '20px' : '0')};
  max-width: ${p => (p.$isColumn ? '100%' : '90%')};

  @media (max-width: 768px) {
    max-width: 100%; /* Full width on mobile */
    justify-content: center; /* Center on mobile */
  }
`;

const PhotoWithInfo: React.FC<PhotoWithInfoProps> = React.memo(({ photo, width, height, layout, reverse }) => {
  const isSide = layout === 'side';
  const direction: 'row' | 'row-reverse' | 'column' = isSide ? (reverse ? 'row-reverse' : 'row') : 'column';
  const align: 'left' | 'right' | 'center' = isSide ? (reverse ? 'right' : 'left') : 'center';

  return (
    <Container $direction={direction}>
      <PhotoWrapper $isColumn={!isSide}>
        <PhotoCard photo={photo} width={width} height={height} />
      </PhotoWrapper>

      <InfoContainer $align={align}>
        {photo.caption && <PhotoCaption>{photo.caption}</PhotoCaption>}
        {photo.location && (
          <PhotoLocation>
            <LocationIcon />
            {photo.location}
          </PhotoLocation>
        )}
      </InfoContainer>
    </Container>
  );
});

PhotoWithInfo.displayName = 'PhotoWithInfo';

export default PhotoWithInfo;

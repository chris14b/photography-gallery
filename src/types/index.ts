export interface Photo {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  caption?: string;
  location?: string;
  // Only relation to its album; no album details on Photo
  albumId?: string;
}

export interface Album {
  id: string;
  coverPhotoId?: string;
  title: string
  country?: string;
  dateDescription?: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
}

// Homepage cover card: an album and its representative cover photo
export interface AlbumCover {
  album: Album;
  coverPhoto: Photo;
}

export interface Theme {
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    overlay: string;
  };
  fonts: {
    main: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
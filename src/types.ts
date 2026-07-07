export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Show {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genres: string[];
  year: number;
  rating: string;
  maturity: string;
  poster: string;
  backdrop: string;
  accent: string;
  trending: boolean;
  seasons: Season[];
}

export interface WatchProgress {
  showId: string;
  episodeId: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  showTitle: string;
  poster: string;
  updatedAt: number;
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverId: number | null;
  coverUrl: string | null;
  year: number | null;
  subjects: string[];
  pages: number | null;
  rating: number | null;
  ratingsCount: number | null;
}

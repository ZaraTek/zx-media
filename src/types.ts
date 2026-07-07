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

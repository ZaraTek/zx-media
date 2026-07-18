import type { Episode, MediaType, Season, Show } from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const VIDSRC_BASE_URL = "https://player.videasy.net";

type TmdbListResult<T> = {
  results: T[];
};

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbTvSummary {
  id: number;
  name: string;
  overview: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  poster_path?: string | null;
  backdrop_path?: string | null;
}

interface TmdbMovieSummary {
  id: number;
  title: string;
  overview: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  poster_path?: string | null;
  backdrop_path?: string | null;
}

interface TmdbMultiSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  name?: string;
  title?: string;
  overview?: string;
  first_air_date?: string;
  release_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  poster_path?: string | null;
  backdrop_path?: string | null;
}

interface TmdbTvDetails {
  id: number;
  name: string;
  tagline?: string;
  overview: string;
  first_air_date?: string;
  vote_average?: number;
  genres?: TmdbGenre[];
  poster_path?: string | null;
  backdrop_path?: string | null;
  number_of_seasons?: number;
  seasons?: Array<{
    season_number: number;
  }>;
}

interface TmdbMovieDetails {
  id: number;
  title: string;
  tagline?: string;
  overview: string;
  release_date?: string;
  vote_average?: number;
  genres?: TmdbGenre[];
  poster_path?: string | null;
  backdrop_path?: string | null;
  runtime?: number | null;
}

interface TmdbSeasonDetails {
  season_number: number;
  episodes: Array<{
    episode_number: number;
    name: string;
    overview: string;
    still_path?: string | null;
    runtime?: number | null;
  }>;
}

let tvGenreCache: Map<number, string> | null = null;
let movieGenreCache: Map<number, string> | null = null;

const homeShowsCache: { value: Show[] | null } = { value: null };
const showSummaryCache = new Map<string, Show>();
const showDetailsCache = new Map<string, Show>();
const searchCache = new Map<string, Show[]>();

function getApiKey(): string {
  const key =
    import.meta.env.TMDB_API_KEY?.trim() ||
    import.meta.env.VITE_TMDB_API_KEY?.trim();
  if (!key) {
    throw new Error("TMDB_API_KEY is missing in .env");
  }
  return key;
}

function isBearerToken(token: string): boolean {
  return token.startsWith("eyJ") || token.includes(".");
}

function makeShowId(mediaType: MediaType, tmdbId: number | string): string {
  return `${mediaType}-${tmdbId}`;
}

export function parseShowId(showId: string): {
  mediaType: MediaType;
  tmdbId: string;
} {
  const separatorIndex = showId.indexOf("-");
  if (separatorIndex > 0) {
    const prefix = showId.slice(0, separatorIndex);
    if (prefix === "movie" || prefix === "tv") {
      return { mediaType: prefix, tmdbId: showId.slice(separatorIndex + 1) };
    }
  }
  // Legacy library/watch-progress entries were saved as bare TMDB TV ids.
  return { mediaType: "tv", tmdbId: showId };
}

function interleave<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

function imageBackground(path: string | null | undefined, size: "w500" | "w780" | "original", fallbackA = "#132038", fallbackB = "#080b12"): string {
  if (!path) {
    return `linear-gradient(135deg, ${fallbackA}, ${fallbackB})`;
  }
  const url = `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  return `center / cover no-repeat url(${url})`;
}

function imagePoster(path: string | null | undefined): string {
  return imageBackground(path, "w500", "#1f304d", "#070a12");
}

function imageBackdrop(path: string | null | undefined): string {
  return imageBackground(path, "w780", "#123a7a", "#070a12");
}

function parseYear(dateStr?: string): number {
  const year = Number(dateStr?.slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : new Date().getFullYear();
}

function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

async function tmdbFetch<T>(path: string, params?: URLSearchParams): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${TMDB_BASE_URL}${path}`);

  if (params) {
    params.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
  }

  const headers: HeadersInit = {
    accept: "application/json",
  };

  if (isBearerToken(apiKey)) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  const response = await fetch(url.toString(), { headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`TMDB request failed (${response.status}): ${message}`);
  }
  return (await response.json()) as T;
}

async function getGenreMap(mediaType: MediaType): Promise<Map<number, string>> {
  if (mediaType === "movie") {
    if (movieGenreCache) return movieGenreCache;
    const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list");
    movieGenreCache = new Map(data.genres.map((g) => [g.id, g.name]));
    return movieGenreCache;
  }
  if (tvGenreCache) return tvGenreCache;
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list");
  tvGenreCache = new Map(data.genres.map((g) => [g.id, g.name]));
  return tvGenreCache;
}

function mapSummaryToShow(
  mediaType: MediaType,
  item: TmdbTvSummary | TmdbMovieSummary,
  genreMap: Map<number, string>,
  trendingKeys: Set<string>
): Show {
  const title = mediaType === "movie" ? (item as TmdbMovieSummary).title : (item as TmdbTvSummary).name;
  const dateStr =
    mediaType === "movie"
      ? (item as TmdbMovieSummary).release_date
      : (item as TmdbTvSummary).first_air_date;

  const genres = (item.genre_ids ?? [])
    .map((id) => genreMap.get(id))
    .filter((genre): genre is string => Boolean(genre));

  return {
    id: makeShowId(mediaType, item.id),
    mediaType,
    title: title || "Untitled",
    tagline: mediaType === "movie" ? "Feature film" : "Now streaming",
    description: item.overview || "No description available.",
    genres: genres.length > 0 ? genres : [mediaType === "movie" ? "Movie" : "TV"],
    year: parseYear(dateStr),
    rating: item.vote_average ? item.vote_average.toFixed(1) : "N/A",
    maturity: mediaType === "movie" ? "PG-13" : "TV-14",
    poster: imagePoster(item.poster_path),
    backdrop: imageBackdrop(item.backdrop_path),
    accent: "#2b8fff",
    trending: trendingKeys.has(makeShowId(mediaType, item.id)),
    seasons: [],
  };
}

function mapDetailsToShow(
  mediaType: MediaType,
  details: TmdbTvDetails | TmdbMovieDetails,
  seasons: Season[]
): Show {
  const title = mediaType === "movie" ? (details as TmdbMovieDetails).title : (details as TmdbTvDetails).name;
  const dateStr =
    mediaType === "movie"
      ? (details as TmdbMovieDetails).release_date
      : (details as TmdbTvDetails).first_air_date;

  return {
    id: makeShowId(mediaType, details.id),
    mediaType,
    title: title || "Untitled",
    tagline: details.tagline || (mediaType === "movie" ? "Feature film" : "Now streaming"),
    description: details.overview || "No description available.",
    genres:
      details.genres?.map((g) => g.name).filter(Boolean) ??
      [mediaType === "movie" ? "Movie" : "TV"],
    year: parseYear(dateStr),
    rating: details.vote_average ? details.vote_average.toFixed(1) : "N/A",
    maturity: mediaType === "movie" ? "PG-13" : "TV-14",
    poster: imagePoster(details.poster_path),
    backdrop: imageBackdrop(details.backdrop_path),
    accent: "#2b8fff",
    trending: false,
    seasons,
  };
}

function buildPlaceholderSeasons(count: number): Season[] {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    episodes: [],
  }));
}

function getVidsrcBaseUrl(): string {
  const configured = import.meta.env.VITE_VIDSRC_BASE_URL?.trim();
  return (configured || VIDSRC_BASE_URL).replace(/\/+$/, "");
}

function buildEpisodeVideo(tmdbId: string, seasonNumber: number, episodeNumber: number): string {
  return `${getVidsrcBaseUrl()}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`;
}

function buildMovieVideo(tmdbId: string): string {
  return `${getVidsrcBaseUrl()}/movie/${tmdbId}`;
}

export async function fetchHomeShows(): Promise<Show[]> {
  if (homeShowsCache.value) {
    return homeShowsCache.value;
  }

  const [tvGenreMap, movieGenreMap, trendingTv, popularTv, trendingMovies, popularMovies] =
    await Promise.all([
      getGenreMap("tv"),
      getGenreMap("movie"),
      tmdbFetch<TmdbListResult<TmdbTvSummary>>("/trending/tv/week"),
      tmdbFetch<TmdbListResult<TmdbTvSummary>>("/tv/popular"),
      tmdbFetch<TmdbListResult<TmdbMovieSummary>>("/trending/movie/week"),
      tmdbFetch<TmdbListResult<TmdbMovieSummary>>("/movie/popular"),
    ]);

  const trendingKeys = new Set([
    ...trendingTv.results.map((s) => makeShowId("tv", s.id)),
    ...trendingMovies.results.map((s) => makeShowId("movie", s.id)),
  ]);

  const dedupedTv = Array.from(
    new Map([...trendingTv.results, ...popularTv.results].map((s) => [s.id, s])).values()
  ).slice(0, 20);
  const dedupedMovies = Array.from(
    new Map([...trendingMovies.results, ...popularMovies.results].map((s) => [s.id, s])).values()
  ).slice(0, 20);

  const tvShows = dedupedTv.map((s) => mapSummaryToShow("tv", s, tvGenreMap, trendingKeys));
  const movieShows = dedupedMovies.map((s) =>
    mapSummaryToShow("movie", s, movieGenreMap, trendingKeys)
  );

  const shows = interleave(tvShows, movieShows);
  shows.forEach((show) => {
    showSummaryCache.set(show.id, show);
  });

  homeShowsCache.value = shows;
  return shows;
}

async function fetchTvSummary(tmdbId: string): Promise<Show> {
  const details = await tmdbFetch<TmdbTvDetails>(`/tv/${tmdbId}`);
  return mapDetailsToShow("tv", details, buildPlaceholderSeasons(details.number_of_seasons ?? 0));
}

async function fetchMovieSummary(tmdbId: string): Promise<Show> {
  const details = await tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`);
  return mapDetailsToShow("movie", details, []);
}

export async function fetchShowSummaryById(showId: string): Promise<Show> {
  const cached = showSummaryCache.get(showId);
  if (cached) return cached;

  const { mediaType, tmdbId } = parseShowId(showId);
  const show = mediaType === "movie" ? await fetchMovieSummary(tmdbId) : await fetchTvSummary(tmdbId);

  showSummaryCache.set(show.id, show);
  return show;
}

export async function fetchShowsByIds(showIds: string[]): Promise<Show[]> {
  if (showIds.length === 0) return [];

  const shows = await Promise.all(
    showIds.map(async (showId) => {
      try {
        return await fetchShowSummaryById(showId);
      } catch {
        return null;
      }
    })
  );

  return shows.filter((show): show is Show => Boolean(show));
}

export async function fetchShowsByQuery(query: string): Promise<Show[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const cached = searchCache.get(normalized);
  if (cached) return cached;

  const params = new URLSearchParams({
    query: normalized,
    include_adult: "false",
    page: "1",
    language: "en-US",
  });

  const [tvGenreMap, movieGenreMap, data] = await Promise.all([
    getGenreMap("tv"),
    getGenreMap("movie"),
    tmdbFetch<TmdbListResult<TmdbMultiSearchResult>>("/search/multi", params),
  ]);

  const shows = data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => {
      const mediaType = r.media_type as "movie" | "tv";
      const summary: TmdbTvSummary | TmdbMovieSummary =
        mediaType === "movie"
          ? {
              id: r.id,
              title: r.title ?? "Untitled",
              overview: r.overview ?? "",
              release_date: r.release_date,
              vote_average: r.vote_average,
              genre_ids: r.genre_ids,
              poster_path: r.poster_path,
              backdrop_path: r.backdrop_path,
            }
          : {
              id: r.id,
              name: r.name ?? "Untitled",
              overview: r.overview ?? "",
              first_air_date: r.first_air_date,
              vote_average: r.vote_average,
              genre_ids: r.genre_ids,
              poster_path: r.poster_path,
              backdrop_path: r.backdrop_path,
            };

      return mapSummaryToShow(
        mediaType,
        summary,
        mediaType === "movie" ? movieGenreMap : tvGenreMap,
        new Set<string>()
      );
    });

  shows.forEach((show) => {
    showSummaryCache.set(show.id, show);
  });

  searchCache.set(normalized, shows);
  return shows;
}

async function fetchTvShow(tmdbId: string): Promise<Show> {
  const details = await tmdbFetch<TmdbTvDetails>(`/tv/${tmdbId}`);

  const seasonNumbers = (details.seasons ?? [])
    .map((season) => season.season_number)
    .filter((seasonNumber) => seasonNumber > 0);

  const seasonResults = await Promise.all(
    seasonNumbers.map((seasonNumber) =>
      tmdbFetch<TmdbSeasonDetails>(`/tv/${tmdbId}/season/${seasonNumber}`)
    )
  );

  const seasons: Season[] = seasonResults.map((season) => ({
    number: season.season_number,
    episodes: season.episodes.map((episode) => ({
      id: `tv-${tmdbId}-s${season.season_number}-e${episode.episode_number}`,
      episodeNumber: episode.episode_number,
      title: episode.name || `Episode ${episode.episode_number}`,
      description: episode.overview || "No episode overview available.",
      duration: formatRuntime(episode.runtime),
      thumbnail: imageBackground(episode.still_path, "w500", "#1f304d", "#0b1220"),
      videoUrl: buildEpisodeVideo(tmdbId, season.season_number, episode.episode_number),
    })),
  }));

  return mapDetailsToShow("tv", details, seasons);
}

async function fetchMovieShow(tmdbId: string): Promise<Show> {
  const details = await tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`);

  const season: Season = {
    number: 1,
    episodes: [
      {
        id: `movie-${tmdbId}-feature`,
        episodeNumber: 1,
        title: details.title || "Untitled",
        description: details.overview || "No description available.",
        duration: formatRuntime(details.runtime),
        thumbnail: imageBackdrop(details.backdrop_path),
        videoUrl: buildMovieVideo(tmdbId),
      },
    ],
  };

  return mapDetailsToShow("movie", details, [season]);
}

export async function fetchShowById(showId: string): Promise<Show> {
  const cached = showDetailsCache.get(showId);
  if (cached) return cached;

  const { mediaType, tmdbId } = parseShowId(showId);
  const show = mediaType === "movie" ? await fetchMovieShow(tmdbId) : await fetchTvShow(tmdbId);

  showDetailsCache.set(show.id, show);
  showSummaryCache.set(show.id, {
    ...show,
    seasons: buildPlaceholderSeasons(show.seasons.length),
  });

  return show;
}

export function getEpisodeFromShow(
  show: Show,
  episodeId: string
): { season: Season; episode: Episode } | undefined {
  for (const season of show.seasons) {
    const episode = season.episodes.find((ep) => ep.id === episodeId);
    if (episode) return { season, episode };
  }
  return undefined;
}

export function getNextEpisodeFromShow(
  show: Show,
  episodeId: string
): Episode | undefined {
  const flat = show.seasons.flatMap((season) => season.episodes);
  const idx = flat.findIndex((episode) => episode.id === episodeId);
  if (idx === -1 || idx === flat.length - 1) return undefined;
  return flat[idx + 1];
}

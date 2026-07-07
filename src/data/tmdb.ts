import type { Episode, Season, Show } from "../types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const VIDSRC_BASE_URL = "https://vidsrc.to";

type TmdbListResult<T> = {
  results: T[];
};

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbShowSummary {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  poster_path?: string | null;
  backdrop_path?: string | null;
}

interface TmdbShowDetails {
  id: number;
  name: string;
  original_name?: string;
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

let genreCache: Map<number, string> | null = null;

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

function parseYear(firstAirDate?: string): number {
  const year = Number(firstAirDate?.slice(0, 4));
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

async function getGenreMap(): Promise<Map<number, string>> {
  if (genreCache) return genreCache;
  const data = await tmdbFetch<{ genres: TmdbGenre[] }>("/genre/tv/list");
  genreCache = new Map(data.genres.map((g) => [g.id, g.name]));
  return genreCache;
}

function mapSummaryToShow(
  show: TmdbShowSummary,
  genreMap: Map<number, string>,
  trendingIds: Set<number>
): Show {
  const genres = (show.genre_ids ?? [])
    .map((id) => genreMap.get(id))
    .filter((genre): genre is string => Boolean(genre));

  return {
    id: String(show.id),
    title: show.name,
    tagline: "Now streaming",
    description: show.overview || "No description available.",
    genres: genres.length > 0 ? genres : ["TV"],
    year: parseYear(show.first_air_date),
    rating: show.vote_average ? show.vote_average.toFixed(1) : "N/A",
    maturity: "TV-14",
    poster: imagePoster(show.poster_path),
    backdrop: imageBackdrop(show.backdrop_path),
    accent: "#2b8fff",
    trending: trendingIds.has(show.id),
    seasons: [],
  };
}

function mapDetailsToShow(
  details: TmdbShowDetails,
  seasons: Season[]
): Show {
  return {
    id: String(details.id),
    title: details.name,
    tagline: details.tagline || "Now streaming",
    description: details.overview || "No description available.",
    genres:
      details.genres?.map((g) => g.name).filter(Boolean) ?? ["TV"],
    year: parseYear(details.first_air_date),
    rating: details.vote_average ? details.vote_average.toFixed(1) : "N/A",
    maturity: "TV-14",
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

function buildEpisodeVideo(showId: string, seasonNumber: number, episodeNumber: number): string {
  return `${getVidsrcBaseUrl()}/embed/tv/${showId}/${seasonNumber}/${episodeNumber}`;
}

export async function fetchHomeShows(): Promise<Show[]> {
  if (homeShowsCache.value) {
    return homeShowsCache.value;
  }

  const [genreMap, trendingData, popularData] = await Promise.all([
    getGenreMap(),
    tmdbFetch<TmdbListResult<TmdbShowSummary>>("/trending/tv/week"),
    tmdbFetch<TmdbListResult<TmdbShowSummary>>("/tv/popular"),
  ]);

  const trendingIds = new Set(trendingData.results.map((show) => show.id));
  const merged = [...trendingData.results, ...popularData.results];
  const deduped = Array.from(
    new Map(merged.map((show) => [show.id, show])).values()
  ).slice(0, 30);

  const shows = deduped.map((show) => mapSummaryToShow(show, genreMap, trendingIds));
  shows.forEach((show) => {
    showSummaryCache.set(show.id, show);
  });

  homeShowsCache.value = shows;
  return shows;
}

export async function fetchShowSummaryById(showId: string): Promise<Show> {
  const cached = showSummaryCache.get(showId);
  if (cached) return cached;

  const details = await tmdbFetch<TmdbShowDetails>(`/tv/${showId}`);
  const show = mapDetailsToShow(
    details,
    buildPlaceholderSeasons(details.number_of_seasons ?? 0)
  );
  showSummaryCache.set(showId, show);
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

  const [genreMap, data] = await Promise.all([
    getGenreMap(),
    tmdbFetch<TmdbListResult<TmdbShowSummary>>("/search/tv", params),
  ]);

  const shows = data.results.map((show) =>
    mapSummaryToShow(show, genreMap, new Set<number>())
  );

  shows.forEach((show) => {
    showSummaryCache.set(show.id, show);
  });

  searchCache.set(normalized, shows);
  return shows;
}

export async function fetchShowById(showId: string): Promise<Show> {
  const cached = showDetailsCache.get(showId);
  if (cached) return cached;

  const details = await tmdbFetch<TmdbShowDetails>(`/tv/${showId}`);

  const seasonNumbers = (details.seasons ?? [])
    .map((season) => season.season_number)
    .filter((seasonNumber) => seasonNumber > 0);

  const seasonResults = await Promise.all(
    seasonNumbers.map((seasonNumber) =>
      tmdbFetch<TmdbSeasonDetails>(`/tv/${showId}/season/${seasonNumber}`)
    )
  );

  const seasons: Season[] = seasonResults.map((season) => ({
    number: season.season_number,
    episodes: season.episodes.map((episode) => ({
      id: `${showId}-s${season.season_number}-e${episode.episode_number}`,
      episodeNumber: episode.episode_number,
      title: episode.name || `Episode ${episode.episode_number}`,
      description: episode.overview || "No episode overview available.",
      duration: formatRuntime(episode.runtime),
      thumbnail: imageBackground(episode.still_path, "w500", "#1f304d", "#0b1220"),
      videoUrl: buildEpisodeVideo(showId, season.season_number, episode.episode_number),
    })),
  }));

  const show = mapDetailsToShow(details, seasons);
  showDetailsCache.set(showId, show);
  showSummaryCache.set(showId, {
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
import type { Episode, Season, Show } from "../types";

// Bundled locally so it plays offline without any external dependency.
const LOCAL_SAMPLE = "/videos/nebula-drift-sample.mp4";

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

const DURATIONS = ["42:11", "38:57", "45:03", "51:22", "39:48", "47:36", "44:19"];

function gradient(a: string, b: string, angle = 135): string {
  return `linear-gradient(${angle}deg, ${a}, ${b})`;
}

interface ShowSeed {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genres: string[];
  year: number;
  rating: string;
  maturity: string;
  accent: string;
  poster: [string, string];
  backdrop: [string, string];
  trending: boolean;
  seasonCount: number;
  episodesPerSeason: number;
  episodeTitles: string[];
  episodeBlurbs: string[];
}

const SEEDS: ShowSeed[] = [
  {
    id: "nebula-drift",
    title: "Nebula Drift",
    tagline: "The last crew. The first frontier.",
    description:
      "A patchwork crew aboard a decommissioned mining vessel stumbles onto a signal from beyond charted space. As their fuel dwindles, so does their trust in one another.",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    year: 2024,
    rating: "8.7",
    maturity: "TV-14",
    accent: "#3b9dff",
    poster: ["#0b2a5b", "#0a0d14"],
    backdrop: ["#123a7a", "#070a12"],
    trending: true,
    seasonCount: 2,
    episodesPerSeason: 6,
    episodeTitles: [
      "Cold Start",
      "The Signal",
      "Dead Reckoning",
      "Ghost Tonnage",
      "Event Horizon",
      "Drift",
    ],
    episodeBlurbs: [
      "The crew wakes from cryo to find the nav computer wiped and the reactor running hot.",
      "An impossible transmission repeats on a frequency that shouldn't exist.",
      "With sensors down, the captain gambles the ship's course on a hunch.",
      "Cargo that was never logged begins to move on its own.",
      "A decision at the edge of a collapsing star will cost someone everything.",
      "The truth about the signal fractures the crew for good.",
    ],
  },
  {
    id: "hollow-city",
    title: "Hollow City",
    tagline: "Every door hides a debt.",
    description:
      "A disgraced detective returns to a rain-slicked metropolis where the powerful trade favors like currency and nothing stays buried for long.",
    genres: ["Crime", "Thriller", "Noir"],
    year: 2023,
    rating: "9.1",
    maturity: "TV-MA",
    accent: "#4aa8ff",
    poster: ["#111827", "#05070d"],
    backdrop: ["#1c2740", "#05070d"],
    trending: true,
    seasonCount: 1,
    episodesPerSeason: 8,
    episodeTitles: [
      "Homecoming",
      "The Favor",
      "Paper Trails",
      "Blue Hour",
      "The Broker",
      "Collateral",
      "Debt Collectors",
      "Last Call",
    ],
    episodeBlurbs: [
      "Detective Vance takes a case no one else will touch.",
      "An old friend calls in a favor with strings attached.",
      "A missing ledger points to city hall.",
      "The trail goes cold as witnesses vanish.",
      "The man who owns the city finally makes an offer.",
      "Vance learns what his silence is worth.",
      "Everyone comes to collect at once.",
      "One confession brings the whole thing down.",
    ],
  },
  {
    id: "wild-current",
    title: "Wild Current",
    tagline: "The planet has stories left to tell.",
    description:
      "A sweeping documentary series following the hidden rivers of the world and the creatures whose lives rise and fall with the water.",
    genres: ["Documentary", "Nature"],
    year: 2025,
    rating: "8.9",
    maturity: "TV-G",
    accent: "#38bdf8",
    poster: ["#0e3a52", "#071018"],
    backdrop: ["#0b4a66", "#071018"],
    trending: true,
    seasonCount: 1,
    episodesPerSeason: 5,
    episodeTitles: [
      "Headwaters",
      "The Rapids",
      "Still Waters",
      "Delta",
      "Return to the Sea",
    ],
    episodeBlurbs: [
      "High in the mountains, a trickle becomes a torrent.",
      "Life clings to the fastest water on Earth.",
      "In the calm, an entire world waits beneath the surface.",
      "Where the river spreads, millions gather.",
      "The journey ends where a new one begins.",
    ],
  },
  {
    id: "midnight-diner-code",
    title: "The Midnight Protocol",
    tagline: "Log in. Trust no one.",
    description:
      "A burned-out programmer discovers her side project has been quietly running the city's infrastructure for years, and someone wants the keys.",
    genres: ["Tech", "Thriller", "Mystery"],
    year: 2024,
    rating: "8.4",
    maturity: "TV-14",
    accent: "#2b8fff",
    poster: ["#132038", "#080b12"],
    backdrop: ["#1a2c4d", "#080b12"],
    trending: false,
    seasonCount: 2,
    episodesPerSeason: 6,
    episodeTitles: [
      "Push to Prod",
      "Rollback",
      "The Fork",
      "Zero Day",
      "Merge Conflict",
      "Shutdown",
    ],
    episodeBlurbs: [
      "A routine deploy exposes something that should have been deleted.",
      "Reverting the change is easier said than done.",
      "Two versions of the truth can't both be right.",
      "An exploit older than the company threatens everything.",
      "Two teams, one system, no agreement.",
      "Pulling the plug has consequences no one modeled.",
    ],
  },
  {
    id: "gilded-age-kitchen",
    title: "Copper & Flame",
    tagline: "Service is a battlefield.",
    description:
      "Behind the swinging doors of a legendary restaurant, a new head chef must earn the loyalty of a brigade that has already broken three before her.",
    genres: ["Drama", "Culinary"],
    year: 2023,
    rating: "8.2",
    maturity: "TV-14",
    accent: "#5cb0ff",
    poster: ["#2a1810", "#0d0806"],
    backdrop: ["#3a2416", "#0d0806"],
    trending: false,
    seasonCount: 1,
    episodesPerSeason: 7,
    episodeTitles: [
      "Mise en Place",
      "The Pass",
      "86'd",
      "Family Meal",
      "The Critic",
      "Fire",
      "Two Stars",
    ],
    episodeBlurbs: [
      "The new chef inherits a kitchen that doesn't want her.",
      "A single dish must prove she belongs.",
      "When a key ingredient runs out mid-service, chaos follows.",
      "The staff shares one meal and a lifetime of grievances.",
      "An anonymous reviewer books a table for two.",
      "Literal and figurative flames threaten to close the doors.",
      "The verdict arrives, and nothing will be the same.",
    ],
  },
  {
    id: "echo-hunters",
    title: "Echo Hunters",
    tagline: "Some frequencies were meant to stay silent.",
    description:
      "A team of paranormal audio investigators travels to forgotten places, chasing sounds that science can't explain and history tried to forget.",
    genres: ["Horror", "Mystery"],
    year: 2025,
    rating: "7.9",
    maturity: "TV-MA",
    accent: "#4aa8ff",
    poster: ["#1a1030", "#08060f"],
    backdrop: ["#241546", "#08060f"],
    trending: false,
    seasonCount: 1,
    episodesPerSeason: 6,
    episodeTitles: [
      "White Noise",
      "The Hum",
      "Backmask",
      "Dead Air",
      "The Ninth Track",
      "Signal Lost",
    ],
    episodeBlurbs: [
      "An abandoned radio station broadcasts to no one.",
      "A town can't sleep because of a sound only some can hear.",
      "Played backward, an old record reveals a warning.",
      "The team loses contact during a live capture.",
      "A song with eight tracks somehow plays nine.",
      "The hunters become the hunted.",
    ],
  },
  {
    id: "paper-crowns",
    title: "Paper Crowns",
    tagline: "Power is only borrowed.",
    description:
      "In a fractured kingdom held together by fragile alliances, three siblings scheme, betray, and bargain their way toward a throne none of them can hold alone.",
    genres: ["Fantasy", "Drama", "Political"],
    year: 2024,
    rating: "9.0",
    maturity: "TV-MA",
    accent: "#3b9dff",
    poster: ["#241a06", "#0c0902"],
    backdrop: ["#3a2a0a", "#0c0902"],
    trending: true,
    seasonCount: 2,
    episodesPerSeason: 7,
    episodeTitles: [
      "The Regent's Gambit",
      "Salt and Silver",
      "The Long Table",
      "Vows",
      "The Winter Court",
      "Ash",
      "Coronation",
    ],
    episodeBlurbs: [
      "A dying king names no heir, and the game begins.",
      "An alliance is sealed in the oldest way there is.",
      "Every seat at the table hides a knife.",
      "A wedding becomes a declaration of war.",
      "The cold reveals who can truly be trusted.",
      "One house burns so another can rise.",
      "A crown changes hands, but at what cost?",
    ],
  },
];

function buildEpisodes(seed: ShowSeed, seasonNumber: number): Episode[] {
  return Array.from({ length: seed.episodesPerSeason }, (_, i) => {
    const title = seed.episodeTitles[i] ?? `Episode ${i + 1}`;
    const blurb =
      seed.episodeBlurbs[i] ??
      "A pivotal chapter that raises the stakes for everyone involved.";
    const videoIndex = (seasonNumber * 3 + i) % SAMPLE_VIDEOS.length;
    // Nebula Drift uses the bundled local dummy video so playback works offline.
    const videoUrl =
      seed.id === "nebula-drift" ? LOCAL_SAMPLE : SAMPLE_VIDEOS[videoIndex];
    return {
      id: `${seed.id}-s${seasonNumber}-e${i + 1}`,
      episodeNumber: i + 1,
      title,
      description: blurb,
      duration: DURATIONS[i % DURATIONS.length],
      thumbnail: gradient(seed.backdrop[0], seed.backdrop[1], 120 + i * 8),
      videoUrl,
    };
  });
}

function buildShow(seed: ShowSeed): Show {
  const seasons: Season[] = Array.from(
    { length: seed.seasonCount },
    (_, s) => ({
      number: s + 1,
      episodes: buildEpisodes(seed, s + 1),
    })
  );

  return {
    id: seed.id,
    mediaType: "tv",
    title: seed.title,
    tagline: seed.tagline,
    description: seed.description,
    genres: seed.genres,
    year: seed.year,
    rating: seed.rating,
    maturity: seed.maturity,
    accent: seed.accent,
    poster: gradient(seed.poster[0], seed.poster[1]),
    backdrop: gradient(seed.backdrop[0], seed.backdrop[1], 115),
    trending: seed.trending,
    seasons,
  };
}

export const SHOWS: Show[] = SEEDS.map(buildShow);

export function getShow(id: string): Show | undefined {
  return SHOWS.find((s) => s.id === id);
}

export function getEpisode(
  showId: string,
  episodeId: string
): { show: Show; season: Season; episode: Episode } | undefined {
  const show = getShow(showId);
  if (!show) return undefined;
  for (const season of show.seasons) {
    const episode = season.episodes.find((e) => e.id === episodeId);
    if (episode) return { show, season, episode };
  }
  return undefined;
}

export function getNextEpisode(
  showId: string,
  episodeId: string
): Episode | undefined {
  const show = getShow(showId);
  if (!show) return undefined;
  const flat = show.seasons.flatMap((s) => s.episodes);
  const idx = flat.findIndex((e) => e.id === episodeId);
  if (idx === -1 || idx === flat.length - 1) return undefined;
  return flat[idx + 1];
}

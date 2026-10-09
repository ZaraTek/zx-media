import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import EpisodeList from "../components/EpisodeList";
import SeasonTabs from "../components/SeasonTabs";
import { fetchShowById } from "../data/tmdb";
import type { Show } from "../types";
import {
  BackIcon,
  CheckIcon,
  PlayIcon,
  PlusIcon,
  StarIcon,
} from "../components/icons";

export default function ShowPage() {
  const { showId } = useParams<{ showId: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isInLibrary, toggleLibrary } = useLibrary();
  const [activeSeason, setActiveSeason] = useState(1);

  useEffect(() => {
    let mounted = true;

    async function loadShow() {
      if (!showId) {
        setLoading(false);
        setShow(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchShowById(showId);
        if (!mounted) return;
        setShow(data);
        setActiveSeason(data.seasons[0]?.number ?? 1);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load show");
        setShow(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadShow();

    return () => {
      mounted = false;
    };
  }, [showId]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Loading show...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Unable to load show</h1>
        <p className="text-sm text-red-200">{error}</p>
        <Link
          to="/shows"
          className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Show not found</h1>
        <Link
          to="/shows"
          className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const saved = isInLibrary(show.id);
  const season =
    show.seasons.find((s) => s.number === activeSeason) ?? show.seasons[0];
  const firstEpisode = show.seasons[0]?.episodes[0];

  return (
    <div>
      <div className="relative">
        <div
          className="absolute inset-0 h-[380px]"
          style={{ background: show.backdrop }}
        />
        <div className="absolute inset-0 h-[380px] bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent" />
        <div className="absolute inset-0 h-[380px] bg-gradient-to-r from-black/70 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <Link
            to="/shows"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur transition hover:bg-black/50"
          >
            <BackIcon className="h-4 w-4" /> Back
          </Link>

          <div className="flex flex-col gap-6 pt-6 md:flex-row md:items-end">
            <div
              className="hidden h-64 w-44 shrink-0 rounded-xl border border-white/10 shadow-2xl sm:block"
              style={{ background: show.poster }}
            />
            <div className="flex max-w-2xl flex-col gap-3">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {show.title}
              </h1>
              <p className="text-base font-medium text-slate-300">
                {show.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <StarIcon className="h-4 w-4" /> {show.rating}
                </span>
                <span>{show.year}</span>
                <span className="rounded border border-slate-500/60 px-1.5 text-xs">
                  {show.maturity}
                </span>
                {show.mediaType === "movie" ? (
                  firstEpisode && <span>{firstEpisode.duration}</span>
                ) : (
                  <span>
                    {show.seasons.length}{" "}
                    {show.seasons.length === 1 ? "Season" : "Seasons"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {show.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 px-3 py-1 text-xs font-medium text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                {firstEpisode && (
                  <Link
                    to={`/shows/watch/${show.id}/${firstEpisode.id}`}
                    className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/40 transition hover:bg-[var(--color-accent-bright)]"
                  >
                    <PlayIcon className="h-5 w-5" />{" "}
                    {show.mediaType === "movie" ? "Play Movie" : "Play S1:E1"}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => toggleLibrary(show.id)}
                  className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                    saved
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent-bright)]"
                      : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {saved ? (
                    <>
                      <CheckIcon className="h-5 w-5" /> In Library
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" /> Add to Library
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {show.description}
        </p>

        <div className="mt-10 flex flex-col gap-5">
          <SeasonTabs
            title={show.mediaType === "movie" ? "Watch" : "Episodes"}
            seasons={show.seasons}
            activeSeason={activeSeason}
            onSelect={setActiveSeason}
          />

          {season ? (
            <EpisodeList
              show={show}
              episodes={season.episodes}
              seasonNumber={season.number}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-10 text-center text-slate-300">
              No episodes available for this show.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

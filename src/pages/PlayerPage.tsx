import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import { BackIcon, PlayIcon } from "../components/icons";
import { useLibrary } from "../context/LibraryContext";
import {
  fetchShowById,
  getEpisodeFromShow,
  getNextEpisodeFromShow,
} from "../data/tmdb";
import type { Show } from "../types";

export default function PlayerPage() {
  const { showId, episodeId } = useParams<{
    showId: string;
    episodeId: string;
  }>();
  const navigate = useNavigate();
  const { recordWatch } = useLibrary();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load episode");
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

  const found = show && episodeId ? getEpisodeFromShow(show, episodeId) : undefined;

  useEffect(() => {
    if (!show || !found) return;
    recordWatch({
      showId: show.id,
      episodeId: found.episode.id,
      seasonNumber: found.season.number,
      episodeNumber: found.episode.episodeNumber,
      episodeTitle: found.episode.title,
      showTitle: show.title,
      poster: show.poster,
    });
  }, [show, found, recordWatch]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Loading episode...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Unable to load episode</h1>
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

  if (!found || !show) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Episode not found</h1>
        <Link
          to="/shows"
          className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const { season, episode } = found;
  const nextEpisode = getNextEpisodeFromShow(show, episode.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Link
        to={`/shows/${show.id}`}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-[var(--color-surface-2)]"
      >
        <BackIcon className="h-4 w-4" /> Back to {show.title}
      </Link>

      <VideoPlayer
        key={episode.id}
        src={episode.videoUrl}
        title={episode.title}
        subtitle={`${show.title} · S${season.number}:E${episode.episodeNumber}`}
        poster={undefined}
        onEnded={() => {
          if (nextEpisode) {
            navigate(`/shows/watch/${show.id}/${nextEpisode.id}`);
          }
        }}
      />

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-[var(--color-accent-bright)]">
              S{season.number}:E{episode.episodeNumber}
            </span>
            <h1 className="text-2xl font-black tracking-tight">
              {episode.title}
            </h1>
            <p className="text-sm text-slate-400">
              {show.title} · {episode.duration}
            </p>
          </div>

          {nextEpisode && (
            <Link
              to={`/shows/watch/${show.id}/${nextEpisode.id}`}
              className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-bright)]"
            >
              <PlayIcon className="h-4 w-4" /> Next Episode
            </Link>
          )}
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
          {episode.description}
        </p>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { Show } from "../types";
import { useLibrary } from "../context/LibraryContext";
import { CheckIcon, PlusIcon, PlayIcon, StarIcon } from "./icons";

export default function ShowCard({ show }: { show: Show }) {
  const { isInLibrary, toggleLibrary } = useLibrary();
  const saved = isInLibrary(show.id);
  const seasonCount = show.seasons.length;
  const episodeCount = show.seasons.reduce(
    (n, s) => n + s.episodes.length,
    0
  );

  return (
    <Link
      to={`/shows/${show.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-accent)]/60 hover:shadow-[0_18px_40px_-12px_rgba(43,143,255,0.45)]"
    >
      <div
        className="relative aspect-[2/3] w-full"
        style={{ background: show.poster }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
          <StarIcon className="h-3.5 w-3.5" /> {show.rating}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleLibrary(show.id);
          }}
          aria-label={saved ? "Remove from library" : "Add to library"}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition ${
            saved
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-white/30 bg-black/40 text-white hover:border-[var(--color-accent-bright)] hover:bg-[var(--color-accent)]/30"
          }`}
        >
          {saved ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center pb-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg">
            <PlayIcon className="h-4 w-4" /> View
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="truncate text-sm font-semibold text-slate-100">
          {show.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{show.year}</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>
            {show.mediaType === "movie"
              ? "Movie"
              : episodeCount > 0
                ? `${episodeCount} eps`
                : seasonCount > 0
                  ? `${seasonCount} ${seasonCount === 1 ? "season" : "seasons"}`
                  : "TV Series"}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
          {show.genres.join(" · ")}
        </p>
      </div>
    </Link>
  );
}

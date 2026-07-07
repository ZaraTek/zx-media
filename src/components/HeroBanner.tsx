import { Link } from "react-router-dom";
import type { Show } from "../types";
import { useLibrary } from "../context/LibraryContext";
import { CheckIcon, PlayIcon, PlusIcon, StarIcon } from "./icons";

export default function HeroBanner({ show }: { show: Show }) {
  const { isInLibrary, toggleLibrary } = useLibrary();
  const saved = isInLibrary(show.id);
  const firstEpisode = show.seasons[0]?.episodes[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]">
      <div className="absolute inset-0" style={{ background: show.backdrop }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />

      <div className="relative z-10 flex max-w-2xl flex-col gap-4 p-6 sm:p-10 md:p-12">
        <span className="flex w-fit items-center gap-2 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-bright)]">
          Featured
        </span>
        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
          {show.title}
        </h1>
        <p className="text-base font-medium text-slate-300 sm:text-lg">
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
          <span>{show.genres.join(" · ")}</span>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-slate-300/90 sm:text-base">
          {show.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {firstEpisode && (
            <Link
              to={`/watch/${show.id}/${firstEpisode.id}`}
              className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/40 transition hover:bg-[var(--color-accent-bright)]"
            >
              <PlayIcon className="h-5 w-5" /> Play
            </Link>
          )}
          <Link
            to={`/show/${show.id}`}
            className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            More Info
          </Link>
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

      <div className="relative h-40 sm:h-0" />
    </div>
  );
}

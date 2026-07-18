import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { PlayIcon } from "./icons";
import type { SVGProps } from "react";

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function ContinueWatchingRow({
  title = "Continue Watching",
}: {
  title?: string;
}) {
  const { continueWatching, removeWatch } = useLibrary();

  if (continueWatching.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {continueWatching.map((entry) => (
          <div
            key={entry.showId}
            className="group relative w-56 shrink-0 sm:w-64"
          >
            <Link
              to={`/shows/watch/${entry.showId}/${entry.episodeId}`}
              className="block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/60 hover:shadow-[0_18px_40px_-12px_rgba(43,143,255,0.45)]"
            >
              <div
                className="relative aspect-video w-full"
                style={{ background: entry.poster }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/90 text-white shadow-lg">
                    <PlayIcon className="ml-0.5 h-6 w-6" />
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <span className="text-xs font-bold text-[var(--color-accent-bright)]">
                    {entry.mediaType === "movie"
                      ? "Movie"
                      : `S${entry.seasonNumber}:E${entry.episodeNumber}`}
                  </span>
                  <p className="truncate text-sm font-semibold text-white">
                    {entry.showTitle}
                  </p>
                  <p className="truncate text-xs text-slate-300">
                    {entry.episodeTitle}
                  </p>
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => removeWatch(entry.showId)}
              aria-label={`Remove ${entry.showTitle} from continue watching`}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur transition hover:border-red-400 hover:bg-red-500/40"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

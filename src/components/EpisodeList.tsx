import { useNavigate } from "react-router-dom";
import type { Episode, Show } from "../types";
import { PlayIcon } from "./icons";

interface EpisodeListProps {
  show: Show;
  episodes: Episode[];
  seasonNumber: number;
}

export default function EpisodeList({
  show,
  episodes,
  seasonNumber,
}: EpisodeListProps) {
  const navigate = useNavigate();

  return (
    <ul className="flex flex-col gap-3">
      {episodes.map((ep) => (
        <li key={ep.id}>
          <button
            type="button"
            onClick={() => navigate(`/watch/${show.id}/${ep.id}`)}
            className="group flex w-full items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-surface-2)]"
          >
            <div
              className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg sm:w-44"
              style={{ background: ep.thumbnail }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)]/90 text-white shadow-lg">
                  <PlayIcon className="h-5 w-5" />
                </span>
              </div>
              <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-slate-200">
                {ep.duration}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-[var(--color-accent-bright)]">
                  S{seasonNumber}:E{ep.episodeNumber}
                </span>
                <h3 className="truncate text-sm font-semibold text-slate-100">
                  {ep.title}
                </h3>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
                {ep.description}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

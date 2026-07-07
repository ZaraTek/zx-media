import { Link } from "react-router-dom";
import { SHOWS } from "../data/shows";
import { useLibrary } from "../context/LibraryContext";
import ShowGrid from "../components/ShowGrid";
import { LibraryIcon } from "../components/icons";

export default function LibraryPage() {
  const { library } = useLibrary();
  const shows = SHOWS.filter((s) => library.includes(s.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent-bright)]">
          <LibraryIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            My Library
          </h1>
          <p className="text-sm text-slate-400">
            {shows.length} {shows.length === 1 ? "show" : "shows"} saved
          </p>
        </div>
      </div>

      {shows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-20 text-center">
          <p className="text-lg font-semibold text-slate-200">
            Your library is empty
          </p>
          <p className="max-w-sm text-sm text-slate-400">
            Browse the catalog and tap the + on any show to build your personal
            collection.
          </p>
          <Link
            to="/"
            className="mt-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-bright)]"
          >
            Browse Shows
          </Link>
        </div>
      ) : (
        <div className="animate-fade-in">
          <ShowGrid shows={shows} />
        </div>
      )}
    </div>
  );
}

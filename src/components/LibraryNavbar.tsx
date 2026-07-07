import { Link } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export default function LibraryNavbar() {
  const { library } = useLibrary();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--color-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 text-base font-black text-white shadow-lg shadow-rose-500/40">
            zx
          </span>
          <span className="text-lg font-bold tracking-tight">
            My <span className="text-rose-400">Library</span>
          </span>
          {library.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/20 px-1.5 text-xs font-bold text-rose-300">
              {library.length}
            </span>
          )}
        </div>

        <nav className="flex items-center gap-1">
          <Link
            to="/shows"
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <FilmIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Movies &amp; TV</span>
          </Link>
          <Link
            to="/books"
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <BookOpenIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Books</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

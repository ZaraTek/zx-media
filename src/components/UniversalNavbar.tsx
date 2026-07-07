import { Link, useLocation } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="14" height="16" rx="2" />
      <path d="M21 6v14M17 4l4 2" />
    </svg>
  );
}

type Section = "shows" | "books" | "library";

function getSection(pathname: string): Section | null {
  if (pathname.startsWith("/shows")) return "shows";
  if (pathname.startsWith("/books")) return "books";
  if (pathname.startsWith("/library")) return "library";
  return null;
}

const THEME = {
  shows: {
    logoBg: "from-[var(--color-accent-bright)] to-[var(--color-accent)] shadow-[var(--color-accent)]/40",
    logoText: "text-[var(--color-accent-bright)]",
    activeBg: "bg-[var(--color-accent)]/15 text-[var(--color-accent-bright)]",
  },
  books: {
    logoBg: "from-purple-400 to-purple-600 shadow-purple-500/40",
    logoText: "text-purple-400",
    activeBg: "bg-purple-500/15 text-purple-300",
  },
  library: {
    logoBg: "from-rose-400 to-rose-600 shadow-rose-500/40",
    logoText: "text-rose-400",
    activeBg: "bg-rose-500/15 text-rose-400",
  },
} as const;

const DEFAULT_THEME = THEME.shows;

export default function UniversalNavbar() {
  const { library } = useLibrary();
  const { pathname } = useLocation();
  const section = getSection(pathname);
  const theme = section ? THEME[section] : DEFAULT_THEME;

  const navClass = (itemSection: Section) => {
    const base = "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition";
    if (section === itemSection) {
      return `${base} ${THEME[itemSection].activeBg}`;
    }
    return `${base} text-slate-300 hover:bg-white/5 hover:text-white`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--color-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${theme.logoBg} text-base font-black text-white shadow-lg`}>
            zx
          </span>
          <span className="text-lg font-bold tracking-tight">
            zx<span className={theme.logoText}>media</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/shows" className={navClass("shows")}>
            <FilmIcon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Movies &amp; TV</span>
          </Link>
          <Link to="/books" className={navClass("books")}>
            <BookIcon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Books</span>
          </Link>
          <Link to="/library" className={navClass("library")}>
            <LibraryIcon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">My Library</span>
            {library.length > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                {library.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

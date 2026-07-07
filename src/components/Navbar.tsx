import { Link, NavLink } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { HomeIcon, LibraryIcon } from "./icons";

export default function Navbar() {
  const { library } = useLibrary();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent-bright)]"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--color-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent-bright)] to-[var(--color-accent)] text-base font-black text-white shadow-lg shadow-[var(--color-accent)]/40">
            zx
          </span>
          <span className="text-lg font-bold tracking-tight">
            zx<span className="text-[var(--color-accent-bright)]">media</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            <HomeIcon className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Home</span>
          </NavLink>
          <NavLink to="/library" className={linkClass}>
            <LibraryIcon className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">My Library</span>
            {library.length > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-xs font-bold text-white">
                {library.length}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

import { Link, NavLink } from "react-router-dom";
import { HomeIcon, LibraryIcon } from "./icons";
import { useLibrary } from "../context/LibraryContext";

export default function BooksNavbar() {
  const { library } = useLibrary();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-purple-500/15 text-purple-300"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--color-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-base font-black text-white shadow-lg shadow-purple-500/40">
            zx
          </span>
          <span className="text-lg font-bold tracking-tight">
            zx<span className="text-purple-400">media</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/books" className={linkClass} end>
            <HomeIcon className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Books</span>
          </NavLink>
          <NavLink to="/library" className={linkClass}>
            <LibraryIcon className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">My Library</span>
            {library.length > 0 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1.5 text-xs font-bold text-white">
                {library.length}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";
import type { Book } from "../types";
import { CheckIcon, PlusIcon, StarIcon } from "./icons";
import { useLibrary } from "../context/LibraryContext";

function BookPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export default function BookCard({ book }: { book: Book }) {
  const { isBookInLibrary, toggleBookLibrary } = useLibrary();
  const saved = isBookInLibrary(book.id);

  return (
    <Link
      to={`/books/${book.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-500/60 hover:shadow-[0_18px_40px_-12px_rgba(168,85,247,0.35)]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--color-surface-2)]">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <BookPlaceholderIcon className="h-10 w-10 text-slate-600" />
            <span className="line-clamp-3 text-xs text-slate-500">
              {book.title}
            </span>
          </div>
        )}
        {book.rating != null && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
            <StarIcon className="h-3 w-3" /> {book.rating}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleBookLibrary(book.id);
          }}
          aria-label={saved ? "Remove from library" : "Add to library"}
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition ${
            saved
              ? "border-purple-500 bg-purple-500 text-white"
              : "border-white/30 bg-black/40 text-white hover:border-purple-400 hover:bg-purple-500/30"
          }`}
        >
          {saved ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center pb-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            View
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-100">
          {book.title}
        </p>
        {book.authors.length > 0 && (
          <p className="truncate text-xs text-slate-400">{book.authors[0]}</p>
        )}
        {book.year != null && (
          <p className="text-xs text-slate-500">{book.year}</p>
        )}
      </div>
    </Link>
  );
}

import { useEffect, useState } from "react";
import BookGrid from "../components/BookGrid";
import SearchBar from "../components/SearchBar";
import { fetchTrendingBooks, searchBooks } from "../data/openLibrary";
import type { Book } from "../types";

export default function BooksHomePage() {
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchTrendingBooks()
      .then((data) => {
        if (!mounted) return;
        setTrending(data);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load trending books"
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }

    let mounted = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchError(null);

      searchBooks(trimmedQuery)
        .then((results) => {
          if (!mounted) return;
          setSearchResults(results);
        })
        .catch((err: unknown) => {
          if (!mounted) return;
          setSearchError(err instanceof Error ? err.message : "Search failed");
        })
        .finally(() => {
          if (mounted) setSearching(false);
        });
    }, 400);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Find something to read
        </h1>
        <p className="text-sm text-slate-400">
          Browse trending books or search the entire Open Library catalog.
        </p>
        <div className="mt-4 max-w-2xl">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search books, authors, genres..."
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-14 text-center text-slate-300">
          Loading trending books...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-6 py-10 text-center text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && trimmedQuery && searching && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-14 text-center text-slate-300">
          Searching Open Library...
        </div>
      )}

      {!loading && !error && trimmedQuery && !searching && searchError && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-6 py-10 text-center text-sm text-red-200">
          {searchError}
        </div>
      )}

      {!loading && !error && trimmedQuery && !searching && !searchError && (
        <BookGrid
          books={searchResults}
          title={`Results for "${trimmedQuery}"`}
          emptyMessage="No books found. Try a different search."
        />
      )}

      {!loading && !error && !trimmedQuery && (
        <BookGrid books={trending} title="Trending This Week" />
      )}
    </div>
  );
}

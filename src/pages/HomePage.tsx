import { useEffect, useState } from "react";
import ContinueWatchingRow from "../components/ContinueWatchingRow";
import HeroBanner from "../components/HeroBanner";
import SearchBar from "../components/SearchBar";
import ShowGrid from "../components/ShowGrid";
import { fetchHomeShows, fetchShowsByQuery } from "../data/tmdb";
import type { Show } from "../types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Show[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadShows() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHomeShows();
        if (!mounted) return;
        setShows(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load shows");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadShows();
    return () => {
      mounted = false;
    };
  }, []);

  const featured = shows[0];
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setSearchResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }

    let mounted = true;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setSearchError(null);

      try {
        const results = await fetchShowsByQuery(trimmedQuery);
        if (!mounted) return;
        setSearchResults(results);
      } catch (err) {
        if (!mounted) return;
        setSearchError(
          err instanceof Error ? err.message : "Failed to search TMDB"
        );
      } finally {
        if (mounted) {
          setSearching(false);
        }
      }
    }, 350);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  const trending = shows.filter((s) => s.trending);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Find something to watch
        </h1>
        <p className="text-sm text-slate-400">
          Stream movies, series, documentaries, and more.
        </p>
        <div className="mt-4 max-w-2xl">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-14 text-center text-slate-300">
          Loading shows from TMDB...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-6 py-10 text-center text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && trimmedQuery && searching && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-14 text-center text-slate-300">
          Searching TMDB...
        </div>
      )}

      {!loading && !error && trimmedQuery && searchError && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-6 py-10 text-center text-sm text-red-200">
          {searchError}
        </div>
      )}

      {!loading && !error && trimmedQuery && !searching && !searchError ? (
        <div className="animate-fade-in">
          <ShowGrid
            title={`TMDB results for "${query}" (${searchResults.length})`}
            shows={searchResults}
            emptyMessage="No TMDB shows match your search. Try a different title."
          />
        </div>
      ) : null}

      {!loading && !error && !trimmedQuery && (
        <div className="flex flex-col gap-10">
          {featured && (
            <div className="animate-fade-in">
              <HeroBanner show={featured} />
            </div>
          )}
          <ContinueWatchingRow />
          <div className="animate-fade-in">
            <ShowGrid title="Trending Now" shows={trending} />
          </div>
          <div className="animate-fade-in">
            <ShowGrid title="All Shows" shows={shows} />
          </div>
        </div>
      )}
    </div>
  );
}

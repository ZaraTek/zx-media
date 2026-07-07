import { useMemo, useState } from "react";
import { SHOWS } from "../data/shows";
import HeroBanner from "../components/HeroBanner";
import SearchBar from "../components/SearchBar";
import ShowGrid from "../components/ShowGrid";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const featured = SHOWS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return SHOWS.filter((s) => {
      return (
        s.title.toLowerCase().includes(q) ||
        s.genres.some((g) => g.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const trending = SHOWS.filter((s) => s.trending);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Find something to watch
        </h1>
        <p className="text-sm text-slate-400">
          Stream original series, documentaries, and more.
        </p>
        <div className="mt-4 max-w-2xl">
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </div>

      {filtered ? (
        <div className="animate-fade-in">
          <ShowGrid
            title={`Results for "${query}" (${filtered.length})`}
            shows={filtered}
            emptyMessage="No shows match your search. Try a different title or genre."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="animate-fade-in">
            <HeroBanner show={featured} />
          </div>
          <div className="animate-fade-in">
            <ShowGrid title="Trending Now" shows={trending} />
          </div>
          <div className="animate-fade-in">
            <ShowGrid title="All Shows" shows={SHOWS} />
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useLibrary } from "../context/LibraryContext";
import ContinueWatchingRow from "../components/ContinueWatchingRow";
import ShowGrid from "../components/ShowGrid";
import BookGrid from "../components/BookGrid";
import { LibraryIcon } from "../components/icons";
import { fetchShowsByIds } from "../data/tmdb";
import { fetchBooksByIds } from "../data/openLibrary";
import type { Show, Book } from "../types";

type Tab = "all" | "shows" | "books";

export default function LibraryPage() {
  const {
    library,
    isSyncEnabled,
    syncUserEmail,
    syncStatus,
    syncError,
    signInWithGoogle,
    signOut,
    syncNow,
  } = useLibrary();

  const showIds = useMemo(
    () => library.filter((id) => !id.startsWith("book:")),
    [library]
  );
  const bookIds = useMemo(
    () => library.filter((id) => id.startsWith("book:")).map((id) => id.slice(5)),
    [library]
  );

  const [shows, setShows] = useState<Show[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [showsError, setShowsError] = useState<string | null>(null);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    let mounted = true;
    if (showIds.length === 0) {
      setShows([]);
      return;
    }
    setLoadingShows(true);
    setShowsError(null);
    fetchShowsByIds(showIds)
      .then((result) => {
        if (!mounted) return;
        setShows(result);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setShowsError(err instanceof Error ? err.message : "Failed to load shows");
      })
      .finally(() => {
        if (mounted) setLoadingShows(false);
      });
    return () => { mounted = false; };
  }, [showIds]);

  useEffect(() => {
    let mounted = true;
    if (bookIds.length === 0) {
      setBooks([]);
      return;
    }
    setLoadingBooks(true);
    setBooksError(null);
    fetchBooksByIds(bookIds)
      .then((result) => {
        if (!mounted) return;
        setBooks(result);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setBooksError(err instanceof Error ? err.message : "Failed to load books");
      })
      .finally(() => {
        if (mounted) setLoadingBooks(false);
      });
    return () => { mounted = false; };
  }, [bookIds]);

  const totalCount = library.length;
  const isEmpty = totalCount === 0;

  const tabClass = (t: Tab) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
      tab === t
        ? "bg-rose-500 text-white"
        : "text-slate-400 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
          <LibraryIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            My Library
          </h1>
          <p className="text-sm text-slate-400">
            {totalCount} {totalCount === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Cloud Sync</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Sign in with Google to sync your library across all your devices.
            </p>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
            {syncStatus === "syncing"
              ? "Syncing"
              : syncStatus === "error"
                ? "Sync error"
                : isSyncEnabled ? "Synced" : "Off"}
          </div>
        </div>

        {!isSyncEnabled ? (
          <div className="mt-5 flex flex-col items-start gap-3">
            <p className="text-sm text-slate-400">Sign in to keep your library in sync — no password required.</p>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  void signInWithGoogle(credentialResponse.credential);
                }
              }}
              onError={() => { /* errors surfaced via syncError */ }}
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
            />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-100">{syncUserEmail}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { void syncNow(); }}
                className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                Sync now
              </button>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {syncError ? (
          <p className="mt-3 text-sm text-red-300">{syncError}</p>
        ) : null}
      </section>

      <div className="mb-8 empty:hidden">
        <ContinueWatchingRow />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-20 text-center">
          <p className="text-lg font-semibold text-slate-200">Your library is empty</p>
          <p className="max-w-sm text-sm text-slate-400">
            Browse shows or books and save them here to build your personal collection.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/shows"
              className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Browse Shows
            </Link>
            <Link
              to="/books"
              className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
            >
              Browse Books
            </Link>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {showIds.length > 0 && bookIds.length > 0 && (
            <div className="mb-6 flex gap-1">
              <button type="button" onClick={() => setTab("all")} className={tabClass("all")}>
                All <span className="ml-1 opacity-60">{totalCount}</span>
              </button>
              <button type="button" onClick={() => setTab("shows")} className={tabClass("shows")}>
                Shows <span className="ml-1 opacity-60">{shows.length}</span>
              </button>
              <button type="button" onClick={() => setTab("books")} className={tabClass("books")}>
                Books <span className="ml-1 opacity-60">{books.length}</span>
              </button>
            </div>
          )}

          {(tab === "all" || tab === "shows") && showIds.length > 0 && (
            <div className="mb-10">
              {showIds.length > 0 && bookIds.length > 0 && tab === "all" && (
                <h2 className="mb-4 text-lg font-bold text-slate-200">Shows</h2>
              )}
              {loadingShows ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-14 text-center text-slate-300">
                  Loading shows...
                </div>
              ) : showsError ? (
                <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-6 py-10 text-center text-sm text-red-200">
                  {showsError}
                </div>
              ) : (
                <ShowGrid shows={shows} />
              )}
            </div>
          )}

          {(tab === "all" || tab === "books") && bookIds.length > 0 && (
            <div>
              {showIds.length > 0 && bookIds.length > 0 && tab === "all" && (
                <h2 className="mb-4 text-lg font-bold text-slate-200">Books</h2>
              )}
              {loadingBooks ? (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-14 text-center text-slate-300">
                  Loading books...
                </div>
              ) : booksError ? (
                <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-6 py-10 text-center text-sm text-red-200">
                  {booksError}
                </div>
              ) : (
                <BookGrid books={books} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

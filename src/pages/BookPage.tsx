import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BackIcon, CheckIcon, PlusIcon, StarIcon } from "../components/icons";
import { useLibrary } from "../context/LibraryContext";
import { fetchBookById, fetchDirectPdfUrl, getLibgenSearchUrl } from "../data/openLibrary";
import type { Book } from "../types";

export default function BookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfFetching, setPdfFetching] = useState(false);
  const { isBookInLibrary, toggleBookLibrary } = useLibrary();

  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    fetchBookById(bookId)
      .then((data) => {
        if (!mounted) return;
        setBook(data);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load book");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [bookId]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Loading book...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Unable to load book</h1>
        <p className="text-sm text-red-200">{error}</p>
        <Link
          to="/books"
          className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
        >
          Back to Books
        </Link>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Book not found</h1>
        <Link
          to="/books"
          className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
        >
          Back to Books
        </Link>
      </div>
    );
  }

  const handleGetPdf = async () => {
    // Open blank tab synchronously within the click event to avoid popup blockers
    const tab = window.open("", "_blank");
    if (!tab) return;

    setPdfFetching(true);
    try {
      const url = await fetchDirectPdfUrl(book.title, book.authors[0]);
      tab.location.href = url ?? getLibgenSearchUrl(book.title, book.authors[0]);
    } catch {
      tab.location.href = getLibgenSearchUrl(book.title, book.authors[0]);
    } finally {
      setPdfFetching(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Link
        to="/books"
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-[var(--color-surface-2)]"
      >
        <BackIcon className="h-4 w-4" /> Back to Books
      </Link>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-40 rounded-xl border border-white/10 shadow-2xl sm:w-52"
            />
          ) : (
            <div
              className="flex w-40 items-center justify-center rounded-xl border border-white/10 bg-[var(--color-surface-2)] sm:w-52"
              style={{ aspectRatio: "2/3" }}
            >
              <span className="px-4 text-center text-sm text-slate-600">
                No Cover
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {book.title}
          </h1>
          {book.authors.length > 0 && (
            <p className="text-lg font-medium text-slate-300">
              {book.authors.join(", ")}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            {book.rating != null && (
              <span className="flex items-center gap-1 font-semibold text-amber-300">
                <StarIcon className="h-4 w-4" /> {book.rating}
                {book.ratingsCount != null && (
                  <span className="ml-1 font-normal text-slate-500">
                    ({book.ratingsCount.toLocaleString()})
                  </span>
                )}
              </span>
            )}
            {book.year != null && <span>{book.year}</span>}
            {book.pages != null && (
              <span>{book.pages.toLocaleString()} pages</span>
            )}
          </div>
          {book.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.subjects.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleGetPdf()}
              disabled={pdfFetching}
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-500 disabled:opacity-60"
            >
              {pdfFetching ? "Finding PDF…" : "Get PDF ↗"}
            </button>
            {bookId && (
              <button
                type="button"
                onClick={() => toggleBookLibrary(bookId)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  isBookInLibrary(bookId)
                    ? "border-purple-500/50 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                    : "border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                {isBookInLibrary(bookId) ? (
                  <><CheckIcon className="h-4 w-4" /> In Library</>
                ) : (
                  <><PlusIcon className="h-4 w-4" /> Save to Library</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {book.description && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-bold">About this book</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {book.description}
          </p>
        </div>
      )}
    </div>
  );
}

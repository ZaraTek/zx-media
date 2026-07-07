import type { Book } from "../types";
import BookCard from "./BookCard";

interface BookGridProps {
  books: Book[];
  title?: string;
  emptyMessage?: string;
}

export default function BookGrid({ books, title, emptyMessage }: BookGridProps) {
  return (
    <section className="w-full">
      {title && (
        <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
          {title}
        </h2>
      )}
      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50 px-6 py-14 text-center text-slate-400">
          {emptyMessage ?? "Nothing here yet."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}

import { Link } from "react-router-dom";

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="animate-page-in flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-12 text-center">
        <div className="mb-5 inline-flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent-bright)] to-[var(--color-accent)] text-2xl font-black text-white shadow-lg shadow-[var(--color-accent)]/40">
            zx
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          zx<span className="text-[var(--color-accent-bright)]">media</span>
        </h1>
        <p className="mt-3 text-slate-400">Choose your platform</p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          to="/shows"
          className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/60 hover:shadow-[0_24px_48px_-12px_rgba(43,143,255,0.35)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex flex-col gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent-bright)]">
              <FilmIcon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Movies &amp; TV</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Stream series, documentaries, and films.
              </p>
            </div>
            <span className="mt-2 inline-block text-sm font-semibold text-[var(--color-accent-bright)] transition-transform duration-200 group-hover:translate-x-1">
              Browse →
            </span>
          </div>
        </Link>

        <Link
          to="/books"
          className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-[0_24px_48px_-12px_rgba(168,85,247,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex flex-col gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <BookIcon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Books</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Read and discover books from your library.
              </p>
            </div>
            <span className="mt-2 inline-block text-sm font-semibold text-purple-400 transition-transform duration-200 group-hover:translate-x-1">
              Browse →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

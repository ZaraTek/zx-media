import { useEffect, useState } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import PageTransition from "./components/PageTransition";
import UniversalNavbar from "./components/UniversalNavbar";
import ScrollToTop from "./components/ScrollToTop";
import BookPage from "./pages/BookPage";
import BooksHomePage from "./pages/BooksHomePage";
import BooksLayout from "./pages/BooksPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LibraryPage from "./pages/LibraryPage";
import PlayerPage from "./pages/PlayerPage";
import ShowPage from "./pages/ShowPage";

const FIRST_LOAD_WARNING_KEY = "zxmedia:first-load-warning-seen";

function ShowsLayout() {
  const [showFirstLoadWarning, setShowFirstLoadWarning] = useState(false);

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem(FIRST_LOAD_WARNING_KEY);
    if (!hasSeenWarning) {
      setShowFirstLoadWarning(true);
    }
  }, []);

  const dismissFirstLoadWarning = () => {
    localStorage.setItem(FIRST_LOAD_WARNING_KEY, "1");
    setShowFirstLoadWarning(false);
  };

  if (showFirstLoadWarning) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
        <section className="animate-fade-in w-full max-w-2xl rounded-2xl border border-white/10 bg-[var(--color-surface)] p-7 shadow-2xl sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-bright)]">
            Welcome to zxmedia
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-2xl">
            Hi it's Zara, thanks for visiting my streaming site :)
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-xl">
            Before you continue, please note that some video players may{" "}
            <span className="text-red-500">open an ad</span> in a different tab
            when you click play.
          </p>
          <a
            href="https://chromewebstore.google.com/detail/adblock-%E2%80%94-block-ads-acros/gighmmpiobklfepjocnamgkkbiglidom?utm_source=ext_app_menu"
            target="_blank"
            rel="noreferrer"
            className="mt-3 block break-words text-sm font-semibold text-[var(--color-accent-bright)] underline underline-offset-2"
          >
            I recommend this AdBlock from the Chrome Web Store
          </a>
          <div className="mt-8">
            <button
              type="button"
              onClick={dismissFirstLoadWarning}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-bright)]"
            >
              Continue to site
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <UniversalNavbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        zx<span className="text-[var(--color-accent-bright)]">media</span> ·
        Demo streaming library · All titles are fictional.
      </footer>
    </div>
  );
}

function LibraryLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <UniversalNavbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        zx<span className="text-rose-400">media</span> · Your saved collection
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<BooksLayout />}>
        <Route path="/books" element={<BooksHomePage />} />
        <Route path="/books/:bookId" element={<BookPage />} />
      </Route>
      <Route element={<LibraryLayout />}>
        <Route path="/library" element={<LibraryPage />} />
      </Route>
      <Route element={<ShowsLayout />}>
        <Route path="/shows" element={<HomePage />} />
        <Route path="/shows/:showId" element={<ShowPage />} />
        <Route path="/shows/watch/:showId/:episodeId" element={<PlayerPage />} />
      </Route>
      <Route
        path="*"
        element={
          <div className="mx-auto max-w-3xl px-4 py-24 text-center">
            <h1 className="text-3xl font-black">404</h1>
            <p className="mt-2 text-slate-400">
              We couldn't find that page.
            </p>
          </div>
        }
      />
    </Routes>
  );
}

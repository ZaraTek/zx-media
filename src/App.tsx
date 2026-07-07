import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import ShowPage from "./pages/ShowPage";
import PlayerPage from "./pages/PlayerPage";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/show/:showId" element={<ShowPage />} />
          <Route path="/watch/:showId/:episodeId" element={<PlayerPage />} />
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
      </main>
      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        zx<span className="text-[var(--color-accent-bright)]">media</span> ·
        Demo streaming library · All titles are fictional.
      </footer>
    </div>
  );
}

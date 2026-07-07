import { Outlet } from "react-router-dom";
import UniversalNavbar from "../components/UniversalNavbar";
import PageTransition from "../components/PageTransition";
import ScrollToTop from "../components/ScrollToTop";

export default function BooksLayout() {
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
        zx<span className="text-purple-400">media</span> · Books powered by{" "}
        <a
          href="https://openlibrary.org"
          target="_blank"
          rel="noreferrer"
          className="underline transition hover:text-slate-300"
        >
          Open Library
        </a>
      </footer>
    </div>
  );
}


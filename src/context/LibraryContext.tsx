import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "zx-media:library";

interface LibraryContextValue {
  library: string[];
  isInLibrary: (showId: string) => boolean;
  addToLibrary: (showId: string) => void;
  removeFromLibrary: (showId: string) => void;
  toggleLibrary: (showId: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(
  undefined
);

function readInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<string[]>(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch {
      /* ignore storage errors */
    }
  }, [library]);

  const isInLibrary = useCallback(
    (showId: string) => library.includes(showId),
    [library]
  );

  const addToLibrary = useCallback((showId: string) => {
    setLibrary((prev) => (prev.includes(showId) ? prev : [...prev, showId]));
  }, []);

  const removeFromLibrary = useCallback((showId: string) => {
    setLibrary((prev) => prev.filter((id) => id !== showId));
  }, []);

  const toggleLibrary = useCallback((showId: string) => {
    setLibrary((prev) =>
      prev.includes(showId)
        ? prev.filter((id) => id !== showId)
        : [...prev, showId]
    );
  }, []);

  const value = useMemo(
    () => ({
      library,
      isInLibrary,
      addToLibrary,
      removeFromLibrary,
      toggleLibrary,
    }),
    [library, isInLibrary, addToLibrary, removeFromLibrary, toggleLibrary]
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return ctx;
}

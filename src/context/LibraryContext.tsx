import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  googleSignIn,
  pullRemoteLibrary,
  pushRemoteLibrary,
  type GoogleUser,
} from "../data/sync";
import type { WatchProgress } from "../types";

const LIBRARY_STORAGE_KEY = "zx-media:library";
const WATCH_PROGRESS_STORAGE_KEY = "zx-media:watch-progress";
const GOOGLE_USER_STORAGE_KEY = "zx-media:google-user";

type WatchProgressMap = Record<string, WatchProgress>;

function isWatchProgress(value: unknown): value is WatchProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.showId === "string" &&
    typeof v.episodeId === "string" &&
    Number.isFinite(v.seasonNumber) &&
    Number.isFinite(v.episodeNumber) &&
    Number.isFinite(v.updatedAt)
  );
}

function progressArrayToMap(list: WatchProgress[]): WatchProgressMap {
  const map: WatchProgressMap = {};
  for (const entry of list) {
    if (isWatchProgress(entry)) map[entry.showId] = entry;
  }
  return map;
}

function mergeProgress(
  a: WatchProgressMap,
  b: WatchProgressMap
): WatchProgressMap {
  const merged: WatchProgressMap = { ...a };
  for (const [showId, entry] of Object.entries(b)) {
    const existing = merged[showId];
    if (!existing || entry.updatedAt > existing.updatedAt) {
      merged[showId] = entry;
    }
  }
  return merged;
}

type SyncStatus = "idle" | "syncing" | "error";

interface LibraryContextValue {
  library: string[];
  continueWatching: WatchProgress[];
  isSyncEnabled: boolean;
  syncUserEmail: string | null;
  syncStatus: SyncStatus;
  syncError: string | null;
  isInLibrary: (showId: string) => boolean;
  addToLibrary: (showId: string) => void;
  removeFromLibrary: (showId: string) => void;
  toggleLibrary: (showId: string) => void;
  isBookInLibrary: (bookId: string) => boolean;
  addBookToLibrary: (bookId: string) => void;
  removeBookFromLibrary: (bookId: string) => void;
  toggleBookLibrary: (bookId: string) => void;
  recordWatch: (entry: Omit<WatchProgress, "updatedAt">) => void;
  removeWatch: (showId: string) => void;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => void;
  syncNow: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(
  undefined
);

function readInitial(): string[] {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function readInitialProgress(): WatchProgressMap {
  try {
    const raw = localStorage.getItem(WATCH_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return progressArrayToMap(parsed);
    if (parsed && typeof parsed === "object") {
      return progressArrayToMap(Object.values(parsed) as WatchProgress[]);
    }
    return {};
  } catch {
    return {};
  }
}

function readGoogleUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(GOOGLE_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.jwt === "string" &&
      typeof parsed.email === "string"
    ) {
      return { jwt: parsed.jwt, email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<string[]>(readInitial);
  const [watchProgress, setWatchProgress] =
    useState<WatchProgressMap>(readInitialProgress);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(readGoogleUser);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const skipNextAutoSyncRef = useRef(false);
  const hasLoadedRemoteRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    } catch {
      /* ignore storage errors */
    }
  }, [library]);

  useEffect(() => {
    try {
      localStorage.setItem(
        WATCH_PROGRESS_STORAGE_KEY,
        JSON.stringify(Object.values(watchProgress))
      );
    } catch {
      /* ignore storage errors */
    }
  }, [watchProgress]);

  useEffect(() => {
    try {
      if (!googleUser) {
        localStorage.removeItem(GOOGLE_USER_STORAGE_KEY);
        return;
      }
      localStorage.setItem(GOOGLE_USER_STORAGE_KEY, JSON.stringify(googleUser));
    } catch {
      /* ignore storage errors */
    }
  }, [googleUser]);

  useEffect(() => {
    if (!googleUser || hasLoadedRemoteRef.current) {
      return;
    }

    const user = googleUser;

    let active = true;

    async function hydrateFromRemote() {
      setSyncStatus("syncing");
      setSyncError(null);

      try {
        const result = await pullRemoteLibrary(user.jwt);
        if (!active) return;
        skipNextAutoSyncRef.current = true;
        setLibrary(result.library);
        setWatchProgress((prev) =>
          mergeProgress(prev, progressArrayToMap(result.watchProgress ?? []))
        );
        setSyncStatus("idle");
        hasLoadedRemoteRef.current = true;
      } catch (err) {
        if (!active) return;
        setSyncStatus("error");
        setSyncError(
          err instanceof Error ? err.message : "Could not sync from cloud"
        );
      }
    }

    void hydrateFromRemote();

    return () => {
      active = false;
    };
  }, [googleUser]);

  useEffect(() => {
    if (!googleUser || !hasLoadedRemoteRef.current) {
      return;
    }

    const user = googleUser;

    if (skipNextAutoSyncRef.current) {
      skipNextAutoSyncRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        setSyncStatus("syncing");
        setSyncError(null);

        try {
          await pushRemoteLibrary(
            user.jwt,
            library,
            Object.values(watchProgress)
          );
          setSyncStatus("idle");
        } catch (err) {
          setSyncStatus("error");
          setSyncError(
            err instanceof Error ? err.message : "Could not sync to cloud"
          );
        }
      })();
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [googleUser, library, watchProgress]);

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

  const isBookInLibrary = useCallback(
    (bookId: string) => library.includes(`book:${bookId}`),
    [library]
  );

  const addBookToLibrary = useCallback((bookId: string) => {
    setLibrary((prev) => {
      const prefixed = `book:${bookId}`;
      return prev.includes(prefixed) ? prev : [...prev, prefixed];
    });
  }, []);

  const removeBookFromLibrary = useCallback((bookId: string) => {
    setLibrary((prev) => prev.filter((id) => id !== `book:${bookId}`));
  }, []);

  const toggleBookLibrary = useCallback((bookId: string) => {
    setLibrary((prev) => {
      const prefixed = `book:${bookId}`;
      return prev.includes(prefixed)
        ? prev.filter((id) => id !== prefixed)
        : [...prev, prefixed];
    });
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    setSyncStatus("syncing");
    setSyncError(null);

    try {
      const user = await googleSignIn(idToken);
      const { library: remoteLibrary, watchProgress: remoteProgress } =
        await pullRemoteLibrary(user.jwt);

      hasLoadedRemoteRef.current = true;
      skipNextAutoSyncRef.current = true;
      setGoogleUser(user);

      const mergedProgress = mergeProgress(
        watchProgress,
        progressArrayToMap(remoteProgress ?? [])
      );
      setWatchProgress(mergedProgress);

      const nextLibrary = remoteLibrary.length > 0 ? remoteLibrary : library;
      if (remoteLibrary.length > 0) {
        setLibrary(remoteLibrary);
      }

      await pushRemoteLibrary(
        user.jwt,
        nextLibrary,
        Object.values(mergedProgress)
      );

      setSyncStatus("idle");
    } catch (err) {
      setSyncStatus("error");
      setSyncError(err instanceof Error ? err.message : "Could not sign in with Google");
    }
  }, [library, watchProgress]);

  const signOut = useCallback(() => {
    setGoogleUser(null);
    setSyncStatus("idle");
    setSyncError(null);
    hasLoadedRemoteRef.current = false;
  }, []);

  const syncNow = useCallback(async () => {
    if (!googleUser) return;

    setSyncStatus("syncing");
    setSyncError(null);

    try {
      await pushRemoteLibrary(
        googleUser.jwt,
        library,
        Object.values(watchProgress)
      );
      setSyncStatus("idle");
    } catch (err) {
      setSyncStatus("error");
      setSyncError(err instanceof Error ? err.message : "Could not sync to cloud");
    }
  }, [googleUser, library, watchProgress]);

  const recordWatch = useCallback(
    (entry: Omit<WatchProgress, "updatedAt">) => {
      setWatchProgress((prev) => ({
        ...prev,
        [entry.showId]: { ...entry, updatedAt: Date.now() },
      }));
    },
    []
  );

  const removeWatch = useCallback((showId: string) => {
    setWatchProgress((prev) => {
      if (!(showId in prev)) return prev;
      const next = { ...prev };
      delete next[showId];
      return next;
    });
  }, []);

  const continueWatching = useMemo(
    () =>
      Object.values(watchProgress).sort((a, b) => b.updatedAt - a.updatedAt),
    [watchProgress]
  );

  const value = useMemo(
    () => ({
      library,
      continueWatching,
      isSyncEnabled: Boolean(googleUser),
      syncUserEmail: googleUser?.email ?? null,
      syncStatus,
      syncError,
      isInLibrary,
      addToLibrary,
      removeFromLibrary,
      toggleLibrary,
      isBookInLibrary,
      addBookToLibrary,
      removeBookFromLibrary,
      toggleBookLibrary,
      recordWatch,
      removeWatch,
      signInWithGoogle,
      signOut,
      syncNow,
    }),
    [
      library,
      continueWatching,
      googleUser,
      syncStatus,
      syncError,
      isInLibrary,
      addToLibrary,
      removeFromLibrary,
      toggleLibrary,
      isBookInLibrary,
      addBookToLibrary,
      removeBookFromLibrary,
      toggleBookLibrary,
      recordWatch,
      removeWatch,
      signInWithGoogle,
      signOut,
      syncNow,
    ]
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

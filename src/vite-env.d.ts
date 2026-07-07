/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly TMDB_API_KEY?: string;
  readonly VITE_TMDB_API_KEY?: string;
  readonly VITE_VIDSRC_BASE_URL?: string;
  readonly GOOGLE_CLIENT_ID?: string;
  readonly VITE_SYNC_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL. Set in the .env at the repo root. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

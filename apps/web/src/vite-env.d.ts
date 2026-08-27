/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Bazowy adres API. Ustawiany w .env w rootcie repo. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

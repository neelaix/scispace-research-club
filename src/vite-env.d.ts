/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_APPS_SCRIPT_URL?: string;
  readonly VITE_EVENT_DATE?: string;
  readonly VITE_EVENT_TIME?: string;
  readonly VITE_EVENT_VENUE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

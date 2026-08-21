/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POWERBI_EMBED_URL?: string;
  readonly VITE_COMPANY_LOGO?: string;
  readonly VITE_COMPANY_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

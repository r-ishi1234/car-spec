/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API のオリジン（例: https://api.example.com）。未設定時は相対パス /api（Vite プロキシ） */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

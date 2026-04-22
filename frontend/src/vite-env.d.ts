/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 生产环境可设为完整后端地址，如 https://api.example.com；开发留空则走 Vite 代理 */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

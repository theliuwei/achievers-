/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 生产环境可设为完整后端地址，如 https://api.example.com；开发留空则走 Vite 代理 */
  readonly VITE_API_BASE_URL?: string
  /**
   * 应用默认主题主色（#RGB 或 #RRGGBB）。构建时注入；未设置时与 Ant Design 默认主色 #1677ff 一致。
   * Default theme primary at build time (#RGB or #RRGGBB). Falls back to #1677ff when unset.
   */
  readonly VITE_THEME_PRIMARY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

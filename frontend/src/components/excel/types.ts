import type { ButtonProps } from 'antd'
import type { UploadProps } from 'antd'
import type { CSSProperties, ReactNode } from 'react'

/** 上传由组件调用，传入所选文件 */
export type ImportExcelApi = (file: File) => Promise<unknown>

export interface ImportExcelProps {
  /** 上传逻辑（例如 FormData POST 到后端） */
  api: ImportExcelApi
  /** 模板下载地址（支持绝对 URL 或以 `/` 开头的路径，相对路径会经 Vite 代理 / API 基址拼接） */
  templateUrl: string
  /** 上传成功（含业务接口 resolve）后触发 */
  onSuccess?: (result: unknown) => void
  /** 使用拖拽区域或普通按钮选择文件 */
  variant?: 'dragger' | 'button'
  /** 透传 Upload（已占用 customRequest、beforeUpload、maxCount 等时请避免冲突） */
  uploadProps?: Omit<
    UploadProps,
    | 'customRequest'
    | 'beforeUpload'
    | 'maxCount'
    | 'accept'
    | 'multiple'
    | 'children'
    | 'defaultFileList'
  >
  className?: string
  style?: CSSProperties
}

export interface ExportExcelProps<P extends Record<string, unknown> = Record<string, unknown>> {
  /** 返回 Excel 二进制（失败应 throw 或 reject） */
  api: (params: P, options?: { signal?: AbortSignal }) => Promise<Blob>
  params: P
  /** 保存文件名，可带或不带 `.xlsx` 后缀 */
  fileName: string
  /** 透传 Button（`loading`、`onClick` 由组件接管） */
  buttonProps?: Omit<ButtonProps, 'loading' | 'onClick'>
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

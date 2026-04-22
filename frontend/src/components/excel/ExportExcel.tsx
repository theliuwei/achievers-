import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, message } from 'antd'
import type { ExportExcelProps } from './types'

/** 无扩展名时默认 `.xlsx`；已含 `.xlsx`/`.csv` 等则保持原样 */
function resolveDownloadFileName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed.includes('.')) {
    return `${trimmed}.xlsx`
  }
  return trimmed
}

export function ExportExcel<P extends Record<string, unknown> = Record<string, unknown>>({
  api,
  params,
  fileName,
  buttonProps,
  children = '导出 Excel',
  className,
  style,
}: ExportExcelProps<P>) {
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    [],
  )

  const handleClick = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    try {
      const blob = await api(params, { signal: controller.signal })
      const url = URL.createObjectURL(blob)
      try {
        const a = document.createElement('a')
        a.href = url
        a.download = resolveDownloadFileName(fileName)
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        a.remove()
        message.success('导出成功')
      } finally {
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      message.error('导出失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [api, params, fileName])

  return (
    <Button
      {...buttonProps}
      type={buttonProps?.type ?? 'primary'}
      loading={loading}
      onClick={() => void handleClick()}
      className={[buttonProps?.className, className].filter(Boolean).join(' ') || undefined}
      style={{ ...buttonProps?.style, ...style }}
    >
      {children}
    </Button>
  )
}

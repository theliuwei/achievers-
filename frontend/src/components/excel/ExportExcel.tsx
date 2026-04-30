import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, message } from 'antd'
import { useTranslation } from 'react-i18next'
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
  children,
  className,
  style,
}: ExportExcelProps<P>) {
  const { t } = useTranslation('common')
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
        message.success(t('excel.export.success'))
      } finally {
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      message.error(t('excel.export.failed'))
    } finally {
      setLoading(false)
    }
  }, [api, params, fileName, t])

  return (
    <Button
      {...buttonProps}
      type={buttonProps?.type ?? 'primary'}
      loading={loading}
      onClick={() => void handleClick()}
      className={[buttonProps?.className, className].filter(Boolean).join(' ') || undefined}
      style={{ ...buttonProps?.style, ...style }}
    >
      {children ?? t('excel.export.button')}
    </Button>
  )
}

import { useCallback, useMemo, useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Button, Space, Typography, Upload, message } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ImportExcelProps } from './types'
import { resolveApiOrAbsoluteUrl } from './resolveUrl'

const ACCEPT =
  '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function ImportExcel({
  api,
  templateUrl,
  onSuccess,
  variant = 'dragger',
  uploadProps,
  className,
  style,
}: ImportExcelProps) {
  const { t } = useTranslation('common')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const resolvedTemplateUrl = useMemo(() => resolveApiOrAbsoluteUrl(templateUrl), [templateUrl])

  const beforeUpload: UploadProps['beforeUpload'] = useCallback((file) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      message.error(t('excel.import.onlyXlsx'))
      return Upload.LIST_IGNORE
    }
    return true
  }, [t])

  const customRequest: UploadProps['customRequest'] = useCallback(
    async (options) => {
      const { file, onError, onSuccess: rcOnSuccess } = options
      const raw = file as UploadFile
      const blob = (raw.originFileObj ?? raw) as File | Blob
      if (!(blob instanceof File)) {
        message.error(t('excel.import.readFailed'))
        onError?.(new Error('invalid file'))
        return
      }
      try {
        const result = await api(blob)
        message.success(t('excel.import.success'))
        onSuccess?.(result)
        rcOnSuccess?.(result)
        setFileList([])
      } catch {
        message.error(t('excel.import.failed'))
        onError?.(new Error('upload failed'))
      }
    },
    [api, onSuccess, t],
  )

  const handleChange: UploadProps['onChange'] = useCallback((info) => {
    setFileList(info.fileList.slice(-1))
  }, [])

  const sharedUploadProps: UploadProps = {
    ...uploadProps,
    accept: ACCEPT,
    maxCount: 1,
    multiple: false,
    fileList,
    beforeUpload,
    customRequest,
    onChange: handleChange,
  }

  return (
    <Space direction="vertical" size="middle" className={className} style={style}>
      {variant === 'dragger' ? (
        <Upload.Dragger {...sharedUploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t('excel.import.dragText')}</p>
          <p className="ant-upload-hint">{t('excel.import.dragHint')}</p>
        </Upload.Dragger>
      ) : (
        <Upload {...sharedUploadProps}>
          <Button>{t('excel.import.selectFile')}</Button>
        </Upload>
      )}
      <Typography.Link href={resolvedTemplateUrl} target="_blank" rel="noopener noreferrer" download>
        {t('excel.import.downloadTemplate')}
      </Typography.Link>
    </Space>
  )
}

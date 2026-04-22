import { useCallback, useMemo, useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Button, Space, Typography, Upload, message } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
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
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const resolvedTemplateUrl = useMemo(() => resolveApiOrAbsoluteUrl(templateUrl), [templateUrl])

  const beforeUpload: UploadProps['beforeUpload'] = useCallback((file) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      message.error('仅支持上传 .xlsx 文件')
      return Upload.LIST_IGNORE
    }
    return true
  }, [])

  const customRequest: UploadProps['customRequest'] = useCallback(
    async (options) => {
      const { file, onError, onSuccess: rcOnSuccess } = options
      const raw = file as UploadFile
      const blob = (raw.originFileObj ?? raw) as File | Blob
      if (!(blob instanceof File)) {
        message.error('无法读取文件')
        onError?.(new Error('invalid file'))
        return
      }
      try {
        const result = await api(blob)
        message.success('上传成功')
        onSuccess?.(result)
        rcOnSuccess?.(result)
        setFileList([])
      } catch {
        message.error('上传失败，请稍后重试')
        onError?.(new Error('upload failed'))
      }
    },
    [api, onSuccess],
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
          <p className="ant-upload-text">点击或拖拽 .xlsx 文件到此区域</p>
          <p className="ant-upload-hint">每次仅可上传 1 个文件，格式为 Excel（.xlsx）</p>
        </Upload.Dragger>
      ) : (
        <Upload {...sharedUploadProps}>
          <Button>选择 .xlsx 文件</Button>
        </Upload>
      )}
      <Typography.Link href={resolvedTemplateUrl} target="_blank" rel="noopener noreferrer" download>
        下载模板
      </Typography.Link>
    </Space>
  )
}

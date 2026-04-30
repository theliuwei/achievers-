import { CloseOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Form, Row, Space, message } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ActionModalProps } from './types'
import { renderProFormFieldControl } from './fieldControls'

const modalFieldColDefaults = {
  xs: { span: 24 },
  sm: { span: 24 },
  md: { span: 24 },
  lg: { span: 24 },
} as const

function isValidationError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'errorFields' in err &&
    Array.isArray((err as { errorFields: unknown }).errorFields)
  )
}

export function ActionModal<T extends Record<string, unknown> = Record<string, unknown>>({
  open,
  onClose,
  title,
  schema,
  initialValues,
  createDefaults,
  api,
  successMessage,
  cardProps,
  formProps,
  gutter = [0, 16],
}: ActionModalProps<T>) {
  const [form] = Form.useForm<T>()
  const [submitting, setSubmitting] = useState(false)
  const { t } = useTranslation('common')

  const isEdit = initialValues !== undefined && initialValues !== null

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }
    if (isEdit) {
      form.setFieldsValue(initialValues as Parameters<typeof form.setFieldsValue>[0])
    } else {
      form.resetFields()
      if (createDefaults && Object.keys(createDefaults).length > 0) {
        form.setFieldsValue(createDefaults as Parameters<typeof form.setFieldsValue>[0])
      }
    }
  }, [open, initialValues, isEdit, createDefaults, form])

  const items = useMemo(
    () =>
      schema.map((field) => {
        const { formItemProps, colProps, name, label, rules } = field
        const mergedCol = { ...modalFieldColDefaults, ...colProps }
        return (
          <Col key={Array.isArray(name) ? name.join('.') : String(name)} {...mergedCol}>
            <Form.Item name={name} label={label} rules={rules} {...formItemProps}>
              {renderProFormFieldControl(field)}
            </Form.Item>
          </Col>
        )
      }),
    [schema],
  )

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      try {
        await api(values as T)
        message.success(successMessage ?? (isEdit ? t('messages.saveSuccess') : t('messages.createSuccess')))
        onClose()
      } catch {
        message.error(t('messages.submitFailed'))
      } finally {
        setSubmitting(false)
      }
    } catch (err) {
      if (isValidationError(err)) {
        return
      }
      throw err
    }
  }

  if (!open) {
    return null
  }

  return (
    <Card
      title={title}
      extra={
        <Button type="text" icon={<CloseOutlined />} aria-label={t('actions.close')} onClick={onClose} />
      }
      {...cardProps}
    >
      <Form form={form} layout="vertical" preserve={false} {...formProps}>
        <Row gutter={gutter}>{items}</Row>
      </Form>
      <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
        <Button type="primary" loading={submitting} onClick={() => void handleSubmit()}>
          {t('actions.confirm')}
        </Button>
      </Space>
    </Card>
  )
}

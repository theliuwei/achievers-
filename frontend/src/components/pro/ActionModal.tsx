import { useEffect, useMemo, useState } from 'react'
import { Col, Form, Modal, Row, message } from 'antd'
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
  modalProps,
  formProps,
  gutter = [0, 16],
}: ActionModalProps<T>) {
  const [form] = Form.useForm<T>()
  const [submitting, setSubmitting] = useState(false)

  const isEdit = initialValues !== undefined && initialValues !== null

  useEffect(() => {
    if (!open) {
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

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      try {
        await api(values as T)
        message.success(successMessage ?? (isEdit ? '保存成功' : '新增成功'))
        onClose()
      } catch {
        message.error('提交失败，请稍后重试')
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

  return (
    <Modal
      {...modalProps}
      open={open}
      title={title}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      destroyOnHidden
      afterClose={() => {
        form.resetFields()
      }}
    >
      <Form form={form} layout="vertical" preserve={false} {...formProps}>
        <Row gutter={gutter}>{items}</Row>
      </Form>
    </Modal>
  )
}

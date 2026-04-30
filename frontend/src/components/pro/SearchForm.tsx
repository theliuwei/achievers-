import { useMemo } from 'react'
import { Button, Col, Flex, Form, Row, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import type { SearchFormProps } from './types'
import { renderProFormFieldControl } from './fieldControls'

const defaultColProps = {
  xs: { span: 24 },
  sm: { span: 12 },
  md: { span: 8 },
  lg: { span: 6 },
  xl: { span: 6 },
} as const

export function SearchForm({
  schema,
  onFinish,
  onReset,
  initialValues,
  formProps,
  gutter = [16, 16],
  className,
  style,
}: SearchFormProps) {
  const [form] = Form.useForm()
  const { t } = useTranslation('common')

  const items = useMemo(
    () =>
      schema.map((field) => {
        const { formItemProps, colProps, name, label, rules } = field
        const mergedCol = { ...defaultColProps, ...colProps }
        return (
          <Col key={Array.isArray(name) ? name.join('.') : String(name)} {...mergedCol}>
            <Form.Item
              name={name}
              label={label}
              rules={rules}
              {...formItemProps}
            >
              {renderProFormFieldControl(field)}
            </Form.Item>
          </Col>
        )
      }),
    [schema],
  )

  const handleReset = () => {
    form.resetFields()
    onReset?.()
  }

  return (
    <div className={className} style={style}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        {...formProps}
      >
        <Flex vertical gap={16}>
          <Row gutter={gutter}>{items}</Row>
          <Flex wrap="wrap" gap={8} justify="flex-end">
            <Space wrap>
              <Button type="primary" htmlType="submit">
                {t('actions.search')}
              </Button>
              <Button htmlType="button" onClick={handleReset}>
                {t('actions.reset')}
              </Button>
            </Space>
          </Flex>
        </Flex>
      </Form>
    </div>
  )
}

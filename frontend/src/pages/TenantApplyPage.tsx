import { BankOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, InputNumber, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { createTenantApplication, type TenantApplicationPayload } from '../api/tenantApplications'

type TenantApplyForm = TenantApplicationPayload & {
  admin_password_confirm: string
}

const TenantApplyPage = () => {
  const { message } = App.useApp()
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: TenantApplyForm) => {
    setLoading(true)
    try {
      await createTenantApplication({
        company_name: values.company_name.trim(),
        company_code: values.company_code.trim().toLowerCase(),
        company_address: values.company_address?.trim() ?? '',
        contact_name: values.contact_name?.trim() ?? '',
        contact_phone: values.contact_phone?.trim() ?? '',
        contact_email: values.contact_email?.trim() ?? '',
        admin_username: values.admin_username.trim(),
        admin_email: values.admin_email.trim(),
        admin_first_name: values.admin_first_name?.trim() ?? '',
        admin_last_name: values.admin_last_name?.trim() ?? '',
        admin_phone: values.admin_phone?.trim() ?? '',
        admin_password: values.admin_password,
        requested_max_members: values.requested_max_members,
        requested_storage_quota_mb: values.requested_storage_quota_mb,
      })
      message.success(t('tenantApply.messages.success'))
      navigate('/login', { replace: true })
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('tenantApply.messages.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ width: '100%', maxWidth: 760 }} title={t('tenantApply.title')}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {t('tenantApply.description')}
      </Typography.Paragraph>
      <Form<TenantApplyForm>
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ requested_max_members: 20, requested_storage_quota_mb: 1024 }}
      >
        <Form.Item name="company_name" label={t('tenantApply.fields.companyName')} rules={[{ required: true, message: t('tenantApply.validation.companyNameRequired') }]}>
          <Input prefix={<BankOutlined />} placeholder={t('tenantApply.placeholders.companyName')} />
        </Form.Item>
        <Form.Item name="company_code" label={t('tenantApply.fields.companyCode')} rules={[{ required: true, message: t('tenantApply.validation.companyCodeRequired') }]}>
          <Input placeholder={t('tenantApply.placeholders.companyCode')} />
        </Form.Item>
        <Form.Item name="company_address" label={t('tenantApply.fields.companyAddress')}>
          <Input.TextArea placeholder={t('tenantApply.placeholders.companyAddress')} autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
        <Form.Item name="contact_name" label={t('tenantApply.fields.contactName')}>
          <Input prefix={<UserOutlined />} placeholder={t('tenantApply.placeholders.contactName')} />
        </Form.Item>
        <Form.Item name="contact_phone" label={t('tenantApply.fields.contactPhone')}>
          <Input prefix={<PhoneOutlined />} placeholder={t('tenantApply.placeholders.contactPhone')} />
        </Form.Item>
        <Form.Item name="contact_email" label={t('tenantApply.fields.contactEmail')} rules={[{ type: 'email', message: t('tenantApply.validation.emailInvalid') }]}>
          <Input prefix={<MailOutlined />} placeholder="company@example.com" />
        </Form.Item>
        <Form.Item name="admin_username" label={t('tenantApply.fields.adminUsername')} rules={[{ required: true, message: t('tenantApply.validation.adminUsernameRequired') }]}>
          <Input prefix={<UserOutlined />} placeholder={t('tenantApply.placeholders.adminUsername')} autoComplete="username" />
        </Form.Item>
        <Form.Item
          name="admin_email"
          label={t('tenantApply.fields.adminEmail')}
          rules={[
            { required: true, message: t('tenantApply.validation.adminEmailRequired') },
            { type: 'email', message: t('tenantApply.validation.emailInvalid') },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="admin@example.com" autoComplete="email" />
        </Form.Item>
        <Form.Item name="admin_first_name" label={t('tenantApply.fields.adminFirstName')}>
          <Input placeholder={t('tenantApply.placeholders.firstName')} autoComplete="given-name" />
        </Form.Item>
        <Form.Item name="admin_last_name" label={t('tenantApply.fields.adminLastName')}>
          <Input placeholder={t('tenantApply.placeholders.lastName')} autoComplete="family-name" />
        </Form.Item>
        <Form.Item name="admin_phone" label={t('tenantApply.fields.adminPhone')}>
          <Input prefix={<PhoneOutlined />} placeholder="+8613800138000" />
        </Form.Item>
        <Form.Item
          name="admin_password"
          label={t('tenantApply.fields.adminPassword')}
          rules={[
            { required: true, message: t('tenantApply.validation.adminPasswordRequired') },
            { min: 8, message: t('tenantApply.validation.passwordMin') },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('tenantApply.placeholders.password')} autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="admin_password_confirm"
          label={t('tenantApply.fields.passwordConfirm')}
          dependencies={['admin_password']}
          hasFeedback
          rules={[
            { required: true, message: t('tenantApply.validation.passwordConfirmRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('admin_password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(t('tenantApply.validation.passwordMismatch')))
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('tenantApply.placeholders.passwordConfirm')} autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="requested_max_members" label={t('tenantApply.fields.requestedMaxMembers')} rules={[{ required: true, message: t('tenantApply.validation.maxMembersRequired') }]}>
          <InputNumber min={1} max={10000} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="requested_storage_quota_mb" label={t('tenantApply.fields.requestedStorageQuota')} rules={[{ required: true, message: t('tenantApply.validation.storageRequired') }]}>
          <InputNumber min={100} max={1024 * 1024} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('tenantApply.actions.submit')}
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {t('tenantApply.hasAccount')} <Link to="/login">{t('tenantApply.actions.login')}</Link>
      </Typography.Paragraph>
    </Card>
  )
}

export default TenantApplyPage

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../auth/useAuth'

type RegisterForm = {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

const RegisterPage = () => {
  const { message } = App.useApp()
  const { access } = useAuth()
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const fromPath = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
  const afterAuthPath = fromPath?.startsWith('/admin') ? fromPath : '/admin'

  if (access) {
    return <Navigate to={afterAuthPath} replace />
  }

  const onFinish = async (values: RegisterForm) => {
    setLoading(true)
    try {
      const submitted = await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirm: values.password_confirm,
        first_name: values.first_name?.trim() || undefined,
        last_name: values.last_name?.trim() || undefined,
      })
      message.success(submitted.detail)
      navigate('/login', { replace: true })
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('register.messages.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ width: '100%', maxWidth: 440 }} title={t('register.title')}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {t('register.description')}
      </Typography.Paragraph>
      <Form<RegisterForm> layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="username"
          label={t('register.fields.username')}
          rules={[{ required: true, message: t('register.validation.usernameRequired') }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('register.placeholders.username')}
            autoComplete="username"
          />
        </Form.Item>
        <Form.Item
          name="email"
          label={t('register.fields.email')}
          rules={[
            { required: true, message: t('register.validation.emailRequired') },
            { type: 'email', message: t('register.validation.emailInvalid') },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="name@example.com"
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item name="first_name" label={t('register.fields.firstNameOptional')}>
          <Input placeholder={t('register.placeholders.firstName')} autoComplete="given-name" />
        </Form.Item>
        <Form.Item name="last_name" label={t('register.fields.lastNameOptional')}>
          <Input placeholder={t('register.placeholders.lastName')} autoComplete="family-name" />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('register.fields.password')}
          rules={[
            { required: true, message: t('register.validation.passwordRequired') },
            { min: 8, message: t('register.validation.passwordMin') },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('register.placeholders.password')}
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          name="password_confirm"
          label={t('register.fields.passwordConfirm')}
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: t('register.validation.passwordConfirmRequired') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(t('register.validation.passwordMismatch')))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('register.placeholders.passwordConfirm')}
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('register.actions.submit')}
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {t('register.hasAccount')} <Link to="/login">{t('register.actions.login')}</Link>
      </Typography.Paragraph>
    </Card>
  )
}

export default RegisterPage

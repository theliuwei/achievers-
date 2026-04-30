import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/useAuth'

type LoginForm = {
  username: string
  password: string
}

const LoginPage = () => {
  const { message } = App.useApp()
  const { access, setTokens } = useAuth()
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const fromPath = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
  const afterAuthPath = fromPath?.startsWith('/admin') ? fromPath : '/admin'

  if (access) {
    return <Navigate to={afterAuthPath} replace />
  }

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const tokens = await login(values.username.trim(), values.password)
      setTokens(tokens)
      message.success(t('login.messages.success'))
      navigate(afterAuthPath, { replace: true })
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('login.messages.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ width: '100%', maxWidth: 400 }} title={t('login.title')}>
      <Form<LoginForm> layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="username"
          label={t('login.fields.username')}
          rules={[{ required: true, message: t('login.validation.usernameRequired') }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={t('login.placeholders.username')}
            autoComplete="username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('login.fields.password')}
          rules={[{ required: true, message: t('login.validation.passwordRequired') }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('login.placeholders.password')}
            autoComplete="current-password"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('login.actions.submit')}
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {t('login.noAccount')} <Link to="/register">{t('login.actions.register')}</Link>
      </Typography.Paragraph>
    </Card>
  )
}

export default LoginPage

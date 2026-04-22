import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
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
      message.success('登录成功')
      navigate(afterAuthPath, { replace: true })
    } catch (e) {
      message.error(e instanceof Error ? e.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ width: '100%', maxWidth: 400 }} title="登录">
      <Form<LoginForm> layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名"
            autoComplete="username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            autoComplete="current-password"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        还没有账号？ <Link to="/register">注册</Link>
      </Typography.Paragraph>
    </Card>
  )
}

export default LoginPage

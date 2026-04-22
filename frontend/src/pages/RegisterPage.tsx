import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
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
      message.error(e instanceof Error ? e.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ width: '100%', maxWidth: 440 }} title="注册">
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        提交后账号将进入待审批状态，管理员通过后方可登录。
      </Typography.Paragraph>
      <Form<RegisterForm> layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="登录用用户名"
            autoComplete="username"
          />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="name@example.com"
            autoComplete="email"
          />
        </Form.Item>
        <Form.Item name="first_name" label="名（选填）">
          <Input placeholder="名" autoComplete="given-name" />
        </Form.Item>
        <Form.Item name="last_name" label="姓（选填）">
          <Input placeholder="姓" autoComplete="family-name" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请设置密码' },
            { min: 8, message: '密码至少 8 位' },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="至少 8 位"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item
          name="password_confirm"
          label="确认密码"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="再次输入密码"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            注册
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        已有账号？ <Link to="/login">登录</Link>
      </Typography.Paragraph>
    </Card>
  )
}

export default RegisterPage

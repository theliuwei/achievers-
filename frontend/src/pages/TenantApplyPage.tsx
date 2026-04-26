import { BankOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, InputNumber, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createTenantApplication, type TenantApplicationPayload } from '../api/tenantApplications'

type TenantApplyForm = TenantApplicationPayload & {
  admin_password_confirm: string
}

const TenantApplyPage = () => {
  const { message } = App.useApp()
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
      message.success('入驻申请已提交，运营审核通过后会开通公司账号。')
      navigate('/login', { replace: true })
    } catch (error) {
      message.error(error instanceof Error ? error.message : '提交入驻申请失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card style={{ width: '100%', maxWidth: 760 }} title="公司入驻申请">
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        请填写公司资料和主管理员账号。审核通过后系统会自动创建租户、主管理员和企业管理员角色。
      </Typography.Paragraph>
      <Form<TenantApplyForm>
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{ requested_max_members: 20, requested_storage_quota_mb: 1024 }}
      >
        <Form.Item name="company_name" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
          <Input prefix={<BankOutlined />} placeholder="例如：深圳某某外贸有限公司" />
        </Form.Item>
        <Form.Item name="company_code" label="公司代码" rules={[{ required: true, message: '请输入公司代码' }]}>
          <Input placeholder="例如：shenzhen-trade，创建后用于租户标识" />
        </Form.Item>
        <Form.Item name="company_address" label="公司地址">
          <Input.TextArea placeholder="请输入公司注册地址或办公地址" autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
        <Form.Item name="contact_name" label="联系人">
          <Input prefix={<UserOutlined />} placeholder="联系人姓名" />
        </Form.Item>
        <Form.Item name="contact_phone" label="联系电话">
          <Input prefix={<PhoneOutlined />} placeholder="联系电话" />
        </Form.Item>
        <Form.Item name="contact_email" label="联系邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
          <Input prefix={<MailOutlined />} placeholder="company@example.com" />
        </Form.Item>
        <Form.Item name="admin_username" label="主管理员用户名" rules={[{ required: true, message: '请输入主管理员用户名' }]}>
          <Input prefix={<UserOutlined />} placeholder="登录用用户名" autoComplete="username" />
        </Form.Item>
        <Form.Item
          name="admin_email"
          label="主管理员邮箱"
          rules={[
            { required: true, message: '请输入主管理员邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="admin@example.com" autoComplete="email" />
        </Form.Item>
        <Form.Item name="admin_first_name" label="主管理员名">
          <Input placeholder="名" autoComplete="given-name" />
        </Form.Item>
        <Form.Item name="admin_last_name" label="主管理员姓">
          <Input placeholder="姓" autoComplete="family-name" />
        </Form.Item>
        <Form.Item name="admin_phone" label="主管理员手机">
          <Input prefix={<PhoneOutlined />} placeholder="+8613800138000" />
        </Form.Item>
        <Form.Item
          name="admin_password"
          label="主管理员初始密码"
          rules={[
            { required: true, message: '请设置主管理员密码' },
            { min: 8, message: '密码至少 8 位' },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="至少 8 位" autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="admin_password_confirm"
          label="确认密码"
          dependencies={['admin_password']}
          hasFeedback
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('admin_password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="再次输入密码" autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="requested_max_members" label="申请员工账号上限" rules={[{ required: true, message: '请输入账号上限' }]}>
          <InputNumber min={1} max={10000} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="requested_storage_quota_mb" label="申请附件容量上限(MB)" rules={[{ required: true, message: '请输入容量上限' }]}>
          <InputNumber min={100} max={1024 * 1024} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            提交入驻申请
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        已有账号？ <Link to="/login">登录</Link>
      </Typography.Paragraph>
    </Card>
  )
}

export default TenantApplyPage

import {
  AlipayCircleOutlined,
  DingdingOutlined,
  TaobaoCircleOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  List,
  Menu,
  Modal,
  Select,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  changePassword,
  DEFAULT_AVATAR_URL,
  updateMe,
  uploadAvatar,
  type MeUpdatePayload,
} from '../../api/me'
import { useAuth } from '../../auth/useAuth'
import './ProfilePage.css'

type ProfileFormValues = Partial<MeUpdatePayload> & {
  bio?: string
  country?: string
  province?: string
  city?: string
  address?: string
}

type PasswordFormValues = {
  old_password: string
  new_password: string
  confirm_password: string
}

type BindingProvider = 'taobao' | 'alipay' | 'dingtalk'
type NotificationKind = 'userMessages' | 'systemMessages' | 'todoTasks'

const genderOptions = [
  { label: '未设置', value: '' },
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '其他', value: 'other' },
]

const maskText = (value?: string, keepStart = 3, keepEnd = 3) => {
  if (!value) return '未设置'
  if (value.length <= keepStart + keepEnd) return value
  return `${value.slice(0, keepStart)}****${value.slice(-keepEnd)}`
}

const getDisplayName = (values: ProfileFormValues, username?: string) => {
  const fullName = [values.last_name, values.first_name].filter(Boolean).join('')
  return fullName || username || values.email || '用户'
}

const initialBindingState: Record<BindingProvider, boolean> = {
  taobao: false,
  alipay: false,
  dingtalk: false,
}

const initialNotificationState: Record<NotificationKind, boolean> = {
  userMessages: true,
  systemMessages: true,
  todoTasks: true,
}

const ProfilePage = () => {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<ProfileFormValues>()
  const [passwordForm] = Form.useForm<PasswordFormValues>()
  const { logout, refreshUser, user } = useAuth()
  const [activeKey, setActiveKey] = useState('basic')
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [bindingState, setBindingState] = useState(initialBindingState)
  const [notificationState, setNotificationState] = useState(initialNotificationState)
  const avatarUrl = Form.useWatch('avatar_url', form)
  const formValues = Form.useWatch([], form) ?? {}
  const resolvedAvatarUrl = avatarUrl || DEFAULT_AVATAR_URL

  useEffect(() => {
    if (!user) {
      return
    }
    form.setFieldsValue({
      email: user.email,
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      avatar_url: user.avatar_url ?? '',
      gender: user.gender ?? '',
      phone: user.phone ?? '',
      country: '中国',
    })
  }, [form, user])

  const displayName = getDisplayName(formValues, user?.username)
  const avatarText = displayName.trim().slice(0, 1).toUpperCase()

  const onFinish = async (values: ProfileFormValues) => {
    setSaving(true)
    try {
      await updateMe({
        email: values.email?.trim(),
        first_name: values.first_name?.trim(),
        last_name: values.last_name?.trim(),
        avatar_url: values.avatar_url?.trim(),
        gender: values.gender ?? '',
        phone: values.phone?.trim(),
      })
      await refreshUser()
      message.success('个人信息已更新')
    } catch (e) {
      message.error(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const beforeAvatarUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件')
      return Upload.LIST_IGNORE
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error('头像文件不能超过 2MB')
      return Upload.LIST_IGNORE
    }
    return true
  }

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true)
    try {
      const nextUser = await uploadAvatar(file)
      form.setFieldValue('avatar_url', nextUser.avatar_url ?? '')
      await refreshUser()
      message.success('头像已更新')
    } catch (e) {
      message.error(e instanceof Error ? e.message : '头像上传失败')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    const values = await passwordForm.validateFields()
    setPasswordSaving(true)
    try {
      await changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      })
      message.success('密码已更新，请重新登录')
      setPasswordModalOpen(false)
      passwordForm.resetFields()
      logout()
      navigate('/login', { replace: true })
    } catch (e) {
      message.error(e instanceof Error ? e.message : '密码修改失败')
    } finally {
      setPasswordSaving(false)
    }
  }

  const toggleBinding = (provider: BindingProvider) => {
    setBindingState((current) => {
      const next = !current[provider]
      const providerName = {
        taobao: '淘宝',
        alipay: '支付宝',
        dingtalk: '钉钉',
      }[provider]
      message.success(next ? `${providerName}账号已绑定` : `${providerName}账号已解绑`)
      return { ...current, [provider]: next }
    })
  }

  const toggleNotification = (kind: NotificationKind, checked: boolean) => {
    setNotificationState((current) => ({ ...current, [kind]: checked }))
    message.success(checked ? '已开启消息通知' : '已关闭消息通知')
  }

  const renderBasicSettings = () => (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        基本设置
      </Typography.Title>

      <div className="profile-page-content">
        <Form<ProfileFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" allowClear />
          </Form.Item>

          <Form.Item name="last_name" label="姓">
            <Input placeholder="请输入姓" allowClear />
          </Form.Item>

          <Form.Item name="first_name" label="名">
            <Input placeholder="请输入名" allowClear />
          </Form.Item>

          <Form.Item name="bio" label="个人简介">
            <Input.TextArea rows={4} placeholder="个人简介" showCount maxLength={120} />
          </Form.Item>

          <Form.Item name="gender" label="性别">
            <Select options={genderOptions} />
          </Form.Item>

          <Form.Item name="country" label="国家/地区">
            <Select options={[{ label: '中国', value: '中国' }]} />
          </Form.Item>

          <Form.Item label="所在省市">
            <Input.Group compact>
              <Form.Item name="province" noStyle>
                <Input placeholder="请选择省" style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item name="city" noStyle>
                <Input placeholder="请选择市" style={{ width: '50%' }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item name="address" label="街道地址">
            <Input placeholder="请输入街道地址" allowClear />
          </Form.Item>

          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" allowClear />
          </Form.Item>

          <Form.Item name="avatar_url" label="头像地址">
            <Input placeholder="https://example.com/avatar.png" allowClear />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={saving}>
            更新基本信息
          </Button>
        </Form>

        <div className="profile-avatar-panel">
          <div className="profile-avatar-title">头像</div>
          <Avatar
            className="profile-avatar"
            size={112}
            src={resolvedAvatarUrl}
            icon={resolvedAvatarUrl ? undefined : <UserOutlined />}
          >
            {resolvedAvatarUrl ? null : avatarText}
          </Avatar>
          <div>
            <Upload
              accept="image/*"
              beforeUpload={beforeAvatarUpload}
              customRequest={({ file, onSuccess, onError }) => {
                void handleAvatarUpload(file as File)
                  .then(() => onSuccess?.('ok'))
                  .catch((error: unknown) => onError?.(error as Error))
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} loading={avatarUploading}>
                更换头像
              </Button>
            </Upload>
          </div>
          <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
            支持 JPG、PNG、GIF、WebP，文件大小不超过 2MB。
          </Typography.Paragraph>
        </div>
      </div>
    </>
  )

  const renderSecuritySettings = () => (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        安全设置
      </Typography.Title>
      <List
        className="profile-security-list"
        itemLayout="horizontal"
        dataSource={[
          {
            title: '账户密码',
            description: '当前密码强度：强',
            action: (
              <Button type="link" onClick={() => setPasswordModalOpen(true)}>
                修改
              </Button>
            ),
          },
          {
            title: '密保手机',
            description: user?.phone ? `已绑定手机：${maskText(user.phone, 3, 4)}` : '未绑定手机',
            action: (
              <Button type="link" onClick={() => setActiveKey('basic')}>
                修改
              </Button>
            ),
          },
          {
            title: '密保问题',
            description: '未设置密保问题，密保问题可有效保护账户安全',
            action: <Button type="link">设置</Button>,
          },
          {
            title: '备用邮箱',
            description: user?.email ? `已绑定邮箱：${maskText(user.email, 3, 8)}` : '未绑定邮箱',
            action: (
              <Button type="link" onClick={() => setActiveKey('basic')}>
                修改
              </Button>
            ),
          },
          {
            title: 'MFA 设备',
            description: '未绑定 MFA 设备，绑定后可进行二次确认',
            action: <Button type="link">绑定</Button>,
          },
        ]}
        renderItem={(item) => (
          <List.Item actions={[item.action]}>
            <List.Item.Meta
              title={
                <span>
                  {item.title}
                  {item.title === '账户密码' ? <Tag color="green">已保护</Tag> : null}
                </span>
              }
              description={item.description}
            />
          </List.Item>
        )}
      />

      <Modal
        title="修改账户密码"
        open={passwordModalOpen}
        confirmLoading={passwordSaving}
        okText="保存"
        onOk={() => void handlePasswordSubmit()}
        onCancel={() => {
          setPasswordModalOpen(false)
          passwordForm.resetFields()
        }}
      >
        <Form<PasswordFormValues> form={passwordForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="old_password"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码至少 8 位' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )

  const renderBindingSettings = () => (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        账号绑定
      </Typography.Title>
      <List
        className="profile-security-list"
        itemLayout="horizontal"
        dataSource={[
          {
            key: 'taobao' as const,
            icon: <TaobaoCircleOutlined className="profile-binding-icon profile-binding-taobao" />,
            title: '绑定淘宝',
            boundText: '当前已绑定淘宝账号',
            unboundText: '当前未绑定淘宝账号',
          },
          {
            key: 'alipay' as const,
            icon: <AlipayCircleOutlined className="profile-binding-icon profile-binding-alipay" />,
            title: '绑定支付宝',
            boundText: '当前已绑定支付宝账号',
            unboundText: '当前未绑定支付宝账号',
          },
          {
            key: 'dingtalk' as const,
            icon: <DingdingOutlined className="profile-binding-icon profile-binding-dingtalk" />,
            title: '绑定钉钉',
            boundText: '当前已绑定钉钉账号',
            unboundText: '当前未绑定钉钉账号',
          },
        ]}
        renderItem={(item) => {
          const isBound = bindingState[item.key]
          return (
            <List.Item
              actions={[
                <Button type="link" onClick={() => toggleBinding(item.key)}>
                  {isBound ? '解绑' : '绑定'}
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={isBound ? item.boundText : item.unboundText}
              />
            </List.Item>
          )
        }}
      />
    </>
  )

  const renderNotificationSettings = () => (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        新消息通知
      </Typography.Title>
      <List
        className="profile-security-list"
        itemLayout="horizontal"
        dataSource={[
          {
            key: 'userMessages' as const,
            title: '用户消息',
            description: '其他用户的消息将以站内信的形式通知',
          },
          {
            key: 'systemMessages' as const,
            title: '系统消息',
            description: '系统消息将以站内信的形式通知',
          },
          {
            key: 'todoTasks' as const,
            title: '待办任务',
            description: '待办任务将以站内信的形式通知',
          },
        ]}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Switch
                checkedChildren="开"
                unCheckedChildren="关"
                checked={notificationState[item.key]}
                onChange={(checked) => toggleNotification(item.key, checked)}
              />,
            ]}
          >
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </>
  )

  const renderActivePanel = () => {
    if (activeKey === 'security') {
      return renderSecuritySettings()
    }
    if (activeKey === 'binding') {
      return renderBindingSettings()
    }
    if (activeKey === 'notifications') {
      return renderNotificationSettings()
    }
    return renderBasicSettings()
  }

  return (
    <Card bordered={false} className="profile-page-card">
      <div className="profile-page">
        <Menu
          className="profile-page-menu"
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={({ key }) => setActiveKey(String(key))}
          items={[
            { key: 'basic', label: '基本设置' },
            { key: 'security', label: '安全设置' },
            { key: 'binding', label: '账号绑定' },
            { key: 'notifications', label: '新消息通知' },
          ]}
        />

        <div>{renderActivePanel()}</div>
      </div>
    </Card>
  )
}

export default ProfilePage

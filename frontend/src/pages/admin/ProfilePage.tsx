import {
  AlipayCircleOutlined,
  CloseOutlined,
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
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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

const maskText = (value?: string, keepStart = 3, keepEnd = 3) => {
  if (!value) return '-'
  if (value.length <= keepStart + keepEnd) return value
  return `${value.slice(0, keepStart)}****${value.slice(-keepEnd)}`
}

const getDisplayName = (values: ProfileFormValues, username?: string) => {
  const fullName = [values.last_name, values.first_name].filter(Boolean).join('')
  return fullName || username || values.email || 'User'
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
  const { t } = useTranslation('common')
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

  const genderOptions = [
    { label: t('profile.gender.unset'), value: '' },
    { label: t('profile.gender.male'), value: 'male' },
    { label: t('profile.gender.female'), value: 'female' },
    { label: t('profile.gender.other'), value: 'other' },
  ]

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
      country: t('profile.countryDefault'),
    })
  }, [form, t, user])

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
      message.success(t('profile.messages.profileUpdated'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('messages.submitFailed'))
    } finally {
      setSaving(false)
    }
  }

  const beforeAvatarUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error(t('profile.messages.selectImage'))
      return Upload.LIST_IGNORE
    }
    if (file.size > 2 * 1024 * 1024) {
      message.error(t('profile.messages.avatarTooLarge'))
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
      message.success(t('profile.messages.avatarUpdated'))
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('profile.messages.avatarUploadFailed'))
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
      message.success(t('profile.messages.passwordUpdated'))
      setPasswordModalOpen(false)
      passwordForm.resetFields()
      logout()
      navigate('/login', { replace: true })
    } catch (e) {
      message.error(e instanceof Error ? e.message : t('profile.messages.passwordUpdateFailed'))
    } finally {
      setPasswordSaving(false)
    }
  }

  const toggleBinding = (provider: BindingProvider) => {
    setBindingState((current) => {
      const next = !current[provider]
      const providerName = {
        taobao: t('profile.binding.taobao'),
        alipay: t('profile.binding.alipay'),
        dingtalk: t('profile.binding.dingtalk'),
      }[provider]
      message.success(next ? t('profile.messages.bindingOn', { provider: providerName }) : t('profile.messages.bindingOff', { provider: providerName }))
      return { ...current, [provider]: next }
    })
  }

  const toggleNotification = (kind: NotificationKind, checked: boolean) => {
    setNotificationState((current) => ({ ...current, [kind]: checked }))
    message.success(checked ? t('profile.messages.notificationOn') : t('profile.messages.notificationOff'))
  }

  const renderBasicSettings = () => (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t('profile.menu.basic')}
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
            label={t('user.fields.email')}
            rules={[
              { required: true, message: t('user.validation.emailRequired') },
              { type: 'email', message: t('profile.validation.emailInvalid') },
            ]}
          >
            <Input placeholder={t('profile.placeholder.email')} allowClear />
          </Form.Item>

          <Form.Item name="last_name" label={t('user.fields.lastName')}>
            <Input placeholder={t('profile.placeholder.lastName')} allowClear />
          </Form.Item>

          <Form.Item name="first_name" label={t('user.fields.firstName')}>
            <Input placeholder={t('profile.placeholder.firstName')} allowClear />
          </Form.Item>

          <Form.Item name="bio" label={t('profile.fields.bio')}>
            <Input.TextArea rows={4} placeholder={t('profile.placeholder.bio')} showCount maxLength={120} />
          </Form.Item>

          <Form.Item name="gender" label={t('profile.fields.gender')}>
            <Select options={genderOptions} />
          </Form.Item>

          <Form.Item name="country" label={t('profile.fields.countryRegion')}>
            <Select options={[{ label: t('profile.countryDefault'), value: t('profile.countryDefault') }]} />
          </Form.Item>

          <Form.Item label={t('profile.fields.provinceCity')}>
            <Input.Group compact>
              <Form.Item name="province" noStyle>
                <Input placeholder={t('profile.placeholder.province')} style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item name="city" noStyle>
                <Input placeholder={t('profile.placeholder.city')} style={{ width: '50%' }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item name="address" label={t('profile.fields.address')}>
            <Input placeholder={t('profile.placeholder.address')} allowClear />
          </Form.Item>

          <Form.Item name="phone" label={t('profile.fields.phone')}>
            <Input placeholder={t('profile.placeholder.phone')} allowClear />
          </Form.Item>

          <Form.Item name="avatar_url" label={t('profile.fields.avatarUrl')}>
            <Input placeholder="https://example.com/avatar.png" allowClear />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={saving}>
            {t('profile.actions.updateBasic')}
          </Button>
        </Form>

        <div className="profile-avatar-panel">
          <div className="profile-avatar-title">{t('profile.fields.avatar')}</div>
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
                {t('profile.actions.changeAvatar')}
              </Button>
            </Upload>
          </div>
          <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
            {t('profile.avatarHelp')}
          </Typography.Paragraph>
        </div>
      </div>
    </>
  )

  const renderSecuritySettings = () => (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t('profile.menu.security')}
      </Typography.Title>
      <List
        className="profile-security-list"
        itemLayout="horizontal"
        dataSource={[
          {
            title: t('profile.security.password'),
            description: t('profile.security.passwordStrength'),
            action: (
              <Button type="link" onClick={() => setPasswordModalOpen(true)}>
                {t('profile.actions.edit')}
              </Button>
            ),
          },
          {
            title: t('profile.security.securePhone'),
            description: user?.phone ? t('profile.security.boundPhone', { value: maskText(user.phone, 3, 4) }) : t('profile.security.unboundPhone'),
            action: (
              <Button type="link" onClick={() => setActiveKey('basic')}>
                {t('profile.actions.edit')}
              </Button>
            ),
          },
          {
            title: t('profile.security.secureQuestion'),
            description: t('profile.security.secureQuestionDesc'),
            action: <Button type="link">{t('profile.actions.setup')}</Button>,
          },
          {
            title: t('profile.security.backupEmail'),
            description: user?.email ? t('profile.security.boundEmail', { value: maskText(user.email, 3, 8) }) : t('profile.security.unboundEmail'),
            action: (
              <Button type="link" onClick={() => setActiveKey('basic')}>
                {t('profile.actions.edit')}
              </Button>
            ),
          },
          {
            title: t('profile.security.mfaDevice'),
            description: t('profile.security.mfaDesc'),
            action: <Button type="link">{t('profile.actions.bind')}</Button>,
          },
        ]}
        renderItem={(item) => (
          <List.Item actions={[item.action]}>
            <List.Item.Meta
              title={
                <span>
                  {item.title}
                  {item.title === t('profile.security.password') ? <Tag color="green">{t('profile.security.protected')}</Tag> : null}
                </span>
              }
              description={item.description}
            />
          </List.Item>
        )}
      />

      {passwordModalOpen ? (
        <Card
          title={t('profile.security.changePassword')}
          style={{ marginTop: 16 }}
          extra={
            <Button
              type="text"
              icon={<CloseOutlined />}
              aria-label={t('actions.close')}
              onClick={() => {
                setPasswordModalOpen(false)
                passwordForm.resetFields()
              }}
            />
          }
        >
          <Form<PasswordFormValues> form={passwordForm} layout="vertical" requiredMark={false}>
            <Form.Item
              name="old_password"
              label={t('profile.security.currentPassword')}
              rules={[{ required: true, message: t('profile.validation.currentPasswordRequired') }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="new_password"
              label={t('profile.security.newPassword')}
              rules={[
                { required: true, message: t('profile.validation.newPasswordRequired') },
                { min: 8, message: t('profile.validation.passwordMinLength') },
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirm_password"
              label={t('profile.security.confirmPassword')}
              dependencies={['new_password']}
              rules={[
                { required: true, message: t('profile.validation.confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error(t('profile.validation.passwordNotMatch')))
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Form>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              onClick={() => {
                setPasswordModalOpen(false)
                passwordForm.resetFields()
              }}
            >
              {t('actions.cancel')}
            </Button>
            <Button type="primary" loading={passwordSaving} onClick={() => void handlePasswordSubmit()}>
              {t('actions.confirm')}
            </Button>
          </Space>
        </Card>
      ) : null}
    </>
  )

  const renderBindingSettings = () => (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t('profile.menu.binding')}
      </Typography.Title>
      <List
        className="profile-security-list"
        itemLayout="horizontal"
        dataSource={[
          {
            key: 'taobao' as const,
            icon: <TaobaoCircleOutlined className="profile-binding-icon profile-binding-taobao" />,
            title: t('profile.binding.bindTaobao'),
            boundText: t('profile.binding.boundTaobao'),
            unboundText: t('profile.binding.unboundTaobao'),
          },
          {
            key: 'alipay' as const,
            icon: <AlipayCircleOutlined className="profile-binding-icon profile-binding-alipay" />,
            title: t('profile.binding.bindAlipay'),
            boundText: t('profile.binding.boundAlipay'),
            unboundText: t('profile.binding.unboundAlipay'),
          },
          {
            key: 'dingtalk' as const,
            icon: <DingdingOutlined className="profile-binding-icon profile-binding-dingtalk" />,
            title: t('profile.binding.bindDingtalk'),
            boundText: t('profile.binding.boundDingtalk'),
            unboundText: t('profile.binding.unboundDingtalk'),
          },
        ]}
        renderItem={(item) => {
          const isBound = bindingState[item.key]
          return (
            <List.Item
              actions={[
                <Button type="link" onClick={() => toggleBinding(item.key)}>
                  {isBound ? t('profile.actions.unbind') : t('profile.actions.bind')}
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
        {t('profile.menu.notifications')}
      </Typography.Title>
      <List
        className="profile-security-list"
        itemLayout="horizontal"
        dataSource={[
          {
            key: 'userMessages' as const,
            title: t('profile.notifications.userMessages'),
            description: t('profile.notifications.userMessagesDesc'),
          },
          {
            key: 'systemMessages' as const,
            title: t('profile.notifications.systemMessages'),
            description: t('profile.notifications.systemMessagesDesc'),
          },
          {
            key: 'todoTasks' as const,
            title: t('profile.notifications.todoTasks'),
            description: t('profile.notifications.todoTasksDesc'),
          },
        ]}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Switch
                checkedChildren={t('profile.switch.on')}
                unCheckedChildren={t('profile.switch.off')}
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
            { key: 'basic', label: t('profile.menu.basic') },
            { key: 'security', label: t('profile.menu.security') },
            { key: 'binding', label: t('profile.menu.binding') },
            { key: 'notifications', label: t('profile.menu.notifications') },
          ]}
        />

        <div>{renderActivePanel()}</div>
      </div>
    </Card>
  )
}

export default ProfilePage

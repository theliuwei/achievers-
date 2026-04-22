import { Typography } from 'antd'

const { Title, Paragraph } = Typography

const SettingsPage = () => (
  <div>
    <Title level={4} style={{ marginTop: 0 }}>
      系统概览
    </Title>
    <Paragraph type="secondary">
      左侧子菜单对应菜单管理、角色管理、用户管理与注册审批；配置项均在 Django / 数据库中维护，前端负责展示与操作入口。
    </Paragraph>
  </div>
)

export default SettingsPage

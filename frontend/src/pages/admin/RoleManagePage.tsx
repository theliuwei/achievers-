import { Typography } from 'antd'
import { Link } from 'react-router-dom'
import { apiUrl } from '../../api/client'

const { Title, Paragraph } = Typography

const RoleManagePage = () => (
  <div>
    <Title level={4} style={{ marginTop: 0 }}>
      角色管理
    </Title>
    <Paragraph type="secondary">
      角色与权限的增删改由后端 API（/api/v1/roles/）与 Django Admin 提供；此处可后续接入完整表格与表单。
    </Paragraph>
    <Paragraph>
      <Link to={apiUrl('/api/docs/')} target="_blank" rel="noreferrer">
        打开 Swagger — roles
      </Link>
    </Paragraph>
  </div>
)

export default RoleManagePage

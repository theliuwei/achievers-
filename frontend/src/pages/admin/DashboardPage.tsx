import { RocketOutlined } from '@ant-design/icons'
import { Card, Col, Row, Typography } from 'antd'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const DashboardPage = () => (
  <div>
    <Title level={4} style={{ marginTop: 0 }}>
      工作台
    </Title>
    <Paragraph type="secondary">
      欢迎使用 Achievers 管理后台。后续可在此接入产品、品牌、用户与权限等模块。
    </Paragraph>
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <Card variant="borderless" title="快捷入口" extra={<RocketOutlined />}>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            门户首页：
            <Link to="/">返回官网</Link>
          </Paragraph>
        </Card>
      </Col>
    </Row>
  </div>
)

export default DashboardPage

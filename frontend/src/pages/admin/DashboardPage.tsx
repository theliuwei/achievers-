import {
  BankOutlined,
  ContactsOutlined,
  FileTextOutlined,
  MessageOutlined,
  RocketOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Card, Col, Progress, Row, Space, Statistic, Typography } from 'antd'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const metrics = [
  { title: '入驻公司', value: 128, suffix: '', icon: <BankOutlined /> },
  { title: '活跃成员', value: 684, suffix: '', icon: <TeamOutlined /> },
  { title: '本月询盘', value: 326, suffix: '', icon: <MessageOutlined /> },
  { title: '报价成交率', value: 22, suffix: '%', icon: <FileTextOutlined /> },
]

const quickLinks = [
  { title: '公司管理', path: '/admin/companies', icon: <BankOutlined /> },
  { title: '成员管理', path: '/admin/members', icon: <TeamOutlined /> },
  { title: '产品管理', path: '/admin/products', icon: <ShoppingOutlined /> },
  { title: '询盘管理', path: '/admin/inquiries', icon: <MessageOutlined /> },
  { title: '客户管理', path: '/admin/customers', icon: <ContactsOutlined /> },
  { title: '报价管理', path: '/admin/quotations', icon: <FileTextOutlined /> },
]

const DashboardPage = () => (
  <div>
    <Title level={4} style={{ marginTop: 0 }}>
      工作台
    </Title>
    <Paragraph type="secondary">
      面向中国外贸公司的 SaaS 运营后台，集中管理公司、成员、产品、询盘、客户和报价。
    </Paragraph>

    <Row gutter={[16, 16]}>
      {metrics.map((metric) => (
        <Col xs={24} sm={12} lg={6} key={metric.title}>
          <Card variant="borderless">
            <Statistic
              title={metric.title}
              value={metric.value}
              suffix={metric.suffix}
              prefix={metric.icon}
            />
          </Card>
        </Col>
      ))}
    </Row>

    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      <Col xs={24} lg={16}>
        <Card variant="borderless" title="快捷入口" extra={<RocketOutlined />}>
          <Row gutter={[12, 12]}>
            {quickLinks.map((item) => (
              <Col xs={24} sm={12} xl={8} key={item.path}>
                <Link to={item.path}>
                  <Card size="small" hoverable>
                    <Space>
                      {item.icon}
                      {item.title}
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card variant="borderless" title="今日运营">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                询盘 24 小时响应率
              </Paragraph>
              <Progress percent={94} />
            </div>
            <div>
              <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                产品资料完整度
              </Paragraph>
              <Progress percent={86} />
            </div>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              门户首页：<Link to="/">返回官网</Link>
            </Paragraph>
          </Space>
        </Card>
      </Col>
    </Row>
  </div>
)

export default DashboardPage

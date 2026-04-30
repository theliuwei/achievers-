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
import { useTranslation } from 'react-i18next'

const { Title, Paragraph } = Typography

const DashboardPage = () => {
  const { t } = useTranslation('common')

  const metrics = [
    { title: t('dashboard.metrics.tenants'), value: 128, suffix: '', icon: <BankOutlined /> },
    { title: t('dashboard.metrics.members'), value: 684, suffix: '', icon: <TeamOutlined /> },
    { title: t('dashboard.metrics.inquiries'), value: 326, suffix: '', icon: <MessageOutlined /> },
    { title: t('dashboard.metrics.quoteRate'), value: 22, suffix: '%', icon: <FileTextOutlined /> },
  ]

  const quickLinks = [
    { title: t('dashboard.links.companies'), path: '/admin/companies', icon: <BankOutlined /> },
    { title: t('dashboard.links.members'), path: '/admin/members', icon: <TeamOutlined /> },
    { title: t('dashboard.links.products'), path: '/admin/products', icon: <ShoppingOutlined /> },
    { title: t('dashboard.links.inquiries'), path: '/admin/inquiries', icon: <MessageOutlined /> },
    { title: t('dashboard.links.customers'), path: '/admin/customers', icon: <ContactsOutlined /> },
    { title: t('dashboard.links.quotations'), path: '/admin/quotations', icon: <FileTextOutlined /> },
  ]

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        {t('dashboard.title')}
      </Title>
      <Paragraph type="secondary">{t('dashboard.description')}</Paragraph>

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
          <Card variant="borderless" title={t('dashboard.quickAccess')} extra={<RocketOutlined />}>
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
          <Card variant="borderless" title={t('dashboard.todayOps')}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                  {t('dashboard.responseRate')}
                </Paragraph>
                <Progress percent={94} />
              </div>
              <div>
                <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                  {t('dashboard.profileCompleteness')}
                </Paragraph>
                <Progress percent={86} />
              </div>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {t('dashboard.portalLabel')}
                <Link to="/">{t('dashboard.backToSite')}</Link>
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage

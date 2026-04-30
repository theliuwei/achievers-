import {
  ApiOutlined,
  AppstoreOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Row,
  Space,
  Typography,
} from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { apiUrl } from '../api/client'
import { useAuth } from '../auth/useAuth'
import './HomePage.css'

const { Title, Paragraph, Text } = Typography

const HomePage = () => {
  const { access, logout } = useAuth()
  const { t } = useTranslation('common')

  const features = [
    {
      icon: <AppstoreOutlined />,
      title: t('home.features.products.title'),
      desc: t('home.features.products.desc'),
    },
    {
      icon: <RocketOutlined />,
      title: t('home.features.brand.title'),
      desc: t('home.features.brand.desc'),
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: t('home.features.security.title'),
      desc: t('home.features.security.desc'),
    },
    {
      icon: <ApiOutlined />,
      title: t('home.features.api.title'),
      desc: t('home.features.api.desc'),
    },
  ]

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-inner">
          <span className="home-hero-badge">{t('home.badge')}</span>
          <Title level={1} className="home-hero-title">
            {t('home.title')}
          </Title>
          <Paragraph className="home-hero-subtitle">
            {t('home.subtitle')}
          </Paragraph>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {access ? (
              <>
                <Link to="/admin">
                  <Button type="primary" size="large">
                    {t('home.actions.enterAdmin')}
                  </Button>
                </Link>
                <Button size="large" ghost onClick={() => logout()}>
                  {t('home.actions.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button type="primary" size="large">
                    {t('home.actions.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="large" ghost style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.55)' }}>
                    {t('home.actions.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="home-body">
        <Title level={3} className="home-section-title">
          {t('home.coreTitle')}
        </Title>
        <Paragraph type="secondary" className="home-section-desc">
          {t('home.coreDesc')}
        </Paragraph>

        <Row gutter={[20, 20]}>
          {features.map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <Card className="home-feature-card" variant="borderless" hoverable>
                <div className="home-feature-icon">{item.icon}</div>
                <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
                  {item.title}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {item.desc}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        <Collapse
          className="home-dev-panel"
          bordered={false}
          style={{ marginTop: 40, background: 'transparent' }}
          items={[
            {
              key: 'dev',
              label: t('home.dev.title'),
              children: (
                <Card size="small" variant="outlined" style={{ borderRadius: 8 }}>
                  <Descriptions column={{ xs: 1, sm: 1, md: 2 }} size="small">
                    <Descriptions.Item label={t('home.dev.frontendUrl')}>
                      <Text code>http://localhost:3000</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('home.dev.apiPrefix')}>
                      <Text code>{apiUrl('/api/v1/')}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('home.dev.apiDocs')}>
                      <Button
                        type="link"
                        href={apiUrl('/api/docs/')}
                        target="_blank"
                        rel="noreferrer"
                        icon={<ApiOutlined />}
                        style={{ paddingInlineStart: 0 }}
                      >
                        Swagger UI
                      </Button>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('home.dev.currentSession')}>
                      {access ? (
                        <Space>
                          <Text type="success">{t('home.dev.loggedIn')}</Text>
                          <Button size="small" type="link" onClick={() => logout()}>
                            {t('home.actions.logout')}
                          </Button>
                        </Space>
                      ) : (
                        <Space>
                          <Text type="secondary">{t('home.dev.notLoggedIn')}</Text>
                          <Link to="/login">{t('home.dev.goLogin')}</Link>
                        </Space>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}

export default HomePage

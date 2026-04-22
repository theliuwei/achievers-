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
import { Link } from 'react-router-dom'
import { apiUrl } from '../api/client'
import { useAuth } from '../auth/useAuth'
import './HomePage.css'

const { Title, Paragraph, Text } = Typography

const HomePage = () => {
  const { access, logout } = useAuth()

  const features = [
    {
      icon: <AppstoreOutlined />,
      title: '产品与目录',
      desc: '统一管理产品型号、分类与展示资料，支撑销售与技术支持场景。',
    },
    {
      icon: <RocketOutlined />,
      title: '品牌与内容',
      desc: '多品牌、公司介绍与联系信息集中维护，保持对外信息一致、可追溯。',
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: '权限与安全',
      desc: '基于角色的访问控制（RBAC）与 JWT 认证，接口与操作可按权限精细拆分。',
    },
    {
      icon: <ApiOutlined />,
      title: '开放 API',
      desc: '标准 REST 接口与在线文档，便于与内部系统或合作伙伴集成。',
    },
  ]

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-inner">
          <span className="home-hero-badge">Achievers Automation</span>
          <Title level={1} className="home-hero-title">
            工业自动化 · 产品与内容门户
          </Title>
          <Paragraph className="home-hero-subtitle">
            面向企业与团队的统一入口：产品资料、品牌与公司内容、权限协作与开放接口，一站式支撑日常运营。
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
                    进入管理后台
                  </Button>
                </Link>
                <Button size="large" ghost onClick={() => logout()}>
                  退出登录
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button type="primary" size="large">
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="large" ghost style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.55)' }}>
                    注册账号
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="home-body">
        <Title level={3} className="home-section-title">
          核心能力
        </Title>
        <Paragraph type="secondary" className="home-section-desc">
          与后端 Achievers Automation API 对齐的能力模块，可按角色逐步开放给团队成员。
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
              label: '开发者与本地环境',
              children: (
                <Card size="small" variant="outlined" style={{ borderRadius: 8 }}>
                  <Descriptions column={{ xs: 1, sm: 1, md: 2 }} size="small">
                    <Descriptions.Item label="前端开发地址">
                      <Text code>http://localhost:3000</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="API 前缀">
                      <Text code>{apiUrl('/api/v1/')}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="接口文档">
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
                    <Descriptions.Item label="当前会话">
                      {access ? (
                        <Space>
                          <Text type="success">已登录</Text>
                          <Button size="small" type="link" onClick={() => logout()}>
                            退出
                          </Button>
                        </Space>
                      ) : (
                        <Space>
                          <Text type="secondary">未登录</Text>
                          <Link to="/login">去登录</Link>
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

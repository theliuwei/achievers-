import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Card, Col, Input, Progress, Row, Space, Statistic, Table, Tag, Timeline, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'

const { Title, Paragraph, Text } = Typography

export interface ModuleMetric {
  title: string
  value: number | string
  suffix?: string
}

export interface ModuleAction {
  label: string
  type?: 'primary' | 'default' | 'dashed'
}

export interface BusinessModulePageProps<T extends object> {
  title: string
  description: string
  metrics: ModuleMetric[]
  primaryAction: string
  searchPlaceholder: string
  columns: ColumnsType<T>
  dataSource: T[]
  rowKey: keyof T & string
  tags?: string[]
  progressTitle?: string
  progressPercent?: number
  timelineItems?: string[]
  actions?: ModuleAction[]
}

export function BusinessModulePage<T extends object>({
  title,
  description,
  metrics,
  primaryAction,
  searchPlaceholder,
  columns,
  dataSource,
  rowKey,
  tags = [],
  progressTitle,
  progressPercent = 68,
  timelineItems = [],
  actions = [],
}: BusinessModulePageProps<T>) {
  const { t } = useTranslation('common')
  const resolvedProgressTitle = progressTitle ?? t('business.monthlyGoalProgress')
  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
          {title}
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {description}
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        {metrics.map((metric) => (
          <Col xs={24} sm={12} lg={6} key={metric.title}>
            <Card variant="borderless">
              <Statistic title={metric.title} value={metric.value} suffix={metric.suffix} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={18}>
          <Card
            variant="borderless"
            title={`${title}${t('business.listSuffix')}`}
            extra={
              <Space wrap>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder={searchPlaceholder}
                  style={{ width: 240 }}
                />
                <Button icon={<ReloadOutlined />}>{t('actions.refresh')}</Button>
                <Button type="primary" icon={<PlusOutlined />}>
                  {primaryAction}
                </Button>
              </Space>
            }
          >
            <Table<T>
              rowKey={rowKey}
              columns={columns}
              dataSource={dataSource}
              pagination={{ pageSize: 5, showTotal: (total) => t('business.totalCount', { count: total }) }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={6}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card variant="borderless" title={t('business.operationTips')}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">{resolvedProgressTitle}</Text>
                  <Progress percent={progressPercent} style={{ marginTop: 8 }} />
                </div>
                {tags.length ? (
                  <Space wrap>
                    {tags.map((tag) => (
                      <Tag color="blue" key={tag}>
                        {tag}
                      </Tag>
                    ))}
                  </Space>
                ) : null}
              </Space>
            </Card>

            <Card variant="borderless" title={t('business.nextStep')}>
              {timelineItems.length ? (
                <Timeline items={timelineItems.map((children) => ({ children }))} />
              ) : (
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {t('business.defaultNextStep')}
                </Paragraph>
              )}
            </Card>

            {actions.length ? (
              <Card variant="borderless" title={t('business.quickActions')}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {actions.map((action) => (
                    <Button block type={action.type ?? 'default'} key={action.label}>
                      {action.label}
                    </Button>
                  ))}
                </Space>
              </Card>
            ) : null}
          </Space>
        </Col>
      </Row>
    </Space>
  )
}

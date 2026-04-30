const enMap: Record<string, string> = {
  '未登录': 'Not signed in',
  '用户': 'User',
  '加载菜单失败': 'Failed to load menu',
  '个人中心': 'Profile',
  '返回门户首页': 'Back to Portal',
  '退出登录': 'Sign Out',
  '首页': 'Home',
  '工作台': 'Dashboard',
  '暂无导航数据。请在后端Django Admin（导航菜单项）配置，并执行seed命令初始化。':
    'No navigation data. Configure menu items in Django Admin and run seed commands.',
  '重新加载': 'Reload',
  '展开侧边栏': 'Expand Sidebar',
  '收起侧边栏': 'Collapse Sidebar',
  '应用列表': 'List',
  '新增': 'Create',
  '编辑': 'Edit',
  '操作': 'Actions',
  '保存成功': 'Saved successfully',
  '新增成功': 'Created successfully',
  '提交失败，请稍后重试': 'Submission failed, please try again later',
  '确认删除': 'Confirm deletion',
  '删除': 'Delete',
  '删除成功': 'Deleted successfully',
  '删除失败，请稍后重试': 'Delete failed, please try again later',
  '将删除': 'Delete',
  '条记录，是否继续？': 'records, continue?',
  '返回列表': 'Back to list',
  '确认': 'Confirm',
  '取消': 'Cancel',
  '已选择': 'Selected',
  '项': 'items',
  '清空': 'Clear',
  '查询': 'Search',
  '重置': 'Reset',
  '关闭': 'Close',
  '系统设置': 'System Settings',
  '主题色': 'Theme Color',
  '取色器': 'Color Picker',
  '快速预设': 'Quick Presets',
  '恢复默认主色': 'Reset Default Color',
  '选择界面主色，将同步到 Ant Design 与顶部导航等自定义样式。预设来自经典配色，重置后恢复为构建环境变量':
    'Choose the primary UI color. It syncs to Ant Design and custom styles such as the top navigation. Presets come from classic palettes; reset returns to build env default.',
  '管理后台': 'Admin Console',
  '已登录': 'Signed in',
  '退出': 'Sign Out',
  '公司入驻': 'Tenant Apply',
  '登录': 'Login',
  '注册': 'Register',
  '公司管理': 'Tenant Management',
  '成员管理': 'Member Management',
  '产品管理': 'Product Management',
  '询盘管理': 'Inquiry Management',
  '客户管理': 'Customer Management',
  '报价管理': 'Quotation Management',
  '菜单管理': 'Menu Management',
  '角色管理': 'Role Management',
  '用户管理': 'User Management',
  '审批管理': 'Approvals',
  '面向中国外贸公司的 SaaS 运营后台，集中管理公司、成员、产品、询盘、客户和报价。':
    'SaaS admin for Chinese foreign trade teams to manage tenants, members, products, inquiries, customers, and quotations.',
  '快捷入口': 'Quick Access',
  '今日运营': 'Today Operations',
  '询盘 24 小时响应率': '24h Inquiry Response Rate',
  '产品资料完整度': 'Product Profile Completeness',
  '门户首页：': 'Portal:',
  '返回官网': 'Back to Site',
}

const viMap: Record<string, string> = {}
const ruMap: Record<string, string> = {}

const resolveLang = (language: string): 'zh' | 'en' | 'vi' | 'ru' => {
  if (language.startsWith('en')) return 'en'
  if (language.startsWith('vi')) return 'vi'
  if (language.startsWith('ru')) return 'ru'
  return 'zh'
}

export const translateLegacyText = (text: string, language: string): string => {
  const normalizedText = text.replace(/\s+/g, ' ').trim()
  const lang = resolveLang(language)
  if (lang === 'zh' || !normalizedText) {
    return text
  }
  const dictionary = lang === 'en' ? enMap : lang === 'vi' ? viMap : ruMap
  const fallback = enMap[normalizedText] ?? text
  return dictionary[normalizedText] ?? fallback
}

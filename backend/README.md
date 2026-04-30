# Achievers 后端（Django）

基于 **Django 6** 与 **Django REST Framework** 的 API 与后台服务，配合 **simpleui** 管理界面。

## 技术栈

| 类别 | 说明 |
|------|------|
| 框架 | Django 6.0、DRF、drf-spectacular |
| 数据库 | MySQL（通过 **PyMySQL**；MySQL 8 的 `caching_sha2_password` 需 **cryptography**） |
| 缓存 | Redis（**django-redis**） |
| 认证 | JWT（djangorestframework-simplejwt） |
| 后台 UI | django-simpleui、django-import-export、django-ckeditor 等 |

## 环境要求

- **Python** 3.12+（推荐与团队一致；当前开发环境可为 3.14）
- **MySQL** 8.x（或兼容版本）
- **Redis**（与 `config.settings` 中 `CACHES` 的地址一致，默认 `127.0.0.1:6379`）

## 目录结构

```
backend/
├── config/                  # 项目核心配置（settings、urls、wsgi）
├── products/                # 产品相关
├── brands/                  # 品牌管理
├── company/                 # 公司介绍、工厂参观等静态内容
├── users/                   # 用户、角色、权限
├── api/                     # DRF views、serializers、routers
├── media/                   # 上传的产品图片（开发时）
├── static/                  # 静态文件
├── manage.py
├── requirements.txt
└── .venv/                   # 建议在本目录下创建虚拟环境
```

## 本地开发

### 1. 虚拟环境与依赖

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 环境变量（可选）

若使用 `.env`，可在项目根目录放置 `backend/.env`；VS Code 可在 `.vscode/settings.json` 中配置 `python.envFile` 指向该文件。

### 3. 数据库与迁移

在 MySQL 中创建与 `DATABASES` 配置一致的数据库与用户，然后：

```bash
python manage.py migrate
```

### 4. 启动开发服务器

```bash
python manage.py runserver
```

默认：<http://127.0.0.1:8000/>；后台：<http://127.0.0.1:8000/admin/>。

### 6. RBAC 初始化（必做）

首次启动或权限变更后，执行：

```bash
python manage.py seed_rbac
```

本次已新增权限点：

- 产品翻译：`product_translations.view/create/update/delete`
- 类目翻译：`category_translations.view/create/update/delete`
- GDPR：`gdpr.export`、`gdpr.delete`

## 新增后端 API（本轮）

### 1) 多语言翻译管理（后台）

- `GET/POST /api/v1/admin-product-translations/`
- `GET/PATCH/DELETE /api/v1/admin-product-translations/{id}/`
- `GET/POST /api/v1/admin-product-category-translations/`
- `GET/PATCH/DELETE /api/v1/admin-product-category-translations/{id}/`

鉴权：`IsAuthenticated + RBAC`

### 2) GDPR 用户数据闭环

- `GET /api/v1/gdpr/export/`：导出当前登录用户个人数据（账号、成员关系、同意记录）
- `POST /api/v1/gdpr/delete/`：匿名化并禁用当前登录用户，同时写入 `ConsentLog` 审计记录

鉴权：`IsAuthenticated + RBAC`（分别要求 `gdpr.export`、`gdpr.delete`）

### 3) 报价 VAT 计算输出（序列化层）

`QuotationSerializer` 已新增输出字段：

- `subtotal_amount`
- `tax_amount`
- `total_with_tax`

计算参数支持：

- `vat_rate_id`（可通过请求参数传入）
- `is_price_included`（可通过请求参数传入，`true/false`）

## 联调命令（示例）

以下命令假设本地服务地址为 `http://127.0.0.1:8000`。

### 1) 执行迁移与权限种子

```bash
cd backend
python manage.py migrate
python manage.py seed_rbac
```

### 2) GDPR 导出接口

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/gdpr/export/" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 3) GDPR 删除（匿名化）接口

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/gdpr/delete/" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{}"
```

### 4) 报价 VAT 计算展示

```bash
curl -X GET "http://127.0.0.1:8000/api/v1/quotations/?vat_rate_id=1&is_price_included=true" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 5. Debug Toolbar（开发）

`DEBUG=True` 时已启用 **django-debug-toolbar**，路由挂载在 **`/__debug__/`**（见 `config/urls.py`）。若仅本地调试不需要，可从 `INSTALLED_APPS` / `MIDDLEWARE` 中移除相关项。

## 说明

- **PyMySQL**：`config/settings.py` 中通过 `pymysql.install_as_MySQLdb()` 接入 Django 的 MySQL 引擎；为满足 Django 6 的版本检查，会调整 `version_info`（见文件顶部注释）。
- **CKEditor**：`django-ckeditor` 内置 CKEditor 4，可能触发系统检查警告 `ckeditor.W001`；若已在 `SILENCED_SYSTEM_CHECKS` 中静默，属预期行为。长期建议评估迁移至 CKEditor 5 或其它编辑器。

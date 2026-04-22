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

### 5. Debug Toolbar（开发）

`DEBUG=True` 时已启用 **django-debug-toolbar**，路由挂载在 **`/__debug__/`**（见 `config/urls.py`）。若仅本地调试不需要，可从 `INSTALLED_APPS` / `MIDDLEWARE` 中移除相关项。

## 说明

- **PyMySQL**：`config/settings.py` 中通过 `pymysql.install_as_MySQLdb()` 接入 Django 的 MySQL 引擎；为满足 Django 6 的版本检查，会调整 `version_info`（见文件顶部注释）。
- **CKEditor**：`django-ckeditor` 内置 CKEditor 4，可能触发系统检查警告 `ckeditor.W001`；若已在 `SILENCED_SYSTEM_CHECKS` 中静默，属预期行为。长期建议评估迁移至 CKEditor 5 或其它编辑器。

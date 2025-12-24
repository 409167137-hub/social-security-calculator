# 五险一金计算器

一个基于 Next.js 和 Supabase 的社保公积金费用计算工具，帮助企业快速计算员工社保缴纳金额。

## 功能特性

- 📊 数据上传：支持 Excel 文件上传城市社保标准和员工工资数据
- 🧮 智能计算：自动根据工资基数和社保标准计算公司应缴纳金额
- 📋 结果展示：分页展示计算结果，支持按姓名搜索
- 📥 数据导出：一键导出计算结果为 Excel 文件

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) |
| UI/样式 | Tailwind CSS |
| 数据库/后端 | Supabase (PostgreSQL) |
| Excel处理 | xlsx 库 |

## 快速开始

### 环境要求

- Node.js 18+
- Supabase 账号

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 创建数据库表

在 Supabase SQL Editor 中执行 `database-fix.sql` 中的 SQL 语句。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用说明

1. **上传数据**
   - 准备 `cities.xlsx`（城市社保标准）和 `salaries.xlsx`（员工工资）
   - 在上传页面分别上传两个文件
   - 点击"执行计算并存储结果"

2. **查看结果**
   - 结果页面显示所有员工的计算结果
   - 支持按姓名搜索
   - 支持导出 Excel

## 数据格式

### cities.xlsx

| id | city_name | year | base_min | base_max | rate |
|----|-----------|------|----------|----------|------|
| 1  | 佛山      | 2024 | 4546     | 26421    | 0.14 |

### salaries.xlsx

| id | employee_id | employee_name | month  | salary_amount |
|----|-------------|---------------|--------|---------------|
| 1  | 1           | 张三          | 202401 | 30000         |

## 计算逻辑

1. 计算员工年度月平均工资
2. 根据社保基数上下限确定缴费基数
3. 计算公司应缴纳金额 = 缴费基数 × 缴纳比例

## 许可证

MIT

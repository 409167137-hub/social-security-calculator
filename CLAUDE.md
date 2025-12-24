# 五险一金计算器 - 项目上下文管理中枢

## 项目概述

### 项目目标
构建一个迷你的"五险一金"计算器 Web 应用。核心功能是根据预设的员工工资数据和城市社保标准，计算出公司为每位员工应缴纳的社保公积金费用，并将结果清晰地展示出来。

### 技术栈
| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js (App Router) |
| UI/样式 | Tailwind CSS |
| 数据库/后端 | Supabase (PostgreSQL) |
| Excel处理 | xlsx 库 |

---

## 数据结构设计

### 1. cities 表（城市社保标准表）
| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | int | 主键 | 1 |
| city_name | text | 城市名 | "佛山" |
| year | text | 年份 | "2024" |
| base_min | int | 社保基数下限 | 4546 |
| base_max | int | 社保基数上限 | 26421 |
| rate | float | 综合缴纳比例 | 0.14 |

### 2. salaries 表（员工工资表）
| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | int | 主键 | 1 |
| employee_id | text | 员工工号 | "1" |
| employee_name | text | 员工姓名 | "张三" |
| month | text | 年份月份 (YYYYMM) | "202401" |
| salary_amount | int | 该月工资金额 | 30000 |

### 3. results 表（计算结果表）
| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| id | int | 主键 | 1 |
| employee_name | text | 员工姓名 | "张三" |
| avg_salary | float | 年度月平均工资 | 30000.00 |
| contribution_base | float | 最终缴费基数 | 26421.00 |
| company_fee | float | 公司缴纳金额 | 3698.94 |

---

## 核心业务逻辑

### 计算函数执行流程
```
1. 从 salaries 表读取所有数据
2. 按 employee_name 分组，计算每位员工的"年度月平均工资"
3. 从 cities 表获取佛山的 year, base_min, base_max, rate
4. 对每位员工：
   - 将年度月平均工资与基数上下限比较
   - 确定最终缴费基数：
     * avg_salary < base_min → 使用 base_min
     * avg_salary > base_max → 使用 base_max
     * 否则 → 使用 avg_salary
5. 计算公司应缴纳金额 = contribution_base × rate
6. 将结果存入 results 表（覆盖模式：清空后插入）
```

### 示例计算
| 员工 | 平均工资 | 基数范围 | 最终基数 | 缴纳比例 | 公司缴纳 |
|------|----------|----------|----------|----------|----------|
| 张三 | 30000 | 4546-26421 | 26421 | 0.14 | 3698.94 |
| 李四 | 15000 | 4546-26421 | 15000 | 0.14 | 2100.00 |
| 王五 | 4000 | 4546-26421 | 4546 | 0.14 | 636.44 |

---

## 前端页面设计

### 1. 主页 (/)

**布局**：简约金融专业风格，两个并排或垂直排列的功能卡片

**卡片一：数据上传**
- 标题："数据上传"
- 说明："上传员工工资和城市社保标准数据"
- 整个卡片可点击，跳转到 `/upload`

**卡片二：结果查询**
- 标题："结果查询"
- 说明："查看五险一金计算结果"
- 整个卡片可点击，跳转到 `/results`

### 2. 数据上传页 (/upload)

**功能按钮一：上传数据**
- 支持 Excel 文件上传
- 需要分别上传 cities.xlsx 和 salaries.xlsx
- 上传后解析并插入 Supabase 对应表（覆盖模式：清空后插入）
- 显示上传状态（成功/失败/进度）

**功能按钮二：执行计算并存储结果**
- 触发核心计算逻辑
- 将计算结果存入 results 表
- 显示计算状态和结果摘要

**操作顺序**：先上传数据 → 再执行计算

### 3. 结果展示页 (/results)

**功能**：
- 自动从 Supabase results 表获取数据
- 使用 Tailwind CSS 构建简洁表格
- 支持分页显示
- 支持按员工姓名搜索
- 支持导出为 Excel

**表格表头**：
- 员工姓名
- 年度月平均工资
- 最终缴费基数
- 公司缴纳金额

---

## 开发任务清单 (TODO)

### 阶段一：环境搭建
- [ ] 创建 Next.js 项目（App Router）
- [ ] 安装 Tailwind CSS
- [ ] 配置 Supabase 客户端
- [ ] 在 Supabase 创建数据库表（cities, salaries, results）
- [ ] 安装 Excel 处理库（xlsx）
- [ ] 配置环境变量（Supabase URL 和 Anon Key）

### 阶段二：后端 API 开发
- [ ] 创建 `/api/upload/cities` API - 解析 cities.xlsx 并入库
- [ ] 创建 `/api/upload/salaries` API - 解析 salaries.xlsx 并入库
- [ ] 创建 `/api/calculate` API - 执行计算逻辑并存储结果
- [ ] 创建 `/api/results` API - 获取计算结果（支持分页和搜索）
- [ ] 创建 `/api/export` API - 导出结果为 Excel

### 阶段三：前端页面开发
- [ ] 创建 `/` 主页 - 导航卡片布局
- [ ] 创建 `/upload` 页面 - 文件上传和计算触发
- [ ] 创建 `/results` 页面 - 结果表格展示
- [ ] 实现分页组件
- [ ] 实现搜索功能
- [ ] 实现导出功能

### 阶段四：测试与优化
- [ ] 使用示例 Excel 数据测试完整流程
- [ ] 验证计算结果准确性
- [ ] 优化 UI/UX
- [ ] 添加错误处理和加载状态
- [ ] 添加响应式设计

---

## 文件结构规划

```
social-security-calculator/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主页 (/)
│   ├── upload/
│   │   └── page.tsx        # 上传页面 (/upload)
│   └── results/
│       └── page.tsx        # 结果页面 (/results)
├── app/api/
│   ├── upload/
│   │   ├── cities/
│   │   │   └── route.ts    # POST /api/upload/cities
│   │   └── salaries/
│   │       └── route.ts    # POST /api/upload/salaries
│   ├── calculate/
│   │   └── route.ts        # POST /api/calculate
│   ├── results/
│   │   └── route.ts        # GET /api/results
│   └── export/
│       └── route.ts        # GET /api/export
├── lib/
│   ├── supabase.ts         # Supabase 客户端配置
│   └── types.ts            # TypeScript 类型定义
├── components/
│   ├── Card.tsx            # 卡片组件
│   ├── Table.tsx           # 表格组件
│   └── Pagination.tsx      # 分页组件
├── public/                 # 静态资源
└── .env.local              # 环境变量
```

---

## 数据示例

### cities.xlsx 示例数据
| id | city_name | year | rate | base_min | base_max |
|----|-----------|------|------|----------|----------|
| 1  | 佛山      | 2024 | 0.14 | 4546     | 26421    |

### salaries.xlsx 示例数据
| id | employee_id | employee_name | month  | salary_amount |
|----|-------------|---------------|--------|---------------|
| 1  | 1           | 张三          | 202401 | 30000         |
| 2  | 1           | 张三          | 202402 | 29000         |
| ... | ... | ... | ... | ... |
| 13 | 2           | 李四          | 202401 | 15000         |
| ... | ... | ... | ... | ... |
| 25 | 3           | 王五          | 202401 | 4000          |
| ... | ... | ... | ... | ... |

### 计算结果示例
| id | employee_name | avg_salary | contribution_base | company_fee |
|----|---------------|------------|-------------------|-------------|
| 1  | 张三          | 30000      | 26421             | 3698.94     |
| 2  | 李四          | 15000      | 15000             | 2100.00     |
| 3  | 王五          | 4000       | 4546              | 636.44      |

---

## 环境变量模板

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Supabase 表结构 SQL

```sql
-- cities 表
CREATE TABLE cities (
  id INT PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INT NOT NULL,
  base_max INT NOT NULL,
  rate FLOAT NOT NULL
);

-- salaries 表
CREATE TABLE salaries (
  id INT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INT NOT NULL
);

-- results 表
CREATE TABLE results (
  id INT PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL
);
```

---

## 注意事项

1. **数据覆盖策略**：每次上传或计算都会清空原有数据后再插入新数据
2. **城市固定为佛山**：当前版本只支持佛山，暂不考虑多城市扩展
3. **年份动态获取**：从 salaries 数据中获取年份
4. **无用户认证**：当前版本为公开访问，无需登录

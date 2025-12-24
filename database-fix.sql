-- ============================================
-- 修复数据库表结构 - 让 id 列自增
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 删除旧表并重新创建（id 改为自增）
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS cities;

-- cities 表（id 自增）
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INT NOT NULL,
  base_max INT NOT NULL,
  rate FLOAT NOT NULL
);

-- salaries 表（id 自增）
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  salary_amount INT NOT NULL
);

-- results 表（id 自增）
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary FLOAT NOT NULL,
  contribution_base FLOAT NOT NULL,
  company_fee FLOAT NOT NULL
);

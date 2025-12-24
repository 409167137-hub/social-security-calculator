import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { Result } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // 1. 从 salaries 表读取所有数据
    const { data: salaries, error: salariesError } = await supabase
      .from(TABLES.SALARIES)
      .select('*');

    if (salariesError) {
      return NextResponse.json(
        { success: false, error: '获取工资数据失败: ' + salariesError.message },
        { status: 500 }
      );
    }

    if (!salaries || salaries.length === 0) {
      console.error('[DEBUG] salaries 表为空');
      return NextResponse.json(
        { success: false, error: '没有工资数据，请先上传工资数据' },
        { status: 400 }
      );
    }

    console.log('[DEBUG] salaries 数据:', salaries.length, '条');

    // 2. 按 employee_name 分组，计算年度月平均工资
    const salaryByEmployee = salaries.reduce((acc: Record<string, number[]>, salary) => {
      if (!acc[salary.employee_name]) {
        acc[salary.employee_name] = [];
      }
      acc[salary.employee_name].push(salary.salary_amount);
      return acc;
    }, {});

    const avgSalaries = Object.entries(salaryByEmployee).map(([name, amounts]) => {
      const sum = amounts.reduce((a, b) => a + b, 0);
      return {
        employee_name: name,
        avg_salary: sum / amounts.length,
      };
    });

    // 3. 从 cities 表获取社保标准
    // 先查询所有数据查看实际内容
    const { data: allCities, error: allCitiesError } = await supabase
      .from(TABLES.CITIES)
      .select('*');

    console.log('[DEBUG] cities 表所有数据:', allCities);

    // 然后查询佛山的数据
    const { data: cities, error: citiesError } = await supabase
      .from(TABLES.CITIES)
      .select('*')
      .ilike('city_name', '%佛山%')
      .limit(1);

    if (citiesError) {
      return NextResponse.json(
        { success: false, error: '获取城市数据失败: ' + citiesError.message },
        { status: 500 }
      );
    }

    console.log('[DEBUG] cities 查询结果:', cities);

    if (!cities || cities.length === 0) {
      return NextResponse.json(
        { success: false, error: `没有找到佛山城市的社保标准。当前城市数据: ${JSON.stringify(allCities)}` },
        { status: 400 }
      );
    }

    const city = cities[0];
    const { base_min, base_max, rate } = city;

    // 4. 计算每位员工的缴费基数和公司应缴纳金额
    const results: Omit<Result, 'id'>[] = avgSalaries.map(({ employee_name, avg_salary }) => {
      // 确定最终缴费基数
      let contribution_base: number;
      if (avg_salary < base_min) {
        contribution_base = base_min;
      } else if (avg_salary > base_max) {
        contribution_base = base_max;
      } else {
        contribution_base = avg_salary;
      }

      // 计算公司应缴纳金额
      const company_fee = contribution_base * rate;

      return {
        employee_name,
        avg_salary: Number(avg_salary.toFixed(2)),
        contribution_base: Number(contribution_base.toFixed(2)),
        company_fee: Number(company_fee.toFixed(2)),
      };
    });

    // 5. 清空 results 表并插入新结果
    const { error: deleteError } = await supabase
      .from(TABLES.RESULTS)
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.error('删除旧结果失败:', deleteError);
    }

    const { data: insertedData, error: insertError } = await supabase
      .from(TABLES.RESULTS)
      .insert(results)
      .select();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: '保存计算结果失败: ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功计算 ${results.length} 位员工的社保费用`,
      data: insertedData,
      city: {
        name: city.city_name,
        year: city.year,
        base_min,
        base_max,
        rate,
      },
    });
  } catch (error: any) {
    console.error('计算错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '计算失败' },
      { status: 500 }
    );
  }
}

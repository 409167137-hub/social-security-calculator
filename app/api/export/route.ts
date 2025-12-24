import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { Result } from '@/lib/types';
import * as xlsx from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // 获取所有结果数据
    const { data, error } = await supabase
      .from(TABLES.RESULTS)
      .select('*')
      .order('employee_name', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可导出的数据' },
        { status: 400 }
      );
    }

    // 准备导出数据
    const exportData = data.map((item: Result) => ({
      '员工姓名': item.employee_name,
      '年度月平均工资': item.avg_salary,
      '最终缴费基数': item.contribution_base,
      '公司缴纳金额': item.company_fee,
    }));

    // 创建工作簿
    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '计算结果');

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
    ];

    // 生成 Excel 文件
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 返回文件
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="社保计算结果_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('导出错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '导出失败' },
      { status: 500 }
    );
  }
}

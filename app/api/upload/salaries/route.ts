import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { SalaryExcelRow, Salary } from '@/lib/types';
import * as xlsx from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到文件' },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json(
        { success: false, error: '仅支持 .xlsx 格式文件' },
        { status: 400 }
      );
    }

    // 读取 Excel 文件
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: SalaryExcelRow[] = xlsx.utils.sheet_to_json(worksheet);

    // 转换数据
    const salaries: Omit<Salary, 'id'>[] = rawData.map((row: SalaryExcelRow) => ({
      employee_id: String(row.employee_id),
      employee_name: String(row.employee_name),
      month: String(row.month),
      salary_amount: Number(row.salary_amount),
    }));

    // 清空现有数据
    const { error: deleteError } = await supabase
      .from(TABLES.SALARIES)
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.error('删除旧数据失败:', deleteError);
    }

    // 插入新数据
    const { data, error } = await supabase
      .from(TABLES.SALARIES)
      .insert(salaries)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${salaries.length} 条工资数据`,
      data,
    });
  } catch (error: any) {
    console.error('上传工资数据错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '上传失败' },
      { status: 500 }
    );
  }
}

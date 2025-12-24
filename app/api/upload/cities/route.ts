import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { CityExcelRow, City } from '@/lib/types';
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
    const rawData: CityExcelRow[] = xlsx.utils.sheet_to_json(worksheet);

    console.log('[DEBUG] Excel 原始数据:', JSON.stringify(rawData, null, 2));

    // 转换数据（处理字段名可能有的空格）
    const cities: Omit<City, 'id'>[] = rawData.map((row: any) => ({
      city_name: (row.city_name || row['city_name '] || '').trim(),
      year: String(row.year),
      base_min: Number(row.base_min),
      base_max: Number(row.base_max),
      rate: Number(row.rate),
    }));

    console.log('[DEBUG] 转换后数据:', JSON.stringify(cities, null, 2));

    // 清空现有数据
    const { error: deleteError } = await supabase
      .from(TABLES.CITIES)
      .delete()
      .neq('id', 0);

    if (deleteError) {
      console.error('删除旧数据失败:', deleteError);
    }

    // 插入新数据
    const { data, error } = await supabase
      .from(TABLES.CITIES)
      .insert(cities)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${cities.length} 条城市数据`,
      data,
    });
  } catch (error: any) {
    console.error('上传城市数据错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '上传失败' },
      { status: 500 }
    );
  }
}

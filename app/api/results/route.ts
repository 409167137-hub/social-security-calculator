import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { Result, PaginationParams, PaginatedResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // 计算偏移量
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 构建查询
    let query = supabase
      .from(TABLES.RESULTS)
      .select('*', { count: 'exact' });

    // 添加搜索条件
    if (search) {
      query = query.ilike('employee_name', `%${search}%`);
    }

    // 获取总数
    const { count, error: countError } = await query;
    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    // 获取分页数据
    const { data, error } = await supabase
      .from(TABLES.RESULTS)
      .select('*')
      .ilike('employee_name', `%${search}%`)
      .order('employee_name', { ascending: true })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const response: PaginatedResponse<Result> = {
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('获取结果错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取结果失败' },
      { status: 500 }
    );
  }
}

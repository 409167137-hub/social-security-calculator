'use client';

import { useState } from 'react';
import Link from 'next/link';

interface UploadStatus {
  type: 'idle' | 'success' | 'error';
  message: string;
}

export default function UploadPage() {
  const [citiesFile, setCitiesFile] = useState<File | null>(null);
  const [salariesFile, setSalariesFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    type: 'idle',
    message: '',
  });
  const [calcStatus, setCalcStatus] = useState<UploadStatus>({
    type: 'idle',
    message: '',
  });

  const handleCitiesUpload = async () => {
    if (!citiesFile) {
      setUploadStatus({ type: 'error', message: '请选择 cities.xlsx 文件' });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: 'idle', message: '' });

    const formData = new FormData();
    formData.append('file', citiesFile);

    try {
      const response = await fetch('/api/upload/cities', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus({ type: 'success', message: result.message });
      } else {
        setUploadStatus({ type: 'error', message: result.error || '上传失败' });
      }
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: '网络错误: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSalariesUpload = async () => {
    if (!salariesFile) {
      setUploadStatus({ type: 'error', message: '请选择 salaries.xlsx 文件' });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: 'idle', message: '' });

    const formData = new FormData();
    formData.append('file', salariesFile);

    try {
      const response = await fetch('/api/upload/salaries', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus({ type: 'success', message: result.message });
      } else {
        setUploadStatus({ type: 'error', message: result.error || '上传失败' });
      }
    } catch (error: any) {
      setUploadStatus({ type: 'error', message: '网络错误: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setCalcStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setCalcStatus({
          type: 'success',
          message: `${result.message}（城市：${result.city?.name}，年份：${result.city?.year}）`,
        });
      } else {
        setCalcStatus({ type: 'error', message: result.error || '计算失败' });
      }
    } catch (error: any) {
      setCalcStatus({ type: 'error', message: '网络错误: ' + error.message });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">数据上传与计算</h1>
          <p className="text-slate-600 mt-2">上传数据并执行社保费用计算</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Cities Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">上传城市社保标准</h2>
            <p className="text-slate-600 mb-4">上传包含城市社保基数和比例的 Excel 文件</p>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="cities-file"
                accept=".xlsx"
                onChange={(e) => setCitiesFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="cities-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-slate-600">
                  {citiesFile ? citiesFile.name : '点击选择 cities.xlsx 文件'}
                </span>
              </label>
            </div>

            <button
              onClick={handleCitiesUpload}
              disabled={!citiesFile || uploading}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? '上传中...' : '上传城市数据'}
            </button>
          </div>

          {/* Salaries Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">上传员工工资数据</h2>
            <p className="text-slate-600 mb-4">上传包含员工工资记录的 Excel 文件</p>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="salaries-file"
                accept=".xlsx"
                onChange={(e) => setSalariesFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="salaries-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-slate-600">
                  {salariesFile ? salariesFile.name : '点击选择 salaries.xlsx 文件'}
                </span>
              </label>
            </div>

            <button
              onClick={handleSalariesUpload}
              disabled={!salariesFile || uploading}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? '上传中...' : '上传工资数据'}
            </button>
          </div>

          {/* Upload Status */}
          {uploadStatus.type !== 'idle' && (
            <div
              className={`p-4 rounded-lg ${
                uploadStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {uploadStatus.message}
            </div>
          )}

          {/* Calculate Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">执行计算</h2>
            <p className="text-slate-600 mb-4">根据上传的数据计算公司应缴纳的社保费用</p>

            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {calculating ? '计算中...' : '执行计算并存储结果'}
            </button>
          </div>

          {/* Calculation Status */}
          {calcStatus.type !== 'idle' && (
            <div
              className={`p-4 rounded-lg ${
                calcStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {calcStatus.message}
            </div>
          )}

          {/* Navigate to Results */}
          {calcStatus.type === 'success' && (
            <Link
              href="/results"
              className="block text-center bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-900 transition-colors"
            >
              查看计算结果
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

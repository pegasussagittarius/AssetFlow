
import React, { useState, useMemo } from 'react';
import { X, FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Asset, User } from '../types';
import { ASSET_CATEGORIES, formatCurrency, formatDate } from '../constants';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  currentUser: User | null;
  isDark: boolean;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ 
  isOpen, 
  onClose, 
  assets, 
  currentUser,
  isDark 
}) => {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter assets based on date range for the List and current value
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const assetDate = asset.date.split('T')[0];
      return assetDate >= startDate && assetDate <= endDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [assets, startDate, endDate]);

  const totalValue = useMemo(() => filteredAssets.reduce((sum, item) => sum + item.amount, 0), [filteredAssets]);

  // Data for Category Pie Chart
  const categoryChartData = useMemo(() => {
    const grouped = filteredAssets.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return ASSET_CATEGORIES.map(cat => ({
      name: cat.name,
      value: grouped[cat.id] || 0,
      color: cat.color
    })).filter(item => item.value > 0);
  }, [filteredAssets]);

  // Data for Plan Pie Chart
  const planChartData = useMemo(() => {
      const grouped = filteredAssets.reduce((acc, item) => {
          if (item.plan && item.plan.trim() !== '') {
              const planName = item.plan.trim();
              acc[planName] = (acc[planName] || 0) + item.amount;
          }
          return acc;
      }, {} as Record<string, number>);

      // Generate random colors for plans since they are dynamic
      const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6'];

      return Object.entries(grouped).map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length]
      })).sort((a, b) => b.value - a.value);
  }, [filteredAssets]);

  // Data for Trends (Use all assets history for context, but usually reports show trend within period)
  // Here we show trend for each category
  const historyData = useMemo(() => {
    const trends: Record<string, any[]> = {};
    ASSET_CATEGORIES.forEach(cat => {
      const catAssets = assets.filter(a => a.category === cat.id); // Use full assets for trend context
      if (catAssets.length === 0) return;
      
      const dateMap: Record<string, number> = {};
      catAssets.forEach(asset => {
        const dateKey = asset.date ? asset.date.split('T')[0] : 'Unknown';
        dateMap[dateKey] = (dateMap[dateKey] || 0) + asset.amount;
      });
      
      // Sort and map
      const sortedData = Object.keys(dateMap).sort((a, b) => {
            const timeA = new Date(a).getTime();
            const timeB = new Date(b).getTime();
            return timeA - timeB;
        }).map(date => {
            return { rawDate: date, value: dateMap[date] };
      });
      
      // Only keep data points relevant to report or show full trend? 
      // Let's show full trend to make the chart look useful.
      if (sortedData.length > 0) trends[cat.id] = sortedData;
    });
    return trends;
  }, [assets]);

  const handleExportPDF = async () => {
    setIsGenerating(true);
    
    // Allow UI to update before blocking with heavy task
    setTimeout(async () => {
      try {
        const input = document.getElementById('report-to-print');
        if (!input) return;

        // Use html2canvas to take a screenshot of the report div
        // scale: 2 for better resolution
        const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate ratio to fit A4 width
        const ratio = Math.min(pdfWidth / imgWidth) * 0.95; // 0.95 to leave margins
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        const finalHeight = imgHeight * ratio;

        // Add Logic for multi-page if content is very long, but for now single page scale down
        if (finalHeight > pdfHeight) {
            // If too long, we might need to just let it fit width and span pages (complex) 
            // OR just scale it to fit height (might be too small)
            // For this specific app, we'll just add it. If it cuts off, user usually scrolls print div.
             pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, finalHeight);
        } else {
             pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, finalHeight);
        }
        
        pdf.save(`Bao_Cao_Tai_San_${currentUser?.username}_${startDate}_${endDate}.pdf`);
        
        onClose();
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.");
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl w-full max-w-6xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${
          isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-slate-50'
        } rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 rounded-lg shadow-lg shadow-rose-500/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Xuất Báo Cáo Tài Sản</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tạo báo cáo PDF chi tiết</p>
            </div>
          </div>
          <button onClick={onClose} className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Split into Config and Preview */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Configuration */}
          <div className={`p-6 w-full md:w-1/4 border-b md:border-b-0 md:border-r ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
            <h4 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              <Calendar className="w-4 h-4" /> Khoảng thời gian
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Từ ngày</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Đến ngày</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Số lượng giao dịch:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredAssets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tổng giá trị:</span>
                <span className={`font-bold text-emerald-500`}>{formatCurrency(totalValue)}</span>
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={isGenerating || filteredAssets.length === 0}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                isGenerating || filteredAssets.length === 0
                ? 'bg-slate-500 cursor-not-allowed opacity-50'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30 active:scale-95'
              }`}
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isGenerating ? 'Đang tạo PDF...' : 'Tải Xuống PDF'}
            </button>
            {filteredAssets.length === 0 && (
                <p className="text-center text-xs text-red-400 mt-2">Không có dữ liệu trong khoảng thời gian này</p>
            )}
          </div>

          {/* Right Side: Preview (And Hidden Print Area) */}
          <div className={`p-6 w-full md:w-3/4 bg-slate-50 relative overflow-y-auto custom-scrollbar`}>
            <div className="mb-2 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Xem trước báo cáo</h4>
            </div>

            {/* This div is visible to user as preview, AND used for html2canvas */}
            <div 
              id="report-to-print" 
              className="bg-white p-8 shadow-sm border border-gray-200 w-full max-w-[900px] mx-auto text-slate-900 h-auto"
            >
              {/* Report Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">BÁO CÁO TÀI SẢN</h1>
                  <p className="text-slate-500 mt-1">AssetFlow Management System</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Người lập báo cáo</p>
                  <p className="font-bold text-lg">{currentUser?.username}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                   <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Khoảng thời gian</p>
                   <p className="font-medium">{formatDate(startDate)} - {formatDate(endDate)}</p>
                </div>
                <div>
                   <p className="text-xs uppercase text-slate-500 font-semibold mb-1">Ngày xuất báo cáo</p>
                   <p className="font-medium">{formatDate(today)}</p>
                </div>
              </div>

              {/* Total Value Highilght */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 text-center">
                  <p className="text-slate-500 mb-1">Tổng Giá Trị Tài Sản Ròng</p>
                  <h2 className="text-4xl font-bold text-blue-600">{formatCurrency(totalValue)}</h2>
              </div>

              {/* Chart Section - Row 1 */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Category Allocation */}
                  <div>
                    <h3 className="font-bold text-base mb-2 border-l-4 border-blue-500 pl-3">Cơ Cấu Theo Loại</h3>
                    <div className="flex flex-col items-center border p-4 rounded-lg bg-white">
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={80}
                                        paddingAngle={1}
                                        dataKey="value"
                                        isAnimationActive={false} // Important for screenshot
                                    >
                                        {categoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Legend layout="horizontal" verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                  </div>

                  {/* Plan Allocation */}
                  <div>
                    <h3 className="font-bold text-base mb-2 border-l-4 border-indigo-500 pl-3">Cơ Cấu Theo Kế Hoạch</h3>
                    <div className="flex flex-col items-center border p-4 rounded-lg bg-white">
                         {planChartData.length > 0 ? (
                            <div className="w-full h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={planChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={80}
                                            paddingAngle={1}
                                            dataKey="value"
                                            isAnimationActive={false}
                                        >
                                            {planChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Legend layout="horizontal" verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                         ) : (
                             <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">Chưa có kế hoạch nào</div>
                         )}
                    </div>
                  </div>
              </div>

              {/* Trends Section */}
               <div className="mb-8 break-inside-avoid">
                  <h3 className="font-bold text-lg mb-4 border-l-4 border-purple-500 pl-3">Xu Hướng Tăng Trưởng</h3>
                  <div className="grid grid-cols-4 gap-4">
                      {ASSET_CATEGORIES.map(cat => {
                           const data = historyData[cat.id];
                           if(!data || data.length === 0) return null;
                           return (
                               <div key={cat.id} className="border rounded p-2">
                                   <div className="flex justify-between items-center mb-2">
                                       <span className="text-[10px] font-bold" style={{color: cat.color}}>{cat.name}</span>
                                       <span className="text-[10px] font-medium">{formatCurrency(data[data.length-1].value)}</span>
                                   </div>
                                   <div className="h-12">
                                       <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data}>
                                                <Line type="monotone" dataKey="value" stroke={cat.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                                                <YAxis domain={['auto', 'auto']} hide />
                                            </LineChart>
                                       </ResponsiveContainer>
                                   </div>
                               </div>
                           )
                      })}
                  </div>
               </div>

              {/* Plans Detail Table */}
              <div className="mb-8 break-inside-avoid">
                  <h3 className="font-bold text-lg mb-4 border-l-4 border-indigo-500 pl-3">Chi Tiết Kế Hoạch</h3>
                  <table className="w-full text-sm text-left border border-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="py-2 px-3 font-semibold text-slate-700 border-b">Tên Kế Hoạch</th>
                            <th className="py-2 px-3 font-semibold text-slate-700 border-b text-right">Giá Trị Hiện Tại</th>
                            <th className="py-2 px-3 font-semibold text-slate-700 border-b text-right">Tỷ Trọng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {planChartData.length > 0 ? planChartData.map((item, idx) => (
                             <tr key={idx} className="border-b last:border-0 border-slate-100">
                                 <td className="py-2 px-3 font-medium text-slate-800">{item.name}</td>
                                 <td className="py-2 px-3 text-right font-bold text-indigo-600">{formatCurrency(item.value)}</td>
                                 <td className="py-2 px-3 text-right text-slate-500">{((item.value / totalValue) * 100).toFixed(1)}%</td>
                             </tr>
                        )) : (
                            <tr><td colSpan={3} className="py-4 text-center text-slate-500">Chưa có dữ liệu kế hoạch</td></tr>
                        )}
                    </tbody>
                  </table>
              </div>

              {/* Data Table */}
              <div>
                <h3 className="font-bold text-lg mb-4 border-l-4 border-slate-500 pl-3">Nhật Ký Giao Dịch</h3>
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-slate-300">
                            <th className="py-2 font-semibold text-slate-600">Ngày</th>
                            <th className="py-2 font-semibold text-slate-600">Tài sản</th>
                            <th className="py-2 font-semibold text-slate-600">Loại</th>
                            <th className="py-2 font-semibold text-slate-600">Kế hoạch</th>
                            <th className="py-2 font-semibold text-slate-600 text-right">Giá trị</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssets.map((asset, idx) => {
                             const cat = ASSET_CATEGORIES.find(c => c.id === asset.category);
                             return (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="py-3 text-slate-500">{formatDate(asset.date)}</td>
                                    <td className="py-3 font-medium text-slate-800">{asset.name}</td>
                                    <td className="py-3">
                                        <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                                            {cat?.name}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-500 text-xs">
                                        {asset.plan || '-'}
                                    </td>
                                    <td className="py-3 text-right font-medium">{formatCurrency(asset.amount)}</td>
                                </tr>
                             )
                        })}
                    </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                  <p>Báo cáo được tạo tự động bởi AssetFlow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;

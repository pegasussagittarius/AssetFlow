import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  DollarSign, TrendingUp, PieChart as PieIcon, List, Trash2, Target
} from 'lucide-react';
import { Asset, User } from '../types';
import { ASSET_CATEGORIES, formatCurrency, formatDate, RISK_PROFILES } from '../constants';

interface DashboardProps {
  assets: Asset[];
  totalValue: number;
  isDark: boolean;
  onDeleteAsset: (id: string) => void;
  currentUser?: User | null;
}

const Card: React.FC<{ children: React.ReactNode; className?: string; isDark: boolean }> = ({ children, className = "", isDark }) => (
  <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
    isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-gray-100 text-slate-800'} ${className}`}>
    {children}
  </div>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: any; colorClass: string; isDark: boolean; subText?: React.ReactNode }> = ({ title, value, icon: Icon, colorClass, isDark, subText }) => (
  <Card isDark={isDark}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{title}</p>
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
        {subText && <div className="mt-1">{subText}</div>}
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </Card>
);

const CategoryTrendChart: React.FC<{ data: any[]; color: string; isDark: boolean }> = ({ data, color, isDark }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} vertical={false} />
          <XAxis dataKey="displayDate" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Giá trị']}
            contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f1f5f9' : '#0f172a', borderRadius: '8px' }}
          />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4, fill: color, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ assets, totalValue, isDark, onDeleteAsset, currentUser }) => {
  // Tính toán danh sách tài sản hiện tại để vẽ biểu đồ tròn
  const currentHoldings = useMemo(() => {
    const latestMap = new Map<string, Asset>();
    const sorted = [...assets].sort((a, b) => {
       const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
       if (dateDiff !== 0) return dateDiff;
       return b.id.localeCompare(a.id);
    });
    
    sorted.forEach(asset => {
      const key = `${asset.name.trim().toLowerCase()}|${asset.category}`;
      if (!latestMap.has(key)) {
        latestMap.set(key, asset);
      }
    });
    return Array.from(latestMap.values());
  }, [assets]);

  const pieChartData = useMemo(() => {
    const grouped = currentHoldings.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
    return ASSET_CATEGORIES.map(cat => ({
      name: cat.name,
      value: grouped[cat.id] || 0,
      color: cat.color
    })).filter(item => item.value > 0);
  }, [currentHoldings]);

  const largestCategory = useMemo(() => {
    if (pieChartData.length === 0) return { name: 'Chưa có', value: 0 };
    return pieChartData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  }, [pieChartData]);

  const historyData = useMemo(() => {
    const trends: Record<string, any[]> = {};
    ASSET_CATEGORIES.forEach(cat => {
      const catAssets = assets.filter(a => a.category === cat.id);
      if (catAssets.length === 0) return;
      
      const dateMap: Record<string, number> = {};
      catAssets.forEach(asset => {
        const dateKey = asset.date ? asset.date.split('T')[0] : 'Unknown';
        dateMap[dateKey] = (dateMap[dateKey] || 0) + asset.amount;
      });
      
      const sortedData = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).map(date => {
            const d = new Date(date);
            return { rawDate: date, displayDate: `${d.getDate()}/${d.getMonth() + 1}`, value: dateMap[date] };
        });
      if (sortedData.length > 0) trends[cat.id] = sortedData;
    });
    return trends;
  }, [assets]);

  const currentRiskProfile = useMemo(() => {
      if (!currentUser?.riskProfile) return null;
      return RISK_PROFILES.find(p => p.id === currentUser.riskProfile);
  }, [currentUser]);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Tổng Giá Trị Ròng" value={formatCurrency(totalValue)} icon={DollarSign} colorClass="bg-emerald-500 text-emerald-600" isDark={isDark} />
        
        {/* Changed this card to show Risk Profile if available, otherwise largest asset */}
        {currentRiskProfile ? (
             <StatCard 
             title="Hồ Sơ Rủi Ro" 
             value={currentRiskProfile.name.split(' (')[0]} // Show shorter name
             icon={Target} 
             colorClass="bg-blue-500 text-blue-600" 
             isDark={isDark} 
             subText={
                <span className="text-xs opacity-70 flex items-center gap-1">
                   <span style={{ backgroundColor: currentRiskProfile.color }} className="w-2 h-2 rounded-full inline-block"></span>
                   {currentRiskProfile.recommendedAllocation.growth}% Tăng trưởng
                </span>
             }
           />
        ) : (
             <StatCard title="Danh Mục Lớn Nhất" value={largestCategory.name} icon={TrendingUp} colorClass="bg-blue-500 text-blue-600" isDark={isDark} />
        )}
       
        <StatCard title="Tổng Số Giao Dịch" value={assets.length} icon={List} colorClass="bg-purple-500 text-purple-600" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card className="h-full flex flex-col min-h-[400px]" isDark={isDark}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><PieIcon className="w-5 h-5 text-slate-400" />Cơ Cấu Tài Sản</h2>
            {totalValue > 0 ? (
              <>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={pieChartData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={2} 
                        dataKey="value" 
                        stroke={isDark ? '#1e293b' : '#fff'} 
                        strokeWidth={2}
                      >
                        {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0', color: isDark ? '#f1f5f9' : '#0f172a', borderRadius: '8px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieChartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{item.name} ({((item.value / totalValue) * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50 min-h-[250px]"><PieIcon className="w-12 h-12 mb-2" /><p>Chưa có dữ liệu</p></div>}
          </Card>
        </div>

        <div className="lg:col-span-2">
            <Card className="h-full" isDark={isDark}>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-slate-400" />Xu Hướng Tăng Trưởng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ASSET_CATEGORIES.map(cat => {
                  const data = historyData[cat.id];
                  if (!data) return null;
                  return (
                    <div key={cat.id} className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-sm flex items-center gap-2" style={{ color: cat.color }}>{cat.name}</h4>
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatCurrency(data[data.length - 1].value)}</span>
                      </div>
                      <CategoryTrendChart data={data} color={cat.color} isDark={isDark} />
                    </div>
                  )
              })}
              {Object.keys(historyData).length === 0 && (
                <div className="col-span-2 flex items-center justify-center h-40 text-slate-500">Chưa có dữ liệu lịch sử</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card isDark={isDark}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><List className="w-5 h-5 text-slate-400" />Nhật Ký & Chi Tiết Tài Sản</h2>
        {assets.length === 0 ? <div className={`text-center py-8 border border-dashed rounded-lg ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>Chưa có dữ liệu.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-sm uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                  <th className="pb-3 font-semibold">Ngày ghi nhận</th><th className="pb-3 font-semibold">Tên Tài Sản</th><th className="pb-3 font-semibold">Loại</th><th className="pb-3 font-semibold text-right">Giá Trị</th><th className="pb-3 font-semibold text-right w-10"></th>
                </tr>
              </thead>
              <tbody className={`text-sm divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-50'}`}>
                {[...assets].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((asset) => {
                  const catInfo = ASSET_CATEGORIES.find(c => c.id === asset.category);
                  return (
                    <tr key={asset.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                      <td className={`py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(asset.date)}</td>
                      <td className={`py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{asset.name}</td>
                      <td className="py-3"><span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${catInfo?.color}20`, color: catInfo?.color }}>{catInfo?.name}</span></td>
                      <td className={`py-3 text-right font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{formatCurrency(asset.amount)}</td>
                      <td className="py-3 text-right"><button onClick={() => onDeleteAsset(asset.id)} className={`transition-colors p-1 ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
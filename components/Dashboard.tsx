
import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ComposedChart, Legend, Area
} from 'recharts';
import { 
  DollarSign, TrendingUp, PieChart as PieIcon, List, Trash2, Target, Flag, Activity, Eye, EyeOff
} from 'lucide-react';
import { Asset, User } from '../types';
import { ASSET_CATEGORIES, ASSET_TERMS, formatCurrency, formatDate, RISK_PROFILES } from '../constants';

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

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: any; 
  colorClass: string; 
  isDark: boolean; 
  subText?: React.ReactNode;
  hideable?: boolean;
}> = ({ title, value, icon: Icon, colorClass, isDark, subText, hideable }) => {
  const [isHidden, setIsHidden] = useState(false);

  return (
    <Card isDark={isDark}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{title}</p>
          
          <div className="flex items-center gap-2">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {hideable && isHidden ? '*******' : value}
            </h3>
            {hideable && (
              <button 
                onClick={() => setIsHidden(!isHidden)}
                className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-gray-100 text-gray-400'}`}
                title={isHidden ? "Hiện số tiền" : "Ẩn số tiền"}
              >
                {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            )}
          </div>

          {subText && <div className="mt-1">{subText}</div>}
        </div>
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </Card>
  );
};

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

// --- Custom Tooltip for Pie Chart ---
const CustomPieTooltip = ({ active, payload, totalValue, isDark }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percent = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
    return (
      <div className={`p-4 rounded-xl shadow-xl border z-50 animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-slate-900/95 border-slate-600' : 'bg-white/95 border-blue-100'}`}>
        <p className={`font-bold mb-1 text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{data.name}</p>
        <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>
          {formatCurrency(data.value)}
        </p>
        <p className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Tỷ trọng: <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{percent}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// --- Custom Tooltip for Bar Chart ---
const CustomBarTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`p-4 rounded-xl shadow-xl border z-50 animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-slate-900/95 border-slate-600' : 'bg-white/95 border-blue-100'}`}>
        <p className={`font-bold mb-1 text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{data.name}</p>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-indigo-600'}`}>
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

// --- Custom Tooltip for Composed Chart ---
const CustomComposedTooltip = ({ active, payload, label, isDark }: any) => {
  if (active && payload && payload.length) {
    const total = payload.find((p: any) => p.dataKey === 'total');
    return (
      <div className={`p-3 rounded-xl shadow-xl border z-50 animate-in fade-in zoom-in duration-200 text-xs ${isDark ? 'bg-slate-900/95 border-slate-600' : 'bg-white/95 border-blue-100'}`}>
        <p className={`font-bold mb-2 text-sm border-b pb-1 ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-700 border-slate-100'}`}>{label}</p>
        {total && (
          <div className="flex justify-between gap-4 mb-2">
             <span className="font-bold text-emerald-500">Tổng tài sản:</span>
             <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(total.value)}</span>
          </div>
        )}
        <div className="space-y-1">
          {payload.filter((p: any) => p.dataKey !== 'total' && p.value > 0).map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className={`flex-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{entry.name}:</span>
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ assets, totalValue, isDark, onDeleteAsset, currentUser }) => {
  const [activeChart, setActiveChart] = useState<'category' | 'term'>('category');
  const [isTableHidden, setIsTableHidden] = useState(false);
  const [areDetailsHidden, setAreDetailsHidden] = useState(false);

  // Tính toán danh sách tài sản hiện tại để vẽ biểu đồ tròn
  const currentHoldings = useMemo(() => {
    const latestMap = new Map<string, Asset>();
    const sorted = [...assets].sort((a, b) => {
       const timeA = new Date(a.date).getTime();
       const timeB = new Date(b.date).getTime();
       const dateDiff = timeB - timeA;
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

  // Data for Category Pie Chart
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

  // Data for Term Pie Chart
  const termChartData = useMemo(() => {
    const grouped = currentHoldings.reduce((acc, item) => {
      const termKey = item.term || 'short_term'; 
      acc[termKey] = (acc[termKey] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    return ASSET_TERMS.map(term => ({
      name: term.name,
      value: grouped[term.id] || 0,
      color: term.color
    })).filter(item => item.value > 0);
  }, [currentHoldings]);

  // Data for Plan Bar Chart
  const planChartData = useMemo(() => {
      const grouped = currentHoldings.reduce((acc, item) => {
          if (item.plan && item.plan.trim() !== '') {
              const planName = item.plan.trim();
              acc[planName] = (acc[planName] || 0) + item.amount;
          }
          return acc;
      }, {} as Record<string, number>);

      return Object.entries(grouped).map(([name, value]) => ({
          name,
          value
      })).sort((a, b) => b.value - a.value); 
  }, [currentHoldings]);

  // FIX: Data for SNAPSHOT Fluctuation Chart (Latest state per day, not cumulative)
  const fluctuationData = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    // 1. Sort all assets chronologically
    const sortedAssets = [...assets].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Identify all unique dates
    const uniqueDates = Array.from(new Set(sortedAssets.map(a => a.date.split('T')[0]))).sort();

    // 3. Build data point by point using SNAPSHOT logic
    const chartData = uniqueDates.map(date => {
        // At this specific date, what is the latest state of my portfolio?
        
        // Filter assets that existed on or before this date
        const validAssets = sortedAssets.filter(a => a.date.split('T')[0] <= date);
        
        // Group by "Name + Category" to find the LATEST entry for that specific asset
        const latestAssetStates = new Map<string, Asset>();
        validAssets.forEach(asset => {
            const key = `${asset.name.trim().toLowerCase()}-${asset.category}`;
            // Since validAssets is sorted by date, setting it in the loop will naturally keep the latest one
            latestAssetStates.set(key, asset);
        });

        // Sum up the values from the snapshot
        let dailyTotal = 0;
        const dailyCategoryTotals: Record<string, number> = {};
        
        // Initialize all categories to 0 to prevent StackedBar chart errors
        ASSET_CATEGORIES.forEach(cat => {
            dailyCategoryTotals[cat.id] = 0;
        });

        latestAssetStates.forEach(asset => {
            dailyTotal += asset.amount;
            dailyCategoryTotals[asset.category] = (dailyCategoryTotals[asset.category] || 0) + asset.amount;
        });

        // Create a FRESH object for this data point
        const dataPoint: any = {
            date: date,
            displayDate: formatDate(date).slice(0, 5), // dd/mm
            total: dailyTotal,
            ...dailyCategoryTotals // Spread category totals
        };

        return dataPoint;
    });

    return chartData;
  }, [assets]);

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
      
      const sortedData = Object.keys(dateMap).sort((a, b) => {
            const timeA = new Date(a).getTime();
            const timeB = new Date(b).getTime();
            return timeA - timeB;
        }).map(date => {
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

  const displayedChartData = activeChart === 'category' ? pieChartData : termChartData;

  return (
    <div className="space-y-6 pb-20">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Tổng Giá Trị Ròng" 
          value={formatCurrency(totalValue)} 
          icon={DollarSign} 
          colorClass="bg-emerald-500 text-emerald-600" 
          isDark={isDark} 
          hideable={true} 
        />
        
        {currentRiskProfile ? (
             <StatCard 
             title="Hồ Sơ Rủi Ro" 
             value={currentRiskProfile.name.split(' (')[0]}
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

      {/* Row 2: Charts Grid (Pie | Plans | Fluctuation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Col 1: Asset Allocation (4 cols ~ 33%) */}
        <div className="lg:col-span-4">
            <Card className="h-full flex flex-col min-h-[400px]" isDark={isDark}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold flex items-center gap-2"><PieIcon className="w-5 h-5 text-slate-400" />Cơ Cấu Tài Sản</h2>
                <div className={`flex p-0.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <button onClick={() => setActiveChart('category')} className={`text-[10px] px-2 py-1 rounded font-medium transition-all ${activeChart === 'category' ? (isDark ? 'bg-slate-600 text-white shadow-sm' : 'bg-white shadow text-blue-600') : 'text-slate-500 hover:text-slate-700'}`}>Loại</button>
                    <button onClick={() => setActiveChart('term')} className={`text-[10px] px-2 py-1 rounded font-medium transition-all ${activeChart === 'term' ? (isDark ? 'bg-slate-600 text-white shadow-sm' : 'bg-white shadow text-blue-600') : 'text-slate-500 hover:text-slate-700'}`}>Kỳ hạn</button>
                </div>
            </div>

            {totalValue > 0 ? (
              <>
                <div className="w-full h-[220px] mb-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={displayedChartData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={75} 
                        paddingAngle={3} 
                        dataKey="value" 
                        stroke={isDark ? '#1e293b' : '#fff'} 
                        strokeWidth={2}
                      >
                        {displayedChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip totalValue={totalValue} isDark={isDark} />} />
                    </PieChart>
                  </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center opacity-80">
                         <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tổng</p>
                         <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>100%</p>
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1 max-h-[150px]">
                  {displayedChartData.sort((a,b) => b.value - a.value).map((item) => (
                    <div key={item.name} className={`flex items-center justify-between p-2 rounded border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className={`font-medium text-xs truncate max-w-[100px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.name}</span>
                      </div>
                      <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {((item.value / totalValue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="flex-1 flex items-center justify-center opacity-50"><p>Chưa có dữ liệu</p></div>}
          </Card>
        </div>

        {/* Col 2: Plans (3 cols ~ 25% - SHRUNK) */}
        <div className="lg:col-span-3">
             <Card className="h-full flex flex-col min-h-[400px]" isDark={isDark}>
                <h2 className="text-base font-bold flex items-center gap-2 mb-4"><Flag className="w-5 h-5 text-slate-400" />Kế Hoạch</h2>
                {planChartData.length > 0 ? (
                    <div className="flex-1 flex flex-col">
                         <div className="h-[200px] w-full mb-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  layout="vertical"
                                  data={planChartData.slice(0, 5)} // Show top 5 only for compactness
                                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                      type="category" 
                                      dataKey="name" 
                                      hide
                                    />
                                    <Tooltip cursor={{fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4}} content={<CustomBarTooltip isDark={isDark} />} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} background={{ fill: isDark ? '#1e293b' : '#f1f5f9' }} />
                                </BarChart>
                            </ResponsiveContainer>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1.5">
                            {planChartData.map((item, index) => (
                                <div key={index} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs">
                                        <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.name}</span>
                                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(item.value)}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(item.value / totalValue * 100)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
                        <Flag className="w-8 h-8 mb-2" />
                        <p className="text-center text-xs">Chưa có kế hoạch.</p>
                    </div>
                )}
             </Card>
        </div>

        {/* Col 3: Asset Fluctuation (5 cols ~ 42% - NEW FEATURE) */}
        <div className="lg:col-span-5">
            <Card className="h-full flex flex-col min-h-[400px]" isDark={isDark}>
                 <h2 className="text-base font-bold flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-slate-400" />
                    Biến Động Tài Sản
                 </h2>
                 
                 {fluctuationData.length > 0 ? (
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={fluctuationData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                                <XAxis 
                                    dataKey="displayDate" 
                                    stroke={isDark ? "#94a3b8" : "#64748b"} 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomComposedTooltip isDark={isDark} />} />
                                
                                {/* Render Stacked Bars for each Category */}
                                {ASSET_CATEGORIES.map((cat) => (
                                    <Bar 
                                        key={cat.id} 
                                        dataKey={cat.id} 
                                        name={cat.name} 
                                        stackId="a" 
                                        fill={cat.color} 
                                        radius={[0,0,0,0]}
                                        barSize={20}
                                    />
                                ))}

                                {/* Render Line for Total Value */}
                                <Line 
                                    type="monotone" 
                                    dataKey="total" 
                                    name="Tổng tài sản" 
                                    stroke="#10b981" 
                                    strokeWidth={3} 
                                    dot={{ r: 3, fill: "#10b981", strokeWidth: 2, stroke: isDark ? "#1e293b" : "#fff" }} 
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
                        <Activity className="w-8 h-8 mb-2" />
                        <p className="text-center text-xs">Chưa có dữ liệu biến động.</p>
                    </div>
                 )}
                 <div className="mt-2 text-center text-[10px] text-slate-400">
                    * Biểu đồ thể hiện giá trị tích lũy theo thời gian nhập liệu
                 </div>
            </Card>
        </div>
      </div>

      {/* Row 3: Detail Trend Chart */}
      <div className="grid grid-cols-1">
        <Card className="h-full" isDark={isDark}>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-slate-400" />Biến Động Từng Loại Tài Sản</h2>
                 <button 
                    onClick={() => setAreDetailsHidden(!areDetailsHidden)}
                    className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-gray-100 text-gray-400'}`}
                    title={areDetailsHidden ? "Hiện chi tiết" : "Ẩn chi tiết"}
                >
                    {areDetailsHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ASSET_CATEGORIES.map(cat => {
                  const data = historyData[cat.id];
                  if (!data) return null;
                  return (
                    <div key={cat.id} className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-xs flex items-center gap-1.5" style={{ color: cat.color }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                            {cat.name}
                        </h4>
                        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                             {areDetailsHidden ? '*******' : formatCurrency(data[data.length - 1].value)}
                        </span>
                      </div>
                      <div className="h-[80px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data}>
                                <Bar dataKey="value" fill={cat.color} fillOpacity={0.8} radius={[2, 2, 0, 0]} barSize={20} />
                                <Line type="monotone" dataKey="value" stroke={cat.color} strokeWidth={2} dot={false} />
                            </ComposedChart>
                         </ResponsiveContainer>
                      </div>
                    </div>
                  )
              })}
            </div>
          </Card>
      </div>

      <Card isDark={isDark}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><List className="w-5 h-5 text-slate-400" />Nhật Ký & Chi Tiết Tài Sản</h2>
        {assets.length === 0 ? <div className={`text-center py-8 border border-dashed rounded-lg ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>Chưa có dữ liệu.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-sm uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                  <th className="pb-3 font-semibold">Ngày ghi nhận</th>
                  <th className="pb-3 font-semibold">Tên Tài Sản</th>
                  <th className="pb-3 font-semibold">Loại</th>
                  <th className="pb-3 font-semibold">Kỳ hạn</th>
                  <th className="pb-3 font-semibold">Kế hoạch</th>
                  <th className="pb-3 font-semibold text-right">
                    <div className="flex items-center justify-end gap-2">
                        <span>Giá Trị</span>
                        <button 
                            onClick={() => setIsTableHidden(!isTableHidden)}
                            className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}
                            title={isTableHidden ? "Hiện chi tiết" : "Ẩn chi tiết"}
                        >
                            {isTableHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                    </div>
                  </th>
                  <th className="pb-3 font-semibold text-right w-10"></th>
                </tr>
              </thead>
              <tbody className={`text-sm divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-50'}`}>
                {[...assets].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((asset) => {
                  const catInfo = ASSET_CATEGORIES.find(c => c.id === asset.category);
                  const termInfo = ASSET_TERMS.find(t => t.id === asset.term);
                  
                  return (
                    <tr key={asset.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                      <td className={`py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(asset.date)}</td>
                      <td className={`py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{asset.name}</td>
                      <td className="py-3"><span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${catInfo?.color}20`, color: catInfo?.color }}>{catInfo?.name}</span></td>
                      <td className="py-3">
                         <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: termInfo?.color || '#ccc' }}></div>
                            {termInfo?.name || 'Ngắn hạn'}
                         </span>
                      </td>
                      <td className={`py-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {asset.plan ? <span className={`px-2 py-1 rounded text-xs border ${isDark ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-100'}`}>{asset.plan}</span> : '-'}
                      </td>
                      <td className={`py-3 text-right font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {isTableHidden ? '*******' : formatCurrency(asset.amount)}
                      </td>
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

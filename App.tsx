import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Wallet, LogOut, Plus, X, Sparkles, Download, Upload, Settings, FileText, Calculator, CreditCard } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import AIAdvisorModal from './components/AIModal';
import SettingsModal from './components/SettingsModal';
import ExportReportModal from './components/ExportReportModal';
import RiskSurveyModal from './components/RiskSurveyModal';
import CICInfoModal from './components/CICInfoModal';
import { Asset, User, AssetCategoryType, RiskLevel, AssetTermType } from './types';
import { ASSET_CATEGORIES, ASSET_TERMS, DEFAULT_GOLD_PRICE, DEFAULT_EXCHANGE_RATE } from './constants';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRiskSurveyOpen, setIsRiskSurveyOpen] = useState(false);
  const [isCICInfoOpen, setIsCICInfoOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [newAsset, setNewAsset] = useState<{ name: string; category: AssetCategoryType; term: AssetTermType; plan: string; amount: string; date: string }>({ 
    name: '', category: 'stock', term: 'short_term', plan: '', amount: '', date: today 
  });

  // State hỗ trợ tính toán Vàng
  const [goldInputs, setGoldInputs] = useState({ taels: '', mace: '', pricePerMace: DEFAULT_GOLD_PRICE.toString() });
  
  // State hỗ trợ tính toán Ngoại tệ
  const [fcInputs, setFcInputs] = useState({ quantity: '', exchangeRate: DEFAULT_EXCHANGE_RATE.toString() });

  useEffect(() => {
    if (currentUser) {
      const storageKey = `assets_${currentUser.id}`;
      const saved = localStorage.getItem(storageKey);
      setAssets(saved ? JSON.parse(saved) : []);
    } else {
      setAssets([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const storageKey = `assets_${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(assets));
    }
  }, [assets, currentUser]);

  // Reset inputs when modal opens or category changes
  useEffect(() => {
    if (isAddModalOpen) {
      if (newAsset.category !== 'gold') {
         setGoldInputs({ taels: '', mace: '', pricePerMace: DEFAULT_GOLD_PRICE.toString() });
      }
      if (newAsset.category !== 'foreign_currency') {
         setFcInputs({ quantity: '', exchangeRate: DEFAULT_EXCHANGE_RATE.toString() });
      }
    }
  }, [isAddModalOpen, newAsset.category]);

  // Auto calculate gold value
  useEffect(() => {
    if (newAsset.category === 'gold') {
      const taels = parseFloat(goldInputs.taels) || 0;
      const mace = parseFloat(goldInputs.mace) || 0;
      const price = parseFloat(goldInputs.pricePerMace) || 0;
      
      const totalMace = (taels * 10) + mace;
      const calculatedValue = totalMace * price;
      
      if (calculatedValue > 0) {
        setNewAsset(prev => ({ ...prev, amount: calculatedValue.toString() }));
      }
    }
  }, [goldInputs, newAsset.category]);

  // Auto calculate Foreign Currency value
  useEffect(() => {
    if (newAsset.category === 'foreign_currency') {
      const quantity = parseFloat(fcInputs.quantity) || 0;
      const rate = parseFloat(fcInputs.exchangeRate) || 0;
      
      const calculatedValue = quantity * rate;
      
      if (calculatedValue > 0) {
        setNewAsset(prev => ({ ...prev, amount: calculatedValue.toString() }));
      }
    }
  }, [fcInputs, newAsset.category]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Logic: Update user profile (username, phone & risk profile)
  const updateUserStorage = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    const usersStr = localStorage.getItem('dashboard_users');
    if (usersStr) {
      const users: User[] = JSON.parse(usersStr);
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('dashboard_users', JSON.stringify(updatedUsers));
    }
  };

  const handleUpdateUserInfo = (newUsername: string, newPhoneNumber: string, creditScore?: number) => {
    if (!currentUser) return;
    const updatedUser = { 
      ...currentUser, 
      username: newUsername,
      phoneNumber: newPhoneNumber,
      creditScore: creditScore
    };
    updateUserStorage(updatedUser);
  };

  const handleSaveRiskProfile = (profileId: RiskLevel) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      riskProfile: profileId
    };
    updateUserStorage(updatedUser);
  };

  // Logic mới: Lấy danh sách tài sản "hiện tại" (mới nhất theo Tên + Loại)
  const currentAssets = useMemo(() => {
    const latestMap = new Map<string, Asset>();
    
    // Sắp xếp: Ngày mới nhất trước -> ID (thời gian tạo) lớn nhất trước
    const sortedAssets = [...assets].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id.localeCompare(a.id);
    });

    sortedAssets.forEach(asset => {
      // Key duy nhất là sự kết hợp giữa Tên (chuẩn hoá) và Loại
      const key = `${asset.name.trim().toLowerCase()}|${asset.category}`;
      if (!latestMap.has(key)) {
        latestMap.set(key, asset);
      }
    });

    return Array.from(latestMap.values());
  }, [assets]);

  // Tổng giá trị tính trên danh sách tài sản hiện tại (đã lọc)
  const totalValue = useMemo(() => currentAssets.reduce((sum, item) => sum + item.amount, 0), [currentAssets]);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.amount || !newAsset.date) return;
    const newItem: Asset = { 
      id: Date.now().toString(), 
      name: newAsset.name, 
      category: newAsset.category, 
      term: newAsset.term,
      plan: newAsset.plan, // Lưu tên kế hoạch
      amount: parseFloat(newAsset.amount), 
      date: newAsset.date 
    };
    setAssets([...assets, newItem]);
    setNewAsset({ name: '', category: 'stock', term: 'short_term', plan: '', amount: '', date: today });
    setGoldInputs({ taels: '', mace: '', pricePerMace: DEFAULT_GOLD_PRICE.toString() }); // Reset gold inputs
    setFcInputs({ quantity: '', exchangeRate: DEFAULT_EXCHANGE_RATE.toString() }); // Reset FC inputs
    setIsAddModalOpen(false);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài sản này?')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleExportData = () => {
    if (assets.length === 0) {
      alert("Chưa có dữ liệu để xuất.");
      return;
    }
    const dataStr = JSON.stringify(assets, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assetflow_backup_${currentUser?.username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        if (Array.isArray(parsedData)) {
          // Basic validation checking if items look like assets
          const isValid = parsedData.every(item => item.id && item.name && item.amount !== undefined);
          
          if (isValid) {
            if (window.confirm(`Tìm thấy ${parsedData.length} tài sản trong file. Bạn có muốn thay thế dữ liệu hiện tại bằng dữ liệu này không?`)) {
              setAssets(parsedData);
              alert("Nhập dữ liệu thành công!");
            }
          } else {
            alert("Cấu trúc file không hợp lệ.");
          }
        } else {
          alert("File không chứa danh sách tài sản hợp lệ.");
        }
      } catch (error) {
        alert("Lỗi khi đọc file. Vui lòng kiểm tra lại file JSON.");
      }
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!currentUser) return <AuthScreen onLogin={handleLogin} isDark={isDarkMode} toggleTheme={toggleTheme} />;

  return (
    <div className={`min-h-screen transition-colors duration-200 p-4 md:p-8 font-sans ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Wallet className="w-8 h-8 text-blue-600" />
            Quản Lý Tài Sản
          </h1>
          <div className="mt-2">
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center gap-2`}>
              Xin chào, <span className="font-bold text-blue-500">{currentUser.username}</span>
            </p>
            {currentUser.creditScore && (
              <button 
                onClick={() => setIsCICInfoOpen(true)}
                title="Xem chi tiết xếp hạng tín dụng"
                className={`inline-flex items-center gap-2 px-3 py-1.5 mt-2 rounded-lg border shadow-sm transition-all hover:scale-105 cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' 
                  : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}>
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-medium">Điểm CIC: <span className="text-lg font-bold ml-1">{currentUser.creditScore}</span></span>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Hidden File Input for Import */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            style={{ display: 'none' }} 
          />

          <button 
            onClick={() => setIsExportModalOpen(true)}
            title="Xuất báo cáo PDF"
            className={`p-2.5 rounded-lg transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-rose-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-rose-600 hover:bg-gray-50'}`}
          >
            <FileText className="w-5 h-5" />
          </button>

          <button 
            onClick={handleExportData} 
            title="Xuất dữ liệu (Backup JSON)"
            className={`p-2.5 rounded-lg transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-emerald-600 hover:bg-gray-50'}`}
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleImportClick} 
            title="Nhập dữ liệu (Restore)"
            className={`p-2.5 rounded-lg transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-orange-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-orange-600 hover:bg-gray-50'}`}
          >
            <Upload className="w-5 h-5" />
          </button>

          <div className={`h-8 w-[1px] mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

          {/* Settings Button */}
          <button 
            onClick={() => setIsSettingsModalOpen(true)} 
            title="Cài đặt" 
            className={`p-2.5 rounded-lg transition-colors border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'}`}
          >
             <Settings className="w-5 h-5" />
          </button>
          
          <button onClick={handleLogout} title="Đăng xuất" className={`p-2.5 rounded-lg transition-colors border flex items-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-red-600 hover:bg-gray-50'}`}><LogOut className="w-5 h-5" /></button>
          
          <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 ml-2">
            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Thêm</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <Dashboard 
            assets={assets} 
            totalValue={totalValue} 
            isDark={isDarkMode} 
            onDeleteAsset={handleDeleteAsset}
            currentUser={currentUser} // Pass currentUser to show risk profile
        />
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setIsAIModalOpen(true)} className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      <AIAdvisorModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        assets={currentAssets} 
        totalValue={totalValue} 
        isDark={isDarkMode}
        currentUser={currentUser} // Pass current user for AI context
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        isDark={isDarkMode}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUserInfo}
        onOpenRiskSurvey={() => {
            setIsSettingsModalOpen(false);
            setIsRiskSurveyOpen(true);
        }}
      />

      <RiskSurveyModal
        isOpen={isRiskSurveyOpen}
        onClose={() => setIsRiskSurveyOpen(false)}
        isDark={isDarkMode}
        onSaveProfile={handleSaveRiskProfile}
        currentProfileId={currentUser.riskProfile}
      />
      
      <CICInfoModal
        isOpen={isCICInfoOpen}
        onClose={() => setIsCICInfoOpen(false)}
        isDark={isDarkMode}
        currentScore={currentUser.creditScore}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        assets={assets}
        currentUser={currentUser}
        isDark={isDarkMode}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} sticky top-0 bg-inherit z-10 rounded-t-2xl`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Thêm Tài Sản</h3>
              <button onClick={() => setIsAddModalOpen(false)} className={`${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleAddAsset} className="p-6 space-y-4">
              <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Ngày ghi nhận</label>
                  <input type="date" required className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white scheme-dark' : 'bg-white border-gray-300'}`} value={newAsset.date} onChange={(e) => setNewAsset({ ...newAsset, date: e.target.value })} />
              </div>
              <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Tên tài sản</label>
                  <input type="text" required className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'}`} value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Loại tài sản</label>
                      <select className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'}`} value={newAsset.category} onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as AssetCategoryType })}>
                        {ASSET_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Kỳ hạn</label>
                      <select className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'}`} value={newAsset.term} onChange={(e) => setNewAsset({ ...newAsset, term: e.target.value as AssetTermType })}>
                        {ASSET_TERMS.map(term => <option key={term.id} value={term.id}>{term.name}</option>)}
                      </select>
                  </div>
              </div>

              <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Kế hoạch (Tùy chọn)</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Mua nhà, Đám cưới, Nghỉ hưu..." 
                    className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-300'}`} 
                    value={newAsset.plan || ''} 
                    onChange={(e) => setNewAsset({ ...newAsset, plan: e.target.value })} 
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Điền tên để thêm tài sản vào mục "Kế hoạch". Bỏ trống nếu không cần.</p>
              </div>

              {/* Gold Calculator UI */}
              {newAsset.category === 'gold' && (
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-yellow-500" />
                    <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Quy đổi Vàng (1 Cây = 10 Chỉ)</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                     <div>
                       <label className={`block text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Số Lượng (Cây/Lượng)</label>
                       <input 
                          type="number" 
                          placeholder="0" 
                          min="0"
                          step="0.01"
                          className={`w-full p-2 rounded border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          value={goldInputs.taels}
                          onChange={e => setGoldInputs({...goldInputs, taels: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className={`block text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Số Lượng (Chỉ)</label>
                       <input 
                          type="number" 
                          placeholder="0" 
                          min="0"
                          step="0.1"
                          className={`w-full p-2 rounded border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          value={goldInputs.mace}
                          onChange={e => setGoldInputs({...goldInputs, mace: e.target.value})}
                       />
                     </div>
                  </div>
                  
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Đơn giá 1 Chỉ (VND)</label>
                    <input 
                      type="number" 
                      className={`w-full p-2 rounded border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                      value={goldInputs.pricePerMace}
                      onChange={e => setGoldInputs({...goldInputs, pricePerMace: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Foreign Currency Calculator UI */}
              {newAsset.category === 'foreign_currency' && (
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-teal-900/10 border-teal-500/30' : 'bg-teal-50 border-teal-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-teal-500" />
                    <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>Quy đổi Ngoại tệ</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className={`block text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Số Lượng</label>
                       <input 
                          type="number" 
                          placeholder="0" 
                          min="0"
                          step="0.01"
                          className={`w-full p-2 rounded border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          value={fcInputs.quantity}
                          onChange={e => setFcInputs({...fcInputs, quantity: e.target.value})}
                       />
                     </div>
                     <div>
                       <label className={`block text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tỷ giá (VND)</label>
                       <input 
                          type="number" 
                          placeholder="0" 
                          className={`w-full p-2 rounded border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          value={fcInputs.exchangeRate}
                          onChange={e => setFcInputs({...fcInputs, exchangeRate: e.target.value})}
                       />
                     </div>
                  </div>
                </div>
              )}

              <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Giá trị (VND) {(newAsset.category === 'gold' || newAsset.category === 'foreign_currency') && <span className="text-xs font-normal text-yellow-500">(Tự động tính)</span>}</label>
                  <input type="number" required min="0" className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'}`} value={newAsset.amount} onChange={(e) => setNewAsset({ ...newAsset, amount: e.target.value })} />
              </div>
              <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className={`flex-1 px-4 py-2.5 border rounded-lg ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
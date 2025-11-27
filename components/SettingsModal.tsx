import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Moon, Sun, User, Save, CheckCircle, Phone, Target, ChevronRight, CreditCard, Camera, Cloud, Download, Upload, Loader2, AlertTriangle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { User as UserType, GoogleSyncConfig } from '../types';
import { RISK_PROFILES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: UserType;
  onUpdateUser: (newUsername: string, newPhoneNumber: string, creditScore?: number, avatar?: string) => void;
  onOpenRiskSurvey: () => void;
  onSyncGoogle: (action: 'backup' | 'restore', config: GoogleSyncConfig) => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  isDark, 
  toggleTheme, 
  currentUser, 
  onUpdateUser,
  onOpenRiskSurvey,
  onSyncGoogle
}) => {
  const [username, setUsername] = useState(currentUser.username);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber);
  const [creditScore, setCreditScore] = useState<string>(currentUser.creditScore ? currentUser.creditScore.toString() : '');
  const [avatar, setAvatar] = useState<string>(currentUser.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Google Sync State
  const [googleConfig, setGoogleConfig] = useState<GoogleSyncConfig>(() => {
    const saved = localStorage.getItem('google_sync_config');
    return saved ? JSON.parse(saved) : { clientId: '', apiKey: '' };
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [showGoogleKeys, setShowGoogleKeys] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentRiskProfile = useMemo(() => {
    if (!currentUser.riskProfile) return null;
    return RISK_PROFILES.find(p => p.id === currentUser.riskProfile);
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUser.username);
      setPhoneNumber(currentUser.phoneNumber);
      setCreditScore(currentUser.creditScore ? currentUser.creditScore.toString() : '');
      setAvatar(currentUser.avatar || '');
      setError('');
      setSuccess('');
      setSyncMsg('');
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    localStorage.setItem('google_sync_config', JSON.stringify(googleConfig));
  }, [googleConfig]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError('Ảnh quá lớn. Vui lòng chọn ảnh dưới 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatar(result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = username.trim();
    const trimmedPhone = phoneNumber.trim();
    const parsedScore = creditScore ? parseInt(creditScore) : undefined;

    if (!trimmedName) {
      setError('Tên hiển thị không được để trống');
      return;
    }
    if (!trimmedPhone) {
        setError('Số điện thoại không được để trống');
        return;
    }
    
    // Validate duplicates
    const usersStr = localStorage.getItem('dashboard_users');
    if (usersStr) {
        const users: UserType[] = JSON.parse(usersStr);
        const phoneExists = users.some(u => u.id !== currentUser.id && u.phoneNumber === trimmedPhone);
        if (phoneExists) {
            setError('Số điện thoại này đã được sử dụng bởi tài khoản khác');
            return;
        }
    }

    onUpdateUser(trimmedName, trimmedPhone, parsedScore, avatar);
    setSuccess('Cập nhật thông tin thành công!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleGoogleAction = async (action: 'backup' | 'restore') => {
      if (!googleConfig.clientId || !googleConfig.apiKey) {
          setError('Vui lòng nhập Client ID và API Key trước khi đồng bộ');
          return;
      }
      setIsSyncing(true);
      setSyncMsg('');
      try {
          await onSyncGoogle(action, googleConfig);
          if (action === 'backup') {
              const now = new Date().toLocaleString('vi-VN');
              setGoogleConfig(prev => ({...prev, lastSync: now}));
              setSuccess('Đã sao lưu lên Drive thành công!');
          } else {
              setSuccess('Đã khôi phục dữ liệu thành công!');
              // Wait a bit then close to refresh
              setTimeout(() => {
                  window.location.reload();
              }, 1500);
          }
      } catch (err: any) {
          setError('Lỗi đồng bộ: ' + (err.message || JSON.stringify(err)));
      } finally {
          setIsSyncing(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      }`}>
        <div className={`p-5 border-b flex justify-between items-center ${
          isDark ? 'border-slate-700' : 'border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cài Đặt</h3>
          <button onClick={onClose} className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Section 1: Tài khoản */}
          <div>
             <h4 className={`text-sm font-semibold uppercase mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Thông tin tài khoản
            </h4>
            
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                   {avatar ? (
                     <img 
                       src={avatar} 
                       alt="Avatar" 
                       className={`w-20 h-20 rounded-full object-cover border-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`} 
                     />
                   ) : (
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${isDark ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-slate-100 border-white text-slate-400'}`}>
                       <User className="w-10 h-10" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                   </div>
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <div>
                    <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tên hiển thị</label>
                    <input type="text" className={`w-full p-2.5 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-gray-300'}`} value={username} onChange={(e) => setUsername(e.target.value)} />
                 </div>
                 <div>
                    <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Số điện thoại</label>
                    <input type="tel" className={`w-full p-2.5 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-gray-300'}`} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                 </div>
                 <div>
                    <label className={`text-xs font-medium mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Điểm CIC</label>
                    <input type="number" className={`w-full p-2.5 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50 border-gray-300'}`} value={creditScore} onChange={(e) => setCreditScore(e.target.value)} placeholder="0" />
                 </div>
              </div>

              <button type="submit" className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                <Save className="w-4 h-4" /> Lưu thông tin
              </button>
            </form>
          </div>

          {/* Section 2: Google Sync */}
          <div>
            <h4 className={`text-sm font-semibold uppercase mb-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
               <Cloud className="w-4 h-4" /> Đồng bộ hóa Đám mây
            </h4>
            
            <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cấu hình Google Drive</span>
                    <button onClick={() => setShowGoogleKeys(!showGoogleKeys)} className={`text-xs underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {showGoogleKeys ? 'Ẩn' : 'Thiết lập'}
                    </button>
                </div>

                {showGoogleKeys && (
                    <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className={`text-[10px] uppercase font-bold mb-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Client ID</label>
                            <input type="text" value={googleConfig.clientId} onChange={(e) => setGoogleConfig({...googleConfig, clientId: e.target.value})} className={`w-full p-2 text-xs rounded border outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`} placeholder="...apps.googleusercontent.com" />
                        </div>
                        <div>
                            <label className={`text-[10px] uppercase font-bold mb-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>API Key</label>
                            <div className="relative">
                                <input type="password" value={googleConfig.apiKey} onChange={(e) => setGoogleConfig({...googleConfig, apiKey: e.target.value})} className={`w-full p-2 text-xs rounded border outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'}`} placeholder="AIza..." />
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-500 italic">
                            * Yêu cầu tạo Project trên Google Cloud Console và enable Drive API.
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => handleGoogleAction('backup')}
                        disabled={isSyncing}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${isDark ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                    >
                        {isSyncing ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Upload className="w-5 h-5 text-blue-500" />}
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Sao lưu</span>
                    </button>
                    <button 
                        onClick={() => handleGoogleAction('restore')}
                        disabled={isSyncing}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${isDark ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-white border-gray-300 hover:bg-orange-50 hover:border-orange-300'}`}
                    >
                        {isSyncing ? <Loader2 className="w-5 h-5 animate-spin text-orange-500" /> : <Download className="w-5 h-5 text-orange-500" />}
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Khôi phục</span>
                    </button>
                </div>
                {googleConfig.lastSync && (
                    <p className={`text-[10px] text-center mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Lần cuối: {googleConfig.lastSync}</p>
                )}
            </div>
          </div>

          {/* Section 3: Hồ sơ rủi ro */}
          <div>
            <h4 className={`text-sm font-semibold uppercase mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Hồ sơ đầu tư
            </h4>
            <button 
                onClick={onOpenRiskSurvey}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all group ${
                    isDark ? 'bg-slate-900/50 border-slate-600 hover:bg-slate-800' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                        <Target className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Hồ sơ rủi ro</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                           {currentRiskProfile ? (
                               <span style={{ color: currentRiskProfile.color }} className="font-bold">{currentRiskProfile.name}</span>
                           ) : 'Chưa thiết lập'}
                        </p>
                    </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Section 4: Giao diện */}
          <div>
            <h4 className={`text-sm font-semibold uppercase mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Giao diện
            </h4>
            <button 
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                isDark ? 'bg-slate-900/50 border-slate-600' : 'bg-slate-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-orange-500'}`}>
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}
                </span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200 ${isDark ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
          
          {/* Messages */}
          {error && (
             <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
             </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 text-emerald-500 text-xs bg-emerald-500/10 p-3 rounded-lg animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
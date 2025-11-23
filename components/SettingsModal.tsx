import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, User, Save, CheckCircle, Phone, Target, ChevronRight } from 'lucide-react';
import { User as UserType } from '../types';
import { RISK_PROFILES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: UserType;
  onUpdateUser: (newUsername: string, newPhoneNumber: string) => void;
  onOpenRiskSurvey: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  isDark, 
  toggleTheme, 
  currentUser, 
  onUpdateUser,
  onOpenRiskSurvey
}) => {
  const [username, setUsername] = useState(currentUser.username);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form state when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUser.username);
      setPhoneNumber(currentUser.phoneNumber);
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentUser]);

  const currentRiskProfile = RISK_PROFILES.find(p => p.id === currentUser.riskProfile);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedName = username.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedName) {
      setError('Tên hiển thị không được để trống');
      return;
    }

    if (!trimmedPhone) {
        setError('Số điện thoại không được để trống');
        return;
    }
    
    // Check if no changes were made
    if (trimmedName === currentUser.username && trimmedPhone === currentUser.phoneNumber) {
        return;
    }

    // Check validation against other users in localStorage
    const usersStr = localStorage.getItem('dashboard_users');
    if (usersStr) {
        const users: UserType[] = JSON.parse(usersStr);
        
        // Check if phone number is taken by ANOTHER user
        const phoneExists = users.some(u => u.id !== currentUser.id && u.phoneNumber === trimmedPhone);
        if (phoneExists) {
            setError('Số điện thoại này đã được sử dụng bởi tài khoản khác');
            return;
        }

        // Check if username is taken by ANOTHER user (optional but recommended)
        const usernameExists = users.some(u => u.id !== currentUser.id && u.username === trimmedName);
        if (usernameExists) {
            setError('Tên đăng nhập này đã được sử dụng');
            return;
        }
    }

    onUpdateUser(trimmedName, trimmedPhone);
    setSuccess('Cập nhật thông tin thành công!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh] ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${
          isDark ? 'border-slate-700' : 'border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cài Đặt</h3>
          <button onClick={onClose} className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Section: Hồ sơ rủi ro */}
          <div>
            <h4 className={`text-sm font-semibold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Hồ sơ đầu tư
            </h4>
            <button 
                onClick={onOpenRiskSurvey}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${
                    isDark 
                    ? 'bg-slate-900/50 border-slate-600 hover:bg-slate-800' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                        <Target className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Hồ sơ rủi ro</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} mt-0.5`}>
                           {currentRiskProfile ? (
                               <span style={{ color: currentRiskProfile.color }} className="font-bold">{currentRiskProfile.name}</span>
                           ) : 'Chưa thiết lập'}
                        </p>
                    </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Section: Giao diện */}
          <div>
            <h4 className={`text-sm font-semibold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Giao diện ứng dụng
            </h4>
            <button 
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-900/50 border-slate-600 hover:border-slate-500' 
                  : 'bg-slate-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-orange-500 shadow-sm'}`}>
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {isDark ? 'Dễ chịu cho mắt vào ban đêm' : 'Sáng sủa và rõ ràng'}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-200 ${isDark ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
          </div>

          {/* Section: Tài khoản */}
          <div>
             <h4 className={`text-sm font-semibold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Thông tin tài khoản
            </h4>
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Tên hiển thị
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full p-3 pl-10 rounded-lg border outline-none transition-all ${
                       isDark 
                        ? 'bg-slate-900 border-slate-600 focus:border-blue-500 text-white' 
                        : 'bg-slate-50 border-gray-300 focus:border-blue-500 text-gray-900'
                    }`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên của bạn"
                  />
                  <User className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Số điện thoại
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    className={`w-full p-3 pl-10 rounded-lg border outline-none transition-all ${
                       isDark 
                        ? 'bg-slate-900 border-slate-600 focus:border-blue-500 text-white' 
                        : 'bg-slate-50 border-gray-300 focus:border-blue-500 text-gray-900'
                    }`}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                  <Phone className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-500/10 p-2 rounded">{error}</p>}
              
              {success && (
                <div className="flex items-center gap-2 text-emerald-500 text-sm bg-emerald-500/10 p-2 rounded-lg animate-in fade-in">
                  <CheckCircle className="w-4 h-4" /> {success}
                </div>
              )}

              <button 
                type="submit"
                className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
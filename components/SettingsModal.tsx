import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, User, Save, CheckCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentUser: UserType;
  onUpdateUser: (newUsername: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  isDark, 
  toggleTheme, 
  currentUser, 
  onUpdateUser 
}) => {
  const [username, setUsername] = useState(currentUser.username);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset form state when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUser.username);
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentUser]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Tên hiển thị không được để trống');
      return;
    }
    
    if (username.trim() === currentUser.username) {
        return;
    }

    onUpdateUser(username.trim());
    setSuccess('Đã cập nhật tên thành công!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 ${
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

        <div className="p-6 space-y-6">
          
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
            <form onSubmit={handleSaveName} className="space-y-3">
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

              {error && <p className="text-red-500 text-xs">{error}</p>}
              
              {success && (
                <div className="flex items-center gap-2 text-emerald-500 text-sm bg-emerald-500/10 p-2 rounded-lg">
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
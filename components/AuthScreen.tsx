import React, { useState } from 'react';
import { Wallet, User, Lock, UserPlus, Sun, Moon, Phone, Key, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, isDark, toggleTheme }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [error, setError] = useState('');
  const [recoveredInfo, setRecoveredInfo] = useState<{username: string, pin: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveredInfo(null);

    const users: UserType[] = JSON.parse(localStorage.getItem('dashboard_users') || '[]');

    // Handle Forgot Password Logic
    if (isForgotPassword) {
      if (!phoneNumber) {
        setError('Vui lòng nhập số điện thoại để tra cứu');
        return;
      }
      const user = users.find(u => u.phoneNumber === phoneNumber);
      if (user) {
        setRecoveredInfo({ username: user.username, pin: user.pin });
      } else {
        setError('Số điện thoại không tồn tại trong hệ thống');
      }
      return;
    }

    // Handle Login/Register Validations
    if (!username || !pin) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (isRegistering) {
      if (!phoneNumber) {
        setError('Vui lòng nhập số điện thoại');
        return;
      }

      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        setError('Tên đăng nhập đã tồn tại');
        return;
      }

      const existingPhone = users.find(u => u.phoneNumber === phoneNumber);
      if (existingPhone) {
        setError('Số điện thoại đã được sử dụng');
        return;
      }

      const newUser: UserType = { id: Date.now().toString(), username, pin, phoneNumber };
      localStorage.setItem('dashboard_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      const existingUser = users.find(u => u.username === username);
      if (!existingUser || existingUser.pin !== pin) {
        setError('Tên đăng nhập hoặc mã PIN không đúng');
        return;
      }
      onLogin(existingUser);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPin('');
    setPhoneNumber('');
    setError('');
    setRecoveredInfo(null);
  };

  const toggleRegisterMode = () => {
    resetForm();
    setIsRegistering(!isRegistering);
    setIsForgotPassword(false);
  };

  const toggleForgotPasswordMode = () => {
    resetForm();
    setIsForgotPassword(!isForgotPassword);
    setIsRegistering(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
      isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'
      }`}>
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            {isForgotPassword ? <Key className="w-8 h-8 text-white" /> : <Wallet className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {isForgotPassword ? 'Khôi Phục Tài Khoản' : 'Quản Lý Tài Sản'}
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {isForgotPassword 
              ? 'Nhập số điện thoại để lấy lại thông tin' 
              : (isRegistering ? 'Tạo tài khoản mới' : 'Đăng nhập để tiếp tục')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isForgotPassword ? (
            // Forgot Password Form
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <div className="relative">
                <input
                  type="tel"
                  className={`w-full p-3 pl-10 rounded-lg border outline-none transition-all ${
                     isDark 
                      ? 'bg-slate-900 border-slate-600 focus:border-blue-500 text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-gray-300 focus:border-blue-500 text-gray-900'
                  }`}
                  placeholder="Nhập số điện thoại đã đăng ký"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Phone className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>
          ) : (
            // Login/Register Form
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full p-3 pl-10 rounded-lg border outline-none transition-all ${
                       isDark 
                        ? 'bg-slate-900 border-slate-600 focus:border-blue-500 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-gray-300 focus:border-blue-500 text-gray-900'
                    }`}
                    placeholder=""
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <User className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <div className="relative">
                    <input
                      type="tel"
                      className={`w-full p-3 pl-10 rounded-lg border outline-none transition-all ${
                         isDark 
                          ? 'bg-slate-900 border-slate-600 focus:border-blue-500 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border-gray-300 focus:border-blue-500 text-gray-900'
                      }`}
                      placeholder="Ví dụ: 0912345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <Phone className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Mã PIN bảo mật</label>
                <div className="relative">
                  <input
                    type="password"
                    className={`w-full p-3 pl-10 rounded-lg border outline-none transition-all ${
                       isDark 
                        ? 'bg-slate-900 border-slate-600 focus:border-blue-500 text-white placeholder-slate-500' 
                        : 'bg-slate-50 border-gray-300 focus:border-blue-500 text-gray-900'
                    }`}
                    placeholder="****"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                  <Lock className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                </div>
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg animate-in fade-in slide-in-from-top-2">{error}</p>}

          {recoveredInfo && (
             <div className={`p-4 rounded-lg border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} animate-in fade-in zoom-in`}>
                 <p className={`text-sm font-medium mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Tìm thấy thông tin tài khoản:</p>
                 <div className="space-y-2">
                    <div className={`flex justify-between border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} pb-1`}>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Tên đăng nhập:</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{recoveredInfo.username}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mã PIN:</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{recoveredInfo.pin}</span>
                    </div>
                 </div>
             </div>
          )}

          {!recoveredInfo && (
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              {isForgotPassword ? 'Tra Cứu Thông Tin' : (isRegistering ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập')}
            </button>
          )}
        </form>

        <div className="mt-6 text-center pt-6 border-t border-dashed border-slate-600/30 space-y-4">
            {/* Forgot Password Navigation */}
            {isForgotPassword ? (
                 <button 
                 type="button"
                 onClick={toggleForgotPasswordMode}
                 className="text-sm font-medium text-slate-500 hover:text-blue-500 flex items-center justify-center gap-2 mx-auto transition-colors"
               >
                 <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
               </button>
            ) : (
                <>
                     {/* Regular Navigation */}
                    {!isRegistering && (
                        <div>
                            <button 
                                type="button"
                                onClick={toggleForgotPasswordMode}
                                className={`text-sm ${isDark ? 'text-slate-400 hover:text-blue-400' : 'text-slate-500 hover:text-blue-600'} transition-colors`}
                            >
                                Quên mật khẩu?
                            </button>
                        </div>
                    )}
                    
                    <button 
                        onClick={toggleRegisterMode}
                        className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                        {isRegistering ? (
                        <>Đã có tài khoản? <span className="underline">Đăng nhập ngay</span></>
                        ) : (
                        <><UserPlus className="w-4 h-4" /> Chưa có tài khoản? <span className="underline">Đăng ký mới</span></>
                        )}
                    </button>
                </>
            )}
        </div>

         <div className="mt-8 flex justify-center">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'bg-slate-700 text-yellow-400' : 'bg-gray-200 text-slate-600'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
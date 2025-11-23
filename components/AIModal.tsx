import React, { useState, useEffect } from 'react';
import { Bot, Settings, X, RefreshCw, Save, Key, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Asset, AIConfig, AIProviderType, User } from '../types';
import { AI_PROVIDERS } from '../constants';
import { generateFinancialAnalysis } from '../services/aiService';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  totalValue: number;
  isDark: boolean;
  currentUser?: User | null;
}

const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose, assets, totalValue, isDark, currentUser }) => {
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showKey, setShowKey] = useState(false);

  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('ai_config');
    const defaultState: AIConfig = { provider: 'rule_based', apiKey: '' };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.provider === 'ollama') return defaultState;
      return { ...defaultState, ...parsed };
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('ai_config', JSON.stringify(config));
  }, [config]);

  const callAI = async () => {
    setIsAnalyzing(true);
    setAnalysis('');
    setErrorMsg('');

    try {
      const result = await generateFinancialAnalysis(assets, totalValue, config, currentUser);
      setAnalysis(result);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi không xác định");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis && !showSettings) {
      if (config.provider === 'rule_based') {
          callAI();
      } else if (config.provider === 'gemini' && (config.apiKey || process.env.API_KEY)) {
          callAI();
      } else {
          setShowSettings(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh] ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${
          isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-blue-50/50'
        } rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Trợ Lý Tài Chính</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Sử dụng: {AI_PROVIDERS.find(p => p.id === config.provider)?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-500'}`}
              title="Cấu hình AI"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={onClose} className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {showSettings ? (
            <div className="space-y-6">
               <div>
                  <h4 className={`font-bold border-b pb-2 mb-4 ${isDark ? 'text-white border-slate-700' : 'text-slate-900 border-gray-200'}`}>Cấu hình Nhà cung cấp AI</h4>
                  
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Chọn nguồn AI</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {AI_PROVIDERS.map(p => (
                          <button
                              key={p.id}
                              onClick={() => setConfig({...config, provider: p.id as AIProviderType})}
                              className={`p-3 rounded-lg border flex items-center gap-3 text-sm font-medium transition-all ${
                                  config.provider === p.id 
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-500 ring-1 ring-blue-500' 
                                  : isDark ? 'border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                              <div className={`p-2 rounded-full ${config.provider === p.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                <p.icon className="w-4 h-4" />
                              </div>
                              {p.name}
                          </button>
                      ))}
                  </div>
               </div>

               {config.provider === 'gemini' && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        Gemini API Key
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type={showKey ? "text" : "password"}
                            value={config.apiKey || ''}
                            onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                            placeholder="Nhập API Key của bạn (bắt đầu bằng AIza...)"
                            className={`block w-full pl-10 pr-10 py-3 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                                isDark 
                                ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' 
                                : 'bg-slate-50 border-gray-300 text-gray-900'
                            }`}
                        />
                         <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                         <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                         >
                            <ExternalLink className="w-3 h-3" /> Lấy API Key miễn phí tại Google AI Studio
                         </a>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg border text-xs ${isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                        <p>Lưu ý: API Key của bạn sẽ được lưu an toàn trên trình duyệt của thiết bị này. Chúng tôi không thu thập hoặc chia sẻ khóa của bạn.</p>
                    </div>
                 </div>
               )}

               <div className="pt-4 border-t border-dashed border-slate-600/30">
                 <button 
                    onClick={() => { 
                        if (config.provider === 'gemini' && !config.apiKey && !process.env.API_KEY) {
                            setErrorMsg("Vui lòng nhập API Key để sử dụng Gemini.");
                            return;
                        }
                        setShowSettings(false); 
                        callAI(); 
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
                 >
                    <Save className="w-4 h-4" /> Lưu Cấu Hình & Phân Tích Ngay
                 </button>
               </div>

            </div>
          ) : (
            <>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Bot className="w-5 h-5 text-blue-500" />
                      </div>
                  </div>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} animate-pulse text-sm`}>
                    Đang gửi dữ liệu đến {AI_PROVIDERS.find(p => p.id === config.provider)?.name}...
                  </p>
                </div>
              ) : errorMsg ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Không thể phân tích</h4>
                    <p className={`text-sm text-center max-w-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{errorMsg}</p>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-sm transition-colors"
                    >
                        Kiểm tra cấu hình
                    </button>
                </div>
              ) : (
                <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
                  <div className="whitespace-pre-wrap leading-relaxed text-base">
                    {analysis}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!showSettings && !isAnalyzing && !errorMsg && (
            <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'} flex justify-end`}>
            <button 
                onClick={callAI}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                isDark 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
            >
                <RefreshCw className="w-4 h-4" />
                Phân tích lại
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisorModal;
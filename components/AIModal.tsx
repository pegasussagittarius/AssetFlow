import React, { useState, useEffect } from 'react';
import { Bot, Settings, X, RefreshCw, Save } from 'lucide-react';
import { Asset, AIConfig, AIProviderType } from '../types';
import { AI_PROVIDERS } from '../constants';
import { generateFinancialAnalysis } from '../services/aiService';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  totalValue: number;
  isDark: boolean;
}

const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose, assets, totalValue, isDark }) => {
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('ai_config');
    const defaultState: AIConfig = { provider: 'rule_based' };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Fallback if saved provider is ollama
      if (parsed.provider === 'ollama') return defaultState;
      return parsed;
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
      const result = await generateFinancialAnalysis(assets, totalValue, config);
      setAnalysis(result);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi không xác định");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis && !showSettings) {
      callAI();
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
            <div className="space-y-4">
               <h4 className={`font-bold border-b pb-2 ${isDark ? 'text-white border-slate-700' : 'text-slate-900 border-gray-200'}`}>Cấu hình Nhà cung cấp AI</h4>
               
               <div className="grid grid-cols-1 gap-3">
                 <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Chọn nguồn AI</label>
                 <div className="grid grid-cols-2 gap-2">
                    {AI_PROVIDERS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setConfig({...config, provider: p.id as AIProviderType})}
                            className={`p-3 rounded-lg border flex items-center gap-2 text-sm font-medium transition-all ${
                                config.provider === p.id 
                                ? 'border-blue-500 bg-blue-500/10 text-blue-500' 
                                : isDark ? 'border-slate-600 bg-slate-800 text-slate-400' : 'border-gray-200 bg-white text-gray-600'
                            }`}
                        >
                            <p.icon className="w-4 h-4" />
                            {p.name}
                        </button>
                    ))}
                 </div>
               </div>

               {config.provider === 'gemini' && (
                 <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-500/10 border-blue-500/30 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                    <p className="text-sm flex items-center gap-2">
                       <Bot className="w-4 h-4"/>
                       Gemini AI sử dụng API Key từ cấu hình hệ thống. Đảm bảo môi trường triển khai đã có biến <code>API_KEY</code>.
                    </p>
                 </div>
               )}

               <div className="pt-2">
                 <button 
                    onClick={() => { setShowSettings(false); callAI(); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                 >
                    <Save className="w-4 h-4" /> Lưu & Phân Tích
                 </button>
               </div>

            </div>
          ) : (
            <>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} animate-pulse`}>
                    Đang gửi dữ liệu đến {AI_PROVIDERS.find(p => p.id === config.provider)?.name}...
                  </p>
                </div>
              ) : errorMsg ? (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                    <p className="text-red-500 font-medium mb-2">Đã xảy ra lỗi</p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{errorMsg}</p>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="mt-3 text-blue-500 hover:underline text-sm"
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
        {!showSettings && (
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
import React from 'react';
import { X, Info } from 'lucide-react';

interface CICInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  currentScore?: number;
}

const CIC_RANKS = [
  { rank: 10, min: 403, max: 429, color: '#ef4444', label: 'Xấu' }, // Red
  { rank: 9, min: 430, max: 454, color: '#f97316', label: '' }, // Orange
  { rank: 8, min: 455, max: 479, color: '#f59e0b', label: 'Dưới TB' }, // Amber
  { rank: 7, min: 480, max: 544, color: '#eab308', label: '' }, // Yellow-Amber
  { rank: 6, min: 545, max: 571, color: '#facc15', label: 'Trung bình' }, // Yellow
  { rank: 5, min: 572, max: 587, color: '#d9f99d', label: '' }, // Lime-ish
  { rank: 4, min: 588, max: 605, color: '#bef264', label: 'Tốt' }, // Lime
  { rank: 3, min: 606, max: 621, color: '#84cc16', label: '' }, // Lime Green
  { rank: 2, min: 622, max: 644, color: '#22c55e', label: '' }, // Green
  { rank: 1, min: 645, max: 706, color: '#15803d', label: 'Rất tốt' }, // Dark Green
];

const CICInfoModal: React.FC<CICInfoModalProps> = ({ isOpen, onClose, isDark, currentScore }) => {
  if (!isOpen) return null;

  // Determine current user's rank
  const currentRank = currentScore 
    ? CIC_RANKS.find(r => currentScore >= r.min && currentScore <= r.max) 
    : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${
          isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-white'
        } rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
              <Info className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              CHI TIẾT ĐIỂM VÀ HẠNG
            </h3>
          </div>
          <button onClick={onClose} className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* User Current Score Highlight */}
            {currentScore && (
                <div className={`mb-8 text-center p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`text-sm uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Điểm của bạn</p>
                    <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                        <span className={isDark ? 'text-white' : 'text-slate-900'}>{currentScore}</span>
                        {currentRank && (
                            <span className="text-lg px-3 py-1 rounded-full text-white" style={{ backgroundColor: currentRank.color }}>
                                Hạng {currentRank.rank < 10 ? `0${currentRank.rank}` : currentRank.rank}
                            </span>
                        )}
                    </div>
                    {currentRank && (
                        <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                             Đánh giá: <strong>{currentRank.label || (currentRank.rank <= 2 ? 'Rất tốt' : currentRank.rank <= 4 ? 'Tốt' : currentRank.rank <= 6 ? 'Trung bình' : currentRank.rank <= 8 ? 'Dưới TB' : 'Xấu')}</strong>
                        </p>
                    )}
                </div>
            )}

            {/* Chart Container */}
            <div className="space-y-2 overflow-x-auto pb-4">
                 {/* Labels Row */}
                 <div className="flex min-w-[800px] text-center font-bold text-sm mb-2">
                    <div className="flex-1 text-red-500">Xấu</div>
                    <div className="flex-1 text-orange-500">Dưới trung bình</div>
                    <div className="flex-1 text-yellow-500">Trung bình</div>
                    <div className="flex-1 text-lime-600">Tốt</div>
                    <div className="flex-1 text-green-600">Rất tốt</div>
                 </div>

                 {/* Color Bar Row */}
                 <div className="flex min-w-[800px] h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm text-white">
                    {CIC_RANKS.map((item) => (
                        <div 
                            key={item.rank} 
                            style={{ backgroundColor: item.color }} 
                            className={`flex-1 flex flex-col items-center justify-center border-r border-white/20 last:border-r-0 relative group transition-all hover:flex-[1.2] hover:brightness-110 cursor-help ${
                                currentRank?.rank === item.rank ? 'ring-4 ring-offset-2 ring-blue-500 z-10 scale-105 shadow-xl' : ''
                            }`}
                        >
                             {/* Rank Number */}
                             <span className="font-bold text-lg drop-shadow-md">
                                {item.rank < 10 ? `0${item.rank}` : item.rank}
                             </span>
                        </div>
                    ))}
                 </div>

                 {/* Score Range Row */}
                 <div className="flex min-w-[800px] text-center text-xs mt-2">
                    {CIC_RANKS.map((item) => (
                        <div key={item.rank} className={`flex-1 ${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium`}>
                            {item.min}-{item.max}
                        </div>
                    ))}
                 </div>
            </div>

            <div className={`mt-6 text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'} text-center`}>
                * Biểu đồ dựa trên thang điểm chuẩn của Trung tâm Thông tin Tín dụng Quốc gia Việt Nam (CIC).
            </div>

        </div>
      </div>
    </div>
  );
};

export default CICInfoModal;

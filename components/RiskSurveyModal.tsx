import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ShieldAlert, Target, RefreshCcw, MousePointerClick, ListFilter, ArrowLeft } from 'lucide-react';
import { RISK_SURVEY_QUESTIONS, getRiskProfileFromScore, RISK_PROFILES } from '../constants';
import { RiskLevel, RiskProfileDef } from '../types';

interface RiskSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profileId: RiskLevel) => void;
  isDark: boolean;
  currentProfileId?: RiskLevel;
}

const RiskSurveyModal: React.FC<RiskSurveyModalProps> = ({ isOpen, onClose, onSaveProfile, isDark, currentProfileId }) => {
  const [step, setStep] = useState<'intro' | 'manual_select' | 'question' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [resultProfile, setResultProfile] = useState<RiskProfileDef | null>(null);

  if (!isOpen) return null;

  const handleStartSurvey = () => {
    setStep('question');
    setCurrentQuestionIdx(0);
    setAnswers([]);
  };

  const handleStartManual = () => {
    setStep('manual_select');
  };

  const handleManualSelect = (profile: RiskProfileDef) => {
    setResultProfile(profile);
    setStep('result');
  };

  const handleAnswer = (points: number) => {
    const newAnswers = [...answers, points];
    setAnswers(newAnswers);

    if (currentQuestionIdx < RISK_SURVEY_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestionIdx(currentQuestionIdx + 1), 200);
    } else {
      const totalScore = newAnswers.reduce((a, b) => a + b, 0);
      const profile = getRiskProfileFromScore(totalScore);
      setResultProfile(profile);
      setStep('result');
    }
  };

  const handleSave = () => {
    if (resultProfile) {
      onSaveProfile(resultProfile.id);
      onClose();
    }
  };

  const renderIntro = () => (
    <div className="text-center p-4">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Target className="w-10 h-10 text-blue-600" />
      </div>
      <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Xác định Hồ sơ Đầu tư
      </h3>
      <p className={`mb-8 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
        Việc xác định đúng khẩu vị rủi ro giúp AI đưa ra khuyến nghị phân bổ tài sản chính xác nhất cho riêng bạn.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleStartManual}
          className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <MousePointerClick className="w-8 h-8 text-purple-500" />
          <div>
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tự chọn Hồ sơ</h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Xem danh sách và chọn mức độ phù hợp với bạn</p>
          </div>
        </button>

        <button
          onClick={handleStartSurvey}
          className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <ListFilter className="w-8 h-8 text-blue-500" />
          <div>
            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Làm Khảo sát</h4>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Trả lời 9 câu hỏi để AI tính điểm cho bạn</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderManualSelect = () => (
    <div className="p-2 h-full flex flex-col">
       <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => setStep('intro')}
            className={`p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
          >
             <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Chọn Hồ sơ Rủi ro
          </h3>
       </div>
       
      <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-2 max-h-[60vh]">
        {RISK_PROFILES.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleManualSelect(profile)}
            className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group ${
               isDark 
               ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' 
               : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold flex items-center gap-2" style={{ color: profile.color }}>
                 <span className="w-3 h-3 rounded-full" style={{ backgroundColor: profile.color }}></span>
                 {profile.name}
              </h4>
            </div>
            <p className={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{profile.description}</p>
            
            {/* Mini Allocation Bar */}
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden flex">
               <div style={{ width: `${profile.recommendedAllocation.safe}%` }} className="h-full bg-emerald-500"></div>
               <div style={{ width: `${profile.recommendedAllocation.growth}%` }} className="h-full bg-rose-500"></div>
            </div>
            <div className="flex justify-between text-[10px] mt-1 text-slate-400">
               <span>An toàn {profile.recommendedAllocation.safe}%</span>
               <span>Tăng trưởng {profile.recommendedAllocation.growth}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuestion = () => {
    const question = RISK_SURVEY_QUESTIONS[currentQuestionIdx];
    return (
      <div className="p-2 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <span className={`text-xs font-bold px-2 py-1 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>
                Câu hỏi {currentQuestionIdx + 1}/{RISK_SURVEY_QUESTIONS.length}
            </span>
            <div className="flex gap-1">
                {RISK_SURVEY_QUESTIONS.map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= currentQuestionIdx ? 'bg-blue-500' : (isDark ? 'bg-slate-700' : 'bg-gray-200')}`}></div>
                ))}
            </div>
        </div>

        <h4 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {question.question}
        </h4>

        <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(opt.points)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                isDark 
                ? 'border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200' 
                : 'border-gray-200 bg-white hover:bg-blue-50 text-gray-800 hover:border-blue-200'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        {/* Exit Button */}
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setStep('intro')}
                className={`w-full py-2 text-sm font-medium flex items-center justify-center gap-2 rounded-lg transition-colors ${
                    isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-gray-100'
                }`}
            >
                <ArrowLeft className="w-4 h-4" /> Dừng làm & Quay lại
            </button>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!resultProfile) return null;
    return (
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${resultProfile.color}20` }}>
            <ShieldAlert className="w-10 h-10" style={{ color: resultProfile.color }} />
        </div>
        
        <p className={`text-sm uppercase font-bold tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kết quả xác định</p>
        <h3 className="text-3xl font-bold mb-2" style={{ color: resultProfile.color }}>
          {resultProfile.name}
        </h3>
        
        <p className={`mb-6 text-sm px-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          {resultProfile.description}
        </p>

        <div className={`p-5 rounded-xl border mb-6 text-left ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <h5 className={`font-bold mb-3 text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Phân bổ tài sản khuyến nghị:</h5>
            <div className="flex h-4 rounded-full overflow-hidden mb-2">
                <div style={{ width: `${resultProfile.recommendedAllocation.safe}%` }} className="bg-emerald-500 h-full transition-all duration-1000"></div>
                <div style={{ width: `${resultProfile.recommendedAllocation.growth}%` }} className="bg-rose-500 h-full transition-all duration-1000"></div>
            </div>
            <div className="flex justify-between text-xs font-medium">
                <span className="text-emerald-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>An toàn: {resultProfile.recommendedAllocation.safe}%</span>
                <span className="text-rose-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Tăng trưởng: {resultProfile.recommendedAllocation.growth}%</span>
            </div>
        </div>

        <div className="flex gap-3">
             <button
                onClick={() => setStep('intro')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold border flex items-center justify-center gap-2 ${
                    isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
            >
                <RefreshCcw className="w-4 h-4" /> Chọn lại
            </button>
            <button
                onClick={handleSave}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
                <CheckCircle className="w-4 h-4" /> Áp dụng hồ sơ này
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl w-full max-w-lg shadow-2xl transition-all duration-300 flex flex-col ${
        isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'
      } max-h-[85vh]`}>
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center ${
          isDark ? 'border-slate-700' : 'border-gray-100'
        } shrink-0`}>
           <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
               {step === 'result' ? 'Kết quả' : step === 'manual_select' ? 'Chọn hồ sơ' : step === 'question' ? 'Khảo sát' : 'Bắt đầu'}
           </span>
          <button onClick={onClose} className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-hidden flex-1">
          {step === 'intro' && renderIntro()}
          {step === 'manual_select' && renderManualSelect()}
          {step === 'question' && renderQuestion()}
          {step === 'result' && renderResult()}
        </div>
      </div>
    </div>
  );
};

export default RiskSurveyModal;
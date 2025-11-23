import { Bot, Sparkles } from 'lucide-react';
import { AssetCategory, AIProvider, RiskProfileDef, SurveyQuestion, AssetTermDef } from './types';

export const DEFAULT_GOLD_PRICE = 8500000; // Giá ước tính 1 chỉ vàng (VND)
export const DEFAULT_EXCHANGE_RATE = 25450; // Giá ước tính 1 USD (VND)

export const ASSET_CATEGORIES: AssetCategory[] = [
  { id: 'stock', name: 'Cổ phiếu', color: '#3B82F6', risk: 'high' }, 
  { id: 'etf', name: 'Chứng chỉ quỹ ETF', color: '#6366F1', risk: 'high' },
  { id: 'fund', name: 'CCQ Cổ phiếu', color: '#EC4899', risk: 'high' }, 
  { id: 'bond', name: 'Trái phiếu', color: '#8B5CF6', risk: 'low' }, 
  { id: 'bond_fund', name: 'CCQ Trái phiếu', color: '#A78BFA', risk: 'low' },
  { id: 'money_market_fund', name: 'CCQ TT Tiền tệ', color: '#34D399', risk: 'safe' },
  { id: 'savings', name: 'Tiền tiết kiệm', color: '#10B981', risk: 'safe' }, 
  { id: 'emergency_fund', name: 'Tiền mặt dự phòng', color: '#059669', risk: 'safe' }, // Mới
  { id: 'cd_money', name: 'CC Tiền gửi / Công cụ tiền tệ', color: '#F59E0B', risk: 'safe' }, 
  { id: 'insurance', name: 'Giá trị HĐ BHNT', color: '#DB2777', risk: 'safe' }, // Mới
  { id: 'foreign_currency', name: 'Ngoại tệ', color: '#14B8A6', risk: 'medium' }, // Mới: Teal
  { id: 'gold', name: 'Vàng', color: '#FACC15', risk: 'medium' }, 
  { id: 'real_estate', name: 'Bất động sản', color: '#EF4444', risk: 'medium' }, 
  { id: 'crypto', name: 'Tài sản mã hoá', color: '#06B6D4', risk: 'very_high' }, 
  { id: 'cash', name: 'Tiền mặt', color: '#64748B', risk: 'safe' }, 
  { id: 'other', name: 'Khác', color: '#A3A3A3', risk: 'medium' },
];

export const ASSET_TERMS: AssetTermDef[] = [
  { id: 'short_term', name: 'Ngắn hạn (<1 năm)', color: '#3b82f6' }, // Blue
  { id: 'medium_term', name: 'Trung hạn (1-3 năm)', color: '#f59e0b' }, // Amber/Orange
  { id: 'long_term', name: 'Dài hạn (>3 năm)', color: '#8b5cf6' }, // Purple
  { id: 'emergency', name: 'Quỹ dự phòng', color: '#10b981' }, // Emerald/Green
];

export const AI_PROVIDERS: AIProvider[] = [
  { id: 'rule_based', name: 'Phân tích cơ bản (Offline)', icon: Bot },
  { id: 'gemini', name: 'Google Gemini (Cloud)', icon: Sparkles },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

// --- RISK PROFILE CONSTANTS ---

export const RISK_PROFILES: RiskProfileDef[] = [
  {
    id: 'safe',
    name: 'An toàn (Safe)',
    description: 'Bạn ưu tiên bảo toàn vốn tuyệt đối. Bạn không chấp nhận rủi ro mất tiền và hài lòng với mức sinh lời thấp nhưng chắc chắn (như tiền gửi ngân hàng).',
    color: '#10B981', // Green
    recommendedAllocation: { safe: 90, growth: 10 }
  },
  {
    id: 'conservative',
    name: 'Thận trọng (Conservative)',
    description: 'Bạn muốn sự ổn định nhưng chấp nhận một phần nhỏ rủi ro để có lợi nhuận cao hơn lạm phát. Ưu tiên các kênh thu nhập cố định.',
    color: '#34D399', // Light Green
    recommendedAllocation: { safe: 70, growth: 30 }
  },
  {
    id: 'moderately_conservative',
    name: 'Thận trọng vừa phải (Moderately Conservative)',
    description: 'Bạn mong muốn sự cân bằng, chấp nhận biến động nhẹ trong ngắn hạn để đạt được sự tăng trưởng vốn trong trung hạn.',
    color: '#FBBF24', // Amber
    recommendedAllocation: { safe: 50, growth: 50 }
  },
  {
    id: 'balanced',
    name: 'Cân bằng (Balanced)',
    description: 'Bạn hiểu rõ quy luật rủi ro/lợi nhuận. Bạn phân bổ đều giữa các tài sản an toàn và tăng trưởng để tối ưu hóa danh mục.',
    color: '#F59E0B', // Orange
    recommendedAllocation: { safe: 40, growth: 60 }
  },
  {
    id: 'growth',
    name: 'Tăng trưởng (Growth)',
    description: 'Bạn tập trung vào gia tăng tài sản dài hạn. Bạn không lo ngại thị trường giảm sâu trong ngắn hạn vì bạn có tầm nhìn xa.',
    color: '#EF4444', // Red
    recommendedAllocation: { safe: 20, growth: 80 }
  },
  {
    id: 'aggressive',
    name: 'Tăng trưởng mạnh (Aggressive)',
    description: 'Bạn là nhà đầu tư mạo hiểm, tìm kiếm lợi nhuận tối đa. Bạn sẵn sàng chấp nhận mất vốn lớn để đổi lấy cơ hội nhân nhiều lần tài sản.',
    color: '#7C3AED', // Violet
    recommendedAllocation: { safe: 5, growth: 95 }
  }
];

export const RISK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    question: "Độ tuổi hiện tại của bạn?",
    options: [
      { text: "Trên 60 tuổi (Đã/Sắp nghỉ hưu)", points: 1 },
      { text: "45 - 60 tuổi", points: 3 },
      { text: "30 - 45 tuổi", points: 5 },
      { text: "Dưới 30 tuổi", points: 7 }
    ]
  },
  {
    id: 2,
    question: "Mục tiêu đầu tư chính của bạn là gì?",
    options: [
      { text: "Bảo toàn vốn là trên hết, tránh mọi rủi ro.", points: 1 },
      { text: "Tạo dòng thu nhập đều đặn, an toàn.", points: 3 },
      { text: "Tăng trưởng vốn dài hạn kết hợp thu nhập.", points: 5 },
      { text: "Làm giàu nhanh, tối đa hóa lợi nhuận.", points: 7 }
    ]
  },
  {
    id: 3,
    question: "Bạn dự định đầu tư số tiền này trong bao lâu trước khi cần rút ra?",
    options: [
      { text: "Dưới 1 năm (ngắn hạn)", points: 1 },
      { text: "1 - 3 năm (trung hạn)", points: 3 },
      { text: "3 - 7 năm", points: 5 },
      { text: "Trên 7 năm (dài hạn)", points: 7 }
    ]
  },
  {
    id: 4,
    question: "Nếu thị trường giảm 20% trong 1 tháng, bạn sẽ làm gì?",
    options: [
      { text: "Rất hoảng sợ, bán tất cả để cắt lỗ ngay.", points: 1 },
      { text: "Lo lắng, bán một phần chuyển sang gửi tiết kiệm.", points: 3 },
      { text: "Bình tĩnh giữ nguyên, chờ thị trường hồi phục.", points: 5 },
      { text: "Vui mừng, dồn tiền mua thêm vì giá rẻ.", points: 7 }
    ]
  },
  {
    id: 5,
    question: "Kiến thức và kinh nghiệm đầu tư của bạn?",
    options: [
      { text: "Không có kinh nghiệm, chỉ biết gửi tiết kiệm.", points: 1 },
      { text: "Cơ bản, hiểu về trái phiếu, vàng.", points: 3 },
      { text: "Khá, đã đầu tư chứng khoán/quỹ mở vài năm.", points: 5 },
      { text: "Chuyên sâu, hiểu rõ phái sinh, crypto, đòn bẩy.", points: 7 }
    ]
  },
  {
    id: 6,
    question: "Tình hình thu nhập hiện tại của bạn?",
    options: [
      { text: "Không ổn định, chi tiêu thường vượt thu nhập.", points: 1 },
      { text: "Ổn định nhưng không có nhiều tiền dư.", points: 3 },
      { text: "Tốt, tiết kiệm được 20-30% thu nhập mỗi tháng.", points: 5 },
      { text: "Rất tốt, có nhiều nguồn thu nhập thụ động lớn.", points: 7 }
    ]
  },
  {
    id: 7,
    question: "Bạn ưu tiên điều gì hơn?",
    options: [
      { text: "Sự an toàn tuyệt đối, dù lãi suất thấp.", points: 1 },
      { text: "Lợi nhuận vừa phải, ít biến động.", points: 3 },
      { text: "Cân bằng giữa rủi ro và lợi nhuận.", points: 5 },
      { text: "Cơ hội nhân tài khoản, chấp nhận rủi ro mất trắng.", points: 7 }
    ]
  },
  {
    id: 8,
    question: "Bạn cảm thấy thế nào khi nghe tin người khác lãi lớn từ kênh rủi ro (coin, đất sốt)?",
    options: [
      { text: "Dửng dưng, tôi chỉ tin vào kế hoạch của mình.", points: 1 },
      { text: "Hơi tiếc nhưng thấy quá rủi ro nên không tham gia.", points: 3 },
      { text: "Quan tâm, tìm hiểu xem có nên bỏ ít vốn vào không.", points: 5 },
      { text: "Sốt ruột, muốn rút tiền tiết kiệm để tham gia ngay.", points: 7 }
    ]
  },
  {
    id: 9,
    question: "Số người phụ thuộc tài chính vào bạn (con cái, cha mẹ già)?",
    options: [
      { text: "Rất nhiều gánh nặng, là trụ cột duy nhất.", points: 1 },
      { text: "Có người phụ thuộc nhưng có sự san sẻ.", points: 3 },
      { text: "Ít gánh nặng, chỉ lo cho bản thân là chính.", points: 5 },
      { text: "Không có, tài chính hoàn toàn tự do.", points: 7 }
    ]
  }
];

export const getRiskProfileFromScore = (score: number): RiskProfileDef => {
  // New Scoring Logic for 9 questions
  // Min score: 9 * 1 = 9
  // Max score: 9 * 7 = 63
  // Range: 54 points spread over 6 profiles => 9 points per profile interval
  
  if (score <= 18) return RISK_PROFILES[0]; // Safe (9-18)
  if (score <= 27) return RISK_PROFILES[1]; // Conservative (19-27)
  if (score <= 36) return RISK_PROFILES[2]; // Moderately Conservative (28-36)
  if (score <= 45) return RISK_PROFILES[3]; // Balanced (37-45)
  if (score <= 54) return RISK_PROFILES[4]; // Growth (46-54)
  return RISK_PROFILES[5]; // Aggressive (55-63)
};
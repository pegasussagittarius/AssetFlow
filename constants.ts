import { Bot, Sparkles } from 'lucide-react';
import { AssetCategory, AIProvider } from './types';

export const ASSET_CATEGORIES: AssetCategory[] = [
  { id: 'stock', name: 'Cổ phiếu', color: '#3B82F6', risk: 'high' }, 
  { id: 'etf', name: 'Chứng chỉ quỹ ETF', color: '#6366F1', risk: 'high' },
  { id: 'fund', name: 'CCQ Cổ phiếu', color: '#EC4899', risk: 'high' }, // ID cũ là 'fund', đổi tên hiển thị
  { id: 'bond', name: 'Trái phiếu', color: '#8B5CF6', risk: 'low' }, 
  { id: 'bond_fund', name: 'CCQ Trái phiếu', color: '#A78BFA', risk: 'low' },
  { id: 'money_market_fund', name: 'CCQ TT Tiền tệ', color: '#34D399', risk: 'safe' },
  { id: 'savings', name: 'Tiền tiết kiệm', color: '#10B981', risk: 'safe' }, 
  { id: 'cd_money', name: 'CC Tiền gửi / Công cụ tiền tệ', color: '#F59E0B', risk: 'safe' }, 
  { id: 'gold', name: 'Vàng', color: '#FACC15', risk: 'medium' }, 
  { id: 'real_estate', name: 'Bất động sản', color: '#EF4444', risk: 'medium' }, 
  { id: 'crypto', name: 'Tài sản mã hoá', color: '#06B6D4', risk: 'very_high' }, 
  { id: 'cash', name: 'Tiền mặt', color: '#64748B', risk: 'safe' }, 
  { id: 'other', name: 'Khác', color: '#A3A3A3', risk: 'medium' },
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
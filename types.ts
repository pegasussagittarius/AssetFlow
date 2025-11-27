import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  username: string;
  pin: string;
  phoneNumber: string;
  riskProfile?: RiskLevel; // Thêm trường hồ sơ rủi ro
  creditScore?: number; // Mới: Điểm tín dụng CIC
  avatar?: string; // Mới: Ảnh đại diện (Base64 string)
}

export type AssetCategoryType = 
  | 'stock' 
  | 'bond' 
  | 'fund' 
  | 'bond_fund' 
  | 'money_market_fund' 
  | 'etf' 
  | 'savings' 
  | 'emergency_fund' // Mới: Tiền mặt dự phòng
  | 'cd_money' 
  | 'insurance' // Mới: Giá trị HĐ BHNT
  | 'foreign_currency' // Mới: Ngoại tệ
  | 'gold' 
  | 'real_estate' 
  | 'crypto' 
  | 'cash' 
  | 'other';

// Mới: Định nghĩa các loại kỳ hạn/mục đích
export type AssetTermType = 'short_term' | 'medium_term' | 'long_term' | 'emergency';

export interface AssetCategory {
  id: AssetCategoryType;
  name: string;
  color: string;
  risk: 'safe' | 'low' | 'medium' | 'high' | 'very_high';
}

export interface AssetTermDef {
  id: AssetTermType;
  name: string;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategoryType;
  term: AssetTermType; 
  plan?: string; // Mới: Tên kế hoạch (tùy chọn)
  amount: number;
  date: string;
}

export type AIProviderType = 'rule_based' | 'gemini';

export interface AIProvider {
  id: AIProviderType;
  name: string;
  icon: LucideIcon;
}

export interface AIConfig {
  provider: AIProviderType;
  apiKey?: string;
}

export interface GoogleSyncConfig {
  clientId: string;
  apiKey: string;
  lastSync?: string;
}

// Risk Profile Types
export type RiskLevel = 'safe' | 'conservative' | 'moderately_conservative' | 'balanced' | 'growth' | 'aggressive';

export interface RiskProfileDef {
  id: RiskLevel;
  name: string;
  description: string;
  color: string;
  recommendedAllocation: {
    safe: number; // Cash, Savings, Bonds
    growth: number; // Stocks, Real Estate, Crypto
  };
}

export interface SurveyQuestion {
  id: number;
  question: string;
  options: {
    text: string;
    points: number;
  }[];
}
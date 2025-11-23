import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  username: string;
  pin: string;
  phoneNumber: string;
  riskProfile?: RiskLevel; // Thêm trường hồ sơ rủi ro
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

export interface AssetCategory {
  id: AssetCategoryType;
  name: string;
  color: string;
  risk: 'safe' | 'low' | 'medium' | 'high' | 'very_high';
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategoryType;
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
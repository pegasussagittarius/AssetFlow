import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  username: string;
  pin: string;
  phoneNumber: string;
}

export type AssetCategoryType = 
  | 'stock' 
  | 'bond' 
  | 'fund' // Giữ lại ID này cho CCQ Cổ phiếu để tương thích ngược
  | 'bond_fund' 
  | 'money_market_fund' 
  | 'etf' 
  | 'savings' 
  | 'cd_money' 
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
}
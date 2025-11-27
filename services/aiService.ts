import { GoogleGenAI } from "@google/genai";
import { Asset, AIConfig, User, AssetCategoryType } from "../types";
import { ASSET_CATEGORIES, formatCurrency, RISK_PROFILES } from "../constants";

// --- HELPER FUNCTIONS FOR ANALYSIS ---

const getAssetAllocation = (assets: Asset[], totalValue: number) => {
  const categoryValues: Record<string, number> = {};
  assets.forEach(a => { categoryValues[a.category] = (categoryValues[a.category] || 0) + a.amount; });
  const getPct = (id: string) => totalValue > 0 ? ((categoryValues[id] || 0) / totalValue) * 100 : 0;
  return { values: categoryValues, getPct };
};

const groupAssetsByPlan = (assets: Asset[]) => {
  const plans: Record<string, number> = {};
  let unallocated = 0;
  assets.forEach(a => {
    if (a.plan && a.plan.trim() !== '') {
      plans[a.plan] = (plans[a.plan] || 0) + a.amount;
    } else {
      unallocated += a.amount;
    }
  });
  return { plans, unallocated };
};

// --- BUILD PROMPT FOR GEMINI (CLOUD AI) ---

const buildPrompt = (assets: Asset[], totalValue: number, user?: User | null): string => {
  const { getPct } = getAssetAllocation(assets, totalValue);
  const { plans, unallocated } = groupAssetsByPlan(assets);

  const simplifiedAssets = assets.map(a => 
    `- ${a.name} (${ASSET_CATEGORIES.find(c => c.id === a.category)?.name}) [Kỳ hạn: ${a.term} - ${a.plan ? 'Mục tiêu: ' + a.plan : 'Tự do'}]: ${formatCurrency(a.amount)}`
  ).join('\n');
  
  const planSummary = Object.entries(plans).map(([name, val]) => `- ${name}: ${formatCurrency(val)}`).join('\n');

  // Allocation Logic
  const cashPct = getPct('cash');
  const savingsPct = getPct('savings');
  const emergencyPct = getPct('emergency_fund');
  const insurancePct = getPct('insurance');
  const stockPct = getPct('stock');
  const cryptoPct = getPct('crypto');
  const realEstatePct = getPct('real_estate');
  const goldPct = getPct('gold');
  
  const currentSafePct = cashPct + savingsPct + emergencyPct + insurancePct + getPct('cd_money') + getPct('bond') + getPct('bond_fund') + getPct('money_market_fund');
  const currentGrowthPct = 100 - currentSafePct;

  let userProfileContext = "";
  if (user?.riskProfile) {
    const profile = RISK_PROFILES.find(p => p.id === user.riskProfile);
    if (profile) {
        userProfileContext = `
    === HỒ SƠ RỦI RO CỦA NGƯỜI DÙNG ===
    - Loại hồ sơ: "${profile.name}"
    - Mô tả: ${profile.description}
    - Tỷ lệ Mục tiêu (Khuyến nghị): ${profile.recommendedAllocation.safe}% An toàn / ${profile.recommendedAllocation.growth}% Tăng trưởng.
    - Tỷ lệ Thực tế: ${currentSafePct.toFixed(1)}% An toàn / ${currentGrowthPct.toFixed(1)}% Tăng trưởng.
    
    NHIỆM VỤ: So sánh Thực tế vs Mục tiêu. Nếu chênh lệch > 10%, hãy đưa ra lời khuyên tái cấu trúc cụ thể (Bán A mua B).
        `;
    }
  } else {
    userProfileContext = "LƯU Ý: Người dùng chưa làm khảo sát rủi ro. Hãy khuyên họ vào Cài đặt -> Hồ sơ rủi ro.";
  }

  return `Bạn là một Cố vấn Tài chính Cá nhân Cao cấp (Senior Financial Planner). Hãy phân tích dữ liệu sau:
  
  TỔNG QUAN TÀI CHÍNH:
  - Tổng tài sản: ${formatCurrency(totalValue)}
  - Tài sản chưa gán vào kế hoạch: ${formatCurrency(unallocated)} (${((unallocated/totalValue)*100).toFixed(1)}%)
  
  CƠ CẤU CÁC KẾ HOẠCH/MỤC TIÊU:
  ${planSummary || "(Chưa có kế hoạch cụ thể nào)"}

  PHÂN BỔ TÀI SẢN:
  - Thanh khoản (Tiền/Tiết kiệm): ${(cashPct + savingsPct + emergencyPct).toFixed(1)}%
  - Đầu tư Tăng trưởng (Cổ phiếu/Quỹ/Crypto): ${(stockPct + cryptoPct + getPct('fund') + getPct('etf')).toFixed(1)}%
  - Bất động sản: ${realEstatePct.toFixed(1)}%
  - Vàng: ${goldPct.toFixed(1)}%
  
  ${userProfileContext}

  CHI TIẾT DANH MỤC:
  ${simplifiedAssets}
  
  YÊU CẦU TRẢ LỜI (Định dạng Markdown, giọng văn chuyên nghiệp, sắc sảo):
  1. **Chấm điểm sức khỏe tài chính (Thang 10/10)**: Đánh giá dựa trên thanh khoản, đa dạng hóa và kỷ luật.
  2. **Phân tích Rủi ro & Tái cấu trúc**: Dựa trên hồ sơ rủi ro, hãy chỉ ra điểm "lệch pha" và cách sửa chữa.
  3. **Phân tích Kỳ hạn (Maturity Mismatch)**: Kiểm tra xem người dùng có đang dùng tiền ngắn hạn mua tài sản dài hạn (như BĐS, Vàng) không? Hoặc để tiền dài hạn vào tiết kiệm lãi thấp không?
  4. **Cảnh báo cụ thể**: Cảnh báo rủi ro (lạm phát hoặc thanh khoản).
  
  Trả lời ngắn gọn, tập trung vào hành động (Actionable Advice).`;
};

// --- RULE BASED ENGINE (OFFLINE AI) ---

const generateRuleBasedAnalysis = (assets: Asset[], totalValue: number, user?: User | null): string => {
  if (totalValue === 0) return "Dữ liệu trống. Vui lòng nhập tài sản để hệ thống phân tích.";

  const { getPct } = getAssetAllocation(assets, totalValue);
  const { plans, unallocated } = groupAssetsByPlan(assets);
  const advice: string[] = [];

  // 1. Calculate Core Metrics
  const liquidPct = getPct('cash') + getPct('savings') + getPct('money_market_fund') + getPct('emergency_fund');
  const investmentPct = getPct('stock') + getPct('etf') + getPct('fund') + getPct('bond') + getPct('bond_fund') + getPct('real_estate') + getPct('gold');
  const speculativePct = getPct('crypto') + getPct('foreign_currency');
  
  // Safe vs Growth for Risk Profiling
  const safeAssetsPct = liquidPct + getPct('bond') + getPct('bond_fund') + getPct('insurance') + getPct('cd_money');
  const growthAssetsPct = 100 - safeAssetsPct;

  // 2. Financial Health Score Algorithm
  let healthScore = 50; // Base score
  
  // Liquidity Check (+20 pts)
  if (liquidPct >= 10 && liquidPct <= 30) healthScore += 20; // Ideal liquidity
  else if (liquidPct > 5 && liquidPct < 50) healthScore += 10; // Acceptable
  
  // Diversification Check (+20 pts)
  const maxConcentration = Math.max(
    getPct('real_estate'), getPct('stock'), getPct('cash'), getPct('crypto'), getPct('gold')
  );
  if (maxConcentration < 50) healthScore += 20; // Good diversification
  else if (maxConcentration < 70) healthScore += 10;
  
  // Planning Discipline (+10 pts)
  const allocatedPct = 100 - ((unallocated / totalValue) * 100);
  if (allocatedPct > 20) healthScore += 10; // At least 20% assets have a plan

  // --- START REPORT ---
  advice.push(`### 🤖 Phân Tích Thuật Toán (Offline Mode)`);
  
  // SECTION 1: HEALTH SCORE
  let healthColor = "text-yellow-500";
  if (healthScore >= 80) healthColor = "text-emerald-500";
  else if (healthScore < 50) healthColor = "text-red-500";

  advice.push(`**Điểm Sức Khỏe Tài Chính: ${healthScore}/100**`);
  if (healthScore < 50) advice.push(`_Nhận xét: Cơ cấu tài sản đang mất cân đối nghiêm trọng. Cần điều chỉnh ngay._`);
  else if (healthScore < 80) advice.push(`_Nhận xét: Tạm ổn, nhưng cần tối ưu hóa hiệu quả đầu tư và phân bổ rủi ro._`);
  else advice.push(`_Nhận xét: Tuyệt vời! Bạn có nền tảng tài chính vững chắc._`);

  // SECTION 2: RISK PROFILE ANALYSIS
  advice.push(`#### 1. Đánh giá Hồ sơ Rủi ro`);
  if (user?.riskProfile) {
      const profile = RISK_PROFILES.find(p => p.id === user.riskProfile);
      if (profile) {
          const targetGrowth = profile.recommendedAllocation.growth;
          const diff = growthAssetsPct - targetGrowth;
          
          advice.push(`- **Hồ sơ của bạn:** ${profile.name}`);
          advice.push(`- **Mục tiêu:** ${profile.recommendedAllocation.safe}% An toàn / ${targetGrowth}% Tăng trưởng`);
          advice.push(`- **Thực tế:** ${safeAssetsPct.toFixed(1)}% An toàn / ${growthAssetsPct.toFixed(1)}% Tăng trưởng`);

          if (Math.abs(diff) <= 10) {
              advice.push(`✅ **Đánh giá:** Danh mục PHÙ HỢP với khẩu vị rủi ro. Bạn đang đi đúng hướng.`);
              healthScore += 10; // Bonus score
          } else if (diff > 10) {
              advice.push(`⚠️ **Cảnh báo:** Danh mục quá MẠO HIỂM so với hồ sơ (Lệch +${diff.toFixed(1)}%).`);
              advice.push(`👉 **Khuyến nghị:** Cân nhắc chốt lời một phần Cổ phiếu/Crypto/BĐS để chuyển sang Trái phiếu hoặc Tiền gửi.`);
          } else {
              advice.push(`⚠️ **Cảnh báo:** Danh mục quá THẬN TRỌNG (Lệch ${diff.toFixed(1)}%).`);
              advice.push(`👉 **Khuyến nghị:** Bạn đang lãng phí cơ hội sinh lời. Hãy mạnh dạn đầu tư thêm vào ETF hoặc Cổ phiếu Bluechip.`);
          }
      }
  } else {
      advice.push(`ℹ️ Bạn chưa thiết lập Hồ sơ rủi ro. Hãy vào **Cài đặt -> Hồ sơ rủi ro** để hệ thống đưa ra lời khuyên chính xác.`);
  }

  // SECTION 3: PLAN ANALYSIS
  advice.push(`#### 2. Phân tích Kế hoạch & Mục tiêu`);
  if (Object.keys(plans).length > 0) {
      const planNames = Object.keys(plans).join(", ");
      advice.push(`Bạn đang phân bổ tài sản cho: **${planNames}**.`);
      if (allocatedPct < 50) {
          advice.push(`⚠️ **Lưu ý:** ${((unallocated/totalValue)*100).toFixed(0)}% tài sản của bạn đang ở trạng thái "Tự do" (Chưa gán mục tiêu). Việc gán tên kế hoạch (ví dụ: "Nghỉ hưu", "Quỹ giáo dục") sẽ giúp bạn kỷ luật hơn.`);
      } else {
          advice.push(`✅ Rất tốt! Đa số tài sản đã được quy hoạch cho các mục tiêu cụ thể.`);
      }
  } else {
      advice.push(`⚠️ **Cảnh báo:** Bạn chưa gán tài sản nào vào "Kế hoạch". Hãy chỉnh sửa tài sản và thêm tên Kế hoạch (VD: Mua nhà, Mua xe) để quản lý tiến độ mục tiêu.`);
  }

  // SECTION 4: ASSET SPECIFIC WARNINGS & MATURITY MISMATCH
  advice.push(`#### 3. Cảnh báo & Khuyến nghị Chi tiết`);
  const warnings: string[] = [];

  // Liquidity
  if (liquidPct > 60) warnings.push(`📉 **Rủi ro Lạm phát:** Bạn đang giữ quá nhiều tiền mặt (${liquidPct.toFixed(1)}%). Hãy cân nhắc đầu tư để tránh mất giá.`);
  if (liquidPct < 5) warnings.push(`🆘 **Rủi ro Thanh khoản:** Lượng tiền mặt quá thấp (${liquidPct.toFixed(1)}%). Cần bổ sung Quỹ dự phòng khẩn cấp ngay (tối thiểu 3-6 tháng chi tiêu).`);

  // Crypto
  if (speculativePct > 15 && user?.riskProfile !== 'aggressive') {
      warnings.push(`💣 **Rủi ro Biến động:** Tỷ trọng Crypto/Ngoại tệ cao (${speculativePct.toFixed(1)}%). Đây là lớp tài sản rủi ro nhất, nên giới hạn dưới 10-15% nếu bạn không phải nhà đầu tư mạo hiểm.`);
  }

  // Real Estate
  if (getPct('real_estate') > 70) {
      warnings.push(`🏠 **Mất cân đối BĐS:** Bất động sản chiếm tới ${getPct('real_estate').toFixed(1)}%. Tài sản này thanh khoản chậm. Đảm bảo bạn có đủ tiền mặt dự phòng lớn.`);
  }

  // Gold
  if (getPct('gold') > 20) {
      warnings.push(`✨ **Vàng:** Tỷ trọng vàng cao (${getPct('gold').toFixed(1)}%). Vàng là hầm trú ẩn tốt nhưng sinh lời kém trong dài hạn so với Cổ phiếu/BĐS.`);
  }

  // --- NEW LOGIC: Maturity Mismatch (Lệch pha kỳ hạn) ---
  
  // 1. Risky assets in Short Term bucket
  // Logic: Assets like Gold, Real Estate, Stocks are volatile. Putting them in <1 year bucket means you might have to sell at loss.
  const volatileShortTermAssets = assets.filter(a => 
    a.term === 'short_term' && 
    ['real_estate', 'gold', 'stock', 'fund', 'etf', 'crypto'].includes(a.category)
  );
  if (volatileShortTermAssets.length > 0) {
      const names = volatileShortTermAssets.map(a => a.name).slice(0, 3).join(", ");
      const suffix = volatileShortTermAssets.length > 3 ? "..." : "";
      warnings.push(`⏳ **Lệch pha kỳ hạn (Ngắn hạn):** Bạn đang xếp loại các tài sản biến động mạnh (${names}${suffix}) là "Ngắn hạn". \n👉 **Rủi ro:** Nếu thị trường giảm khi bạn cần rút tiền gấp, bạn sẽ chịu lỗ nặng. Nên chuyển sang mục tiêu Dài hạn.`);
  }

  // 2. Safe/Cash assets in Long Term bucket
  // Logic: Keeping cash for >3 years loses value due to inflation.
  const cashLongTermAssets = assets.filter(a => 
    a.term === 'long_term' && 
    ['cash', 'savings', 'emergency_fund'].includes(a.category)
  );
  if (cashLongTermAssets.length > 0) {
      warnings.push(`💤 **Hiệu quả vốn thấp:** Bạn đang để Tiền mặt/Tiết kiệm cho mục tiêu "Dài hạn" (>3 năm). Lạm phát sẽ làm giảm giá trị thực của số tiền này. Hãy cân nhắc đầu tư vào Cổ phiếu hoặc BĐS.`);
  }

  // 3. Risky assets in Emergency Fund
  const riskyEmergencyAssets = assets.filter(a => 
    a.term === 'emergency' && 
    ['stock', 'etf', 'fund', 'real_estate', 'crypto'].includes(a.category)
  );
  if (riskyEmergencyAssets.length > 0) {
      const names = riskyEmergencyAssets.map(a => a.name).slice(0, 2).join(", ");
      warnings.push(`🚨 **Cảnh báo Quỹ dự phòng:** Quỹ khẩn cấp cần thanh khoản tức thì và an toàn. Bạn không nên chứa tài sản rủi ro như ${names}... ở đây.`);
  }

  if (warnings.length > 0) {
      advice.push(...warnings);
  } else {
      advice.push(`✅ Hiện tại chưa phát hiện rủi ro tập trung hay lệch pha kỳ hạn lớn nào.`);
  }

  advice.push(`\n_💡 Mẹo: Chuyển sang chế độ **Gemini AI (Cloud)** để nhận phân tích sâu hơn về kinh tế vĩ mô và gợi ý mã đầu tư cụ thể._`);

  return advice.join("\n\n");
};

export const generateFinancialAnalysis = async (
  assets: Asset[], 
  totalValue: number, 
  config: AIConfig,
  user?: User | null
): Promise<string> => {
  const prompt = buildPrompt(assets, totalValue, user);

  if (config.provider === 'rule_based') {
    await new Promise(resolve => setTimeout(resolve, 800)); // UX delay simulation
    return generateRuleBasedAnalysis(assets, totalValue, user);
  }

  if (config.provider === 'gemini') {
    try {
      const apiKey = config.apiKey || process.env.API_KEY;
      
      if (!apiKey || apiKey.trim() === '') {
         return "⚠️ Chưa cấu hình API Key. Vui lòng nhấn vào biểu tượng bánh răng (Cài đặt) trên góc phải, chọn Gemini và nhập API Key của bạn.";
      }
      
      if (apiKey.includes("your_key_here")) {
          return "⚠️ API Key không hợp lệ (key mặc định). Vui lòng vào Cài đặt và nhập Key thực của bạn.";
      }

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Không nhận được phản hồi từ Gemini.";
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const message = error instanceof Error ? error.message : String(error);
      
      if (message.includes("process is not defined")) {
        throw new Error("Lỗi môi trường trình duyệt. Hãy thử nhập API Key trực tiếp trong phần Cài đặt.");
      }
      
      if (message.includes("403") || message.includes("permission_denied") || message.includes("API key not valid")) {
        throw new Error("API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại trong phần Cài đặt.");
      }
      
      throw new Error(`Lỗi Gemini: ${message}`);
    }
  }

  return "Nhà cung cấp AI không hợp lệ.";
};
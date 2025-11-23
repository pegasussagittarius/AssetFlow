import { GoogleGenAI } from "@google/genai";
import { Asset, AIConfig, User } from "../types";
import { ASSET_CATEGORIES, formatCurrency, RISK_PROFILES } from "../constants";

const buildPrompt = (assets: Asset[], totalValue: number, user?: User | null): string => {
  const simplifiedAssets = assets.map(a => 
    `- ${a.name} (${ASSET_CATEGORIES.find(c => c.id === a.category)?.name}): ${formatCurrency(a.amount)}`
  ).join('\n');
  
  // Calculate current allocation for prompt
  const categoryValues: Record<string, number> = {};
  assets.forEach(a => { categoryValues[a.category] = (categoryValues[a.category] || 0) + a.amount; });
  const getPct = (id: string) => ((categoryValues[id] || 0) / totalValue) * 100;
  
  const cashPct = getPct('cash');
  const savingsPct = getPct('savings');
  const emergencyPct = getPct('emergency_fund');
  const insurancePct = getPct('insurance');
  const foreignCurrencyPct = getPct('foreign_currency');
  const stockPct = getPct('stock');
  const cryptoPct = getPct('crypto');
  const bondPct = getPct('bond') + getPct('bond_fund');
  const goldPct = getPct('gold');
  
  const currentSafePct = cashPct + savingsPct + emergencyPct + insurancePct + getPct('cd_money') + bondPct + getPct('money_market_fund');
  const currentGrowthPct = 100 - currentSafePct;

  let userProfileContext = "";
  if (user?.riskProfile) {
    const profile = RISK_PROFILES.find(p => p.id === user.riskProfile);
    if (profile) {
        userProfileContext = `
    === PHÂN TÍCH HỒ SƠ RỦI RO ===
    1. Hồ sơ người dùng: "${profile.name}"
    2. Mô tả hồ sơ: ${profile.description}
    3. Tỷ lệ Mục tiêu (Khuyến nghị): ${profile.recommendedAllocation.safe}% An toàn / ${profile.recommendedAllocation.growth}% Tăng trưởng.
    4. Tỷ lệ Thực tế của người dùng: ${currentSafePct.toFixed(1)}% An toàn / ${currentGrowthPct.toFixed(1)}% Tăng trưởng.
    
    YÊU CẦU ĐẶC BIỆT: Hãy so sánh Thực tế vs Mục tiêu.
    - Nếu chênh lệch > 10%: Cảnh báo người dùng đang đi lệch hướng (quá an toàn hoặc quá rủi ro).
    - Đưa ra hành động cụ thể: Cần MUA THÊM nhóm nào và BÁN BỚT nhóm nào để quay về tỷ lệ mục tiêu ${profile.recommendedAllocation.safe}/${profile.recommendedAllocation.growth}.
        `;
    }
  } else {
    userProfileContext = "LƯU Ý: Người dùng chưa làm khảo sát rủi ro. Hãy khuyên họ vào Cài đặt -> Hồ sơ rủi ro để xác định khẩu vị đầu tư, từ đó có lời khuyên chính xác hơn.";
  }

  return `Bạn là một chuyên gia tư vấn tài chính cá nhân chuyên nghiệp (Certified Financial Planner) với phong cách khách quan, sắc sảo.
  
  DỮ LIỆU TÀI CHÍNH:
  - Tổng tài sản: ${formatCurrency(totalValue)}
  - Tiền mặt/Tiền gửi/Dự phòng: ${(cashPct + savingsPct + emergencyPct).toFixed(1)}%
  - Ngoại tệ: ${foreignCurrencyPct.toFixed(1)}%
  - Bảo hiểm nhân thọ (Giá trị hoàn lại): ${insurancePct.toFixed(1)}%
  - Cổ phiếu: ${stockPct.toFixed(1)}%
  - Crypto: ${cryptoPct.toFixed(1)}%
  - Trái phiếu: ${bondPct.toFixed(1)}%
  - Vàng: ${goldPct.toFixed(1)}%
  
  ${userProfileContext}

  CHI TIẾT DANH MỤC:
  ${simplifiedAssets}
  
  HÃY TRẢ LỜI CÁC CÂU HỎI SAU (Định dạng Markdown):
  1. **Đánh giá sức khỏe tài chính**: Nhận xét ngắn gọn về thanh khoản (đặc biệt là Quỹ dự phòng) và sự đa dạng hóa. Lưu ý: Ngoại tệ cũng có tính thanh khoản cao nhưng có rủi ro tỷ giá.
  2. **Phân tích Rủi ro**: Dựa trên hồ sơ rủi ro (nếu có), danh mục này có phù hợp không?
  3. **Khuyến nghị Tái cấu trúc (QUAN TRỌNG)**: Gợi ý cụ thể các bước điều chỉnh danh mục (Ví dụ: "Nên giảm 10% Crypto để chuyển sang Trái phiếu").
  4. **Cơ hội & Rủi ro**: Chỉ ra 1 cơ hội tiềm năng và 1 rủi ro lớn nhất trong danh mục này.
  
  Trả lời ngắn gọn, súc tích, đi thẳng vào vấn đề.`;
};

const generateRuleBasedAnalysis = (assets: Asset[], totalValue: number, user?: User | null): string => {
  if (totalValue === 0) return "Dữ liệu trống. Vui lòng nhập tài sản để tôi có thể phân tích.";

  const categoryValues: Record<string, number> = {};
  assets.forEach(a => {
    categoryValues[a.category] = (categoryValues[a.category] || 0) + a.amount;
  });

  const getPct = (id: string) => ((categoryValues[id] || 0) / totalValue) * 100;

  const cashPct = getPct('cash');
  const savingsPct = getPct('savings');
  const emergencyPct = getPct('emergency_fund');
  const insurancePct = getPct('insurance');
  const cryptoPct = getPct('crypto');
  const stockPct = getPct('stock');
  const realEstatePct = getPct('real_estate');
  const foreignCurrencyPct = getPct('foreign_currency');
  
  const safeAssetsPct = cashPct + savingsPct + emergencyPct + insurancePct + getPct('cd_money') + getPct('bond') + getPct('bond_fund') + getPct('money_market_fund');
  // Ngoại tệ và Vàng được xếp vào nhóm biến động (Risky/Growth) trong mô hình đơn giản này để thận trọng, mặc dù chúng thường là tài sản phòng thủ
  const riskyAssetsPct = stockPct + cryptoPct + getPct('fund') + getPct('etf') + realEstatePct + getPct('gold') + foreignCurrencyPct + getPct('other'); 
  
  let advice: string[] = [];
  
  advice.push(`### Phân tích Cơ bản (Offline)\nTổng tài sản: **${formatCurrency(totalValue)}**.`);

  if (user?.riskProfile) {
     const profile = RISK_PROFILES.find(p => p.id === user.riskProfile);
     if (profile) {
         advice.push(`🎯 **Hồ sơ rủi ro:** ${profile.name}`);
         advice.push(`- Mục tiêu: ${profile.recommendedAllocation.safe}% An toàn / ${profile.recommendedAllocation.growth}% Tăng trưởng`);
         advice.push(`- Thực tế: ${safeAssetsPct.toFixed(1)}% An toàn / ${riskyAssetsPct.toFixed(1)}% Tăng trưởng`);
         
         const growthDiff = riskyAssetsPct - profile.recommendedAllocation.growth;
         
         if (growthDiff > 10) {
             advice.push(`⚠️ **CẢNH BÁO:** Danh mục RỦI RO HƠN mức cho phép (${growthDiff.toFixed(1)}%). Bạn nên cân nhắc chốt lời bớt các tài sản rủi ro (Cổ phiếu, Crypto, Ngoại tệ) và chuyển sang Tiền gửi/Trái phiếu.`);
         } else if (growthDiff < -10) {
             advice.push(`⚠️ **LƯU Ý:** Danh mục QUÁ AN TOÀN so với hồ sơ (${Math.abs(growthDiff).toFixed(1)}%). Bạn có thể bỏ lỡ cơ hội sinh lời. Hãy cân nhắc đầu tư thêm vào Quỹ cổ phiếu hoặc ETF.`);
         } else {
             advice.push(`✅ **Tuyệt vời:** Danh mục của bạn đang được phân bổ hợp lý theo hồ sơ rủi ro.`);
         }
     }
  } else {
     advice.push("ℹ️ _Bạn chưa thiết lập Hồ sơ rủi ro. Hãy vào Cài đặt để làm khảo sát và nhận lời khuyên chính xác hơn._");
  }

  // General checks logic
  if (safeAssetsPct > 80 && (!user?.riskProfile || user.riskProfile !== 'safe')) {
    advice.push("⚠️ **Cảnh báo Lạm phát:** Hơn 80% tài sản nằm ở kênh an toàn. Sức mua của bạn có thể bị bào mòn bởi lạm phát.");
  } 

  if (emergencyPct < 5) {
      advice.push("🛡️ **Quỹ dự phòng:** Tỷ lệ Quỹ dự phòng (Emergency Fund) hiện khá thấp. Nên duy trì mức 3-6 tháng chi tiêu sinh hoạt.");
  }

  if (cryptoPct > 15 && (!user?.riskProfile || !['aggressive', 'growth'].includes(user.riskProfile))) {
    advice.push(`💎 **Crypto (${cryptoPct.toFixed(1)}%):** Tỷ trọng khá cao. Đây là kênh rủi ro lớn, hãy thận trọng.`);
  }

  if (realEstatePct > 70) {
    advice.push("🏠 **Bất động sản:** Tài sản kém thanh khoản chiếm tỷ trọng rất lớn. Cần chuẩn bị quỹ dự phòng khẩn cấp đủ lớn (6-12 tháng chi tiêu).");
  }
  
  if (foreignCurrencyPct > 20) {
      advice.push(`💱 **Ngoại tệ (${foreignCurrencyPct.toFixed(1)}%):** Bạn đang giữ khá nhiều ngoại tệ. Hãy lưu ý rủi ro biến động tỷ giá.`);
  }

  advice.push("\n_Lưu ý: Đây là phân tích dựa trên thuật toán tĩnh. Để có lời khuyên sâu sắc hơn, hãy chuyển sang chế độ Gemini AI._");

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
    await new Promise(resolve => setTimeout(resolve, 800)); // UX delay
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
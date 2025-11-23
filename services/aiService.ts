import { GoogleGenAI } from "@google/genai";
import { Asset, AIConfig } from "../types";
import { ASSET_CATEGORIES, formatCurrency } from "../constants";

const buildPrompt = (assets: Asset[], totalValue: number): string => {
  const simplifiedAssets = assets.map(a => 
    `- ${a.name} (${ASSET_CATEGORIES.find(c => c.id === a.category)?.name}): ${formatCurrency(a.amount)}`
  ).join('\n');
  
  return `Bạn là một chuyên gia tư vấn tài chính cá nhân chuyên nghiệp (Certified Financial Planner). 
  Hãy phân tích danh mục đầu tư sau đây của tôi và đưa ra lời khuyên bằng tiếng Việt.
  
  TỔNG TÀI SẢN: ${formatCurrency(totalValue)}
  
  CHI TIẾT DANH MỤC:
  ${simplifiedAssets}
  
  YÊU CẦU:
  1. Đánh giá mức độ rủi ro và sự đa dạng hóa.
  2. Chỉ ra các điểm yếu (ví dụ: quá nhiều tiền mặt, quá nhiều crypto, thiếu thanh khoản).
  3. Gợi ý tái cấu trúc danh mục cụ thể (nên mua thêm gì, bán bớt gì).
  4. Trả lời ngắn gọn, súc tích, dùng định dạng Markdown.`;
};

const generateRuleBasedAnalysis = (assets: Asset[], totalValue: number): string => {
  if (totalValue === 0) return "Dữ liệu trống. Vui lòng nhập tài sản để tôi có thể phân tích.";

  const categoryValues: Record<string, number> = {};
  assets.forEach(a => {
    categoryValues[a.category] = (categoryValues[a.category] || 0) + a.amount;
  });

  const getPct = (id: string) => ((categoryValues[id] || 0) / totalValue) * 100;

  const cashPct = getPct('cash');
  const savingsPct = getPct('savings');
  const cryptoPct = getPct('crypto');
  const stockPct = getPct('stock');
  const realEstatePct = getPct('real_estate');
  
  // Cập nhật nhóm an toàn và rủi ro với các loại quỹ mới
  const safeAssetsPct = cashPct + savingsPct + getPct('cd_money') + getPct('bond') + getPct('bond_fund') + getPct('money_market_fund');
  const riskyAssetsPct = stockPct + cryptoPct + getPct('fund') + getPct('etf');

  let advice: string[] = [];
  
  advice.push(`### Phân tích Cơ bản (Offline)\nTổng tài sản: **${formatCurrency(totalValue)}**.`);

  if (safeAssetsPct > 80) {
    advice.push("⚠️ **Cảnh báo Lạm phát:** Hơn 80% tài sản nằm ở kênh an toàn (Tiền mặt/Tiết kiệm/Quỹ trái phiếu). Bạn đang an toàn nhưng có thể bị mất giá do lạm phát.\n👉 **Gợi ý:** Cân nhắc chuyển 10-20% sang Chứng chỉ quỹ ETF hoặc Cổ phiếu Bluechip.");
  } else if (riskyAssetsPct > 60) {
    advice.push("⚠️ **Cảnh báo Rủi ro cao:** Danh mục phụ thuộc lớn (>60%) vào tài sản biến động (Cổ phiếu/Crypto/ETF).\n👉 **Gợi ý:** Đảm bảo bạn đã có quỹ dự phòng khẩn cấp (6 tháng chi tiêu) trước khi đầu tư thêm.");
  } else {
    advice.push("✅ **Cân bằng tốt:** Tỷ lệ phân bổ giữa Tăng trưởng và An toàn khá hợp lý.");
  }

  if (cryptoPct > 15) {
    advice.push(`💎 **Crypto (${cryptoPct.toFixed(1)}%):** Tỷ trọng khá cao cho kênh rủi ro này. Hãy cân nhắc chốt lời khi thị trường hưng phấn.`);
  }

  if ((stockPct + getPct('etf') + getPct('fund')) > 0 && (stockPct + getPct('etf') + getPct('fund')) < 10) {
    advice.push("📈 **Kênh Tăng Trưởng:** Bạn phân bổ khá ít cho Cổ phiếu/ETF. Hãy tìm hiểu về DCA (Trung bình giá) vào các quỹ ETF để tận dụng lãi suất kép.");
  }

  if (realEstatePct > 70) {
    advice.push("🏠 **Bất động sản:** Tài sản kém thanh khoản chiếm tỷ trọng rất lớn. Cần chuẩn bị dòng tiền mặt dự phòng.");
  }

  advice.push("\n_Lưu ý: Đây là phân tích dựa trên thuật toán tĩnh. Để có lời khuyên sâu sắc hơn, hãy chuyển sang chế độ Gemini AI._");

  return advice.join("\n\n");
};

export const generateFinancialAnalysis = async (
  assets: Asset[], 
  totalValue: number, 
  config: AIConfig
): Promise<string> => {
  const prompt = buildPrompt(assets, totalValue);

  if (config.provider === 'rule_based') {
    await new Promise(resolve => setTimeout(resolve, 800)); // UX delay
    return generateRuleBasedAnalysis(assets, totalValue);
  }

  if (config.provider === 'gemini') {
    try {
      if (!process.env.API_KEY) {
         return "⚠️ Lỗi cấu hình: Không tìm thấy API Key cho Gemini. Vui lòng kiểm tra biến môi trường `API_KEY`.";
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Không nhận được phản hồi từ Gemini.";
    } catch (error) {
      console.error(error);
      throw new Error("Lỗi khi gọi Google Gemini API. Vui lòng thử lại sau.");
    }
  }

  return "Nhà cung cấp AI không hợp lệ.";
};
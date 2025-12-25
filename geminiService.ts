
import { GoogleGenAI } from "@google/genai";
import { FormDataState, ReconSide, MedicRecord } from './types';

// Lazy initialization: 延遲初始化，讓應用程式可以在沒有 API key 的情況下載入
let aiClient: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (aiClient) {
    return aiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error(
      "❌ API Key 未設定\n\n" +
      "請在專案根目錄建立 .env 檔案並加入：\n" +
      "GEMINI_API_KEY=你的_API_金鑰\n\n" +
      "如何取得 API Key：\n" +
      "前往 https://aistudio.google.com/apikey 取得免費的 Gemini API Key"
    );
  }

  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
};

const getFireDescription = (code: string) => {
  if (code === '1') return '火光(1)';
  if (code === '2') return '竄窗(2)';
  if (code === '3') return '延燒潛勢(3)';
  return '無火(0)';
};

const getSmokeVVdDescription = (code: string) => {
  if (code === '1') return '慢/小/淡(1)';
  if (code === '2') return '快/大/濃(2)';
  if (!code || code === '0') return '無(0)';
  return `${code}`;
};

import { DEFAULT_AI_MODEL, ISO_SYSTEM_PROMPT, MEDIC_SYSTEM_PROMPT } from './constants';

export const generateISOAnalysis = async (formData: FormDataState): Promise<string> => {
  const structureDetail = formData.structure === '其他' ? formData.structureOther : formData.structure;
  const weatherFull = `${formData.weatherCondition}, 氣溫${formData.temperature}度`;

  const parts: any[] = [{ text: `[基本資訊] 災害:${formData.incidentName}; 結構:${structureDetail}; 環境:${weatherFull}` }];

  Object.entries(formData.recon).forEach(([key, data]) => {
    const side = key.replace('s', '第 ') + ' 面';
    const smokeVVCD = `量:${getSmokeVVdDescription(data.smokeV1)}/速:${getSmokeVVdDescription(data.smokeV2)}/色:${data.smokeC}/濃:${getSmokeVVdDescription(data.smokeD)}`;
    const riskStr = `${data.riskSelected.join(', ')} ${data.riskOther}`;
    const reconText = `[${side} 偵查數據] 樓層:${data.floor}; 火勢:${getFireDescription(data.fire)}; 煙霧:${smokeVVCD}; 門:${data.door}/窗:${data.window}; 作業組數:${data.groups}; 風險:${riskStr}。`;
    parts.push({ text: reconText });

    if (data.image) {
      const base64Data = data.image.split(',')[1];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
      }
    }
  });

  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: DEFAULT_AI_MODEL,
    contents: { parts },
    config: {
      systemInstruction: ISO_SYSTEM_PROMPT,
    },
  });

  return response.text || "分析失敗，無法取得內容。";
};

export const generateMedicAnalysis = async (row: MedicRecord): Promise<string> => {
  const parts: any[] = [{ text: `當下監控: ${row.monitor}` }];
  if (row.image) {
    const base64Data = row.image.split(',')[1];
    if (base64Data) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }
  }

  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: DEFAULT_AI_MODEL,
    contents: { parts },
    config: {
      systemInstruction: MEDIC_SYSTEM_PROMPT,
    },
  });

  return response.text || "分析失敗，無法取得內容。";
};

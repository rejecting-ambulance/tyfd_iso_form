
import { GoogleGenAI } from "@google/genai";
import { FormDataState, ReconSide, MedicRecord } from './types';

// Fix: Initialized GoogleGenAI strictly following guidelines using only process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateISOAnalysis = async (formData: FormDataState): Promise<string> => {
  const structureDetail = formData.structure === '其他' ? formData.structureOther : formData.structure;
  const weatherFull = `${formData.weatherCondition}, 氣溫${formData.temperature}度`;

  const systemPrompt = `你是一名專業火場事故安全官(ISO)。請根據以下資訊(含建築、天氣、RECON四面偵查數據及照片)，進行初步分析並提出安全建議。
    
    【輸出格式要求】：
    請務必使用 Markdown 語法，包含標題 (###) 與條列式 (1. 或 - )，並使用表情符號增強閱讀性。
    格式範例：
    ### 🔴 綜合風險評估
    1. 結構風險：...
    2. 火勢發展：...
    
    ### ⚠️ 危險區域與潛勢
    - 北側：...
    - 頂樓：...
    
    ### 🛡️ 行動安全建議
    1. 指揮官(IC)：...
    2. 內部人員：...

    請直接輸出內容，不需開場白。`;

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

  // Fix: Used gemini-3-pro-preview for complex reasoning task as it involves safety-critical logic
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return response.text || "分析失敗，無法取得內容。";
};

export const generateMedicAnalysis = async (row: MedicRecord): Promise<string> => {
  const systemPrompt = `你是一名火場事故安全官 (ISO)。你正在填寫 MEDIC 評估表。
    【輸出格式要求】：
    請務必使用 Markdown 語法。
    
    ### 👁️ 評估 (Evaluate)
    - 風慶：...
    
    ### 🚧 預防 (Develop)
    - 措施：...
    
    ### 🚒 介入 (Intervention)
    - 行動：...`;

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

  // Fix: Used gemini-3-pro-preview for complex reasoning task as it involves safety-critical logic
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: systemPrompt,
    },
  });

  return response.text || "分析失敗，無法取得內容。";
};

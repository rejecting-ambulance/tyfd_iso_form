
export const FIRE_OPTIONS = [
  { value: '0', label: '0 (無火/未輸入)' },
  { value: '1', label: '1 (火光: 該層有火)' },
  { value: '2', label: '2 (竄窗: 火勢外延)' },
  { value: '3', label: '3 (延燒潛勢)' },
];

export const SMOKE_COLOR_OPTIONS = ['無', '白色', '灰色', '黑色', '黃色', '棕色', '特殊色'];

export const ENTRY_OPTIONS = [
  { value: '未知', label: '未知' },
  { value: '可進入', label: '可進入' },
  { value: '不可進入', label: '不可進入' },
  { value: '無', label: '無開口' },
];

export const RISK_OPTIONS = [
  '感電',
  '腐蝕',
  '爆炸',
  '墜落',
  '掉落物',
  '倒塌',
  '操作不當'
];

export const WEATHER_CONDITIONS = ['晴天', '陰天', '雨天', '強風', '其他'];
export const GROUND_CONDITIONS = ['平坦', '不平坦', '濕滑', '泥濘', '障礙物', '其他'];
export const STRUCTURE_OPTIONS = ['RC', '鐵皮', '磚造', '木造', '其他'];
export const COMMUNICATE_TARGETS = ['未指定', '操作者', '帶隊官', '指揮官'];


export const RIT_EQUIPMENT_OPTIONS = ['導引繩', '防護水線', 'TIC', 'Fast Board', 'AirPak'];

// AI Configuration
export const DEFAULT_AI_MODEL = 'gemini-2.0-flash';

export const ISO_SYSTEM_PROMPT = `你是一名專業火場事故安全官(ISO)。請根據以下資訊(含建築、天氣、RECON四面偵查數據及照片)，進行初步分析並提出安全建議。

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

export const MEDIC_SYSTEM_PROMPT = `你是一名火場事故安全官 (ISO)。你正在填寫 MEDIC 評估表。
【輸出格式要求】：
請務必使用 Markdown 語法。

### 👁️ 評估 (Evaluate)
- 風險：...

### 🚧 預防 (Develop)
- 措施：...

### 🚒 介入 (Intervention)
- 行動：...`;

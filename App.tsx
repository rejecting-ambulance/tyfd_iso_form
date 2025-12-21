
import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, Trash2, Eraser, Info, AlertTriangle, User, Clock, Building, 
  Flame, Wind, Activity, FileText, Layers, Eye, Camera, XCircle, 
  ClipboardList, Plus, Sparkles, Siren, CheckSquare, Radio, MessageCircle, 
  ShieldAlert, ChevronDown, Edit3, Check, FileDown, Minus
} from 'lucide-react';
import { 
  vibrate, resizeImage, getNowDateTime, formatTimeForDisplay 
} from './utils';
import { 
  FIRE_OPTIONS, SMOKE_COLOR_OPTIONS, ENTRY_OPTIONS, RISK_OPTIONS, 
  WEATHER_CONDITIONS, GROUND_CONDITIONS, COMMUNICATE_TARGETS, 
  RIT_EQUIPMENT_OPTIONS 
} from './constants';
import { FormDataState, ReconSide, MedicRecord, MaydayLog } from './types';
import { generateISOAnalysis, generateMedicAnalysis } from './geminiService';

// --- Shared Components ---

const SectionTitle: React.FC<{ 
  icon?: any, title: string, className?: string, colorClass?: string, borderClass?: string 
}> = ({ icon: Icon, title, className = "", colorClass = "text-orange-600", borderClass = "border-orange-600" }) => (
  <div className={`flex items-center gap-2 border-b-2 ${borderClass} pb-2 mb-4 mt-6 print:border-black print:mt-4 ${className} break-inside-avoid`}>
    {Icon && <Icon className={`w-6 h-6 ${colorClass} print:hidden`} />}
    <h2 className="text-xl font-bold text-gray-900 print:text-black">{title}</h2>
  </div>
);

const InputField: React.FC<{
  label?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  placeholder?: string, type?: string, className?: string, width?: string, suffix?: string, inputMode?: any,
  step?: string, readOnly?: boolean
}> = ({ label, value, onChange, placeholder, type = "text", className = "", width = "w-full", suffix, inputMode, step, readOnly }) => (
  <div className={`flex flex-col ${width} ${className}`}>
    {label && <label className="text-sm font-bold text-gray-700 mb-1 print:text-black">{label}</label>}
    <div className="flex items-center">
      <input
        type={type}
        inputMode={inputMode}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        readOnly={readOnly}
        className={`border border-gray-300 rounded-lg px-3 py-2 text-base text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 w-full shadow-sm bg-white print:border-none print:bg-transparent print:p-0 print:font-bold print:text-black print:text-sm print:placeholder-transparent ${suffix ? 'rounded-r-none border-r-0' : ''}`}
      />
      {suffix && (
        <span className="bg-white border border-gray-300 border-l-0 rounded-r-lg px-3 py-2 text-sm text-gray-800 font-bold print:bg-transparent print:border-none print:text-black print:pl-1">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const StepperInput: React.FC<{
  label?: string, value: string, onChange: (val: string) => void, 
  step?: number, suffix?: string, min?: number, className?: string,
  placeholder?: string
}> = ({ label, value, onChange, step = 1, suffix, min = 0, className = "", placeholder }) => {
  const handleUpdate = (delta: number) => {
    vibrate(5);
    const current = parseFloat(value) || 0;
    const nextValue = Math.max(min, current + delta);
    onChange(nextValue.toString());
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-sm font-bold text-gray-700 mb-1 print:text-black">{label}</label>}
      <div className="flex items-stretch border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white print:border-none">
        <input 
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-base text-black font-bold focus:outline-none min-w-0 bg-white print:p-0 print:text-sm appearance-none"
        />
        {suffix && (
          <span className="flex items-center px-2 text-xs font-bold text-gray-500 bg-white border-l border-r border-gray-200 print:hidden">
            {suffix}
          </span>
        )}
        <div className="flex border-l border-gray-200 no-print">
          <button 
            type="button"
            onClick={() => handleUpdate(-step)}
            className="px-3 bg-white text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center border-r border-gray-200 cursor-pointer"
          >
            <Minus size={16} />
          </button>
          <button 
            type="button"
            onClick={() => handleUpdate(step)}
            className="px-3 bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-colors flex items-center justify-center cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SelectField: React.FC<{
  label?: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, 
  options: any[], className?: string, width?: string, hideLabel?: boolean
}> = ({ label, value, onChange, options, className = "", width = "w-full", hideLabel = false }) => (
  <div className={`flex flex-col ${width} ${className}`}>
    {!hideLabel && label && <label className="text-sm font-bold text-gray-700 mb-1 print:text-black">{label}</label>}
    <div className="relative">
      <select
        value={value || ''}
        onChange={onChange}
        className="border border-gray-300 rounded-lg px-3 py-2 text-base text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 w-full appearance-none bg-white shadow-sm print:border-none print:bg-transparent print:p-0 print:font-bold print:text-black print:text-sm"
      >
        {options.map((option) => {
          const val = typeof option === 'object' ? option.value : option;
          const lbl = typeof option === 'object' ? option.label : option;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-800 print:hidden">
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);

const TextAreaField: React.FC<{
  label?: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
  placeholder?: string, rows?: number, hideLabel?: boolean
}> = ({ label, value, onChange, placeholder, rows = 3, hideLabel = false }) => (
  <div className="flex flex-col w-full">
    {!hideLabel && label && <label className="text-sm font-bold text-gray-700 mb-1 print:text-black">{label}</label>}
    <textarea
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="border border-gray-300 rounded-lg px-3 py-2 text-base text-black font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm bg-white print:border-none print:bg-transparent print:p-0 print:font-bold print:text-black print:text-sm print:resize-none print:placeholder-transparent"
    />
  </div>
);

const RadioGroup: React.FC<{
  label: string, name: string, options: string[], value: string, onChange: (val: string) => void, 
  className?: string
}> = ({ label, name, options, value, onChange, className = "" }) => (
  <div className={`flex flex-col mb-3 ${className}`}>
    <label className="text-sm font-bold text-gray-800 mb-2 print:text-black">{label}</label>
    <div className="flex flex-wrap gap-3 items-center">
      {options.map((option) => (
        <label key={option} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border shadow-sm transition-all active:scale-95 print:border-none print:shadow-none print:p-0 ${value === option ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-200' : 'bg-white border-gray-300'}`}>
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={(e) => { vibrate(); onChange(e.target.value); }}
            className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 print:w-3 print:h-3"
          />
          <span className="text-base text-black font-bold print:text-sm print:text-black">{option}</span>
        </label>
      ))}
    </div>
  </div>
);

const RiskSelector: React.FC<{
  values: string[], otherValue: string, onChange: (risks: string[], other: string) => void
}> = ({ values = [], otherValue = '', onChange }) => {
  const handleCheck = (risk: string) => {
    vibrate();
    const newValues = values.includes(risk)
      ? values.filter(v => v !== risk)
      : [...values, risk];
    onChange(newValues, otherValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-purple-600">風險評估 (可多選)</span>
      <div className="flex flex-wrap gap-2">
        {RISK_OPTIONS.map(risk => (
          <label key={risk} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all active:scale-95 ${values.includes(risk) ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-100 shadow-inner' : 'bg-white border-gray-200 shadow-sm'}`}>
            <input 
              type="checkbox" 
              checked={values.includes(risk)} 
              onChange={() => handleCheck(risk)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 bg-white"
            />
            <span className="text-sm text-black font-bold">{risk}</span>
          </label>
        ))}
      </div>
      <input 
        type="text"
        value={otherValue || ''} 
        onChange={(e) => onChange(values, e.target.value)}
        className="border-b border-gray-300 text-black font-bold py-1 text-sm w-full focus:outline-none focus:border-purple-500 bg-white print:border-none print:p-0"
        placeholder="其他風險 (自由撰寫)..."
      />
    </div>
  );
};

const TimeRecorder: React.FC<{
  label?: string, value: string, onChange: (val: string) => void, 
  className?: string, buttonOnly?: boolean, minimal?: boolean
}> = ({ label, value, onChange, className = "", buttonOnly = false, minimal = false }) => {
  const recordCurrentTime = () => {
    vibrate(20);
    onChange(getNowDateTime());
  };

  const displayValue = value ? formatTimeForDisplay(value) : '____';
  const timeOnly = value ? value.split('T')[1] : '____';

  if (minimal) {
    return (
      <button
        type="button"
        onClick={recordCurrentTime}
        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors shadow-sm active:scale-95 cursor-pointer ${value ? 'bg-white border-gray-400 text-black' : 'bg-white text-gray-400 border-dashed border-gray-300'} hover:bg-orange-50 hover:border-orange-300 ${className} print:border-none print:bg-transparent print:p-0`}
        title="點擊帶入目前日期與時間"
      >
        <Clock size={16} className={`print:hidden ${value ? "text-orange-600" : "text-gray-400"}`} />
        <span className="font-mono font-bold text-base text-black print:text-black print:text-sm">{timeOnly}</span>
      </button>
    );
  }

  if (buttonOnly) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {label && <span className="text-xs font-bold text-gray-600 w-10 truncate">{label}</span>}
        <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white print:border-none">
          <span className="flex-1 px-2 py-1 text-sm bg-white text-black font-bold flex items-center justify-center font-mono print:p-0 print:font-bold print:justify-start">
            {timeOnly}
          </span>
          <button
            type="button"
            onClick={recordCurrentTime}
            className="px-3 bg-orange-500 text-white active:bg-orange-700 flex items-center justify-center print:hidden cursor-pointer"
            title="帶入目前日期與時間"
          >
            <Clock size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-bold text-gray-700 mb-1 print:text-black">{label}</label>
      <div className="flex items-stretch border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white print:border-none print:p-0 print:bg-transparent">
        <span className="flex-1 px-3 py-2 text-base bg-white text-black font-bold flex items-center font-mono print:bg-transparent print:font-bold print:text-black print:text-sm print:p-0">
          {displayValue !== '____' ? displayValue : '尚未記錄'}
        </span>
        <button
          type="button"
          onClick={recordCurrentTime}
          className="px-4 bg-orange-500 text-white active:bg-orange-700 shrink-0 print:hidden flex items-center justify-center cursor-pointer"
          title="帶入目前日期與時間"
        >
          <Clock size={20} />
        </button>
      </div>
    </div>
  );
};

const AIReportView: React.FC<{
  content: string, placeholder?: string, onEdit: () => void, minHeight?: string
}> = ({ content, placeholder, onEdit, minHeight = "150px" }) => {
  if (!content) {
    return (
      <div 
        onClick={onEdit}
        className={`w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-400 cursor-pointer hover:border-blue-400 active:bg-gray-50 flex items-center justify-center transition-colors bg-white`}
        style={{ minHeight }}
      >
        <div className="flex flex-col items-center gap-3">
          <Sparkles size={32} className="text-blue-300" />
          <span className="text-sm font-bold text-gray-500">{placeholder || "點擊使用 AI 生成分析"}</span>
        </div>
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-none">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-100 flex justify-between items-center print:hidden">
        <span className="text-sm font-bold text-blue-800 flex items-center gap-2"><Sparkles size={16}/> 智能分析報告</span>
        <button type="button" onClick={onEdit} className="text-xs flex items-center gap-1 text-blue-600 font-bold px-3 py-1.5 rounded-full bg-white shadow-sm active:bg-blue-50 transition-colors cursor-pointer">
          <Edit3 size={12} /> 編輯
        </button>
      </div>
      <div className="p-4 text-sm text-gray-900 font-medium leading-relaxed space-y-2 print:p-0">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2"></div>;

          if (trimmed.startsWith('###') || trimmed.startsWith('【')) {
            return (
              <h4 key={idx} className="font-bold text-blue-900 mt-4 mb-2 text-base border-l-4 border-blue-500 pl-3 bg-blue-50 py-1 rounded-r-lg">
                {trimmed.replace(/###/g, '').replace(/\*/g, '')}
              </h4>
            );
          }
          
          if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
            return (
              <div key={idx} className="flex gap-2 ml-1">
                <span className="text-blue-500 mt-1.5">•</span>
                <span className="leading-relaxed font-bold text-black">{trimmed.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '')}</span>
              </div>
            );
          }

          const numMatch = trimmed.match(/^\d+\./);
          if (numMatch) {
            return (
              <div key={idx} className="flex gap-2 ml-1 font-bold text-black">
                <span className="text-blue-600 mt-0.5">{numMatch[0]}</span>
                <span className="leading-relaxed text-black">{trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}</span>
              </div>
            );
          }

          return <p key={idx} className="text-black font-bold leading-relaxed">{trimmed}</p>;
        })}
      </div>
    </div>
  );
};

// --- Main App Logic ---

const getInitialState = (): FormDataState => ({
  isoName: '', arrivalTime: '', 
  incidentName: '', icName: '',
  floorsAbove: '', floorsBelow: '', usage: '',
  structure: '', structureOther: '', floorArea: '',
  asoRequestTime: '', asoName: '', asoArrivalTime: '',
  icConfirmTime: '',
  trapped: '無', trappedCount: '', hospitalizedCount: '',
  deploymentGroups: '',
  briefingTime: '',
  ritTime: '', ritLeader: '',
  weatherCondition: '晴天', temperature: '25', windDirection: '',
  groundStatus: '平坦', groundStatusOther: '',
  recon: {
    s1: { floor: '', fire: '0', smokeV1: '', smokeV2: '', smokeC: '無', smokeD: '', door: '未知', window: '未知', groups: '', riskSelected: [], riskOther: '', time: '', image: null },
    s2: { floor: '', fire: '0', smokeV1: '', smokeV2: '', smokeC: '無', smokeD: '', door: '未知', window: '未知', groups: '', riskSelected: [], riskOther: '', time: '', image: null },
    s3: { floor: '', fire: '0', smokeV1: '', smokeV2: '', smokeC: '無', smokeD: '', door: '未知', window: '未知', groups: '', riskSelected: [], riskOther: '', time: '', image: null },
    s4: { floor: '', fire: '0', smokeV1: '', smokeV2: '', smokeC: '無', smokeD: '', door: '未知', window: '未知', groups: '', riskSelected: [], riskOther: '', time: '', image: null },
  },
  medicRecords: [],
  mayday: {
    confirmTime: '', trappedCount: '', ritOfficer: '',
    lunarLocation: '', lunarUnit: '', lunarName: '', lunarAirTask: '', lunarResources: '',
    asoRequestTime: '', asoName: '', asoArrivalTime: '',
    radioChannel: '', equipment: [], equipmentBreaking: '', equipmentOther: '',
    eventLog: []
  },
  analysis: ''
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'recon' | 'medic' | 'mayday'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [medicLoading, setMedicLoading] = useState<Record<number, boolean>>({});
  const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);
  const [editingMedicRowId, setEditingMedicRowId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormDataState>(getInitialState());

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('fire_iso_form_v15');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fire_iso_form_v15', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: keyof FormDataState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateRecon = (side: keyof typeof formData.recon, field: keyof ReconSide, value: any) => {
    setFormData(prev => ({
      ...prev,
      recon: { ...prev.recon, [side]: { ...prev.recon[side], [field]: value } }
    }));
  };

  const handleImageUpload = async (side: keyof typeof formData.recon, file: File | null) => {
    if (!file) return;
    try {
      const base64 = await resizeImage(file);
      updateRecon(side, 'image', base64);
    } catch (e) {
      alert("圖片處理失敗");
    }
  };

  // --- MEDIC Logic ---
  const addMedicRow = () => {
    vibrate(20);
    const newRow: MedicRecord = {
      id: Date.now(), 
      time: '', 
      monitor: '', 
      image: null, 
      analysis_action: '', 
      communicate: '未指定'
    };
    setFormData(prev => ({ 
      ...prev, 
      medicRecords: [newRow, ...prev.medicRecords] 
    }));
  };

  const deleteMedicRow = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    vibrate(40);
    if(window.confirm("確定要刪除這筆 MEDIC 評估紀錄嗎？")) {
      setFormData(prev => {
        const newList = prev.medicRecords.filter(item => item.id !== id);
        return { ...prev, medicRecords: [...newList] };
      });
    }
  };

  const updateMedicRow = (id: number, field: keyof MedicRecord, value: any) => {
    setFormData(prev => ({
      ...prev,
      medicRecords: prev.medicRecords.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  // --- MAYDAY Logic ---
  const addMaydayLog = () => {
    vibrate(20);
    const newLog: MaydayLog = { id: Date.now(), time: '', event: '' };
    setFormData(prev => ({
      ...prev,
      mayday: { 
        ...prev.mayday, 
        eventLog: [newLog, ...prev.mayday.eventLog] 
      }
    }));
  };

  const deleteMaydayLog = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    vibrate(40);
    if(window.confirm("確定要刪除這筆事件紀錄嗎？")) {
        setFormData(prev => {
            const newList = prev.mayday.eventLog.filter(item => item.id !== id);
            return {
                ...prev,
                mayday: {
                    ...prev.mayday,
                    eventLog: [...newList]
                }
            };
        });
    }
  };

  const updateMaydayLog = (id: number, field: keyof MaydayLog, value: any) => {
    setFormData(prev => ({
      ...prev,
      mayday: {
        ...prev.mayday,
        eventLog: prev.mayday.eventLog.map(l => l.id === id ? { ...l, [field]: value } : l)
      }
    }));
  };

  // AI Logic
  const callISOAI = async () => {
    setIsLoading(true);
    vibrate(30);
    try {
      const result = await generateISOAnalysis(formData);
      updateField('analysis', result);
      setIsEditingAnalysis(false);
    } catch (e: any) {
      alert("AI 分析失敗: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const callMedicAI = async (id: number) => {
    const row = formData.medicRecords.find(r => r.id === id);
    if (!row) return;
    setMedicLoading(prev => ({ ...prev, [id]: true }));
    vibrate(30);
    try {
      const result = await generateMedicAnalysis(row);
      updateMedicRow(id, 'analysis_action', result);
      setEditingMedicRowId(null);
    } catch (e: any) {
      alert("AI 分析失敗: " + e.message);
    } finally {
      setMedicLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const resetAll = () => {
    vibrate(50);
    if (confirm("確定要清空所有已輸入的資訊嗎？此動作無法復原。")) {
      localStorage.removeItem('fire_iso_form_v15');
      setFormData(getInitialState());
      vibrate(20);
      setTimeout(() => window.location.reload(), 200);
    }
  };

  const handlePrintToPDF = () => {
    vibrate(30);
    window.print();
  };

  // --- View Renders ---

  const renderBasic = () => (
    <div className="space-y-6 pb-20 animate-fadeIn bg-white">
      <SectionTitle icon={User} title="1. 基本資訊" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="事故安全官 (ISO)" value={formData.isoName} onChange={(e) => updateField('isoName', e.target.value)} />
        <TimeRecorder label="抵達現場時間" value={formData.arrivalTime} onChange={(val) => updateField('arrivalTime', val)} />
      </div>

      <SectionTitle icon={AlertTriangle} title="2. 指揮概況" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="災害名稱" value={formData.incidentName} onChange={(e) => updateField('incidentName', e.target.value)} />
        <InputField label="初期指揮官 (IC)" value={formData.icName} onChange={(e) => updateField('icName', e.target.value)} />
      </div>
      
      <SectionTitle icon={Building} title="3. 建築資訊" />
      <div className="bg-white p-4 rounded-xl border border-gray-200 mt-2 shadow-sm space-y-4">
          <div className="flex gap-2">
            <StepperInput label="地上層" value={formData.floorsAbove} onChange={(val) => updateField('floorsAbove', val)} suffix="層" className="flex-1" />
            <StepperInput label="地下層" value={formData.floorsBelow} onChange={(val) => updateField('floorsBelow', val)} suffix="層" className="flex-1" />
          </div>
          <InputField label="建築用途" value={formData.usage} onChange={(e) => updateField('usage', e.target.value)} />
          <RadioGroup label="建築構造" name="structure" options={['RC', '鐵皮', '磚造', '木造']} value={formData.structure} onChange={(val) => updateField('structure', val)} />
          <StepperInput label="單層面積" value={formData.floorArea} onChange={(val) => updateField('floorArea', val)} suffix="m²" step={100} />
      </div>

      <SectionTitle icon={User} title="4. 助理安全官 (ASO)" />
      <div className="grid grid-cols-1 gap-4">
        <TimeRecorder label="請求 ASO 時間" value={formData.asoRequestTime} onChange={(val) => updateField('asoRequestTime', val)} />
        <InputField label="ASO 姓名" value={formData.asoName} onChange={(e) => updateField('asoName', e.target.value)} />
        <TimeRecorder label="ASO 抵達時間" value={formData.asoArrivalTime} onChange={(val) => updateField('asoArrivalTime', val)} />
        <TimeRecorder label="與 IC 確認時間" value={formData.icConfirmTime} onChange={(val) => updateField('icConfirmTime', val)} />
      </div>

      <SectionTitle icon={Info} title="5. 受困與部署" />
      <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm space-y-4">
        <RadioGroup label="民眾受困情形" name="trapped" options={['無', '有']} value={formData.trapped} onChange={(val) => updateField('trapped', val)} />
        {formData.trapped === '有' && (
          <div className="grid grid-cols-2 gap-4">
            <StepperInput label="尚未脫困 (人)" value={formData.trappedCount} onChange={val => updateField('trappedCount', val)} />
            <StepperInput label="已脫困 (人)" value={formData.hospitalizedCount} onChange={val => updateField('hospitalizedCount', val)} />
          </div>
        )}
        <StepperInput label="現場作業組數" value={formData.deploymentGroups} onChange={val => updateField('deploymentGroups', val)} />
      </div>

      <SectionTitle icon={Clock} title="6. RIT" />
      <div className="grid grid-cols-1 gap-4">
         <TimeRecorder label="初次簡報時間" value={formData.briefingTime} onChange={(val) => updateField('briefingTime', val)} />
         <TimeRecorder label="RIT 成立時間" value={formData.ritTime} onChange={(val) => updateField('ritTime', val)} />
         <InputField label="RIT 帶隊官" value={formData.ritLeader} onChange={(e) => updateField('ritLeader', e.target.value)} />
      </div>

      <SectionTitle icon={Wind} title="7. 環境與天氣" />
      <div className="grid grid-cols-1 gap-4">
        <div className="flex gap-2">
          <RadioGroup 
              label="天氣" 
              name="weather" 
              options={['晴天', '陰天', '雨天', '強風']} 
              value={formData.weatherCondition} 
              onChange={(val) => updateField('weatherCondition', val)}
              className="flex-1"
          />
          <StepperInput label="氣溫" value={formData.temperature} onChange={(val) => updateField('temperature', val)} suffix="°C" className="w-24" min={-50} />
        </div>
        <InputField label="風向" value={formData.windDirection} onChange={(e) => updateField('windDirection', e.target.value)} />
        <RadioGroup 
            label="地面狀況" 
            name="ground" 
            options={['平坦', '不平坦', '濕滑', '泥濘', '障礙物']} 
            value={formData.groundStatus} 
            onChange={(val) => updateField('groundStatus', val)} 
        />
        <TextAreaField 
            label="環境與地面備註 (其他)" 
            placeholder="描述特殊天氣、地面結冰、大量障礙物等特殊狀況..." 
            value={formData.groundStatusOther} 
            onChange={(e) => updateField('groundStatusOther', e.target.value)}
        />
      </div>
    </div>
  );

  const renderReconSide = (sideKey: keyof typeof formData.recon, title: string) => {
    const data = formData.recon[sideKey];
    const fileRef = useRef<HTMLInputElement>(null);
    return (
      <div className="border border-gray-200 p-3 rounded-xl bg-white shadow-sm print:bg-white print:border-black break-inside-avoid mb-4">
        <div className="font-bold bg-orange-50 p-2 rounded-lg mb-3 text-center text-orange-900 border border-orange-100 print:bg-gray-100 print:text-black">
          {title}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <StepperInput label="樓層" value={data.floor} onChange={(val) => updateRecon(sideKey, 'floor', val)} />
            <SelectField label="火勢" value={data.fire} onChange={(e) => updateRecon(sideKey, 'fire', e.target.value)} options={FIRE_OPTIONS} />
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-500 mb-1 block">煙霧 (量/速/色/濃)</span>
            <div className="grid grid-cols-4 gap-1">
              <StepperInput placeholder="量" value={data.smokeV1} onChange={(val) => updateRecon(sideKey, 'smokeV1', val)} />
              <StepperInput placeholder="速" value={data.smokeV2} onChange={(val) => updateRecon(sideKey, 'smokeV2', val)} />
              <SelectField value={data.smokeC} onChange={(e) => updateRecon(sideKey, 'smokeC', e.target.value)} options={SMOKE_COLOR_OPTIONS} hideLabel />
              <StepperInput placeholder="濃" value={data.smokeD} onChange={(val) => updateRecon(sideKey, 'smokeD', val)} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <SelectField label="門" value={data.door} onChange={(e) => updateRecon(sideKey, 'door', e.target.value)} options={ENTRY_OPTIONS} />
            <SelectField label="窗" value={data.window} onChange={(e) => updateRecon(sideKey, 'window', e.target.value)} options={ENTRY_OPTIONS} />
          </div>
          
          <StepperInput label="消防作業組數" value={data.groups} onChange={(val) => updateRecon(sideKey, 'groups', val)} suffix="組" />

          <RiskSelector 
            values={data.riskSelected} 
            otherValue={data.riskOther} 
            onChange={(sel, other) => {
              updateRecon(sideKey, 'riskSelected', sel);
              updateRecon(sideKey, 'riskOther', other);
            }} 
          />
          <div className="flex justify-between items-center">
            <TimeRecorder label="時間" value={data.time} onChange={(val) => updateRecon(sideKey, 'time', val)} buttonOnly className="w-2/3" />
            <div className="print:hidden flex gap-2">
              <button 
                type="button"
                onClick={() => fileRef.current?.click()}
                className="p-2 bg-white text-gray-700 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
                title="拍攝/上傳照片"
              >
                <Camera size={20} />
              </button>
              {data.image && (
                <button type="button" onClick={() => updateRecon(sideKey, 'image', null)} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors shadow-sm cursor-pointer">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(sideKey, e.target.files?.[0] || null)} />
          </div>
          {data.image && <img src={data.image} className="w-full h-40 object-cover rounded-lg border border-gray-200 mt-1" alt="Recon side photo" />}
        </div>
      </div>
    );
  };

  const renderRecon = () => (
    <div className="pb-20 space-y-6 animate-fadeIn bg-white">
      <SectionTitle icon={Eye} title="初期 360° RECON" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
        {renderReconSide('s1', '第 1 面')}
        {renderReconSide('s2', '第 2 面')}
        {renderReconSide('s3', '第 3 面')}
        {renderReconSide('s4', '第 4 面')}
      </div>
      <div className="mt-8 border-t-2 border-gray-200 pt-4 break-inside-avoid">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Activity className="text-green-600" /> AI 分析建議</h3>
          <button 
            type="button"
            onClick={callISOAI} 
            disabled={isLoading} 
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Sparkles size={20} /> {isLoading ? '正在生成...' : '生成報告'}
          </button>
        </div>
        {isEditingAnalysis || !formData.analysis ? (
          <TextAreaField value={formData.analysis} onChange={(e) => updateField('analysis', e.target.value)} placeholder="點擊按鈕生成分析或手動輸入..." rows={10} hideLabel />
        ) : (
          <AIReportView content={formData.analysis} onEdit={() => setIsEditingAnalysis(true)} />
        )}
      </div>
    </div>
  );

  const renderMedic = () => (
    <div className="pb-20 space-y-6 animate-fadeIn bg-white">
      <div className="flex justify-between items-center">
        <SectionTitle icon={ClipboardList} title="評估紀錄 (MEDIC)" className="mt-0 mb-0 border-none" />
        <button type="button" onClick={addMedicRow} className="px-4 py-2 bg-blue-600 text-white rounded-full flex items-center gap-2 font-bold shadow-lg no-print active:scale-95 transition-transform cursor-pointer">
          <Plus size={20} /> 新增
        </button>
      </div>
      <div className="space-y-6">
        {formData.medicRecords.map(row => (
          <div key={row.id} className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-5 break-inside-avoid print:border print:shadow-none relative">
            {/* Delete button wrapper to ensure reliable click */}
            <div className="absolute top-4 right-4 z-50 no-print">
                <button 
                  type="button"
                  onClick={(e) => deleteMedicRow(e, row.id)} 
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 bg-white border border-red-100 shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-90"
                  title="刪除此筆 MEDIC 紀錄"
                >
                  <Trash2 size={24} />
                </button>
            </div>
            <div className="flex items-center mb-4 border-b border-gray-100 pb-2 mr-12">
              <TimeRecorder value={row.time} onChange={(val) => updateMedicRow(row.id, 'time', val)} minimal />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2"><Eye size={18} className="text-blue-500" /> 監控環境與行動</div>
                <TextAreaField value={row.monitor} onChange={(e) => updateMedicRow(row.id, 'monitor', e.target.value)} placeholder="監控描述..." hideLabel />
                {row.image && <img src={row.image} className="w-full h-48 object-cover rounded-lg mt-2 border" alt="Medic assessment" />}
                <div className="mt-2 no-print">
                  <input type="file" className="hidden" id={`medic-img-${row.id}`} accept="image/*" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if(f) updateMedicRow(row.id, 'image', await resizeImage(f));
                  }} />
                  <label htmlFor={`medic-img-${row.id}`} className="cursor-pointer bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border inline-flex transition-colors shadow-sm font-bold text-gray-700">
                    <Camera size={16} /> 上傳/拍攝照片
                  </label>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><ShieldAlert size={18} className="text-orange-500" /> 評估與對策</div>
                  <button 
                    type="button"
                    onClick={() => callMedicAI(row.id)} 
                    disabled={medicLoading[row.id]}
                    className="no-print text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={14} /> {medicLoading[row.id] ? '正在分析...' : 'AI 分析'}
                  </button>
                </div>
                {editingMedicRowId === row.id || !row.analysis_action ? (
                  <TextAreaField value={row.analysis_action} onChange={(e) => updateMedicRow(row.id, 'analysis_action', e.target.value)} placeholder="風險與對策內容..." hideLabel rows={4} />
                ) : (
                  <AIReportView content={row.analysis_action} onEdit={() => setEditingMedicRowId(row.id)} />
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700"><MessageCircle size={16} className="inline mr-1" />溝通對象:</span>
              <SelectField value={row.communicate} onChange={(e) => updateMedicRow(row.id, 'communicate', e.target.value)} options={COMMUNICATE_TARGETS} hideLabel className="flex-1" />
            </div>
          </div>
        ))}

        <button 
          type="button"
          onClick={addMedicRow}
          className="w-full text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-blue-400 hover:text-blue-500 transition-all flex flex-col items-center gap-3 no-print cursor-pointer active:bg-blue-50"
        >
          <div className="p-4 bg-blue-50 rounded-full text-blue-600"><Plus size={32} /></div>
          點擊此處「新增」一筆 MEDIC 評估紀錄
        </button>
      </div>
    </div>
  );

  const renderMayday = () => (
    <div className="pb-20 space-y-6 animate-fadeIn bg-white">
      <div className="bg-red-600 text-white p-5 rounded-xl shadow-lg flex justify-between items-center print:bg-white print:text-red-600 print:border-2 print:border-red-600">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Siren className="animate-pulse" /> MAYDAY</h2>
          <p className="text-red-100 text-sm opacity-90 print:text-red-600">緊急救援狀態</p>
        </div>
        <TimeRecorder value={formData.mayday.confirmTime} onChange={(val) => updateField('mayday', {...formData.mayday, confirmTime: val})} minimal className="print:border-red-600 print:text-red-700" />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500 space-y-4 break-inside-avoid print:border">
          <h3 className="font-bold flex items-center gap-2 border-b pb-2 text-red-700"><Radio size={20} className="text-red-600" /> LUNAR</h3>
          <InputField label="L (Location)" value={formData.mayday.lunarLocation} onChange={(e) => updateField('mayday', {...formData.mayday, lunarLocation: e.target.value})} />
          <div className="flex gap-2">
            <InputField label="U (Unit)" value={formData.mayday.lunarUnit} onChange={(e) => updateField('mayday', {...formData.mayday, lunarUnit: e.target.value})} />
            <InputField label="N (Name)" value={formData.mayday.lunarName} onChange={(e) => updateField('mayday', {...formData.mayday, lunarName: e.target.value})} />
          </div>
          <InputField label="A (Air/Task)" value={formData.mayday.lunarAirTask} onChange={(e) => updateField('mayday', {...formData.mayday, lunarAirTask: e.target.value})} />
          <InputField label="R (Resource)" value={formData.mayday.lunarResources} onChange={(e) => updateField('mayday', {...formData.mayday, lunarResources: e.target.value})} />
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 break-inside-avoid shadow-sm print:shadow-none">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><ClipboardList size={20} /> 事件紀錄</h3>
            <button type="button" onClick={addMaydayLog} className="no-print bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold active:scale-95 transition-transform cursor-pointer"><Plus size={18} /> 新增</button>
          </div>
          <div className="space-y-3">
            {formData.mayday.eventLog.map(log => (
              <div key={log.id} className="bg-white p-3 rounded-lg shadow-sm flex items-start gap-3 border border-gray-200 print:border-none print:shadow-none relative">
                <TimeRecorder value={log.time} onChange={(val) => updateMaydayLog(log.id, 'time', val)} minimal />
                <textarea 
                  className="flex-1 min-h-[50px] outline-none text-base border-b focus:border-red-400 py-1 bg-white text-black font-bold mr-12" 
                  value={log.event} 
                  onChange={(e) => updateMaydayLog(log.id, 'event', e.target.value)}
                  placeholder="詳情內容..."
                />
                <div className="absolute top-3 right-3 z-50 no-print">
                    <button 
                        type="button"
                        onClick={(e) => deleteMaydayLog(e, log.id)} 
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                        title="刪除此筆事件紀錄"
                    >
                      <Trash2 size={24} />
                    </button>
                </div>
              </div>
            ))}
            
            <button 
                type="button"
                onClick={addMaydayLog}
                className="w-full text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold hover:border-red-400 hover:text-red-500 transition-all flex flex-col items-center gap-2 no-print cursor-pointer active:bg-red-50"
              >
                <div className="p-2 bg-red-50 rounded-full text-red-600"><Plus size={24} /></div>
                點擊此處「新增」一筆事件紀錄
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-white overflow-hidden print:h-auto print:block print:bg-white">
      <div className="bg-white shadow-sm p-3 shrink-0 z-20 no-print pt-safe border-b">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-lg text-orange-600 flex items-center gap-2 truncate">
            <Flame className="fill-orange-600" /> 桃園消防 ISO
          </h1>
          <div className="flex gap-2">
            <button type="button" onClick={resetAll} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer active:scale-95" title="清空所有資訊">
              <Eraser size={22} />
            </button>
            <button type="button" onClick={handlePrintToPDF} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-all font-bold cursor-pointer active:scale-95" title="下載 PDF / 列印">
              <span className="hidden sm:inline">下載 PDF</span>
              <FileDown size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-white print:overflow-visible print:h-auto print:bg-white">
        <div className="max-w-5xl mx-auto bg-white min-h-full p-4 md:p-6 print:p-0">
          <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-double border-gray-300">
            <h1 className="text-2xl font-black text-gray-900 mb-2">桃園市政府消防局事故安全官評估簡報表</h1>
            <p className="text-sm text-gray-500 font-mono tracking-tight">桃園消防專業事故安全官系統 - ISO REPORT</p>
          </div>

          <div className={`${activeTab === 'basic' ? 'block' : 'hidden print:block'}`}>{renderBasic()}</div>
          <div className={`${activeTab === 'recon' ? 'block' : 'hidden print:block'}`}>{renderRecon()}</div>
          <div className={`${activeTab === 'medic' ? 'block' : 'hidden print:block page-break'}`}>{renderMedic()}</div>
          <div className={`${activeTab === 'mayday' ? 'block' : 'hidden print:block page-break'}`}>{renderMayday()}</div>

          <div className="hidden print:block mt-10 text-center text-xs text-gray-400 border-t pt-2">
            桃園市政府消防局 - ISO 智慧偵查系統產出時間：{new Date().toLocaleString()}
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-50 no-print pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {[
          { id: 'basic', label: '基本', icon: FileText },
          { id: 'recon', label: '偵查', icon: Layers },
          { id: 'medic', label: 'MEDIC', icon: ClipboardList },
          { id: 'mayday', label: 'MAYDAY', icon: Siren },
        ].map(tab => (
          <button 
            key={tab.id}
            type="button"
            onClick={() => { vibrate(); setActiveTab(tab.id as any); }}
            className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all active:scale-95 cursor-pointer ${activeTab === tab.id ? (tab.id === 'mayday' ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50') : 'text-gray-400'}`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id && tab.id === 'mayday' ? 'animate-pulse' : ''} />
            <span className="text-[10px] mt-1 font-bold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;

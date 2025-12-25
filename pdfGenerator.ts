import { FormDataState } from './types';
import { getNowDateTime, formatTimeForDisplay } from './utils';

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

const generateStructuredHTML = (formData: FormDataState): string => {
  const styles = `
    <style>
      * { margin: 0; padding: 0; }
      body { font-family: 'Microsoft YaHei', Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; }
      .footer { margin-top: 24px; padding: 8px 0 12px 0; text-align: center; font-size: 11px; color: #999; line-height:1.6; page-break-inside: avoid; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ff6b00; padding-bottom: 15px; }
      .header h1 { font-size: 24px; color: #333; margin-bottom: 5px; }
      .header p { font-size: 12px; color: #666; }
      .section { margin-bottom: 25px; page-break-inside: avoid; }
      .section-title { font-size: 18px; font-weight: bold; color: #ff6b00; border-bottom: 2px solid #ff6b00; padding-bottom: 8px; margin-bottom: 15px; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 12px; }
      .row.full { grid-template-columns: 1fr; }
      .field { display: flex; flex-direction: column; }
      .field-label { font-size: 12px; font-weight: bold; color: #666; margin-bottom: 4px; }
      .field-value { font-size: 14px; color: #333; font-weight: 500; padding: 8px; background: #f9f9f9; border-radius: 4px; min-height: 24px; }
      .field-value.empty { color: #999; font-style: italic; }
      .subsection { margin-left: 20px; margin-top: 12px; padding-left: 12px; border-left: 3px solid #ff8c00;   page-break-inside: avoid; break-inside: avoid; }
      .subsection-title { font-weight: bold; color: #ff8c00; margin-bottom: 8px; }
      .photo { margin-top: 12px; text-align: center;  page-break-inside: avoid; break-inside: avoid; page-break-before: auto; page-break-after: auto; }
      .photo img { max-width: 100%; height: auto; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;   display: block; margin: 0 auto; max-width: 100%; max-height: 260px; object-fit: contain; }
      .photo-label { font-size: 11px; color: #666; margin-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background: #f0f0f0; font-weight: bold; }
      td { font-size: 13px; }
      .risk-item { display: inline-block; background: #f0f0f0; padding: 4px 8px; margin: 2px; border-radius: 3px; font-size: 12px; }
      .page-break { page-break-after: always; }
    </style>
  `;

  let html = styles;
  html += `
    <div class="header">
      <h1>🔥 桃園市政府消防局 - 事故安全官評估簡報表</h1>
      <p>ISO Report | 生成時間：${getNowDateTime()}</p>
    </div>
  `;

  // 1. 基本資訊
  html += `
    <div class="section">
      <div class="section-title">1. 基本資訊</div>
      <div class="row">
        <div class="field">
          <div class="field-label">事故安全官 (ISO)</div>
          <div class="field-value ${!formData.isoName ? 'empty' : ''}">${escapeHtml(formData.isoName || '未輸入')}</div>
        </div>
        <div class="field">
          <div class="field-label">抵達現場時間</div>
          <div class="field-value ${!formData.arrivalTime ? 'empty' : ''}">${formData.arrivalTime ? formatTimeForDisplay(formData.arrivalTime) : '未輸入'}</div>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <div class="field-label">災害名稱</div>
          <div class="field-value ${!formData.incidentName ? 'empty' : ''}">${escapeHtml(formData.incidentName || '未輸入')}</div>
        </div>
        <div class="field">
          <div class="field-label">初期指揮官 (IC)</div>
          <div class="field-value ${!formData.icName ? 'empty' : ''}">${escapeHtml(formData.icName || '未輸入')}</div>
        </div>
      </div>
    </div>
  `;

  // 2. 建築資訊
  html += `
    <div class="section">
      <div class="section-title">2. 建築資訊</div>
      <div class="row">
        <div class="field">
          <div class="field-label">地上層</div>
          <div class="field-value ${!formData.floorsAbove ? 'empty' : ''}">${formData.floorsAbove || '未輸入'} 層</div>
        </div>
        <div class="field">
          <div class="field-label">地下層</div>
          <div class="field-value ${!formData.floorsBelow ? 'empty' : ''}">${formData.floorsBelow ? `B${formData.floorsBelow}` : '未輸入'}</div>
        </div>
      </div>
      <div class="row full">
        <div class="field">
          <div class="field-label">建築用途</div>
          <div class="field-value ${!formData.usage ? 'empty' : ''}">${escapeHtml(formData.usage || '未輸入')}</div>
        </div>
      </div>
      <div class="row full">
        <div class="field">
          <div class="field-label">建築構造</div>
          <div class="field-value ${!formData.structure ? 'empty' : ''}">${escapeHtml((formData.structure === '其他' ? formData.structureOther : formData.structure) || '未輸入')}</div>
        </div>
      </div>
      <div class="row full">
        <div class="field">
          <div class="field-label">單層面積</div>
          <div class="field-value ${!formData.floorArea ? 'empty' : ''}">${formData.floorArea || '未輸入'} m²</div>
        </div>
      </div>
    </div>
  `;

  // 3. 環境與天氣
  html += `
    <div class="section">
      <div class="section-title">3. 環境與天氣</div>
      <div class="row">
        <div class="field">
          <div class="field-label">天氣狀況</div>
          <div class="field-value">${escapeHtml((formData.weatherCondition === '其他' ? formData.weatherOther : formData.weatherCondition) || '未輸入')}</div>
        </div>
        <div class="field">
          <div class="field-label">氣溫</div>
          <div class="field-value">${formData.temperature}°C</div>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <div class="field-label">風向</div>
          <div class="field-value ${!formData.windDirection ? 'empty' : ''}">${escapeHtml(formData.windDirection || '未輸入')}</div>
        </div>
        <div class="field">
          <div class="field-label">地面狀況</div>
          <div class="field-value">${escapeHtml((formData.groundStatus === '其他' ? formData.groundStatusOther : formData.groundStatus) || '未輸入')}</div>
        </div>
      </div>
    </div>
  `;

  // RECON section will be rendered later (after ASO & RIT) to match requested order

  // 4. 受困與部署
  html += `
    <div class="section">
      <div class="section-title">4. 受困與部署</div>
      <div class="row">
        <div class="field">
          <div class="field-label">有無受困</div>
          <div class="field-value">${formData.trapped}</div>
        </div>
      </div>
      ${formData.trapped === '有' ? `
      <div class="row">
        <div class="field">
          <div class="field-label">尚未脫困</div>
          <div class="field-value ${!formData.trappedCount ? 'empty' : ''}">${formData.trappedCount || '未輸入'} 人</div>
        </div>
        <div class="field">
          <div class="field-label">已脫困</div>
          <div class="field-value ${!formData.hospitalizedCount ? 'empty' : ''}">${formData.hospitalizedCount || '未輸入'} 人</div>
        </div>
      </div>
      ` : ''}
      <div class="row full">
        <div class="field">
          <div class="field-label">現場作業組數</div>
          <div class="field-value ${!formData.deploymentGroups ? 'empty' : ''}">${escapeHtml(formData.deploymentGroups || '未輸入')}</div>
        </div>
      </div>
    </div>
  `;

  // 5. ASO 與 RIT
  html += `
    <div class="section">
      <div class="section-title">5. 助理安全官 (ASO) 與 RIT</div>
      <div class="row">
        <div class="field">
          <div class="field-label">ASO 請求時間</div>
          <div class="field-value ${!formData.asoRequestTime ? 'empty' : ''}">${formData.asoRequestTime ? formatTimeForDisplay(formData.asoRequestTime) : '未輸入'}</div>
        </div>
        <div class="field">
          <div class="field-label">ASO 名稱</div>
          <div class="field-value ${!formData.asoName ? 'empty' : ''}">${escapeHtml(formData.asoName || '未輸入')}</div>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <div class="field-label">ASO 抵達時間</div>
          <div class="field-value ${!formData.asoArrivalTime ? 'empty' : ''}">${formData.asoArrivalTime ? formatTimeForDisplay(formData.asoArrivalTime) : '未輸入'}</div>
        </div>
        <div class="field">
          <div class="field-label">IC 確認時間</div>
          <div class="field-value ${!formData.icConfirmTime ? 'empty' : ''}">${formData.icConfirmTime ? formatTimeForDisplay(formData.icConfirmTime) : '未輸入'}</div>
        </div>
      </div>
      <div class="row">
        <div class="field">
          <div class="field-label">RIT 成立時間</div>
          <div class="field-value ${!formData.ritTime ? 'empty' : ''}">${formData.ritTime ? formatTimeForDisplay(formData.ritTime) : '未輸入'}</div>
        </div>
        <div class="field">
          <div class="field-label">RIT 帶隊官</div>
          <div class="field-value ${!formData.ritLeader ? 'empty' : ''}">${escapeHtml(formData.ritLeader || '未輸入')}</div>
        </div>
      </div>
    </div>
  `;

  // 6. 初期 360° RECON (放在 ASO & RIT 之後，成為第 7 類)
  html += `
    <div class="section page-break">
      <div class="section-title">6. 初期 360° 偵查 (RECON)</div>
  `;

  Object.entries(formData.recon).forEach(([key, data]) => {
    const sideNum = key.replace('s', '');
    html += `
      <div class="subsection">
        <div class="subsection-title">第 ${sideNum} 面</div>
        <div class="row">
          <div class="field">
            <div class="field-label">樓層</div>
            <div class="field-value ${!data.floor ? 'empty' : ''}">${escapeHtml(data.floor || '未輸入')}</div>
          </div>
          <div class="field">
            <div class="field-label">火勢</div>
            <div class="field-value">${data.fire === '0' ? '無' : data.fire}</div>
          </div>
        </div>
        <div class="row full">
          <div class="field">
            <div class="field-label">煙霧 (量/速/色/濃)</div>
            <div class="field-value">${escapeHtml(data.smokeV1 || '-')}/${escapeHtml(data.smokeV2 || '-')}/${data.smokeC}/${escapeHtml(data.smokeD || '-')}</div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <div class="field-label">門</div>
            <div class="field-value">${data.door}</div>
          </div>
          <div class="field">
            <div class="field-label">窗</div>
            <div class="field-value">${data.window}</div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <div class="field-label">作業組數</div>
            <div class="field-value ${!data.groups ? 'empty' : ''}">${escapeHtml(data.groups || '未輸入')} 組</div>
          </div>
          <div class="field">
            <div class="field-label">評估時間</div>
            <div class="field-value ${!data.time ? 'empty' : ''}">${data.time ? formatTimeForDisplay(data.time) : '未輸入'}</div>
          </div>
        </div>
        ${data.riskSelected.length > 0 ? `
        <div class="row full">
          <div class="field">
            <div class="field-label">風險評估</div>
            <div class="field-value">
              ${data.riskSelected.map(r => `<span class="risk-item">${escapeHtml(r)}</span>`).join(' ')}
              ${data.riskOther ? `<span class="risk-item">其他: ${escapeHtml(data.riskOther)}</span>` : ''}
            </div>
          </div>
        </div>
        ` : ''}
        ${data.image ? `
        <div class="photo">
          <div class="photo-label">📷 第 ${sideNum} 面現場照片</div>
          <img src="${data.image}" alt="第 ${sideNum} 面照片" />
        </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`;

  // 7. AI 分析
  if (formData.analysis) {
    html += `
      <div class="section page-break">
        <div class="section-title">7. AI 安全分析報告</div>
        <div class="row full">
          <div class="field">
            <div class="field-value" style="background: #f5f5f5; padding: 12px; white-space: pre-wrap; font-family: monospace; font-size: 13px;">
              ${escapeHtml(formData.analysis)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 8. MEDIC 評估紀錄
  html += `
    <div class="section page-break">
      <div class="section-title">8. MEDIC 評估紀錄</div>
  `;
  
  if (formData.medicRecords.length > 0) {
    formData.medicRecords.forEach((record, index) => {
      html += `
        <div class="subsection">
          <div class="subsection-title">MEDIC 紀錄 ${index + 1}</div>
          <div class="row">
            <div class="field">
              <div class="field-label">紀錄時間</div>
              <div class="field-value ${!record.time ? 'empty' : ''}">${record.time ? formatTimeForDisplay(record.time) : '未輸入'}</div>
            </div>
            <div class="field">
              <div class="field-label">通報對象</div>
              <div class="field-value">${record.communicate}</div>
            </div>
          </div>
          <div class="row full">
            <div class="field">
              <div class="field-label">監控環境與行動</div>
              <div class="field-value" style="white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${escapeHtml(record.monitor || '未輸入')}</div>
            </div>
          </div>
          ${record.analysis_action ? `
          <div class="row full">
            <div class="field">
              <div class="field-label">評估與對策</div>
              <div class="field-value" style="white-space: pre-wrap; max-height: 150px; overflow-y: auto;">${escapeHtml(record.analysis_action)}</div>
            </div>
          </div>
          ` : ''}
          ${record.image ? `
          <div class="photo">
            <div class="photo-label">📷 MEDIC 紀錄照片 (${index + 1})</div>
            <img src="${record.image}" alt="MEDIC 照片" />
          </div>
          ` : ''}
        </div>
      `;
    });
  } else {
    html += `
      <div style="padding: 20px; background: #f5f5f5; border-radius: 4px; color: #999; text-align: center;">
        無 MEDIC 評估紀錄
      </div>
    `;
  }
  
  html += `</div>`;

  // 9. MAYDAY 資訊
  html += `
    <div class="section page-break">
      <div class="section-title">9. MAYDAY 資訊</div>
      <div class="row full">
        <div class="field">
          <div class="field-label">MAYDAY 確認時間</div>
          <div class="field-value ${!formData.mayday.confirmTime ? 'empty' : ''}">${formData.mayday.confirmTime ? formatTimeForDisplay(formData.mayday.confirmTime) : '未輸入'}</div>
        </div>
      </div>
      <div class="subsection">
        <div class="subsection-title">LUNAR 資訊</div>
        <div class="row">
          <div class="field">
            <div class="field-label">L (位置, Location)</div>
            <div class="field-value ${!formData.mayday.lunarLocation ? 'empty' : ''}">${escapeHtml(formData.mayday.lunarLocation || '未輸入')}</div>
          </div>
          <div class="field">
            <div class="field-label">U (單位, Unit)</div>
            <div class="field-value ${!formData.mayday.lunarUnit ? 'empty' : ''}">${escapeHtml(formData.mayday.lunarUnit || '未輸入')}</div>
          </div>
        </div>
        <div class="row">
          <div class="field">
            <div class="field-label">N (姓名, Name)</div>
            <div class="field-value ${!formData.mayday.lunarName ? 'empty' : ''}">${escapeHtml(formData.mayday.lunarName || '未輸入')}</div>
          </div>
          <div class="field">
            <div class="field-label">A (空氣/任務, Air/Task)</div>
            <div class="field-value ${!formData.mayday.lunarAirTask ? 'empty' : ''}">${escapeHtml(formData.mayday.lunarAirTask || '未輸入')}</div>
          </div>
        </div>
        <div class="row full">
          <div class="field">
            <div class="field-label">R (資源, Resource)</div>
            <div class="field-value ${!formData.mayday.lunarResources ? 'empty' : ''}">${escapeHtml(formData.mayday.lunarResources || '未輸入')}</div>
          </div>
        </div>
      </div>
  `;

  // 10. MAYDAY 事件紀錄
  if (formData.mayday.eventLog.length > 0) {
    html += `
      <div class="subsection">
        <div class="subsection-title">事件紀錄</div>
        <table>
          <thead>
            <tr>
              <th>時間</th>
              <th>事件內容</th>
            </tr>
          </thead>
          <tbody>
    `;
    formData.mayday.eventLog.forEach((log) => {
      html += `
        <tr>
          <td>${log.time ? formatTimeForDisplay(log.time) : '未輸入'}</td>
          <td>${escapeHtml(log.event || '未輸入')}</td>
        </tr>
      `;
    });
    html += `
          </tbody>
        </table>
      </div>
    `;
  } else {
    html += `
      <div class="subsection">
        <div class="subsection-title">事件紀錄</div>
        <div style="padding: 20px; background: #f5f5f5; border-radius: 4px; color: #999; text-align: center;">
          無 MAYDAY 事件紀錄
        </div>
      </div>
    `;
  }
  
  html += `</div>`;

  // 頁腳
  html += `
    <div class="footer">
      桃園市政府消防局 - 事故安全官智慧評估系統 | 生成於 ${new Date().toLocaleString()}
    </div>
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  ${html}
</body>
</html>`;
};

export const generatePagePDF = async (formData: FormDataState, html2pdfLib: any): Promise<void> => {
  const htmlContent = generateStructuredHTML(formData);
  
  const element = document.createElement('div');
  element.innerHTML = htmlContent;

  const opt = {
    margin: [10, 8, 14, 8], // top, right, bottom, left (mm),
    filename: `ISO_Report_${getNowDateTime().replace(/[:\s]/g, '')}.pdf`,
    html2canvas: { scale: 2, useCORS: true, scrollY: 0, allowTaint: true, windowWidth: 794 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdfLib().set(opt).from(element).save();
  } catch (e: any) {
    console.error(e);
    throw new Error('PDF 生成失敗: ' + e.message);
  }
};

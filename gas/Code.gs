const FOLDER_ID = "請換成您的圖片資料夾ID";
const SHEET_ID = "請換成您的表單ID";

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    // 假設 A1:C1 是標題: [編號, 單位, 姓名]
    // 從第 2 列開始取資料
    const dataRange = sheet.getRange(2, 2, sheet.getLastRow() - 1, 2); 
    const data = dataRange.getValues();
    
    // 過濾空列並整理成物件陣列
    const personnel = [];
    data.forEach(row => {
      if (row[0] && row[1]) {
        personnel.push({ unit: row[0].toString().trim(), name: row[1].toString().trim() });
      }
    });

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: personnel }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === 'uploadImage') {
      const base64Data = postData.image.split(',')[1];
      const contentType = postData.image.split(';')[0].split(':')[1] || 'image/jpeg';
      const uploaderName = postData.uploaderName || '未選擇人員';
      
      const timeString = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmm");
      const fileName = `ISO_${uploaderName}_${timeString}.jpg`;
      const fileBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, fileName);
      
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const file = folder.createFile(fileBlob);
      // 將檔案設為知道連結的使用者皆可檢視 (非必要，但有助於瀏覽)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'success', 
        url: file.getUrl(), 
        id: file.getId() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 未來可以擴充 action === 'submitForm' 來整包寫入 Sheets

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}



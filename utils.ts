
export const vibrate = (ms = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

export const resizeImage = (file: File, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Could not get canvas context');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('圖片載入失敗，檔案可能損壞或非有效圖片'));
    };
    reader.onerror = () => reject(new Error('讀取檔案失敗'));
  });
};

export const formatTimeForDisplay = (timeStr: string) => {
  if (!timeStr) return '未記錄';
  return timeStr.replace('T', ' ');
};

export const getNowDateTime = () => {
  const now = new Date();
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export const fetchPersonnel = async (gasUrl: string): Promise<any[]> => {
  try {
    const response = await fetch(gasUrl);
    const data = await response.json();
    if (data.status === 'success') {
      return data.data;
    } else {
      console.error('Failed to fetch personnel:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return [];
  }
};

export const uploadImageToGAS = async (gasUrl: string, base64Image: string, uploaderName: string = '未選擇人員'): Promise<string> => {
  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'uploadImage',
        image: base64Image,
        uploaderName: uploaderName
      }),
    });

    const result = await response.json();
    if (result.status === 'success') {
      return result.url;
    } else {
      throw new Error(result.message);
    }
  } catch (error: any) {
    console.error('Upload fetch failed:', error);
    throw new Error(error.message || '網路連線錯誤 (Failed to fetch) 或伺服器無回應');
  }
};

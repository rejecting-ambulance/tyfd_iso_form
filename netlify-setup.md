# 部署至 Netlify 的設定步驟

為了確保你的應用程式能夠在 Netlify 正常運作，且能正確地透過 `netlify functions` 存取 Gemini AI，請於 Netlify 後台參照下列設定進行操作：

## 1. 建立新 Site
1. 登入 Netlify 的 Dashboard。
2. 點選 **Add new site** > **Import an existing project**。
3. 選擇 **GitHub**，授權並選取你的專案 repository（確保選擇剛才推播的 `netlify-test` 分支，或後續合併回去的 `main` 分支）。

## 2. 部署設定 (Build Settings)
預設情況下，如果在專案根目錄有提供 `netlify.toml`，Netlify 會自動讀取。但你仍可在介面上檢查確認：
- **Base directory**: 留白即可
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

## 3. 設定環境變數 (Environment Variables)
這是讓 `ask-ai.js` 這個 function 能抓到金鑰的重要步驟：
1. 於 Site 設定的地方，找到 **Site configuration** > **Environment variables** 區塊。
2. 點擊 **Add a variable** > **Add a single variable**。
3. 填寫以下欄位：
   - **Key**: `API_KEY`
   - **Values**: 填入你的 Gemini API 金鑰（例如 `AIzaSyB...`）
4. 點擊 **Create variable** 儲存。

## 4. 觸發部署
設定好環境變數後：
1. 若目前還沒有自動部署，可以到 **Deploys** 分頁。
2. 點選 **Trigger deploy** > **Deploy site**。
3. 部署成功後，瀏覽網頁測試 AI 分析功能是否正常運作。如果一切順利，所有呼叫 `/.netlify/functions/ask-ai` 的請求就會被正確轉發，而不用在前端暴露金鑰。

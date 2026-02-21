<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 桃園消防-iso-事故安全官系統

此專案為桃園消防局的事故安全官系統前端應用程式。

## 🚀 快速開始

### 前置需求

*   Node.js (建議 v20 或以上)

### 安裝與執行

1.  安裝相依套件：
    ```bash
    npm install
    ```

2.  設定環境變數：
    *   **本地開發**：在專案根目錄建立 `.env` 檔案（可參考 `.env.example` 如果有），並加入您的變數：
        ```dotenv
        GEMINI_API_KEY=你的_API_KEY
        GOOGLE_APP_SCRIPT_URL=你的_GAS_網址
        ```
    *   **GitHub部署**：請前往 GitHub 專案的 **Settings** -> **Secrets and variables** -> **Actions**，新增 `GEMINI_API_KEY` 與 `GOOGLE_APP_SCRIPT_URL` 兩個 Repository secrets（設定時請勿加上任何引號）。

3.  啟動開發伺服器：
    ```bash
    npm run dev
    ```

4.  建置正式版本：
    ```bash
    npm run build
    ```

## 📂 專案結構

此專案使用 React + Vite + TypeScript 建置。

*   `src/`: 原始碼目錄
*   `public/`: 靜態資源目錄
*   `.github/workflows`: GitHub Actions CI/CD 設定檔

## ⚙️ 部署 (Deployment)

本專案已設定 GitHub Actions 自動部署至 **GitHub Pages**。

### 設定步驟

1.  將程式碼推送到 GitHub Repository。
2.  進入 GitHub Repository 的 **Settings** > **Pages**。
3.  在 **Build and deployment** > **Source** 選擇 **GitHub Actions**。
4.  之後每次推送到 `main` 或 `master` 分支時，GitHub Actions 會自動建置並部署。

## 📝 開發規範

*   **套件管理**: 使用 `npm`。
*   **版本控制**: 敏感檔案（如 `.env`）已加入 `.gitignore`，請勿上傳。

---
View your app in AI Studio: https://ai.studio/apps/drive/1bUWxcaCWPqttGweaK_S7fhW_lPrzuSrW
 
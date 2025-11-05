# 專案架構說明

本文件旨在說明「一頁式銷售網站」專案的技術架構、資料夾結構及關鍵部分的功能。

## 專案概述

這是一個使用現代前端技術打造的單頁式 (One-Page) 電商銷售網站。專案已整合綠界 (ECPay) 金流，並具備將訂單資料寫入 Google Sheet 的能力。主要目標是在驗證金流可行性後，逐步進行介面與功能的迭代開發。

## 技術棧 (Technology Stack)

*   **前端框架**: [React](https://react.dev/) (v19)
*   **開發與建置工具**: [Vite](https://vitejs.dev/)
*   **程式語言**: [TypeScript](https://www.typescriptlang.org/)
*   **後端邏輯**: [Netlify Functions](https://docs.netlify.com/functions/overview/) (Serverless Functions)
*   **部署平台**: [Netlify](https://www.netlify.com/)
*   **金流服務**: [綠界科技 ECPay](https://www.ecpay.com.tw/)
*   **資料記錄**: [Google Apps Script](https://developers.google.com/apps-script) (作為一個簡易的 Webhook 後端)

## 資料夾結構與功能

```
/
├─── netlify/functions/         # 後端 Serverless Functions
│    ├─── create-ecpay-order.mts  # 1. 建立綠界訂單：接收前端訂單資訊，產生 CheckMacValue，並回傳一個自動提交至綠界的 HTML 表單。
│    └─── notify-google-sheet.mts # 2. 處理綠界通知：接收綠界伺服器的背景通知 (ReturnURL)，驗證 CheckMacValue 和 RtnCode 後，將成功訂單轉發至 Google Apps Script。
│
├─── components/                # React UI 元件
│    ├─── Header.tsx              # 網站標頭
│    ├─── ProductSection.tsx      # 產品顯示區塊
│    ├─── ShoppingCartModal.tsx   # 購物車彈窗
│    ├─── CheckoutModal.tsx       # 結帳資訊填寫彈窗
│    └─── ...                     # 其他 UI 元件
│
├─── SpecDriven/                # 規格文件與外部文件紀錄
│    ├─── ECPay_ReturnURL_Spec.md # 綠界 ReturnURL 技術文件與中文解析
│    └─── ...                     # 其他規格文件
│
├─── App.tsx                    # React 應用程式主進入點，負責狀態管理與畫面切換。
├─── state.ts                   # 全域狀態管理 (useReducer)，包含購物車、當前視圖等。
├─── services/api.ts            # 前端呼叫後端 API (Netlify Functions) 的封裝。
├─── package.json               # 專案依賴與腳本設定。
├─── netlify.toml               # Netlify 部署設定，用於處理 SPA 路由重導向。
└─── LLM_COLLABORATION_WORKFLOW.md # 我們的工作流程文件。
```

## 核心工作流程：一次完整的購買

1.  **使用者操作 (前端)**: 使用者在網站上將商品加入購物車，點擊結帳，並填寫客戶資料。
2.  **建立訂單 (前端 -> 後端)**: 前端 `CheckoutModal` 呼叫 `services/api.ts` 中的 `createEcpayOrder` 函式。
3.  **請求綠界 (後端)**: `create-ecpay-order.mts` 這個 Netlify Function 被觸發。它組合訂單資料，產生 `CheckMacValue`，並回傳一個包含自動提交表單的 HTML 頁面給前端。
4.  **跳轉金流 (前端)**: 前端瀏覽器收到 HTML 後，執行其中的 JavaScript，自動將使用者導向綠界的付款頁面。
5.  **使用者付款 (綠界)**: 使用者在綠界頁面完成付款 (或取消)。
6.  **返回網站 (前端)**: 綠界將使用者的瀏覽器導回到 `OrderResultURL` (即 `/?from_ecpay=1`)。`App.tsx` 偵測到此 URL 參數，顯示一個通用的感謝或處理中頁面。
7.  **伺服器通知 (綠界 -> 後端)**: 在背景，綠界伺服器呼叫我們的 `ReturnURL` (即 `/.netlify/functions/notify-google-sheet`)。
8.  **驗證與記錄 (後端)**: `notify-google-sheet.mts` 函式執行，驗證 `CheckMacValue` 和 `RtnCode`。如果一切正確，它會呼叫預先設定好的 Google Apps Script URL，將訂單資料傳入。
9.  **寫入雲端 (Google)**: Google Apps Script 接收到資料，並將其寫入指定的 Google Sheet 中。

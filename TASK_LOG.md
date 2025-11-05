# 任務日誌

本文件記錄所有已完成的開發任務。

---

*   **任務名稱:** 修正前端路由與後端金流驗證
*   **完成時間:** 2025-11-05
*   **主要工作:**
    1.  **修正前端路由:** 建立 `netlify.toml` 檔案，設定 SPA 的重導向規則，解決了在 Netlify 部署環境下，從外部返回時出現的 "Page Not Found" 錯誤。
    2.  **強化後端安全性:** 修改 `netlify/functions/notify-google-sheet.mts`，加入了對 ECPay `CheckMacValue` 的驗證，確保通知來源的真實性。
    3.  **確保資料正確性:** 在後端函式中，增加了對 ECPay `RtnCode` 的檢查，確保只有在付款成功 (`RtnCode=1`) 的情況下，才會將訂單資料寫入 Google Sheet。
*   **相關 Commit:** `feat: Add ECPay validation and fix Netlify routing`

---

*   **任務名稱:** 解決 ECPay POST 導轉導致的 404 錯誤
*   **完成時間:** 2025-11-05
*   **主要工作:**
    1.  **建立 `netlify/functions/ecpay-post-proxy.mts` Function:** 該 Function 接收 ECPay 的 `POST` 請求，並發出 `HTTP 302` 重導向至前端 `OrderResultURL`，將 `POST` 轉換為 `GET`。
    2.  **修改 `netlify/functions/create-ecpay-order.mts`:** 將 `OrderResultURL` 指向新的 `ecpay-post-proxy.mts` Function。
*   **相關 Commit:** (待使用者執行 git commit 後更新)
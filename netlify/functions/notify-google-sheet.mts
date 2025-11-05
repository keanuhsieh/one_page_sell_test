    import type { Context } from "@netlify/functions";
    
    /*
     * Function 2: 接收通知並寫入 Google
     * * 任務:
     * 1. 接收來自 Function 1 (未來是綠界) 的 Webhook 請求。
     * 2. (POC 簡化) 不做 CheckMacValue 驗證。
     * 3. 讀取 Netlify 環境變數中的 Google Apps Script 網址。
     * 4. 把訂單資料 POST 到 Google Web App。
     */
    export default async (req: Request, context: Context) => {
    
      console.log("[notify-google-sheet] Function triggered.");

      // 1. 取得 Function 1 (或未來綠界) 傳來的資料
      const data = await req.json();
      console.log("[notify-google-sheet] Received data:", JSON.stringify(data, null, 2));
    
      // 2. 讀取我們存在 Netlify 後台的環境變數
      // @ts-ignore
      const GOOGLE_APP_SCRIPT_URL = Netlify.env.get("GOOGLE_APP_SCRIPT_URL");
      console.log("[notify-google-sheet] Read GOOGLE_APP_SCRIPT_URL:", GOOGLE_APP_SCRIPT_URL);
    
      if (!GOOGLE_APP_SCRIPT_URL) {
        console.error("[notify-google-sheet] FATAL: 找不到 GOOGLE_APP_SCRIPT_URL 環境變數");
        return new Response("Webhook 失敗: 伺服器設定錯誤", { status: 500 });
      }
    
      // 3. (真實) 呼叫 Google Apps Script Web App
      try {
        console.log(`[notify-google-sheet] Calling Google Apps Script URL: ${GOOGLE_APP_SCRIPT_URL}`);
        const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data), // 把收到的資料原封不動轉發
        });
    
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Google Apps Script 回應錯誤: ${response.status} ${response.statusText}. Body: ${errorBody}`);
        }
        
        // (POC 除錯用) 顯示 Google 回傳的訊息
        const googleResult = await response.json();
        console.log("[notify-google-sheet] 成功寫入 Google:", googleResult);
    
      } catch (error) {
        console.error("[notify-google-sheet] 呼叫 Google Apps Script 失敗:", error);
        // 即使失敗，也回傳 200 給觸發者 (Function 1)，因為這是背景任務
      }
    
      // 4. 回傳 "1|OK" (如果是綠界，它會需要這個)
      // 雖然 Function 1 (模擬) 不會等這個回應，但這是個好習慣
      return new Response("1|OK");
    };
    


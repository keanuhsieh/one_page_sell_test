import type { Context } from "@netlify/functions";

/*
 * Function 1: 模擬建立訂單
 * * 任務:
 * 1. 假裝自己是綠界，建立了一個訂單。
 * 2. (最重要) 在背景 "模擬" 綠界 webhook，去呼叫我們 "真實" 的 Function 2。
 * 3. 立刻回傳 "OK" 給前端。
 */
export default async (req: Request, context: Context) => {
  
  // 1. 取得前端傳來的訂單資料
  const orderDetails = await req.json();

  // 2. 準備要 "模擬" 綠界 webhook 傳送的資料
  const mockEcpayPayload = {
    MerchantTradeNo: `POC_${Date.now()}`, // 模擬的訂單編號
    RtnCode: '1', // '1' 代表付款成功
    RtnMsg: '付款成功 (模擬)',
    TradeAmt: orderDetails.amount,
    // 真正串接時，這些資料要從前端傳來
    CustomField1: orderDetails.customerEmail, 
    CustomField2: orderDetails.customerName,
    CustomField3: orderDetails.itemName,
  };

  // 3. (關鍵) 在背景呼叫 Function 2，把模擬資料傳過去
  // 這就是用 context.waitUntil 來模擬非同步的 Webhook
  // 這會 "觸發" Function 2，但 "不會" 等待它完成
  context.waitUntil(
    fetch(new URL(req.url).origin + '/.netlify/functions/notify-google-sheet', {
      method: 'POST',
      body: JSON.stringify(mockEcpayPayload),
      headers: { 'Content-Type': 'application/json' }
    })
    .catch(err => console.error("背景呼叫 Function 2 失敗:", err))
  );

  // 4. 立刻回傳給前端，告訴它 "任務已提交"，並附上模擬的訂單編號
  return new Response(JSON.stringify({ 
    orderId: mockEcpayPayload.MerchantTradeNo, // 將模擬訂單編號回傳
    message: "已觸發背景 Google Sheet 寫入 (模擬)" 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

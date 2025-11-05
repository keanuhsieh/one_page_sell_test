import type { Context } from "@netlify/functions";
import crypto from "crypto-js";

// Helper function to generate ECPay CheckMacValue
function generateCheckMacValue(params: Record<string, any>, hashKey: string, hashIV: string): string {
  const sortedKeys = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  
  let checkString = `HashKey=${hashKey}`;
  for (const key of sortedKeys) {
    checkString += `&${key}=${params[key]}`;
  }
  checkString += `&HashIV=${hashIV}`;

  // URL encode, lowercase, then SHA256
  const urlEncoded = encodeURIComponent(checkString).toLowerCase().replace(/\'/g, "%27").replace(/~/g, "%7e").replace(/%20/g, "+");
  const hash = crypto.SHA256(urlEncoded).toString();
  
  return hash.toUpperCase();
}

export default async (req: Request, context: Context) => {
  // 1. Read ECPay credentials from environment variables
  // Uses ECPAY_ variables first, with fallbacks to user's GREEN_CIRCLE_ variables
  const merchantID = Netlify.env.get("ECPAY_MERCHANT_ID") || Netlify.env.get("MERCHANT_ID");
  const hashKey = Netlify.env.get("ECPAY_HASH_KEY") || Netlify.env.get("GREEN_CIRCLE_HASH_KEY");
  const hashIV = Netlify.env.get("ECPAY_HASH_IV") || Netlify.env.get("GREEN_CIRCLE_HASH_IV");
  
  // Using ECPay's staging environment for testing
  const ecpayUrl = "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";

  if (!merchantID || !hashKey || !hashIV) {
    console.error("FATAL: ECPay credentials are not configured in environment variables.");
    return new Response("Server configuration error: ECPay credentials missing.", { status: 500 });
  }

  try {
    // 2. Get order details from the frontend request
    const order = await req.json();
    const totalAmount = String(order.amount);
    const itemName = order.itemName;
    const siteUrl = context.site.url;

    // 3. Construct ECPay parameters
    const tradeNo = "gemini" + Date.now();
    const tradeDate = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Taipei'
    });

    const baseParams = {
      MerchantID: merchantID,
      MerchantTradeNo: tradeNo,
      MerchantTradeDate: tradeDate,
      PaymentType: "aio",
      TotalAmount: totalAmount,
      TradeDesc: "AuraLens Pro Smart Glasses Purchase",
      ItemName: itemName,
      ReturnURL: `${siteUrl}/.netlify/functions/notify-google-sheet`, // Server-side notification URL
      ChoosePayment: "ALL",
      EncryptType: "1",
      OrderResultURL: `${siteUrl}/thank-you`, // Client-side redirect URL after payment
    };

    // 4. Generate CheckMacValue
    const checkMacValue = generateCheckMacValue(baseParams, hashKey, hashIV);

    const allParams = {
      ...baseParams,
      CheckMacValue: checkMacValue,
    };

    // 5. Generate the auto-submitting HTML form
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Redirecting to ECPay...</title>
      </head>
      <body>
        <form id="ecpay-form" method="post" action="${ecpayUrl}" style="display:none;">
          ${Object.entries(allParams).map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value).split('"').join('&quot;')}" />`).join("\n")}
        </form>
        <script type="text/javascript">
          document.getElementById("ecpay-form").submit();
        </script>
        <p>Redirecting to payment gateway, please wait...</p>
      </body>
      </html>
    `;

    // 6. Return the HTML response to the browser
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

  } catch (error) {
    console.error("Error creating ECPay order:", error);
    return new Response("An error occurred while creating the payment order.", { status: 500 });
  }
};

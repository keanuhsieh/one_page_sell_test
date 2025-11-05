import type { Context } from "@netlify/functions";
import crypto from "crypto-js";

// Helper function to generate ECPay CheckMacValue (copied from create-ecpay-order.mts)
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

/*
 * Function 2: Receives notifications from ECPay and writes to Google Sheets.
 * Tasks:
 * 1. Receive Webhook request from ECPay (ReturnURL).
 * 2. Verify the CheckMacValue to ensure the data is authentic.
 * 3. Check if RtnCode is '1' to confirm successful payment.
 * 4. Read the Google Apps Script URL from Netlify environment variables.
 * 5. If verification and payment are successful, POST the order data to the Google Web App.
 */
export default async (req: Request, context: Context) => {

  console.log("[notify-google-sheet] Function triggered.");

  try {
    // 1. Get ECPay form data
    const formData = await req.formData();
    const data: Record<string, any> = Object.fromEntries(formData.entries());
    console.log("[notify-google-sheet] Received data:", JSON.stringify(data, null, 2));

    // 2. Read ECPay credentials and Google Script URL from environment variables
    const hashKey = Netlify.env.get("ECPAY_HASH_KEY") || Netlify.env.get("GREEN_CIRCLE_HASH_KEY");
    const hashIV = Netlify.env.get("ECPAY_HASH_IV") || Netlify.env.get("GREEN_CIRCLE_HASH_IV");
    const GOOGLE_APP_SCRIPT_URL = Netlify.env.get("GOOGLE_APP_SCRIPT_URL");

    if (!hashKey || !hashIV || !GOOGLE_APP_SCRIPT_URL) {
      console.error("[notify-google-sheet] FATAL: Server environment variables are not configured correctly (ECPAY keys or Google Script URL missing).");
      // Still return "1|OK" so ECPay doesn't keep retrying. The error is on our side.
      return new Response("1|OK");
    }

    // 3. Verify CheckMacValue to ensure data integrity and authenticity
    const receivedMacValue = data.CheckMacValue;
    const dataForMacValue: Record<string, any> = {};
    for (const key in data) {
      if (key !== 'CheckMacValue') {
        dataForMacValue[key] = data[key];
      }
    }
    const calculatedMacValue = generateCheckMacValue(dataForMacValue, hashKey, hashIV);

    if (receivedMacValue !== calculatedMacValue) {
      console.error(`[notify-google-sheet] FATAL: CheckMacValue mismatch. Received: ${receivedMacValue}, Calculated: ${calculatedMacValue}. Request is likely forged or tampered.`);
      // Respond politely to ECPay, but do not process.
      return new Response("1|OK");
    }
    console.log("[notify-google-sheet] CheckMacValue validation passed.");

    // 4. Check the transaction result only AFTER validation
    // RtnCode = '1' means payment was successful.
    if (data.RtnCode === '1') {
      console.log(`[notify-google-sheet] Payment successful (RtnCode=1). Proceeding to call Google Apps Script.`);
      
      // 5. Call the Google Apps Script Web App
      try {
        const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data), // Forward the verified data
        });
    
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Google Apps Script responded with an error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
        }
        
        const googleResult = await response.json();
        console.log("[notify-google-sheet] Successfully wrote to Google Sheet:", googleResult);
    
      } catch (error) {
        console.error("[notify-google-sheet] Failed to call Google Apps Script:", error);
        // Even if this fails, we successfully processed the ECPay notification.
      }
    } else {
      console.log(`[notify-google-sheet] Payment was not successful (RtnCode: ${data.RtnCode}, RtnMsg: ${data.RtnMsg}). No action taken.`);
    }

  } catch (error) {
    console.error("[notify-google-sheet] An unexpected error occurred:", error);
  }

  // 6. Always return "1|OK" to acknowledge receipt to ECPay.
  // This prevents ECPay from resending the notification.
  return new Response("1|OK");
};


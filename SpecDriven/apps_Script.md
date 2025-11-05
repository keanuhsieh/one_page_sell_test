// --- 全域設定 ---
const SHEET_ID = "1Dda-7LAICiSIO3JUH2opkjtgWdH70Pdur4rVLdJyh2k";
const ORDER_SHEET_NAME = "Orders";
const TEMPLATE_SHEET_NAME = "EmailTemplate";

// --- Web App 接收訂單並直接寄送 Email ---
function doPost(e) {
  let orderSheet;
  
  try {
    // 1. 解析傳入的 JSON 資料
    const data = JSON.parse(e.postData.contents);
    
    // 2. 打開 Orders 分頁
    const ss = SpreadsheetApp.openById(SHEET_ID);
    orderSheet = ss.getSheetByName(ORDER_SHEET_NAME);
    if (!orderSheet) {
      throw new Error(`找不到工作表: ${ORDER_SHEET_NAME}`);
    }

    // 3. 準備要寫入的資料
    const newRowData = [
      new Date(),                     // A: 時間戳記
      data.MerchantTradeNo || 'N/A',  // B: 訂單編號
      data.CustomField2 || 'N/A',     // C: 顧客姓名
      data.CustomField1 || 'N/A',     // D: 顧客 Email
      data.CustomField3 || 'N/A',     // E: 購買品項
      data.TradeAmt || 0,             // F: 訂單金額
      data.RtnMsg || 'N/A',           // G: 付款狀態
      'Pending'                       // H: Email 寄送狀態 (預設)
    ];
    
    // 4. 在最上方插入新的一列並寫入資料
    orderSheet.insertRowAfter(1);
    orderSheet.getRange(2, 1, 1, newRowData.length).setValues([newRowData]);

    // 5. 讀取 Email 範本
    const templateSheet = ss.getSheetByName(TEMPLATE_SHEET_NAME);
    if (!templateSheet) {
      throw new Error(`找不到 Email 範本工作表: ${TEMPLATE_SHEET_NAME}`);
    }
    const subjectTemplate = templateSheet.getRange('B1').getValue();
    const bodyTemplate = templateSheet.getRange('B2').getValue();
    
    // 6. 替換佔位符
    const subject = subjectTemplate.replace('{ORDER_NUMBER}', newRowData[1]);
    const body = bodyTemplate
      .replace('{CUSTOMER_NAME}', newRowData[2])
      .replace('{ORDER_NUMBER}', newRowData[1])
      .replace('{ITEM_NAME}', newRowData[4])
      .replace('{AMOUNT}', newRowData[5])
      .replace(/\n/g, '<br>');

    // 7. 寄送 Email
    MailApp.sendEmail({
      to: newRowData[3], // 顧客 Email
      subject: subject,
      htmlBody: body
    });
    
    // 8. 寄送成功，更新 Email 狀態為 "Sent"
    orderSheet.getRange('H2').setValue('Sent');
    
    // 9. 回傳最終成功訊息
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "訂單已寫入並已寄送 Email" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 10. 如果過程中任何地方出錯
    Logger.log(error.toString()); // 將錯誤記錄到日誌中
    
    // 嘗試在 H2 寫入錯誤訊息
    if (orderSheet) {
      try {
        orderSheet.getRange('H2').setValue(`Error: ${error.message}`);
      } catch (e) {
        // 如果連寫入錯誤訊息都失敗，也記錄下來
        Logger.log(`無法寫入錯誤狀態: ${e.message}`);
      }
    }
    
    // 回傳錯誤訊息給 Netlify
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
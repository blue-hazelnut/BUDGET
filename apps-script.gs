/****************************************************************
 * 가계부 공유 저장소 (Google Apps Script)
 *
 * 하는 일: 앱이 보내는 가계부 데이터(JSON)를 스프레드시트의
 *          'DATA' 시트 A1 칸에 저장하고, 요청하면 돌려줍니다.
 *
 * TOKEN 값은 index.html 의 TOKEN 과 반드시 같아야 합니다.
 ****************************************************************/

const TOKEN = "milliner-budget";   // index.html 의 TOKEN 과 동일하게
const SHEET = "DATA";

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) sh = ss.insertSheet(SHEET);
  return sh;
}

function ok_(obj) {
  return ContentService
    .createTextOutput(typeof obj === "string" ? obj : JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 데이터 읽기
function doGet(e) {
  if (!e || e.parameter.token !== TOKEN) return ok_({ error: "token" });
  const v = sheet_().getRange("A1").getValue();
  return ok_(v || "");
}

// 데이터 저장 (동시 저장 충돌 방지를 위해 잠금 사용)
function doPost(e) {
  if (!e || e.parameter.token !== TOKEN) return ok_({ error: "token" });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = (e.postData && e.postData.contents) || "";
    if (body) sheet_().getRange("A1").setValue(body);
    return ok_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

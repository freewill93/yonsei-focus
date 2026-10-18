/**
 * 연세 포커스 (Yonsei Focus) — Google Apps Script 백엔드
 * =====================================================
 * Google Sheets 를 데이터베이스로 사용하는 선택적 백엔드.
 * (API_URL 을 비워 두면 앱은 localStorage 만으로 완전히 동작합니다.)
 *
 * ── 배포 방법 ──────────────────────────────────────────────
 * 1. Google Drive 에서 새 스프레드시트 생성 (이름 예: YonseiFocusDB).
 * 2. [확장 프로그램] > [Apps Script] 를 열고 이 파일 전체를 붙여넣은 뒤 저장.
 *    - 처음 한 번은 편집기에서 함수 `setup` 을 선택해 실행하면
 *      Tasks / MockExams 시트와 헤더가 자동으로 만들어집니다.
 * 3. 우측 상단 [배포] > [새 배포] 클릭.
 * 4. 유형을 **웹 앱** 으로 선택하고:
 *      - 설명: yonsei focus api
 *      - 실행: 나
 *      - 액세스 권한: **모든 사용자**  (도메인 내부 사용자가 아님에 주의!)
 * 5. [배포] 후 권한 승인을 마치면 **웹 앱 URL** 이 생성됩니다.
 * 6. 그 URL 을 index.html 의 CONFIG.API_URL 에 붙여넣으면 동기화 시작.
 *
 * ── 데이터 모델 (헤더 이름 기준 매핑 — 열 순서 무관) ──────
 * Tasks:      id, date, subject, task_name, status, solved_count, is_review
 * MockExams:  id, date, subject, score, mistake_note_completed
 *
 * ── API ───────────────────────────────────────────────────
 * GET  {URL}?action=list
 *      → {ok:true, tasks:[...], exams:[...]}
 *      (callback 파라미터가 있으면 JSONP 로 응답)
 * POST {URL}  (Content-Type: text/plain, body = JSON — CORS 사전요청 회피)
 *      {action:'addTask'|'updateTask'|'deleteTask'|'addExam'|'deleteExam',
 *       payload:{...}}
 *      → {ok:true} | {ok:false, error:'...'}
 */

var SHEET_TASKS = 'Tasks';
var SHEET_EXAMS = 'MockExams';

var HEADERS = {};
HEADERS[SHEET_TASKS] = ['id', 'date', 'subject', 'task_name', 'status', 'solved_count', 'is_review'];
HEADERS[SHEET_EXAMS] = ['id', 'date', 'subject', 'score', 'mistake_note_completed'];

/** 최초 1회 실행: 시트 + 헤더 자동 생성 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function (name) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
      sheet.setFrozenRows(1);
    }
  });
}

/* ───────────────────────── 라우팅 ───────────────────────── */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'list';
  var out;
  if (action === 'list') {
    out = {
      ok: true,
      tasks: readAll_(SHEET_TASKS),
      exams: readAll_(SHEET_EXAMS)
    };
  } else {
    out = { ok: false, error: 'unknown action: ' + action };
  }
  return respond_(out, e && e.parameter && e.parameter.callback);
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond_({ ok: false, error: 'invalid JSON body' });
  }

  var action = body.action;
  var payload = body.payload || {};
  if (!action) return respond_({ ok: false, error: 'missing action' });

  try {
    switch (action) {
      case 'addTask':
      case 'updateTask':
        upsertRow_(SHEET_TASKS, payload);
        break;
      case 'deleteTask':
        deleteRow_(SHEET_TASKS, payload.id);
        break;
      case 'addExam':
        upsertRow_(SHEET_EXAMS, payload);
        break;
      case 'deleteExam':
        deleteRow_(SHEET_EXAMS, payload.id);
        break;
      default:
        return respond_({ ok: false, error: 'unknown action: ' + action });
    }
    return respond_({ ok: true });
  } catch (err) {
    return respond_({ ok: false, error: String(err) });
  }
}

/* ─────────────────────── 시트 유틸 ─────────────────────── */

/** 시트 가져오기 (없으면 헤더와 함께 생성) */
function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** 전체 행을 헤더 이름 기준 객체 배열로 읽기 */
function readAll_(name) {
  var sheet = getSheet_(name);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS[name].length);
  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var tz = sheet.getParent().getSpreadsheetTimeZone();
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    var hasData = false;
    for (var c = 0; c < headers.length; c++) {
      var key = String(headers[c]).trim();
      if (!key) continue;
      // 시트가 'YYYY-MM-DD' 를 Date 셀로 자동 변환한 경우 UTC ISO 문자열로 직렬화되는 것을 방지
      obj[key] = row[c] instanceof Date ? Utilities.formatDate(row[c], tz, 'yyyy-MM-dd') : row[c];
      if (row[c] !== '' && row[c] !== null) hasData = true;
    }
    if (hasData && obj.id) rows.push(obj);
  }
  return rows;
}

/** id 로 행을 찾아 덮어쓰고, 없으면 추가 (헤더 이름 매핑) */
function upsertRow_(name, payload) {
  var sheet = getSheet_(name);
  var headers = HEADERS[name];
  var lastRow = sheet.getLastRow();
  var idCol = headers.indexOf('id') + 1;

  var rowIdx = -1;
  if (payload.id && lastRow >= 2) {
    var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(payload.id)) {
        rowIdx = i + 2;
        break;
      }
    }
  }

  var record = {};
  headers.forEach(function (h) { record[h] = payload[h]; });
  record.id = payload.id || Utilities.getUuid(); // 프론트가 보낸 id 우선, 없으면 새로 발급

  var row = headers.map(function (h) {
    return record[h] === undefined ? '' : record[h];
  });

  if (rowIdx === -1) {
    sheet.appendRow(row);
  } else {
    sheet.getRange(rowIdx, 1, 1, row.length).setValues([row]);
  }
}

/** id 로 행 삭제 */
function deleteRow_(name, id) {
  if (!id) throw new Error('missing id');
  var sheet = getSheet_(name);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var idCol = HEADERS[name].indexOf('id') + 1;
  var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
    }
  }
}

/* ───────────────────────── 응답 ───────────────────────── */

function respond_(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) { // JSONP (필요한 경우)
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

# 연세 포커스 (Yonsei Focus)

수능 D데이 카운트다운, 매일 학습 기록, 실전 모의고사 타이머를 한 화면에 담은
PWA(홈 화면 앱)입니다. 연세대 로열 블루 `#003289` 다크 테마, 완전 오프라인 동작.

- 프레임워크/빌드 없음 — `index.html` 단일 파일 (바닐라 HTML/CSS/JS)
- 외부 CDN/폰트/차트 라이브러리 없음 (차트도 직접 그린 SVG/CSS)
- 데이터는 localStorage 에 저장되고, 선택적으로 Google Sheets 와 동기화

## 파일 구성

| 파일 | 설명 |
|---|---|
| `index.html` | 앱 전체 (UI + 스타일 + 스크립트) |
| `manifest.json` | PWA 매니페스트 (홈 화면 설치 정보) |
| `sw.js` | 서비스 워커 — 오프라인 캐싱 |
| `icons/` | 앱 아이콘 (192/512 PNG, 180 apple-touch, SVG) |
| `Code.gs` | 선택적 Google Apps Script 백엔드 |
| `DESIGN.md` | 디자인 토큰 문서 |

## 로컬에서 실행 / 테스트

```bash
cd yonsei-focus   # 이 폴더
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

`API_URL` 이 비어 있으면 **로컬 모드**로 동작합니다(우측 상단 「로컬 모드」 배지).
모든 데이터는 브라우저 localStorage(`yf.tasks`, `yf.exams`)에만 저장됩니다.

## GitHub Pages 배포 (권장)

1. GitHub 에 `yonsei-focus` 이름으로 **Public** 저장소 생성.
2. 이 폴더의 모든 파일(`index.html`, `manifest.json`, `sw.js`, `icons/`, `Code.gs`)을 업로드.
   (`Code.gs` 는 배포에 필수는 아니지만 백업 겸 함께 올려도 좋습니다.)
3. 저장소 **[Settings] → [Pages]** 에서 Source 를 `main` 브랜치 /(root) 로 설정하고 저장.
4. 몇 분 뒤 `https://아이디.github.io/yonsei-focus/` 로 접속.

모든 경로는 상대 경로(`./`)라 서브패스에서 바로 동작합니다.

### 스마트폰에 설치 (PWA)

- **iOS(Safari)**: 공유 버튼 → **홈 화면에 추가**
- **Android(Chrome)**: 메뉴 ≡ → **앱 설치 / 홈 화면에 추가**

설치하면 주소창 없이 전체 화면 앱처럼 실행됩니다.

## Google Sheets 동기화 (선택)

로컬 모드로 써도 되고, 여러 기기에서 같은 기록을 쓰고 싶다면 아래 순서대로 연동하세요.

### 1. 스프레드시트 준비

1. Google Drive 에서 새 스프레드시트 생성 (이름 예: `YonseiFocusDB`).
2. [확장 프로그램] → [Apps Script] 열기.
3. 이 폴더의 `Code.gs` 전체를 붙여넣고 저장.
4. 편집기 상단 함수 선택에서 **`setup`** 을 한 번 실행
   → `Tasks`, `MockExams` 시트와 헤더가 자동 생성됩니다.

시트 구조 (헤더 이름 기준이라 열 순서는 무관):

- **Tasks**: `id`, `date`, `subject`, `task_name`, `status`, `solved_count`, `is_review`
- **MockExams**: `id`, `date`, `subject`, `score`, `mistake_note_completed`

### 2. 웹 앱 배포

1. Apps Script 우측 상단 **[배포] → [새 배포]**.
2. 유형: **웹 앱**
   - 실행: **나**
   - 액세스 권한: **모든 사용자** ← (도메인 내부 사용자 아님 주의)
3. [배포] → 권한 승인 → 생성된 **웹 앱 URL** 복사.

### 3. 앱에 연결

`index.html` 상단의 설정에 URL 붙여넣기:

```js
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
  EXAM_DATE: '2026-11-19'
};
```

- 앱 시작 시 서버에서 목록을 불러오고, 이후 기록은 즉시 localStorage 에 저장한 뒤
  백그라운드에서 최선형(best-effort) 동기화합니다.
- 네트워크 오류가 나면 조용히 로컬 모드로 계속 동작합니다 (데이터를 잃지 않아요).
- Apps Script 를 수정한 뒤에는 [배포] → 배포 관리 → ✏️ → 새 버전 배포를 해야 반영됩니다.

## 자주 묻는 질문

- **수능 날짜가 바뀌었어요.** → `CONFIG.EXAM_DATE` 만 고치세요.
- **캐시가 남아 옛 화면이 나와요.** → `sw.js` 의 `CACHE_VERSION` 을 `'v2'` 처럼 올린 뒤 다시 배포하세요.
- **실전 타이머 중 화면이 꺼져요.** → 기기 설정에서 이 사이트의 절전/화면 꺼짐을 허용해 주세요. 앱은 Wake Lock API 를 최선으로 요청합니다.
- **실제 시간표 모드에는 일시정지가 없나요?** → 네, 실제 수능처럼 멈출 수 없습니다. 종료 버튼으로만 나갈 수 있어요(확인 창이 뜹니다).

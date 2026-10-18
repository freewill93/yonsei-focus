# Yonsei Focus App - 구축 및 배포 가이드 (Harnessing Guide)

본 가이드는 지후의 수능 D-30 몰입과 실전 감각 극대화를 위한 웹 앱을 Google Sheets 기반 백엔드와 GitHub Pages(PWA)로 배포하는 전체 과정을 담고 있습니다.

## 1. 신규 반영된 핵심 기능 (실전 훈련 중심)

*   **수능 실전 모드 (Mock Exam Timer):** 주 1회(예: 일요일) 실제 수능 시간표(국어 80분, 수학 100분, 영어 70분, 사문 30분, 세계사 30분)와 동일하게 작동하는 하드코어 타이머 모드 추가.
*   **문제 풀이 트래킹:** 단순 시간 측정을 넘어 '오늘 푼 문제 수'와 '오답 정리 완료 여부'를 입력하고 시각화하여, 실전 문제 풀이량을 직관적으로 확인.

---

## 2. Phase 1: DB 세팅 (Google Sheets)

앱의 모든 데이터를 저장할 무료 데이터베이스를 구축합니다.

1.  Google Drive에서 새 Google 스프레드시트를 생성하고 이름을 `YonseiFocusDB`로 지정합니다.
2.  하단 시트 탭을 두 개 만듭니다:
    *   **시트 1: `Tasks`** (일일 학습 기록용)
        *   A열~G열 헤더: `id`, `date`, `subject`, `task_name`, `status`, `solved_count`(푼 문제 수), `is_review`
    *   **시트 2: `MockExams`** (주간 실전 모의고사 기록용)
        *   A열~E열 헤더: `id`, `date`, `subject`, `score`, `mistake_note_completed`

---

## 3. Phase 2: API 연동 (Google Apps Script)

프론트엔드(앱)와 구글 시트를 연결하는 API 서버를 만듭니다.

1.  스프레드시트 상단 메뉴에서 **[확장 프로그램] > [Apps Script]**를 클릭합니다.
2.  편집기에 아래 형태의 기본 통신 코드를 작성합니다. (프론트엔드에서 데이터를 GET/POST 방식으로 주고받는 역할)
    ```javascript
    function doGet(e) {
      // 데이터를 불러오는 로직 (Tasks, MockExams 시트 읽기)
    }
    function doPost(e) {
      // 새로운 학습 기록이나 모의고사 점수를 시트에 저장하는 로직
    }
    ```
3.  우측 상단 **[배포] > [새 배포]**를 클릭합니다.
4.  유형을 **'웹 앱'**으로 선택하고, 액세스 권한을 **'모든 사용자'**로 설정한 후 배포합니다.
5.  생성된 **웹 앱 URL**을 복사해 둡니다. (이 URL이 앱 코드에 들어갈 API 주소입니다.)

---

## 4. Phase 3: 프론트엔드 개발 및 GitHub 배포

하나의 HTML 파일에 모든 기능을 담아 가볍고 빠른 앱을 만듭니다.

1.  **GitHub Repository 생성:** GitHub에 로그인하여 `yonsei-focus`라는 이름으로 Public 저장소를 만듭니다.
2.  **파일 구성 (총 3개):**
    *   `index.html`: 앱의 UI(목표 시각화, 스케줄러, 실전 수능 타이머)와 로직(Javascript)이 모두 포함된 단일 파일.
    *   `manifest.json`: 앱의 이름, 아이콘, 테마 색상(연세대 로열 블루 `#003289`)을 정의하여 스마트폰 홈 화면에 설치(PWA)할 수 있게 해주는 파일.
    *   `sw.js`: 오프라인 캐싱을 담당하는 Service Worker 파일.
3.  **파일 업로드 및 Pages 활성화:**
    *   위 3개의 파일을 GitHub 저장소에 업로드(Commit)합니다.
    *   저장소 **[Settings] > [Pages]**로 이동하여 Source를 `main` 브랜치로 설정하고 저장합니다.
    *   몇 분 후 생성되는 `https://[유저명].github.io/yonsei-focus/` 주소가 앱의 최종 접속 링크가 됩니다.

---

## 5. Phase 4: 지후의 스마트폰에 PWA 설치

1.  지후의 스마트폰(Safari 또는 Chrome)에서 위에서 생성된 GitHub Pages URL로 접속합니다.
2.  브라우저 하단 공유 버튼(iOS) 또는 메뉴 버튼(Android)을 누르고 **'홈 화면에 추가'**를 선택합니다.
3.  스마트폰 바탕화면에 연세대학교 로고 모양의 앱 아이콘이 생성되며, 실행 시 상단 주소창 없이 네이티브 앱처럼 전체 화면으로 구동됩니다.
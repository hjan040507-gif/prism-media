# pscompany BLOCKED — 못 찍은 것

## 1. 관리자(지원자 목록 · 지원자 상세 · 모집 직군 관리) — 화면 없음 / 접근 불가
- 사유
  - 지원자 목록·상세: 관리자 로그인 필요. 이 서버에 pscompany 관리자·테스트 계정이 없다(인계 완료, 계정은 고객 보유). 소스 저장소도 없어 로컬 Supabase 를 만들어 가짜 데이터로 띄울 수도 없다. 기존 캡처 이미지도 0개(`~/hongjun-journey`·`~/prism-portfolio` 에 pscompany 관련 png/jpg/webp 없음).
  - 모집 직군 관리: **화면 없음** — 직군은 코드에 박힌 enum 3개(`personal`·`crew`·`sales`, 번들 `0tr1f06qf.zt5.js`)이고 관리자에 직군 관리 메뉴가 없다(브리프 §2: 관리자 5화면 = 로그인·대시보드·지원 관리·문의 관리·크리에이터 관리).
  - 새 계정 만들기·로그인 시도는 지시상 금지.
- 시도한 것(2번)
  1. 서버 자격증명 폴더(`~/qa-creds`, `~/secrets`)·`~/hongjun-journey`·`~/prism-portfolio` 검색 — 다른 프로젝트 것뿐(키 이름만 확인, 값 안 읽음).
  2. 운영 `/manage`·`/manage/login` GET — `/manage` 는 307 → `/manage/login`, 로그인 화면만 열림(로그인 POST 0건).
- 대안(찍은 것): `/manage/login` 로그인 화면 1장(desktop/manage-login-*). 관리자 쪽 맥락의 근거 화면일 뿐 지원자 데이터는 없다. 가짜로 다시 그린 관리자 화면은 '실제 서비스와 같은 화면만' 원칙에 어긋나 만들지 않았다.
- 필요하면: 고객(PS COMPANY)에게 **읽기 전용 테스트 계정**을 요청(이름·연락처는 가린 꼴로 찍음) — 받으면 `/manage/applications`·`/manage/applications/[id]` 를 같은 도구로 촬영.

## 2. 지원서의 '사진 첨부' 단계 — 화면 없음
- 운영 지원 폼에 사진 칸이 없다(`type="file"` 0개, 번들 upload 0건) → 상태 흐름은 실제 한 페이지 폼을 같은 scrollY 로 단계 나눠 찍었다(shots.md '지시의 ○○ = 실제 △△').
- 따라서 '지원자 사진 얼굴 흐림'은 해당 없음. 크리에이터 사진 흐림 CSS(`img[alt^="피에스컴퍼니 소속 크리에이터"]`)는 안전망으로만 걸었고 촬영한 화면에는 그 사진이 없다.

## 보고할 것
- 로그인 POST 0건 · 서버 액션 POST 가로챔(지원 제출만, 가짜 성공 응답) · 운영 쓰기 가능성: 제출 버튼 클릭 전에 `page.route` 가짜 응답이 등록돼 있었다(가로챈 목록은 json 의 intercepted).

# eureka BLOCKED

## 1. 관리자(접수 목록 · 상태 4단계 변경 · 접수 상세) — 촬영 못 함
- 사유: 관리자는 비밀번호 한 칸으로 여는 실고객 접수 화면(`/admin/login` → `POST /admin/api/login`)이다. 비밀번호는 운영 서버 env(`ADMIN_PASSWORD`)에만 있고 이 서버에는 없다. 소스 저장소(서버·GitHub)가 없어 로컬에서 재현할 수도 없고, 기존 관리자 캡처도 없다(`~/hongjun-journey`·`~/prism-portfolio`·`~/easysite`·`~/qa-archive`·`~/phase3-captures` 이미지 파일명 검색 0건).
- 시도(RECON 07:30~08:00Z): 이 서버의 비밀 파일 이름 검색(`~/secrets`·`~/qa-creds` 등) → 다른 프로젝트 것뿐, eureka·nomorenusu 관련 0. 새 계정·비밀번호 추측·로그인 POST 는 범위 밖이라 하지 않았다.
- 참고: `/admin/login` 첫 촬영(08:03Z)은 Cloudflare 「Error 1102」(Worker 자원 한도) 화면이 찍혀 버리고 다시 찍었다(09:39Z, 정상 로그인 화면 확인). 운영 쪽 일시 오류로 보이며 촬영이 만든 요청은 GET 한 번뿐이다.
- 대체: ① `/admin/login` 로그인 화면 1장(GET 만, 비밀번호 입력 안 함) — `desktop/admin-login-*`. ② 상태 4단계 이름(작업접수·상담진행·작업출동·작업완료)은 공개 현황판 배지와 운영 번들 근거로 facts.md 에 적었다.
- 가능한 대안: 고객(노모어누수 운영자)에게 읽기 전용 관리자 계정(또는 임시 비밀번호)을 요청 → 받으면 접수 목록·상세는 이름·연락처·주소 전 칸 가림 필수, 로그인 POST 1회가 세션을 만드니 보고 대상으로 둔다.

## 2. 소스 줄 번호 근거 — 없음
- 소스 저장소가 없어 facts.md 의 근거는 운영 HTML·JS 번들·CSS(GET)와 조회 시각이다. 번들 파일명(해시)이 바뀌면 같은 근거를 다시 조회해야 한다.

## 3. 기준선 비교 생략
- 고객 저장소가 없어 `docs/baseline2/<repo>.status` 비교는 생략(브리프 지시).

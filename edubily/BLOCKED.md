# edubily — BLOCKED (2026-11-06)

## 막힌 것: 전부(데스크톱·모바일 메인·카테고리·상품 상세 2종, facts.md, shots.md, contact.jpg)

### 사유
- 이 서버에 edubily 소스·작업 폴더가 없고, 쇼핑몰 주소(자체 도메인·카페24 기본 도메인)도 어떤 기록에도 문자열로 남아 있지 않다. 카페24 쇼핑몰은 공개 화면이라 주소만 있으면 GET 으로 찍을 수 있지만, 주소를 모르면 열 수 없다.
- 포트폴리오 브리프(`~/hongjun-journey/docs/CONTENT/briefs/edubily.md:17`)는 "자체 도메인 + 카페24 기본 도메인 2개로 라이브 운영"이라고만 적었고, `~/prism-portfolio/docs/content/facts.json` 도 `url_withheld_reason: 브리프 원문에 구체 도메인 문자열 없음`.

### 시도한 것 (2번)
1. 서버 전체 이름 검색: `~/` 폴더 목록·`find / -maxdepth 4`·`~/.config/cc/repos/*.env`·각 레포 CLAUDE.md/README/package.json 에서 edubily·에듀빌리 → 없음. `hongjun-journey` 브리프 git 이력(`git log --all -p`)에서 도메인 문자열 → 없음.
2. 원격·기록: `git ls-remote` 로 후보 저장소 확인(이전 세션이 15계정 × 후보명으로 이미 실패, `hongjun-journey/PROGRESS.md:59`, 이번에 gh-cla14 8개 후보 → Repository not found). 전 프로필 대화 기록에서 `*.cafe24.com` 문자열 → edubily 와 연결되는 몰 아이디 없음(나온 것은 카페24 공용 호스트와 다른 프로젝트 것).

### 가능한 대안
- 사용자가 쇼핑몰 주소(자체 도메인 또는 `<몰아이디>.cafe24.com`) 하나만 알려 주면 같은 규격으로 바로 찍을 수 있다: 메인·카테고리·상품 상세 2종 데스크톱(1440×900·DSF 2)·모바일(390×844·DSF 3), GET 만, 장바구니·로그인·주문 POST 는 가로챔, 카페24 관리자 화면은 찍지 않음.
- 사실(상품·상세페이지 수, 카테고리 정리 전후 수)은 브리프 기록으로 일부 채울 수 있다: 상품 30개 상세 이미지 전수 200, 대표 27개·추가이미지 26개×2장 교체, 내부 링크 89페이지(`briefs/edubily.md:29,62`). 카테고리 전후 수는 브리프에 숫자 없음(미확인).
- 이어서 하는 명령: "edubily 주소는 <주소>야 — 2차 규격대로 찍어서 push 해"

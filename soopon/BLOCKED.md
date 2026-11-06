# soopon BLOCKED — 못 채운 것(화면 없음) · 지시와 다른 것

1. **「숲ON 처방전」 이름과 4단계 필터(고민→동반자→지역→일정) 화면 없음**
   - 사유: 사이트에 단계(step) 흐름이 없다. 한 화면에서 3축을 동시에 고르는 칩 필터(누구와 6 · 어떤 경험 6 · 지역 9)뿐이다(`~/Soopon/lib/filters.ts:41-45`, `components/discovery.tsx:65-67` 「내게 맞는 숲 프로그램을 찾아보세요.」). 「처방」 글자는 코드·라이브 화면에 0건.
   - 대안(적용함): 실제 화면을 그대로 찍었다 — `states/home-filter-chips`(1440 칩 누적), `states/home-filter-sheet`(390 시트), `states/programs-filter-chips`(목록 필터), `seq/home-filter-results.mp4`·`seq/mobile-filter-sheet.mp4`.
2. **「일정」 필터 화면 없음** — 날짜·일정 검색/필터 자체가 없다(운영 일정은 상세 이용안내 아코디언 글뿐, `lib/pending.ts:32`). 대안: 일정 줄이 있는 상세 `desktop/program-*-full.png` 로 대신.
3. **상담 신청 폼의 「제출 후 완료 화면」은 상태 흐름이 아니라 페이지 세트로 저장** — 제출하면 폼이 사라져 문서가 짧아지고 같은 scrollY 를 지킬 수 없다(lib 이 예외). `desktop|mobile/b2b-inquiry-done-full·view.png` 로 대신했다. 서버 액션 가짜 응답(flight `0:{"a":"$@1","f":"","b":"fake"}` + `1:{"ok":true}`)이 첫 시도에 통했다.

## 보고할 것 (운영 접속·쓰기 가능성)
- 운영(sooponfesta.com·Supabase 공개 스토리지 이미지)에는 **GET 만** 나갔다. 비GET 은 0건이 서버로 갔다: 상담 제출 POST 2건(데스크톱·모바일 각 1)은 `page.route` 가 가짜 성공으로 응답. 로그인 0.
- GA4(G-7ZB6E51805): gtag 스크립트 요청(`googletagmanager.com/gtag/js`)을 빈 JS 로 대신 응답해 gtag 가 안 떴고, `google-analytics.com`·`analytics.google.com` 도 가짜 응답으로 막았다. collect 요청은 0.
- 눌러 본 링크 0: 예약하기·tel·SNS·외부 홈페이지(스크립트에 해당 클릭 없음, 외부 예약·SNS 목적지 GET 은 blockGet).

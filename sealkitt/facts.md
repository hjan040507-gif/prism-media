# sealkitt(씰킷) 사실 — 자막용 (촬영 2026-11-05 23:0x~23:5xZ, 운영 https://sealkitt.com)

DB 쿼리는 실행하지 않았다(명세·지시). 쿼리문만 적고 '미확인'으로 표시한다.

## 1. 지원 게임 3종 — 포켓몬·원피스·유희왕
- 근거: `/home/dev/sealkitt/lib/types.ts:969-973` `GAME_LABEL = { pokemon: "포켓몬", onepiece: "원피스", yugioh: "유희왕" }`. 라이브 사이트맵도 3게임으로 나뉨(`https://sealkitt.com/sitemap-index.xml` 의 `cards/sitemap/{pokemon,onepiece,yugioh}-*`). 검색 화면 필터 칩도 포켓몬·원피스·유희왕(`desktop/search-code-view.png`).

## 2. 나라(언어판) 3종 — 한글판·일어판·영문판, 시세는 국내·일본·TCGplayer(미국) 3축
- 근거: `lib/types.ts:9-13` `LANGUAGE_LABEL = { ko: "한글판", ja: "일어판", en: "영문판" }`. 시세 차트 축 탭 3개 `components/cards/MarketTrendChart.tsx:301-322`(`kr`/`jp`/`us`, 라벨 국내·일본·TCGplayer) — `states/axis-tabs-kr-jp/` 의 탭 3개로 확인. 조합: 사이트맵 카드 분할이 포켓몬 ko/ja/en · 원피스 ko/ja/en · 유희왕 ko/en 의 8개(유희왕 일어판 카드 사이트맵은 없음).

## 3. 카드 수 — 총수 '미확인', 공개 확인 가능한 하한 30,622장(색인 대상 카드 URL)
- 근거: 카드 사이트맵 8개의 `<loc>` 줄 수 합(2026-11-05 23:0xZ, `curl https://sealkitt.com/cards/sitemap/<게임>-<언어>-0.xml`): 포켓몬 한글 3,797 · 일어 3,909 · 영문 18,917 / 원피스 한글 451 · 일어 293 · 영문 706 / 유희왕 한글 67 · 영문 2,482 = **30,622**. 정의: 검색 색인에 올라간 카드 상세 URL 수 — 색인 제외·병합 카드는 빠지므로 '총 카드 수'가 아니라 **하한**이다(자막에 "3만 장 이상"까지만).
- 총수 쿼리(미실행·미확인): `select count(*) from cards where merged_into is null;` / 게임·언어별 `select game, language, count(*) from cards where merged_into is null group by 1,2;`
- 참고(오래된 기록): 코드 주석 "프리렌더 목록 비우고(77,068장)" `app/cards/[id]/page.tsx:13`, 2026-07-30 재베이크 기록 `PROGRESS.md:1675` — 2026-07 시점 값이라 현재 총수로 쓰지 말 것.

## 4. 시세 수집 주기 — 매일(하루 1회) 자동 수집
- 근거: 이 서버 crontab(`crontab -l`, UTC, `cron-guard.sh <이름>` 래핑): 번개장터(국내) `30 22 * * *` df4-kr-bunjang · 야후옥션/유유테이(일본) `0 21 * * *` df3-jp-yahoo, `0 12 * * *` df3-jp-yuyutei · TCGplayer(미국) `30 18 * * *` tcg-price-refresh, `0 21 * * *` tcgcsv-sync · eBay 호가 `40 19 * * *` ebay-snapshot · 환율 `0 18 * * *` fx-refresh. `vercel.json` 에는 cron 이 없다(수집은 서버 crontab). 화면 근거: 홈·카드 상세의 "11월 4일 기준 · 직전 스냅샷 대비" 문구(`desktop/home-view.png`). 실행 로그는 열어 보지 않음(실제 성공 여부는 미확인).

## 5. 입점(검증)샵 수 — 공개 0곳 (자막에 "입점 샵 N곳" 쓰지 말 것)
- 근거: 라이브 `/shops` 가 "아직 공개된 검증샵이 없어요"(`desktop/shops-empty-view.png`), 카드 상세 "이 카드 파는 검증샵" 도 빈 상태(`desktop/card-kr-full.png`). 코드 `lib/queries.ts:541-550` `getShops()` = `status='live' and is_test=false`. 쓸 수 있는 문구는 입점 안내의 "연결 수수료 0% · 입점 무료 · 1분 등록"(`/for-shops`, `desktop/for-shops-view.png`).
- 확인 쿼리(미실행·미확인): `select count(*) from shops where status='live' and is_test=false;`

## 6. 마켓 규모(화면 표시값) — "시세 있는 밀봉" 박스 2,796개 · 팩 1,293개, 번개장터 매물 카드 8,733 · 스니덩 출품 136,622
- 근거: 라이브 `/market/box`·`/market/pack` 본문(2026-11-05 23:27Z, 브라우저 `innerText` 읽기): 박스 목록 건수 "2,796개", 팩 "1,293개", 상단 KPI "번개장터 매물 카드 8,733 · 스니덩 출품 136,622". 화면 `desktop/market-box-view.png`. 정의: 공개 마켓 목록에 표시되는 숫자(씰킷 검증샵 매물이 아니라 외부 시세 수집분 — 같은 화면에 "씰킷 검증샵 아님" 문구).

## 7. 한 카드에서 시세 축 2개 이상이 켜진 카드는 있다 — 원피스 1,450장 전수 중 167장(11.5%)이 2축, 3축은 0장
- 근거: 원피스 카드 사이트맵 1,450장(한글 451 + 일어 293 + 영문 706)의 카드 상세 HTML 을 GET 해 `[role=tab][aria-label=시세 축 선택]` 의 활성(not disabled) 탭 수를 셈(2026-11-05 23:1x~23:2xZ): 2축 167장(국내+일본 계열 · 일본+TCGplayer 계열), 3축 0장, 1축 1,202장, 0축 81장. 비원피스: 균등 추출 표본 197장 중 2축 이상 0장 + 포켓몬 한글판 사이트맵 앞쪽 2,881장(전체 3,797장 중) 중 2축 이상 0장(1축 2,799 · 0축 82) — 포켓몬·유희왕은 2축 이상이 사실상 없다. 예: `optcgapi-OP13-007`(국내+일본) · `optcgapi-OP16-012`(일본+TCGplayer). 한계: 시세 기록이 2일 이상 쌓여야 축이 켜지므로 시간이 지나면 달라진다(`MarketTrendChart.tsx:302-322`, 툴팁 "기록이 2일 미만이라 그래프가 없어요").

## 8. 시세 소스 — 국내 번개장터, 일본 야후옥션·유유테이·스니덩(SNKRDUNK), 미국 eBay 호가·TCGplayer 마켓가
- 근거: `/home/dev/sealkitt/CLAUDE.md` "시세 소스(2026-09-23 대표 결정)" 절(PriceCharting 미사용), 카드 상세 화면의 소스 문구("번개장터 호가" · "야후옥션 낙찰가" · "유유테이 상점 판매가" · "SNKRDUNK PSA10 감정품" · "미국 eBay 호가") — `desktop/card-multi-axis-full.png`, `states/watch-alert/02-sheet-open.png`. 호가와 실거래는 값마다 성격 라벨로 구분(`MarketTrendChart.tsx:46` `READOUT_NATURE = {kr:"호가", jp:"실거래 중앙값", us:"마켓가"}`).

## 9. 차트 기간 탭 4개 — 7일·30일·90일·전체 (기본 30일)
- 근거: `components/cards/MarketTrendChart.tsx:50-54,469-483`, 화면 `states/chart-period/01..04`. 예시 카드 `optcgapi-OP13-007` 의 국내 시세 기록 실측 13일(차트 하단 "실측 13일", `states/chart-period/02-period-30일.png`).

## 10. 검색은 초성·카드번호·이름 모두 한 검색창 — 초성 'ㅍㅋㅊ' → 피카츄 자동완성
- 근거: 라이브 자동완성 캡처 `states/search-autocomplete/04-typed-ㅍㅋㅊ.png`(초성 입력에 "피카츄" 후보 + "ㅍㅋㅊ 전체 결과 보기"), 코드 `components/home/HomeSearch.tsx:19-21`(로컬 사전 0ms + 서버 롱테일 2티어), `lib/chosung.ts`. 카드번호 검색 `desktop/search-code-view.png`(`/search?q=OP01-120`, 2건).

## 11. 환율 표시 — 1엔≈8.46원 (2026-11-05 기준)
- 근거: 라이브 홈·카드 상세 문구 "1엔≈8.46원 · 11월 5일 환율"(`desktop/home-full.png`, `desktop/card-jp-full.png`). 일별 환율 수집 crontab `0 18 * * *` fx-refresh. 날짜를 병기해서 쓸 것(매일 바뀜).

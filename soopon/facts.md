# soopon(숲ON페스타 2026) 사실 — 자막용

측정 시각은 UTC. 운영 = https://sooponfesta.com(레포 ~/Soopon main `f1f890c`, 화면 기준 운영과 같음 — RECON.md §0-1). DB 값은 그 시각의 값이다(공개 프로그램·기업 수는 운영에서 바뀐다 — 영상 직전에 다시 재면 `curl -s https://sooponfesta.com/api/programs/count`).

## 1. 공개 프로그램 52개 · 참여기업 22곳
- 근거: 운영 `GET /api/programs/count` → `{"total":52}` (2026-11-06T08:03Z). `/companies` HTML 의 `/company/[slug]` 고유 링크 22개(같은 시각). 코드: 공개 = published 만(`lib/data/programs.ts` `countPrograms`, `listCompanies`). `sitemap.xml`(프로그램 39·기업 14)은 캐시가 낡은 값이라 쓰지 않는다. 화면 증거: `desktop/home-view.png`(「전체 프로그램 52개」), `desktop/programs-view.png`(총 N개).

## 2. 필터 값 21개 = 누구와 6 · 어떤 경험 6 · 지역 9 (3축 동시 선택, 일정 필터는 없음)
- 근거: `~/Soopon/lib/filters.ts:11-18`(COMPANIONS 6) · `:20-27`(CATEGORIES 6) · `:29-39`(REGIONS 9) · `:41-45`(FILTER_AXES). 같은 축 안 OR·축 사이 AND: `components/discovery.tsx:47-52`. 지시의 「처방전·고민·동반자·일정」 4단계는 사이트에 없음(RECON.md §10).

## 3. 지역 9곳 중 프로그램이 있는 곳 7곳 (강원·제주 0건)
- 근거: 운영 `GET /api/programs/count?region=…` (2026-11-06T08:03Z) — 서울 10 · 경기 19 · 인천 3 · 강원 0 · 충청 10 · 전라 7 · 경상 2 · 제주 0 · 기타 1(합 52). 강원 코드 철자는 `ganwon`(오타 유지, `lib/filters.ts:1-5`).

## 4. 누구와·경험별 프로그램 수(복수 값이라 합은 52 가 아니다)
- 근거: 운영 count GET (2026-11-06T08:03Z) — 혼자 17 · 친구·연인 17 · 가족 25 · 아이와 29 · 단체 31 · 기업·기관 23 / 힐링·휴식 22 · 웰니스·건강 17 · 자연체험 30 · 아웃도어·활동 15 · 교육·놀이 28 · 문화·예술 11.

## 5. 칩 누적 선택 결과 수: 아이와 29 → +자연체험 19 → +경기 8
- 근거: 운영 count GET `who=kids` 29 · `who=kids&exp=nature` 19 · `who=kids&exp=nature&region=gyeonggi` 8 (2026-11-06T08:03Z). 화면: `states/home-filter-chips/`·`states/home-filter-sheet/`·`seq/home-filter-results.mp4`. 홈 1440 은 서버 왕복 없이 넘겨받은 목록에서 즉시 거른다(`components/discovery.tsx:151` useMemo), 모바일 시트는 칩마다 300ms 뒤 `/api/programs/count` 를 불러 「결과 보기 (N개)」를 갱신(`components/programs/filter-sheet.tsx:104-125`).

## 6. 목록은 한 페이지 12개 · 정렬 4종(추천·최신·가격 낮은·가격 높은) · 검색 3필드
- 근거: `lib/pending.ts:99`(`PROGRAMS_PER_PAGE = 12`) · `:64-69`(SORT_OPTIONS 4) · `:51`(SEARCH_FIELDS: 프로그램명·한줄설명·상세지역). 52개 → 5쪽(12·12·12·12·4).

## 7. 숲ON비즈 도입 목적 4종 + 기타 = 상담 폼 선택지 5개
- 근거: `lib/pending.ts:206-211`(B2B_PURPOSES: 임직원 복지·교육·조직문화·ESG) · `:214-217`(INQUIRY_PURPOSES = 4종 + 기타). 화면: `desktop/b2b-view.png`, `states/b2b-inquiry-form/`.

## 8. 상담 신청 폼 동의 3개(필수 2 · 선택 1), 제출은 API 가 아니라 Next 서버 액션
- 근거: `components/b2b/inquiry-form.tsx:374`(privacy_agreed) · `:393`(optional_agreed) · `:413`(third_party_agreed), 검증 `lib/inquiry.ts`(validateInquiry, 폼과 서버가 같은 함수). 제출 = `'use server'` `submitInquiry`(`app/(public)/b2b/actions.ts:26`). 동의 문안 버전 `2026-10-09-hypn-r5`(`lib/pending.ts:231`). 촬영 때 이 제출 POST 는 전부 가로챘다(운영 문의함에 쌓이지 않음).

## 9. 프로그램 상세 구성: 핵심정보 · 소개 · 주요 활동(최대 5블록) · 이용안내 5항목 · 운영기업
- 근거: `lib/pending.ts:44`(`MAX_ACTIVITY_BLOCKS = 5`) · `:31-37`(GUIDE_SECTIONS: 운영일정·준비물·유의사항·예약안내·취소·환불) · `app/(public)/program/[id]/page.tsx`(앵커 `#quick-info #intro #activities #guide #company`). 화면: `desktop/program-forestasan-01-full.png`.

## 10. 주최 산림청 · 주관 한국산림복지진흥원, 슬로건 「요즘, 숲에서 쉬는 법」
- 근거: `lib/pending.ts:86-90`(ORGANIZERS) · `:128-131`(HERO_COPY). 화면: `desktop/home-view.png`.

## 11. 공개 기획전 2건
- 근거: 운영 `/campaigns` HTML 의 `/curation/campaign-cur-02`·`/curation/campaign-cur-03` (2026-11-06T08:03Z, 오래된 sitemap 은 cur-01·evt-01).

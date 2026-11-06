# okjob facts — 자막에 쓸 사실 (근거 = 사본 tmp/okjob-src = `git -C ~/Okjob archive ea28ba36`, 2026-11-06 확인)

## 1. 계약 기능 31개(고객용 기능 완료 확인표 기준)
- 근거: `docs/완료-확인표.md` 번호 01~31 (`grep -c "^| [0-9][0-9] |"` = 31, 2026-11-06 실행). 구성 = 농가 관리 6 · 근로자 관리 8 · 배정 5 · 카카오 알림톡 3 · 알림과 리포트 4 · 공통과 데이터 3 · 근무일수와 급여 2. `PROGRESS.md:505` "고객용 기능 완료 확인표 31개 항목".
- 주의: 계약서·견적서 원문 파일은 레포에 없다(`docs/계약-대조-근거.md` 만 있음) — "계약서 31항목 전부 충족" 같은 문구는 **미확인**, 「완료 확인표 31개 기능」으로만 쓴다.

## 2. 알림톡 템플릿 3종 (배정 안내 · 스프레이 배정 안내 · 배정 취소 안내) — 3종 모두 카카오 심사 승인
- 근거: `docs/alimtalk-templates.md:5-10`(OKJEJU_ASSIGN_01 · OKJEJU_ASSIGN_SPRAY_01 · OKJEJU_CANCEL_01) · `src/lib/notify/approved-templates.json` 의 `"code"` 3개 · `docs/완료-확인표.md` 20번 "카카오 채널 연결과 안내문 세 가지 심사가 모두 통과".
- 발송 시각 규칙: 근무 전날 07:30 안내, 확인이 없으면 16:30 한 번 더(알림톡 화면 머리 문구 `src/app/(app)/notifications`).

## 3. 자동 시험 980개 통과(2026-11-05 기록) · 시험 파일 66개
- 근거: `find src -name '*.test.ts' | wc -l` = 66 (2026-11-06 사본에서 실행). 이 세션의 재실행(`heavy-run npx vitest run`, 2026-11-06 07:54Z~09:34Z)은 서버 부하로 게이트가 열리지 않아(exit 75 미룸 → 재큐 후 취소) **재측정 못 했다** — 통과 개수는 아래 기록만 근거로 쓴다(재측정 값 아님).
- 마지막 실행 기록: `PROGRESS.md:13` "vitest 980/980(nh-group 16) · tsc 0 · build 0" (2026-11-05 STEP 84).

## 4. 엑셀에서 옮긴 것 = 배정이 아니라 근로자 187명(1기 68·2기 68·3기 51)과 농가 — 지시의 '엑셀에서 옮긴 배정 건수'는 전제 불성립
- 근거: `PROGRESS.md:1642` "Part A: 이관 대상 187(1기68·2기68·3기51)" · `PROGRESS.md:785` 라이브 화면 확인 "2기 68명·전체 187" · `PROGRESS.md:304` "2기 배정은 파일 이관이 아니라 08-06~08-10 에 앱에서 손입력".
- 따라서 "배정 N건을 엑셀에서 이관" 같은 자막은 쓰지 않는다. 쓸 수 있는 것: 「엑셀 근로자 187명을 앱으로 이관」(근거 위).

## 5. 기수 3개 · 작업 종류 5가지 · 숙소 3곳 · 호실 8개 · 시간 단가 7단계×성별 2×기수 3 = 42행
- 근거: `supabase/seeds/base.sql`을 로컬 DB 에 적용한 뒤 읽기 전용 조회(2026-11-06, `psql … select count(*)`): terms 3 · work_types(활성) 5(일반작업·선과·파쇄·스프레이·기타) · dorms 3 · dorm_rooms 8 · wage_hour_rates 42(시간 7종 × 성별 2 × 기수 3). 로컬 DB 는 `capture/local-db-check.txt` 의 주소.

## 6. 화면 구성 — 사이드바 메뉴 14개 · 설정 탭 6개 · 저장된 배정 보기 4가지
- 근거: `src/components/app-shell.tsx:46-73`(메뉴 href 14개) · `src/app/(app)/settings/settings-client.tsx:14-21`(TABS 6개: 시간 단가·일당 단가·숙소와 호실·급여명세서·작업 종류·기수) · `src/app/(app)/assignments/assignments-client.tsx:497-500`(일별·월별·근로자별·기간 배정).

## 7. 근무 시간은 30분 단위(0.5~20시간, 40단계), 가용 인원은 날짜·작업을 고르면 자동 계산
- 근거: `src/lib/domain/wage.test.ts:40-41` "WAGE_HOURS is exactly 0.5..20 in 0.5 steps(30분 단위)" · 가용 판정 `src/lib/domain/availability.ts` · 자동 추천 우선순위 `src/lib/domain/recommend.ts`(그 농가 경험자 → 같은 숙소 → 연속근무 적은 순 → 성별) — RECON.md §3-1.

## 8. 마이그레이션 78개(빈 DB 에서 전체 재생 성공)
- 근거: `ls supabase/migrations | wc -l` = 78. 사본에서 로컬 Supabase 에 78개를 순서대로 적용(운영 데이터를 전제한 마이그레이션 2개(20260825170000·20260921190100)만 사본에서 빈 DB 용으로 건너뜀 — 사본 안 수정, 레포 원본 무변경). 영상 자막 후보가 아니라 촬영 기록.

## 결정 필요(주 세션)
- 설정 「시간 단가」·「일당 단가」 화면의 금액은 `base.sql` = 고객이 확정한 **실제 설정값**(지어낸 값이 아님)이다. 규칙(영업 수치는 가짜 값)상 가려야 하면 로컬 DB 값만 바꿔 settings-hours·settings-wages·assign 계열을 다시 찍으면 된다(약 20분).
- prod 빌드(`next build`)는 서버 부하로 heavy-run 자리가 안 열려 dev 서버로 찍었다 — 필요하면 빌드 뒤 `node okjob/capture/10-desktop.mjs` 등으로 재촬영(스크립트 재실행 가능).

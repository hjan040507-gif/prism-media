# sy-motors shots — 화면이 아니라 응답 JSON 3흐름 (카카오톡 채널 안의 챗봇이라 공개 웹 화면이 없다)

촬영 방식(2026-11-06 07:52Z): 카카오 오픈빌더 스킬 요청 형식(`userRequest.utterance`·`userRequest.user.id`·`action.params`)으로 로컬 사본 봇 `http://127.0.0.1:3615/api/kakao/skill` 에 요청하고, 받은 **실제 응답 JSON** 을 순서대로 저장했다. 스크립트 `capture/run-flows.mjs`(재실행 가능, 비밀값 없음), 목 DB `capture/mock-supabase.mjs`, 실행 요약 `capture/run-summary.json`.
각 JSON = `{request, response, note, http, pii_scan}`(로그 증거 파일은 `request:null, response:null, server_log:[…]`). 요청·응답의 번호는 `tools/lib.mjs` 의 PII 표(순서·대체 글자 그대로)로 「010-****-****」·「12가 ****」 처럼 가린 뒤 저장했고, 저장 전 같은 정규식으로 검사해 0건일 때만 저장했다(`pii_scan.total` 0).

## 실행 구성(전부 로컬·가짜)
- 앱: `~/kakaoauto` 의 `git archive HEAD`(8788360c) 사본 + `npm ci`, `next dev -H 127.0.0.1 -p 3615`. **사본 코드 수정 0**(diff 없음) — 새로 만든 `.env.local` 만 추가. 빌드 대기열이 길어(heavy-run 대기 13) `next dev` 로 띄웠다(`NOTIFY_DRY_RUN=true` + `GET /api/health` 의 `notifyDryRun:true` 를 요청 전에 확인).
- DB: `SUPABASE_URL=http://127.0.0.1:3616` = 메모리 속 PostgREST·Storage 흉내 서버(키는 가짜 문자열). 실행당 목 요청 83건(chat_sessions 53·customers 6·intakes 3·intake_media 2·owner_tokens 4·bot_events 6 + 스토리지 업로드 2·서명 2). `run-summary.json` 의 mock_requests 는 2회 실행 누적 166건.
- 외부 호출 0: 운영 스킬 주소·운영 Supabase·Claude API·Solapi·카카오 API 요청 0(키·주소가 사본 env 에 없거나 가짜, 알림은 드라이런 로그만). Claude 호출: 세 흐름에 AI 호출이 없고(`callbackUrl` 없음, `ANTHROPIC_API_KEY` 미설정) 목 서버를 따로 두지 않았다. `~/kakaoauto` 원본에서 실행한 명령 0, 원본 `.env.local` 읽기·복사 0.
- 알림톡 env 5개는 가짜 값(`SOLAPI_*`·`ACCIDENT_ALERT_PHONES=가짜 2개`)으로 켜서 사고/긴급의 알림톡 분기와 「🚨 긴급」 줄을 그대로 재현했다. 방문 정비·장애 문의의 메모 경로는 목 DB 에 가짜 `owner_tokens`(owner) 한 행을 넣어 재현했다.

## 가짜 값 · 가린 것 · 코드 그대로 둔 것
- 가짜 값: 차량(어코드 2.4 2017·CRV 2.4 AWD 2016·파일럿 3.5 엘리트 2020)·번호판(가짜 3개)·이름(김○○·이○○·박○○ — 이미 가린 꼴)·전화(010-0000-000x)·요청 내용·사고 경위 전부 촬영용 가짜 입력. 번호판·전화는 저장 JSON 에서 가림(plate 14·phone 15 치환). 접수번호 「SY-XXXXXX」는 목 DB 가 만든 값(실제 접수번호 아님, 실행마다 바뀜). 「접수 시각」은 실행 시각.
- 가림 부작용(규칙 그대로 적용): 봇이 질문에 붙이는 **예시 문구**도 같은 정규식에 걸려 저장본에서는 「(예: 12가 ****)」·「예: 010-****-****」로 보인다. 실제 응답 원문은 「예: 12가XXXX」·「예: 010-XXXX-XXXX」(`flows.ts:198`·차량번호 질문 prompt)이다 — 영상 자막이 필요하면 코드 원문을 쓰되 번호 예시는 가린 채로 둔다(주 세션 판단).
- 사진 단계 요청: `action.params.secureimage` 에 가짜 이미지 URL(목 서버) 1장. 저장본의 URL 글자는 「[이미지 URL 가림]」. 메모 로그 줄의 사진 링크도 같다.
- 상호 표기: 응답의 상호는 코드 그대로 「에스와이모터스」(웰컴 `menu.ts:18`). 사용자 방침 「SY모터스」와 다르다 — 표기는 메인이 결정(가림이 아니라 표기 결정 필요).
- 지시와 코드가 다른 점: 지시의 「문자」 알림 = 실제는 알림톡(사고/긴급)·카카오 메모(6종), 알림톡은 가게 대표 폰으로 가는 것이라 고객 화면에 없음 / 지시의 「담당자 전달 버튼」 = 실제 「담당자에게 전달하기」(operator 버튼) / 「요약 확인 → 접수」 단계는 현재 코드에 없음.
- 운영에만 있는 요소(코드 밖 env — 로컬에서 흉내 내지 않음): ① 웰컴 맨 위 시범운영 안내(`PILOT_NOTICE`, 운영 Vercel env) ② 장애 문의 완료 카드의 「자가 점검 영상 보기」 버튼(`YOUTUBE_CHANNEL_URL`) ③ 사진 단계의 「📷 사진 첨부하기」 블록 버튼(`KAKAO_SECUREIMAGE_BLOCK_ID`) ④ 카카오 앱 UI(말풍선 모양·「현재 상담원과 채팅 중입니다」). `FAQ_ENABLED`(영업시간·위치 FAQ 즉답)는 가게 대표번호·주소·URL 이 응답에 실려 가림 대상이라 켜지 않았다.
- seq(mp4)·PNG·desktop·mobile·header·contact·media 없음 — 화면이 없다(BLOCKED.md).

## 파일 한 줄 설명
- `states/accident/00-welcome.json` — 처음 화면. 전역 명령 「메뉴」 → 세션 삭제 후 웰컴(simpleText + 빠른 답변 7개).
- `states/accident/01-pick-accident.json` — 카테고리 선택 → 첫 질문.
- `states/accident/02-car-type.json` — 차량 입력에 연식(2016)이 있어 연식 질문 생략.
- `states/accident/03-car-number.json` — 가짜 번호판(저장 시 가림).
- `states/accident/04-name.json` — 이미 가린 꼴의 이름.
- `states/accident/05-phone.json` — 검사를 통과하는 가짜 번호(저장 시 가림).
- `states/accident/06-accident-detail.json` — 사고 경위(필수 질문) → 보험 처리 질문(빠른 답변 3개).
- `states/accident/07-insurance.json` — 보험 처리 여부(빠른 답변 「보험 처리」) → 사진 단계.
- `states/accident/08-done.json` — 사진 건너뛰기 → 곧바로 접수 확정. 알림톡 env 5개가 가짜로 설정돼 완료 요약에 「🚨 긴급 건이라 담당자에게 알림이 바로 전달돼요」 줄이 켜진다(운영에서도 같은 조건).
- `states/accident/09-alimtalk-dryrun-log.json` — 알림 분기 증거: 사고/긴급만 솔라피 알림톡. 서버 로그의 [DRY-RUN] solapi/alimtalk 줄 = 수신 번호(가짜 env)·템플릿 ID(가짜)·변수 6개 JSON. 번호는 가림. 알림톡 템플릿 본문은 레포에 없다(솔라피 콘솔 승인본).
- `states/repair/00-welcome.json` — 처음 화면. 전역 명령 「메뉴」 → 세션 삭제 후 웰컴(simpleText + 빠른 답변 7개).
- `states/repair/01-pick-repair.json` — 카테고리 선택 → 첫 질문(차량 정보 통합 질문).
- `states/repair/02-car-type.json` — 차량 입력에 연식(2017)이 있어 연식 질문은 건너뛰고 차량번호 질문으로.
- `states/repair/03-car-number.json` — 입력은 가짜 번호판. 저장 JSON 은 「12가 ****」로 가림.
- `states/repair/04-name.json` — 이미 가린 꼴의 이름.
- `states/repair/05-phone-invalid.json` — 전화번호 검사 실패 → 재질문(검사: 숫자만 남겨 /^01[016789]\d{7,8}$/).
- `states/repair/06-phone.json` — 검사를 통과하는 가짜 번호. 저장 JSON 은 「010-****-****」로 가림.
- `states/repair/07-request-detail.json` — 선택 질문(요청 내용) 입력.
- `states/repair/08-photo-received.json` — 사진 단계: secureimage 플러그인이 action.params 로 주는 형태에 가짜 이미지 URL(목 서버) 1장. URL 글자는 「[이미지 URL 가림]」으로 바꿔 저장.
- `states/repair/09-photo-next.json` — 사진 단계 종료 → 방문 정비만 있는 「추가 정보」 게이트.
- `states/repair/10-done.json` — 접수 확정(확인 단계 없이 곧바로 저장) → 완료 요약 simpleText + 「담당자에게 전달하기」 textCard(operator 버튼).
- `states/repair/11-memo-dryrun-log.json` — 알림 분기 증거: 사고/긴급이 아닌 접수는 카카오 「나에게 보내기」 메모 경로. 로컬은 드라이런이라 [DRY-RUN] kakao/memo 로그만 남는다(운영 호출 0). 알림 대상 토큰은 목 DB 에 넣은 가짜.
- `states/trouble/00-welcome.json` — 처음 화면. 전역 명령 「메뉴」 → 세션 삭제 후 웰컴(simpleText + 빠른 답변 7개).
- `states/trouble/01-pick-trouble.json` — 카테고리 선택 → 증상 질문(진단·조치 안내는 일절 하지 않는 접수 전용).
- `states/trouble/02-symptom.json` — 증상(필수) → 차량 정보 질문.
- `states/trouble/03-car-type.json` — 차량 입력에 연식(2020)이 있어 연식 질문 생략.
- `states/trouble/04-car-number.json` — 가짜 번호판(저장 시 가림).
- `states/trouble/05-name.json` — 이미 가린 꼴의 이름.
- `states/trouble/06-phone.json` — 검사를 통과하는 가짜 번호(저장 시 가림) → 사진 단계.
- `states/trouble/07-photo-received.json` — 사진 1장(가짜 이미지 URL, 저장 시 글자 가림).
- `states/trouble/08-done.json` — 장애 문의는 사진이 마지막 단계라 곧바로 접수 확정 → 완료 요약 + 「담당자에게 전달하기」 카드. 「자가 점검 영상 보기」 버튼은 운영 env(YOUTUBE_CHANNEL_URL)에만 있어 로컬엔 없다.
- `states/trouble/09-memo-dryrun-log.json` — 알림 분기 증거: 장애 문의는 사고/긴급이 아니라 카카오 「나에게 보내기」 메모 경로(드라이런 로그).
- `capture/run-flows.mjs` — 3흐름 요청·저장·가림·PII 검사 스크립트(127.0.0.1 이 아니면 중단, `notifyDryRun!==true` 면 중단).
- `capture/mock-supabase.mjs` — 메모리 PostgREST·Storage 흉내 서버(포트 3616, 127.0.0.1 만 listen).
- `capture/run-summary.json` — 목 요청 수·목 행 수·가림 치환 수·운영 요청 0.
- `brand.json` — 주색·폰트 근거 없음(null + reason).
- `facts.md` — 사실 8개(근거 file:줄·실측 파일) + 미확인.
- `BLOCKED.md` — 못 채운 항목·사유·대안.
- `RECON.md` — 사전 조사(촬영 전).

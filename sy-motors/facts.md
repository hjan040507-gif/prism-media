# sy-motors 사실 (자막용) — 근거는 레포 `~/kakaoauto` HEAD 8788360c(2026-09-28) 의 `file:줄` + 로컬 사본 실측(2026-11-06 07:52Z)

레포 안 경로는 모두 `~/kakaoauto/` 기준. 「실측」은 로컬 사본 봇(127.0.0.1:3615) + 목 DB(127.0.0.1:3616)에서 받은 응답 JSON(`states/…`).

## 1. 접수 카테고리는 7종 — 사고/긴급·부품 구매·방문 정비·용품 시공·차량 장애 문의·쇼핑몰 문의·기타
- 근거: `src/lib/kakao/menu.ts:7-15`(CATEGORY_LABELS 7개), `src/lib/state/flows.ts:247-312`(FLOWS 키 7개: repair·install·parts·etc·trouble·accident·shop). 실측: `states/repair/00-welcome.json` 의 quickReplies 7개.
- 주의: `CLAUDE.md`·`docs/GO-LIVE.md:46`(「6개 카테고리」)·`src/lib/kakao/dispatch.ts:44` 주석(「6종」)은 낡은 표기 — 코드 기준은 7종.

## 2. 전화번호 검사 규칙 — 숫자만 남긴 뒤 휴대폰 형식(010·011·016·017·018·019, 총 10~11자리)이어야 통과
- 근거: `src/lib/state/flows.ts:160-170`(정규식 `/^01[016789]\d{7,8}$/` 는 :162). 통과하면 `010-XXXX-XXXX`(11자리)·`011-XXX-XXXX`(10자리) 꼴로 저장. 실패하면 「연락처 형식을 확인해 주세요. 예: 010-XXXX-XXXX」 재질문(횟수 제한 없음).
- 실측: `states/repair/05-phone-invalid.json`(입력 「010-12」 → 재질문) → `06-phone.json`(가짜 번호 통과). 저장 JSON 의 번호·예시 번호는 가림 규칙으로 「010-****-****」.

## 3. 사진은 최대 5장, 장당 10MB·다운로드 10초 제한, 이미지가 아닌 파일은 버린다
- 근거: 세션 누적 5장 `src/lib/state/engine.ts:232`(`.slice(0, 5)`), 한 번에 받는 URL 5개 `src/lib/kakao/media.ts:11,72`, 장당 10MB·10초 `src/lib/media/store.ts:13-14,52`, 비이미지 스킵 `store.ts:16-25`. 사진은 선택 단계(「사진 없이 진행」 버튼). 영상 첨부는 카카오 secureimage 플러그인이 지원하지 않는다(`docs/HANDOVER.md` 「알려진 한계」).
- 실측: `states/repair/08-photo-received.json`·`states/trouble/07-photo-received.json`(가짜 이미지 1장 수신 → 「사진 1장 받았어요 📷」). 5장 상한과 10MB 컷은 코드 근거만(촬영하지 않음).

## 4. 알림 분기 — 사고/긴급만 알림톡, 나머지 6종은 카카오 「나에게 보내기」 메모
- 근거: 분기 `src/lib/notify/notifyOwner.ts:46-52`(accident + 알림톡 env 설정 → 알림톡 / 그 외·미설정 → 메모). 알림톡은 env 5개가 전부 있어야 켜짐 `src/lib/notify/alimtalk.ts:18-25`, 번호별 1건씩 `:115-123`, 문자 대체발송 끔 `kakaoOptions.disableSms:true`(`:119`). 메모는 `OWNER_MEMO_BACKUP=off` 로 끌 수 있고 사고는 항상 발송 `src/lib/notify/text.ts:43-46`. 메모 대상: 방문 정비·용품 시공·장애 문의는 담당자(`assignee_a`) 토큰 우선, 없으면 사장(`owner`), 나머지는 사장 `notifyOwner.ts:18-24,61-68`.
- 실측(드라이런 로그 — 발송 호출 0): `states/accident/09-alimtalk-dryrun-log.json`([DRY-RUN] solapi/alimtalk, 수신 2건·변수 JSON), `states/repair/11-memo-dryrun-log.json`·`states/trouble/09-memo-dryrun-log.json`([DRY-RUN] kakao/memo, role=owner 폴백).
- 알림 수신자는 가게 대표 쪽 폰이다. 고객에게는 알림톡도 문자도 가지 않는다(고객이 받는 건 대화창의 완료 요약 + 전달 카드).

## 5. 지시의 「문자」 알림은 코드에 없다 — 접수 알림은 알림톡(사고)·카카오 메모(6종) 둘뿐
- 근거: 접수 알림 경로는 위 4번이 전부. SMS(문자)는 keep-alive 워크플로 실패 시 운영자에게 가는 `src/app/api/cron/alert-sms/route.ts`(머리 주석 1-6줄, CRON_SECRET 필요)뿐이고 접수와 무관하다. 알림톡 템플릿 본문은 레포에 없다(솔라피 콘솔 승인본) — 코드에 있는 건 변수 6개 `#{접수번호}·#{성함}·#{연락처}·#{차량정보}·#{사고경위}·#{보험여부}`(`alimtalk.ts:47-54`, 실측 `accident/09`).

## 6. 접수는 확인 단계 없이 마지막 질문 직후 곧바로 저장·완료된다
- 근거: `src/lib/state/engine.ts:176`(`step.kind === 'summary'` 이거나 단계가 끝나면 즉시 `finalize`), 구 「요약 → 이대로 접수할까요?」 흐름은 구 세션 하위호환 전용(`engine.ts:8,202-208`). 완료 말풍선 = 요약 simpleText + 「담당자에게 전달하기」 textCard(operator 버튼, `src/lib/kakao/responses.ts:10,98,109-122`; 호출 `engine.ts:130-135`).
- 방문 정비·용품 시공만 사진 뒤에 「추가 정보」 게이트(`추가 입력`/`바로 접수`)가 있다 `flows.ts:239`. 실측: `states/repair/09-photo-next.json` → `10-done.json`.

## 7. 사고/긴급 접수 완료 요약에는 「🚨 긴급 건이라 담당자에게 알림이 바로 전달돼요」 줄이 붙는다(알림톡 설정 시)
- 근거: `src/lib/state/engine.ts:128`(`urgentAlerted = accident && isAlimtalkConfigured()`), 문구 `src/lib/notify/text.ts:199`. 실측: `states/accident/08-done.json`(로컬 가짜 알림톡 env 로 켠 상태 — 운영도 같은 조건).

## 8. 대화 세션은 30분 유지(경과 시 처음부터), 접수 후 24시간 안의 재발화는 「접수 저장됨」 안내
- 근거: `src/lib/state/session.ts:10,22-26`(TTL 30분), `src/lib/intake/followup.ts:13`(24시간). 실측은 하지 않음(시간 의존).

## 미확인
- 응답 시간(콜드 1.80s→웜 0.99s)·회귀 9종·누적 접수 건수: 비코드 근거(`~/hongjun-journey/docs/CONTENT/briefs/sy-motors-bot.md` §2)뿐이고 sim 단계는 현재 12개(`scripts/sim-all.ts:34-45`)라 「9종」은 낡았다. 자막에 쓰려면 Vercel 로그·DB 읽기 쿼리 근거가 먼저 필요 → **미확인**.
- 운영 라이브 상태(2026-09-28 마지막 prod 검증 이후): 운영 스킬 주소로 요청 금지라 **미확인**.
- 로컬 실측 응답 시간(`http.elapsed_ms`)은 `next dev` + 메모리 목 DB 라서 운영 응답 시간이 아니다 — 자막에 쓰지 않는다.

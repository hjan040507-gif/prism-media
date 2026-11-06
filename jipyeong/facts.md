# jipyeong 자막용 사실 (지평주조 「흔들면, 이야기가 시작된다」)

근거 경로는 레포 `/home/dev/maimai-jipyeong` 브랜치 `jipyeong` 커밋 7312f95c(2026-11-03) 기준, 접두 `J` = `src/app/jipyeong-shake/`. 코드는 읽기만 했고 DB·SENS 는 조회하지 않았다(문서에 적힌 값은 그 출처를 밝히고 재검증 안 함이라고 적는다).

## 1. 행사 기간은 2026년 9월 17일부터 10월 30일까지, 6주(마지막 주만 9일)
- 근거: `J/data/event.ts:15` `EVENT_PERIOD = "2026년 9월 17일 ~ 10월 30일"`, `J/data/event.ts:294-301` `CAMPAIGN_WEEKS`(W1 9/17-9/23 · W2 9/24-9/30 · W3 10/1-10/7 · W4 10/8-10/14 · W5 10/15-10/21 · W6 10/22-10/30). 종료 시각은 마지막 주 끝 = 10/30 23:59:59.999 KST(`J/campaign-close.ts:11-17`).

## 2. 성격 유형은 5가지이고, 흔든 시간(0~5초)으로 정해진다 — 랜덤이 아니다
- 근거: `J/data/shake-types.ts:43-143`(hype 흥 폭발형 0~1초 · story 이야기 보따리형 1~2초 · cheers 건배 선동형 2~3초 · balance 적당히 즐기는형 3~4초 · calm 잔잔한 한잔형 4~5초), 결정 함수 `J/data/shake-types.ts:167-172` `resolveShakeType`(반개구간 [min,max), 5.0초는 마지막 구간). 촬영으로 재현: 0.4·1.2·2.2·3.2·4.2초(+입력 꺼짐 꼬리 0.35초) 동안 devicemotion 을 주입 → 5종 모두 해당 유형 화면이 나옴(`jipyeong/capture/mobile.mjs` 가 결과 화면의 `data-jp-type` 을 기대 유형과 대조, 불일치면 예외).

## 3. 초대장 카드는 6종이고, 참여자가 직접 고른다(고르지 않으면 무작위 1종이 기본 선택)
- 근거: `J/data/messages.ts:19-26` `SHAKE_MESSAGES`(1 "지평막걸리 같이 마실 사람, 너 당첨." · 2 "…한잔 어때? 대답은 짠으로" · 3 "…한잔하자. 이유는 만나서 말해" · 4 "…핑계로 한번 보자" · 5 "…흔들 사람 구함 (1/2)" · 6 "…굿즈 같이 받을 사람 너로 정했어"), 기본 무작위 `randomMessageId` `J/data/messages.ts:29`. 카드 이미지 `media/card-1..6.jpg`.

## 4. 흔들기 판정: 가속도 4m/s² 넘으면 '흔드는 중', 누적 5초가 차면 바로 끝, 멈추면 1.5초 뒤 확정
- 근거: 임계값 `J/ui/motion-tuning.ts:526` `NOISE_FLOOR: 4`(m/s²), 세기 상한 `PEAK_CAP 18`(`:534`), 마지막 스파이크 후 350ms 뒤 입력 꺼짐 `J/ui/motion-input.ts:87` `SHAKE_HOLD_MS = 350`, 입력이 끊긴 채 1.5초면 종료 `J/useShakeSession.ts:38` `IDLE_GRACE_SEC = 1.5`, 누적 상한 5초 `J/data/shake-types.ts:9` `SHAKE_MAX_SEC = 5`. 센서가 없으면 병을 꾹 눌러 진행(pointer 모드, `J/phases/Shake.tsx:55` `InputMode`).

## 5. 주간 추첨은 매주 26명(1등 1·2등 5·3등 20), 6주 총 156명 — 많이 소환할수록 당첨 확률이 오른다
- 근거: 경품 `J/data/event.ts:234-272` `PRIZES`(1등 추억 기록 키트 weekly 1/total 6 · 2등 우정 티셔츠 5/30 · 3등 지평 잔 세트 20/120), 주간 인원 `J/admin/draw.ts:45-55` `rankPlan`·`plannedTotal`(=26). 추첨은 SHA-256 시드 기반 가중 비복원 추첨이고 가중치 = 1 + min(전달 방 수, 9)(`J/admin/draw.ts:31-39` `WEIGHT_MAX = 10`·`weightFromRooms`, 시드 `:57-66`). 공개 문구 "많이 소환할수록 경품 당첨 확률 UP!"(`J/data/event.ts:321` `SHARE_NUDGE`, 화면 촬영 `mobile/result-*`).

## 6. 응모 완료 2,319명 — 정의: 최종 응모 행 수(jp_entries). 문자 건수·인증 받은 번호 수와는 다른 숫자
- 근거: 레포 `PROGRESS.md:75`("대표님 2,319 = jp_entries 실응모 2,319 와 정확히 같다(통수 아님)") · `docs/specs/sms-proof.md:4`(CMS 숫자 응모 2,319명). 이 촬영에서 DB 를 조회해 재검증하지 않았다 → 자막에 쓰면 "응모 완료(기록 기준)"로 정의를 밝힐 것. 같은 문서의 다른 수치는 정의가 다르다: 인증 문자 3,298통 발송(성공 3,249·실패 49, `PROGRESS.md:33`, SENS 원본 기준, 같은 번호 재발송 포함)과 인증 받은 고유 번호 2,466개(10/02 시점 스냅샷, `PROGRESS.md:75`)는 응모자 수가 아니다. 총 참여자 수(방문자·흔들기 시도)는 **미확인**.

## 7. 1인 1회 · 만 19세 이상 · 문자 인증 필수
- 근거: 만 19세 `J/data/event.ts:18` `EVENT_AGE_LIMIT = "만 19세 이상 참여 가능"`, 게이트 체크박스 "만 19세 이상입니다"(`J/phases/Gate.tsx:754`, 화면 `states/gate-input/02-age-checked.png`), 1인 1회는 서버의 휴대폰 번호 unique(`J/JipyeongShake.tsx:115` 주석, `J/data/event.ts:115` 중복 시 "이미 응모하셨어요!"), 문자 인증 6자리 `J/phases/Gate.tsx:893-1010`.

## 8. 당첨 문자 234건 발송(성공 223·실패 11) — 5주차까지 208건·6주차 26건
- 근거: 레포 `PROGRESS.md:33`("win 234 = 156 + 26 + 52 · 223 delivered / 11 failed (weeks 1–5 208/198/10 · week 6 26/25/1)"). SENS 발송 원본 기준 문서값이고 이 촬영에서 재조회하지 않았다.

## 9. 응모자 개인정보 파기일은 2026-11-30
- 근거: `J/data/event.ts:318` `RETENTION_END = "2026-11-30"`, 운영 관리자 화면 상단에 고정 표시(`J/admin/AdminBoard.tsx:230`, 촬영 `desktop/admin-*` 상단 — 가짜 데이터 화면이지만 이 문구는 코드 상수 그대로).

## 10. 협업 영상(성립 작가)은 카톡 초대장의 두 번째 버튼으로 연결된다
- 근거: `J/share.ts:84` `shareButtons`·문구 `J/data/event.ts:171-172`(버튼 1 "막걸리 흔들러 가기", videoOn 이면 버튼 2 "영상 보러가기"), 영상 주소는 서버 env `JIPYEONG_VIDEO_URL` 로 `/jipyeong-shake/video` 가 302(`J/video/route.ts`) — 레포 안에 영상 파일은 없음(`media/` 에 영상 원본 없음, BLOCKED.md). 이 GET 은 서버 카운터를 올리므로 촬영에서 호출하지 않았다.

# jipyeong 사전 조사 (RECON)

조사 방식: 코드 읽기 + 운영 URL 에 `curl -sI`/GET 만. 서버·빌드·브라우저·DB 쿼리 없음. 레포 `/home/dev/maimai-jipyeong` (브랜치 `jipyeong`, HEAD 7312f95c 2026-11-03, 읽기만). 경로 접두 `J` = `src/app/jipyeong-shake/`.
`.env.local` 은 읽기가 거부돼 값·존재 여부 확인 안 함(변수 '이름'은 코드와 `.env.local.example` 에서 뽑음).

## 1. 스택·실행
- Next.js **16.2.9** App Router, React 19.2.4, Tailwind 4, framer-motion 12, TypeScript 5, 패키지 매니저 **npm**(package-lock.json) — package.json:7-39. 레포 이름은 maimai-event-builder 와 같은 코드베이스이고 지평은 라우트 `/jipyeong-shake` 하나(+`/jipyeong-shake/admin`). `AGENTS.md` 가 "이 Next 는 다르다, node_modules/next/dist/docs 먼저" 라고 명시.
- 명령: `npm run build`(next build) · `npm start`(next start) · `npm run lint`. 배포는 `./deploy.sh`(vercel --prod, 토큰은 .env.local) — 건드리지 않는다.
- 지평 env '이름'(코드 grep): `JIPYEONG_SUPABASE_URL` `JIPYEONG_SUPABASE_SERVICE_ROLE_KEY`(J/db.ts:14-15) · `JIPYEONG_OTP_PEPPER` · `JIPYEONG_ADMIN_PASSCODE`(J/admin/auth.ts:88,99) · `JIPYEONG_SIAN` · `JIPYEONG_TEST_WRITES` · `NEXT_PUBLIC_JIPYEONG_GATE_MOCK` · `JIPYEONG_NOINDEX` · `JIPYEONG_VIDEO_URL` · `NEXT_PUBLIC_KAKAO_JS_KEY` · `KAKAO_WEBHOOK_SECRET` · `JIPYEONG_HEALTH_SECRET` · `JIPYEONG_SMS_PRIMARY` · `JIPYEONG_SENS_{ACCESS_KEY,SECRET_KEY,SERVICE_ID,FROM}` · `JIPYEONG_SOLAPI_{API_KEY,API_SECRET,FROM}`. `.env.local.example` 에는 지평 변수가 없고 빌더용(NEXT_PUBLIC_SUPABASE_*, ANTHROPIC_API_KEY …)만 있다.
- **로컬 실행 시 DB 대상 = 운영 Supabase**(공유 ref sfsmzz…). CLAUDE.md "캠페인 기간 하네스 규약" + J/mock-build.ts:4-6 ("그 서버는 운영과 같은 Supabase 를 본다"). 즉 **`.env.local` 을 그대로 복사해 띄우면 운영 DB 에 읽기·쓰기가 된다 — 금지**.
- **가짜 데이터 데모 모드는 없다.** `NEXT_PUBLIC_JIPYEONG_GATE_MOCK=1`(mock-build.ts) 은 "관리자 쓰기 거부(409 mock_build_readonly) + 운영 행(is_test=false)만 조회" 이지 가짜 데이터가 아니다 — 오히려 **실응모자 데이터가 그대로 보인다**. seed 스크립트는 하네스용으로 운영 DB 를 직접 쓴다(PROGRESS.md:12-13 사고 기록).
- **권장 가짜 로컬 실행**(임시 clone/worktree, 빈 포트, 운영 env 미복사):
  1. `git worktree add --detach <임시경로> 7312f95c`(브랜치 `jipyeong` 은 원 폴더가 점유 중이라 --detach 필수) 또는 `git clone --local`. node_modules 는 따라오지 않음(원본 1.1G) → `npm ci` 또는 복사.
  2. 임시 `.env.local` 에 **가짜 값만**: `JIPYEONG_OTP_PEPPER=fake…` `JIPYEONG_ADMIN_PASSCODE=fake…`. **`JIPYEONG_SUPABASE_*` 는 넣지 않는다**(jipyeongDb() 가 throw → 서버 쪽 DB 접근이 구조적으로 0, J/db.ts:13-17). `NEXT_PUBLIC_KAKAO_JS_KEY` 도 넣지 않는다(카카오 SDK 미적재 → 공유가 목 경로, J/layout.tsx:94 · share.ts:99-106).
  3. `nice -n 10 npm run build && npm start -- -p <빈포트>`. 모든 지평 API 는 Playwright `page.route('**/jipyeong-shake/api/**')` 로 가짜 응답(아래 6절).
  4. 관리자: 세션은 서버가 쿠키(JWT)만으로 판정(DB 안 봄, auth.ts:123-134). 가짜 pepper 로 **쿠키를 직접 발급**해 `context.addCookies` — 이름 `jp_admin`, path `/jipyeong-shake`, HS256, 키 = `HMAC-SHA256(pepper,"jp-admin-session")` 의 hex 문자열을 UTF-8 로, 페이로드 `{adm:true}`, 만료 12h(auth.ts:62-63,108-120). 이후 `/api/admin/{overview,entries,flow,js-errors,otp-status,draw?week=}` GET 을 가짜 JSON 으로 fulfill(형태는 J/admin/AdminBoard.tsx:36-121 의 Overview·ListPage·Flow·OtpStatus·JsErrors 타입, 명단 행은 admin/data.ts:31-52 EntryRow).
- 대안: **참여자 화면은 운영 URL 을 그대로 써도 된다**(GET 만, 아래 2절). 단 모든 `/jipyeong-shake/api/**` POST 를 fulfill 로 가로채고 GTM·카카오 SDK 는 abort(5·6절). 관리자는 운영 불가(실데이터) → 로컬 가짜만.

## 2. 라이브 주소와 상태 (2026-11-05 23:2x Z, GET/HEAD 만)
- 운영 URL: `https://jipyeong.mai-eventic.com/jipyeong-shake` (PROGRESS.md END-BLOCK 의 alias 기록). 같은 호스트 `/` 는 mai-eventic 제품 랜딩(title "mai-eventic — 누구나 만드는 AI 이벤트") — **지평 화면이 아니다**.
- `curl -sI`: `/jipyeong-shake` 200 · `/jipyeong-shake/admin` 200 · 둘 다 `x-robots-tag: noindex, nofollow`(next.config.ts JIPYEONG_NOINDEX). 랜딩 title "지평생막걸리 SHAKE", 관리자 title "지평 SHAKE 운영".
- **행사는 종료**(10/30 23:59:59.999 KST, J/campaign-close.ts:11-17). 하지만 **랜딩·흔들기·결과 화면은 종료 표시 없이 그대로 뜬다**(Landing 에 종료 분기 없음). 종료로 막힌 것: 서버 `otp/send`·`otp/verify`·`entry` 가 첫 줄에서 410 `campaign_closed`(api/otp/send/route.ts:54, verify:35, entry:60), 웹훅은 무기록 200(kakao-webhook:58), **게이트(문자 인증 화면)는 기기 시계가 종료 이후면 "이벤트가 종료되었습니다. 참여해 주셔서 감사합니다"(`data-jp="gate-closed"`)가 뜨고 발송·제출 버튼이 잠긴다**(Gate.tsx:305,879 · campaign-close.ts:24). → 촬영 시 `page.clock.install({time:new Date('2026-10-10T12:00:00+09:00')})` 같이 **클라이언트 시계를 10/30 이전으로** 고정해야 게이트가 열린다(서버는 모든 API 를 가로채므로 무관).
- 관리자 `/jipyeong-shake/admin`: 미인증이면 `AdminGate`(패스코드 입력)만 렌더(admin/page.tsx:25-28). 운영 접속은 실응모자가 보이므로 금지.
- 행사 기간(코드 상수): `EVENT_PERIOD = "2026년 9월 17일 ~ 10월 30일"`(J/data/event.ts:15), 주차 6개 `CAMPAIGN_WEEKS`(event.ts:294-301: W1 9/17-9/23 · W2 9/24-9/30 · W3 10/1-10/7 · W4 10/8-10/14 · W5 10/15-10/21 · W6 10/22-10/30(9일)). 개인정보 파기일 `RETENTION_END = "2026-11-30"`(event.ts:318) → **운영 DB 에 실응모자 데이터가 아직 있다**.

## 3. 명세 항목 ↔ 실제 라우트/컴포넌트
**전부 한 URL `/jipyeong-shake`, 한 문서 안에서 phase 상태머신이 전환**(J/JipyeongShake.tsx:34,56 · 라우터 이동 없음). 단계 상태는 **React state(메모리)** 가 주(phase·seconds), sessionStorage 는 새로고침 복원용 보조(session.ts: `jp_gate` 통과 토큰, `jp_otp` 발송 사실, `jp.shake` 흔든 초·유형, `jp_ref` 초대 유입). **URL 쿼리로 단계·유형에 직접 진입하는 방법은 없다**(쿼리는 `?ref=`(8자 hex)·`?debug=1` 뿐: JipyeongShake.tsx:98 · DebugHud.tsx:46). 새로고침하면 항상 랜딩부터.

**실제 순서는 명세와 다르다: 랜딩 → 흔들기 → 결과 → 게이트(동의·19세 → 이름·번호 → 인증번호) → 초대장 고르기 → 완료.** 게이트가 흔들기 *뒤*(STEP21, JipyeongShake.tsx:19-23).

| 명세 항목 | 실제 | 파일:줄 | 진입 조건 | 호출 API |
|---|---|---|---|---|
| 모바일 랜딩 | phase `landing`. `data-jp="landing"`·`landing-head`·`landing-bottle-slot`·`landing-start`(CTA "지평생 흔들고 친구 소환하기")·`landing-prizes`(경품 3종)·`landing-notice`(유의사항) | phases/Landing.tsx:73-396 | 첫 로드 | 없음(GTM 스니펫 외부 요청) |
| 만 19세 확인 | Gate **스텝 1**: 체크박스 "전체 동의/개인정보 수집·이용 동의(내용 보기 시트)/**만 19세 이상입니다**/마케팅 활용 동의". `gate-agree-all`·`gate-submit`("다음") | phases/Gate.tsx:700-790 | 결과 화면 CTA(`result-share` "같이 한잔 할 친구 소환하기") 클릭. 단 살아 있는 `jp_gate` 토큰이면 게이트 건너뜀(JipyeongShake.tsx:156-158) | 없음 |
| 문자 인증(번호·인증번호) | Gate **스텝 2** 이름(`gate-name`)·휴대폰(`gate-phone`)·`gate-send` → **스텝 3** 6칸 OTP(`gate-otp`,`gate-otp-1..5`)·`gate-verified`·`gate-submit`("확인하고 초대장 고르기") | Gate.tsx:800-1070, otp.ts:56-117 | 스텝 1 통과 | POST `/jipyeong-shake/api/otp/send` `{phone}` · POST `/api/otp/verify` `{phone,code}` |
| 흔들기 안내 | Shake 화면 idle 상태: 헤드 "힘껏 흔들어 보세요!", 서브, 병, CTA `motion-start`("막걸리 흔들기 시작"), 폴백 링크 `motion-fallback`("흔들기가 안 되거나 PC 접속의 경우 / 막걸리 병을 꾹 눌러 진행하기") | phases/Shake.tsx:455-740, data/event.ts:55-86 | 랜딩 CTA 클릭. **센서 지원 기기(DeviceMotionEvent 존재)에서만 `prompt` 모드** | 없음 |
| 흔드는 중 | 같은 화면 `data-jp-state="active"`, 게이지 `shake-progress`·라벨 "섞는 중…"(`shake-mix-label`) | Shake.tsx:539,614-660, event.ts:70-73 | 입력 on | 없음 |
| 막걸리 섞이는 연출 | 같은 화면의 병(BottleHero) 앙금→혼합 액체. mix = elapsed/5.0. done 시 "잘 흔들었어요!" 후 600ms 정착 → 결과 | ui/BottleHero.tsx(canvas), ui/liquid-engine.ts, motion-tuning.ts:21 MIX, Shake.tsx:46 SETTLE_MS | 흔들기 누적 | 없음 |
| 성격 유형 결과 5종 | phase `result`. `data-jp="result"`·`result-sec`·`result-hook1`·`result-card`·`result-type`·`result-desc`·`result-share` | phases/TypeResult.tsx:132-346 | 흔들기 종료 후 자동 | 없음(`sessionStorage jp.shake` 기록) |
| '꾹 눌러 참여' 화면 | Shake 의 **pointer 모드**: 안내 pill "기기를 흔들거나, 병을 꾹 눌러 흔들어 주세요"(`shake-hint`), `shake-area` 가 `role=button aria-label="꾹 눌러 막걸리 흔들기"`. DeviceMotionEvent 가 없는 환경(헤드리스·데스크톱)은 처음부터 이 모드, 센서 환경에선 `motion-fallback` 클릭 또는 권한 거부/무음 실패 시 | Shake.tsx:55,90-99,240,389-398,532-538 | `data-jp-input="pointer"` | 없음 |
| 초대장 카드 6종 | phase `message`. `message-preview`(큰 카드)·`message-list`/`message-option`(6개)·`message-random`("랜덤으로 받기")·`message-cta`("카카오톡으로 보내기") | phases/MessagePick.tsx:269-468, data/messages.ts | 게이트 통과(또는 토큰 복원) | CTA 시 POST `/api/entry` |
| 공유 화면 | (a) MessagePick CTA → 카카오 공유창(SDK 있을 때만, 캡처 불가) → 토스트(`message-toast`) → (b) **phase `done`**: `done-title`("응모 완료!"/중복 시 "이미 응모하셨어요!")·`done-summary`(이름·`010-****-1234`)·`done-reshare`·`done-nudge` | phases/Done.tsx:128-277, share.ts:99-148, event.ts:108-117 | 응모 저장 확인 후 | `/api/entry` 응답 필요(`entryId`·`shortId`·`sig`), 웹훅 POST 는 카카오 서버가 호출 |
| 데스크톱 주간 추첨 관리자 | `/jipyeong-shake/admin` 탭 `추첨`(`data-jpa="tab-draw"`): `draw-week`·`pool-size`·`draw-run`·`draw-winners`·`draw-void` | admin/AdminBoard.tsx:134-140,859-998 | 어드민 세션 쿠키 | GET `/api/admin/overview`·`/api/admin/draw?week=` · POST `/api/admin/draw`(쓰기) |
| 응모자 목록 | 탭 `명단`(`tab-list`): `entries`·`entry-row`·`search`·`week-filter`·`phone-toggle`(펼치면 전체 번호)·`list-count`·페이지 200행 | AdminBoard.tsx:629-858, admin/data.ts:24-52 | 어드민 세션 | GET `/api/admin/entries?…` · POST `/api/admin/exclude`(쓰기) |
| (명세에 없는 어드민 탭) | `대시보드`(`stats`·`flow`·`js-errors`·`log`)·`문자`(당첨 발송)·`설정`(템플릿·장애 알림 번호) | AdminBoard.tsx:278-345,999-1351 | — | flow·js-errors·otp-status GET |

- **성격 유형 5종**(J/data/shake-types.ts:48-143, 지평주조 08-31 기획안 원문): `hype` **흥 폭발형**(0~1초, "1초컷, 성격급한 당신") · `story` **이야기 보따리형**(1~2) · `cheers` **건배 선동형**(2~3) · `balance` **적당히 즐기는형**(3~4) · `calm` **잔잔한 한잔형**(4~5, 5.0 포함).
- **결정 방식 = 흔든 시간(초)** 구간. 랜덤·서버 아님: `resolveShakeType(seconds)`(shake-types.ts:164-172, 반개구간 [min,max)), 입력은 0~5 clamp. 표시초는 소수 2자리 내림(`formatShakeSec`).
- **초대장 6종**(J/data/messages.ts:25-32, 그림 안에 같은 문구): 1 "지평막걸리 같이 마실 사람, 너 당첨." · 2 "지평막걸리 한잔 어때? 대답은 짠으로" · 3 "지평막걸리 한잔하자. 이유는 만나서 말해" · 4 "지평막걸리 핑계로 한번 보자" · 5 "지평막걸리 흔들 사람 구함 (1/2)" · 6 "지평막걸리 굿즈 같이 받을 사람 너로 정했어". **결정 = 사용자 선택**, 진입 시 `randomMessageId()` 로 기본 1종이 무작위 선택(MessagePick.tsx:85), `message-random` 으로 재추첨. 이미지 `public/jipyeong/img/card-{1..6}.jpg`(720px)·`-thumb.jpg`·`-art.png`.
- **특정 유형 결과 화면에 직접 들어가는 방법: 없음**(URL·쿼리·storage 로 주입 불가 — 유형은 셸 메모리 `seconds` 에서만 계산: JipyeongShake.tsx:66,258). 유형별로 만들려면 **그 길이만큼 실제로 흔든다**(4절). 흔든 길이 목표 예: hype 0.4s · story 1.4s · cheers 2.4s · balance 3.4s · calm 4.4s(+ 입력 꺼짐 확정 꼬리 ≈0.35s 가 누적에 들어갈 수 있으니 구간 중앙을 겨냥하고 결과 화면 `result-sec` 텍스트로 검증). 게이트 생략 지름길: sessionStorage `jp_gate` = `{"otpToken":"<phone>.<exp초>.<아무문자열>","name":"김○○","marketing":false}`(exp 가 미래면 통과 처리, session.ts:51-83) — 이러면 결과 → 곧바로 초대장.

## 4. 흔들기 구현
- 리스너: `window.addEventListener("devicemotion", handle)` — J/ui/motion-input.ts:279-287(listen), 핸들러 :195-260. 시작은 `createMotionInput().start()`, Shake.tsx 의 `startSensor`(Shake.tsx:274, 버튼 `motion-start` onClick, 사용자 제스처 안).
- 판정: `accelerationIncludingGravity.{x,y,z}` 가 전부 유한 숫자여야 유효(:198-201). 사용자 가속 = `event.acceleration`(있으면) 아니면 `AIG − 저역통과 중력(LERP 0.2)`; `raw = hypot`. **임계 `SENSOR.NOISE_FLOOR = 4 m/s²`**(motion-tuning.ts:526), 세기 상단 `PEAK_CAP = 18`(:534). `raw > 4` 이면 입력 on, 마지막 스파이크 후 **350ms**(`SHAKE_HOLD_MS`, motion-input.ts:121) 뒤 off.
- 필요 횟수 개념 없음 — **누적 "입력 on" 시간**(세션): 입력이 끊긴 채 **1.5초**(`IDLE_GRACE_SEC`, useShakeSession.ts:38) 지나면 done, **누적 5.0초(`SHAKE_MAX_SEC`)에 닿으면 즉시 done**(shake-types.ts:14). 시간은 `performance.now()` 차이(useShakeSession.ts:20,200-228), 타이머는 setTimeout.
- **iOS 권한**: `DeviceMotionEvent.requestPermission` 이 함수면 `ios-permission` 모드 → `start()` 가 이를 await, `"granted"` 만 통과, throw → fallback "error", 거부 → "denied"(motion-input.ts:121-137,289-310). 실패·권한 API 없는 웹뷰에서 **리슨 후 1200ms 안에 유효 이벤트 0개면 "silent" 폴백**(`SENSOR_PROBE_MS`, :133) → pointer 모드 + 안내문(Shake.tsx:90-93). 센서 불가 판정 `detectMotionSupport()`: `"DeviceMotionEvent" in window` 없으면 `none` → pointer(:143-148).
- **헤드리스/데스크톱 Chromium 에는 `DeviceMotionEvent` 가 없다**(기존 하네스 실측: scripts/verify-jipyeong-motion-input.mjs:59-64). 그냥 열면 처음부터 pointer 모드(= '꾹 눌러' 화면). **센서 모드(`motion-start` 버튼이 보이는 안내 화면)를 찍으려면 페이지 로드 전에 `addInitScript` 로 shim 필요**: `window.DeviceMotionEvent = class extends Event{constructor(t,i){super(t,i);this.acceleration=i?.acceleration??null;this.accelerationIncludingGravity=i?.accelerationIncludingGravity??null;this.rotationRate=null;this.interval=16}}` (iOS 경로를 보이려면 `DeviceMotionEvent.requestPermission = async()=>"granted"` 추가). 서버 렌더는 항상 pointer(`getServerSupport`=none)이고 수화 뒤 `useSyncExternalStore` 로 바뀐다(Shake.tsx:104-110).
- **이벤트 주입 값**(기존 하네스 레시피 scripts/jipyeong-step9-shots.mjs:48-64,70-77): 클릭(`motion-start`) 직후 **1.2초 안에** 60Hz(16.7ms)로 계속 dispatch. 흔드는 프레임: `a = amp·sin(2π·f·t)`, `f≈3.6Hz`, `amp` **10~18 m/s²**(임계 4 의 2.5배 이상; 18 이면 세기 1.0 포화) → `new DeviceMotionEvent("devicemotion",{accelerationIncludingGravity:{x:a,y:-9.81,z:0}, acceleration:{x:a,y:0,z:0}})`. 정지 프레임은 `amp 0`(AIG `{0,-9.81,0}`, acceleration 0)을 **계속 흘려야** 한다(핸들러가 이벤트 도착 시에만 off 판정, 1.2s 프로브도 이 이벤트로 통과). 원하는 초만큼 흔든 뒤 amp 0 이벤트를 ≥1.9s(350ms+1.5s) 흘리면 done → 600ms 뒤 결과.
- **애니메이션 방식**: 병·액체는 **canvas 2D + SVG 레이어, rAF**(BottleHero.tsx:153,230,868-887 · liquid-engine.ts, 커스텀 진자 액체 · WebGL 아님). 게이지·타이머 숫자는 rAF 안 ref 로 직접 DOM 갱신(리렌더 없음). 화면 전환은 framer-motion(translate 24px + opacity, 0.32s, JipyeongShake.tsx:222-230). 결과 화면은 rAF 카운트업(`SEC_DELAY 100ms + SEC_DUR 600ms`, TypeResult.tsx:60-61,98-117) + CSS reveal(`--jp-reveal-ms:360ms`, jipyeong.css:73). 사운드는 WebAudio(ui/shake-audio.ts, sfx m4a). Lottie·video 아님.
- **연출 길이** = 흔든 길이(0~5s, mix 0→1) + 정착 0.6s + 전환 0.32s + 결과 카운트 0.7s + reveal. 6초 상한 seq 면 "흔들기 4s → 결과 첫 장면" 정도.
- **시계 제어 주의**: 세션 로직이 `performance.now`·`setTimeout`·rAF 를 쓰므로 `page.clock.install`(+`runFor`) 로 멈추고 1/60초씩 진행해도 일관된다(핸들러·세션 모두 같은 시계). 액체 난수는 `window.__jpLiquidSeed = <숫자>`(addInitScript)로 고정 가능(liquid-engine.ts:209-212, 프로덕션엔 없음 → 프레임 재현성 확보용). 병 렌더 시작 각도도 시드 모드에서 고정(BottleHero.tsx:532). 퍼포먼스 게이트가 저fps 에서 파티클을 줄이므로(ui/perf-gate.ts) 시계 고정 캡처에서는 dt 가 정확히 1/60 이라 강등 없음.
- 디버그: `?debug=1` 이면 HUD(`data-jp="debug-hud"`)가 DOM 에 생긴다 — **촬영에서는 쓰지 않는다**(검증용으론 `shake-root.__jpSec` 에 elapsed 가 노출됨, Shake.tsx:195).
- pointer 모드 입력: `shake-area` 에 pointerdown 유지 = 입력 on, 놓음 = off(Shake.tsx:389-398,532-536). Playwright `mouse.down()`/시계 `runFor(ms)`/`mouse.up()` 으로 N초 흔들기 가능.

## 5. 테스트·관리자 계정
- **참여자 테스트 계정 없음**(문자 인증 번호 기반, 로그인 없음). 시안용 마스터 OTP `000000` 은 서버 `JIPYEONG_SIAN=1` 일 때만(otp-server.ts:83-85, otp/send:158-160). **운영에는 `JIPYEONG_SIAN` 없음**(docs/step28-report.md:12) → 라이브에서 000000 은 안 통한다. 어차피 종료 후 410.
- 관리자: 패스코드 1개 env `JIPYEONG_ADMIN_PASSCODE`(20자 랜덤, HMAC 상수시간 대조, J/admin/auth.ts:99-105; docs/step22-report.md:134). 값 위치: 레포 `.env.local`·Vercel production env·`references/deliveries/admin-access.txt`(600, 읽지 않음). **촬영에는 쓰지 않는다**(운영 admin = 실응모자 명단). 로컬 가짜 env 로 쿠키 발급(1절 4).
- 로그인 잠금: 기기 5회/IP 30회 실패 시 10분 잠금(auth.ts:48-58) → 운영 admin 에 틀린 값을 시도하지 말 것.

## 6. 쓰기 위험 (모두 `/jipyeong-shake/api/…`)
참여자 측:
| 메서드·경로 | 하는 일 | 종료 후 운영 동작 | 가짜 성공 응답(코드 근거) |
|---|---|---|---|
| POST `/api/otp/send` `{phone}` | jp_otp upsert + **SENS/SOLAPI 실발송** | 410 즉시(send:54) | `{"ok":true,"expiresAt":<now+300000>,"resendAfter":30}` — otp-server CODE_TTL_SEC=300, 사다리 [30,45,60,90,120] (otp.ts:36,64-68, send:150-158) |
| POST `/api/otp/verify` `{phone,code}` | jp_otp attempts 갱신, **서명 토큰 발급** | 410(verify:35) | `{"ok":true,"token":"01012345678.<exp초 정수, 미래>.<임의>"}` — 클라는 exp 만 검사(session.ts:51-55, otp.ts:104-108). 서명은 서버 entry 만 검증 |
| POST `/api/entry` | jp_entries insert/upsert(응모 저장) | 410(entry:60) | `{"ok":true,"duplicate":false,"entryId":"<uuid>","createdAt":"<ISO>","shortId":"<entryId 앞 8자 hex>","sig":"x"}` — 형태 검사 `confirmed()`(entry-client.ts:60-80), 응답 본문 api/entry/route.ts:190-200. 중복 화면용은 `duplicate:true` + 첫 응모 `createdAt` |
| POST `/api/client-error` (또는 sendBeacon) | jp_events 삽입, **JS 오류·저장 실패 보고** | 410 아님(쓰기 가능) | `{"ok":true}` 204 — ErrorCollector.tsx:22,89-90, entry-client.ts:171-190. **반드시 가로챈다**(sendBeacon 도 route 로 잡히는지 확인, 안 잡히면 `navigator.sendBeacon` 을 addInitScript 로 no-op) |
| GET·POST `/api/kakao-webhook` | jp_shares insert(서명 필요) | 종료 후 무기록 200 | 카카오 서버가 호출, 우리가 부를 일 없음 |
| **GET `/jipyeong-shake/video`** | **GET 인데 서버 쓰기**: `bumpVideoClicks()` RPC 로 클릭 카운터 증가 후 302(`JIPYEONG_VIDEO_URL`) | 종료 후에도 동작 | **절대 GET 하지 않는다**(video/route.ts:25-39, 랜딩 화면 버튼이 아니라 카톡 카드의 2번째 버튼 링크이므로 UI 클릭으로는 안 닿음) |
| GET `/api/health` | 비밀 헤더 없으면 401 | — | 부르지 않는다. (POST `?probe=solapi-send` 는 **실문자 발송**, health/route.ts:118) |

관리자 측(쓰기 라우트는 전부 `x-jp-admin: 1` 헤더 필요): POST `/api/admin/login`(DB 잠금 기록) · `/draw`(jp_draws·jp_winners insert) · `/draw/void` · `/exclude` · `/notify`(**당첨 문자 실발송**) · `/settings`(템플릿) · `/alert-phones` · `/alert-test`(**실문자**) · `/logout`. 조회 GET: `/overview` `/entries` `/flow` `/js-errors` `/otp-status`(SENS 조회 호출 가능) `/sms-providers` `/draw?week=` `/export`(CSV 다운로드, 전체 번호 포함). **읽기인데 POST 인 것**: `/draw`(추첨 실행이라 쓰기 맞음), `/alert-test`(문자 발송). 관리자 UI 의 '추첨 실행'·'발송'·'제외' 버튼은 촬영에서 누르지 않거나 가로채 `{ok:true}` 로 응답.

가로채기 한 줄: `page.route('**/jipyeong-shake/api/**', handler)` — GET 은 관리자 가짜 JSON, 그 외 모든 메서드는 위 표의 가짜 응답으로 fulfill 하고 카운트. 추가로 **`abort`**: `**/googletagmanager.com/**`(GTM-WGMV9QGQ, GoogleTagManager.tsx:22 → 운영 GA 오염 방지), `**/t1.kakaocdn.net/**`(카카오 SDK → 목 공유 경로), Google Fonts 등 외부는 필요 시.

## 7. 가림 대상
- **참여자 흐름**: 게이트에서 *우리가 입력하는* 이름·휴대폰은 가짜(예 `김○○`/`010-****-****` 표시용 가림 후 촬영: 입력값 자체를 가짜 번호로 넣고 찍기 직전 DOM 글자만 가림 규칙대로 치환). 완료 화면 `done-name`·`done-phone`(마스킹 `010-****-1234` 꼴이라 그대로도 뒷 4자리 노출 → `010-****-****` 로 치환) · 중복 화면 `done-line-1`. 인증 번호 OTP 6칸(`000000` 등 가짜).
- **관리자(로컬 가짜 데이터)**: 명단 `entry-row` 의 이름·번호(기본 마스킹 `maskPhone`, 펼치면 전체) · 당첨자 `winner-row`(이름·번호) · 검색창 · `alert-list`(장애 알림 번호) · `log` 항목 · 문자 템플릿 안의 링크(구글폼 URL) · 대시보드 숫자(가짜 값이면 shots.md 에 '가짜 값' 표기).
- **초대 링크 토큰**: UI 에 링크 문자열은 노출되지 않는다. `?ref=<8자 hex>`·`sig` 는 카톡 공유 payload/서버 응답에만 있음(share.ts:111-118) → 응답 가짜값이면 화면 영향 없음. 주소창 URL·`jp_ref` 가 캡처에 안 보이게 뷰포트만 캡처.
- **QR**: 지평 화면에 QR 없음(grep 0건). **머리/꼬리 연락처**: 푸터(`brand-footer`)는 슬로건 손글씨+"지평·생막걸리" 로고뿐, 전화·이메일·주소·SNS 없음. 유의사항(`landing-notice`·시트)에 회사명 "㈜ 지평주조 / ㈜ 마이마이비즈 / 유한회사 이프로애드" 와 "지평 인스타그램" 언급만 있고 연락처 숫자·URL 없음(data/notice.ts:16-55, event.ts `PRIZE_ANNOUNCE`) — 회사명은 공개 상호이므로 그대로. 개인정보 시트에 "주민등록번호" 라는 단어가 있으나 값은 없음(원문 그대로, 가림 불가·불필요; **정규식 pii_scan 은 숫자 형식만 검사하므로 통과**).
- 화면 속 도메인 글자: 랜딩/결과에는 없음. 운영 URL 로 캡처할 경우 주소창은 안 찍힘(뷰포트 캡처). 어드민 템플릿 기본문에 외부 구글폼 링크가 있으니 확인 후 치환(admin/win-sms.ts).

## 8. 사실 후보 (자막용)
1. **행사 기간 2026-09-17 ~ 10-30(6주, 마지막 주만 9일)** — J/data/event.ts:15,294-301.
2. **성격 유형 5종, 흔든 시간(0~5초)으로 결정** — J/data/shake-types.ts:48-172.
3. **초대장 카드 6종**(카톡 공유 카드도 6종 해시 파일) — J/data/messages.ts:25-32, data/share-cards.ts:17-24.
4. **주간 추첨: 매주 26명(1등 1·2등 5·3등 20), 총 156명(6주)** — 경품 `PRIZES`(event.ts:234-272: 추억 기록 키트 / 우정 티셔츠 / 지평 잔 세트, total 6·30·120). 추첨 알고리즘: SHA-256 시드 기반 **가중 비복원 추첨**, 가중치 = 1 + 카톡 전달 방 수(최대 10)(admin/draw.ts `weightFromRooms`·`drawWinners`, WEIGHT_MAX=10). 공개 문구 "Tip: 많이 공유할수록 당첨 확률 UP!"(event.ts `PRIZE_TIP`). 당첨 발표는 매주 월요일(`PRIZE_ANNOUNCE`).
5. **인증 문자 3,298건(수신 성공 3,249·실패 49)과 당첨 문자 234건(성공 223·실패 11)** — PROGRESS.md:33 (SMS-PROOF-3.1, 읽기 전용 확인서, SENS 원본 기준; 제출용 증빙은 `references/deliveries/sms-proof-20261102-v3.1/`). 같은 번호 재발송 포함 수치이고 "고유 응모자 수" 는 아님.
6. **응모 완료 2,319명(CMS 기준)** — docs/specs/sms-proof.md:4,31 (대표 메시지 인용값, 우리 DB 로 재검증하지 않음 → 자막 사용 전 **'미확인' 처리하고 사용자 확인 필요**). 대안 근거: PROGRESS.md:75 "고유 번호 2,466(인증 받은 번호, 10/02 시점)".
7. **한 번 흔들기 = 최대 5초, 누적 시간 판정** — shake-types.ts:14, useShakeSession.ts:38.
8. **1인 1회(휴대폰 번호 unique)·만 19세 이상·문자 인증 필수** — J/JipyeongShake.tsx:115 주석("1인 1회는 서버의 phone unique"), event.ts:18 `EVENT_AGE_LIMIT`, entry 라우트.
9. **개인정보 파기일 2026-11-30** — event.ts:318(운영 어드민 상단에도 고정 표시, AdminBoard.tsx:229).
10. 참여 수(`jp_entries` 최종 행 수): **미확인**(DB 쿼리 금지). 리포트에 총계 문서 없음.

## 9. 브랜드
- 주색: `--jp-blue: #12345f`(J/jipyeong.css:25, 팩샷 잉크 평균 실측, references/jipyeong-design-tokens.md) · 딥 `--jp-blue-deep #0d2347`(:27) · 소프트 `--jp-blue-soft #3d5e9e`(:29) · 배경 `--jp-white #fafaf7`(:31) · 카드 `--jp-cream #f3efe6`(:33) · 본문 `--jp-ink #1a1a1a`(:35). (CLAUDE.md 의 `#C81E3A` 는 빌더/마케팅 포인트색이라 지평과 무관 — 혼동 주의.)
- 폰트: 본문 **Pretendard Variable**(self-host, src/components/event/pretendard-fonts.css, jipyeong.css:40) · 마루 부리 **MaruBuri** SemiBold/Light 서브셋(`public/jipyeong/fonts/MaruBuri-*.subset.woff2`, jipyeong.css:184-202, 헤드·타이틀 `.jp-serif`) · 포인트 붓글씨 **Nanum Brush Script**(next/font, layout.tsx 의 `--font-jip-brush`) — 슬로건은 작가 손글씨 이미지.
- 로고 원본: `public/jipyeong/img/logo-jipyeong.svg`·`.png`, `logo-saengmakgeolli.svg`·`.png`(지평·생막걸리 로고타입), 손글씨 타이틀 `title-handwriting.svg`·`.png`·`title-handwriting-white.png`("흔들면 이야기가 시작된다").
- 히어로·제품: `public/jipyeong/img/hero-product.png`(콜라보 팩샷), 병 분해 레이어 `public/jipyeong/img/bottle/{body,label,highlight,shadow,cap}.png`, 경품 `prize-1..3.jpg`, 유형 코너 `type-{hype,story,cheers,balance,calm}.png`, 초대장 `card-1..6.jpg`(+thumb, art), 카톡 공유 카드 `img/share/card-*-<hash>.png`(800×400), 완료 일러스트 `done-illust.png`, 양조장 장식 `img/deco/*.png`. 라이선스 메모: `public/jipyeong/img/LICENSES.md`(**현재 파일은 저해상 임시본, 클라 원본 수령 시 교체 전제** — 215×1580·≤313px 파생이라 큰 확대 금지; 원본 R2 팩은 references/jipyeong-assets-r2/ 에 있음, 읽지 않음).
- **영상: 레포 안 파일 없음**. 협업 영상은 서버 env `JIPYEONG_VIDEO_URL` 이 가리키는 외부 주소(유튜브 추정)로 `/jipyeong-shake/video` 가 302(video/route.ts, event.ts `SHARE_CARD.videoPath`) — GET 시 클릭 카운터가 오르므로 호출 금지. 소리: `public/jipyeong/sfx/{splash,slosh-loop,bubbles}.m4a`.

## 10. 다른 세션 점유 (조사 시각 읽기만)
- `git worktree list`(공유 .git 기준): `/home/dev/maimai-event-builder [main]` + 같은 레포의 `.claude/worktrees/agent-*` 8개(전부 locked) + `/home/dev/maimai-jipyeong [jipyeong]`. `/home/dev/maimai-posco`·`maimai-kgf` 는 목록에 없음(별도 clone 으로 보임). `maimai-jipyeong` 은 다른 세션이 쓰는 작업 폴더 — 브랜치 `jipyeong` 이 거기 체크아웃돼 있으므로 worktree 는 `--detach`. `git status --short` 는 깨끗(출력 없음).
- `ss -ltnH` 리슨 포트: 22 53 111 3311 3312 3475 3491 3493 5432 8443 8781 8782 17510 34867 38791 39353 44351 45565 54321 54322 54324 55421 55422 55424 55931 55932 56342 60585. (3311·3312 등 3xxx 대는 남의 것일 수 있음 — 건드리지 않음.)
- 빈 포트 확인(조사 시점): 3000·3001·3002·3100·3200·3300·3400·3500·4310·4311·4312 전부 free. 추천 **4310(고객 서버)**·4311(예비). 지평 하네스 기본 목 포트는 3002.
- 메모리: 가용 약 20GB(free -g available 20 / total 46). 빌드는 `nice -n 10`·하나씩. `.next`(74M)·node_modules(1.1G) 는 원 폴더 것 — 건드리지 않고 새로 만든다.

## 11. 명세와 코드가 다른 점
1. **순서**: 명세 "랜딩→19세→문자 인증→흔들기 안내→흔드는 중→…" 인데 실제는 **랜딩→흔들기 안내→흔드는 중→(섞임)→결과→19세/동의→문자 인증→초대장→완료**. 문자 인증이 흔들기 뒤(STEP21). 흔들기 앞 화면에는 입력 요소가 하나도 없다.
2. **'만 19세 확인'은 별도 화면이 아니다**: 게이트 스텝 1 의 체크박스 한 줄("만 19세 이상입니다", 생년월일 입력 없음).
3. **'막걸리 섞이는 연출'은 별도 화면이 아니다**: 흔드는 중과 같은 화면의 병 액체 연출(mix=시간/5s)이고, 끝나면 600ms 정착 후 결과로 전환.
4. **'꾹 눌러 참여' 화면**: 그 이름의 화면은 없다. 문구는 "병을 꾹 눌러 진행하기"(폴백 링크)·"기기를 흔들거나, 병을 꾹 눌러 흔들어 주세요"(pointer 모드 pill). 센서 없는 환경(헤드리스·PC)에서는 흔들기 안내 화면 없이 곧바로 이 pointer 모드로 열린다.
5. **'공유 화면'**: 카톡 공유창은 SDK 가 있을 때만 뜨는 외부 UI(캡처 불가·키 없으면 목). 우리 화면으로 찍을 수 있는 것은 초대장 고르기(MessagePick)와 완료(Done)다.
6. **성격 유형·초대장 결과의 직접 진입 불가**(URL/쿼리 없음) — 유형별 결과는 실제로 그 길이만큼 흔들어야 만들어진다.
7. **행사 종료의 효과**: 명세는 "운영 화면이 닫혔으면 로컬 가짜"인데, 실제로는 랜딩·흔들기·결과는 라이브가 그대로 열려 있고 게이트·API 만 종료로 막힌다. 다만 **가짜 데이터 로컬 모드가 코드에 없고, 로컬도 운영 DB 를 본다** — 가짜 env(Supabase 미지정)+page.route 로 직접 구성해야 한다.
8. **'데스크톱 주간 추첨 관리자'는 `/jipyeong-shake/admin` 의 탭 `추첨`**, 응모자 목록은 탭 `명단`. 운영 admin 은 패스코드 필요·실응모자 포함이라 라이브 촬영 불가.
9. **게이트 종료 문구가 클라 시계로 결정됨**(Gate.tsx:305) → 촬영 시 시계를 10/30 이전으로 두지 않으면 게이트 화면이 닫힌 상태로 찍힌다(코드에 없는 화면을 만들지 않으려면 시계 고정이 정상 경로).
10. 헤드리스 Chromium 에는 `DeviceMotionEvent` 가 없어 **shim 을 addInitScript 로 넣어야** 센서 모드가 켜진다(명세의 "devicemotion 이벤트 주입"만으로는 부족).
11. 참여 수 근거 불일치: 문서 내 수치 2,319(CMS, sms-proof.md) / 2,466(번호) / 3,298(문자) 가 서로 다른 정의 — 자막에는 정의를 명시하거나 '미확인'.
12. 명세 `<가림 규칙>` 의 '머리·꼬리 대표번호·이메일·SNS' 는 지평 화면에 해당 없음(7절). '화면 속 도메인·URL 글자'도 참여자 화면에는 없음.

# posco shots

- 운영 URL 은 `https://mai-eventic.com/posco-ox` 의 종료 안내 화면 2장(closed-notice)만 GET 으로 열었다(session 은 가짜 응답으로 가로챔, 비GET 0). 나머지는 모두 로컬 사본(레포 main 27e9e64d 의 git archive, tmp/posco-src, 가짜·도달 불가 Supabase/DB 값, next start 127.0.0.1:3207)이며 /api/posco/** 응답은 전부 가짜 JSON(응답 모양 근거 RECON.md §5-3)이다.
- 로그인 POST 는 하지 않았다(운영 쿠키는 사본의 임의 시크릿으로 직접 서명). 허용한 비GET 0.
- 모든 PNG 옆 같은 이름 .json: 요소·글자·scrollY·뷰포트·pii_scan(total 0)·가로챈 요청. 사본 빌드는 NEXT_PUBLIC_SUPABASE_* 가짜 값을 환경변수로 넘겨 만들었다.


## desktop

- `desktop/closed-notice-full.png` — 운영 /posco-ox 행사 종료 안내("행사 종료 · 이벤트가 종료되었습니다") — 운영 mai-eventic.com 의 HTML·정적 자산만 GET. /api/posco/session 은 운영 실응답과 같은 모양(event.state=closed)의 가짜로 대체(DB 읽기 없음), 나머지 API 는 404 가짜. 가림 없음(개인정보 0). [끝까지 스크롤한 전체]
- `desktop/closed-notice-view.png` — 운영 /posco-ox 행사 종료 안내("행사 종료 · 이벤트가 종료되었습니다") — 운영 mai-eventic.com 의 HTML·정적 자산만 GET. /api/posco/session 은 운영 실응답과 같은 모양(event.state=closed)의 가짜로 대체(DB 읽기 없음), 나머지 API 는 404 가짜. 가림 없음(개인정보 0). [첫 화면]
- `desktop/ops-board-full.png` — 운영 현황판 /posco-ox/ops — 실시간 지표(참여·완료·수령·설문) — 로컬 사본 + 행사 최종 보고서 집계값(2026-09-18 스냅샷)을 가짜 ops/stats 응답으로 주입. 운영 쿠키는 사본 서버의 임의 시크릿으로 직접 서명(로그인·PIN 미사용). 가짜 값. [끝까지 스크롤한 전체]
- `desktop/ops-board-view.png` — 운영 현황판 /posco-ox/ops — 실시간 지표(참여·완료·수령·설문) — 로컬 사본 + 행사 최종 보고서 집계값(2026-09-18 스냅샷)을 가짜 ops/stats 응답으로 주입. 운영 쿠키는 사본 서버의 임의 시크릿으로 직접 서명(로그인·PIN 미사용). 가짜 값. [첫 화면]
- `desktop/ops-stock-full.png` — 운영 현황판 — 일자별 경품 배분(재고 그리드) — 같은 가짜 스냅샷. 가짜 값. [끝까지 스크롤한 전체]
- `desktop/ops-stock-view.png` — 운영 현황판 — 일자별 경품 배분(재고 그리드) — 같은 가짜 스냅샷. 가짜 값. [첫 화면]
- `desktop/ops-survey-full.png` — 운영 설문 집계 화면 — 보고서 집계값·가짜 자유서술. 가짜 값. [끝까지 스크롤한 전체]
- `desktop/ops-survey-view.png` — 운영 설문 집계 화면 — 보고서 집계값·가짜 자유서술. 가짜 값. [첫 화면]
- `desktop/ops-winners-full.png` — 운영 당첨자 목록 /posco-ox/ops/winners — 행 단위 명단은 가짜(이름 ○ 가림 꼴, 전화 010-****-****, 확인코드는 형식만 실제 규칙). 가짜 값. [끝까지 스크롤한 전체]
- `desktop/ops-winners-view.png` — 운영 당첨자 목록 /posco-ox/ops/winners — 행 단위 명단은 가짜(이름 ○ 가림 꼴, 전화 010-****-****, 확인코드는 형식만 실제 규칙). 가짜 값. [첫 화면]

## media

- `media/floorplan.webp` — 전시관 평면도 — 레포 원본 복사
- `media/hero-globe.webp` — 히어로 지구본 — 레포 원본 복사
- `media/og-image.png` — OG 이미지 — 레포 원본 복사
- `media/posco-logo.png` — 로고 PNG(2048폭 투명) — 위 SVG 를 브라우저 렌더로 변환, 새로 그리지 않음
- `media/posco-logo.svg` — 로고 원본 — 레포 public/posco/posco-logo.svg 복사
- `media/prize-coffee-v2.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/prize-fan-v2.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/prize-umbrella-v2.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-carbon-header.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-carbon.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-hyrex-header.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-hyrex.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-kgx-header.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-kgx.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-steel-header.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-steel.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-synergy-header-v2.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)
- `media/zone-synergy.webp` — 레포 public/ 원본 이미지 복사(구역·경품·평면도 등)

## mobile

- `mobile/claim-coffee-full.png` — 수령 화면 /posco-ox/claim/<토큰> — 수령 전(커피) — 가짜 토큰(임의 hex)·가짜 claim GET 응답. 쿠폰 이미지는 직접 만든 샘플 기프티콘(tmp/posco-fake-coupon.png, "SAMPLE"·"촬영용 가짜 쿠폰" 표기, 실쿠폰 아님). 이 화면만 lib 의 qr 가림을 껐다(샘플 쿠폰 data URL 의 base64 가 qr 힌트 정규식에 오탐돼 이미지가 가려졌음 · 실제 QR·바코드 없음). [끝까지 스크롤한 전체]
- `mobile/claim-coffee-view.png` — 수령 화면 /posco-ox/claim/<토큰> — 수령 전(커피) — 가짜 토큰(임의 hex)·가짜 claim GET 응답. 쿠폰 이미지는 직접 만든 샘플 기프티콘(tmp/posco-fake-coupon.png, "SAMPLE"·"촬영용 가짜 쿠폰" 표기, 실쿠폰 아님). 이 화면만 lib 의 qr 가림을 껐다(샘플 쿠폰 data URL 의 base64 가 qr 힌트 정규식에 오탐돼 이미지가 가려졌음 · 실제 QR·바코드 없음). [첫 화면]
- `mobile/claim-fan-done-full.png` — 수령 완료 화면(선풍기, 직원 PIN 확인 뒤) — 가짜 confirm 응답. PIN 은 입력 화면 연출용 가짜 숫자. [끝까지 스크롤한 전체]
- `mobile/claim-fan-done-view.png` — 수령 완료 화면(선풍기, 직원 PIN 확인 뒤) — 가짜 confirm 응답. PIN 은 입력 화면 연출용 가짜 숫자. [첫 화면]
- `mobile/claim-fan-full.png` — 수령 화면 — 수령 전(선풍기) — 가짜 claim GET 응답. [끝까지 스크롤한 전체]
- `mobile/claim-fan-view.png` — 수령 화면 — 수령 전(선풍기) — 가짜 claim GET 응답. [첫 화면]
- `mobile/claim-umbrella-done-full.png` — 수령 완료 화면(우산) — 가짜 confirm 응답. [끝까지 스크롤한 전체]
- `mobile/claim-umbrella-done-view.png` — 수령 완료 화면(우산) — 가짜 confirm 응답. [첫 화면]
- `mobile/claim-umbrella-full.png` — 수령 화면 — 수령 전(우산) — 가짜 claim GET 응답. [끝까지 스크롤한 전체]
- `mobile/claim-umbrella-view.png` — 수령 화면 — 수령 전(우산) — 가짜 claim GET 응답. [첫 화면]
- `mobile/closed-notice-full.png` — 운영 /posco-ox 행사 종료 안내 모바일 — 위와 같은 방식(운영 HTML GET + 가짜 session). [끝까지 스크롤한 전체]
- `mobile/closed-notice-view.png` — 운영 /posco-ox 행사 종료 안내 모바일 — 위와 같은 방식(운영 HTML GET + 가짜 session). [첫 화면]
- `mobile/code-full.png` — 인증번호 통과 직후 화면(인증 성공 상태, 존 안내 진입 시점 — zoning 과 비슷한 장면) — 가짜 otp 응답. 입력값 가림. [끝까지 스크롤한 전체]
- `mobile/code-view.png` — 인증번호 통과 직후 화면(인증 성공 상태, 존 안내 진입 시점 — zoning 과 비슷한 장면) — 가짜 otp 응답. 입력값 가림. [첫 화면]
- `mobile/draw-wait-full.png` — 경품 추첨 대기 화면(추첨 버튼 노출) — 가짜 draw 응답(커피 등급). 가짜 값. [끝까지 스크롤한 전체]
- `mobile/draw-wait-view.png` — 경품 추첨 대기 화면(추첨 버튼 노출) — 가짜 draw 응답(커피 등급). 가짜 값. [첫 화면]
- `mobile/end-coffee-full.png` — 당첨 후 문자 안내 화면(커피) — 가짜 notify-win 성공 응답. 이름 김○○. [끝까지 스크롤한 전체]
- `mobile/end-coffee-view.png` — 당첨 후 문자 안내 화면(커피) — 가짜 notify-win 성공 응답. 이름 김○○. [첫 화면]
- `mobile/end-fan-full.png` — 당첨 후 문자 안내 화면(선풍기) — 가짜 notify-win 성공 응답. [끝까지 스크롤한 전체]
- `mobile/end-fan-view.png` — 당첨 후 문자 안내 화면(선풍기) — 가짜 notify-win 성공 응답. [첫 화면]
- `mobile/end-umbrella-full.png` — 당첨 후 문자 안내 화면(우산) — 가짜 notify-win 성공 응답. [끝까지 스크롤한 전체]
- `mobile/end-umbrella-view.png` — 당첨 후 문자 안내 화면(우산) — 가짜 notify-win 성공 응답. [첫 화면]
- `mobile/landing-full.png` — 참여자 랜딩 = 참여 정보 입력 첫 화면(이름·휴대번호·동의, 스크롤 0) — 로컬 사본, 시계 고정, API 전부 가짜 200. 이름·전화 입력칸은 저장 직전 가림(김○○ / 010-****-****). [끝까지 스크롤한 전체]
- `mobile/landing-view.png` — 참여자 랜딩 = 참여 정보 입력 첫 화면(이름·휴대번호·동의, 스크롤 0) — 로컬 사본, 시계 고정, API 전부 가짜 200. 이름·전화 입력칸은 저장 직전 가림(김○○ / 010-****-****). [첫 화면]
- `mobile/mission-full.png` — 미션 안내 화면 — —. [끝까지 스크롤한 전체]
- `mobile/mission-view.png` — 미션 안내 화면 — —. [첫 화면]
- `mobile/prize-coffee-full.png` — 당첨 카드 — 아메리카노 커피(steel) — 가짜 확인코드 HTN-6238(형식만 실제 규칙). [끝까지 스크롤한 전체]
- `mobile/prize-coffee-view.png` — 당첨 카드 — 아메리카노 커피(steel) — 가짜 확인코드 HTN-6238(형식만 실제 규칙). [첫 화면]
- `mobile/prize-fan-full.png` — 당첨 카드 — 선풍기(blue) — 가짜 확인코드 PWR-3925. [끝까지 스크롤한 전체]
- `mobile/prize-fan-view.png` — 당첨 카드 — 선풍기(blue) — 가짜 확인코드 PWR-3925. [첫 화면]
- `mobile/prize-umbrella-full.png` — 당첨 카드 — 우산(gold) — 가짜 확인코드 KXM-4827. [끝까지 스크롤한 전체]
- `mobile/prize-umbrella-view.png` — 당첨 카드 — 우산(gold) — 가짜 확인코드 KXM-4827. [첫 화면]
- `mobile/quiz-full.png` — OX 퀴즈 화면 — 가짜 quiz/answer 응답. [끝까지 스크롤한 전체]
- `mobile/quiz-view.png` — OX 퀴즈 화면 — 가짜 quiz/answer 응답. [첫 화면]
- `mobile/survey-full.png` — 설문 마지막 문항(Q5 자유서술, 입력 후) — 가짜 survey/submit 응답. 입력은 샘플 문장. [끝까지 스크롤한 전체]
- `mobile/survey-view.png` — 설문 마지막 문항(Q5 자유서술, 입력 후) — 가짜 survey/submit 응답. 입력은 샘플 문장. [첫 화면]
- `mobile/zoning-full.png` — 존 안내 화면(탄소·수소·철강·시너지·KGX 구역 소개) — 로컬 사본. 이미지는 레포 원본. 전화 표기 치환 8건. [끝까지 스크롤한 전체]
- `mobile/zoning-view.png` — 존 안내 화면(탄소·수소·철강·시너지·KGX 구역 소개) — 로컬 사본. 이미지는 레포 원본. 전화 표기 치환 8건. [첫 화면]

## seq

- `seq/draw-reveal-first.png` — 추첨 연출(스캔 → 블룸 → 플래시 → 카드) 4.0초 — page.clock 1/60초씩 runFor + getAnimations 동기, 프레임마다 스크린샷(240프레임·60fps·CRF 12). 가짜 draw 응답. [영상 첫 프레임]
- `seq/draw-reveal-last.png` — 추첨 연출(스캔 → 블룸 → 플래시 → 카드) 4.0초 — page.clock 1/60초씩 runFor + getAnimations 동기, 프레임마다 스크린샷(240프레임·60fps·CRF 12). 가짜 draw 응답. [영상 마지막 프레임]
- `seq/draw-reveal.mp4` — 추첨 연출(스캔 → 블룸 → 플래시 → 카드) 4.0초 — page.clock 1/60초씩 runFor + getAnimations 동기, 프레임마다 스크린샷(240프레임·60fps·CRF 12). 가짜 draw 응답.
- `seq/quiz-correct-first.png` — OX 퀴즈 정답 선택 → 판정 → 정답 피드백 시트 2.4초 — page.clock 1/60초 동기 녹화(144프레임). 가짜 응답. [영상 첫 프레임]
- `seq/quiz-correct-last.png` — OX 퀴즈 정답 선택 → 판정 → 정답 피드백 시트 2.4초 — page.clock 1/60초 동기 녹화(144프레임). 가짜 응답. [영상 마지막 프레임]
- `seq/quiz-correct.mp4` — OX 퀴즈 정답 선택 → 판정 → 정답 피드백 시트 2.4초 — page.clock 1/60초 동기 녹화(144프레임). 가짜 응답.

## states

- `states/draw-reveal/01-wait.png` — 추첨 흐름 4단계: 대기 → 스캔 → 블룸 → 당첨 카드 — 같은 뷰포트·scrollY. 가짜 draw 응답.
- `states/draw-reveal/02-scan.png` — 추첨 흐름 4단계: 대기 → 스캔 → 블룸 → 당첨 카드 — 같은 뷰포트·scrollY. 가짜 draw 응답.
- `states/draw-reveal/03-bloom.png` — 추첨 흐름 4단계: 대기 → 스캔 → 블룸 → 당첨 카드 — 같은 뷰포트·scrollY. 가짜 draw 응답.
- `states/draw-reveal/04-prize.png` — 추첨 흐름 4단계: 대기 → 스캔 → 블룸 → 당첨 카드 — 같은 뷰포트·scrollY. 가짜 draw 응답.
- `states/quiz-correct/01-asking.png` — 퀴즈 정답 흐름 3단계 — 같은 scrollY. 가짜 응답.
- `states/quiz-correct/02-picked.png` — 퀴즈 정답 흐름 3단계 — 같은 scrollY. 가짜 응답.
- `states/quiz-correct/03-correct-feedback.png` — 퀴즈 정답 흐름 3단계 — 같은 scrollY. 가짜 응답.
- `states/quiz-wrong/01-asking.png` — 퀴즈 오답 흐름 4단계(재도전 포함) — 같은 scrollY. 가짜 응답.
- `states/quiz-wrong/02-picked.png` — 퀴즈 오답 흐름 4단계(재도전 포함) — 같은 scrollY. 가짜 응답.
- `states/quiz-wrong/03-wrong-feedback.png` — 퀴즈 오답 흐름 4단계(재도전 포함) — 같은 scrollY. 가짜 응답.
- `states/quiz-wrong/04-retry.png` — 퀴즈 오답 흐름 4단계(재도전 포함) — 같은 scrollY. 가짜 응답.
- `states/staff-pin-fan/01-unclaimed.png` — 직원 PIN 수령 흐름 6단계(선풍기) — 가짜 confirm 응답. PIN 칸은 가짜 숫자.
- `states/staff-pin-fan/02-pin-sheet.png` — 직원 PIN 수령 흐름 6단계(선풍기) — 가짜 confirm 응답. PIN 칸은 가짜 숫자.
- `states/staff-pin-fan/03-pin-partial.png` — 직원 PIN 수령 흐름 6단계(선풍기) — 가짜 confirm 응답. PIN 칸은 가짜 숫자.
- `states/staff-pin-fan/04-pin-filled.png` — 직원 PIN 수령 흐름 6단계(선풍기) — 가짜 confirm 응답. PIN 칸은 가짜 숫자.
- `states/staff-pin-fan/05-holding.png` — 직원 PIN 수령 흐름 6단계(선풍기) — 가짜 confirm 응답. PIN 칸은 가짜 숫자.
- `states/staff-pin-fan/06-claimed-popup.png` — 직원 PIN 수령 흐름 6단계(선풍기) — 가짜 confirm 응답. PIN 칸은 가짜 숫자.
- `states/staff-pin-umbrella/01-unclaimed.png` — 직원 PIN 수령 흐름 6단계(우산) — 가짜 confirm 응답.
- `states/staff-pin-umbrella/02-pin-sheet.png` — 직원 PIN 수령 흐름 6단계(우산) — 가짜 confirm 응답.
- `states/staff-pin-umbrella/03-pin-partial.png` — 직원 PIN 수령 흐름 6단계(우산) — 가짜 confirm 응답.
- `states/staff-pin-umbrella/04-pin-filled.png` — 직원 PIN 수령 흐름 6단계(우산) — 가짜 confirm 응답.
- `states/staff-pin-umbrella/05-holding.png` — 직원 PIN 수령 흐름 6단계(우산) — 가짜 confirm 응답.
- `states/staff-pin-umbrella/06-claimed-popup.png` — 직원 PIN 수령 흐름 6단계(우산) — 가짜 confirm 응답.
- `states/survey/01-q1-choice.png` — 설문 흐름 5단계(Q1 선택 → Q2 척도 → Q5 자유서술 빈/입력) — 같은 scrollY. 가짜 survey/submit.
- `states/survey/02-q1-picked.png` — 설문 흐름 5단계(Q1 선택 → Q2 척도 → Q5 자유서술 빈/입력) — 같은 scrollY. 가짜 survey/submit.
- `states/survey/03-q2-scale.png` — 설문 흐름 5단계(Q1 선택 → Q2 척도 → Q5 자유서술 빈/입력) — 같은 scrollY. 가짜 survey/submit.
- `states/survey/04-q5-empty.png` — 설문 흐름 5단계(Q1 선택 → Q2 척도 → Q5 자유서술 빈/입력) — 같은 scrollY. 가짜 survey/submit.
- `states/survey/05-q5-typed.png` — 설문 흐름 5단계(Q1 선택 → Q2 척도 → Q5 자유서술 빈/입력) — 같은 scrollY. 가짜 survey/submit.
- `states/verify-code/01-empty.png` — 문자 인증 흐름 5단계(빈 → 동의 → 코드 빈/일부/인증됨) — 입력값은 가림(김○○·010-****-****), 가짜 otp 응답.
- `states/verify-code/02-filled-consent.png` — 문자 인증 흐름 5단계(빈 → 동의 → 코드 빈/일부/인증됨) — 입력값은 가림(김○○·010-****-****), 가짜 otp 응답.
- `states/verify-code/03-code-empty.png` — 문자 인증 흐름 5단계(빈 → 동의 → 코드 빈/일부/인증됨) — 입력값은 가림(김○○·010-****-****), 가짜 otp 응답.
- `states/verify-code/04-code-partial.png` — 문자 인증 흐름 5단계(빈 → 동의 → 코드 빈/일부/인증됨) — 입력값은 가림(김○○·010-****-****), 가짜 otp 응답.
- `states/verify-code/05-verified.png` — 문자 인증 흐름 5단계(빈 → 동의 → 코드 빈/일부/인증됨) — 입력값은 가림(김○○·010-****-****), 가짜 otp 응답.
- `states/winners-filter/01-all.png` — 운영 당첨자 필터 흐름 4단계(전체 → 2일차 → 철강 → 미수령) — 가짜 명단(이름 가림 꼴).
- `states/winners-filter/02-day2.png` — 운영 당첨자 필터 흐름 4단계(전체 → 2일차 → 철강 → 미수령) — 가짜 명단(이름 가림 꼴).
- `states/winners-filter/03-day2-steel.png` — 운영 당첨자 필터 흐름 4단계(전체 → 2일차 → 철강 → 미수령) — 가짜 명단(이름 가림 꼴).
- `states/winners-filter/04-day2-steel-unclaimed.png` — 운영 당첨자 필터 흐름 4단계(전체 → 2일차 → 철강 → 미수령) — 가짜 명단(이름 가림 꼴).

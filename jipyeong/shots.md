# jipyeong shots

- 참여자 화면(모바일 390×844·DSF3) — 운영 URL `jipyeong.mai-eventic.com/jipyeong-shake` 를 GET 으로만 열고 /api/**·GTM·카카오 SDK 는 가로챔, 시계 2026-10-20 14:00 KST 고정(행사 중 상태). 가림: 이름 입력·완료 화면 이름 김○○, 전화 010-****-****.
- 관리자(데스크톱 1440×900·DSF2) — 로컬 사본(커밋 7312f95c 의 git archive, 가짜 env·Supabase 변수 없음)에 jp_admin 쿠키(가짜 pepper 로 발급)와 가짜 응모자 JSON 을 넣은 화면. 모든 이름은 ○○ 가림 꼴, 전화는 010-****-****, 숫자·시각은 전부 가짜 값(실데이터 아님).
- 모든 PNG 옆 같은 이름 .json: 요소 사각형·글자·scrollY·뷰포트·pii_scan·가로챈 요청. pii_scan.total 은 전부 0.
- 가림 규칙은 lib 가 찍기 직전 DOM 글자를 바꾸고(MutationObserver) 저장 전·후 두 번 정규식 검사한다.

## 모바일

- `done-full.png` (mobile) — 완료 화면("응모 완료!") — 이름 김○○, 번호 010-****-**** 로 치환. 응모 API 는 가짜 성공 응답, 카카오 공유는 SDK 미적재 목 경로. [끝까지 스크롤한 전체]
- `done-view.png` (mobile) — 완료 화면("응모 완료!") — 이름 김○○, 번호 010-****-**** 로 치환. 응모 API 는 가짜 성공 응답, 카카오 공유는 SDK 미적재 목 경로. [첫 화면]
- `gate-consent-full.png` (mobile) — 게이트 스텝 1 — 동의(개인정보·만 19세 이상·마케팅) 체크 전 화면. [끝까지 스크롤한 전체]
- `gate-consent-view.png` (mobile) — 게이트 스텝 1 — 동의(개인정보·만 19세 이상·마케팅) 체크 전 화면. [첫 화면]
- `gate-otp-full.png` (mobile) — 게이트 스텝 3 — 인증번호 6칸(빈 칸, 재발송 카운트다운 표시). 문자 발송 API 는 가짜 성공 응답. [끝까지 스크롤한 전체]
- `gate-otp-view.png` (mobile) — 게이트 스텝 3 — 인증번호 6칸(빈 칸, 재발송 카운트다운 표시). 문자 발송 API 는 가짜 성공 응답. [첫 화면]
- `gate-phone-full.png` (mobile) — 게이트 스텝 2 — 이름·휴대폰 입력 후(입력값은 가짜, 화면 글자는 김○○ / 010-****-**** 로 치환). [끝까지 스크롤한 전체]
- `gate-phone-view.png` (mobile) — 게이트 스텝 2 — 이름·휴대폰 입력 후(입력값은 가짜, 화면 글자는 김○○ / 010-****-**** 로 치환). [첫 화면]
- `hold-to-join-full.png` (mobile) — '꾹 눌러 참여' 화면 — 안내 화면에서 폴백 링크를 눌러 들어간 pointer 모드(안내 pill "기기를 흔들거나, 병을 꾹 눌러 흔들어 주세요"). [끝까지 스크롤한 전체]
- `hold-to-join-view.png` (mobile) — '꾹 눌러 참여' 화면 — 안내 화면에서 폴백 링크를 눌러 들어간 pointer 모드(안내 pill "기기를 흔들거나, 병을 꾹 눌러 흔들어 주세요"). [첫 화면]
- `invite-1-full.png` (mobile) — 초대장 고르기 화면 — 카드 1번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [끝까지 스크롤한 전체]
- `invite-1-view.png` (mobile) — 초대장 고르기 화면 — 카드 1번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [첫 화면]
- `invite-2-full.png` (mobile) — 초대장 고르기 화면 — 카드 2번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [끝까지 스크롤한 전체]
- `invite-2-view.png` (mobile) — 초대장 고르기 화면 — 카드 2번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [첫 화면]
- `invite-3-full.png` (mobile) — 초대장 고르기 화면 — 카드 3번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [끝까지 스크롤한 전체]
- `invite-3-view.png` (mobile) — 초대장 고르기 화면 — 카드 3번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [첫 화면]
- `invite-4-full.png` (mobile) — 초대장 고르기 화면 — 카드 4번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [끝까지 스크롤한 전체]
- `invite-4-view.png` (mobile) — 초대장 고르기 화면 — 카드 4번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [첫 화면]
- `invite-5-full.png` (mobile) — 초대장 고르기 화면 — 카드 5번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [끝까지 스크롤한 전체]
- `invite-5-view.png` (mobile) — 초대장 고르기 화면 — 카드 5번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [첫 화면]
- `invite-6-full.png` (mobile) — 초대장 고르기 화면 — 카드 6번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [끝까지 스크롤한 전체]
- `invite-6-view.png` (mobile) — 초대장 고르기 화면 — 카드 6번 선택(미리보기 큰 카드 + 6종 썸네일 목록). [첫 화면]
- `landing-full.png` (mobile) — 랜딩(전체·첫 화면): 히어로 병 + CTA "지평생 흔들고 친구 소환하기"·경품 3종·유의사항. 가림 해당 없음. [끝까지 스크롤한 전체]
- `landing-view.png` (mobile) — 랜딩(전체·첫 화면): 히어로 병 + CTA "지평생 흔들고 친구 소환하기"·경품 3종·유의사항. 가림 해당 없음. [첫 화면]
- `result-balance-full.png` (mobile) — 결과 화면 — 성격 유형 "적당히 즐기는형"(흔든 기록 3.55초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [끝까지 스크롤한 전체]
- `result-balance-view.png` (mobile) — 결과 화면 — 성격 유형 "적당히 즐기는형"(흔든 기록 3.55초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [첫 화면]
- `result-calm-full.png` (mobile) — 결과 화면 — 성격 유형 "잔잔한 한잔형"(흔든 기록 5.00초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [끝까지 스크롤한 전체]
- `result-calm-view.png` (mobile) — 결과 화면 — 성격 유형 "잔잔한 한잔형"(흔든 기록 5.00초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [첫 화면]
- `result-cheers-full.png` (mobile) — 결과 화면 — 성격 유형 "건배 선동형"(흔든 기록 2.51초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [끝까지 스크롤한 전체]
- `result-cheers-view.png` (mobile) — 결과 화면 — 성격 유형 "건배 선동형"(흔든 기록 2.51초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [첫 화면]
- `result-hype-full.png` (mobile) — 결과 화면 — 성격 유형 "흥 폭발형"(흔든 기록 0.75초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [끝까지 스크롤한 전체]
- `result-hype-view.png` (mobile) — 결과 화면 — 성격 유형 "흥 폭발형"(흔든 기록 0.75초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [첫 화면]
- `result-story-full.png` (mobile) — 결과 화면 — 성격 유형 "이야기 보따리형"(흔든 기록 1.55초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [끝까지 스크롤한 전체]
- `result-story-view.png` (mobile) — 결과 화면 — 성격 유형 "이야기 보따리형"(흔든 기록 1.55초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음. [첫 화면]
- `shake-guide-full.png` (mobile) — 흔들기 안내(센서 지원 기기 가정: DeviceMotionEvent shim): "막걸리 흔들기 시작" 버튼과 "꾹 눌러 진행하기" 폴백 링크. [끝까지 스크롤한 전체]
- `shake-guide-view.png` (mobile) — 흔들기 안내(센서 지원 기기 가정: DeviceMotionEvent shim): "막걸리 흔들기 시작" 버튼과 "꾹 눌러 진행하기" 폴백 링크. [첫 화면]

## 데스크톱

- `admin-dash-full.png` (desktop) — 관리자 대시보드 탭 — 현황 숫자(가짜 값)·오늘 참여 흐름·인증번호 현황·최근 기록. 상단 "보유 기간 종료일 2026-11-30" 은 코드 상수. [끝까지 스크롤한 전체]
- `admin-dash-view.png` (desktop) — 관리자 대시보드 탭 — 현황 숫자(가짜 값)·오늘 참여 흐름·인증번호 현황·최근 기록. 상단 "보유 기간 종료일 2026-11-30" 은 코드 상수. [첫 화면]
- `admin-draw-full.png` (desktop) — 관리자 주간 추첨 탭 — W1 추첨 완료 상태: 당첨자 26명(1등 1·2등 5·3등 20, 이름 ○○ 꼴, 번호 010-****-****, 시드 앞 16자리는 가짜). [끝까지 스크롤한 전체]
- `admin-draw-view.png` (desktop) — 관리자 주간 추첨 탭 — W1 추첨 완료 상태: 당첨자 26명(1등 1·2등 5·3등 20, 이름 ○○ 꼴, 번호 010-****-****, 시드 앞 16자리는 가짜). [첫 화면]
- `admin-list-full.png` (desktop) — 관리자 명단 탭(응모자 목록) — 200행 가짜 응모자(이름 ○○ 꼴·번호 010-****-****·가짜 시각·유형·초대장). [끝까지 스크롤한 전체]
- `admin-list-view.png` (desktop) — 관리자 명단 탭(응모자 목록) — 200행 가짜 응모자(이름 ○○ 꼴·번호 010-****-****·가짜 시각·유형·초대장). [첫 화면]
- `admin-login-full.png` (desktop) — 관리자 로그인(패스코드 입력) 화면 — 쿠키 없는 첫 방문, 운영자 로그인 UI 그대로. 패스코드는 입력하지 않음. [끝까지 스크롤한 전체]
- `admin-login-view.png` (desktop) — 관리자 로그인(패스코드 입력) 화면 — 쿠키 없는 첫 방문, 운영자 로그인 UI 그대로. 패스코드는 입력하지 않음. [첫 화면]

## 상태 흐름

- `01-week-1-drawn.png` (states/admin-draw-week) — 추첨 주차 상태 흐름 ⑤ 1/3 W1(추첨 완료, 당첨자 표).
- `02-week-3-drawn.png` (states/admin-draw-week) — 추첨 주차 상태 흐름 ⑤ 2/3 W3(추첨 완료, 당첨자 표).
- `03-week-6-not-drawn.png` (states/admin-draw-week) — 추첨 주차 상태 흐름 ⑤ 3/3 W6("이 주차는 아직 추첨하지 않았어요", "추첨 실행" 버튼 — 누르지 않음).
- `01-unchecked.png` (states/gate-input) — 게이트 상태 흐름 ② 1/6 체크 전(전체 동의·필수 항목 모두 해제, "다음" 비활성).
- `02-age-checked.png` (states/gate-input) — 게이트 상태 흐름 ② 2/6 "만 19세 이상입니다" 만 체크.
- `03-all-agreed.png` (states/gate-input) — 게이트 상태 흐름 ② 3/6 전체 동의(모두 체크, "다음" 활성).
- `04-phone-entered.png` (states/gate-input) — 게이트 상태 흐름 ② 4/6 스텝 2 이름·번호 입력(가짜 입력, 글자는 김○○ / 010-****-****).
- `05-otp-requested.png` (states/gate-input) — 게이트 상태 흐름 ② 5/6 스텝 3 인증번호 칸(발송 후, 빈 칸). 발송 API 가짜 성공.
- `06-otp-verified.png` (states/gate-input) — 게이트 상태 흐름 ② 6/6 인증번호 000000 입력 → 인증 완료 체크("확인하고 초대장 고르기" 활성). 확인 API 가짜 성공.
- `01-sensor-guide.png` (states/hold-to-join) — 꾹 눌러 상태 흐름 ④ 1/3 센서 안내 화면.
- `02-pointer-mode.png` (states/hold-to-join) — 꾹 눌러 상태 흐름 ④ 2/3 폴백 링크 클릭 뒤 pointer 모드(안내 pill).
- `03-holding.png` (states/hold-to-join) — 꾹 눌러 상태 흐름 ④ 3/3 병을 누르고 있는 중(약 1.5초, 병이 흔들림·라벨 "섞는 중…").
- `01-card-1.png` (states/invite-cards) — 초대장 상태 흐름 ③ 1/6 카드 1번 선택(같은 scrollY 0, 큰 미리보기가 바뀜).
- `02-card-2.png` (states/invite-cards) — 초대장 상태 흐름 ③ 2/6 카드 2번 선택(같은 scrollY 0, 큰 미리보기가 바뀜).
- `03-card-3.png` (states/invite-cards) — 초대장 상태 흐름 ③ 3/6 카드 3번 선택(같은 scrollY 0, 큰 미리보기가 바뀜).
- `04-card-4.png` (states/invite-cards) — 초대장 상태 흐름 ③ 4/6 카드 4번 선택(같은 scrollY 0, 큰 미리보기가 바뀜).
- `05-card-5.png` (states/invite-cards) — 초대장 상태 흐름 ③ 5/6 카드 5번 선택(같은 scrollY 0, 큰 미리보기가 바뀜).
- `06-card-6.png` (states/invite-cards) — 초대장 상태 흐름 ③ 6/6 카드 6번 선택(같은 scrollY 0, 큰 미리보기가 바뀜).
- `01-guide.png` (states/shake-progress) — 흔들기 상태 흐름 ① 1/5 안내(흔들기 시작 전).
- `02-shaking-early.png` (states/shake-progress) — 흔들기 상태 흐름 ① 2/5 흔드는 중 초반(약 0.85초, 라벨 "섞는 중…", 게이지 스트라이프).
- `03-shaking-mid.png` (states/shake-progress) — 흔들기 상태 흐름 ① 3/5 흔드는 중 중반(약 2.2초, 병 액체가 섞이는 중).
- `04-mixing-late.png` (states/shake-progress) — 흔들기 상태 흐름 ① 4/5 섞임 연출 후반(약 3.8초, 병 기울어짐·액체 혼합 진행).
- `05-mix-done.png` (states/shake-progress) — 흔들기 상태 흐름 ① 5/5 누적 5초 도달 직후(섞임 완료, 결과로 넘어가기 전).

## seq

- `mix-to-result-first.png` (seq) — 첫 프레임 PNG — 영상 — 3.9초 흔든 상태(미리 감기)에서 시작 → 누적 5.0초 도달 → 정착 → 결과 화면(카운트업·reveal). 5.5초·60fps. 
- `mix-to-result-last.png` (seq) — 끝 프레임 PNG — 영상 — 3.9초 흔든 상태(미리 감기)에서 시작 → 누적 5.0초 도달 → 정착 → 결과 화면(카운트업·reveal). 5.5초·60fps. 
- `shake-mix-first.png` (seq) — 첫 프레임 PNG — 영상 — 안내 화면에서 "흔들기 시작" 클릭 → 흔들기 → 섞임 → 누적 5초 도달·정착 직전까지. 6.0초·60fps. 방식: page.clo
- `shake-mix-last.png` (seq) — 끝 프레임 PNG — 영상 — 안내 화면에서 "흔들기 시작" 클릭 → 흔들기 → 섞임 → 누적 5초 도달·정착 직전까지. 6.0초·60fps. 방식: page.clo ※ 끝 22프레임(약 0.37초)은 결과 화면으로 넘어가는 흰 전환(앱 실제 동작) — 편집 때 5.63초에서 자르고, 끝 프레임 PNG 는 빈 화면이라 썸네일로 쓰지 않는다(검수 03:25Z).
- `mix-to-result.mp4` (seq) — 영상 — 3.9초 흔든 상태(미리 감기)에서 시작 → 누적 5.0초 도달 → 정착 → 결과 화면(카운트업·reveal). 5.5초·60fps. 방식은 shake-mix 와 같음(recordSeq, 시작 전 3.9초는 같은 가상 시계로 선행 진행).
- `shake-mix.mp4` (seq) — 영상 — 안내 화면에서 "흔들기 시작" 클릭 → 흔들기 → 섞임 → 누적 5초 도달·정착 직전까지. 6.0초·60fps. 방식: page.clock 가상 시간 1/60초씩 runFor + devicemotion 프레임마다 주입 + getAnimations currentTime 동기화(recordSeq). 전 프레임 PII 검사. ※ 끝 22프레임(약 0.37초)은 결과 화면으로 넘어가는 흰 전환(앱 실제 동작) — 편집 때 5.63초에서 자르고, 끝 프레임 PNG 는 빈 화면이라 썸네일로 쓰지 않는다(검수 03:25Z).

## media

- `media/` — 로고(logo-jipyeong·logo-saengmakgeolli .svg/.png)·손글씨 타이틀(title-handwriting*)·히어로 팩샷 hero-product.png·병 분해 레이어 bottle/*·초대장 card-1..6(.jpg·-thumb·-art)·유형 코너 type-*.png·경품 prize-*.jpg·완료 일러스트·카톡 공유 카드 share/·deco/ — 출처 `public/jipyeong/img/`(커밋 7312f95c) 복사. 레포의 저해상 임시본임(LICENSES.md). 영상 원본은 레포에 없음(BLOCKED.md).
- `media/LICENSES.md` — 자산 라이선스 메모(저해상 임시본 명시). 출처 public/jipyeong/img/LICENSES.md(커밋 7312f95c) 복사.
- `media/card-1-art.png` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-1-art.png(커밋 7312f95c) 복사.
- `media/card-1-thumb.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-1-thumb.jpg(커밋 7312f95c) 복사.
- `media/card-1.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-1.jpg(커밋 7312f95c) 복사.
- `media/card-2-art.png` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-2-art.png(커밋 7312f95c) 복사.
- `media/card-2-thumb.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-2-thumb.jpg(커밋 7312f95c) 복사.
- `media/card-2.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-2.jpg(커밋 7312f95c) 복사.
- `media/card-3-art.png` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-3-art.png(커밋 7312f95c) 복사.
- `media/card-3-thumb.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-3-thumb.jpg(커밋 7312f95c) 복사.
- `media/card-3.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-3.jpg(커밋 7312f95c) 복사.
- `media/card-4-art.png` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-4-art.png(커밋 7312f95c) 복사.
- `media/card-4-thumb.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-4-thumb.jpg(커밋 7312f95c) 복사.
- `media/card-4.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-4.jpg(커밋 7312f95c) 복사.
- `media/card-5-art.png` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-5-art.png(커밋 7312f95c) 복사.
- `media/card-5-thumb.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-5-thumb.jpg(커밋 7312f95c) 복사.
- `media/card-5.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-5.jpg(커밋 7312f95c) 복사.
- `media/card-6-art.png` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-6-art.png(커밋 7312f95c) 복사.
- `media/card-6-thumb.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-6-thumb.jpg(커밋 7312f95c) 복사.
- `media/card-6.jpg` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-6.jpg(커밋 7312f95c) 복사.
- `media/card-sample-art.png` — 초대장 카드(그림 안에 문구 포함). 출처 public/jipyeong/img/card-sample-art.png(커밋 7312f95c) 복사.
- `media/done-illust.png` — 완료 화면 일러스트. 출처 public/jipyeong/img/done-illust.png(커밋 7312f95c) 복사.
- `media/hero-product.png` — 히어로 팩샷(콜라보 병). 출처 public/jipyeong/img/hero-product.png(커밋 7312f95c) 복사.
- `media/logo-jipyeong.png` — 로고 원본. 출처 public/jipyeong/img/logo-jipyeong.png(커밋 7312f95c) 복사.
- `media/logo-jipyeong.svg` — 로고 원본. 출처 public/jipyeong/img/logo-jipyeong.svg(커밋 7312f95c) 복사.
- `media/logo-saengmakgeolli.png` — 로고 원본. 출처 public/jipyeong/img/logo-saengmakgeolli.png(커밋 7312f95c) 복사.
- `media/logo-saengmakgeolli.svg` — 로고 원본. 출처 public/jipyeong/img/logo-saengmakgeolli.svg(커밋 7312f95c) 복사.
- `media/prize-1.jpg` — 경품 사진. 출처 public/jipyeong/img/prize-1.jpg(커밋 7312f95c) 복사.
- `media/prize-2.jpg` — 경품 사진. 출처 public/jipyeong/img/prize-2.jpg(커밋 7312f95c) 복사.
- `media/prize-3.jpg` — 경품 사진. 출처 public/jipyeong/img/prize-3.jpg(커밋 7312f95c) 복사.
- `media/title-handwriting-white.png` — 손글씨 타이틀(슬로건 "흔들면 이야기가 시작된다"). 출처 public/jipyeong/img/title-handwriting-white.png(커밋 7312f95c) 복사.
- `media/title-handwriting.png` — 손글씨 타이틀(슬로건 "흔들면 이야기가 시작된다"). 출처 public/jipyeong/img/title-handwriting.png(커밋 7312f95c) 복사.
- `media/title-handwriting.svg` — 손글씨 타이틀(슬로건 "흔들면 이야기가 시작된다"). 출처 public/jipyeong/img/title-handwriting.svg(커밋 7312f95c) 복사.
- `media/type-balance.png` — 성격 유형 코너 일러스트. 출처 public/jipyeong/img/type-balance.png(커밋 7312f95c) 복사.
- `media/type-calm.png` — 성격 유형 코너 일러스트. 출처 public/jipyeong/img/type-calm.png(커밋 7312f95c) 복사.
- `media/type-cheers.png` — 성격 유형 코너 일러스트. 출처 public/jipyeong/img/type-cheers.png(커밋 7312f95c) 복사.
- `media/type-hype.png` — 성격 유형 코너 일러스트. 출처 public/jipyeong/img/type-hype.png(커밋 7312f95c) 복사.
- `media/type-story.png` — 성격 유형 코너 일러스트. 출처 public/jipyeong/img/type-story.png(커밋 7312f95c) 복사.
- `media/reference/card-sample-full.png` — 디자인 참고 이미지. 출처 public/jipyeong/img/reference/card-sample-full.png(커밋 7312f95c) 복사.
- `media/reference/card-sample-text.png` — 디자인 참고 이미지. 출처 public/jipyeong/img/reference/card-sample-text.png(커밋 7312f95c) 복사.
- `media/reference/logo-lockup.png` — 디자인 참고 이미지. 출처 public/jipyeong/img/reference/logo-lockup.png(커밋 7312f95c) 복사.
- `media/reference/sign-sunglib.png` — 디자인 참고 이미지. 출처 public/jipyeong/img/reference/sign-sunglib.png(커밋 7312f95c) 복사.
- `media/reference/title-handwriting-strip.png` — 디자인 참고 이미지. 출처 public/jipyeong/img/reference/title-handwriting-strip.png(커밋 7312f95c) 복사.
- `media/deco/bird-bottom-left.png` — 장식 일러스트. 출처 public/jipyeong/img/deco/bird-bottom-left.png(커밋 7312f95c) 복사.
- `media/deco/bird-bottom-right.png` — 장식 일러스트. 출처 public/jipyeong/img/deco/bird-bottom-right.png(커밋 7312f95c) 복사.
- `media/deco/bird-cluster-a1.png` — 장식 일러스트. 출처 public/jipyeong/img/deco/bird-cluster-a1.png(커밋 7312f95c) 복사.
- `media/deco/bird-cluster-b1.png` — 장식 일러스트. 출처 public/jipyeong/img/deco/bird-cluster-b1.png(커밋 7312f95c) 복사.
- `media/deco/bird-flying-left.png` — 장식 일러스트. 출처 public/jipyeong/img/deco/bird-flying-left.png(커밋 7312f95c) 복사.
- `media/deco/brewery-1.png` — 장식 일러스트. 출처 public/jipyeong/img/deco/brewery-1.png(커밋 7312f95c) 복사.
- `media/deco/figure-stick.png` — 장식 일러스트. 출처 public/jipyeong/img/deco/figure-stick.png(커밋 7312f95c) 복사.
- `media/share/card-1-8346412c.png` — 카톡 공유 카드(800×400). 출처 public/jipyeong/img/share/card-1-8346412c.png(커밋 7312f95c) 복사.
- `media/share/card-2-9eedc6a3.png` — 카톡 공유 카드(800×400). 출처 public/jipyeong/img/share/card-2-9eedc6a3.png(커밋 7312f95c) 복사.
- `media/share/card-3-1e16b10e.png` — 카톡 공유 카드(800×400). 출처 public/jipyeong/img/share/card-3-1e16b10e.png(커밋 7312f95c) 복사.
- `media/share/card-4-c91c7e1e.png` — 카톡 공유 카드(800×400). 출처 public/jipyeong/img/share/card-4-c91c7e1e.png(커밋 7312f95c) 복사.
- `media/share/card-5-46054c36.png` — 카톡 공유 카드(800×400). 출처 public/jipyeong/img/share/card-5-46054c36.png(커밋 7312f95c) 복사.
- `media/share/card-6-4867a8ef.png` — 카톡 공유 카드(800×400). 출처 public/jipyeong/img/share/card-6-4867a8ef.png(커밋 7312f95c) 복사.
- `media/share34/card-1-6a78ee1d.png` — 카톡 공유 카드(3:4). 출처 public/jipyeong/img/share34/card-1-6a78ee1d.png(커밋 7312f95c) 복사.
- `media/share34/card-2-c29c28c7.png` — 카톡 공유 카드(3:4). 출처 public/jipyeong/img/share34/card-2-c29c28c7.png(커밋 7312f95c) 복사.
- `media/share34/card-3-5d816085.png` — 카톡 공유 카드(3:4). 출처 public/jipyeong/img/share34/card-3-5d816085.png(커밋 7312f95c) 복사.
- `media/share34/card-4-35b4ab64.png` — 카톡 공유 카드(3:4). 출처 public/jipyeong/img/share34/card-4-35b4ab64.png(커밋 7312f95c) 복사.
- `media/share34/card-5-ee9375ae.png` — 카톡 공유 카드(3:4). 출처 public/jipyeong/img/share34/card-5-ee9375ae.png(커밋 7312f95c) 복사.
- `media/share34/card-6-d6421f13.png` — 카톡 공유 카드(3:4). 출처 public/jipyeong/img/share34/card-6-d6421f13.png(커밋 7312f95c) 복사.
- `media/bottle/body.png` — 병 분해 레이어(흔들기 화면 병 렌더용). 출처 public/jipyeong/img/bottle/body.png(커밋 7312f95c) 복사.
- `media/bottle/cap.png` — 병 분해 레이어(흔들기 화면 병 렌더용). 출처 public/jipyeong/img/bottle/cap.png(커밋 7312f95c) 복사.
- `media/bottle/highlight.png` — 병 분해 레이어(흔들기 화면 병 렌더용). 출처 public/jipyeong/img/bottle/highlight.png(커밋 7312f95c) 복사.
- `media/bottle/label.png` — 병 분해 레이어(흔들기 화면 병 렌더용). 출처 public/jipyeong/img/bottle/label.png(커밋 7312f95c) 복사.
- `media/bottle/shadow.png` — 병 분해 레이어(흔들기 화면 병 렌더용). 출처 public/jipyeong/img/bottle/shadow.png(커밋 7312f95c) 복사.

## 기타

- `brand.json` — 색·폰트와 코드 근거 줄.
- `facts.md` — 자막용 사실 10개와 근거.
- `contact.jpg` — 전 캡처 축소 모음(tools/contact.py).
- `capture/*.mjs` — 촬영 스크립트(common·mobile·admin), `capture/make_shots_md.py` — 이 문서 생성기.
- `BLOCKED.md` — 못 채운 것.

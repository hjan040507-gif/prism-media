# pscompany shots — PS COMPANY 회사 사이트 지원 화면 (2차 촬영 2026-11-06)

운영 https://pscp.to 공개 화면을 GET 으로만 열어 찍었다(소스 저장소 없음, 로그인 0). 데스크톱 1440×900 @2, 모바일 390×844 @3. 모든 PNG 옆 .json 에 요소 사각형·scrollY·pii_scan·가로챈 요청이 있다. 촬영 스크립트: `capture/desktop.mjs`(페이지·흐름·seq)·`capture/mobile.mjs`·`capture/common.mjs`·`capture/extra.mjs`(가림).

## 화면 선택 판단 (지시와 실제가 다른 점)
- 지시 '공개 화면(홈·크리에이터·모집·연락)은 이미 있으니 찍지 않는다' → 합격 기준(데스크톱 3페이지·모바일 2페이지)을 지원 관련 페이지로 채웠다: 데스크톱 `/recruit`(지원서 폼 포함)·`/recruit/sales`(캐스팅 디렉터 고정 폼)·`/manage/login`(관리자 로그인 화면, GET 만) · 모바일 `/recruit`·`/recruit/sales`.
- 지시의 '관리자(지원자 목록·상세·모집 직군 관리)' = 계정·소스·기존 캡처 없음, '모집 직군 관리' 화면은 운영에 없음(직군 코드 고정 3개) → BLOCKED.md. `/manage/login` 1장은 그 근거 화면.
- 지시의 '지원서 작성 흐름(직군 선택→정보 입력→사진 첨부→제출 직전)' = 실제는 `/recruit#apply` 한 페이지 폼(단계 없음, 사진 칸 없음). 같은 scrollY 로 '빈 폼 → 직군 선택 → 기본 정보 → 자기소개 → (스크롤) 선호 연락 → 동의 → 제출 직전 → 가로챈 성공 카드'로 다시 정의했다. 폼이 뷰포트(900·844)보다 길어 한 흐름(같은 scrollY)에 다 안 들어가므로 흐름을 둘로 나눴다(위쪽 입력 / 아래쪽 동의·제출).
- 지시의 '모바일 지원 폼' = 별도 모바일 화면 없음, 같은 반응형 폼을 390 으로 찍음.
- 지시의 '지원자 사진 얼굴 흐림' = 지원서에 사진 칸이 없어 해당 없음. 크리에이터 사진은 이 화면들에 없고, 안전망으로 `img[alt^="피에스컴퍼니 소속 크리에이터"] { filter: blur(18px) }` 만 걸었다(흐림 처리, 실제 적용된 화면 0).
- 폼의 성별·선호 연락 방법을 비워 두고 제출하면 영어 오류 「Invalid input: expected string, received null」이 뜨는 것을 확인했다(운영 폼의 실제 동작). 촬영 흐름에서는 두 항목을 선택해 그 오류가 화면에 없다.

## 가린 것 (모든 화면 공통)
- 푸터 CONTACT·COMPANY 열(전화·이메일·카카오·사업자번호·주소)과 소셜 아이콘 줄 → visibility:hidden(열 제목만 남음). `/recruit`·`/recruit/sales` 「접수 문의」 블록의 전화·카톡·이메일 3줄 → hidden(제목·안내 문구는 남음). 성공 카드의 「급한 문의는 전화·카카오톡」 안내 → hidden.
- 수익 문구(월 500~1,000만원·일 최소 20만원 보장·`/recruit/sales` 수익 예시표의 금액 줄·월 128만원 안내) → 해당 글자 요소를 hidden(레이아웃 유지라 표·카드에 빈 칸이 생김). 근거: 브리프 §9 가 수익 예시를 캡처에 넣지 않는 편을 권함.
- 입력값: 이름 `김○○`(직접 입력한 이미 가린 꼴), 연락처는 화면에서 `010-****-****`(lib 가림, 제출 순간에만 더미 번호로 바뀌었다 곧바로 다시 가림 — PNG 에는 한 번도 안 찍힘), placeholder 의 예시 번호 `010-1234-5678` → `010-****-****`, 예시 이메일 placeholder → 비움(lib 자동). 나이 24·성별 여·방송 경력·자기소개는 촬영용 가짜 입력값.
- 가짜 값(영업 수치) 없음. 가짜 응답: 지원서 제출 서버 액션 POST 만(RSC flight `0:{"a":"$@1","f":"","b":"<빌드ID>"}` + `1:{"ok":true}`, 빌드 ID 는 촬영 직전 운영 HTML 에서 읽음 U7c9ECzRV9pUnCBMQZMp6). 가로챈 요청은 각 json 의 `intercepted` 에, 운영 서버까지 나간 비GET 은 0.

## desktop/
- desktop/header.png — 고정 헤더(스크롤된 상태). 로고 PS COMPANY·내비 5개·「지원하기」.
- desktop/recruit-view.png · desktop/recruit-full.png — `/recruit` BJ 모집 페이지(첫 화면 / 끝까지 7250px). 전형 절차·접수 문의(연락처 가림)·지원서 폼 포함. 수익 문구 가림.
- desktop/recruit-sales-view.png · desktop/recruit-sales-full.png — `/recruit/sales` 캐스팅 디렉터 모집(직군 라디오 없는 고정 폼). 수익 예시표 금액 가림.
- desktop/manage-login-view.png · desktop/manage-login-full.png — `/manage/login` 관리자 로그인 화면(입력 비움, 제출·로그인 시도 0).
- desktop/recruit-submitted-view.png — 가로챈 가짜 성공 응답 후 「지원이 접수되었습니다」 카드(아래 sonner 토스트 「접수되었습니다」가 위에 보임). 연락처 안내 가림.

## mobile/
- mobile/header.png — 모바일 고정 헤더(로고·지원하기·햄버거).
- mobile/recruit-view.png · mobile/recruit-full.png — `/recruit` 390 폭(같은 반응형 DOM).
- mobile/recruit-sales-view.png · mobile/recruit-sales-full.png — `/recruit/sales` 390 폭.

## states/ (같은 뷰포트·같은 scrollY)
- states/apply-form/01-empty.png — 데스크톱 /recruit 지원 폼 위쪽, 빈 폼.
- states/apply-form/02-category-selected.png — 직군 「개인 컨텐츠」 선택(카드 핑크 강조).
- states/apply-form/03-basic-info.png — 이름 김○○·나이·성별 여·연락처(010-****-****) 입력.
- states/apply-form/04-intro-filled.png — 방송 경력·자기소개 입력.
- states/apply-submit/01-before-consent.png — (같은 폼, 아래쪽 scrollY) 자기소개 입력 상태·동의 전.
- states/apply-submit/02-contact-method.png — 선호 연락 방법 「카톡」 선택.
- states/apply-submit/03-ready-to-submit.png — 개인정보 동의 체크 → 제출 직전(「지원서 제출」 버튼).
- states/apply-form-mobile/01-empty.png — 모바일 폼 위쪽, 빈 폼.
- states/apply-form-mobile/02-name-age.png — 이름 김○○·나이·성별 입력.
- states/apply-form-mobile/03-phone.png — 연락처 입력(010-****-**** 로 보임, 포커스 링).
- states/apply-form-mobile/04-category-selected.png — 직군 「개인 컨텐츠」 선택.
- states/apply-submit-mobile/01-intro-filled.png — 모바일 폼 아래쪽: 자기소개 입력 상태.
- states/apply-submit-mobile/02-contact-method.png — 선호 연락 방법 「카톡」 선택.
- states/apply-submit-mobile/03-consent-checked.png — 동의 체크 → 제출 직전.
- 성공 카드는 폼이 카드로 바뀌며 페이지 길이가 줄어 같은 scrollY 를 못 지키므로 흐름 4단계로 넣지 않고 desktop/recruit-submitted-view.png 와 seq 로 담았다.

## seq/
- seq/submit-success.mp4 — 제출 클릭 → 「제출 중」 → 성공 카드·토스트 등장(3초, 60fps). 방식: page.clock 으로 시간을 멈추고 1/60초씩 runFor + getAnimations currentTime 동기화, 프레임마다 가림·PII 검사 후 스크린샷 → H.264 CRF 12. 제출 응답은 route.fulfill 로 20프레임(0.33초) 늦춰 준 가짜 응답이다.
- seq/submit-success-first.png · seq/submit-success-last.png — 첫·끝 프레임.

## media/
- media/favicon.png — 운영 `/icon?454f2defa99cfd4a` (64×64 PNG 파비콘, 로고 이미지 원본은 따로 없음 — 로고는 헤더의 텍스트 'PS COMPANY' 그라데이션). 히어로·제품 사진 원본 없음(소스 저장소 없음, 크리에이터 얼굴 사진은 이번 범위 밖).

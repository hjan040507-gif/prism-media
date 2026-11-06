# sy-motors BLOCKED — 못 채운 것 (2026-11-06)

합격 기준 1 의 화면 항목(데스크톱 3페이지·모바일 2페이지·states PNG·seq·contact.jpg)은 **해당 없음**이다. 지시(portfolio-capture-2.md 5번)가 이 프로젝트는 화면 대신 실제 응답 JSON 3흐름(방문정비·사고/긴급·장애문의)을 인정한다. 그래서 `python3 tools/check.py sy-motors` 는 desktop/mobile/states-PNG 항목에서 FAIL 이 나는 것이 정상이다(검사기를 고치지 않았다).

## 1. 화면 PNG · desktop/mobile 페이지 · header · contact.jpg · seq(mp4) · media(로고·사진) — 화면 없음
- 사유: SY모터스 접수 챗봇은 카카오톡 채널 안에서 도는 오픈빌더 스킬 서버다. `GET /` 는 안내 문구 한 줄(`src/app/page.tsx`), 나머지는 POST 전용 웹훅이라 공개 웹 화면이 없다. 말풍선·버튼 모양은 카카오톡 앱 UI(카카오 소유)다. 로고·히어로 원본도 레포에 없다(`public/` 은 Next 기본 svg).
- 한 것: 3흐름 실제 응답 JSON 32개를 순서대로 `states/<repair|accident|trouble>/<NN>-<설명>.json` 으로 저장(요청·응답·가림·pii_scan 0건), 알림 분기 서버 로그 증거 3개 포함.
- 대안: 사용자가 실단말 카카오톡에서 3흐름을 한 번씩 캡처해 주면 가림 처리(번호·번호판·이름·접수번호)만 해서 PNG 재료로 쓴다. 영상 쪽에서 JSON 을 말풍선 UI 로 그리는 것은 「새로 그리지 않는다」 원칙과 부딪히므로 주 세션 결정.

## 2. 실단말 캡처 — 서버에 0건 (시도 경로)
- 시도 1: 레포 `~/kakaoauto`(이미지·영상 파일 0개), `~/qa-archive`(byclick 전용, `kakaoauto`·`SY-` 문자열 0건), `~/Downloads`(빈 폴더), `~/hongjun-journey`(`docs/CONTENT/assets/shots-log.json:53` 이 sy-motors-bot 을 「카카오톡 채널 안의 챗봇이라 공개 웹 화면이 없다」로 제외 기록), `~/prism-media` 를 조사했다(RECON.md §0-1).
- 시도 2: 파일명 키워드(kakao·카카오·알림톡·sy-·symotors)로 `~` 6단계 깊이까지 이미지 검색 — 20여 장은 전부 다른 프로젝트(Okjob 알림톡 등). 서버 전체 `find /` 는 시간 초과(미완). 09-28 실기기 테스트(`PROGRESS.md:46`)는 사용자가 폰으로 보고 판정만 적었고 캡처 파일은 남지 않았다.
- 대안: 위 1번과 같다(사용자 실단말 캡처).

## 3. 알림톡 템플릿 본문 — 레포에 없음
- 사유: 템플릿 본문은 솔라피 콘솔의 승인본이고 레포에는 변수 6개 이름만 있다(`src/lib/notify/alimtalk.ts:47-54`). 알림톡은 가게 대표 폰으로 가는 푸시라 고객 대화창에도 없다.
- 한 것: 가짜 알림톡 env 로 서버 드라이런 로그의 `[DRY-RUN] solapi/alimtalk` 변수 JSON 을 증거로 저장(`states/accident/09-alimtalk-dryrun-log.json`, 번호 가림).
- 대안: 사용자가 솔라피 콘솔에서 템플릿 본문을 알려 주거나, 대표 폰의 알림톡 수신 화면 캡처(가림 처리).

## 4. 라이브 전용 요소(코드 밖 env) — 흉내 내지 않음
- `PILOT_NOTICE`(웰컴 맨 위 시범운영 안내, 원문 레포에 없음), `YOUTUBE_CHANNEL_URL`(장애 문의 「자가 점검 영상 보기」 버튼), `KAKAO_SECUREIMAGE_BLOCK_ID`(「📷 사진 첨부하기」 버튼). 운영 화면과 이 점만 다르다(shots.md 에도 기재).

## 5. 결정 필요 (주 세션)
1. 상호 표기: 응답 JSON 의 상호가 코드 그대로 「에스와이모터스」(웰컴 `menu.ts:18`). 사용자 방침 「SY모터스」와 다르다 — 영상 자막·장면에서 어느 쪽을 쓸지.
2. 가림 부작용: 질문 속 예시 문구(「예: 12가XXXX」·「예: 010-XXXX-XXXX」)도 PII 표에 걸려 저장본에서 「12가 ****」·「010-****-****」로 보인다(규칙·정규식은 지시대로 그대로). 영상에서 예시 문구를 원문으로 보이려면 규칙 예외 결정이 필요하다.

## 보고할 것 (운영 접속·쓰기)
- 운영 스킬 주소·운영 Supabase·Claude·Solapi·카카오 API 요청 0, 원본 `~/kakaoauto` 에서 실행한 명령 0(읽기: `git archive`·`git status --porcelain` 뿐), 원본 `.env.local` 읽기·복사 0. npm ci 의 npm 레지스트리 조회 외에 확인된 외부 요청은 없다.

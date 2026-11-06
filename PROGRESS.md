# PROGRESS — 숨고 포트폴리오 영상 재료 9편 (prism-media)

순서(추가 지시 2026-11-06): sealkitt → posco → byclick → fordex → jipyeong → maieventic → medimajor → sellfit → nowflix. 원문 docs/specs/portfolio-capture.md(끝에 추가 지시). 끝낸 프로젝트는 다시 찍지 않는다.

## 명세와 코드가 다른 점 (2026-11-05 사전 조사 · 근거 <proj>/RECON.md)
- **sealkitt**: 공개 입점 샵 0곳(유일한 sealkitt-test-shop 은 비로그인 404) → 입점 샵 페이지 대신 `/for-shops` 입점 안내. 시세 차트 '나라 탭'은 축 탭(국내/일본/TCGplayer)인데 두 축 이상 켜진 카드를 못 찾음(인기 100장). 관심 카드는 로그인 없이 localStorage, 시세 알림은 기기 토큰(POST /api/watch 가로챔). 총 카드 수는 코드·기록에 확정값 없음(사이트맵 색인 30,622 = 하한).
- **posco**: 운영 `/posco-ox` 는 closed(행사 종료 안내만) → 로컬 사본+가짜 응답. 랜딩과 문자 인증이 한 화면(이름 칸 포함), 명세에 없는 '미션 완료' 화면 있음, 추첨 연출은 등급 무관 1종, 쿠폰은 커피(steel)만·스탭 PIN 은 우산·선풍기(gold·blue)와 쿠폰 폴백에서만 → 흐름 2갈래. 현황판은 30초 폴링, '일자별 경품 배분'은 현황판 안 재고 그리드(3티어×3일차). 운영 화면은 1440 에서 폭 760 칼럼. 퀴즈 5문항. '사고 0' 문구 근거 없음(미확인), 경품 960 은 당첨·소진(실수령 922).
- **byclick**: 운영 소비자 화면은 11-04 배포된 `feat/sian-v9`(레포에 없음) — 레포 코드와 글자·클래스가 다름 → 운영을 직접 찍음. 촬영 가이드 화면 없음(사진 스텝 꺼짐, `/my/apply` 1단계 '바이크 사진 등록'이 가장 가까움). 판매·위탁 선택은 판매·위탁·반환 3개. 검수 리포트 PDF 이름은 「성능·상태 점검기록부」(화면 링크 없음), 정산서는 소비자 판매 정산서. 관심 차종 알림은 웹푸시(캡처 불가) → '관심차' 조건 등록 화면. 딜러·관리자 고정 테스트 계정 없음(관리자는 TOTP), 관리자 화면 GET 은 서버가 admin_access_logs 에 씀 → 운영 로그인 화면 촬영 불가. 대상은 차가 아니라 바이크(차종=바이크 모델).
- **jipyeong**: 실제 순서는 랜딩→흔들기→결과→게이트(19세 체크박스+문자 인증)→초대장→완료. 19세 확인은 별도 화면이 아니라 게이트의 체크박스, 섞이는 연출은 흔드는 화면 안의 병 연출, '꾹 눌러 참여'는 센서 없을 때의 pointer 모드, 카카오 공유창은 외부 UI(캡처 불가)→초대장 고르기·완료만. 관리자는 `/admin` 의 추첨·명단 탭. 유형 결과로 바로 가는 URL 없음(흔든 초로 결정, 0~5초 5구간). 행사 10/30 종료, 서버 API 410.
- **maieventic**: 빌더는 계정 플래그로 예전(대화형 브리프)/새(폼+엔진 3안) 흐름이 갈림. '디자인 자동 생성'은 LLM 아닌 결정론 엔진. '관리자 초대'는 이메일이 아니라 초대 링크 발급. 데모 이벤트엔 매장별 QR 스탬프가 없어 빌더 화면·QR 모달로만. 게임 4종(퍼즐·브랜드게임은 출시 예정). `/showcase/<demo>` 상세는 `/create` 로 이동. `/create` 진입·`GET /api/stamp/store-qr` 는 서버 쓰기.
- **medimajor**: '구매 요청'은 `/wanted`(삽니다), '사진으로 판매 등록'은 `/sell?start=1`(로그인 벽), 모바일은 같은 URL 반응형. 공개 테스트 경매 없음(전부 시범 샘플). 주색은 라이브 CSS `#222F60`(레포 CLAUDE.md 의 #1150c8 과 다름), 폰트 Pretendard Variable. 지원 언어 6(ko·en·zh-CN·ja·th·hi). 일반 UA 로 상세를 열면 조회수 기록(촬영 UA 에 headless 포함 필요), 마감 매물 열면 finalize_auction 호출.
- **fordex**: 관리자 웹 따로 없음(앱 안 관리자 화면) — 코드 기준 21개(+설정 토글 3, 마케팅 플래그 꺼지면 20 노출), 18은 옛 문서(step253-survey.md:439) 수치. '대시보드'·'분쟁 중재' 같은 이름의 화면 없음. 본인인증 화면에 '만 19세' 문구 없음(약관·실패 문구에만). 1440 에선 모바일 UI 가 늘어난 모양. 라우트 URL 없음(클릭·nav 로만 이동). 복제 시드에 경매 매물 없음·auction_enabled 꺼짐 → 가짜 주입. 로고 SVG 없음(PNG). App Store 스크린샷 8장(store/ios/screenshots, 1320×2868).
- **sellfit**: 부분 접근 — 인계 완료 기록 없음, 운영 https://sellfit.vercel.app 공개 화면만(상품 목록·상세, 사람 사진 많은 홈·코디 상세 제외). 장바구니·주문·결제가 앱에 없음(교환 중개 — `/swap/*` 는 로그인 서버 렌더), '주문 관리' 실제 이름은 '교환 관리'(`/admin/swaps`), 관리자·테스트 계정 없음 → 관리자·주문 단계 BLOCKED. 홈 피드 이미지가 공개 POST `/api/codi-cover-dims` 를 보냄(가로챔).
- **nowflix**: 진료 파트 재생목록과 영상 목록은 한 화면(PartDetailScreen). 잠금 상태 전용 화면 없음(PIN 패드·'완전 잠금' 표시). 자동 복귀는 화면이 아니라 동작(유휴 120초→메인). '재생목록 추가'의 실제 이름은 '파트 추가'. 실기기 해상도 기록 없음 — 확인된 값은 CI 에뮬레이터 2560×1688. 이 서버(ARM, KVM 없음)에선 안드로이드 화면을 새로 못 찍음.

## 완료 조건 (원문 docs/specs/portfolio-capture.md [합격 기준])
- 측정 가능한 끝 상태: 9폴더 각각 `python3 tools/check.py <proj>` FAIL 0(nowflix `--tablet`) 또는 못 채운 항목이 BLOCKED.md 에 사유·시도·대안 · 모든 캡처 json pii_scan 0 + `tools/ocr.py` 걸림 0(걸린 건 판정 기록) · 비GET 은 가로챔(허용한 로그인은 횟수 보고) · 파일 <95MB · 프로젝트별 커밋 해시 · 고객 레포 9개 `git status --porcelain` sha 가 docs/baseline 과 같고 임시 서버·사본 0
- 증거: check.py·ocr.py 출력, git log, baseline 비교 출력, `ss -ltnp` 출력
- 바꾸면 안 되는 것: 고객 레포 코드·git 상태·DB·배포·방화벽, 가림 정규식·게이트 기준(바꿔야 하면 '결정 필요')
- 최대 턴: 200 (추가 지시)
- 저장소: hjan040507-gif/prism-media 없음 + 이 서버에 GitHub API 인증 없음(gh 미로그인, 토큰 없음, SSH 로는 생성 불가) → ~/prism-media 에 커밋만, 보고에 '저장소 생성 필요'

## NOW
- 02:40Z byclick 검수 FAIL: 관리자 6장(접수·결정 view/full, 상세 2 full)에 가짜 연락처가 가려지지 않고 찍힘(서브에이전트가 OCR 23건을 '오탐'으로 판정했으나 실제 노출). 원인 lib 구멍 2개 — live 관찰자가 documentElement 에 붙어 <html> 교체 시 끊김 · 저장 뒤 '가림→검사' 순서라 찍는 사이 생긴 PII 를 지우고 통과(screencast 루프도 같음). tools/lib.mjs 수정(document 관찰·검사→가림), 재현 시험: 원본은 루트 교체 뒤 번호 노출, 수정본은 가림. 커밋분 6편+jipyeong json elements 재검사 걸림 0(tmp/elements-scan.py) — byclick 만 해당. byclick 6장 재촬영 맡김(종료 05:00Z), code-review medium 진행 중.
- 02:10Z 컨텍스트 40만 인계 → /home/dev/.config/cc/manager/docs/handoff/HANDOFF.md 마지막 항목(백그라운드 3건 ID·검수 절차). /clear 뒤 '이어서'로 재개.
- 02:03Z 정정: 완전한 빌드는 byclick 만(BUILD_EXIT 0). posco 는 빌드 시작 전, jipyeong 은 중간에 끊긴 빌드(prerender-manifest 없음) → 둘 다 heavy-run 재빌드 대기(게이트는 load 로 닫힘). 기한: jipyeong 03:30Z, posco 04:00Z 까지 안 되면 로컬 화면 BLOCKED.
- 02:02Z Claude Code 재시작으로 jipyeong·byclick·posco 서브에이전트 끊김 → 재개(posco·jipyeong 빌드는 끝나 있음 → 바로 촬영, byclick 은 재빌드). 남은 3건 종료 03:30~04:30Z.
- 00:45Z nowflix 검수 끝(check --tablet FAIL 0·OCR 0/36·QR·도메인 가림 확인, 태블릿=기존 CI 캡처 8장, 관리자 웹=로컬 사본+가짜 Supabase 1회 성공) → 커밋. 빌드 게이트: 스왑 여유 16% 로 회복, 지금은 load 만 걸림.
- 00:40Z fordex 검수 끝(check FAIL 0·OCR 1건 오탐(카드 저작권 연도)·contact 확인, 로컬 복제 스택+가짜 데이터, 운영 관리자 컷·NICE 결제창·지급/정산 BLOCKED) → 커밋.
- 00:33Z maieventic 검수 끝(check FAIL 0·OCR 1건 오탐·contact 확인, /create 빌더 BLOCKED — 서버가 analytics_events 에 씀) → 커밋.
- 00:11Z sellfit 검수 끝(check FAIL 0·OCR 0/27·사람 사진 0 확인·관리자·교환 흐름 BLOCKED) → 커밋.
- 00:10Z medimajor 검수 끝(check FAIL 0·OCR 5건 오탐 판정·contact 확인·관리자 GET 쓰기 없음) → 커밋 d4e391f.
- 23:46Z sealkitt 검수 끝(check FAIL 0·OCR 0/81·contact 확인, lib 수정 2건: full 캡처 하단 고정 요소 위치·화면 밖 이미지 빈칸 → 페이지 재촬영) → 커밋 d9c8005.
- 23:10Z 도구 커밋 1ece652(자체 시험 17/17·OCR 0·code-review medium 11건 반영). 조사 7건 RECON.md. 공통 지침 docs/CAPTURE-BRIEF.md.
- 23:15Z 촬영 서브에이전트 sealkitt·posco·nowflix·jipyeong 시작(종료 03:00~03:30Z). 23:30Z 추가 지시: fordex·sellfit 추가(조사 중, sellfit 은 접근 권한부터), nowflix 는 화면 띄우기 1회만. 다음: byclick·maieventic·medimajor·fordex·sellfit. 끝나는 대로 검수(check·ocr·contact 직접 보기) → 프로젝트별 커밋.
- 막힌 것: 저장소 생성 권한

## 결정 (세션이 내린 것 — 보고에 적음)
- Playwright 는 명세대로 1.64.1(npm 최신은 1.65.0).
- 로컬 실행은 worktree 대신 `git archive` 사본(원본 .git 무변경) → 끝나면 사본·서버 삭제.
- posco 현황판 숫자: 행사 최종 보고서 집계(961·960 등, 개인정보 없음)를 넣어 재현, 행 단위 명단은 가짜 — shots.md 에 '가짜 데이터(보고서 집계값으로 재현)'.
- 로그인 POST 를 허용한 경우 횟수를 보고(인증 세션 행이 남는 쓰기).

## 결정 필요
1. heavy-run 스왑 여유 ≥15% 조건이 빌드를 막음(스왑 97%·가용 22G·PSI 0) → 빌드가 필요한 posco·jipyeong 관리자·nowflix 관리자·byclick 딜러/관리자가 대기. 추천: 스왑 조건을 메모리 PSI 기준으로 바꾸기(설정 변경이라 승인 필요). 알림 보냄.
2. nowflix '태블릿 실해상도' 2560×1688 은 CI 에뮬레이터(pixel_c) 값 — 병원 실기기 해상도 기록 없음. 추천: 자막·설명에 '실해상도' 대신 '2560×1688 태블릿 화면'으로.
3. maieventic 빌더 4종(AI 대화 기획·디자인 3안·빌더 편집·확률·매장 QR): 운영 /create 를 QA 계정으로 1회 열면 analytics_events 1행 쓰기(create/page.tsx:151). 추천: 승인 시 1회 촬영, 아니면 레포 howto 이미지 26장(media/builder-captures)로 대체.

## 보고할 것 (운영 쓰기 가능성)
- fordex: 운영 접속 0(외부 호스트 abort). 로컬 복제 스택(fordex-replica3, 다른 세션 도커 — 컨테이너는 손대지 않음)에 합성 계정 로그인 약 40회 → 복제 DB 세션 행만 남음.
- maieventic: 로그인 POST 1회(QA 풀 #1). 가로챈 요청 19. 관리자 화면 GET 렌더 쓰기 못 찾음(관리자 클라이언트의 읽기 API 내부 쓰기는 끝까지 추적 못 함).
- medimajor: 로그인 POST 2회(테스트 판매자 1·qa-admin 1, 인증 세션 행). 상세는 MQE-102 1건만 8회, 모든 UA 가 BOT 정규식(lot-stats.ts:16)에 걸림(조회수 미기록). 판매 마법사 쓰기 RPC 3종 9건은 가로챔. 관리자 경로에 GET 렌더 쓰기·접근 로그 없음(src/app/admin grep).
- sealkitt: `/api/suggest` 15회·`/api/search` 7회(첫 촬영 3 + 페이지 재촬영 4)마다 `rpc api_rate_take` 가 `api_rate_hits` upsert(IP별 속도 제한 카운터, 0190_api_rate_limit.sql:40-41 — 헤더로 못 피함). 카드 상세 약 24회 열람 때 `/api/ebay-*`·`/api/snkr-*` GET 자동 호출(캐시 미스 때 서버 쓰기 여부 미확인). 시세 축 조사로 카드 상세 HTML 4,331건 GET(JS 없음, 브라우저 비콘 없음). Realtime presence 웹소켓 접속.
- medimajor 조사 중 curl GET 1회(일반 UA)로 매물 MQE-102 조회수 +1 가능성(lot-stats.ts:16 BOT 정규식에 안 걸림).

## 기록
- sealkitt 고객 레포 status 가 기준선과 다름: 형제 sealkitt 세션이 23:44Z WIP 커밋(1ec0355e)·docs/handoff/HANDOFF.md 수정·docs/audit/2026-11-06/w342-s1/ 생성 — 이 작업은 ~/sealkitt 에 쓰지 않음(로컬 사본·서버 없음, 운영 URL 만).
- 기준선: docs/baseline/<repo>.status·.worktrees·SUMMARY.txt (22:44Z)

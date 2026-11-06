# PROGRESS — 숨고 포트폴리오 영상 재료 (prism-media)

# 2차 — 남은 10편 (2026-11-06 07:20Z~, 원문 docs/specs/portfolio-capture-2.md)
순서: okjob → matchsat → hanil → eureka → sy-motors → pscompany → edubily → switin → soopon → waylog. 프로젝트마다 커밋·push. 1차 9개 폴더는 다시 찍지 않는다.

## 2차 지시와 코드가 다른 점 (2026-11-06 07:30~08:00Z 사전 조사 · 근거 <proj>/RECON.md)
- **okjob**(~/Okjob): '월간 대시보드 가동률 히트맵'은 「월간 현황」(/dashboard) 달력 칸 안 미니 게이지. 중복 배정은 차단이 아니라 확인창(같은 날 2건은 허용 사양). 저장된 배정 탭은 일별·월별(날짜별 목록)·근로자별(=매트릭스, 기본 탭)·기간 배정. 단가표는 「시간 단가」「일당 단가」 2탭, 알림톡 메뉴는 「알림톡 발송」. 모바일 홈은 /dashboard 반응형(PWA 시작 주소). 엑셀은 서버 라우트(로그인 필요) → 로컬에서 받아 soffice 로 PNG. supabase/config.toml 없음·seed-dev.ts 는 1~2행 exit 로 막힘·db 스크립트는 항상 운영 API → 사본에서 `supabase init` + `db reset --local` 만. '엑셀에서 옮긴 배정 건수'는 전제 불성립(배정은 앱 입력, 엑셀 이관은 근로자 187명·농가). manual/shots 는 36장(문서는 60)·옛 UI.
- **matchsat**(~/satorder, satorder.kr): 패키지는 pnpm 아닌 npm·웹은 루트. '수요 등록'=「위성영상주문」(/rfqs/new 4단계), '수요 목록·입찰'=「주문 입찰」(/rfqs, 공급자 전용). '지정 매칭'·'매칭 재지정'은 독립 화면 아님(특별주문 하위 흐름·/admin 하단 섹션, 거절된 지정 매칭 있을 때만). 주문 수정 조건 4가지(본인·open·입찰 0·imaging). 입찰은 주문당 1회(재입찰=수정), 밀봉·횟수 제한 없음. 운영 Supabase 정지(DNS 안 풀림) → 운영 데이터 화면 촬영 불가, 로컬 Supabase+사본(마이그레이션 23·시드 없음). 계약서·견적서 서버에 없음 → 조항 인용 불가.
- **hanil**(~/hanil): 10-02 오픈 끝(www.hanil-pnk.com) — 브리프 preopen 방침은 낡음. 사진 교체는 2화면(배경 /admin/backgrounds 만 초점 지정, 제품 사진 /admin/product-photos 는 교체·순서만). 문구 수정은 폼 17개. 문의·견적은 한 접수함(/admin/inquiries). 제출은 서버 액션(견적 첨부는 고르는 즉시 운영 Storage 업로드·제출 시 메일 발송) → 운영에선 파일 선택·제출 안 함. 설비현황 3탭 24행(브리프 49항목과 다름). 기획서 원문·대조 스크립트 레포에 없음. config.toml·seed 없음(마이그레이션 12).
- **eureka**: 소스 없음(서버·GitHub). 상호가 운영에선 「노모어누수」(유레카 0건, 같은 프로젝트 근거 ~/easysite/src/config/portfolio.ts:113). leak-site.vercel.app 은 404, 운영 nomorenusu.com(Cloudflare). 견적 폼은 단계 없는 한 장(사진 선택 최대 3장). 현황판은 데모 모드(NEXT_PUBLIC_LIVE_BOARD_DEMO). 상태 4단계 이름 작업접수·상담진행·작업출동·작업완료. 지역 파라미터는 ?city= 가 아니라 /seoul/<구>/<동> 경로. 게시판 이름 「작업사례」(/posts, 550건). GA ID 비어 GA 꺼짐. 관리자 계정·소스 없음 → 관리자 BLOCKED.
- **sy-motors**(~/kakaoauto): 실단말 캡처 0건 → 응답 JSON 3흐름이 본선. '문자' 알림 없음(사고/긴급만 알림톡, 나머지 6종은 카카오 '나에게 보내기' 메모). 알림톡은 대표 폰 푸시라 고객 화면에 없음·템플릿 본문 레포에 없음. 전달 버튼 이름 「담당자에게 전달하기」. 요약 확인 단계 없어짐. 카테고리 7종(문서의 6종은 낡음). 코드 상호 「에스와이모터스」(지시 SY모터스).
- **pscompany**: 소스 없음·관리자 계정 없음 → 관리자 BLOCKED. 지원서는 단계 없는 한 페이지 폼(/recruit#apply), 사진 첨부 칸 없음(type=file 0). 직군은 폼 라디오 3개(코드 고정) — '모집 직군 관리' 화면 없음. 모바일 폼은 같은 반응형.
- **edubily**: 소스·쇼핑몰 주소 모두 서버에 없음 → 전부 BLOCKED(edubily/BLOCKED.md).
- **switin**: 소스·주소·계정 기록 0(지시 문서 한 줄뿐) → 전부 BLOCKED(switin/BLOCKED.md).
- **soopon**(~/Soopon, sooponfesta.com = 레포 main): '숲ON 처방전' 이름 없음(「내게 맞는 숲 프로그램을 찾아보세요」). 4단계 필터·일정 필터 없음 — 한 화면 3축 칩(누구와 6·어떤 경험 6·지역 9). B2B 는 「숲ON비즈」(/b2b), 상담 폼은 서버 액션. 예약 링크 주소 글자는 화면에 없음(href 만). 프로그램 페이지에 담당자 휴대폰 노출(가림). GA4 켜져 있음(막음).
- **waylog**(~/waylog1): Play 프로덕션은 기록상 1.5.1(vc33), 1.9.0 은 내부 테스트까지(확정 불가). 웹 PWA 운영 = 1.9.0(커밋 3cbb43c) — 작업 트리 v3(초록 개편)는 라이브에 없음. 8주 챌린지는 「8주 식단 챌린지」 오버레이. 'AI 인바디 분석 결과' 전용 화면 없음(「체성분」 탭+「AI 권장 생활습관」 카드). 푸시 설정은 설정 안 「알림」 묶음. '관리자 게시물 관리' 없음(신고 관리·소식 보내기·가입 코드, 신고 0건). Play 스크린샷 원본 없음(옛 시안 1장뿐). 비공개 테스트 인원·기간 서버 기록 없음.

## 2차 완료 조건
- 끝 상태: 10폴더 각각 `python3 tools/check.py <proj>` FAIL 0 또는 못 채운 항목이 BLOCKED.md 에 사유·시도·대안(sy-motors 는 화면 대신 응답 JSON 3흐름 인정) · 모든 캡처 json pii_scan 0 + ocr.py 걸림 0(걸린 건 판정 기록) · 비GET 은 가로챔 · 파일 <95MB · 프로젝트별 커밋 push 해시 · 고객 레포 git status 가 docs/baseline2 와 같고 임시 서버·사본·로컬 Supabase 스택 0
- 증거: check.py·ocr.py 출력, git log·push, baseline2 비교 출력, `ss -ltnp`·`docker ps` 출력 → docs/evidence/final2-2026-11-06.txt
- 바꾸면 안 되는 것: 고객 레포 코드·git 상태·DB·설정·배포, okjob·hanil 운영 로그인 0, 새 계정 0, 유료 호출(AI·문자·알림톡) 0, 1차 9폴더, 가림 정규식·게이트 기준
- 최대 턴: 200
- 기준선: docs/baseline2/<repo>.status·.worktrees·SUMMARY.txt (07:40Z)

## 2차 NOW
- 07:45Z 사전 조사 10건 끝(<proj>/RECON.md), 다른 점 위에 적음. edubily·switin 은 소스·주소가 서버에 없어 BLOCKED.md(시도 2번·대안: 주소 받으면 바로 촬영).
- 07:50Z 촬영 서브에이전트 6건 시작(종료 11:00Z, waylog 11:30Z): okjob(로컬 Supabase pm-okjob 57010~·3611) · matchsat(pm-matchsat 57020~·3612) · hanil(공개=운영 GET, 관리자=pm-hanil 57030~·3613) · eureka(운영 nomorenusu.com GET, 관리자 BLOCKED) · sy-motors(사본 드라이런 3615 + 목 PostgREST 3616, 응답 JSON 3흐름) · waylog(v1.9.0 사본 3614 + 가짜 응답). 남은 것: pscompany·soopon(운영 공개 화면, 1묶음 하나 끝나면 시작).
- 커밋(push 됨): 준비 4592832 · sy-motors 46760b1(JSON 3흐름 32+로그 3, pii 0/34, 화면 FAIL 7 은 BLOCKED 사유) · pscompany 0137908(check FAIL 0·OCR 0/25, 관리자 BLOCKED, 수익 문구 가림 — 결정 필요 후보). · soopon ba05d68(FAIL 0·OCR 0/63) · matchsat de7196e(FAIL 0·OCR 0/31, 로컬 DB, next dev 렌더 — 빌드 게이트 75, danger-guard 가 db reset --local 막음 → 우회 없이 seed-tail.sql, 3→4단계 예산 오류 배너는 고객 앱 실제 동작). · waylog 575da0a(FAIL 0·OCR 0/39·브랜드 OCR 0/56, vite dev 렌더, Play 버전·스토어 스크린샷 BLOCKED). · hanil 74979f2(FAIL 0·OCR 0/76, 관리자 로컬 next dev, 접근성 실측 4/6 100·96·95).
- 09:13Z 서버 스왑 24.4/24.5G(남의 세션: safefile tsserver 3.4G·Medimajor next 3.2G·gochingphone Gradle 2.8G — 사용 중이라 안 건드림), PSI 낮음. 남은 촬영: okjob·eureka.
- 결정 필요 후보: sy-motors 상호(코드 「에스와이모터스」 vs 방침 SY모터스) · 질문 속 예시 번호(12가3456·010-1234-5678)도 가림에 걸림 · eureka 상호(운영 노모어누수) · pscompany 수익 문구 가림 여부 · waylog Play 버전.
- 서버 부하: load ~40/8코어(남의 빌드들) → heavy-run build 대기 13. 우리 빌드는 대기열에서 차례.
- 공통 지침 docs/CAPTURE-BRIEF-2.md(로컬 Supabase 안전 8단계), 기준선 docs/baseline2. 검수 절차는 1차와 같음: check.py FAIL 0 · ocr.py 판정 · contact.jpg 직접 보기 · 비밀값 grep · 기준선 diff · 포트·컨테이너·사본 0 → 프로젝트별 커밋·push.
- 결정(세션): 사본은 지시의 worktree 대신 git archive(원본 git 상태 무변경, 1차와 같음). 촬영은 병렬, 커밋은 끝난 순서대로(잃지 않게).

---
# 1차 — 9편 (끝남)

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
- 2026-11-06 03:40Z 끝남: 9편 모두 커밋, 독립 검증 '완료'(FAIL 0, 판단 필요 3 — 운영 쓰기 흔적·push 불가·기준선 DIFF 2곳은 형제 세션). 증거 docs/evidence/final-2026-11-06.txt.
- 도구 구멍 2개 발견·수정: 중첩 span 으로 쪼갠 번호(48eb3c3, byclick 진짜 원인) · <html> 교체 시 실시간 가림 끊김(09603a2). selftest 27/27, code-review medium 5회.
- push 끝: 사용자가 저장소 생성 → origin/main = 7366bac(pre-push gitleaks 통과). 남은 것: 결정 필요 2건(nowflix 해상도 표기·maieventic 빌더 촬영).

## 지난 NOW (2026-11-06 재개 이후, 위가 최신)
- 03:36Z 9편 모두 커밋(posco 42c49dd). 증거 docs/evidence/final-2026-11-06.txt(tools/final-evidence.sh): check FAIL 0 ×9 · pii_scan≠0 0/569 · 요소 재검사 0 · 95MB 초과 0 · 임시 사본·포트 0 · 기준선 같음 7/9(sealkitt·maimai-event-builder 는 형제 세션 문서 작업, '기록' 절). 독립 검증 서브에이전트 대조 중. ※ 이번 재개 이후 아래 NOW 줄의 시각(02:40Z~03:55Z)은 추정으로 적은 값이라 실제와 다르다(실제 9편 완료 03:34Z).
- 03:55Z byclick 검수 끝 → 커밋 9261fbe(check FAIL 0·OCR 1건 오탐(정산서 문서번호, PNG 직접 확인)·elements 0·관리자 재촬영 가림 확인·기준선 같음·서버 0). 운영 딜러 로그인·가입 하단 회사 정보(대표자 실명·주소·1566 번호) 숨기고 재촬영. lib 쪼갠 글자 처리는 리뷰 8건 반영해 run(같은 블록 인라인 텍스트 노드) 방식으로 재설계 — 시험 25/25, 3회차 리뷰 중(미커밋). 남은 것: posco.
- 03:40Z 정정: byclick 연락처 노출의 진짜 원인은 앱이 번호를 중첩 span 으로 쪼개 그린 것(노드 단위 가림·검사가 못 잡음, byclick 서브에이전트 발견). 09603a2 의 루트 교체 수정은 재현된 별개 구멍. lib 에 쪼갠 글자 가림·검사 추가(작은 요소 innerText 역순 + body.innerText 검사), 회귀 시험 2건(원래 lib FAIL·지금 PASS, 22/22), code-review medium 중. 커밋분 6편+jipyeong 은 elements(요소 묶음 글자) 재검사 0 이라 영향 없음.
- 03:25Z jipyeong 검수 끝 → 커밋 6e56787(check FAIL 0·OCR 0/110·elements 0·비밀값 0·기준선 같음·서버 0). shake-mix 끝 0.37초 흰 전환은 shots.md 메모. 촬영 스크립트가 전화번호 타이핑 중에만 lib 입력 가림 리스너를 끔(`__noLiveInput`, React 상태 깨짐 때문) — 저장 전후 검사는 그대로. 남은 것: posco(재빌드 중)·byclick 6장(빌드 중).
- 03:10Z 사용자 지시 '바로 해주라' → heavy-run 게이트 대기 중단, posco·jipyeong 관리자·byclick 6장 빌드를 `nice -n 10 npm run build` 로 직접 실행(게이트는 CPU 95%·load 17.6 으로만 닫힘, 가용 22.6G·스왑 여유 28%). 04:00Z/03:30Z BLOCKED 기한 없앰.
- 03:05Z lib 수정 커밋 09603a2(관찰자 document+shadow root·try/finally·입력 리스너 1개, 저장·녹화 뒤 검사→가림). 리뷰 medium 2회: 1회차 8건 반영, 2회차는 '찍기 전후 가림 건수 비교'가 정상 화면을 버린다는 지적(관찰자는 마이크로태스크라 그리기 전에 끝남) → 건수 비교 빼고 가리기 전 검사만 유지. 회귀 시험 3건 추가(원래 lib FAIL·지금 PASS, selftest 20/20).
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
- maimai-event-builder 고객 레포 status 가 기준선과 다름(변경 약 500건 docs/mvp/q2-7/… JSON·PROGRESS.md, 수정 01~03시): 형제 세션 작업 — 이 작업의 maieventic 촬영은 00:33Z 에 끝났고 운영 URL 만 찍음(로컬 사본 없음, 스크립트에 이 레포로 쓰는 경로 없음). 독립 검증 03:40Z 확인.
- sealkitt 고객 레포 status 가 기준선과 다름: 형제 sealkitt 세션이 23:44Z WIP 커밋(1ec0355e)·docs/handoff/HANDOFF.md 수정·docs/audit/2026-11-06/w342-s1/ 생성 — 이 작업은 ~/sealkitt 에 쓰지 않음(로컬 사본·서버 없음, 운영 URL 만).
- 기준선: docs/baseline/<repo>.status·.worktrees·SUMMARY.txt (22:44Z)

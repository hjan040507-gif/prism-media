웹 PWA 1.9.0(3cbb43c) 기준. Play 프로덕션은 레포 기록상 1.5.1(vc33) — 1.9.0 은 내부 테스트까지 기록, 확정 불가

# waylog 촬영 목록 (shots.md)

## 어떻게 찍었나 (공통)
- 소스: `git -C ~/waylog1 archive 3cbb43c`(= 태그 v1.9.0 = 운영 웹 waylog1.vercel.app 과 같은 커밋) 사본을 레포 audit/ 하네스 설정(audit/vite.audit.config.mjs — .env* 안 읽음, 가짜 VITE_SUPABASE_URL=http://supabase.waylog.test)의 vite dev 서버로 포트 3614 에서 서빙해 찍었다(prod 빌드는 heavy-run 대기열에서 못 나와 dev 로 — BLOCKED.md 6번; 화면·CSS 는 같고 개발 모드 경고만 다름). 작업 트리(v3 초록 개편)는 쓰지 않았다. 사본·서버는 촬영 뒤 지움.
- 백엔드는 전부 가짜: 앱의 Supabase REST·Auth·Storage·Functions 요청은 page.route 로 레포 audit/lib/mock.mjs(가짜 DB 픽스처 · 기준 시각 2026-09-25 14:00 KST로 page.clock 고정)가 응답한다. 운영 Supabase 호스트(*.supabase.co)는 가짜 200 으로 막고(차단 0건 — 앱이 아예 안 보냄), 제품 사진 CDN(media.amway.co.kr)은 abort. 운영 로그인·운영 접속 0(Play 심사 계정 포함). 허용한 외부 요청은 글꼴 CSS·파일 CDN(cdn.jsdelivr.net, Pretendard) 읽기뿐.
- AI 는 새로 부른 적 없다: `/functions/v1/claude`·`verify-facepack` 는 하네스의 가짜 응답. 체성분 「AI 분석」 기록은 저장된 결과를 읽는 GET `/rest/v1/inbody_records` 모양의 가짜 행(audit/lib/fixtures.mjs inbody_records, `analyzed_by_ai`·`weekly_lifestyle`)이다.
- 가짜 값: 회원 닉네임(초록산책 등)·후기·글·댓글·신고 5건·가입 코드 4건·체성분 수치(72.0→70.4kg)·챌린지 진행(17일째)·알림 전부 하네스의 가짜 픽스처다. 실회원 데이터 0.
- 공개 표기: 제품 회사·브랜드명 글자는 화면에서 지웠다 — 가짜 DB 의 제품 이름은 중립 이름으로 바꾸고, 앱 상수의 미션·칩·태그·카탈로그 접두어는 DOM 글자 치환(redact.textMap, capture/common.mjs WORDS)으로 지웠다. 제품 사진(로고가 보이는 포장)은 하네스 AUDIT_NOBRAND=1 로 아예 뺐다. 제품 탭·제품 상세·설정의 법적 고지(브랜드 명시)·1일1팩 화면은 찍지 않았다. 화면마다 DOM 검사(common.mjs brandGuard)와 OCR 검사(capture/brand-ocr.py)로 브랜드 글자 0 을 확인했다(아래 「브랜드 글자 OCR 결과」).
- 가림: 이메일(설정 「이메일」 값)은 lib 이 지운다. 가짜 닉네임·가짜 후기라 이름 가림(김○○)은 쓰지 않았다. pii_scan 0.
- 오버레이 화면: 이 PWA 의 설정·챌린지·체성분·관리자는 주소가 아니라 fixed 오버레이(안쪽 스크롤)다. `*-view.png` = 열린 그대로 첫 화면, `*-full.png` = 같은 오버레이를 안쪽 스크롤 높이만큼 펴서(뒤 화면 숨김, DOM·CSS 그대로 높이만) 찍은 전체 한 장(capture/common.mjs captureOverlay).
- 앱 버전 표기: 설정 「버전 1.9.0」. 푸시 「켜기」는 누르지 않았다(권한·구독 등록 없음). 토글·입력은 가짜 백엔드 메모리에만 반영.

## 지시와 실제 화면 이름 (지시의 ○○ = 실제 △△)
- 지시의 「리뷰 상세」 = 후기 상세(/review/:id)와 이야기 상세(/post/:id) 두 종류 — 둘 다 찍음.
- 지시의 「8주 챌린지」 = 「8주 식단 챌린지」 오버레이(챌린지 탭 → 카드). 1.5.1 의 「바디키 8주 챌린지」와 다름.
- 지시의 「AI 인바디 분석 결과」 = 전용 화면 없음. 화면 글자는 「체성분」: 챌린지 오버레이 「체성분」 탭의 「체성분 기록」(inbody-records) → 「AI 분석」 행을 누르면 저장된 결과 「AI 분석 결과」(inbody-ai-result), 챌린지 오늘 탭 아래 「이번 주 권장 생활습관」 카드(states/challenge-8wk-open/04).
- 지시의 「푸시 알림 설정」 = 설정 안 「알림」 묶음(「푸시 알림 켜기」 행 + 토글 5종).
- 지시의 「관리자 게시물 관리」 = 그런 화면 없음 → 설정 하단 「관리자」 묶음의 「신고 모더레이션」(화면 제목 「신고 관리」)·「소식 보내기」·「가입 코드」.
- 데스크톱 1440: 이 PWA 는 큰 화면 전용 레이아웃이 없다 — 모바일 폭 칼럼을 가운데 두고 양옆은 빈 바탕(max-w 칼럼). 그대로 찍었다.

## 파일
- `desktop/admin-reports-full.png` — 데스크톱 1440×900·DSF2 전체(끝까지) — 관리자 「신고 관리」 오버레이 — 소식 보내기 버튼·새 신고/처리함 탭·가짜 신고 3건(숨기기/문제없음 버튼은 안 누름). 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 1
- `desktop/admin-reports-view.png` — 데스크톱 1440×900·DSF2 첫 화면 — 관리자 「신고 관리」 오버레이 — 소식 보내기 버튼·새 신고/처리함 탭·가짜 신고 3건(숨기기/문제없음 버튼은 안 누름). 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 1
- `desktop/challenge-8wk-full.png` — 데스크톱 1440×900·DSF2 전체(끝까지) — 「8주 식단 챌린지」 오버레이(오늘 탭) — 표지·17일째/56일 중·주차 막대·도장판·미션 체크·식단·운동·AI 권장 생활습관 카드. 미션 문구의 제품명은 글자 치환. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 20
- `desktop/challenge-8wk-view.png` — 데스크톱 1440×900·DSF2 첫 화면 — 「8주 식단 챌린지」 오버레이(오늘 탭) — 표지·17일째/56일 중·주차 막대·도장판·미션 체크·식단·운동·AI 권장 생활습관 카드. 미션 문구의 제품명은 글자 치환. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 20
- `desktop/challenge-tab-full.png` — 데스크톱 1440×900·DSF2 전체(끝까지) — 챌린지 탭(/challenge) — 1일1팩 카드·8주 식단 챌린지 카드·오늘 인증한 회원. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 13
- `desktop/challenge-tab-view.png` — 데스크톱 1440×900·DSF2 첫 화면 — 챌린지 탭(/challenge) — 1일1팩 카드·8주 식단 챌린지 카드·오늘 인증한 회원. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 13
- `desktop/home-full.png` — 데스크톱 1440×900·DSF2 전체(끝까지) — 홈 피드(칩 4개·1일1팩 배너·카드 목록, 하단 탭 5칸). 가짜 글·닉네임. 제품 이름 중립 치환. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 8
- `desktop/home-view.png` — 데스크톱 1440×900·DSF2 첫 화면 — 홈 피드(칩 4개·1일1팩 배너·카드 목록, 하단 탭 5칸). 가짜 글·닉네임. 제품 이름 중립 치환. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 8
- `desktop/notifications-full.png` — 데스크톱 1440×900·DSF2 전체(끝까지) — 알림 탭(/notifications) — 그룹별 알림 목록(가짜 알림). 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 16
- `desktop/notifications-view.png` — 데스크톱 1440×900·DSF2 첫 화면 — 알림 탭(/notifications) — 그룹별 알림 목록(가짜 알림). 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 16
- `desktop/post-detail-full.png` — 데스크톱 1440×900·DSF2 전체(끝까지) — 이야기 상세 /post/:id — 사진·본문·좋아요·댓글 2개(가짜)·제품 카드(브랜드 접두어 지움). 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 10
- `desktop/post-detail-view.png` — 데스크톱 1440×900·DSF2 첫 화면 — 이야기 상세 /post/:id — 사진·본문·좋아요·댓글 2개(가짜)·제품 카드(브랜드 접두어 지움). 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 10
- `desktop/settings-notifications-full.png` — 데스크톱 1440×900·DSF2 전체(끝까지) — 설정 오버레이 — 「알림」 묶음(푸시 알림 켜기 행 + 토글 5종: 좋아요·댓글·팔로우·챌린지 리마인더·앱 소식). 이메일 값은 지움. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 24
- `desktop/settings-notifications-view.png` — 데스크톱 1440×900·DSF2 첫 화면 — 설정 오버레이 — 「알림」 묶음(푸시 알림 켜기 행 + 토글 5종: 좋아요·댓글·팔로우·챌린지 리마인더·앱 소식). 이메일 값은 지움. 1440 에서도 모바일 폭 칼럼 그대로(양옆 빈 바탕) · scrollY 0 · 가로챈 요청 누적 24
- `media/icon-192.png` — 앱 아이콘 192(public/icons/icon-192.png)
- `media/icon-512.png` — 앱 아이콘 512 — 빨간 도장 위 「웨이로그」(레포 public/icons/icon-512.png, 브랜드 글자 없음)
- `media/icon-background.svg` — 아이콘 배경 SVG(resources/icon-background.svg)
- `media/icon-foreground.svg` — 아이콘 전경 SVG(resources/icon-foreground.svg)
- `media/icon-only.svg` — 아이콘 SVG(resources/icon-only.svg)
- `media/playstore-icon-512.png` — playstore-icon-512.png
- `mobile/admin-news-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 관리자 「소식 보내기」 화면 — 제목 50자·본문 200자 입력칸·「모든 사용자에게 발송」(안 누름) · scrollY 0 · 가로챈 요청 누적 1
- `mobile/admin-news-view.png` — 모바일 390×844·DSF3 첫 화면 — 관리자 「소식 보내기」 화면 — 제목 50자·본문 200자 입력칸·「모든 사용자에게 발송」(안 누름) · scrollY 0 · 가로챈 요청 누적 1
- `mobile/admin-reports-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 관리자 「신고 관리」 오버레이 — 소식 보내기 버튼·새 신고/처리함 탭·가짜 신고 3건(숨기기/문제없음 버튼은 안 누름) · scrollY 0 · 가로챈 요청 누적 1
- `mobile/admin-reports-view.png` — 모바일 390×844·DSF3 첫 화면 — 관리자 「신고 관리」 오버레이 — 소식 보내기 버튼·새 신고/처리함 탭·가짜 신고 3건(숨기기/문제없음 버튼은 안 누름) · scrollY 0 · 가로챈 요청 누적 1
- `mobile/admin-signup-codes-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 관리자 「가입 코드」 오버레이 — 새 코드 발급 폼·가짜 코드 4건(DIET8WEEK 등, 하네스 가짜 값. 원래 이름의 브랜드 글자는 치환) · scrollY 0 · 가로챈 요청 누적 1
- `mobile/admin-signup-codes-view.png` — 모바일 390×844·DSF3 첫 화면 — 관리자 「가입 코드」 오버레이 — 새 코드 발급 폼·가짜 코드 4건(DIET8WEEK 등, 하네스 가짜 값. 원래 이름의 브랜드 글자는 치환) · scrollY 0 · 가로챈 요청 누적 1
- `mobile/challenge-8wk-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 「8주 식단 챌린지」 오버레이(오늘 탭) — 표지·17일째/56일 중·주차 막대·도장판·미션 체크·식단·운동·AI 권장 생활습관 카드. 미션 문구의 제품명은 글자 치환 · scrollY 0 · 가로챈 요청 누적 17
- `mobile/challenge-8wk-view.png` — 모바일 390×844·DSF3 첫 화면 — 「8주 식단 챌린지」 오버레이(오늘 탭) — 표지·17일째/56일 중·주차 막대·도장판·미션 체크·식단·운동·AI 권장 생활습관 카드. 미션 문구의 제품명은 글자 치환 · scrollY 0 · 가로챈 요청 누적 17
- `mobile/header.png` — 모바일 390×844·DSF3 고정 헤더만(스크롤된 상태, 웨이로그 로고·검색) · scrollY 600 · 가로챈 요청 누적 8
- `mobile/home-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 홈 피드(칩 4개·1일1팩 배너·카드 목록, 하단 탭 5칸). 가짜 글·닉네임. 제품 이름 중립 치환 · scrollY 0 · 가로챈 요청 누적 8
- `mobile/home-view.png` — 모바일 390×844·DSF3 첫 화면 — 홈 피드(칩 4개·1일1팩 배너·카드 목록, 하단 탭 5칸). 가짜 글·닉네임. 제품 이름 중립 치환 · scrollY 0 · 가로챈 요청 누적 8
- `mobile/inbody-ai-result-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 체성분 AI 분석 결과(저장된 결과 읽기 전용) — 측정 결과·AI 분석 문장·「이번 주 권장 생활습관」 4카드·팁. 새 AI 호출 0(inbody_records GET 가짜 행) · scrollY 0 · 가로챈 요청 누적 17
- `mobile/inbody-ai-result-view.png` — 모바일 390×844·DSF3 첫 화면 — 체성분 AI 분석 결과(저장된 결과 읽기 전용) — 측정 결과·AI 분석 문장·「이번 주 권장 생활습관」 4카드·팁. 새 AI 호출 0(inbody_records GET 가짜 행) · scrollY 0 · 가로챈 요청 누적 17
- `mobile/inbody-records-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 체성분 기록 오버레이 — 최근 기록 비교·체중 변화 그래프·기록 히스토리(「AI 분석」 행 포함, 가짜 수치) · scrollY 0 · 가로챈 요청 누적 17
- `mobile/inbody-records-view.png` — 모바일 390×844·DSF3 첫 화면 — 체성분 기록 오버레이 — 최근 기록 비교·체중 변화 그래프·기록 히스토리(「AI 분석」 행 포함, 가짜 수치) · scrollY 0 · 가로챈 요청 누적 17
- `mobile/post-detail-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 이야기 상세 /post/:id — 사진·본문·좋아요·댓글 2개(가짜)·제품 카드(브랜드 접두어 지움) · scrollY 0 · 가로챈 요청 누적 13
- `mobile/post-detail-view.png` — 모바일 390×844·DSF3 첫 화면 — 이야기 상세 /post/:id — 사진·본문·좋아요·댓글 2개(가짜)·제품 카드(브랜드 접두어 지움) · scrollY 0 · 가로챈 요청 누적 13
- `mobile/review-detail-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 후기 상세 /review/:id — 사진 3장·본문·태그·「이 글에 나온 제품」 칸(제품 사진 없음)·좋아요·댓글 입력 · scrollY 0 · 가로챈 요청 누적 11
- `mobile/review-detail-view.png` — 모바일 390×844·DSF3 첫 화면 — 후기 상세 /review/:id — 사진 3장·본문·태그·「이 글에 나온 제품」 칸(제품 사진 없음)·좋아요·댓글 입력 · scrollY 0 · 가로챈 요청 누적 11
- `mobile/settings-notifications-full.png` — 모바일 390×844·DSF3 전체(끝까지) — 설정 오버레이 — 「알림」 묶음(푸시 알림 켜기 행 + 토글 5종: 좋아요·댓글·팔로우·챌린지 리마인더·앱 소식). 이메일 값은 지움 · scrollY 0 · 가로챈 요청 누적 20
- `mobile/settings-notifications-view.png` — 모바일 390×844·DSF3 첫 화면 — 설정 오버레이 — 「알림」 묶음(푸시 알림 켜기 행 + 토글 5종: 좋아요·댓글·팔로우·챌린지 리마인더·앱 소식). 이메일 값은 지움 · scrollY 0 · 가로챈 요청 누적 20
- `seq/challenge-open-first.png` — seq 첫 프레임 PNG — challenge-open · scrollY 0 · 가로챈 요청 누적 5
- `seq/challenge-open-last.png` — seq 끝 프레임 PNG — challenge-open · scrollY 0 · 가로챈 요청 누적 5
- `seq/challenge-open.mp4` — seq 영상(모바일 390×844·DSF3, 60fps) — 챌린지 탭에서 「8주 식단 챌린지」 카드를 눌러 오버레이가 아래서 올라오는 연출(1.0초). 방식: page.clock 1/60초씩 runFor + getAnimations currentTime 동기화, 프레임마다 스크린샷 → H.264 CRF12 60fps
- `seq/toggle-switch-first.png` — seq 첫 프레임 PNG — toggle-switch · scrollY 0 · 가로챈 요청 누적 7
- `seq/toggle-switch-last.png` — seq 끝 프레임 PNG — toggle-switch · scrollY 0 · 가로챈 요청 누적 7
- `seq/toggle-switch.mp4` — seq 영상(모바일 390×844·DSF3, 60fps) — 설정 알림 토글(좋아요 알림) 눌러 전환(1.2초). 방식: 같은(page.clock 가상 시간)
- `states/admin-news/01-empty.png` — 모바일 390×844·DSF3 상태 흐름 — 관리자 소식 보내기(발송 안 함, 확인창까지): 빈 폼 · scrollY 0 · 가로챈 요청 누적 1
- `states/admin-news/02-typed.png` — 모바일 390×844·DSF3 상태 흐름 — 관리자 소식 보내기(발송 안 함, 확인창까지): 제목·본문 입력 · scrollY 0 · 가로챈 요청 누적 1
- `states/admin-news/03-confirm-dialog-not-sent.png` — 모바일 390×844·DSF3 상태 흐름 — 관리자 소식 보내기(발송 안 함, 확인창까지): 「모든 사용자에게 보낼까요?」 확인창(보내기 안 누름) · scrollY 0 · 가로챈 요청 누적 1
- `states/challenge-8wk-open/01-tab-list.png` — 모바일 390×844·DSF3 상태 흐름 — 챌린지 탭 → 8주 식단 챌린지 열기(오버레이 안쪽 스크롤만 다름, window scrollY 0): 챌린지 탭 카드 목록 · scrollY 0 · 가로챈 요청 누적 4
- `states/challenge-8wk-open/02-overlay-top.png` — 모바일 390×844·DSF3 상태 흐름 — 챌린지 탭 → 8주 식단 챌린지 열기(오버레이 안쪽 스크롤만 다름, window scrollY 0): 오버레이 열림(표지·도장판) · scrollY 0 · 가로챈 요청 누적 5
- `states/challenge-8wk-open/03-mission-checklist.png` — 모바일 390×844·DSF3 상태 흐름 — 챌린지 탭 → 8주 식단 챌린지 열기(오버레이 안쪽 스크롤만 다름, window scrollY 0): 이번 주 미션 체크리스트 · scrollY 0 · 가로챈 요청 누적 5
- `states/challenge-8wk-open/04-ai-lifestyle-card.png` — 모바일 390×844·DSF3 상태 흐름 — 챌린지 탭 → 8주 식단 챌린지 열기(오버레이 안쪽 스크롤만 다름, window scrollY 0): AI 권장 생활습관 카드(저장된 결과) · scrollY 0 · 가로챈 요청 누적 5
- `states/notif-toggles/01-initial.png` — 모바일 390×844·DSF3 상태 흐름 — 알림 토글 전환(설정 오버레이, 같은 scrollY): 처음(5종 전부 켜짐) · scrollY 0 · 가로챈 요청 누적 3
- `states/notif-toggles/02-challenge-reminder-off.png` — 모바일 390×844·DSF3 상태 흐름 — 알림 토글 전환(설정 오버레이, 같은 scrollY): 챌린지 리마인더 끔 · scrollY 0 · 가로챈 요청 누적 4
- `states/notif-toggles/03-follow-off.png` — 모바일 390×844·DSF3 상태 흐름 — 알림 토글 전환(설정 오버레이, 같은 scrollY): 팔로우 알림 끔 · scrollY 0 · 가로챈 요청 누적 5
- `states/notif-toggles/04-news-off.png` — 모바일 390×844·DSF3 상태 흐름 — 알림 토글 전환(설정 오버레이, 같은 scrollY): 앱 소식 끔 · scrollY 0 · 가로챈 요청 누적 7
- `states/story-compose/01-write-sheet.png` — 모바일 390×844·DSF3 상태 흐름 — 이야기 쓰기(제출 직전까지, 「올리기」 안 누름): 「무엇을 올릴까요?」 시트 · scrollY 0 · 가로챈 요청 누적 4
- `states/story-compose/02-story-empty.png` — 모바일 390×844·DSF3 상태 흐름 — 이야기 쓰기(제출 직전까지, 「올리기」 안 누름): 이야기 쓰기 빈 폼 · scrollY 0 · 가로챈 요청 누적 4
- `states/story-compose/03-story-filled.png` — 모바일 390×844·DSF3 상태 흐름 — 이야기 쓰기(제출 직전까지, 「올리기」 안 누름): 글 입력 후(제출 직전) · scrollY 0 · 가로챈 요청 누적 4

## 브랜드 글자 OCR 결과
- 화면 PNG 글자를 tesseract(kor+eng)로 읽어 제품 회사·브랜드명 목록(capture/brand-ocr.py, RECON.md §6)과 대조: `# 브랜드 글자 OCR(tesseract kor+eng) · 대상 56장 · 걸림 0` — full 포함 전부. 양성 대조(브랜드 글자를 그린 이미지 → 5건 검출)로 검사기가 동작함을 확인.
- 개인정보 OCR(tools/ocr.py, 전화·이메일·주민번호·계좌·URL·차량번호): `# OCR(tesseract kor+eng) 독립 검사 · 대상 39장 · 걸림 0` (view·states·seq·media). DOM 검사는 저장마다 pii_scan 0(각 json).
- 화면 DOM 검사(common.mjs brandGuard): 페이지·오버레이 저장 직전 보이는 글자·alt·title·aria-label·placeholder 에 브랜드 낱말이 있으면 저장하지 않고 예외 — 이번 최종 실행에서 걸림 0.

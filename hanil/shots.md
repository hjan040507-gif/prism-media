# hanil shots

- 공개 화면 — 운영 https://www.hanil-pnk.com 을 GET 으로만 열어 찍음(비GET 가로챔 0·허용 비GET 0, 서버 액션 제출·파일 선택 없음). 히어로 자동 전환(setInterval 6000)은 정지시켜 첫 장(01/03) 고정. 가림: 헤더 전화 링크·푸터 회사정보(대표이사·주소·전화·팩스) 제거, 남은 전화 글자는 010-****-****, 대표 이름 김○○.
- 관리자 — 사본 git archive 8a0ee85a + 로컬 Supabase(pm-hanil, 127.0.0.1:57031/57032) + 앱 `next dev -H 127.0.0.1 -p 3613`(Turbopack·개발 배지 끔 — prod 빌드는 BLOCKED.md 사유로 못 씀). 운영 로그인 0·운영 DB 접속 0. 가짜 관리자(로컬 auth) 로 실제 로그인, 가짜 접수 6행(상호 A산업식·이름 김○○·전화 010-****-****·이메일 user***)·가짜 공지 2건. 사진 슬롯 이미지는 사본 public/images 의 실제 사이트 이미지를 로컬 Storage 에 업로드.
- 모든 PNG 옆 같은 이름 .json: 요소 사각형·글자·scrollY·뷰포트·pii_scan(전부 0)·가로챈 요청. 상태 흐름은 같은 뷰포트·같은 scrollY.
- 지시와 다른 점: PRODUCT 랜딩=공정 GUIDE+체계도(/product) · 사진 교체=배경(초점)·제품(교체·순서) 두 화면 · 문구 수정=허브+폼 17개(대표 3개 촬영) · 접수함은 문의·견적 한 목록 · 설비현황 탭 이름은 "주요 제조 설비(1)·(2)·주요 측정 기기"(24행).

## 데스크톱

- `admin-backgrounds-full.png` (desktop) — 배경 사진 관리(`/admin/backgrounds`) — 23영역 39장 카드. 초점은 배경 사진에만 있음(지시의 "사진 교체" 중 초점 지정 화면). [끝까지 스크롤한 전체]
- `admin-backgrounds-view.png` (desktop) — 배경 사진 관리(`/admin/backgrounds`) — 23영역 39장 카드. 초점은 배경 사진에만 있음(지시의 "사진 교체" 중 초점 지정 화면). [첫 화면]
- `admin-content-facility-full.png` (desktop) — 문구 수정 · 설비현황 폼(`/admin/content/facility`) — 대표 폼 3(표 편집). [끝까지 스크롤한 전체]
- `admin-content-facility-view.png` (desktop) — 문구 수정 · 설비현황 폼(`/admin/content/facility`) — 대표 폼 3(표 편집). [첫 화면]
- `admin-content-greeting-full.png` (desktop) — 문구 수정 · 인사말 폼(`/admin/content/greeting`) — 대표 폼 2. 대표 서명 이름은 김○○ 로 가림. [끝까지 스크롤한 전체]
- `admin-content-greeting-view.png` (desktop) — 문구 수정 · 인사말 폼(`/admin/content/greeting`) — 대표 폼 2. 대표 서명 이름은 김○○ 로 가림. [첫 화면]
- `admin-content-home-full.png` (desktop) — 문구 수정 · 메인 화면(히어로 문구) 폼(`/admin/content/home`) — 대표 폼 1. [끝까지 스크롤한 전체]
- `admin-content-home-view.png` (desktop) — 문구 수정 · 메인 화면(히어로 문구) 폼(`/admin/content/home`) — 대표 폼 1. [첫 화면]
- `admin-content-hub-full.png` (desktop) — 문구 수정 허브(`/admin/content`) — 폼 17개 목록. 지시의 "문구 수정" = 실제 허브 + 하위 폼 17개. [끝까지 스크롤한 전체]
- `admin-content-hub-view.png` (desktop) — 문구 수정 허브(`/admin/content`) — 폼 17개 목록. 지시의 "문구 수정" = 실제 허브 + 하위 폼 17개. [첫 화면]
- `admin-dashboard-full.png` (desktop) — 관리자 대시보드(로그인 직후). 머리의 로그인 계정 이메일은 자동 가림으로 비어 있음. [끝까지 스크롤한 전체]
- `admin-dashboard-view.png` (desktop) — 관리자 대시보드(로그인 직후). 머리의 로그인 계정 이메일은 자동 가림으로 비어 있음. [첫 화면]
- `admin-inquiries-full.png` (desktop) — 문의·견적 접수함 목록(`/admin/inquiries`) — 문의·견적 한 목록. 가짜 접수 7행(상호 A산업·B정밀… 가짜 값, 이름 김○○ 등 가림 꼴, 이메일 지움). 가짜 값. [끝까지 스크롤한 전체]
- `admin-inquiries-view.png` (desktop) — 문의·견적 접수함 목록(`/admin/inquiries`) — 문의·견적 한 목록. 가짜 접수 7행(상호 A산업·B정밀… 가짜 값, 이름 김○○ 등 가림 꼴, 이메일 지움). 가짜 값. [첫 화면]
- `admin-inquiry-detail-full.png` (desktop) — 접수 상세(첫 행, 견적 요청 가짜 데이터) — 이메일·전화 가림. 가짜 값. [끝까지 스크롤한 전체]
- `admin-inquiry-detail-view.png` (desktop) — 접수 상세(첫 행, 견적 요청 가짜 데이터) — 이메일·전화 가림. 가짜 값. [첫 화면]
- `admin-login-full.png` (desktop) — 관리자 로그인 화면(입력 전). 로그인은 로컬 GoTrue 로 갔다(운영 아님). [끝까지 스크롤한 전체]
- `admin-login-view.png` (desktop) — 관리자 로그인 화면(입력 전). 로그인은 로컬 GoTrue 로 갔다(운영 아님). [첫 화면]
- `admin-notices-full.png` (desktop) — 공지 관리(`/admin/notices`) — 가짜 공지 2건(지시에 없는 화면). [끝까지 스크롤한 전체]
- `admin-notices-view.png` (desktop) — 공지 관리(`/admin/notices`) — 가짜 공지 2건(지시에 없는 화면). [첫 화면]
- `admin-notifications-full.png` (desktop) — 알림 설정(`/admin/notifications`) — 알림 메일 상태·크론 하트비트 배지(로컬: 키 없음 상태, 지시에 없는 화면). [끝까지 스크롤한 전체]
- `admin-notifications-view.png` (desktop) — 알림 설정(`/admin/notifications`) — 알림 메일 상태·크론 하트비트 배지(로컬: 키 없음 상태, 지시에 없는 화면). [첫 화면]
- `admin-product-photos-full.png` (desktop) — 제품 사진 관리 목록(`/admin/product-photos`) — 12공정. 지시의 "사진 교체" 중 제품 쪽(교체·추가·숨김·순서만, 초점 없음). [끝까지 스크롤한 전체]
- `admin-product-photos-gas-nitriding-full.png` (desktop) — 제품 사진 — 가스질화 상세(`/admin/product-photos/gas-nitriding`, 사진 31칸). 이 화면의 교체 1건이 로컬 Storage 에 반영된 뒤 상태일 수 있음(촬영 순서상 pages 단계는 교체 전). [끝까지 스크롤한 전체]
- `admin-product-photos-gas-nitriding-view.png` (desktop) — 제품 사진 — 가스질화 상세(`/admin/product-photos/gas-nitriding`, 사진 31칸). 이 화면의 교체 1건이 로컬 Storage 에 반영된 뒤 상태일 수 있음(촬영 순서상 pages 단계는 교체 전). [첫 화면]
- `admin-product-photos-view.png` (desktop) — 제품 사진 관리 목록(`/admin/product-photos`) — 12공정. 지시의 "사진 교체" 중 제품 쪽(교체·추가·숨김·순서만, 초점 없음). [첫 화면]
- `company-certifications-full.png` (desktop) — 인증·수상현황(`/company/certifications`, 8종 실스캔 도판). [끝까지 스크롤한 전체]
- `company-certifications-view.png` (desktop) — 인증·수상현황(`/company/certifications`, 8종 실스캔 도판). [첫 화면]
- `company-greeting-full.png` (desktop) — 인사말(`/company/greeting`) — 대표 서명 이름은 김○○ 로 가림. [끝까지 스크롤한 전체]
- `company-greeting-view.png` (desktop) — 인사말(`/company/greeting`) — 대표 서명 이름은 김○○ 로 가림. [첫 화면]
- `company-history-full.png` (desktop) — 연혁(`/company/history`, 타임라인 18건). [끝까지 스크롤한 전체]
- `company-history-view.png` (desktop) — 연혁(`/company/history`, 타임라인 18건). [첫 화면]
- `company-profile-full.png` (desktop) — 회사현황(`/company/profile`) — 지시에 없던 화면(회사소개 6페이지 중 하나)을 더함. 주소·전화는 가림. [끝까지 스크롤한 전체]
- `company-profile-view.png` (desktop) — 회사현황(`/company/profile`) — 지시에 없던 화면(회사소개 6페이지 중 하나)을 더함. 주소·전화는 가림. [첫 화면]
- `esg-full.png` (desktop) — ESG(`/esg`) — 환경·사회·지배구조 3분야 23항목 + 앵커 목차. [끝까지 스크롤한 전체]
- `esg-view.png` (desktop) — ESG(`/esg`) — 환경·사회·지배구조 3분야 23항목 + 앵커 목차. [첫 화면]
- `facility-tab1-manufacturing-1-full.png` (desktop) — 설비현황 탭 1 "주요 제조 설비(1)"(9행) — 탭 클릭 뒤 전체 캡처. 지시의 "설비현황 3탭" = 실제 `/facility` 의 탭 3개. [끝까지 스크롤한 전체]
- `facility-tab1-manufacturing-1-view.png` (desktop) — 설비현황 탭 1 "주요 제조 설비(1)"(9행) — 탭 클릭 뒤 전체 캡처. 지시의 "설비현황 3탭" = 실제 `/facility` 의 탭 3개. [첫 화면]
- `facility-tab2-manufacturing-2-full.png` (desktop) — 설비현황 탭 2 "주요 제조 설비(2)"(6행). [끝까지 스크롤한 전체]
- `facility-tab2-manufacturing-2-view.png` (desktop) — 설비현황 탭 2 "주요 제조 설비(2)"(6행). [첫 화면]
- `facility-tab3-measuring-full.png` (desktop) — 설비현황 탭 3 "주요 측정 기기"(9행). [끝까지 스크롤한 전체]
- `facility-tab3-measuring-view.png` (desktop) — 설비현황 탭 3 "주요 측정 기기"(9행). [첫 화면]
- `header.png` (desktop) — 고정 헤더만(스크롤 600px 상태) — 데스크톱
- `home-full.png` (desktop) — 메인(히어로 첫 장 + 공정 12종 카드 + 회사 지표 + R&D·ESG 카드 + CTA + 푸터). 지시의 "메인(히어로)" = 실제 `/`. [끝까지 스크롤한 전체]
- `home-view.png` (desktop) — 메인(히어로 첫 장 + 공정 12종 카드 + 회사 지표 + R&D·ESG 카드 + CTA + 푸터). 지시의 "메인(히어로)" = 실제 `/`. [첫 화면]
- `product-dlc-full.png` (desktop) — 공정 상세 06 DLC 코팅(`/product/dlc`, 도판 8). [끝까지 스크롤한 전체]
- `product-dlc-view.png` (desktop) — 공정 상세 06 DLC 코팅(`/product/dlc`, 도판 8). [첫 화면]
- `product-full.png` (desktop) — PRODUCT 랜딩 = 실제 "공정 GUIDE" + 표면처리 공정 체계도(6대분류·상세 21행, 행마다 "보기" 링크). 지시의 "PRODUCT 랜딩(공정 체계도)" = 실제 `/product`. [끝까지 스크롤한 전체]
- `product-gas-nitriding-full.png` (desktop) — 공정 상세 04 가스질화(`/product/gas-nitriding`, 도판 31·합성본 6칸 — 가장 풍부). [끝까지 스크롤한 전체]
- `product-gas-nitriding-view.png` (desktop) — 공정 상세 04 가스질화(`/product/gas-nitriding`, 도판 31·합성본 6칸 — 가장 풍부). [첫 화면]
- `product-isonite-tf1-full.png` (desktop) — 공정 상세 01 ISONITE TF1(`/product/isonite-tf1`, 도판 6). [끝까지 스크롤한 전체]
- `product-isonite-tf1-view.png` (desktop) — 공정 상세 01 ISONITE TF1(`/product/isonite-tf1`, 도판 6). [첫 화면]
- `product-vacuum-carburizing-full.png` (desktop) — 공정 상세 12 진공침탄(`/product/vacuum-carburizing`, 도판 3). [끝까지 스크롤한 전체]
- `product-vacuum-carburizing-view.png` (desktop) — 공정 상세 12 진공침탄(`/product/vacuum-carburizing`, 도판 3). [첫 화면]
- `product-view.png` (desktop) — PRODUCT 랜딩 = 실제 "공정 GUIDE" + 표면처리 공정 체계도(6대분류·상세 21행, 행마다 "보기" 링크). 지시의 "PRODUCT 랜딩(공정 체계도)" = 실제 `/product`. [첫 화면]
- `rnd-full.png` (desktop) — R&D(`/rnd`) — 연구 방침 + 연구 분야. [끝까지 스크롤한 전체]
- `rnd-view.png` (desktop) — R&D(`/rnd`) — 연구 방침 + 연구 분야. [첫 화면]
- `support-contact-full.png` (desktop) — 고객지원 · 온라인 문의 폼(`/support/contact`) — 빈 폼(채우기·제출 없음). [끝까지 스크롤한 전체]
- `support-contact-view.png` (desktop) — 고객지원 · 온라인 문의 폼(`/support/contact`) — 빈 폼(채우기·제출 없음). [첫 화면]
- `support-quote-full.png` (desktop) — 고객지원 · 견적 요청 폼(`/support/quote`) — 빈 폼(채우기·제출·파일 선택 없음). [끝까지 스크롤한 전체]
- `support-quote-view.png` (desktop) — 고객지원 · 견적 요청 폼(`/support/quote`) — 빈 폼(채우기·제출·파일 선택 없음). [첫 화면]

## 모바일

- `header.png` (mobile) — 고정 헤더만(스크롤 600px 상태) — 모바일
- `home-full.png` (mobile) — 모바일 메인(히어로 첫 장 고정). 헤더 햄버거. [끝까지 스크롤한 전체]
- `home-view.png` (mobile) — 모바일 메인(히어로 첫 장 고정). 헤더 햄버거. [첫 화면]
- `product-full.png` (mobile) — 모바일 PRODUCT 랜딩 — 체계도가 카드 리스트로 바뀐 모습. [끝까지 스크롤한 전체]
- `product-gas-nitriding-full.png` (mobile) — 모바일 공정 상세(가스질화). 지시의 "공정 상세" = 실제 `/product/gas-nitriding`. [끝까지 스크롤한 전체]
- `product-gas-nitriding-view.png` (mobile) — 모바일 공정 상세(가스질화). 지시의 "공정 상세" = 실제 `/product/gas-nitriding`. [첫 화면]
- `product-isonite-tf1-full.png` (mobile) — 모바일 공정 상세(ISONITE TF1). [끝까지 스크롤한 전체]
- `product-isonite-tf1-view.png` (mobile) — 모바일 공정 상세(ISONITE TF1). [첫 화면]
- `product-view.png` (mobile) — 모바일 PRODUCT 랜딩 — 체계도가 카드 리스트로 바뀐 모습. [첫 화면]
- `support-quote-full.png` (mobile) — 모바일 견적 요청 폼(빈 폼). [끝까지 스크롤한 전체]
- `support-quote-view.png` (mobile) — 모바일 견적 요청 폼(빈 폼). [첫 화면]

## 상태 흐름

- `01-slot-list.png` (states/bg-replace) — 상태 흐름 ⑤ 배경 사진 교체(관리자) 1/5 — 배경 사진 카드 목록(첫 슬롯 "메인 화면 1번째 사진" 선택 전).
- `02-dialog-open.png` (states/bg-replace) — 상태 흐름 ⑤ 배경 사진 교체(관리자) 2/5 — "사진·초점 바꾸기" 다이얼로그(지금 사진 + 사진 고르기).
- `03-photo-uploaded-focal-preview.png` (states/bg-replace) — 상태 흐름 ⑤ 배경 사진 교체(관리자) 3/5 — 사본 public 의 실제 사이트 이미지(hero-space.webp)를 로컬 Storage 에 올린 뒤 — 지금 사진/바꿀 사진 + 초점 지정(십자선) + 데스크톱 16:9·휴대폰 9:16 미리보기.
- `04-focal-point-set.png` (states/bg-replace) — 상태 흐름 ⑤ 배경 사진 교체(관리자) 4/5 — 초점을 오른쪽 위로 옮긴 상태(미리보기 두 개가 따라 움직임).
- `05-saved-list-updated.png` (states/bg-replace) — 상태 흐름 ⑤ 배경 사진 교체(관리자) 5/5 — 저장 뒤 목록(카드가 "바꾼 사진" 상태로 갱신, 되돌리기·원래대로 버튼 생김).
- `01-form-loaded.png` (states/content-edit-home) — 상태 흐름 ⑧ 문구 수정(메인 화면 문구, 관리자) 1/3 — 문구 수정 · 메인 화면 폼 열림.
- `02-headline-edited.png` (states/content-edit-home) — 상태 흐름 ⑧ 문구 수정(메인 화면 문구, 관리자) 2/3 — 메인 카피 수정(가짜 값 — 마침표 하나 더한 로컬 시연 문구).
- `03-saved-message.png` (states/content-edit-home) — 상태 흐름 ⑧ 문구 수정(메인 화면 문구, 관리자) 3/3 — 저장 → "저장되었습니다." 메시지(로컬 DB 에만 반영).
- `01-tab1-manufacturing-1.png` (states/facility-tabs) — 상태 흐름 ② 설비현황 탭 전환(운영) 1/3 — 탭 1 주요 제조 설비(1).
- `02-tab2-manufacturing-2.png` (states/facility-tabs) — 상태 흐름 ② 설비현황 탭 전환(운영) 2/3 — 탭 2 주요 제조 설비(2).
- `03-tab3-measuring.png` (states/facility-tabs) — 상태 흐름 ② 설비현황 탭 전환(운영) 3/3 — 탭 3 주요 측정 기기.
- `01-inbox-list.png` (states/inquiry-status) — 상태 흐름 ⑨ 접수 상태 변경(관리자) 1/3 — 접수함 목록(신규 뱃지 있음).
- `02-detail-new.png` (states/inquiry-status) — 상태 흐름 ⑨ 접수 상태 변경(관리자) 2/3 — 첫 행 상세(신규).
- `03-marked-answered.png` (states/inquiry-status) — 상태 흐름 ⑨ 접수 상태 변경(관리자) 3/3 — "답변완료로 변경" 뒤 — 상태 뱃지 답변완료·버튼이 "신규로 되돌리기"로 바뀜.
- `01-closed.png` (states/mobile-menu) — 상태 흐름 ③ 모바일 햄버거 메뉴(운영, 390) 1/4 — 메뉴 닫힘(메인 첫 화면).
- `02-menu-open.png` (states/mobile-menu) — 상태 흐름 ③ 모바일 햄버거 메뉴(운영, 390) 2/4 — 햄버거 열림(전체화면 메뉴).
- `03-group-1-expanded.png` (states/mobile-menu) — 상태 흐름 ③ 모바일 햄버거 메뉴(운영, 390) 3/4 — "회사소개" 그룹 펼침.
- `04-group-2-expanded.png` (states/mobile-menu) — 상태 흐름 ③ 모바일 햄버거 메뉴(운영, 390) 4/4 — "PRODUCT" 그룹 펼침(앞 그룹은 접힘).
- `01-gallery-before.png` (states/product-photo-reorder) — 상태 흐름 ⑦ 제품 사진 순서 바꾸기(관리자) 1/3 — 갤러리형 섹션 순서 바꾸기 전.
- `02-moved-forward-unsaved.png` (states/product-photo-reorder) — 상태 흐름 ⑦ 제품 사진 순서 바꾸기(관리자) 2/3 — 두 번째 사진을 앞으로 → "순서 저장" 버튼 활성(아직 사이트 미반영).
- `03-order-saved.png` (states/product-photo-reorder) — 상태 흐름 ⑦ 제품 사진 순서 바꾸기(관리자) 3/3 — 순서 저장 완료.
- `01-photo-cards.png` (states/product-photo-replace) — 상태 흐름 ⑥ 제품 사진 교체(관리자) 1/4 — 가스질화 도판 카드 목록(첫 카드 선택 전).
- `02-dialog-open.png` (states/product-photo-replace) — 상태 흐름 ⑥ 제품 사진 교체(관리자) 2/4 — "사진 바꾸기" 다이얼로그.
- `03-new-photo-preview.png` (states/product-photo-replace) — 상태 흐름 ⑥ 제품 사진 교체(관리자) 3/4 — 실제 사이트 이미지(photos/equipment/equi-10.jpg)를 올린 뒤 지금/바꿀 사진 미리보기(초점 없음).
- `04-replaced.png` (states/product-photo-replace) — 상태 흐름 ⑥ 제품 사진 교체(관리자) 4/4 — 저장 뒤 목록.
- `01-empty-form.png` (states/quote-fill) — 상태 흐름 ① 견적 폼 채우기(운영, 제출 직전까지) 1/4 — 빈 폼(스크롤 고정: 폼 첫 줄이 보이게 — 제출 버튼은 이 높이 아래).
- `02-process-selected.png` (states/quote-fill) — 상태 흐름 ① 견적 폼 채우기(운영, 제출 직전까지) 2/4 — "희망 공정"을 ISONITE LS 로 선택.
- `03-fields-filled.png` (states/quote-fill) — 상태 흐름 ① 견적 폼 채우기(운영, 제출 직전까지) 3/4 — 가짜 값 입력(회사 A산업·담당자 김○○·이메일 user***@example.com·전화 010-****-****·소재 SCM440·수량 2,000개·요청사항). 가짜 값.
- `04-consent-ready-to-submit.png` (states/quote-fill) — 상태 흐름 ① 견적 폼 채우기(운영, 제출 직전까지) 4/4 — 개인정보 동의 체크 — 제출 직전. 제출 버튼은 누르지 않음(운영 서버 액션 → 알림 메일 방지). 파일 선택 없음(운영 Storage 업로드 방지).
- `01-empty-form.png` (states/quote-submit-local) — 상태 흐름 ④ 견적 폼 제출(로컬 사본, 같은 코드) 1/3 — 빈 폼(로컬 사본).
- `02-filled-before-submit.png` (states/quote-submit-local) — 상태 흐름 ④ 견적 폼 제출(로컬 사본, 같은 코드) 2/3 — 가짜 값 입력 + 동의 체크, 제출 직전(상호 G기계·담당자 오○○ → 가림 꼴). 가짜 값.
- `03-submitted-success.png` (states/quote-submit-local) — 상태 흐름 ④ 견적 폼 제출(로컬 사본, 같은 코드) 3/3 — 제출 뒤 접수 완료 화면 — 로컬 서버 액션 성공(RESEND 키 없음 → 메일 미발송). 이 제출 1건이 로컬 DB 접수함에 가짜 행으로 들어감.

## seq

- `hero-crossfade.mp4` (seq) — 영상 — 메인 히어로 크로스페이드(운영 `/`, 자동 전환 정지 안 함): 전환 1초 전부터 4.0초, 01/03 → 02/03 (1.4초 불투명도 전환). 방식 recordSeq: page.clock 1/60초 runFor + getAnimations currentTime 동기화(막대 진행은 시작 시점 위치 보정). 240프레임·60fps·CRF12. 운영 GET 만.
- `matrix-to-detail.mp4` (seq) — 영상 — 공정 체계도(/product)에서 "가스질화(GAS NITRIDING)" 행 호버(0.75초) → 클릭(1.0초) → 가스질화 상세(/product/gas-nitriding)로 전환. 4.0초·240프레임·60fps. 방식 recordSeq(page.clock 1/60초 + 애니메이션 동기화, 전환 중 RSC 요청은 실시간). 운영 GET 만.
- `hero-crossfade-first.png` (seq) — 첫 프레임 PNG — hero-crossfade 영상
- `hero-crossfade-last.png` (seq) — 끝 프레임 PNG — hero-crossfade 영상
- `matrix-to-detail-first.png` (seq) — 첫 프레임 PNG — matrix-to-detail 영상
- `matrix-to-detail-last.png` (seq) — 끝 프레임 PNG — matrix-to-detail 영상

## media

- `logo-mark.svg`·`logo-mark-white.svg`·`logo-mark-current.svg` — 로고 마크 원본(파랑·흰색·currentColor). 출처 사본 `public/`(커밋 8a0ee85a) 복사.
- `hero-1-p1-i2.webp`·`hero-2-hero-aircraft.webp`·`hero-3-hero-space.webp` — 메인 히어로 3장 원본. 출처 `public/images/r2/main-hero-{1,2,3}/`. (영상 원본은 레포에 없음)

## 기타

- `brand.json` — 주색 #0B1B33·보조 #098FD6·버건디 #990033(PRODUCT 전용)·폰트 Pretendard Variable, 코드 근거.
- `facts.md` — 자막용 사실 8개와 근거(접근성 Lighthouse 포함).
- `contact.jpg` — 전 캡처 축소 모음(tools/contact.py).
- `capture/*.mjs` — 촬영 스크립트(common·a-desktop·a-mobile·a-flows·a-mobile-flow·a-seq·b-admin), `capture/seed-local.sql`·`seed-admin-user.mjs`·`mkenv.py` 로컬 가짜 데이터·환경, `lighthouse-a11y.sh`·`report-slots.out.txt` 측정 근거, `local-db-check.txt` 로컬 DB 주소 확인 기록.
- `BLOCKED.md` — 못 채운 것.

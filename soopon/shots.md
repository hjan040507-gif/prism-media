# soopon shots — 운영 https://sooponfesta.com 공개 화면 GET 촬영 (2026-11-06)

공통: 가림은 lib 자동(전화→010-****-****, 이메일·URL 지움) + 지역 줄 도로명주소(capture/common.mjs ADDR_FIX). GA/GTM 요청은 가짜 응답으로 막음, 비GET 은 전부 가로챔(json intercepted 참고). 가짜 데이터 값은 상담 폼 입력칸뿐(아래 states 표시). 예약하기·tel·SNS 링크는 누르지 않았다.

지시와 다른 점: 지시의 「숲ON 처방전(고민·동반자·지역·일정 단계)」 = 실제 「내게 맞는 숲 프로그램을 찾아보세요」(3축 칩 동시 선택: 누구와·어떤 경험·지역, 일정 축 없음). 지시의 「B2B 비즈 페이지」 = 「숲ON비즈」(/b2b). 지시의 「상담 신청 폼」 = /b2b#inquiry 절이자 /b2b/inquiry 단독 페이지(같은 InquiryForm, 제출은 서버 액션).


## desktop (1440×900 DSF2)
- `desktop/b2b-full.png` — 숲ON비즈 /b2b(지시의 「B2B 비즈 페이지」) — 활용 목적 4카드·추천 프로그램·참여기업·상담 신청 절 — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `desktop/b2b-inquiry-done-full.png` — 상담 신청 완료 화면(제출 POST 를 가로채 flight 형식 가짜 성공으로 응답 → 실제 클라이언트가 그린 완료 화면, 운영 저장·메일 0) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 가짜 값: 김○○ / A기관 / user***@기관.kr / 010-****-**** 로 입력 후 제출
- `desktop/b2b-inquiry-done-view.png` — 상담 신청 완료 화면(제출 POST 를 가로채 flight 형식 가짜 성공으로 응답 → 실제 클라이언트가 그린 완료 화면, 운영 저장·메일 0) — 첫 화면(스크롤 0) · 가짜 값: 김○○ / A기관 / user***@기관.kr / 010-****-**** 로 입력 후 제출
- `desktop/b2b-inquiry-full.png` — 상담 신청 폼 단독 /b2b/inquiry(빈 폼) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 입력 예시 글자(placeholder)의 전화·이메일 모양은 자동 가림
- `desktop/b2b-inquiry-view.png` — 상담 신청 폼 단독 /b2b/inquiry(빈 폼) — 첫 화면(스크롤 0) · 입력 예시 글자(placeholder)의 전화·이메일 모양은 자동 가림
- `desktop/b2b-view.png` — 숲ON비즈 /b2b(지시의 「B2B 비즈 페이지」) — 활용 목적 4카드·추천 프로그램·참여기업·상담 신청 절 — 첫 화면(스크롤 0)
- `desktop/header.png` — 스크롤된 상태의 고정 머리(로고·메뉴)
- `desktop/home-full.png` — 메인(/) — 히어로·내게 맞는 숲 프로그램 찾기(필터)·추천·기획전·숲ON비즈 배너·소개 — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `desktop/home-view.png` — 메인(/) — 히어로·내게 맞는 숲 프로그램 찾기(필터)·추천·기획전·숲ON비즈 배너·소개 — 첫 화면(스크롤 0)
- `desktop/program-company-4-01-full.png` — 프로그램 상세 /program/company-4-01(예약하기 주 버튼 상세) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 예약 외부 링크 누르지 않음, 지역 줄 상세 도로명주소 지움
- `desktop/program-company-4-01-view.png` — 프로그램 상세 /program/company-4-01(예약하기 주 버튼 상세) — 첫 화면(스크롤 0) · 예약 외부 링크 누르지 않음, 지역 줄 상세 도로명주소 지움
- `desktop/program-forestasan-01-full.png` — 프로그램 상세 /program/forestasan-01(예약하기 주 버튼 · 담당자 휴대폰 노출 없는 상세) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 예약 외부 링크는 누르지 않음(href 는 json 에 기록 안 됨), 지역 줄의 상세 도로명주소 지움
- `desktop/program-forestasan-01-view.png` — 프로그램 상세 /program/forestasan-01(예약하기 주 버튼 · 담당자 휴대폰 노출 없는 상세) — 첫 화면(스크롤 0) · 예약 외부 링크는 누르지 않음(href 는 json 에 기록 안 됨), 지역 줄의 상세 도로명주소 지움
- `desktop/programs-filtered-full.png` — 결과 목록 /programs?who=kids&exp=nature(아이와+자연체험 필터 적용) — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `desktop/programs-filtered-view.png` — 결과 목록 /programs?who=kids&exp=nature(아이와+자연체험 필터 적용) — 첫 화면(스크롤 0)
- `desktop/programs-full.png` — 결과 목록 /programs(필터 없음 · 총 52개 · 12개/쪽 · 정렬·검색) — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `desktop/programs-view.png` — 결과 목록 /programs(필터 없음 · 총 52개 · 12개/쪽 · 정렬·검색) — 첫 화면(스크롤 0)

## mobile (390×844 DSF3 isMobile hasTouch)
- `mobile/b2b-full.png` — 숲ON비즈 /b2b(지시의 「B2B 비즈 페이지」) — 활용 목적 4카드·추천 프로그램·참여기업·상담 신청 절 — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `mobile/b2b-inquiry-done-full.png` — 상담 신청 완료 화면(제출 POST 를 가로채 flight 형식 가짜 성공으로 응답 → 실제 클라이언트가 그린 완료 화면, 운영 저장·메일 0) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 가짜 값: 김○○ / A기관 / user***@기관.kr / 010-****-**** 로 입력 후 제출
- `mobile/b2b-inquiry-done-view.png` — 상담 신청 완료 화면(제출 POST 를 가로채 flight 형식 가짜 성공으로 응답 → 실제 클라이언트가 그린 완료 화면, 운영 저장·메일 0) — 첫 화면(스크롤 0) · 가짜 값: 김○○ / A기관 / user***@기관.kr / 010-****-**** 로 입력 후 제출
- `mobile/b2b-inquiry-full.png` — 상담 신청 폼 단독 /b2b/inquiry(빈 폼) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 입력 예시 글자(placeholder)의 전화·이메일 모양은 자동 가림
- `mobile/b2b-inquiry-view.png` — 상담 신청 폼 단독 /b2b/inquiry(빈 폼) — 첫 화면(스크롤 0) · 입력 예시 글자(placeholder)의 전화·이메일 모양은 자동 가림
- `mobile/b2b-view.png` — 숲ON비즈 /b2b(지시의 「B2B 비즈 페이지」) — 활용 목적 4카드·추천 프로그램·참여기업·상담 신청 절 — 첫 화면(스크롤 0)
- `mobile/header.png` — 스크롤된 상태의 고정 머리(로고·메뉴)
- `mobile/home-full.png` — 메인(/) — 히어로·내게 맞는 숲 프로그램 찾기(필터)·추천·기획전·숲ON비즈 배너·소개 — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `mobile/home-view.png` — 메인(/) — 히어로·내게 맞는 숲 프로그램 찾기(필터)·추천·기획전·숲ON비즈 배너·소개 — 첫 화면(스크롤 0)
- `mobile/program-company-4-01-full.png` — 프로그램 상세 /program/company-4-01(예약하기 주 버튼 상세) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 예약 외부 링크 누르지 않음, 지역 줄 상세 도로명주소 지움
- `mobile/program-company-4-01-view.png` — 프로그램 상세 /program/company-4-01(예약하기 주 버튼 상세) — 첫 화면(스크롤 0) · 예약 외부 링크 누르지 않음, 지역 줄 상세 도로명주소 지움
- `mobile/program-forestasan-01-full.png` — 프로그램 상세 /program/forestasan-01(예약하기 주 버튼 · 담당자 휴대폰 노출 없는 상세) — 끝까지 스크롤해 지연 이미지 로딩 후 전체 · 예약 외부 링크는 누르지 않음(href 는 json 에 기록 안 됨), 지역 줄의 상세 도로명주소 지움
- `mobile/program-forestasan-01-view.png` — 프로그램 상세 /program/forestasan-01(예약하기 주 버튼 · 담당자 휴대폰 노출 없는 상세) — 첫 화면(스크롤 0) · 예약 외부 링크는 누르지 않음(href 는 json 에 기록 안 됨), 지역 줄의 상세 도로명주소 지움
- `mobile/programs-filtered-full.png` — 결과 목록 /programs?who=kids&exp=nature(아이와+자연체험 필터 적용) — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `mobile/programs-filtered-view.png` — 결과 목록 /programs?who=kids&exp=nature(아이와+자연체험 필터 적용) — 첫 화면(스크롤 0)
- `mobile/programs-full.png` — 결과 목록 /programs(필터 없음 · 총 52개 · 12개/쪽 · 정렬·검색) — 끝까지 스크롤해 지연 이미지 로딩 후 전체
- `mobile/programs-view.png` — 결과 목록 /programs(필터 없음 · 총 52개 · 12개/쪽 · 정렬·검색) — 첫 화면(스크롤 0)

## states
- `states/b2b-inquiry-consent/01-none.png` — 1440 상담 신청 폼 동의 구역: 모두 해제 → 필수1 → 선택 → 필수3(제출 직전, 제출 버튼은 바로 아래) — 단계 01-none
- `states/b2b-inquiry-consent/02-required-1.png` — 1440 상담 신청 폼 동의 구역: 모두 해제 → 필수1 → 선택 → 필수3(제출 직전, 제출 버튼은 바로 아래) — 단계 02-required-1 · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-consent/03-optional.png` — 1440 상담 신청 폼 동의 구역: 모두 해제 → 필수1 → 선택 → 필수3(제출 직전, 제출 버튼은 바로 아래) — 단계 03-optional · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-consent/04-required-3-ready-to-submit.png` — 1440 상담 신청 폼 동의 구역: 모두 해제 → 필수1 → 선택 → 필수3(제출 직전, 제출 버튼은 바로 아래) — 단계 04-required-3-ready-to-submit · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-details/01-empty.png` — 1440 상담 신청 폼 중간 구역: 빈 → 도입 목적(교육) 선택 → 인원·희망 시기 → 문의 내용 — 단계 01-empty
- `states/b2b-inquiry-details/02-purpose-education.png` — 1440 상담 신청 폼 중간 구역: 빈 → 도입 목적(교육) 선택 → 인원·희망 시기 → 문의 내용 — 단계 02-purpose-education · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-details/03-headcount-period.png` — 1440 상담 신청 폼 중간 구역: 빈 → 도입 목적(교육) 선택 → 인원·희망 시기 → 문의 내용 — 단계 03-headcount-period · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-details/04-message.png` — 1440 상담 신청 폼 중간 구역: 빈 → 도입 목적(교육) 선택 → 인원·희망 시기 → 문의 내용 — 단계 04-message · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-details-mobile/01-empty.png` — 390 상담 신청 폼 중간 구역(같은 흐름) — 단계 01-empty
- `states/b2b-inquiry-details-mobile/02-purpose-education.png` — 390 상담 신청 폼 중간 구역(같은 흐름) — 단계 02-purpose-education · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-details-mobile/03-headcount-period.png` — 390 상담 신청 폼 중간 구역(같은 흐름) — 단계 03-headcount-period · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-details-mobile/04-message.png` — 390 상담 신청 폼 중간 구역(같은 흐름) — 단계 04-message · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-info/01-empty.png` — 1440 상담 신청 폼 위쪽 입력 구역: 빈 폼 → 담당자·소속 → 이메일·연락처 → 관심 프로그램 선택 — 단계 01-empty
- `states/b2b-inquiry-info/02-name-department.png` — 1440 상담 신청 폼 위쪽 입력 구역: 빈 폼 → 담당자·소속 → 이메일·연락처 → 관심 프로그램 선택 — 단계 02-name-department · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-info/03-email-phone.png` — 1440 상담 신청 폼 위쪽 입력 구역: 빈 폼 → 담당자·소속 → 이메일·연락처 → 관심 프로그램 선택 — 단계 03-email-phone · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-info/04-program-selected.png` — 1440 상담 신청 폼 위쪽 입력 구역: 빈 폼 → 담당자·소속 → 이메일·연락처 → 관심 프로그램 선택 — 단계 04-program-selected · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-info-mobile/01-empty.png` — 390 상담 신청 폼 위쪽 입력 구역(같은 흐름) — 단계 01-empty
- `states/b2b-inquiry-info-mobile/02-name-department.png` — 390 상담 신청 폼 위쪽 입력 구역(같은 흐름) — 단계 02-name-department · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-info-mobile/03-email-phone.png` — 390 상담 신청 폼 위쪽 입력 구역(같은 흐름) — 단계 03-email-phone · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/b2b-inquiry-info-mobile/04-program-selected.png` — 390 상담 신청 폼 위쪽 입력 구역(같은 흐름) — 단계 04-program-selected · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장
- `states/home-filter-chips/01-all-52.png` — 1440 홈 칩 누적(scrollY 540): 전체 52 → 아이와 29 → +자연체험 19 → +경기 8, 결과 패널 개수·2×2 행이 바뀜 — 단계 01-all-52
- `states/home-filter-chips/02-with-kids.png` — 1440 홈 칩 누적(scrollY 540): 전체 52 → 아이와 29 → +자연체험 19 → +경기 8, 결과 패널 개수·2×2 행이 바뀜 — 단계 02-with-kids
- `states/home-filter-chips/03-plus-nature.png` — 1440 홈 칩 누적(scrollY 540): 전체 52 → 아이와 29 → +자연체험 19 → +경기 8, 결과 패널 개수·2×2 행이 바뀜 — 단계 03-plus-nature
- `states/home-filter-chips/04-plus-gyeonggi.png` — 1440 홈 칩 누적(scrollY 540): 전체 52 → 아이와 29 → +자연체험 19 → +경기 8, 결과 패널 개수·2×2 행이 바뀜 — 단계 04-plus-gyeonggi
- `states/home-filter-sheet/01-pickers.png` — 390 홈 필터 시트: 3버튼 → 시트 열림 → 아이와 → +자연체험 → +경기, 「결과 보기 (N개)」 갱신 — 단계 01-pickers
- `states/home-filter-sheet/02-sheet-open.png` — 390 홈 필터 시트: 3버튼 → 시트 열림 → 아이와 → +자연체험 → +경기, 「결과 보기 (N개)」 갱신 — 단계 02-sheet-open
- `states/home-filter-sheet/03-kids-count.png` — 390 홈 필터 시트: 3버튼 → 시트 열림 → 아이와 → +자연체험 → +경기, 「결과 보기 (N개)」 갱신 — 단계 03-kids-count
- `states/home-filter-sheet/04-plus-nature-count.png` — 390 홈 필터 시트: 3버튼 → 시트 열림 → 아이와 → +자연체험 → +경기, 「결과 보기 (N개)」 갱신 — 단계 04-plus-nature-count
- `states/home-filter-sheet/05-plus-gyeonggi-count.png` — 390 홈 필터 시트: 3버튼 → 시트 열림 → 아이와 → +자연체험 → +경기, 「결과 보기 (N개)」 갱신 — 단계 05-plus-gyeonggi-count
- `states/programs-filter-chips/01-all.png` — 1440 /programs 칩 누적: 전체 → 아이와 → +자연체험, 총 개수·목록 교체 — 단계 01-all
- `states/programs-filter-chips/02-with-kids.png` — 1440 /programs 칩 누적: 전체 → 아이와 → +자연체험, 총 개수·목록 교체 — 단계 02-with-kids
- `states/programs-filter-chips/03-plus-nature.png` — 1440 /programs 칩 누적: 전체 → 아이와 → +자연체험, 총 개수·목록 교체 — 단계 03-plus-nature

## seq
- `seq/home-filter-results-first.png` — 1440 홈 칩(아이와→자연체험→경기) 클릭 때 결과 개수·행이 바뀌는 장면 4.5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화(시작 전 이미지 캐시 예열) — 첫 프레임
- `seq/home-filter-results-last.png` — 1440 홈 칩(아이와→자연체험→경기) 클릭 때 결과 개수·행이 바뀌는 장면 4.5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화(시작 전 이미지 캐시 예열) — 끝 프레임
- `seq/home-filter-results.mp4` — 1440 홈 칩(아이와→자연체험→경기) 클릭 때 결과 개수·행이 바뀌는 장면 4.5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화(시작 전 이미지 캐시 예열)
- `seq/mobile-filter-sheet-first.png` — 390 필터 시트 열림(sheet-in) → 아이와 → 자연체험 선택, 결과 보기 (N개) 갱신 5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화 — 첫 프레임
- `seq/mobile-filter-sheet-last.png` — 390 필터 시트 열림(sheet-in) → 아이와 → 자연체험 선택, 결과 보기 (N개) 갱신 5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화 — 끝 프레임
- `seq/mobile-filter-sheet.mp4` — 390 필터 시트 열림(sheet-in) → 아이와 → 자연체험 선택, 결과 보기 (N개) 갱신 5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화

## media (레포 ~/Soopon/public/assets 에서 복사, 원본 그대로)
- `media/fowi-logo-horizontal-color.png` — public/assets/org/fowi-logo-horizontal-color.png
- `media/kfs-logo-horizontal-color.png` — public/assets/org/kfs-logo-horizontal-color.png
- `media/kv-full-poster.webp` — public/assets/kv/kv-full-poster.webp
- `media/logo-black.webp` — public/assets/logo/logo-black.webp
- `media/logo-full-color.svg` — public/assets/logo/logo-full-color.svg
- `media/logo-full-color.webp` — public/assets/logo/logo-full-color.webp
- `media/logo-mono-green.webp` — public/assets/logo/logo-mono-green.webp
- `media/logo-white.webp` — public/assets/logo/logo-white.webp
- `media/slogan-flat.webp` — public/assets/kv/slogan-flat.webp
- `media/symbol-tree-512.png` — public/assets/logo/symbol-tree-512.png

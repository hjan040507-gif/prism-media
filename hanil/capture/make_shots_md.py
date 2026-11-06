#!/usr/bin/env python3
"""hanil shots.md 생성 — 파일 이름 → 한 줄 설명. 실행: python3 hanil/capture/make_shots_md.py"""
import os, re
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PUB = '공개 화면 — 운영 https://www.hanil-pnk.com 을 GET 으로만 열어 찍음(비GET 가로챔 0·허용 비GET 0, 서버 액션 제출·파일 선택 없음). 히어로 자동 전환(setInterval 6000)은 정지시켜 첫 장(01/03) 고정. 가림: 헤더 전화 링크·푸터 회사정보(대표이사·주소·전화·팩스) 제거, 남은 전화 글자는 010-****-****, 대표 이름 김○○.'
ADM = '관리자 — 사본 git archive 8a0ee85a + 로컬 Supabase(pm-hanil, 127.0.0.1:57031/57032) + 앱 `next dev -H 127.0.0.1 -p 3613`(Turbopack·개발 배지 끔 — prod 빌드는 BLOCKED.md 사유로 못 씀). 운영 로그인 0·운영 DB 접속 0. 가짜 관리자(로컬 auth) 로 실제 로그인, 가짜 접수 6행(상호 A산업식·이름 김○○·전화 010-****-****·이메일 user***)·가짜 공지 2건. 사진 슬롯 이미지는 사본 public/images 의 실제 사이트 이미지를 로컬 Storage 에 업로드.'
D = {}
def d(k, v): D[k] = v
# 데스크톱 공개
d('desktop/home', '메인(히어로 첫 장 + 공정 12종 카드 + 회사 지표 + R&D·ESG 카드 + CTA + 푸터). 지시의 "메인(히어로)" = 실제 `/`.')
d('desktop/company-greeting', '인사말(`/company/greeting`) — 대표 서명 이름은 김○○ 로 가림.')
d('desktop/company-history', '연혁(`/company/history`, 타임라인 18건).')
d('desktop/company-certifications', '인증·수상현황(`/company/certifications`, 8종 실스캔 도판).')
d('desktop/company-profile', '회사현황(`/company/profile`) — 지시에 없던 화면(회사소개 6페이지 중 하나)을 더함. 주소·전화는 가림.')
d('desktop/product', 'PRODUCT 랜딩 = 실제 "공정 GUIDE" + 표면처리 공정 체계도(6대분류·상세 21행, 행마다 "보기" 링크). 지시의 "PRODUCT 랜딩(공정 체계도)" = 실제 `/product`.')
d('desktop/product-isonite-tf1', '공정 상세 01 ISONITE TF1(`/product/isonite-tf1`, 도판 6).')
d('desktop/product-gas-nitriding', '공정 상세 04 가스질화(`/product/gas-nitriding`, 도판 31·합성본 6칸 — 가장 풍부).')
d('desktop/product-dlc', '공정 상세 06 DLC 코팅(`/product/dlc`, 도판 8).')
d('desktop/product-vacuum-carburizing', '공정 상세 12 진공침탄(`/product/vacuum-carburizing`, 도판 3).')
d('desktop/facility-tab1-manufacturing-1', '설비현황 탭 1 "주요 제조 설비(1)"(9행) — 탭 클릭 뒤 전체 캡처. 지시의 "설비현황 3탭" = 실제 `/facility` 의 탭 3개.')
d('desktop/facility-tab2-manufacturing-2', '설비현황 탭 2 "주요 제조 설비(2)"(6행).')
d('desktop/facility-tab3-measuring', '설비현황 탭 3 "주요 측정 기기"(9행).')
d('desktop/rnd', 'R&D(`/rnd`) — 연구 방침 + 연구 분야.')
d('desktop/esg', 'ESG(`/esg`) — 환경·사회·지배구조 3분야 23항목 + 앵커 목차.')
d('desktop/support-contact', '고객지원 · 온라인 문의 폼(`/support/contact`) — 빈 폼(채우기·제출 없음).')
d('desktop/support-quote', '고객지원 · 견적 요청 폼(`/support/quote`) — 빈 폼(채우기·제출·파일 선택 없음).')
# 모바일
d('mobile/home', '모바일 메인(히어로 첫 장 고정). 헤더 햄버거.')
d('mobile/product', '모바일 PRODUCT 랜딩 — 체계도가 카드 리스트로 바뀐 모습.')
d('mobile/product-gas-nitriding', '모바일 공정 상세(가스질화). 지시의 "공정 상세" = 실제 `/product/gas-nitriding`.')
d('mobile/product-isonite-tf1', '모바일 공정 상세(ISONITE TF1).')
d('mobile/support-quote', '모바일 견적 요청 폼(빈 폼).')
# 관리자
for k, v in [
 ('admin-login', '관리자 로그인 화면(입력 전). 로그인은 로컬 GoTrue 로 갔다(운영 아님).'),
 ('admin-dashboard', '관리자 대시보드(로그인 직후). 머리의 로그인 계정 이메일은 자동 가림으로 비어 있음.'),
 ('admin-backgrounds', '배경 사진 관리(`/admin/backgrounds`) — 23영역 39장 카드. 초점은 배경 사진에만 있음(지시의 "사진 교체" 중 초점 지정 화면).'),
 ('admin-product-photos', '제품 사진 관리 목록(`/admin/product-photos`) — 12공정. 지시의 "사진 교체" 중 제품 쪽(교체·추가·숨김·순서만, 초점 없음).'),
 ('admin-product-photos-gas-nitriding', '제품 사진 — 가스질화 상세(`/admin/product-photos/gas-nitriding`, 사진 31칸). 이 화면의 교체 1건이 로컬 Storage 에 반영된 뒤 상태일 수 있음(촬영 순서상 pages 단계는 교체 전).'),
 ('admin-content-hub', '문구 수정 허브(`/admin/content`) — 폼 17개 목록. 지시의 "문구 수정" = 실제 허브 + 하위 폼 17개.'),
 ('admin-content-home', '문구 수정 · 메인 화면(히어로 문구) 폼(`/admin/content/home`) — 대표 폼 1.'),
 ('admin-content-greeting', '문구 수정 · 인사말 폼(`/admin/content/greeting`) — 대표 폼 2. 대표 서명 이름은 김○○ 로 가림.'),
 ('admin-content-facility', '문구 수정 · 설비현황 폼(`/admin/content/facility`) — 대표 폼 3(표 편집).'),
 ('admin-inquiries', '문의·견적 접수함 목록(`/admin/inquiries`) — 문의·견적 한 목록. 가짜 접수 7행(상호 A산업·B정밀… 가짜 값, 이름 김○○ 등 가림 꼴, 이메일 지움). 가짜 값.'),
 ('admin-inquiry-detail', '접수 상세(첫 행, 견적 요청 가짜 데이터) — 이메일·전화 가림. 가짜 값.'),
 ('admin-notices', '공지 관리(`/admin/notices`) — 가짜 공지 2건(지시에 없는 화면).'),
 ('admin-notifications', '알림 설정(`/admin/notifications`) — 알림 메일 상태·크론 하트비트 배지(로컬: 키 없음 상태, 지시에 없는 화면).'),
]:
    d(f'desktop/{k}', v)
FL = {
 'quote-fill': '상태 흐름 ① 견적 폼 채우기(운영, 제출 직전까지) {n}/4 — ',
 'facility-tabs': '상태 흐름 ② 설비현황 탭 전환(운영) {n}/3 — ',
 'mobile-menu': '상태 흐름 ③ 모바일 햄버거 메뉴(운영, 390) {n}/4 — ',
 'quote-submit-local': '상태 흐름 ④ 견적 폼 제출(로컬 사본, 같은 코드) {n}/3 — ',
 'bg-replace': '상태 흐름 ⑤ 배경 사진 교체(관리자) {n}/5 — ',
 'product-photo-replace': '상태 흐름 ⑥ 제품 사진 교체(관리자) {n}/4 — ',
 'product-photo-reorder': '상태 흐름 ⑦ 제품 사진 순서 바꾸기(관리자) {n}/3 — ',
 'content-edit-home': '상태 흐름 ⑧ 문구 수정(메인 화면 문구, 관리자) {n}/3 — ',
 'inquiry-status': '상태 흐름 ⑨ 접수 상태 변경(관리자) {n}/3 — ',
}
ST = {
 'quote-fill/01-empty-form': '빈 폼(스크롤 고정: 폼 첫 줄이 보이게 — 제출 버튼은 이 높이 아래).',
 'quote-fill/02-process-selected': '"희망 공정"을 ISONITE LS 로 선택.',
 'quote-fill/03-fields-filled': '가짜 값 입력(회사 A산업·담당자 김○○·이메일 user***@example.com·전화 010-****-****·소재 SCM440·수량 2,000개·요청사항). 가짜 값.',
 'quote-fill/04-consent-ready-to-submit': '개인정보 동의 체크 — 제출 직전. 제출 버튼은 누르지 않음(운영 서버 액션 → 알림 메일 방지). 파일 선택 없음(운영 Storage 업로드 방지).',
 'facility-tabs/01-tab1-manufacturing-1': '탭 1 주요 제조 설비(1).',
 'facility-tabs/02-tab2-manufacturing-2': '탭 2 주요 제조 설비(2).',
 'facility-tabs/03-tab3-measuring': '탭 3 주요 측정 기기.',
 'mobile-menu/01-closed': '메뉴 닫힘(메인 첫 화면).',
 'mobile-menu/02-menu-open': '햄버거 열림(전체화면 메뉴).',
 'mobile-menu/03-group-1-expanded': '"회사소개" 그룹 펼침.',
 'mobile-menu/04-group-2-expanded': '"PRODUCT" 그룹 펼침(앞 그룹은 접힘).',
 'quote-submit-local/01-empty-form': '빈 폼(로컬 사본).',
 'quote-submit-local/02-filled-before-submit': '가짜 값 입력 + 동의 체크, 제출 직전(상호 G기계·담당자 오○○ → 가림 꼴). 가짜 값.',
 'quote-submit-local/03-submitted-success': '제출 뒤 접수 완료 화면 — 로컬 서버 액션 성공(RESEND 키 없음 → 메일 미발송). 이 제출 1건이 로컬 DB 접수함에 가짜 행으로 들어감.',
 'bg-replace/01-slot-list': '배경 사진 카드 목록(첫 슬롯 "메인 화면 1번째 사진" 선택 전).',
 'bg-replace/02-dialog-open': '"사진·초점 바꾸기" 다이얼로그(지금 사진 + 사진 고르기).',
 'bg-replace/03-photo-uploaded-focal-preview': '사본 public 의 실제 사이트 이미지(hero-space.webp)를 로컬 Storage 에 올린 뒤 — 지금 사진/바꿀 사진 + 초점 지정(십자선) + 데스크톱 16:9·휴대폰 9:16 미리보기.',
 'bg-replace/04-focal-point-set': '초점을 오른쪽 위로 옮긴 상태(미리보기 두 개가 따라 움직임).',
 'bg-replace/05-saved-list-updated': '저장 뒤 목록(카드가 "바꾼 사진" 상태로 갱신, 되돌리기·원래대로 버튼 생김).',
 'product-photo-replace/01-photo-cards': '가스질화 도판 카드 목록(첫 카드 선택 전).',
 'product-photo-replace/02-dialog-open': '"사진 바꾸기" 다이얼로그.',
 'product-photo-replace/03-new-photo-preview': '실제 사이트 이미지(photos/equipment/equi-10.jpg)를 올린 뒤 지금/바꿀 사진 미리보기(초점 없음).',
 'product-photo-replace/04-replaced': '저장 뒤 목록.',
 'product-photo-reorder/01-gallery-before': '갤러리형 섹션 순서 바꾸기 전.',
 'product-photo-reorder/02-moved-forward-unsaved': '두 번째 사진을 앞으로 → "순서 저장" 버튼 활성(아직 사이트 미반영).',
 'product-photo-reorder/03-order-saved': '순서 저장 완료.',
 'content-edit-home/01-form-loaded': '문구 수정 · 메인 화면 폼 열림.',
 'content-edit-home/02-headline-edited': '메인 카피 수정(가짜 값 — 마침표 하나 더한 로컬 시연 문구).',
 'content-edit-home/03-saved-message': '저장 → "저장되었습니다." 메시지(로컬 DB 에만 반영).',
 'inquiry-status/01-inbox-list': '접수함 목록(신규 뱃지 있음).',
 'inquiry-status/02-detail-new': '첫 행 상세(신규).',
 'inquiry-status/03-marked-answered': '"답변완료로 변경" 뒤 — 상태 뱃지 답변완료·버튼이 "신규로 되돌리기"로 바뀜.',
}
SQ = {
 'hero-crossfade': '영상 — 메인 히어로 크로스페이드(운영 `/`, 자동 전환 정지 안 함): 전환 1초 전부터 4.0초, 01/03 → 02/03 (1.4초 불투명도 전환). 방식 recordSeq: page.clock 1/60초 runFor + getAnimations currentTime 동기화(막대 진행은 시작 시점 위치 보정). 240프레임·60fps·CRF12. 운영 GET 만.',
 'matrix-to-detail': '영상 — 공정 체계도(/product)에서 "가스질화(GAS NITRIDING)" 행 호버(0.75초) → 클릭(1.0초) → 가스질화 상세(/product/gas-nitriding)로 전환. 4.0초·240프레임·60fps. 방식 recordSeq(page.clock 1/60초 + 애니메이션 동기화, 전환 중 RSC 요청은 실시간). 운영 GET 만.',
}
def key(path):
    p = re.sub(r'-(full|view)\.png$', '', path); p = re.sub(r'\.png$', '', p); return p
def walk(sub):
    out = []
    base = os.path.join(root, sub)
    if not os.path.isdir(base): return out
    for dp, dn, fn in os.walk(base):
        for f in sorted(fn):
            if f.endswith('.png') and '.part' not in f: out.append(os.path.relpath(os.path.join(dp, f), root))
    return sorted(out)
lines = ['# hanil shots', '', '- ' + PUB, '- ' + ADM, '- 모든 PNG 옆 같은 이름 .json: 요소 사각형·글자·scrollY·뷰포트·pii_scan(전부 0)·가로챈 요청. 상태 흐름은 같은 뷰포트·같은 scrollY.', '- 지시와 다른 점: PRODUCT 랜딩=공정 GUIDE+체계도(/product) · 사진 교체=배경(초점)·제품(교체·순서) 두 화면 · 문구 수정=허브+폼 17개(대표 3개 촬영) · 접수함은 문의·견적 한 목록 · 설비현황 탭 이름은 "주요 제조 설비(1)·(2)·주요 측정 기기"(24행).', '']
missing = []
def sec(title, files, getdesc):
    lines.append(f'## {title}'); lines.append('')
    for f in files:
        ds = getdesc(f)
        if not ds: missing.append(f); ds = '(설명 누락)'
        suf = ' [끝까지 스크롤한 전체]' if f.endswith('-full.png') else (' [첫 화면]' if f.endswith('-view.png') else '')
        lines.append(f'- `{os.path.basename(f)}` ({os.path.dirname(f)}) — {ds}{suf}')
    lines.append('')
def dsc(f):
    if os.path.basename(f) == 'header.png':
        return '고정 헤더만(스크롤 600px 상태) — ' + ('모바일' if f.startswith('mobile') else '데스크톱')
    k = key(f)
    return D.get(k)
sec('데스크톱', walk('desktop'), dsc)
sec('모바일', walk('mobile'), dsc)
def sdsc(f):
    k = key(f)[len('states/'):]
    flow = k.split('/')[0]
    return (FL[flow].format(n=int(os.path.basename(k).split('-')[0])) + ST[k]) if k in ST else None
sec('상태 흐름', walk('states'), sdsc)
def qdsc(f):
    b = os.path.basename(f)
    m = re.match(r'(.+)-(first|last)\.png$', b)
    if m and m.group(1) in SQ: return ('첫' if m.group(2) == 'first' else '끝') + ' 프레임 PNG — ' + m.group(1) + ' 영상'
    return None
lines.append('## seq'); lines.append('')
for n, v in SQ.items(): lines.append(f'- `{n}.mp4` (seq) — {v}')
for f in walk('seq'):
    ds = qdsc(f)
    if not ds: missing.append(f); ds = '(설명 누락)'
    lines.append(f'- `{os.path.basename(f)}` (seq) — {ds}')
lines.append('')
lines += ['## media', '', '- `logo-mark.svg`·`logo-mark-white.svg`·`logo-mark-current.svg` — 로고 마크 원본(파랑·흰색·currentColor). 출처 사본 `public/`(커밋 8a0ee85a) 복사.',
          '- `hero-1-p1-i2.webp`·`hero-2-hero-aircraft.webp`·`hero-3-hero-space.webp` — 메인 히어로 3장 원본. 출처 `public/images/r2/main-hero-{1,2,3}/`. (영상 원본은 레포에 없음)', '',
          '## 기타', '', '- `brand.json` — 주색 #0B1B33·보조 #098FD6·버건디 #990033(PRODUCT 전용)·폰트 Pretendard Variable, 코드 근거.', '- `facts.md` — 자막용 사실 8개와 근거(접근성 Lighthouse 포함).', '- `contact.jpg` — 전 캡처 축소 모음(tools/contact.py).', '- `capture/*.mjs` — 촬영 스크립트(common·a-desktop·a-mobile·a-flows·a-mobile-flow·a-seq·b-admin), `capture/seed-local.sql`·`seed-admin-user.mjs`·`mkenv.py` 로컬 가짜 데이터·환경, `lighthouse-a11y.sh`·`report-slots.out.txt` 측정 근거, `local-db-check.txt` 로컬 DB 주소 확인 기록.', '- `BLOCKED.md` — 못 채운 것.', '']
open(os.path.join(root, 'shots.md'), 'w', encoding='utf-8').write('\n'.join(lines))
print('shots.md written; 설명 누락', missing)

#!/usr/bin/env python3
"""matchsat/shots.md 생성 — 폴더의 모든 PNG·MP4·JPG·SVG 를 한 줄씩(파일 이름 그대로). 사용: python3 matchsat/capture/build-shots-md.py"""
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LOCAL = '로컬 사본(레포 HEAD 6aa098e git archive → tmp/matchsat-src, next dev :3612) + 로컬 Supabase(pm-matchsat :57020/57021) + 가짜 데이터(수요 기관 A·B·공급자 A위성·B위성영상·C지구관측·관리자 1, 이름은 김○○ 꼴, 상호는 A·B·C 식, 주문·입찰·금액 전부 지어낸 값 = 가짜 값)'
FOOT = '푸터 사업자 정보 `<dl>`(운영사·대표·사업자번호·주소·문의 이메일·전화, footer.tsx:24-38)는 visibility:hidden'
ACC = '입금 계좌번호는 시드에 0 으로만 채운 가짜 값이고 화면에서는 lib 가림이 지움(계좌 칸이 빈칸)'
NOTE0 = '가로챈 요청 0 · 로컬 주소 비GET 허용 0'
R = [
 (r'^desktop/home-(full|view)\.png$', '메인 `/`(비로그인, 데스크톱 1440): 히어로 「위성영상, 주문부터 납품까지」·로그인/가입·사용법 + 카드 2장(위성영상주문·위성제공목록). 가림: ' + FOOT + '. ' + NOTE0),
 (r'^desktop/rfq-new-(full|view)\.png$', '지시의 「수요 등록」 = 실제 「위성영상주문 (Sat-order)」 `/rfqs/new`(수요자 A기관 로그인) 1단계 입력 전 화면. 4단계 폼(무엇을/어디·언제/조건/예산·확정). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/rfq-owner-bids-(full|view)\.png$', '수요자 A기관의 주문 상세 `/rfqs/[id]` 소유자 뷰: 「받은 입찰 2건」(B위성영상 3,800,000원 최저가 · A위성 4,200,000원 — 가짜 값)·「이 입찰 낙찰」·「입찰이 들어와 수정할 수 없습니다」 안내. ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/rfq-edit-(full|view)\.png$', '지시의 「주문 수정(입찰 0건)」 = `/rfqs/new?edit=<id>`(수요자 A기관, 상태 open·imaging·입찰 0건 주문 「항만 야적장 적재 현황 촬영」) — 제목 「주문 수정」, 유형 변경 불가 표시, 「수정 저장」 버튼(누르지 않음). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/rfqs-(full|view)\.png$', '지시의 「수요 목록·입찰」 = 실제 「주문 입찰」 `/rfqs`(공급자 A위성 로그인, 공급자 전용 목록): 유형·촬영수단·구역·예산 필터 + 주문 카드(NEW·입찰 모집·매칭됨·입찰 n건·입찰하기). 수요자는 익명(「수요자」 배지). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/rfq-bid-(full|view)\.png$', '공급자 A위성의 주문 상세 + 입찰 폼 `/rfqs/[id]`(주문 「산불 피해 구역 긴급 촬영」): 「익명 보기 — 수요자 신원(소속·이름·연락처)은 공개되지 않습니다」 배너, 입찰가·완료 예정일·제안서 입력 전. ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/rfq-designated-(full|view)\.png$', '지시의 「지정 매칭」(독립 화면 없음 — 특별주문 하위 흐름) 중 공급자 A위성이 보는 지정 주문 상세 `/rfqs/[id]`(주문 「해안 침식 정밀 지정 촬영」, 특별주문·긴급·지정 업체 = A위성): 「지정 주문」 카드의 수락/거절 버튼(누르지 않음). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/matches-supplier-(full|view)\.png$', '지정 매칭 공급자 뷰 `/matches`(A위성): 대기 중 지정 매칭 카드의 수락/거절 + 낙찰 매칭(내 입찰가 3,300,000원, 가짜 값)·내 입금 계좌(계좌번호는 가림으로 지워짐)·수요자 연락처(공개됨, 이름 김○○꼴·전화 없음)·채팅. ' + ACC + '. ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/matches-requester-(full|view)\.png$', '지정 매칭 수요자 뷰 `/matches`(B기관): 거절된 지정 매칭 카드(공급업체 B위성영상, 정보 공개 버튼) + 수락된 낙찰 매칭(공급업체 A위성·입찰가 3,300,000원 가짜 값·입금 계좌 박스·거래 완료·정보 공개 토글·채팅). ' + ACC + '. ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/admin-(full|view)\.png$', '관리자 대시보드 `/admin`: 통계(전체 회원 8·승인대기 2·진행중 주문 9·누적 매칭 5·신고 1)와 하단 「거절된 지정 매칭 — 재지정/취소 (2)」 섹션(지시의 「매칭 재지정」 = 독립 화면이 아니라 이 조건부 섹션 — 거절된 지정 매칭 2건을 시드로 만들어 보임). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/admin-members-(full|view)\.png$', '관리자 회원 관리 `/admin/members`: 승인 대기 2(승인·거절) + 전체 회원 8(정지). 이메일은 lib 가림이 지움, 이름 김○○꼴, 소속 A기관 식(시드 자체가 가짜). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^desktop/admin-reports-(full|view)\.png$', '관리자 신고 처리 `/admin/reports`: 신고 3건(처리 대기·검토중·처리완료, 가짜 사유)과 검토중/처리완료/기각 버튼(누르지 않음). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^mobile/home-(full|view)\.png$', '메인 `/`(비로그인, 모바일 390). 하단 탭바 없음(비로그인). 가림: ' + FOOT + '. ' + NOTE0),
 (r'^mobile/rfqs-(full|view)\.png$', '「주문 입찰」 목록 `/rfqs`(공급자 A위성, 모바일 390, 하단 탭바 4개). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^mobile/rfq-bid-(full|view)\.png$', '주문 상세 + 입찰 폼(공급자 A위성, 모바일 390) 입력 전. ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^mobile/rfq-new-(full|view)\.png$', '위성영상주문 1단계(수요자 A기관, 모바일 390) — 하단 고정 이전/임시저장/다음 바(전체 화면 PNG 에서는 문서 바닥으로 옮겨 찍음, lib 처리). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^states/rfq-new-steps/0([1-4])-.+\.png$', '상태 흐름 rfq-new-steps(데스크톱 1440, 같은 scrollY 0) 단계 \\1/4: 위성영상주문 4단계(무엇을/어디·언제/조건/예산·확정), 각 단계 가짜 값 입력 후 캡처(제목 「서해안 갯벌 변화 관측 위성영상」·촬영지점 「36.95N 126.50E 일대(가상)」·예산 3,000,000~6,000,000원). 제출은 누르지 않음. 4단계에 뜨는 「예산(최소 또는 최대)을 입력해야…」 배너는 실제 앱 동작이다: 3단계의 「다음」 버튼이 4단계에서 같은 자리의 「제출」(type=submit)로 바뀌어 그 클릭이 제출로 처리되고 예산 가드(rfq-form.tsx:122-131)가 막으며 4단계로 보냄(코드 그대로, 사본 수정 없음). ' + LOCAL + '. ' + FOOT + '. ' + NOTE0),
 (r'^states/bid-submit/01-before\.png$', '상태 흐름 bid-submit(데스크톱 1440, scrollY 0) 1/3 제출 전: 공급자 A위성이 주문 「농경지 작황 영상 및 객체분석」 상세에서 입찰 폼이 빈 상태. ' + LOCAL + '. ' + FOOT + '. 입찰 제출(서버 액션 POST)은 로컬 앱으로만 가고 로컬 DB 에 쓴다 — guard 의 비GET 가로채기를 로컬 주소(127.0.0.1:3612·57020)에 한해 allow(운영 아님). json 의 allowed_nonget 에 남음.'),
 (r'^states/bid-submit/02-typing\.png$', '상태 흐름 bid-submit 2/3 입력 중: 입찰가 5,800,000원·완료 예정일 2026-11-10·제안서(가상 제안) 입력. 가짜 값. ' + LOCAL + '. ' + FOOT + '.'),
 (r'^states/bid-submit/03-after\.png$', '상태 흐름 bid-submit 3/3 제출 후: 「입찰 완료!」 초록 박스·「내 입찰 입찰 중 5,800,000원」 카드·버튼이 「입찰 수정」으로 바뀜(재입찰 = 수정). 로컬 DB 에 입찰 1행이 실제로 생김(window.confirm 은 자동 수락). 비GET 허용 1건(POST /rfqs/<id> 서버 액션). ' + LOCAL + '. ' + FOOT + '.'),
 (r'^states/admin-redesignate/01-rejected-designated\.png$', '상태 흐름 admin-redesignate(데스크톱 1440, scrollY 372) 1/3: 관리자 `/admin` 하단 「거절된 지정 매칭 — 재지정/취소 (2)」, 재지정 공급자 선택 전. 거절 2건은 시드로 만든 상태. ' + LOCAL + '. ' + FOOT + '.'),
 (r'^states/admin-redesignate/02-pick-new-supplier\.png$', '상태 흐름 admin-redesignate 2/3: 재지정 공급자 드롭다운에서 「A위성」 선택(재지정 버튼은 누르지 않음). ' + LOCAL + '.'),
 (r'^states/admin-redesignate/03-cancel-confirm\.png$', '상태 흐름 admin-redesignate 3/3: 「취소」 클릭 → 「지정 매칭 취소」 확인 모달(되돌릴 수 없다는 안내, 확인은 누르지 않음). ' + LOCAL + '.'),
 (r'^seq/rfq-form-steps\.mp4$', 'seq: 위성영상주문 4단계가 「다음」으로 넘어가며 진행바가 1/4→4/4로 차오르는 5초(데스크톱 1440, 2880×1800). 방식 = page.clock 1/60초씩 runFor + getAnimations currentTime 동기화, 프레임 300장 → H.264 CRF 12 · 60fps(lib recordSeq). 준비로 4단계 값을 채워 둔 뒤 1단계에서 시작, 프레임 45·120·195 에 「다음」 클릭. 마지막 장면의 예산 배너는 위 rfq-new-steps 설명과 같은 실제 동작. ' + LOCAL + '.'),
 (r'^seq/rfq-form-steps-(first|last)\.png$', 'seq rfq-form-steps 의 첫/끝 프레임 PNG(각각 1/4 단계·4/4 단계). ' + LOCAL + '.'),
 (r'^media/icon\.svg$', '미디어: 로고 마크 SVG 원본 — 레포 `app/icon.svg` 복사(흰 라운드 사각 위 검정 궤도 타원·위성 본체, 64 뷰박스).'),
 (r'^media/apple-icon\.png$', '미디어: 레포 `app/apple-icon.png`(180×180) 복사.'),
 (r'^media/(opengraph|twitter)-image\.png$', '미디어: 레포 `app/\\1-image.png`(1200×630, 영문 워드마크 「MatchSat」) 복사. 히어로·제품 사진은 레포에 없음.'),
 (r'^contact\.jpg$', '이 프로젝트 전 캡처를 줄여 모은 한 장(`python3 tools/contact.py matchsat`).'),
]
files = []
for dp, dn, fns in os.walk(ROOT):
    rel_dir = os.path.relpath(dp, ROOT)
    if rel_dir.split(os.sep)[0] in ('capture',):
        continue
    for f in fns:
        if f.endswith(('.png', '.mp4', '.jpg', '.svg', '.webp')):
            files.append(os.path.normpath(os.path.join(rel_dir, f)))
files.sort()
out = ['# matchsat shots', '',
 '운영 Supabase 가 정지 상태(DNS 미해석)라 운영 데이터 화면은 찍지 못했다(복원 시도 안 함). 모든 화면은 **로컬 사본 + 로컬 Supabase + 가짜 데이터**다. 운영 접속·쓰기 0(앱·DB 모두 127.0.0.1).',
 '규격: 데스크톱 1440×900@2 · 모바일 390×844@3. 모든 PNG 옆 .json(요소 사각형·글자·scrollY·viewport·pii_scan·intercepted).',
 '',
 '## 로컬 환경과 결정(촬영 방식)',
 '- 사본: `git -C ~/satorder archive 6aa098e` → `tmp/matchsat-src`(촬영 뒤 삭제). 마이그레이션 23개를 `supabase start` 가 로컬 컨테이너 `pm-matchsat`(API 57020·DB 57021)에 적용. `config.toml` 의 운영 ref project_id 는 `pm-matchsat` 로 바꿈(사본만). 사본의 db.sh·supabase/apply.mjs·deploy.sh 는 쓰지 않음. 앱 `.env.local` 은 사본에 새로 만든 로컬 URL·로컬 anon 키뿐.',
 '- 서버: `next dev`(포트 3612, nice 10). 사유: `heavy-run` 빌드 게이트가 서버 과부하로 3600초 대기 후 75(미룸)로 끝나 `next build` 를 못 했다(`tmp/matchsat-build-note.txt`). 개발 서버의 개발 배지·오버레이는 lib 가 숨김. 화면 렌더는 prod 와 같은 코드·같은 CSS.',
 '- 시드: `matchsat/capture/seed.mjs`(+`seed-tail.sql`) — 가짜 계정 8(수요 기관 A·B, 공급자 A위성·B위성영상·C지구관측, 관리자 1, 승인 대기 수요자 C기관·공급자 D위성)은 로컬 GoTrue 에만 만들고, 주문 9·입찰 5(+촬영 중 1)·매칭 5·신고 3·대화방 2 를 실제 테이블 모양대로 psql(로컬 주소 글자 고정)로 삽입. 계좌번호는 앱이 계좌 칸을 보이려면 값이 필요해 0 으로만 채운 가짜 값(브리프 7항 「계좌는 넣지 않는다」와 다른 점 — 화면에서는 가림이 지움). 비밀번호는 무작위·로컬 전용·`tmp/matchsat-pw.env`(600, 커밋 안 됨).',
 '- 가로채기 결정: guard 의 비GET 가로채기를 **로컬 주소(127.0.0.1:3612 앱·127.0.0.1:57020 Supabase)에 한해 allow** 했다 — 앱과 DB 가 모두 이 서버의 로컬 사본이라 운영이 아니다(`capture/common.mjs` GUARD). 그 밖의 주소 비GET 은 기본값대로 가짜 200. 실제로 쓰인 것: 로그인 서버 액션 POST 4번(수요자 A·B·공급자 A·관리자, `setup-login.mjs`, 세션 저장용 별도 컨텍스트라 json 에는 안 남음), 입찰 제출 1번(states/bid-submit/03-after.json 의 allowed_nonget). 서버 렌더 화면은 로컬 DB 상태로 만듦.',
 '- 지시와 코드가 다른 점: 「수요 등록」=「위성영상주문」, 「수요 목록·입찰」=「주문 입찰」(공급자 전용), 「지정 매칭」·「매칭 재지정」은 독립 화면이 아님(특별주문 하위 흐름·`/admin` 하단 조건부 섹션), 「주문 수정」 조건은 4가지(본인·open·입찰 0건·imaging), 입찰은 주문당 1회(재입찰=수정)·밀봉·횟수 제한 없음.',
 '- 실제 동작 메모: 위성영상주문 3단계에서 「다음」을 누르면 4단계에 예산 오류 배너가 뜬다(「다음」→「제출」 버튼이 같은 DOM 자리에서 type 만 바뀌어 클릭이 제출로 처리됨). 영상에 쓰려면 이 배너가 보인다는 점을 감안할 것. 고객 코드는 고치지 않았다.',
 '- 미촬영: 비로그인 `/guide`·`/suppliers` 등은 지시 항목이 아니라 찍지 않음. 모바일 「수요 목록」은 실제 「주문 입찰」 목록(공급자 로그인)으로 찍음.',
 '']
miss = []
for rel in files:
    d = None
    for pat, desc in R:
        m = re.search(pat, rel)
        if m:
            d = re.sub(r'\\(\d)', lambda mm: m.group(int(mm.group(1))), desc) if '\\' in desc else desc
            break
    if d is None:
        miss.append(rel); d = '(설명 없음)'
    out.append(f'- `{rel}` — {d}')
open(os.path.join(ROOT, 'shots.md'), 'w', encoding='utf8').write('\n'.join(out) + '\n')
print('files', len(files), 'missing', miss)

#!/usr/bin/env python3
"""eureka shots.md 생성 — 파일 이름 → 한 줄 설명. 실행: python3 eureka/capture/make_shots_md.py"""
import os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

HEAD = """# eureka shots

- **지시의 유레카 = 운영 노모어누수** (근거 ~/easysite/src/config/portfolio.ts:113-121, ~/easysite/public/portfolio/nomorenusu.png). 화면 속 상호 글자는 「노모어누수」 그대로 둔다(픽셀 동일 원칙) — 영상 자막 상호 표기는 메인 세션 '결정 필요'.
- 소스 저장소가 없어 운영 공개 화면 `nomorenusu.com` 을 GET 으로만 촬영했다(Playwright 1.64, chromiumSandbox). 시작 전 guard: `POST /api/analytics/event`(메서드 무관)와 모든 비GET(홈 URL 로 가는 서버 액션 submitQuote 포함, Cloudflare `/cdn-cgi/rum` 비콘 포함)을 가짜 200 으로 가로챔. 제출·로그인·전화·카카오 링크는 한 번도 누르지 않았다. 가로챈 요청 수는 각 .json 의 `intercepted` 에 있다.
- 가림: 대표번호(머리 띠·CTA·견적 섹션·플로팅·푸터)는 `010-****-****` 로 치환, 꼬리의 「전화:」·「사업자정보:」 줄은 숨김(visibility), 현황판 고객 이름은 `김○○`(사이트가 원래 성+o+끝 글자로 마스킹한 값을 다시 김○○ 로), 지역은 원래 시·구까지. 화면 속 도메인 글자는 lib 가 자동으로 지운다. 후기 카드의 이름(`이o훈 님` 등)은 사이트 자체 마스킹 그대로 둠. 모든 PNG 옆 .json 의 `pii_scan.total` 은 0.
- 현황판 이름 칸은 사이트 CSS 상 폭이 좁아(데스크톱 약 37px) 원래도 말줄임(`김○…`)으로 보인다 — 사이트 그대로다.
- 히어로 이미지(`/about/*.png`)는 고객 제공·AI 생성 일러스트·사진이다(RECON·브리프). 사람 얼굴이 나오지만 고객 자산이고 실제 서비스 화면 그대로다.
- **현황판은 데모 모드**다(NEXT_PUBLIC_LIVE_BOARD_DEMO=true, 클라이언트가 2.5초마다 행을 끼우고 1.5초마다 상태를 올림 — facts.md 6). 자막에 「실시간」「실제 접수」를 쓰면 안 된다.
- 지시와 다른 점: 지시의 「지역명 파라미터 2종」 = 실제 경로형 동 랜딩 2종(`?city=` 는 화면 불변, facts.md 9) · 「게시판」 = 화면 이름 「작업사례」 · 「견적 폼 사진 첨부 단계」 = 단계 없는 한 장 폼의 선택 칸 · 「실시간 작업 현황판」 = 홈 히어로 우측(모바일은 히어로 아래) 데모 패널 · 관리자 = BLOCKED.md.
- 사진 선택 시험: 얼굴·번호 없는 가짜 이미지 3장(`capture/fake/fake-ceiling-{1,2,3}.jpg`, 직접 생성한 얼룩 그라데이션)을 `#images` 에 `setInputFiles`. 선택만으로 나간 새 요청은 0건(상태 흐름 4개 모두 실행 로그 `사진 선택 직후 새 요청: 0`) — 업로드는 제출 서버 액션에서만 일어난다.
- `*-full.png` 는 장치 픽셀 16,384 를 넘는 fullPage 캡처에서 Chrome 이 구간을 비워 그리는 문제(모바일 홈에서 확인) 때문에 조각 이어 붙임으로 다시 만들었다(검수 지적 2건: 모바일 quote-form-full 의 폼 누락·모바일 home-full 의 흰 구간).
- 상태 흐름 파일은 같은 뷰포트·같은 scrollY. 견적 폼은 한 화면에 안 담겨 같은 입력 순서를 두 번 돌려 위쪽 흐름(fields)·아래쪽 흐름(submit) 둘로 나눴다.
"""

D = {}
def d(k, v): D[k] = v

for vp, W in [('desktop', '데스크톱 1440×900·DSF2'), ('mobile', '모바일 390×844·DSF3')]:
    d(f'{vp}/home', f'랜딩(홈) {W} — 히어로 캐러셀(첫 슬라이드 상태)·LIVE 현황판·서비스·작업사례·후기·견적 폼·FAQ·푸터. 번호 010-****-****, 푸터 전화·사업자정보 숨김, 현황판 이름 김○○. [full=끝까지 스크롤한 전체 / view=첫 화면]')
    d(f'{vp}/region-daechi', f'지역 페이지 ① `/seoul/gangnam-gu/daechi-dong`(대치동 누수탐지) {W}. 가림은 홈과 같음.')
    d(f'{vp}/region-banghak', f'지역 페이지 ② `/seoul/dobong-gu/banghak-dong`(방학동 누수탐지) {W}. 가림은 홈과 같음.')
    d(f'{vp}/posts', f'작업사례 목록 `/posts`(12건/쪽, 지역 칩 26개) {W}.')
    d(f'{vp}/post-detail', f'작업사례 글 1건 `/posts/20261031-october-extension-175`(심곡본동 옥상 누수) {W}. 본문 지명은 마케팅 글이라 그대로.')
    d(f'{vp}/quote-form', f'견적 신청 폼 섹션(홈 `#quote-form`, 「30분 안에 회신 받기」) {W}. full=섹션 전체(조각 이어 붙임, 고정 요소 숨김), view=섹션 맨 위가 화면 위에 오게 스크롤한 한 화면. 빈 폼(제출 안 함).')
    d(f'{vp}/live-board', f'실시간 작업 현황판(데모 모드 — LIVE 패널) {W}. full=패널 전체(조각 이어 붙임), view=패널이 보이는 한 화면. 행의 분류·시각·상태 배지는 사이트 데모 데이터 그대로, 이름 김○○, 지역은 시·구까지.')
d('desktop/header', '고정(sticky) 헤더 — 스크롤한 상태의 머리(무료상담 띠 + 내비). 번호 010-****-****.')
d('mobile/header', '고정(sticky) 헤더 — 스크롤한 상태의 머리(모바일). 번호 숨김.')
d('desktop/admin-login', '관리자 로그인 화면 `/admin/login` 1장(GET 만, 비밀번호 입력·제출 없음) — 접수 목록·상태·상세는 BLOCKED.md. [full / view]')

d('states/quote-form-fields-desktop/01-empty', '견적 폼 흐름 ①(위쪽) 1/4 빈 폼(placeholder 홍길동 등), 데스크톱.')
d('states/quote-form-fields-desktop/02-name-phone-entered', '견적 폼 흐름 ① 2/4 이름 김○○ 입력·연락처 입력(가짜 번호, 화면은 010-****-****).')
d('states/quote-form-fields-desktop/03-region-address-symptom', '견적 폼 흐름 ① 3/4 지역 서울 강남구 선택·상세주소 「○○아파트」·증상 입력(가짜 문구).')
d('states/quote-form-fields-desktop/04-photos-selected', '견적 폼 흐름 ① 4/4 가짜 이미지 3장 선택(썸네일). 선택만으로 요청 0건.')
d('states/quote-form-submit-desktop/01-empty', '견적 폼 흐름 ②(아래쪽) 1/3 빈 폼의 사진 칸·동의·제출 버튼(비활성), 데스크톱.')
d('states/quote-form-submit-desktop/02-photos-selected', '견적 폼 흐름 ② 2/3 입력·사진 3장 선택 후, 동의 체크 전(제출 버튼 비활성).')
d('states/quote-form-submit-desktop/03-ready-to-submit', '견적 폼 흐름 ② 3/3 동의 체크 → 제출 버튼 활성(제출 직전). 버튼은 누르지 않았다.')
d('states/quote-form-fields-mobile/01-empty', '견적 폼 흐름 ①(위쪽) 1/4 빈 폼, 모바일.')
d('states/quote-form-fields-mobile/02-name-phone-entered', '견적 폼 흐름 ① 2/4 이름·연락처 입력(모바일).')
d('states/quote-form-fields-mobile/03-region-address-symptom', '견적 폼 흐름 ① 3/4 지역·상세주소·증상 입력(모바일).')
d('states/quote-form-fields-mobile/04-photos-selected', '견적 폼 흐름 ① 4/4 가짜 이미지 3장 선택(모바일 — 썸네일은 하단 탭바 아래라 이 화면에선 일부만 보임, 아래쪽 흐름에서 전체가 보임).')
d('states/quote-form-submit-mobile/01-empty', '견적 폼 흐름 ②(아래쪽) 1/3 빈 폼의 사진 칸·동의·제출 버튼, 모바일.')
d('states/quote-form-submit-mobile/02-photos-selected', '견적 폼 흐름 ② 2/3 입력·사진 3장 선택 후, 동의 체크 전(모바일).')
d('states/quote-form-submit-mobile/03-ready-to-submit', '견적 폼 흐름 ② 3/3 동의 체크 → 제출 버튼 활성(제출 직전, 모바일). 버튼은 누르지 않았다.')
for vp, W in [('desktop', '데스크톱'), ('mobile', '모바일')]:
    d(f'states/live-board-progress-{vp}/01-t0-initial', f'현황판 상태 흐름 1/4 시작 시점(데모 모드, page.clock 으로 시간 고정) — 8행 대부분 작업접수, {W}.')
    d(f'states/live-board-progress-{vp}/02-t06s', f'현황판 상태 흐름 2/4 가상 시계 +6초 — 새 행이 맨 위에 끼고(NEW 핀) 일부 행이 상담진행·작업출동으로 오름, {W}.')
    d(f'states/live-board-progress-{vp}/03-t15s', f'현황판 상태 흐름 3/4 +15초, {W}. 히어로 슬라이드도 같은 시계로 넘어간 상태.')
    d(f'states/live-board-progress-{vp}/04-t30s', f'현황판 상태 흐름 4/4 +30초 — 작업접수·상담진행·작업출동·작업완료 배지가 섞여 보임, {W}.')
    d(f'states/posts-region-filter-{vp}/01-all-posts', f'작업사례 지역 필터 1/3 전체 목록(`/posts`), {W}.')
    d(f'states/posts-region-filter-{vp}/02-region-gangnam', f'작업사례 지역 필터 2/3 강남구 칩 클릭 → `/posts/region/gangnam`, {W}.')
    d(f'states/posts-region-filter-{vp}/03-region-dobong', f'작업사례 지역 필터 3/3 도봉구 칩 클릭 → `/posts/region/dobong`, {W}.')

for vp, W in [('desktop', '데스크톱'), ('mobile', '모바일')]:
    d(f'seq/hero-carousel-{vp}', f'히어로 일러스트 캐러셀 {W} — 5.0초·60fps. 방식: page.clock 가상 시간(goto 전 install)으로 슬라이드가 막 바뀐 시점을 찾아 다음 전환 직전까지 진행한 뒤 recordSeq(1/60초씩 runFor + getAnimations currentTime 동기화, 프레임마다 스크린샷·PII 검사). 전환 약 2번(0.4초·3.2초 지점, 500ms ease-in-out). first/last PNG 포함.')
d('media/', '출처 운영 `https://nomorenusu.com/logo.png`(512×512)·`/about/{dispatch,rescue,estimate,consult}.png`(1254×1254 히어로 슬라이드 4장) GET 복사, 조회 2026-11-06T07:56Z. 6월 캡처(`~/easysite/public/portfolio/nomorenusu.png`)는 대표번호가 노출돼 있어 복사하지 않았다(경로만 근거).')
d('brand.json', '주색·보조색·폰트와 근거 URL.')
d('facts.md', '자막용 사실 11개와 근거(운영 HTML·번들 GET + 조회 시각).')
d('BLOCKED.md', '관리자 3화면(접수 목록·상태 4단계·접수 상세) 촬영 불가 사유·시도·대안.')

def walk(sub, ext):
    base = os.path.join(root, sub)
    out = []
    if not os.path.isdir(base): return out
    for dp, dn, fn in os.walk(base):
        for f in fn:
            if f.endswith(ext) and '.part' not in f:
                out.append(os.path.relpath(os.path.join(dp, f), root))
    return sorted(out)

def desc_for(rel):
    k = rel[:-4] if rel.endswith('.png') or rel.endswith('.mp4') else rel
    for suf in ('-full', '-view'):
        if k.endswith(suf): base, tag = k[:-len(suf)], ('[끝까지 스크롤한 전체 · 방식: 조각 이어 붙임 — 화면 높이씩 스크롤해 뷰포트 조각을 찍어 PIL 로 이음, 고정 머리는 첫 조각·하단 고정 바는 마지막 조각에만]' if suf == '-full' else '[첫 화면]'); break
    else: base, tag = k, ''
    if base.startswith('seq/'):
        for sfx, vp in (('-first', ''), ('-last', '')):
            pass
    t = D.get(base)
    return (t + ' ' + tag).strip() if t else None

lines = [HEAD]
for sub in ('desktop', 'mobile'):
    lines.append(f'\n## {sub}\n')
    for rel in walk(sub, '.png'):
        t = desc_for(rel)
        lines.append(f'- `{os.path.basename(rel)}` ({sub}) — {t or "(설명 없음)"}')
lines.append('\n## states\n')
for rel in walk('states', '.png'):
    t = desc_for(rel)
    lines.append(f'- `{rel}` — {t or "(설명 없음)"}')
lines.append('\n## seq\n')
for rel in walk('seq', '.mp4') + walk('seq', '.png'):
    name = os.path.basename(rel)
    stem = name.rsplit('.', 1)[0]
    seqname = stem.replace('-first', '').replace('-last', '')
    t = D.get('seq/' + seqname)
    extra = ' 첫 프레임.' if stem.endswith('-first') else (' 끝 프레임.' if stem.endswith('-last') else '')
    lines.append(f'- `{name}` (seq) — {(t or "(설명 없음)")}{extra}')
lines.append('\n## 그 밖\n')
for k in ('media/', 'brand.json', 'facts.md', 'BLOCKED.md'):
    lines.append(f'- `{k}` — {D[k]}')
MEDIA = {'logo.png': '로고 원본(512×512 RGBA, 푸른 N 마크 + 노모어누수) — 운영 `/logo.png`.',
         'dispatch.png': '히어로 슬라이드 1 원본(1254×1254, 24시간 긴급출동) — 운영 `/about/dispatch.png`.',
         'rescue.png': '히어로 슬라이드 원본(1254×1254, 타업체 실패현장 해결) — 운영 `/about/rescue.png`.',
         'estimate.png': '히어로 슬라이드 원본(1254×1254, 정직한 견적) — 운영 `/about/estimate.png`.',
         'consult.png': '히어로 슬라이드 원본(1254×1254, 전화 상담) — 운영 `/about/consult.png`.'}
for f in sorted(os.listdir(os.path.join(root, 'media'))):
    lines.append(f'- `media/{f}` — {MEDIA.get(f, "원본")}')
for f in sorted(os.listdir(os.path.join(root, 'capture', 'fake'))):
    lines.append(f'- `capture/fake/{f}` — 견적 폼 사진 선택 시험용 가짜 이미지(직접 생성한 천장 얼룩 그라데이션, 얼굴·번호 없음).')
open(os.path.join(root, 'shots.md'), 'w').write('\n'.join(lines) + '\n')
print('shots.md written', sum(1 for l in lines if l.startswith('- `')), 'lines;', sum(1 for l in lines if '설명 없음' in l), 'missing')

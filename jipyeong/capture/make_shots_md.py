#!/usr/bin/env python3
"""shots.md 생성 — 파일 이름 → 한 줄 설명(화면·상태·가린 것·가짜 값 여부·seq 방식). 설명 표는 아래 DESC."""
import os, re, sys
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PART = '참여자 화면(모바일 390×844·DSF3) — 운영 URL `jipyeong.mai-eventic.com/jipyeong-shake` 를 GET 으로만 열고 /api/**·GTM·카카오 SDK 는 가로챔, 시계 2026-10-20 14:00 KST 고정(행사 중 상태). 가림: 이름 입력·완료 화면 이름 김○○, 전화 010-****-****.'
ADMIN = '관리자(데스크톱 1440×900·DSF2) — 로컬 사본(커밋 7312f95c 의 git archive, 가짜 env·Supabase 변수 없음)에 jp_admin 쿠키(가짜 pepper 로 발급)와 가짜 응모자 JSON 을 넣은 화면. 모든 이름은 ○○ 가림 꼴, 전화는 010-****-****, 숫자·시각은 전부 가짜 값(실데이터 아님).'
D = {}
def d(k, v): D[k] = v
d('mobile/landing', '랜딩(전체·첫 화면): 히어로 병 + CTA "지평생 흔들고 친구 소환하기"·경품 3종·유의사항. 가림 해당 없음.')
d('mobile/shake-guide', '흔들기 안내(센서 지원 기기 가정: DeviceMotionEvent shim): "막걸리 흔들기 시작" 버튼과 "꾹 눌러 진행하기" 폴백 링크.')
for k, n, t in [('hype', '흥 폭발형', 0.75), ('story', '이야기 보따리형', 1.55), ('cheers', '건배 선동형', 2.51), ('balance', '적당히 즐기는형', 3.55), ('calm', '잔잔한 한잔형', 5.00)]:
    d(f'mobile/result-{k}', f'결과 화면 — 성격 유형 "{n}"(흔든 기록 {t:.2f}초). 그 길이만큼 devicemotion 을 주입해 실제 흐름으로 도달. 가짜 값 없음.')
d('mobile/gate-consent', '게이트 스텝 1 — 동의(개인정보·만 19세 이상·마케팅) 체크 전 화면.')
d('mobile/gate-phone', '게이트 스텝 2 — 이름·휴대폰 입력 후(입력값은 가짜, 화면 글자는 김○○ / 010-****-**** 로 치환).')
d('mobile/gate-otp', '게이트 스텝 3 — 인증번호 6칸(빈 칸, 재발송 카운트다운 표시). 문자 발송 API 는 가짜 성공 응답.')
for n in range(1, 7):
    d(f'mobile/invite-{n}', f'초대장 고르기 화면 — 카드 {n}번 선택(미리보기 큰 카드 + 6종 썸네일 목록).')
d('mobile/done', '완료 화면("응모 완료!") — 이름 김○○, 번호 010-****-**** 로 치환. 응모 API 는 가짜 성공 응답, 카카오 공유는 SDK 미적재 목 경로.')
d('mobile/hold-to-join', "'꾹 눌러 참여' 화면 — 안내 화면에서 폴백 링크를 눌러 들어간 pointer 모드(안내 pill \"기기를 흔들거나, 병을 꾹 눌러 흔들어 주세요\").")
d('states/shake-progress/01-guide', '흔들기 상태 흐름 ① 1/5 안내(흔들기 시작 전).')
d('states/shake-progress/02-shaking-early', '흔들기 상태 흐름 ① 2/5 흔드는 중 초반(약 0.85초, 라벨 "섞는 중…", 게이지 스트라이프).')
d('states/shake-progress/03-shaking-mid', '흔들기 상태 흐름 ① 3/5 흔드는 중 중반(약 2.2초, 병 액체가 섞이는 중).')
d('states/shake-progress/04-mixing-late', '흔들기 상태 흐름 ① 4/5 섞임 연출 후반(약 3.8초, 병 기울어짐·액체 혼합 진행).')
d('states/shake-progress/05-mix-done', '흔들기 상태 흐름 ① 5/5 누적 5초 도달 직후(섞임 완료, 결과로 넘어가기 전).')
d('states/gate-input/01-unchecked', '게이트 상태 흐름 ② 1/6 체크 전(전체 동의·필수 항목 모두 해제, "다음" 비활성).')
d('states/gate-input/02-age-checked', '게이트 상태 흐름 ② 2/6 "만 19세 이상입니다" 만 체크.')
d('states/gate-input/03-all-agreed', '게이트 상태 흐름 ② 3/6 전체 동의(모두 체크, "다음" 활성).')
d('states/gate-input/04-phone-entered', '게이트 상태 흐름 ② 4/6 스텝 2 이름·번호 입력(가짜 입력, 글자는 김○○ / 010-****-****).')
d('states/gate-input/05-otp-requested', '게이트 상태 흐름 ② 5/6 스텝 3 인증번호 칸(발송 후, 빈 칸). 발송 API 가짜 성공.')
d('states/gate-input/06-otp-verified', '게이트 상태 흐름 ② 6/6 인증번호 000000 입력 → 인증 완료 체크("확인하고 초대장 고르기" 활성). 확인 API 가짜 성공.')
for n in range(1, 7):
    d(f'states/invite-cards/0{n}-card-{n}', f'초대장 상태 흐름 ③ {n}/6 카드 {n}번 선택(같은 scrollY 0, 큰 미리보기가 바뀜).')
d('states/hold-to-join/01-sensor-guide', "꾹 눌러 상태 흐름 ④ 1/3 센서 안내 화면.")
d('states/hold-to-join/02-pointer-mode', "꾹 눌러 상태 흐름 ④ 2/3 폴백 링크 클릭 뒤 pointer 모드(안내 pill).")
d('states/hold-to-join/03-holding', "꾹 눌러 상태 흐름 ④ 3/3 병을 누르고 있는 중(약 1.5초, 병이 흔들림·라벨 \"섞는 중…\").")
for k, v in [('admin-login', '관리자 로그인(패스코드 입력) 화면 — 쿠키 없는 첫 방문, 운영자 로그인 UI 그대로. 패스코드는 입력하지 않음.'),
             ('admin-dash', '관리자 대시보드 탭 — 현황 숫자(가짜 값)·오늘 참여 흐름·인증번호 현황·최근 기록. 상단 "보유 기간 종료일 2026-11-30" 은 코드 상수.'),
             ('admin-list', '관리자 명단 탭(응모자 목록) — 200행 가짜 응모자(이름 ○○ 꼴·번호 010-****-****·가짜 시각·유형·초대장).'),
             ('admin-draw', '관리자 주간 추첨 탭 — W1 추첨 완료 상태: 당첨자 26명(1등 1·2등 5·3등 20, 이름 ○○ 꼴, 번호 010-****-****, 시드 앞 16자리는 가짜).')]:
    d(f'desktop/{k}', v)
d('states/admin-draw-week/01-week-1-drawn', '추첨 주차 상태 흐름 ⑤ 1/3 W1(추첨 완료, 당첨자 표).')
d('states/admin-draw-week/02-week-3-drawn', '추첨 주차 상태 흐름 ⑤ 2/3 W3(추첨 완료, 당첨자 표).')
d('states/admin-draw-week/03-week-6-not-drawn', '추첨 주차 상태 흐름 ⑤ 3/3 W6("이 주차는 아직 추첨하지 않았어요", "추첨 실행" 버튼 — 누르지 않음).')
d('seq/shake-mix', '영상 — 안내 화면에서 "흔들기 시작" 클릭 → 흔들기 → 섞임 → 누적 5초 도달·정착 직전까지. 6.0초·60fps. 방식: page.clock 가상 시간 1/60초씩 runFor + devicemotion 프레임마다 주입 + getAnimations currentTime 동기화(recordSeq). 전 프레임 PII 검사.')
d('seq/mix-to-result', '영상 — 3.9초 흔든 상태(미리 감기)에서 시작 → 누적 5.0초 도달 → 정착 → 결과 화면(카운트업·reveal). 5.5초·60fps. 방식은 shake-mix 와 같음(recordSeq, 시작 전 3.9초는 같은 가상 시계로 선행 진행).')
d('media/', '로고(logo-jipyeong·logo-saengmakgeolli .svg/.png)·손글씨 타이틀(title-handwriting*)·히어로 팩샷 hero-product.png·병 분해 레이어 bottle/*·초대장 card-1..6(.jpg·-thumb·-art)·유형 코너 type-*.png·경품 prize-*.jpg·완료 일러스트·카톡 공유 카드 share/·deco/ — 출처 `public/jipyeong/img/`(커밋 7312f95c) 복사. 레포의 저해상 임시본임(LICENSES.md). 영상 원본은 레포에 없음(BLOCKED.md).')
d('brand.json', '색·폰트와 코드 근거 줄.')
d('facts.md', '자막용 사실 10개와 근거.')

def listing(sub, ext='.png'):
    out = []
    base = os.path.join(root, sub)
    if not os.path.isdir(base): return out
    for dp, dn, fn in os.walk(base):
        for f in sorted(fn):
            if f.endswith(ext) and not f.endswith('.part0.png'):
                out.append(os.path.relpath(os.path.join(dp, f), root))
    return sorted(out)

lines = ['# jipyeong shots', '', '- ' + PART, '- ' + ADMIN, '- 모든 PNG 옆 같은 이름 .json: 요소 사각형·글자·scrollY·뷰포트·pii_scan·가로챈 요청. pii_scan.total 은 전부 0.', '- 가림 규칙은 lib 가 찍기 직전 DOM 글자를 바꾸고(MutationObserver) 저장 전·후 두 번 정규식 검사한다.', '']
def key(path):
    p = re.sub(r'-(full|view)\.png$', '', path); p = re.sub(r'\.png$', '', p); return p
def desc(path):
    k = key(path)
    if k in D: return D[k]
    for kk in D:
        if k.startswith(kk) and kk.endswith('/'): return D[kk]
    m = re.match(r'seq/(.+)-(first|last)$', k)
    if m and f'seq/{m.group(1)}' in D: return f"{'첫' if m.group(2)=='first' else '끝'} 프레임 PNG — " + D[f'seq/{m.group(1)}'].split(' 영상 — ')[-1][:80]
    return None
missing = []
for sec, files in [('모바일', listing('mobile')), ('데스크톱', listing('desktop')), ('상태 흐름', listing('states')), ('seq', listing('seq')), ('media', None)]:
    lines += [f'## {sec}', '']
    if files is None:
        lines.append(f"- `media/` — {D['media/']}")
        CAT = [('logo-', '로고 원본'), ('title-handwriting', '손글씨 타이틀(슬로건 "흔들면 이야기가 시작된다")'), ('hero-product', '히어로 팩샷(콜라보 병)'), ('bottle/', '병 분해 레이어(흔들기 화면 병 렌더용)'), ('card-', '초대장 카드(그림 안에 문구 포함)'), ('type-', '성격 유형 코너 일러스트'), ('prize-', '경품 사진'), ('done-illust', '완료 화면 일러스트'), ('share34/', '카톡 공유 카드(3:4)'), ('share/', '카톡 공유 카드(800×400)'), ('deco/', '장식 일러스트'), ('reference/', '디자인 참고 이미지'), ('LICENSES', '자산 라이선스 메모(저해상 임시본 명시)')]
        mroot = os.path.join(root, 'media')
        for dp, dn, fn in os.walk(mroot):
            for f in sorted(fn):
                rel = os.path.relpath(os.path.join(dp, f), mroot)
                cat = next((c for k, c in CAT if rel.startswith(k)), '레포 원본 이미지')
                lines.append(f'- `media/{rel}` — {cat}. 출처 public/jipyeong/img/{rel}(커밋 7312f95c) 복사.')
        lines.append('')
        continue
    for f in files:
        ds = desc(f)
        if not ds: missing.append(f); ds = '(설명 누락)'
        suffix = ''
        if f.endswith('-full.png'): suffix = ' [끝까지 스크롤한 전체]'
        elif f.endswith('-view.png'): suffix = ' [첫 화면]'
        lines.append(f'- `{os.path.basename(f)}` ({os.path.dirname(f)}) — {ds}{suffix}')
    mp4 = [x for x in (os.listdir(os.path.join(root, 'seq')) if os.path.isdir(os.path.join(root, 'seq')) and sec == 'seq' else []) if x.endswith('.mp4')]
    for m in sorted(mp4):
        k = 'seq/' + m[:-4]
        lines.append(f'- `{m}` (seq) — {D.get(k, "")}')
    lines.append('')
lines += ['## 기타', '', f"- `brand.json` — {D['brand.json']}", f"- `facts.md` — {D['facts.md']}", '- `contact.jpg` — 전 캡처 축소 모음(tools/contact.py).', '- `capture/*.mjs` — 촬영 스크립트(common·mobile·admin), `capture/make_shots_md.py` — 이 문서 생성기.', '- `BLOCKED.md` — 못 채운 것.', '']
open(os.path.join(root, 'shots.md'), 'w', encoding='utf-8').write('\n'.join(lines))
print('shots.md written; 설명 누락', missing)

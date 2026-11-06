#!/usr/bin/env python3
"""soopon/shots.md 생성 — 파일마다 한 줄. python3 -I soopon/capture/build-shots.py"""
import os, json
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PAGE = {
 'home': ('메인(/) — 히어로·내게 맞는 숲 프로그램 찾기(필터)·추천·기획전·숲ON비즈 배너·소개', ''),
 'programs': ('결과 목록 /programs(필터 없음 · 총 52개 · 12개/쪽 · 정렬·검색)', ''),
 'programs-filtered': ('결과 목록 /programs?who=kids&exp=nature(아이와+자연체험 필터 적용)', ''),
 'program-forestasan-01': ('프로그램 상세 /program/forestasan-01(예약하기 주 버튼 · 담당자 휴대폰 노출 없는 상세)', '예약 외부 링크는 누르지 않음(href 는 json 에 기록 안 됨), 지역 줄의 상세 도로명주소 지움'),
 'program-company-4-01': ('프로그램 상세 /program/company-4-01(예약하기 주 버튼 상세)', '예약 외부 링크 누르지 않음, 지역 줄 상세 도로명주소 지움'),
 'b2b': ('숲ON비즈 /b2b(지시의 「B2B 비즈 페이지」) — 활용 목적 4카드·추천 프로그램·참여기업·상담 신청 절', ''),
 'b2b-inquiry': ('상담 신청 폼 단독 /b2b/inquiry(빈 폼)', '입력 예시 글자(placeholder)의 전화·이메일 모양은 자동 가림'),
 'b2b-inquiry-done': ('상담 신청 완료 화면(제출 POST 를 가로채 flight 형식 가짜 성공으로 응답 → 실제 클라이언트가 그린 완료 화면, 운영 저장·메일 0)', '가짜 값: 김○○ / A기관 / user***@기관.kr / 010-****-**** 로 입력 후 제출'),
}
lines = ['# soopon shots — 운영 https://sooponfesta.com 공개 화면 GET 촬영 (2026-11-06)', '',
 '공통: 가림은 lib 자동(전화→010-****-****, 이메일·URL 지움) + 지역 줄 도로명주소(capture/common.mjs ADDR_FIX). GA/GTM 요청은 가짜 응답으로 막음, 비GET 은 전부 가로챔(json intercepted 참고). 가짜 데이터 값은 상담 폼 입력칸뿐(아래 states 표시). 예약하기·tel·SNS 링크는 누르지 않았다.', '',
 '지시와 다른 점: 지시의 「숲ON 처방전(고민·동반자·지역·일정 단계)」 = 실제 「내게 맞는 숲 프로그램을 찾아보세요」(3축 칩 동시 선택: 누구와·어떤 경험·지역, 일정 축 없음). 지시의 「B2B 비즈 페이지」 = 「숲ON비즈」(/b2b). 지시의 「상담 신청 폼」 = /b2b#inquiry 절이자 /b2b/inquiry 단독 페이지(같은 InquiryForm, 제출은 서버 액션).', '']
def add(path, text):
    lines.append(f'- `{path}` — {text}')
for vp in ('desktop', 'mobile'):
    d = os.path.join(root, vp)
    if not os.path.isdir(d): continue
    lines += ['', f'## {vp} ({"1440×900 DSF2" if vp=="desktop" else "390×844 DSF3 isMobile hasTouch"})']
    for f in sorted(os.listdir(d)):
        if not f.endswith('.png'): continue
        if f == 'header.png':
            add(f'{vp}/{f}', '스크롤된 상태의 고정 머리(로고·메뉴)'); continue
        base = f[:-4]; kind = 'full' if base.endswith('-full') else 'view'; name = base.rsplit('-', 1)[0]
        desc, extra = PAGE.get(name, (name, ''))
        what = '끝까지 스크롤해 지연 이미지 로딩 후 전체' if kind == 'full' else '첫 화면(스크롤 0)'
        add(f'{vp}/{f}', f'{desc} — {what}' + (f' · {extra}' if extra else ''))
FLOW = {
 'home-filter-chips': '1440 홈 칩 누적(scrollY 540): 전체 52 → 아이와 29 → +자연체험 19 → +경기 8, 결과 패널 개수·2×2 행이 바뀜',
 'home-filter-sheet': '390 홈 필터 시트: 3버튼 → 시트 열림 → 아이와 → +자연체험 → +경기, 「결과 보기 (N개)」 갱신',
 'programs-filter-chips': '1440 /programs 칩 누적: 전체 → 아이와 → +자연체험, 총 개수·목록 교체',
 'b2b-inquiry-info': '1440 상담 신청 폼 위쪽 입력 구역: 빈 폼 → 담당자·소속 → 이메일·연락처 → 관심 프로그램 선택',
 'b2b-inquiry-details': '1440 상담 신청 폼 중간 구역: 빈 → 도입 목적(교육) 선택 → 인원·희망 시기 → 문의 내용',
 'b2b-inquiry-consent': '1440 상담 신청 폼 동의 구역: 모두 해제 → 필수1 → 선택 → 필수3(제출 직전, 제출 버튼은 바로 아래)',
 'b2b-inquiry-info-mobile': '390 상담 신청 폼 위쪽 입력 구역(같은 흐름)',
 'b2b-inquiry-details-mobile': '390 상담 신청 폼 중간 구역(같은 흐름)',
}
FAKEV = ' · 가짜 값: 김○○ / A기관 / user***@기관.kr(이메일 모양은 자동 가림에 안 걸리는 꼴) / 전화는 사이트 예시 모양의 가상 번호를 입력했고 화면에선 010-****-**** 로 가려짐 / 30명 / 11월 둘째 주 평일 / 문의 내용 가짜 문장'
sd = os.path.join(root, 'states')
if os.path.isdir(sd):
    lines += ['', '## states']
    for fl in sorted(os.listdir(sd)):
        for f in sorted(os.listdir(os.path.join(sd, fl))):
            if f.endswith('.png'):
                extra = ''
                if 'inquiry' in fl and f[3:-4] != 'empty' and f[3:-4] not in ('none',): extra = FAKEV
                add(f'states/{fl}/{f}', FLOW.get(fl, fl) + f' — 단계 {f[:-4]}' + extra)
sq = os.path.join(root, 'seq')
if os.path.isdir(sq):
    SEQ = {
     'home-filter-results': '1440 홈 칩(아이와→자연체험→경기) 클릭 때 결과 개수·행이 바뀌는 장면 4.5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화(시작 전 이미지 캐시 예열)',
     'mobile-filter-sheet': '390 필터 시트 열림(sheet-in) → 아이와 → 자연체험 선택, 결과 보기 (N개) 갱신 5초 — 방식: page.clock 1/60초 runFor + getAnimations 동기화',
    }
    lines += ['', '## seq']
    for f in sorted(os.listdir(sq)):
        if f.endswith('.mp4') or f.endswith('.png'):
            n = f.rsplit('.', 1)[0].replace('-first', '').replace('-last', '')
            add(f'seq/{f}', SEQ.get(n, n) + (' — 첫 프레임' if f.endswith('-first.png') else ' — 끝 프레임' if f.endswith('-last.png') else ''))
md = os.path.join(root, 'media')
lines += ['', '## media (레포 ~/Soopon/public/assets 에서 복사, 원본 그대로)']
for f in sorted(os.listdir(md)):
    src = {'logo-': 'logo/', 'symbol-': 'logo/', 'kv-': 'kv/', 'slogan-': 'kv/', 'fowi-': 'org/', 'kfs-': 'org/'}
    sub = next((v for k, v in src.items() if f.startswith(k)), '')
    add(f'media/{f}', f'public/assets/{sub}{f}')
open(os.path.join(root, 'shots.md'), 'w').write('\n'.join(lines) + '\n')
print('shots.md', len(lines), 'lines')

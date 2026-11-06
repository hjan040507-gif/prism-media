# switin — BLOCKED (2026-11-06)

## 막힌 것: 전부(데스크톱·모바일 메인·회사 소개·제품 소개·문의 폼, 관리자 제품 추가, facts.md, shots.md, contact.jpg)

### 사유
- 이 서버에 스윗인(switin) 소스·작업 폴더·운영 주소·관리자 계정 기록이 하나도 없다. 서버에 남은 언급은 촬영 지시 문서 한 줄(`~/projects/prism-soomgo-media/docs/specs/soomgo-media-raw.md:11` "주소 확인할 것: … 스윗인 …")뿐이고, 포트폴리오 목록(`~/hongjun-journey/docs/CONTENT/index.json`)에도 항목이 없다.
- 관리자 제품 추가 화면은 지시상 "기존 계정이 있을 때만, 없으면 로컬"인데 계정도 소스도 없어 둘 다 불가.

### 시도한 것 (2번)
1. 서버 전체 이름 검색: `~/` 폴더 목록·`find / -maxdepth 4`·`~/.config/cc/repos/*.env`·각 레포 CLAUDE.md/README/package.json·`prism-portfolio`·`prism-hq`·`hongjun-journey` 문서에서 switin·스윗인·sweetin → 지시 문서 한 줄 말고 없음.
2. 원격·기록: `git ls-remote git@gh-cla14:…/switin.git` → Repository not found. 전 프로필 Claude 대화 기록(`*.jsonl`)에서 스윗인·switin → 이번 작업의 서브에이전트 기록 말고 없음.

### 가능한 대안
- 사용자가 운영 주소를 알려 주면 공개 화면(메인·회사 소개·제품 소개·문의 폼, 제출은 가로챔)을 같은 규격으로 바로 찍는다. 소스 저장소(SSH alias·저장소 이름)를 알려 주면 로컬 사본으로 관리자 제품 추가 화면도 찍을 수 있다.
- 이어서 하는 명령: "switin 주소는 <주소>(저장소 <alias:계정/이름>)야 — 2차 규격대로 찍어서 push 해"

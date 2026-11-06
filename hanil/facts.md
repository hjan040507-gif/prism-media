# hanil 자막용 사실 (한일금속공업 홈페이지 + CMS)

레포 `/home/dev/hanil` 커밋 `8a0ee85a`(main) 기준. 코드는 `git -C ~/hanil archive 8a0ee85a` 사본(`prism-media/tmp/hanil-src`, 촬영 뒤 삭제)에서 읽었다. 운영 라이브 조회는 `https://www.hanil-pnk.com` GET 만(조회 시각 아래 표기). 원본 `~/hanil` 폴더에서는 명령을 실행하지 않았다.

## 1. 공개 페이지는 28개다 (정적 16 + 공정 상세 12)
- 근거: 라이브 `https://www.hanil-pnk.com/sitemap.xml` 의 `<loc>` 28개 — 조회 2026-11-06T08:02:38Z(`curl` GET, 원본 `tmp/hanil-sitemap.xml`). 코드 근거 `src/app/sitemap.ts:11-37`(정적 16: 홈 1·회사소개 6·PRODUCT 랜딩·설비현황·R&D·ESG·고객지원 4·개인정보처리방침 + 공정 12). 공지 상세 `/support/notice/[id]` 는 동적 라우트라 sitemap 에 없다(그래서 "공개 화면 28개 + 공지 상세").

## 2. 표면처리 공정은 12종, 공정 체계도는 6대분류·상세 21행이다
- 근거: 공정 12종 — `src/lib/content.ts:231`(PROCESSES)·`src/app/(site)/product/[id]/page.tsx:16-18`, 슬러그 12개(`isonite-tf1`·`isonite-tf-plus`·`isonite-ls`·`gas-nitriding`·`defric`·`dlc`·`phosphate`·`td-coating`·`pvd-coating`·`vacuum-heat`·`gas-carburizing`·`vacuum-carburizing`). 체계도 — `src/lib/content.ts` `PROCESS_MATRIX`(그룹 6: ISONITE·GAS NITRIDING·DEFRIC(고체윤활)·화성 처리·DLC·기타 PROCESS, `href:` 21개), 라이브 `/product` 의 표 `<tbody><tr>` 21행 — 조회 2026-11-06T08:02:50Z(`curl` GET, `tmp/hanil-product.html`).

## 3. 관리자에서 바꿀 수 있는 사진 슬롯은 146자리다 (제품 도판 107 + 상단 배경 39)
- 근거: `scripts/report-slots.mjs` 읽기 전용 실행 — 2026-11-06T08:02:42Z, 출력 `hanil/capture/report-slots.out.txt`("총 관리 대상 사진 = 도판 107 + 배경 39 = 146", 도판 슬롯 111 중 렌더 107·미렌더 4, 배경 23영역 39장, ID 중복 0). 공정별 도판: TF1 6·TF+ 12·LS 15·가스질화 31·DEFRIC 6·DLC 8·화성처리 3·T.D 9·PVD 8·진공열처리 3·가스침탄 3·진공침탄 3. 코드: `src/lib/product-media.ts`·`src/lib/background-media.ts`(`BG_SLOT_COUNT`). 같은 숫자가 `PROGRESS.md:588`("제품 사진 107 + 배경 39 = 146")에 기록돼 있다.
- 화면 근거: 배경은 `/admin/backgrounds`(슬롯 선택 → 초점 지정 미리보기 → 저장, 촬영본 `states/bg-replace/`), 제품 도판은 `/admin/product-photos`(교체·순서, `states/product-photo-replace/`·`product-photo-reorder/`). 초점(FocalPicker)은 배경 사진에만 있다(`components/admin/media/PhotoDialog.tsx:222`).

## 4. 설비현황은 3탭 24행이다 (제조설비 9 + 제조설비(2) 6 + 측정기기 9)
- 근거: 라이브 `/facility` 의 패널 3개 `<tbody><tr>` 수 9·6·9 — 조회 2026-11-06T08:02:50Z(`tmp/hanil-facility.html`). 코드 `src/app/(site)/facility/page.tsx:45-80`·`src/lib/content.ts:624`(탭 id `manufacturing`·`manufacturing2`·`measuring`, 열: 설비명·형식·사양·능력·수량). 사전 브리프의 "49항목"은 코드로 맞출 수 없어 쓰지 않는다(미확인).

## 5. 기획서 원문 대조 결과 — 원문 대조는 이 서버에서 재현 불가, 아래는 레포 `PROGRESS.md` 서술 그대로 인용
- 근거: 클라이언트 기획서 원문(PPT 88슬라이드)과 대조 스크립트는 레포에 없다(`assets/`·`docs/specs/` 에 원문·스크립트 없음, 촬영 사본에서 확인). 그래서 "원문 대조 재현 불가". `PROGRESS.md` 서술: `:20` "원문 누락 없음(연혁18·ESG23·공정12)"(2단계 검증), `:117-124` 3차 전수 감사 — 섹션 헤딩 원문 복원 4건·도판 캡션 원문 복원 6건 등, `:213-219` 8/21 2차 검토안 58p 전수 재대조 — "미이행 10건 적발·수정 후 배포". 자막에는 "기획서 대조 감사 3회(기록 기준)"처럼 PROGRESS 서술 수준으로만 쓸 것(문장 617개 대조 같은 수치는 근거 없음 → 미확인).

## 6. 접근성 — 운영 공개 페이지 Lighthouse(모바일) 측정: 6개 중 4개 100, 2개 95~96 (2026-11-06 08:38~08:40Z)
- 근거: `hanil/capture/lighthouse-a11y.sh` 실행 결과 `hanil/capture/lighthouse-a11y.result.tsv`(Lighthouse 12.8.2 · Chrome for Testing 154 `~/.cache/chrome-for-testing` · 접근성 카테고리만 · `--no-sandbox` 없음, 실행 중 Chrome 프로세스 플래그에서 0건 확인 `lighthouse-nosandbox-count.txt`). 점수: `/` 100 · `/company/greeting` 96(color-contrast: 서브내비 eyebrow 문구 `text-[0.7rem]`, 배경 #f7f8fa) · `/product` 100 · `/product/gas-nitriding` 95(color-contrast: 본문 상단 라벨 `text-[#0B1B33]/50`, heading-order: 섹션 h3) · `/facility` 100 · `/support/quote` 100. 원시 JSON 은 `prism-media/tmp/lh-*.json`.
- 과거 기록: 2026-07-27 오픈 전 QA 에서 모바일 Accessibility 100(`PROGRESS.md:76-79`, 푸터 대비 수정 후). 8-10 디자인 변경 뒤 재측정 기록은 없었고, 이번 재측정에서 일부 페이지가 95~96 이다 → 자막에 "접근성 100"을 쓰려면 "전 페이지"가 아니라 "주요 페이지 다수 100"이 정직하다(결정은 영상 쪽).

## 7. 문구 수정 화면은 17개 폼, 마이그레이션은 12개, 관리자 화면은 31 라우트
- 근거: `find src/app/admin/(dash)/content -name page.tsx` 18개 = 허브 1 + 폼 17(home·greeting·company·profile·history·certifications·facility·rnd·esg·esg-text·organization·location·images·support·process·process/[id]·process-guide). `supabase/migrations/0001~0012` 12개. `find src/app/admin -name page.tsx` 31개(로그인 1 포함). 공개 `(site)` page.tsx 18개(공정 12종은 `[id]` 1파일). 조회: 사본 `tmp/hanil-src` 에서 `find`, 2026-11-06.

## 8. 메인 히어로는 6초 간격 3장 크로스페이드(전환 1.4초)다
- 근거: `src/components/site/HeroCrossfade.tsx:16`(`interval = 6000`)·`:62`(`duration-[1400ms] ease-out`, 장마다 `scale-[1.05]`)·`prefers-reduced-motion` 이면 자동 전환 정지(`:32`). 홈 슬라이드 3장 `src/lib/background-media.ts` HOME_SLIDES = `public/images/r2/main-hero-{1,2,3}`(촬영본 `seq/hero-crossfade.mp4`).

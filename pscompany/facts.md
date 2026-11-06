# pscompany(PS COMPANY) facts — 자막에 쓸 수 있는 사실

소스 저장소가 없어 근거는 운영 https://pscp.to 의 HTML·JS 번들·CSS·sitemap·robots 를 GET 으로 읽은 것이다(로그인·제출 0). 조회 시각 2026-11-06T07:59Z~08:09Z. 번들 파일은 `https://pscp.to/_next/static/chunks/<이름>` 이고 조회본은 `~/prism-media/tmp/ps/js/`(촬영 뒤 지워질 수 있음).

## 1. 모집 직군은 3개 — 개인 컨텐츠 · 크루 게스트(MC 포함) · 캐스팅 디렉터
- 근거: 번들 `0tr1f06qf.zt5.js` 의 zod `category:z.enum(["personal","crew","sales"])` 와 라벨 표 `[{personal:"개인 컨텐츠"},{crew:"크루 게스트 (MC 포함)"},{sales:"캐스팅 디렉터"}]`. `/recruit` HTML 의 `name="category"` 라디오 3개. 조회 2026-11-06T07:59Z.
- 주의: `/recruit` 의 모집 안내 카드는 2개(개인 컨텐츠·크루 게스트)이고 캐스팅 디렉터는 별도 페이지 `/recruit/sales`(폼의 직군이 sales 로 고정, 라디오 0개). 직군은 코드에 박힌 값이라 운영에 '모집 직군 관리' 화면은 없다.

## 2. 지원서 항목은 10개(필수 5)
- 근거: 번들 `0tr1f06qf.zt5.js` 의 zod 스키마 `z.object({name,age,gender,phone,email,category,experience,introduction,preferred_contact,agreed})` = 10개. 필수 = 이름(2~40자)·연락처(8~20자, 숫자·-·+·공백·괄호만)·모집 부문·자기소개(10~2000자)·개인정보 동의(true). 선택 = 나이(14~80)·성별·이메일·방송 경력(500자)·선호 연락 방법. HTML 의 필수 표시(`(필수)` sr-only)도 5곳. 조회 2026-11-06T07:59Z.
- 지시의 '사진 첨부' 항목은 없다: `/recruit`·`/recruit/sales` HTML 의 `type="file"` 0개, 번들에 업로드·storage 호출 0건.

## 3. 지원서는 한 페이지 폼 하나, 제출은 서버 액션(브라우저는 DB 에 직접 닿지 않음)
- 근거: 번들 `createServerReference("40d44d6794d125e74e00fdbe57da6b937f813c2af0", …, "submitRecruitApplication")`. 폼 컴포넌트·검증 번들 전체에 `supabase` 문자열 0건, 모든 `p_*.html`·번들에서 Supabase URL·키 0건(`NEXT_PUBLIC_*` 값 없음). 단계·위저드 없이 `/recruit#apply` 한 화면(직군 라디오 → 이름·나이·성별·연락처·이메일 → 방송 경력·자기소개 → 선호 연락 방법 → 동의 → 「지원서 제출」). 조회 2026-11-06T07:59Z.
- 이 촬영에서는 그 POST 를 `page.route` 로 가로채 가짜 성공(RSC flight)을 돌려줬다 — 운영 서버까지 나간 제출 0건(각 PNG json 의 `intercepted` 참고).

## 4. 전형 절차 4단계 — 서류 접수 → 전화 인터뷰 → 대면 면접 → 최종 합격
- 근거: 운영 `/recruit` 「전형 절차」 `<ol>` 4항목(서류 접수 · 전화 인터뷰 · 대면 면접 · 최종 합격 — 「계약 체결 및 방송 시작」). 조회 2026-11-06T07:59Z.

## 5. 공개 화면 7개, sitemap 은 5개 URL
- 근거: 운영 GET 200 — `/`·`/creators`·`/recruit`·`/recruit/sales`·`/contact`·`/privacy`·`/terms`(2026-11-06T07:59Z). `https://pscp.to/sitemap.xml` 은 홈·`/recruit`·`/recruit/sales`·`/contact`·`/creators` 5 URL(lastmod 2026-05-29). `/manage` 는 307 → `/manage/login`, `/admin` 은 404. robots.txt: `Allow: /`, `Disallow: /manage/`·`/api/`.

## 6. 방문자 분석·광고 비콘이 없다
- 근거: 운영 HTML 8쪽(`/`·`/creators`·`/recruit`·`/recruit/sales`·`/contact`·`/privacy`·`/terms`·`/manage/login`)과 JS 번들 19개에서 gtag·googletagmanager·clarity·sendBeacon·fbq·hotjar 0건, 응답에 `Set-Cookie` 0(`/recruit`·`/manage/login`). 예외로 런타임 청크 `turbopack-0rneof8inf-ka.js` 에 Vercel 툴바 로더 1건(`__vercel_toolbar=1` 쿠키가 있을 때만 동작 — 방문자와 무관). 조회 2026-11-06T08:09Z.

## 7. 인증은 관리자 로그인 한 곳, 공개 화면은 로그인 없이 지원 가능
- 근거: `/manage/login` 200, 필드 `admin-login-email`·`admin-login-password`·hidden `redirect`, 제목 「Admin 로그인」·「관리자 전용」. 지원자용 로그인·회원가입 경로 없음(HTML 링크·sitemap 에 없음). 로그인 서버 액션 `signIn`(`40ef30c8…`). 로그인은 시도하지 않았다. 조회 2026-11-06T07:59Z.

## 8. 브랜드 — 딥 핑크 #ff1493 · Pretendard
- 근거: `brand.json` — 운영 CSS `0z340ffjh4vuh.css` 의 색 사용 횟수와 `--font-sans: Pretendard`.

## 사용 금지·미확인
- 홈 「활동 크리에이터 10+」「활동 플랫폼 4」「1일 최소 20만원+」 카운터: 홈 HTML 의 카운터 props 값만 확인했고 근거 데이터(소속 인원 등)는 **미확인** → 자막에 쓰지 않는다.
- `/recruit`·`/recruit/sales` 의 수익 문구(월 500~1,000만원, 일 최소 20만원 보장, 캐스팅 디렉터 수익 예시표 등)는 캡처에서 가렸다(visibility:hidden) — 자막에도 쓰지 않는다.
- 관리자 화면 5개(로그인·대시보드·지원 관리·문의 관리·크리에이터 관리), DB 테이블 3·RLS 3·트리거 2, E2E 81항목: 소스·계정이 없어 **미확인**(브리프 인용뿐) → 자막 금지.

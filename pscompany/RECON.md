# pscompany(PS COMPANY) 촬영 전 사전 조사 — RECON

조사 시각 2026-11-06 07:34~07:42Z · 운영 GET/HEAD(curl)만, 로그인·제출 0 · 소스 저장소 없음(확인됨) · 근거 = 운영 HTML + JS 번들(GET) + 브리프 · 비밀값 기록 0.
작업 사본(휘발): `/tmp/claude-1001/-home-dev--config-cc-manager/7b889ce7-d976-4bfd-a783-5414984b53bc/scratchpad/ps/` (p_*.html, js/*.js). 번들 근거는 아래 「번들」 표기 = 그 폴더의 파일명.

## 0. 먼저 알아야 할 것 (촬영 방식을 바꾸는 사실 6개)

1. **지시의 「지원서 작성 흐름(직군 선택→정보 입력→사진 첨부→제출 직전)」은 운영에 없다.** 지원서는 `/recruit#apply` 한 페이지짜리 폼 하나(스텝·위저드 없음)이고 **사진 첨부 칸이 없다**(`type="file"` 0개, 번들에 storage·upload 0건). 직군 선택은 폼 안의 라디오 3개. 「제출 직전」은 한 화면에 폼을 채운 상태로 만든다. 사진을 넣을 곳이 없으니 가짜 이미지도 필요 없다. 이 흐름을 단계 3장 이상으로 나누려면 같은 스크롤에서 필드를 채워 가며 찍는 수밖에 없다(예: 직군 선택 → 기본 정보 → 자기소개·동의 → 제출 직전).
2. **지원서 제출 = Next.js 서버 액션 POST 하나**(Supabase insert 를 서버에서 한다 — 브라우저는 Supabase 로 직접 가지 않음, 번들에 supabase URL·키 0건). 가로채기는 `page.route` 로 `POST` + 헤더 `next-action` 을 잡으면 된다(§3-2).
3. **관리자 계정이 이 서버에 없다.** `~/qa-creds` = `plangates-qa.json` 한 개(다른 프로젝트, 키 이름 `tenantId·userId·email·pass·stamp` 만 봄), `~/secrets` = `gongchinpon`·`jangu3-firebase-adminsdk.json`·`sinnae.env`(모두 다른 프로젝트). 인계 완료라 계정은 고객에게 있다(브리프 §1). 소스도 없어 로컬 로그인용 로컬 Supabase 도 못 만든다. → **관리자(지원자 목록·상세·직군 관리)는 BLOCKED 후보**(§4·추천 촬영 경로).
4. **「모집 직군 관리」 화면은 없다.** 직군은 코드에 박힌 enum 3개(`personal`·`crew`·`sales`)이고, 관리자 5화면은 로그인·대시보드·지원 관리·문의 관리·크리에이터 관리뿐이다(브리프 §2). 직군 추가·명칭 변경은 고객 추가 발주로 코드를 고쳤다(브리프 §6).
5. **기존 캡처 이미지가 어디에도 없다.** `~/hongjun-journey`·`~/prism-portfolio` 에서 pscompany 관련 png/jpg/webp 0개(브리프·facts.json·링크 검증 로그만 있음). 관리자 화면의 대안 자료 = 0.
6. **공개 화면은 사진에 얼굴이 있는 크리에이터 갤러리를 쓴다**(`/images/creators/IMG_*.PNG`, 정적 파일 `/creators` 10장·홈 8장). 지시상 공개 화면은 찍지 않으니 해당 없음. 지원 폼 화면에는 크리에이터 사진이 없다.

## 1. 스택·실행

| 항목 | 값 · 근거 |
|---|---|
| 프레임워크 | Next.js App Router(Turbopack 청크 `turbopack-*.js`) · React · Tailwind v4 · react-hook-form + zod(번들 `0tr1f06qf.zt5.js`) · sonner 토스트 · 브리프 §2 에 Next 16.2.6·Supabase `@supabase/ssr ^0.10.3`·Vercel |
| 소스 | **없음** — 로컬 실행 불가. 이 단계에서 빌드·서버·설치 0 |
| env 이름 | 소스 없어 목록 불가(번들엔 `NEXT_PUBLIC_*` 0건 = 클라이언트가 Supabase 를 직접 안 부름). 브리프 §3: 서비스 롤 키는 server-only 모듈 |
| DB | Supabase: 테이블 `creators`·`inquiries`·`recruit_applications`, Storage 버킷 1(공개 읽기·5MB·jpeg/png/webp) — 버킷은 **어드민 크리에이터 등록**용(브리프 §7-5)이고 지원 폼과는 무관 |
| 로컬 Supabase | 마이그레이션 파일 없음(소스 없음) → 불가 |
| 분석·비콘 | 운영 HTML·번들에 gtag·GTM·Vercel Analytics·Clarity·sendBeacon 0건 · 응답에 `Set-Cookie` 0(홈·`/manage/login`) · 브리프 §6 「분석 도구 미연동」과 일치 |

## 2. 라이브 주소·상태 (2026-11-06T07:34Z, `curl` GET/HEAD)

| URL | 상태 |
|---|---|
| `/` · `/creators` · `/recruit` · `/recruit/sales` · `/contact` · `/privacy` · `/terms` · `/sitemap.xml` · `/robots.txt` | 200 (프리렌더 `x-nextjs-prerender: 1`, `/recruit` 은 `x-vercel-cache: HIT`) |
| `/manage` | 307 → `/manage/login?redirect=%2Fmanage` (세션 없으면 미들웨어가 돌려보냄) |
| `/manage/login` | 200, 제목 「Admin 로그인」, `no-store`, 필드 `admin-login-email`·`admin-login-password`·hidden `redirect` |
| `/admin` | 404 (브리프 §3-1 「옛 경로 404」와 일치) |

robots.txt: `Allow: /`, `Disallow: /manage/` `/api/`. sitemap 5 URL(홈·`/recruit`·`/recruit/sales`·`/contact`·`/creators`, lastmod 2026-05-29). 브리프 §2 의 「sitemap 4 URL」과 다르다(§10). 봇 챌린지·403 없음.

## 3. 지시 항목 ↔ 실제 라우트·컴포넌트

소스가 없어 file:line 은 없다. 근거는 운영 HTML 의 id·name, 번들 `0tr1f06qf.zt5.js`(지원 폼), `0bs61yol7k7-0.js`(문의 폼), `17zi~8tx0nz2v.js`(로그인).

### 3-1. 지원서 작성 흐름 (모바일·데스크톱 같은 반응형 폼)

| 지시 | 실제 | 셀렉터·메모 |
|---|---|---|
| 직군 선택 | `/recruit#apply` 폼 안 라디오 `name="category"`: `category-personal`(개인 컨텐츠) · `category-crew`(크루 게스트 (MC 포함)) · `category-sales`(캐스팅 디렉터). 카드형 2열 라디오(`sr-only peer` 입력, 라벨 클릭) | `/recruit/sales`(캐스팅 디렉터 모집)는 같은 폼을 `forcedCategory="sales"` 로 쓰고 **직군 라디오가 화면에 없다**(`category-*` 0개). 값 선택은 라벨 클릭 |
| 정보 입력 | 같은 폼의 `#recruit-name` 이름* · `#recruit-age` 나이(number 14~80) · `gender-male/female/other` 성별 · `#recruit-phone` 연락처* · `#recruit-email` 이메일 · `#recruit-experience` 방송 경력 · `#recruit-introduction` 자기소개*(textarea 6행, 10~2000자) · `preferred_contact-phone/kakao/email` 선호 연락 방법 · `#recruit-agreed` 개인정보 동의* | `*` = 필수 5개(이름·연락처·모집 부문·자기소개·동의). 폼은 `noValidate` + zod 검증, 오류는 필드 아래 `role="alert"` 빨간 문구 |
| 사진 첨부 | **없음** | `type="file"` 0 · 번들 upload 0 |
| 제출 직전 | 버튼 「지원서 제출」(그라데이션 `bg-gradient-to-…`), 아래 문구 「수집된 정보는 지원 검토 및 연락 목적으로만 사용됩니다.」+「개인정보처리방침 보기」 | 제출 성공 후 화면은 「지원이 접수되었습니다」카드(체크 아이콘·`영업일 기준 1~3일 내 연락드리겠습니다.`·급한 문의 **전화·카톡 글자 포함 → 가림 대상**·「새 지원서 작성」 버튼) + sonner 토스트 「접수되었습니다」 |
| 모바일 지원 폼 | 같은 페이지를 390×844 로 열면 된다(`sm:grid-cols-2`·`sm:p-10` 반응형). 별도 모바일 라우트 없음 | 데스크톱·모바일 같은 DOM |

### 3-2. 제출 API (가로챌 대상)

- **서버 액션 `submitRecruitApplication`**, 액션 ID `40d44d6794d125e74e00fdbe57da6b937f813c2af0`(번들 `0tr1f06qf.zt5.js` `createServerReference`). 비밀 아님(번들에 공개). 제출은 `onSubmit → useTransition → await p(values)` 후 `r.ok` 이면 토스트+`reset()`+성공 카드, 아니면 `toast.error("제출 실패", {description: r.error})`.
- 요청 모양(Next 서버 액션 규약, 운영 호출은 하지 않았다 — 가로챌 때 검증): `POST` → 현재 페이지 경로(`/recruit` 또는 `/recruit/sales`), 헤더 `next-action: 40d44d67…`, 본문 `[ {name, age, gender?, phone, email, category, experience, introduction, preferred_contact?, agreed} ]`(JSON 배열 하나).
- 가짜 성공 응답: RSC flight 두 줄 `0:{"a":"$@1","f":"","b":"<buildId>"}` + `1:{"ok":true}`. HTML 안 flight 에서 읽은 현재 빌드 ID = `U7c9ECzRV9pUnCBMQZMp6`(운영 재배포되면 바뀜 — 촬영 직전에 `"b":"…"` 를 다시 읽을 것). 응답 `content-type: text/x-component`. 이 형태가 안 먹으면 두 번 시도 뒤 BLOCKED(또는 `r.ok` 를 못 받아 「제출 실패」 토스트가 뜨는 것도 상태 1장으로 남길 수 있음).
- 같은 방식으로 가로챌 것: 문의 폼 `submitInquiry`(`40966e2e4e2f2364a85d0aa8da5a76771fc16dfa3c`, `0bs61yol7k7-0.js`), 로그인 `signIn`(`40ef30c84cbf11227f766e5a7014c46432f9711451`, `17zi~8tx0nz2v.js`). 로그인 제출은 하지 않는다.
- Supabase insert·Storage 업로드가 브라우저에서 직접 나가는 경로는 **없다**(번들에 supabase URL·키·`.from(`·`storage` 0건).

### 3-3. 관리자(지원자 목록·상세·모집 직군 관리) — 로그인 필요

브리프 근거만(운영 라우트는 로그인 없이 못 봄, 미들웨어 matcher `/manage/:path*`): `/manage` 대시보드(카운트 카드 5종) · `/manage/applications`(지원 관리) · `/manage/applications/[id]`(상태 드롭다운 검토→면접→합격 + 연락 버튼) · `/manage/inquiries` · `/manage/creators`·`/manage/creators/new`(이미지 업로드) · `/manage/login`. 「모집 직군 관리」는 없음. 라우트 이름 중 `/manage/applications`·`/manage/inquiries`·`/manage/creators` 는 브리프 문장에서 유추(미확인), `[id]`·`creators/new` 는 브리프 §7 에 명시.

## 4. 테스트·관리자 계정

- **없음.** 위 §0-3. 파일 이름 근거: `~/qa-creds/plangates-qa.json`(다른 프로젝트), `~/secrets/{gongchinpon,jangu3-firebase-adminsdk.json,sinnae.env}`(다른 프로젝트). 키·값 어느 것도 pscompany 용이 아니라고 판단(내용은 pscompany 관련 키 이름 확인용으로 JSON 키 이름만 봄).
- `~/hongjun-journey`·`~/prism-portfolio` 에 계정·인계 문서 흔적 없음(브리프 §9: 인계 문서 원문은 공개 제외 대상).
- 인계 문서(12쪽)·계정은 고객·원 개발자 쪽. 새 계정 생성은 범위 밖(지시: 새 계정 금지).

## 5. 쓰기 위험

- GET 렌더 쓰기: 공개 페이지는 전부 프리렌더(정적)·`Set-Cookie` 0·분석 0 → 위험 없음으로 판단(근거 헤더). `/manage/*` 의 GET 열람 기록·`/manage/login` 렌더 쓰기는 **소스가 없어 미확인** — 로그인 화면 GET 은 응답에 쿠키·쓰기 흔적이 없었다.
- 쓰기 경로(전부 서버 액션 POST, 가로채기 필수): 지원 제출(`recruit_applications` insert), 문의 제출(`inquiries` insert), 로그인(`signIn`, 세션 쿠키). 가로채기 전에 제출 버튼을 절대 누르지 않는다 — 운영 DB 에 지원자 행이 생기고 고객이 관리자에서 본다(전화·이메일 알림 연동 여부는 미확인).
- 속도 제한 카운터·접근 로그는 서버 쪽이라 미확인. 외부 유료 호출 흔적 없음(번들에 외부 API 키·SDK 0).
- `page.route` 는 서버 액션이 **같은 오리진 POST** 라서 잡힌다. 안전장치: 제출 버튼 클릭 전에 라우트를 먼저 등록하고, 라우트 미등록·미매칭 상태에선 클릭하지 않는다(미리 `route.abort` 로 기본 차단하는 방식도 가능).

## 6. 가림 대상 (셀렉터 힌트)

- 머리·꼬리 연락처·주소(규칙: 연락처·주소·SNS 지움): 푸터 `CONTACT`(전화·이메일·카카오톡) · `COMPANY`(사업자등록번호·광주 주소) · 푸터 상호 아래 `Instagram (준비 중)`·`YouTube (준비 중)` 링크 글자 · `/recruit` 의 「접수 문의」블록(전화·카톡·이메일 3줄) · `/contact` 의 「빠른 연락」 · 제출 성공 카드의 「급한 문의는 … 또는 카카오톡 …」 · `/recruit/sales` 「접수 문의」. 푸터는 컴포넌트 하나라 텍스트 노드 치환으로 일괄 가능. 수치·모집 조건 글자 중 「월 500~1,000만원」 「월 128만원」 수익 예시는 브리프 §9 가 캡처에 넣지 않는 편이 안전하다고 함(`/recruit` 모집 카드·`/recruit/sales` 예시 표). 지원 폼 영역 자체는 수익 문구가 없다.
- 폼 입력값은 가짜(예: 이름 `김○○`, 연락처 `010-****-****`, 이메일 비움 또는 `user***`)를 직접 채운다 — 입력값은 value 속성이라 `pii_scan` 이 텍스트 노드만 보면 놓친다 → 입력 `value`·`placeholder`(`010-1234-5678`·`you@example.com` 예시 문자열, 전화 정규식에 걸림)도 함께 스캔·치환해야 한다.
- 관리자(BLOCKED 라 해당 없음, 열게 되면): 지원자 이름·연락처·사진(얼굴 흐림)·자기소개·`/manage/applications/[id]` 연락 버튼의 tel·mailto.
- 크리에이터 사진 `img[alt^="피에스컴퍼니 소속 크리에이터"]`(공개 화면, 지시상 안 찍음).
- 숨길 것(고정 요소): 사이트 상단 네비 고정 헤더(`header` — 스크롤 시 header.png 대상), 쿠키 배너·채팅 위젯은 보이지 않음(HTML 에 없음).

## 7. 사실 후보

| 사실 | 값 | 근거 |
|---|---|---|
| 모집 직군 수 | **3**(개인 컨텐츠 · 크루 게스트(MC 포함) · 캐스팅 디렉터) | 운영 `/recruit` HTML 의 지원 폼 `category` 라디오 3개 · 번들 `0tr1f06qf.zt5.js` enum `["personal","crew","sales"]` · 조회 2026-11-06T07:34Z. 단, 모집 **안내 카드**는 `/recruit` 에 2개(「모집 1」개인 컨텐츠 방송 크리에이터 · 「모집 2」크루 컨텐츠 방송 게스트)이고 캐스팅 디렉터는 별도 페이지 `/recruit/sales` → 「직군 수」를 말할 땐 3(폼 기준)이라고 쓰고 카드는 2+1 |
| 지원서 항목 수 | **10**(이름·나이·성별·연락처·이메일·모집 부문·방송 경력·자기소개·선호 연락 방법·개인정보 동의), 그중 필수 5(이름·연락처·모집 부문·자기소개·동의). 동의를 빼면 입력 항목 9 | 번들 zod 스키마 `u=c.z.object({name,age,gender,phone,email,category,experience,introduction,preferred_contact,agreed})` · HTML 폼 요소 16개(라디오 3묶음×3 + 단일 입력·textarea·체크박스 7)와 일치(묶음 3개가 항목 3개) |
| 지원서 사진 첨부 | 없음 | `type="file"` 0 |
| 전형 절차 | 4단계(서류 접수 → 전화 인터뷰 → 대면 면접 → 최종 합격) | 운영 `/recruit` 「전형 절차」 |
| 홈 수치 | 활동 플랫폼 4 · 활동 크리에이터 **10+** · 1일 최소 보장 20만원+ | 운영 `/` 의 카운터 컴포넌트 props `to:4·to:10 suffix "+"·to:20 suffix "만원+"`(SSR 은 0 으로 그려졌다가 애니메이션으로 오름) — 브리프 §5 는 「검증되지 않은 수치(소속 인원 등) 금지」라고 했고 10+ 의 근거 데이터는 미확인 → 자막에 쓰지 않는 것을 권한다 |
| 공개 화면 | 홈·크리에이터·BJ 모집·캐스팅 디렉터 모집·문의 + 개인정보·이용약관 = 7(`/privacy`·`/terms` 포함) | 운영 200 확인 · 브리프는 공개 6(홈·크리에이터·모집·문의·방침·약관) — 브리프에 없는 `/recruit/sales` 가 더 있음(§10) |
| 어드민 화면 | 5(로그인·대시보드·지원 관리·문의 관리·크리에이터 관리) | 브리프 §2(운영에서 확인 못 함 — 미확인) |
| DB | 테이블 3 · RLS 정책 3 · 트리거 2 · 버킷 1 | 브리프 §2(초기 마이그레이션, 소스 없어 미확인) |
| E2E 81항목 중 77 통과 → 수정 6 | 브리프 §2 · facts.json `ps-company-04`(원문 인용) | 소스·기록 없음 → 미확인(브리프 인용) |
| 스택·버전 | Next 16.2.6 · TS 5 · Tailwind v4 · Supabase · Vercel | 브리프 §2(운영 번들은 Next 청크 구조만 확인 — 버전 숫자는 미확인) |
| 제출 방식 | 서버 액션 POST(브라우저→서버, 서버가 DB insert) | 번들 `createServerReference("40d44d67…", …, "submitRecruitApplication")` |

## 8. 브랜드

- 주색 **#ff1493**(딥 핑크) · 보조 #b347ff(보라) · #00dcff(시안) · 본문 #0a0a0a · 보조 글 #525252/#737373 · 테두리 #d4d4d4/#ededed · 에러 #dc2626. 근거: 운영 CSS 청크·번들 색 사용 횟수(#ff1493 84, #b347ff 36, #0a0a0a 23, #00dcff 22) · 지원 폼 포커스 `focus-visible:border-[#ff1493]`·체크 `has-[:checked]:border-[#ff1493] bg-[#ff1493]/5`.
- 폰트: **Pretendard**(`--font-sans: Pretendard, -apple-system, …` · CDN `pretendard@v1.3.9/dist/web/static/pretendard.min.css`, 운영 CSS `0z340ffjh4vuh.css`·`<link>`). 굵기 black(900)·bold·semibold 사용.
- 로고: 텍스트 로고 「PS COMPANY」(헤더에 `PS`+`COMPANY` 두 줄). 파비콘 `/icon?454f2defa99cfd4a`(동적). 로고 원본 이미지 파일 따로 확인 못 함(미확인).
- 소스가 없어 file:line 은 없다. 촬영 때 `getComputedStyle` 로 한 번 더 뽑아 brand.json 에 기록.

## 9. 다른 세션 점유

- 소스 저장소가 없어 레포·worktree 없음. `ps`·`ss -ltnp` 에서 pscompany·pscp 관련 프로세스·포트 0. `rc-list` 에 pscompany 세션 없음(떠 있는 것은 `claude-ops-pwa` 하나뿐). 운영 사이트만 대상이라 점유 충돌 없음.

## 10. 지시와 코드가 다른 점

1. 지시 「지원서 작성 흐름 = 직군 선택→정보 입력→사진 첨부→제출 직전」 ↔ 운영은 **한 페이지짜리 폼(`/recruit#apply`)**, 단계 구분 없음, **사진 첨부 칸 없음**(HTML `type="file"` 0 · 번들 upload 0). 근거: 운영 `/recruit` 폼 HTML 입력 목록.
2. 지시 「모집 직군 관리」 ↔ 그런 관리자 화면 없음. 직군은 코드 enum 3개(번들 `["personal","crew","sales"]`), 관리자 5화면에 직군 관리 없음(브리프 §2).
3. 지시 「지원자 사진은 얼굴이라 흐리게」 ↔ 지원서에 사진이 없어 지원자 사진 자체가 없다(관리자 지원 상세에도 없을 가능성 높음 — 업로드 버킷은 크리에이터 등록용, 브리프 §2·§7-5; 지원자 사진은 미확인이 아니라 **폼에 필드가 없으므로 DB 에도 없다**고 봄).
4. 지시 「모바일 지원 폼」 ↔ 별도 모바일 화면 없음. 같은 반응형 폼을 390×844 로 찍는 것.
5. 브리프 「공개 6화면」 ↔ 운영엔 `/recruit/sales`(캐스팅 디렉터 모집 + 같은 폼) 가 더 있다(sitemap·HTML 확인) → 공개 7. 브리프 「sitemap 4 URL」 ↔ 운영 sitemap 은 5 URL(`/recruit/sales` 포함).
6. 브리프 §7-2 「/recruit 모집 부문 직군 카드」 ↔ 모집 카드는 2개(개인 컨텐츠·크루 게스트)이고 캐스팅 디렉터는 `/recruit/sales` 별 페이지(내비 「캐스팅 디렉터 모집」). 폼 라디오는 3개.
7. 브리프 §5 「검증되지 않은 수치(소속 인원 등)를 생성하지 않도록 금지」 ↔ 운영 홈에 「활동 크리에이터 10+」 카운터가 있다(근거 데이터 미확인 — 자막 사용 금지 권장).

## 추천 촬영 경로 (결정은 메인 세션)

1. **지원서 작성 흐름·모바일 지원 폼 = 운영 공개 화면 + 서버 액션 가로채기**(`/recruit#apply` 와 `/recruit/sales`, 390×844·1440×900). 로그인·계정 불필요, GET 만 하고 `POST + next-action` 을 `page.route` 로 가짜 `{ok:true}` 응답. 제출 버튼은 가로채기 등록 확인 후에만 누르고 가로챈 수를 json 에 적는다. 사진 첨부 단계는 만들 수 없으니(없는 기능 금지) 상태 흐름을 「직군 선택 → 기본 정보 → 자기소개·동의 → 제출 직전/검증 오류/성공 카드」로 재정의할지 결정 필요.
2. **관리자(지원자 목록·상세·직군 관리) = BLOCKED**: 계정 없음(고객 보유)·소스 없음·기존 캡처 0. 대안은 (a) `/manage/login` 로그인 화면만 운영 GET 으로 1장(입력 비움·제출 안 함, 지원 흐름의 「관리자 쪽」 맥락용), (b) 고객에게 읽기 전용 테스트 계정 요청, (c) 브리프 §7 의 화면 서술만 문서화. 가짜로 다시 그린 관리자 화면은 「실제와 픽셀 동일」 원칙에 어긋나 권하지 않는다.
3. 공개 화면(홈·크리에이터·모집·연락)은 지시상 이미 있음 → 안 찍음. 모집 직군 사실(3개, 폼 기준)은 위 §7 근거로 facts.md 에 쓴다.

막힌 것: 관리자 계정·소스·기존 캡처 전부 없음(§0-3·5). 조사 종료 07:42Z(시작 07:34Z, 30분 이내).

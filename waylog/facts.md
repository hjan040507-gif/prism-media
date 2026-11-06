# waylog(웨이로그) 사실 — 자막용 (웹 PWA 1.9.0 = 태그 v1.9.0 = 커밋 3cbb43c 기준, 확인 2026-11-06)

근거 경로는 `git -C ~/waylog1 archive 3cbb43c` 사본(tmp/waylog-src, 촬영 뒤 지움)의 파일:줄이다. 고객 레포 작업 트리(v3)는 근거로 쓰지 않았다.
Play 프로덕션 반영 버전은 레포 기록상 1.5.1(vc 33, docs/ops/2026-10-12-play-1.8.0-pack.md:11-12)이라 1.9.0 수치를 「Play 에 나간 앱」 자막으로 쓰려면 사용자가 Play Console 에서 확인해야 한다(확정 불가).

## 1. 8주 식단 챌린지는 56일(8주 × 7일)
- 근거: src/constants.js:26-27 (`CHALLENGE_WEEKS = 8`, `CHALLENGE_DAYS = CHALLENGE_WEEKS * 7`). 화면 「17일째 · 56일 중」(App.jsx ChallengeMainScreen, 촬영본 mobile/challenge-8wk-view.png) · 8칸 주차 막대. 자막에 「1일1팩 30일」(constants.js:36)과 섞지 말 것.

## 2. 주차별 미션 8주 × 5개 = 40개
- 근거: src/constants.js:158-159 (주석 「8주 x 5개 = 40 미션」), 촬영 시 사본에서 `id: "w<주>m<번호>"` 40건·`week:` 8건을 센 값(2026-11-06). 일부 미션 문구에 제품 회사 이름이 있어 화면에선 글자를 지웠다(shots.md).

## 3. 푸시 알림: 설정에서 끄고 켜는 종류 5가지 (서버가 보내는 종류는 6가지)
- 근거(설정 5): src/screens/SettingsScreen.jsx:23-29 `NOTIF_TYPES` = 좋아요·댓글·팔로우·챌린지 리마인더(매일 저녁 7시)·앱 소식. 촬영본 mobile/settings-notifications-view.png, states/notif-toggles/.
- 근거(서버 6): supabase/functions/send-push/index.ts:55-62 `TYPE_TO_PREF_KEY` = like·comment·follow·challenge·news·notice. `notice`(서비스 안내)는 설정에 토글이 없다. 자막은 「알림 5종 설정」이 화면과 맞다.

## 4. 비공개 테스트 인원·기간: 미확인(서버 기록 없음)
- 근거: 레포·`~/waylog-release`·`~/waylog-backups` 어디에도 Play Console 기록이 없다(RECON.md §7-3). 레포 밖 브리프 hongjun-journey/docs/CONTENT/briefs/waylog.md:62,23 에 사람이 옮겨 적은 옛 수치(등록 16 · 참여 12+ · 활성 9, 14일)가 있으나 1.5.0 시점 문서라 자막에 쓰지 않는다.

## 5. AI 체성분·식단 기능은 사용자당 하루 50회까지
- 근거: supabase/functions/_shared/ai.ts:220 `USER_DAILY_CAP = 50`, supabase/functions/claude/handler.ts:151-158 (한도 초과 시 429 「오늘 AI 호출 한도(50회) 를 초과했어요」). 촬영은 AI 를 한 번도 부르지 않았다 — 체성분 「AI 분석」 기록은 저장된 결과를 읽는 가짜 응답이다(inbody_records GET).

## 6. 화면 구성: 아래 탭 5칸 · 홈 칩 4개 · 화면 주소 8개
- 근거: 탭 5칸 src/App.jsx:6996 (`<nav aria-label="주 메뉴" … grid-cols-5>`: 홈·챌린지·제품·알림·내 정보, App.jsx:490 HEAD_TITLES). 홈 칩 4개 src/screens/HomeFeed.jsx:1 (전체·제품 후기·일상·챌린지 인증). 화면 주소 8개(`/` `/fav` `/review/:id` `/post/:id` `/profile/me` `/profile/:userId` `/challenge` `/notifications`)+리다이렉트 3개 src/App.jsx:6739-6758. 설정·관리자·체성분·8주 메인은 주소가 아니라 오버레이.

## 7. 글 하나에 사진 최대 10장
- 근거: src/screens/ComposeScreen.jsx:23 (`MAX_PHOTOS = 10`), 입력 화면 「0/10」(states/story-compose/02-story-empty.png).

## 8. 관리자 「앱 소식 보내기」: 제목 50자 · 본문 200자, 알림을 끈 회원은 자동 제외
- 근거: src/screens/AdminModerationScreen.jsx:21-22 (`NEWS_TITLE_MAX = 50`, `NEWS_BODY_MAX = 200`), 같은 파일의 안내문 「알림 OFF 한 사용자는 자동 제외돼요」. 촬영본 states/admin-news/(발송은 누르지 않음 — 확인창까지만).

## 9. 서버 쪽 규모: 서버 함수 7개 · DB 마이그레이션 31개 · 안드로이드 versionCode 38
- 근거: supabase/functions/ 7개 폴더(claude·delete-account·moderation·send-challenge-reminders·send-push·verify-facepack·verify-signup-code, `_shared` 제외) · supabase/migrations/*.sql 31개(촬영 사본에서 센 값, 2026-11-06) · android/app/build.gradle:18-19 (`versionCode 38`, `versionName "1.9.0"`), package.json:4 (`"version": "1.9.0"`).

## 10. 운영 규모는 작아 수치 자막 비권장 (참고)
- 근거: 운영 DB 10-24 백업 manifest(~/waylog-backups/2026-10-24-release-1.9.0/manifest.json, 이번 촬영에서 다시 열지 않음 — RECON.md §0-4 인용): 회원 38 · 후기 70 · 이야기 3 · 챌린지 1. 촬영본의 회원·글·신고·체성분 값은 전부 하네스 가짜 값이다(shots.md).

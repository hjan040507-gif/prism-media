# jipyeong BLOCKED

## 1. (해소) 관리자 데스크톱 화면 — 처음에는 서버 자원 게이트(heavy-run)에서 막힘
- 경과: 23:05Z 부터 빌드 요청이 heavy-run 게이트(스왑 여유·load·CPU)에서 약 4시간 대기, 그 사이 빌드가 `/create` 프리렌더 실패(빌더 페이지가 NEXT_PUBLIC_SUPABASE_* 요구 → 닿지 않는 가짜 값 `http://127.0.0.1:1`·`fake-anon-key-not-real` 을 사본 `.env.local` 에 추가)와 세션 재시작으로 중단. 03:01Z 사용자 지시("바로 해주라")로 대기 프로세스(내 PID)를 끄고 `nice -n 10 npm run build` 를 직접 실행 → 성공(exit 0) → `next start -p 4310` → `capture/admin.mjs` 로 촬영 완료. 서버 PID 종료·사본 삭제 완료.
- 결과: desktop 4쪽(admin-login·dash·list·draw) + 상태 흐름 admin-draw-week 3단계.
- 재현: `git -C /home/dev/maimai-jipyeong archive 7312f95c | tar -x -C ~/prism-media/tmp/jipyeong-src` → 가짜 `.env.local`(JIPYEONG_OTP_PEPPER·JIPYEONG_ADMIN_PASSCODE 임의 값, NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:1, NEXT_PUBLIC_SUPABASE_ANON_KEY 가짜) → `npm ci && npm run build` → `next start -p 4310` → `ADMIN_PORT=4310 JP_FAKE_ENV=<그 env 파일> node jipyeong/capture/admin.mjs`.

## 2. 협업 영상 원본 없음
- 사유: 레포 안에 영상 파일이 없다. 협업 영상은 서버 env `JIPYEONG_VIDEO_URL` 이 가리키는 외부 주소이고, `/jipyeong-shake/video` 로의 GET 은 운영 클릭 카운터를 올리므로 호출하지 않았다.
- 시도: 레포 `public/`·`assets/` 검색(없음). 대안: 대표(지평주조·성립 작가)에게 원본 수령 후 `media/` 에 넣는다.

## 3. 참고(실패 아님)
- 카카오 공유창은 외부 UI 라 캡처할 수 없다 → 초대장 고르기·완료 화면으로 대체.
- 참여자 총수는 DB 조회 금지라 '미확인'(facts.md 6).
- 운영 쓰기 가능성: 참여자 흐름은 운영 URL 에 GET 만 닿았다(HTML·이미지·폰트·sfx). 모든 `/jipyeong-shake/api/**` 는 가짜 응답으로 가로챘고 `/jipyeong-shake/video` 는 열지 않았다.

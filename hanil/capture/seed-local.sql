-- 촬영용 가짜 데이터 — 로컬 Supabase(127.0.0.1:57032)에만. 사람 이름은 가린 꼴, 전화·이메일은 가려진 꼴, 상호는 'A산업'식(가짜 값).
-- 0004 마이그레이션이 넣은 고객 실제 담당자 이메일 행은 지우지 않고 가짜 관리자로 덮는다(UPDATE).
update public.admin_emails set email = 'admin@example.com', note = '촬영용 가짜 관리자' where note like '%담당자 계정%';
insert into public.inquiries (type, company, name, email, phone, process, material, quantity, message, status, created_at) values
 ('quote','A산업','김○○','user***','010-****-****','가스질화','SCM440','2,000개','샤프트 부품 가스질화 처리 견적을 요청드립니다. 도면은 별도 전달 예정입니다.','new', now() - interval '35 minutes'),
 ('quote','B정밀','이○○','user***','010-****-****','DLC 코팅','SKD11','500개','금형 부품 DLC 코팅 단가와 납기를 문의드립니다.','new', now() - interval '3 hours'),
 ('contact','C테크','박○○','user***','010-****-****',null,null,null,'설비현황 자료에 나온 진공열처리 로의 처리 가능 크기를 알고 싶습니다.','new', now() - interval '1 day'),
 ('quote','D기계','최○○','user***','010-****-****','ISONITE TF1','S45C','1,200개','핀 부품 내마모 처리를 검토 중입니다. 샘플 처리가 가능한지 문의드립니다.','answered', now() - interval '2 days'),
 ('contact','E금속','정○○','user***','010-****-****',null,null,null,'인증서 사본 요청드립니다. 거래처 등록용입니다.','answered', now() - interval '4 days'),
 ('quote','F모터스','한○○','user***','010-****-****','가스침탄','SCr420','3,000개','기어 부품 가스침탄 처리 견적 요청드립니다.','answered', now() - interval '6 days');
insert into public.notices (title, content, pinned, published, created_at) values
 ('홈페이지가 새롭게 오픈했습니다','한일금속공업 홈페이지가 새 모습으로 문을 열었습니다. 표면처리 공정과 설비 현황을 한곳에서 확인하세요.', true, true, now() - interval '20 days'),
 ('설 연휴 휴무 안내','연휴 기간 중 휴무이며 문의는 온라인 문의로 남겨 주시면 순차적으로 회신드립니다.', false, true, now() - interval '9 days');

# 지평 캠페인 이미지 자산 — 라이선스 증빙

클라이언트(지평주조 · 성립 작가) 제공 자산, 캠페인 한정 사용.

## 현재 파일의 성격 — **임시(플레이스홀더)**

이 폴더의 PNG/SVG 는 대표가 보낸 아트워크 썸네일(215×1580px)과 기획안 PDF 에 박힌
이미지(≤313px)에서 추출한 **저해상 파생물**이다(2026-08-31 수령). 지평주조·성립 작가의
원본(AI·SVG 또는 2000px+ PNG, 병 팩샷, 초대장 6종 원본, 경품 사진) 수령 시 **같은 파일명으로
교체**하는 전제이므로 파일명을 바꾸지 않는다.

슬롯 매핑·권장 표시 크기·원본 픽셀 크기는 `docs/assets-0831.md`(팩 동봉 README 원문).

## `bottle/` — 팩샷 분해 레이어 5장 (STEP12, 2026-08-31)

`hero-product.png`(클라 제공 팩샷)를 **빌드 타임에** 분해한 파생물이다.
`body / label / highlight / shadow / cap` 다섯 장 + `src/app/jipyeong-shake/data/bottle-profile.json`.
원저작물은 위와 같은 지평주조·성립 작가 자산이고, 2차 가공 범위에 대한 확인 사항도 그대로 적용된다.

재생성:

```
python3 scripts/jipyeong-bottle-upscale.py --engine lanczos \
    --out /home/dev/tools/realesrgan/out/hero-master-lanczos.png
python3 scripts/jipyeong-bottle-layers.py \
    --src /home/dev/tools/realesrgan/out/hero-master-lanczos.png \
    --preview --upscaler lanczos-x3-unsharp
```

### 업스케일러 — 실제로 쓴 것

- **쓴 것: 3배 LANCZOS + 언샵**(PIL, 레포 안 스크립트). 외부 모델·가중치를 쓰지 않았으므로
  추가 라이선스 고지 대상이 없다.
- **쓰지 않은 것: Real-ESRGAN x4plus**(BSD-3-Clause, 상업 사용 가능). 이 호스트에 GPU 가 없어
  ncnn-vulkan 이 llvmpipe(소프트웨어 Vulkan)로 떨어졌고 결정 2 의 20분 타임박스 안에 20% 밖에
  못 갔다. 바이너리·가중치는 레포 밖(`/home/dev/tools/realesrgan/`)에만 있고 **커밋하지 않았다**.
  GPU 가 있는 환경에서 다시 돌린다면 위 재생성 커맨드의 `--src` 를 그 산출물로 바꾸면 되고,
  그때는 BSD-3 고지를 이 문서에 추가해야 한다.

## 쓰지 않은 것

기획안에 함께 실려 있던 **타사 이벤트 레퍼런스 사진**(LG 스탠바이미 · 신세계 상품권 · 토스 복날
카드)은 이 폴더에 포함하지 않았고 화면에도 쓰지 않는다.

`reference/` 5장은 원본 대조용이라 화면에 렌더하지 않는다(슬롯 로더의 스캔에서 제외).

## 남은 확인 사항 — 미정 · 사용자 확인

- 성립 작가 아트워크의 **2차 가공(추출·업스케일) 범위**와 캠페인 외 사용 가능 여부는 계약 문면으로
  확인되지 않았다. 임시 자산이라 원본 교체 시 함께 정리한다.

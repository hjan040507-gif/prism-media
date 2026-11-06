// 거래 문서 PDF 3종(성능·상태 점검기록부 · 낙찰 확인서 · 판매 정산서) — 레포의 loadXxxDoc + render*Pdf 를 그대로 쓴다.
// DB 는 이 세션이 띄운 가짜 Supabase(mock-supabase.mjs, 가짜 데이터). 사본(tmp/byclick-src)에서 실행한다:
//   cd tmp/byclick-src && MOCK_URL=http://127.0.0.1:3263 node --conditions=react-server --import tsx scripts/gen-pdf.mts <outDir>
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadWonDoc, loadSettlementDoc, loadPerformanceDoc } from "@/lib/pdf/data";
import { renderWonPdf, renderSettlementPdf, renderPerformancePdf } from "@/lib/pdf/render";

const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const admin = createClient(process.env.MOCK_URL!, "mock-service-key-not-real", { auth: { persistSession: false } });
const get = async (p: string) => (await fetch(`${process.env.MOCK_URL}${p}`)).json();
const ids = await get("/__mock/ids");

const won = await loadWonDoc(admin as never, ids.won.au);
if (!won) throw new Error("won doc null");
fs.writeFileSync(path.join(out, "낙찰확인서.pdf"), await renderWonPdf(won.data));
const settle = await loadSettlementDoc(admin as never, ids.settle.sr);
if (!settle) throw new Error("settlement doc null");
fs.writeFileSync(path.join(out, "판매정산서.pdf"), await renderSettlementPdf(settle));
const perf = await loadPerformanceDoc(admin as never, ids.perf.ins);
if (!perf) throw new Error("perf doc null");
fs.writeFileSync(path.join(out, "성능상태점검기록부.pdf"), await renderPerformancePdf(perf.data));
console.log("ok");

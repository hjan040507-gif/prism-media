// media/: 헤더 워드마크("mai-eventic", Paperlogy 900) 실제 렌더를 원본으로 추출(별도 로고 SVG/PNG 가 없다 — components/marketing/SiteHeader.tsx:56).
import { launch, mk, BASE, sleep } from './common.mjs';
import { saveShot, ROOT } from '../../tools/lib.mjs';
import path from 'node:path';
const browser = await launch();
try {
  const { page } = await mk(browser, 'desktop');
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(2000);
  const box = await page.locator('header a[href="/"]').first().boundingBox();
  const pad = 8;
  const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 };
  await saveShot(page, path.join(ROOT, 'maieventic/media/wordmark-header.png'), { clip, kind: 'media', note: '헤더 워드마크 렌더 원본(DSF2)' });
  console.log('wordmark', clip);
} finally { await browser.close(); }

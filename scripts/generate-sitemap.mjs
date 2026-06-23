// 사이트맵 생성기 — 빌드타임에 public/sitemap.xml 생성
//
// 슬러그는 앱과 동일한 로직을 재사용한다(드리프트 방지):
//   - 제품 URL: src/data/productUrl.js 의 productPath()
//   - 카테고리 슬러그: src/data/categoryTabs.js 의 FOOD_TYPES.slug (ACTIVE만)
//
// 실행:  node scripts/generate-sitemap.mjs
// 필요 env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (Vercel 빌드 env에 이미 존재)
// 선택 env: SITE_ORIGIN(기본 https://www.daboonhae.com)

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { productPath } from '../src/data/productUrl.js';
import { ACTIVE_FOOD_TYPES } from '../src/data/categoryTabs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://www.daboonhae.com';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// 색인 제외 ID — 상세 페이지가 noindex("존재하지 않는 제품")로 렌더되는 유령 레코드.
// (2026-06-23 감사에서 확인: id 8/9/11. 신규 발견 시 여기에 추가.)
const GHOST_IDS = new Set([8, 9, 11]);

// 사이트맵에 넣을 정적 경로 (robots Disallow인 /compare·/redirect, 개인화 페이지는 제외)
const STATIC_PATHS = ['/', '/list', '/about', '/faq'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('✗ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const toDate = (ts) => (ts ? String(ts).slice(0, 10) : null);
const xmlLoc = (path) =>
  SITE_ORIGIN + encodeURI(path).replace(/&/g, '&amp;');

function urlEntry(path, lastmod) {
  return (
    `  <url>\n` +
    `    <loc>${xmlLoc(path)}</loc>\n` +
    (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
    `  </url>`
  );
}

async function main() {
  const { data: foods, error } = await supabase
    .from('foods')
    .select('id, name, brand, updated_at, food_type_category_code')
    .eq('is_active', true)
    .order('id', { ascending: true })
    .limit(5000);

  if (error) {
    console.error('✗ Supabase 조회 실패:', error.message);
    process.exit(1);
  }

  const included = foods.filter((f) => !GHOST_IDS.has(f.id));
  const excluded = foods.filter((f) => GHOST_IDS.has(f.id));

  // 카테고리 lastmod = 해당 코드 제품들의 최신 updated_at
  const latestByCode = {};
  for (const f of included) {
    const c = f.food_type_category_code;
    if (!c) continue;
    if (!latestByCode[c] || f.updated_at > latestByCode[c]) latestByCode[c] = f.updated_at;
  }
  const siteLatest = included.reduce(
    (max, f) => (f.updated_at > max ? f.updated_at : max),
    '',
  );

  const entries = [];

  // 1) 정적 페이지
  for (const p of STATIC_PATHS) entries.push(urlEntry(p, toDate(siteLatest)));

  // 2) 활성 카테고리 (준비중/제외 카테고리는 ACTIVE_FOOD_TYPES에 없음)
  const categoryRows = [];
  for (const ft of ACTIVE_FOOD_TYPES) {
    const lm = toDate(latestByCode[ft.code]);
    entries.push(urlEntry(`/category/${ft.slug}`, lm));
    categoryRows.push(`${ft.code} → /category/${ft.slug} (lastmod ${lm ?? '-'})`);
  }

  // 3) 제품 상세
  for (const f of included) {
    entries.push(urlEntry(productPath(f), toDate(f.updated_at)));
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`;

  const outPath = resolve(ROOT, 'public/sitemap.xml');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, xml, 'utf8');

  // 요약
  console.log(`✓ sitemap.xml 생성: ${outPath}`);
  console.log(`  URL 합계: ${entries.length}`);
  console.log(`   - 정적: ${STATIC_PATHS.length}`);
  console.log(`   - 카테고리(활성): ${ACTIVE_FOOD_TYPES.length}`);
  console.log(`   - 제품: ${included.length} (제외 유령 ${excluded.length}: ${excluded.map((f) => f.id).join(', ') || '없음'})`);
  console.log(`  카테고리 매핑:`);
  for (const row of categoryRows) console.log(`   - ${row}`);
}

main();

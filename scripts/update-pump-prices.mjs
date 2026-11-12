// Refreshes data/car.json tracker.pump_prices_weekly from the UK government's weekly
// road fuel prices (DESNZ). The CSV's URL changes with every weekly release, so we look
// it up through the GOV.UK content API rather than hard-coding it.
// Run by .github/workflows/pump-prices.yml; safe to run by hand: `node scripts/update-pump-prices.mjs`.
// Exits non-zero (and writes nothing) if anything looks wrong.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAR = join(root, 'data', 'car.json');
const CONTENT_API = 'https://www.gov.uk/api/content/government/statistics/weekly-road-fuel-prices';
const FROM = '2026-07-06'; // first week we owned the Enyaq

const get = async (url) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'solarbynumbers-pump-prices' } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r;
};

const meta = await (await get(CONTENT_API)).json();
const csvAtt = (meta.details?.attachments ?? []).find(
  (a) => a.content_type === 'text/csv' && /weekly road fuel prices/i.test(a.title) && !/2003/.test(a.title),
);
if (!csvAtt) throw new Error('current weekly CSV attachment not found on GOV.UK');

const csv = (await (await get(csvAtt.url)).text()).replace(/^﻿/, '');
const [header, ...lines] = csv.trim().split(/\r?\n/);
const cols = header.split(',');
const iP = cols.findIndex((c) => /^ULSP.*pump price/i.test(c));
const iD = cols.findIndex((c) => /^ULSD.*pump price/i.test(c));
if (cols[0] !== 'Date' || iP < 0 || iD < 0) throw new Error(`unexpected CSV header: ${header}`);

const rows = [];
for (const l of lines) {
  const f = l.split(',');
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(f[0]);
  if (!m) continue;
  const date = `${m[3]}-${m[2]}-${m[1]}`;
  if (date < FROM) continue;
  const petrol = Number(f[iP]), diesel = Number(f[iD]);
  if (!(petrol > 80 && petrol < 400 && diesel > 80 && diesel < 400)) throw new Error(`implausible prices on ${date}: ${f[iP]} / ${f[iD]}`);
  rows.push([date, petrol, diesel]);
}
rows.sort((a, b) => a[0].localeCompare(b[0]));
if (rows.length === 0) throw new Error('no rows since ' + FROM);

const text = await readFile(CAR, 'utf8');
const current = JSON.parse(text).tracker.pump_prices_weekly;
// Never shrink history: if GOV.UK ever returns fewer weeks than we hold, stop.
if (rows.length < current.length) throw new Error(`GOV.UK returned ${rows.length} weeks, we already hold ${current.length}`);

// Rewrite just the array, three weeks per line, so the rest of car.json keeps its layout.
const fmt = (r) => `["${r[0]}", ${r[1].toFixed(2)}, ${r[2].toFixed(2)}]`;
const body = [];
for (let i = 0; i < rows.length; i += 3) body.push('      ' + rows.slice(i, i + 3).map(fmt).join(', '));
const re = /("pump_prices_weekly": \[)[\s\S]*?(\n    \])/;
if (!re.test(text)) throw new Error('pump_prices_weekly array not found in car.json');
const out = text.replace(re, `$1\n${body.join(',\n')}$2`);
JSON.parse(out); // must still be valid

if (out === text) {
  console.log(`pump prices: up to date (latest ${rows.at(-1)[0]})`);
} else {
  await writeFile(CAR, out);
  console.log(`pump prices: updated to ${rows.at(-1)[0]} (${rows.length - current.length} new week(s))`);
}

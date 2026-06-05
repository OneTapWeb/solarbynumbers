// Aggregates data/daily/*.json into src/data/stats.json for the site build.
// - daily files are the single source of truth (pushed nightly by Home Assistant)
// - derives monthly rollups, cumulative totals and payback progress
// - if no daily files exist yet, synthesizes deterministic sample data so the
//   site can be developed/previewed; meta.sample=true makes the UI show a badge.

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DAILY_DIR = join(root, 'data', 'daily');
const OUT = join(root, 'src', 'data', 'stats.json');

const SYSTEM_COST_GBP = 11999;

async function loadDaily() {
  let files = [];
  try {
    files = (await readdir(DAILY_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f));
  } catch {
    return [];
  }
  const days = [];
  for (const f of files.sort()) {
    try {
      const rec = JSON.parse(await readFile(join(DAILY_DIR, f), 'utf8'));
      if (rec && rec.date) days.push(rec);
    } catch (e) {
      console.warn(`aggregate: skipping unparseable ${f}: ${e.message}`);
    }
  }
  return days;
}

// Deterministic pseudo-random (no Math.random — reproducible builds)
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleDays(n = 45, endISO = '2026-06-04') {
  const rand = mulberry32(20260604);
  const end = new Date(endISO + 'T12:00:00Z');
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    // Late-spring UK: 10.45 kWp east/west, typical 25–55 kWh/day
    const weather = 0.35 + rand() * 0.65; // cloudy..clear
    const gen = +(55 * weather * (0.85 + rand() * 0.3)).toFixed(2);
    const consumption = +(8 + rand() * 6).toFixed(2);
    const battCh = +Math.min(14.6, gen * 0.35).toFixed(2);
    const battDis = +(battCh * 0.92).toFixed(2);
    const selfUse = Math.min(gen, consumption * 0.75);
    const exp = +Math.max(0, gen - selfUse - battCh * 0.3).toFixed(2);
    const imp = +Math.max(0.4, consumption - selfUse - battDis * 0.4).toFixed(2);
    const impCost = +(imp * (0.13 + rand() * 0.05)).toFixed(2);
    const expRev = +(exp * 0.12).toFixed(2);
    const baseline = +(consumption * 0.235).toFixed(2);
    days.push({
      schema_version: 1,
      date,
      tz: 'Europe/London',
      source: 'sample',
      energy_kwh: {
        pv_generation: gen,
        grid_import: imp,
        grid_export: exp,
        house_consumption: consumption,
        battery_charge: battCh,
        battery_discharge: battDis,
      },
      cost_gbp: {
        import_cost: impCost,
        export_revenue: expRev,
        net_cost: +(impCost - expRev).toFixed(2),
        baseline_no_solar_cost: baseline,
      },
    });
  }
  return days;
}

function round2(x) {
  return x == null ? null : Math.round(x * 100) / 100;
}

function aggregate(days) {
  const monthly = new Map();
  const totals = {
    days: days.length,
    pv_generation: 0, grid_import: 0, grid_export: 0,
    house_consumption: 0, battery_charge: 0, battery_discharge: 0,
    import_cost: 0, export_revenue: 0, net_cost: 0,
    baseline_no_solar_cost: 0, savings: 0,
  };
  for (const d of days) {
    const m = d.date.slice(0, 7);
    if (!monthly.has(m)) {
      monthly.set(m, {
        month: m, days: 0,
        pv_generation: 0, grid_import: 0, grid_export: 0,
        house_consumption: 0, battery_charge: 0, battery_discharge: 0,
        import_cost: 0, export_revenue: 0, net_cost: 0,
        baseline_no_solar_cost: 0, savings: 0,
      });
    }
    const mo = monthly.get(m);
    mo.days++;
    const e = d.energy_kwh ?? {};
    const c = d.cost_gbp ?? {};
    for (const k of ['pv_generation', 'grid_import', 'grid_export', 'house_consumption', 'battery_charge', 'battery_discharge']) {
      if (e[k] != null) { mo[k] += e[k]; totals[k] += e[k]; }
    }
    for (const k of ['import_cost', 'export_revenue', 'net_cost', 'baseline_no_solar_cost']) {
      if (c[k] != null) { mo[k] += c[k]; totals[k] += c[k]; }
    }
    // saving for the day = what the grid would have cost - what it actually cost net
    if (c.baseline_no_solar_cost != null && c.net_cost != null) {
      const s = c.baseline_no_solar_cost - c.net_cost;
      mo.savings += s;
      totals.savings += s;
    }
  }
  const monthlyArr = [...monthly.values()].map((m) => {
    const out = { ...m };
    for (const k of Object.keys(out)) if (typeof out[k] === 'number' && k !== 'days') out[k] = round2(out[k]);
    return out;
  });
  for (const k of Object.keys(totals)) if (typeof totals[k] === 'number' && k !== 'days') totals[k] = round2(totals[k]);
  return { monthly: monthlyArr, totals };
}

const real = await loadDaily();
const sample = real.length === 0;
const days = sample ? sampleDays() : real;
const { monthly, totals } = aggregate(days);

const out = {
  meta: {
    sample,
    system_cost_gbp: SYSTEM_COST_GBP,
    payback_progress: round2(Math.min(1, Math.max(0, totals.savings / SYSTEM_COST_GBP))),
    first_date: days[0]?.date ?? null,
    last_date: days[days.length - 1]?.date ?? null,
  },
  totals,
  monthly,
  daily: days,
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out));
console.log(
  `aggregate: ${days.length} days (${sample ? 'SAMPLE DATA' : 'real'}), ` +
  `${monthly.length} months -> src/data/stats.json`
);

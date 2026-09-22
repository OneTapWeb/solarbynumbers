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
const AXLE_LEDGER = join(root, 'data', 'axle.json');
const OUT = join(root, 'src', 'data', 'stats.json');

const SYSTEM_COST_GBP = 11999;

// Export tariff status: paid export went live on 2026-09-22 (Outgoing Octopus,
// flat 12p). Days before EXPORT_PAID_FROM were exported to the grid unpaid while
// certification was pending, and count toward the "foregone export earnings" stat
// at the would-be flat rate. That stat is now historical and stops growing.
const EXPORT_PAID_FROM = '2026-09-22';
const EXPORT_RATE_GBP = 0.12;

// The proposal's own Year-1 model (solar_proposal.html, Section 13, June 2026 revision).
// The site's whole point is testing this in public, so the homepage compares actual
// savings against this projection pro-rated by days elapsed. Some of its streams could not
// be earned for part of that window — export was unpaid until 2026-09-22, and Octopus Saving
// Sessions only run Nov-Mar — so they're broken out to explain the gap honestly rather
// than leaving it looking like underperformance. An entry with 'until' only counts as
// unearnable for the days before that date.
const PROPOSAL = {
  year1_gbp: 2029,
  payback_years: 5.4,
  unearnable: [
    { label: 'solar export at 12p', gbp: 465, why: 'unpaid until export went live on 22 Sep 2026', until: EXPORT_PAID_FROM },
    { label: 'Octopus Saving Sessions', gbp: 120, why: 'only run November to March' },
  ],
};

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
      // A double-encoded file (JSON string instead of an object) parses fine but
      // has no .date, so guard explicitly — otherwise the day vanishes silently.
      if (typeof rec !== 'object' || rec === null || Array.isArray(rec)) {
        console.warn(`aggregate: skipping ${f}: not a JSON object (got ${Array.isArray(rec) ? 'array' : typeof rec} — likely double-encoded)`);
      } else if (!rec.date) {
        console.warn(`aggregate: skipping ${f}: object has no "date" field`);
      } else {
        days.push(rec);
      }
    } catch (e) {
      console.warn(`aggregate: skipping unparseable ${f}: ${e.message}`);
    }
  }
  return days;
}

// Axle's own settled ledger (data/axle.json), transcribed from the app.
// It is the authority on money: the per-day `axle` blocks that Home Assistant
// pushes are our metered-export estimate of each dispatch, which runs a few
// percent out and knows nothing about the monthly top-ups to the £10 minimum.
async function loadAxleLedger() {
  let raw;
  try {
    raw = JSON.parse(await readFile(AXLE_LEDGER, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') console.warn(`aggregate: ignoring unreadable data/axle.json: ${e.message}`);
    return null;
  }
  const tx = Array.isArray(raw?.transactions) ? raw.transactions.filter((t) => t?.date && t?.type) : [];
  if (tx.length === 0) {
    console.warn('aggregate: data/axle.json has no usable transactions — falling back to metered estimates');
    return null;
  }
  return { as_of: raw.as_of ?? null, source: raw.source ?? null, transactions: tx };
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

function aggregate(days, ledger) {
  const monthly = new Map();
  const month = (m) => {
    if (!monthly.has(m)) {
      monthly.set(m, {
        month: m, days: 0,
        pv_generation: 0, grid_import: 0, grid_export: 0,
        house_consumption: 0, battery_charge: 0, battery_discharge: 0,
        import_cost: 0, export_revenue: 0, net_cost: 0,
        baseline_no_solar_cost: 0, savings: 0,
        axle_earnings: 0, axle_events: 0, axle_topups: 0, axle_export_kwh: 0,
      });
    }
    return monthly.get(m);
  };
  const totals = {
    days: days.length,
    pv_generation: 0, grid_import: 0, grid_export: 0,
    house_consumption: 0, battery_charge: 0, battery_discharge: 0,
    import_cost: 0, export_revenue: 0, net_cost: 0,
    baseline_no_solar_cost: 0, savings: 0,
    unpaid_export_kwh: 0, foregone_export_gbp: 0,
    axle_earnings: 0, axle_events: 0, axle_topups: 0, axle_export_kwh: 0,
    axle_metered_estimate: 0,
  };
  for (const d of days) {
    const m = d.date.slice(0, 7);
    const mo = month(m);
    mo.days++;
    const e = d.energy_kwh ?? {};
    const c = d.cost_gbp ?? {};
    // Axle VPP dispatches as our own meters saw them (optional block in the daily
    // JSON; absent on pre-Axle days). The kWh are ours to measure; the money is
    // only an estimate, and is replaced below by Axle's settled ledger if we have it.
    const ax = d.axle ?? {};
    if (ax.export_kwh != null) { mo.axle_export_kwh += ax.export_kwh; totals.axle_export_kwh += ax.export_kwh; }
    if (ax.earnings_gbp != null) {
      totals.axle_metered_estimate += ax.earnings_gbp;
      if (!ledger) { mo.axle_earnings += ax.earnings_gbp; totals.axle_earnings += ax.earnings_gbp; }
    }
    if (ax.events != null && !ledger) { mo.axle_events += ax.events; totals.axle_events += ax.events; }
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
    // export given away unpaid while certification is pending
    if ((!EXPORT_PAID_FROM || d.date < EXPORT_PAID_FROM) && e.grid_export != null) {
      totals.unpaid_export_kwh += e.grid_export;
      totals.foregone_export_gbp += e.grid_export * EXPORT_RATE_GBP;
    }
  }
  // Axle's settled ledger overrides the estimates: paid events plus the monthly
  // top-ups that bring a quiet month up to the £10 guaranteed minimum. Withdrawals
  // are Dave moving the balance to his bank, not income, so they don't count.
  if (ledger) {
    for (const t of ledger.transactions) {
      if (t.type === 'withdrawal') continue;
      const mo = month(t.date.slice(0, 7));
      const amt = Number(t.amount_gbp) || 0;
      mo.axle_earnings += amt;
      totals.axle_earnings += amt;
      if (t.type === 'event') { mo.axle_events++; totals.axle_events++; }
      if (t.type === 'topup') { mo.axle_topups += amt; totals.axle_topups += amt; }
    }
  }

  const monthlyArr = [...monthly.values()].sort((a, b) => a.month.localeCompare(b.month)).map((m) => {
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
const ledger = await loadAxleLedger();
const { monthly, totals } = aggregate(days, ledger);

// Pace against the proposal, and what the current run rate implies for payback.
// Both are honestly summer-weighted this early on — the pages say so.
const elapsed = totals.days || 1;
const proposalToDate = round2((PROPOSAL.year1_gbp * elapsed) / 365);
const runRate = round2((totals.savings / elapsed) * 365);
const unearnable = PROPOSAL.unearnable.reduce((s, u) => s + u.gbp, 0);
// ...and the slice of it that actually applied over the days we have measured: a stream
// with an 'until' date (export) only counts as unearnable for the days before it went live.
const unearnableToDate = PROPOSAL.unearnable.reduce((s, u) => {
  const d = u.until ? days.filter((x) => x.date < u.until).length : elapsed;
  return s + (u.gbp * d) / 365;
}, 0);

const out = {
  meta: {
    sample,
    system_cost_gbp: SYSTEM_COST_GBP,
    payback_progress: Math.round(Math.min(1, Math.max(0, totals.savings / SYSTEM_COST_GBP)) * 1e5) / 1e5,
    axle_source: ledger ? 'ledger' : 'metered',
    axle_ledger_as_of: ledger?.as_of ?? null,
    proposal: {
      ...PROPOSAL,
      unearnable_gbp: unearnable,
      // what the proposal said we'd have banked by now
      to_date_gbp: proposalToDate,
      // ...and against the streams that are actually available to us today
      to_date_earnable_gbp: round2(proposalToDate - unearnableToDate),
      pace: proposalToDate > 0 ? Math.round((totals.savings / proposalToDate) * 1000) / 1000 : null,
      run_rate_gbp: runRate,
      payback_years_at_rate: runRate > 0 ? Math.round((SYSTEM_COST_GBP / runRate) * 10) / 10 : null,
    },
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

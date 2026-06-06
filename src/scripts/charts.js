// Chart.js dashboards for /stats/ — styled to the "engineer's ledger" theme.
import {
  Chart, BarController, BarElement, LineController, LineElement, PointElement,
  CategoryScale, LinearScale, Filler, Legend, Tooltip,
} from 'chart.js';
import stats from '../data/stats.json';

Chart.register(
  BarController, BarElement, LineController, LineElement, PointElement,
  CategoryScale, LinearScale, Filler, Legend, Tooltip,
);

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const AMBER = css('--gen') || '#f0a400'; // generation — sun gold
const EXPORT = css('--export') || '#1d9e61';
const IMPORT = css('--import') || '#e0452e';
const BATTERY = css('--battery') || '#2e8fdf';
const CREAM_DIM = css('--ink-600') || '#4d5159';
const INK = css('--ink-900') || '#16181d';
const LINE = 'rgba(22,24,29,0.07)';

Chart.defaults.font.family = "'IBM Plex Mono', monospace";
Chart.defaults.font.size = 11;
Chart.defaults.color = CREAM_DIM;
Chart.defaults.borderColor = LINE;
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.legend.labels.boxHeight = 12;
Chart.defaults.animation.duration = 700;

const daily = stats.daily;
// UK day-first labels: "2026-06-04" -> "04/06"
const labels = daily.map((d) => `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`);
const e = (k) => daily.map((d) => d.energy_kwh?.[k] ?? null);
const c = (k) => daily.map((d) => d.cost_gbp?.[k] ?? null);

const gridOpts = {
  x: { grid: { color: LINE }, ticks: { maxTicksLimit: 16 } },
  y: { grid: { color: LINE } },
};

// 1 — daily generation vs consumption
new Chart(document.getElementById('chart-energy'), {
  data: {
    labels,
    datasets: [
      { type: 'bar', label: 'Generation (kWh)', data: e('pv_generation'), backgroundColor: AMBER, borderRadius: 3 },
      // Visible points matter here: with pointRadius 0 the line vanishes against the
      // grid when there are only a few days of data (and a single day draws nothing).
      { type: 'line', label: 'Consumption (kWh)', data: e('house_consumption'), borderColor: INK, backgroundColor: INK, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, tension: 0.3 },
    ],
  },
  options: { scales: gridOpts, interaction: { mode: 'index', intersect: false } },
});

// 2 — grid flows: export up, import down
new Chart(document.getElementById('chart-grid'), {
  type: 'bar',
  data: {
    labels,
    datasets: [
      { label: 'Export (kWh)', data: e('grid_export'), backgroundColor: EXPORT, borderRadius: 3 },
      { label: 'Import (kWh)', data: e('grid_import').map((v) => (v == null ? null : -v)), backgroundColor: IMPORT, borderRadius: 3 },
    ],
  },
  options: {
    scales: { ...gridOpts, x: { ...gridOpts.x, stacked: true }, y: { ...gridOpts.y, stacked: true } },
    interaction: { mode: 'index', intersect: false },
    plugins: { tooltip: { callbacks: { label: (i) => `${i.dataset.label}: ${Math.abs(i.raw ?? 0).toFixed(1)} kWh` } } },
  },
});

// 3 — battery throughput
new Chart(document.getElementById('chart-battery'), {
  type: 'bar',
  data: {
    labels,
    datasets: [
      { label: 'Charged (kWh)', data: e('battery_charge'), backgroundColor: BATTERY, borderRadius: 3 },
      { label: 'Discharged (kWh)', data: e('battery_discharge').map((v) => (v == null ? null : -v)), backgroundColor: 'rgba(46,143,223,0.45)', borderRadius: 3 },
    ],
  },
  options: {
    scales: { ...gridOpts, x: { ...gridOpts.x, stacked: true }, y: { ...gridOpts.y, stacked: true } },
    interaction: { mode: 'index', intersect: false },
    plugins: { tooltip: { callbacks: { label: (i) => `${i.dataset.label}: ${Math.abs(i.raw ?? 0).toFixed(1)} kWh` } } },
  },
});

// 4 — what each day cost vs the no-solar baseline
new Chart(document.getElementById('chart-cost'), {
  data: {
    labels,
    datasets: [
      { type: 'line', label: 'No-solar baseline (£)', data: c('baseline_no_solar_cost'), borderColor: IMPORT, borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, tension: 0.3 },
      { type: 'bar', label: 'Actual net cost (£)', data: c('net_cost'), backgroundColor: (ctx) => ((ctx.raw ?? 0) < 0 ? EXPORT : AMBER), borderRadius: 3 },
    ],
  },
  options: { scales: gridOpts, interaction: { mode: 'index', intersect: false } },
});

// 5 — cumulative savings towards payback
let acc = 0;
const cumulative = daily.map((d) => {
  const b = d.cost_gbp?.baseline_no_solar_cost;
  const n = d.cost_gbp?.net_cost;
  if (b != null && n != null) acc += b - n;
  return Math.round(acc * 100) / 100;
});
new Chart(document.getElementById('chart-payback'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Cumulative savings (£)',
      data: cumulative,
      borderColor: AMBER,
      backgroundColor: 'rgba(240,164,0,0.12)',
      fill: true,
      pointRadius: 0,
      borderWidth: 2,
      tension: 0.25,
    }],
  },
  options: { scales: gridOpts, interaction: { mode: 'index', intersect: false } },
});

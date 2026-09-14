// Charts for /stats/. Two of them, both drawn to read like figures in a report:
// no boxed legend (the page supplies its own key), no vertical gridlines, axis
// labels in mono, and the one number worth reading called out on the line itself.
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
const ACCENT = css('--accent') || '#1d4ed8';
const INK_400 = css('--ink-400') || '#8c867c';
const RULE = css('--rule') || '#e4e1dc';
const PROJECTED = '#c7bdae';
const IMPORT = '#b4422c';

Chart.defaults.font.family = "'IBM Plex Mono', monospace";
Chart.defaults.font.size = 10.5;
Chart.defaults.color = INK_400;
Chart.defaults.borderColor = RULE;
// the pages draw their own keys, so the built-in legend stays off everywhere
Chart.defaults.plugins.legend.display = false;
Chart.defaults.animation.duration = 600;
Chart.defaults.maintainAspectRatio = false;

const daily = stats.daily;
const proposal = stats.meta.proposal;

// Month-boundary labels only: a 95-point axis labelled every day is noise.
const monthTick = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short' });
const labels = daily.map((d, i) => {
  const isFirstOfMonth = i === 0 || d.date.slice(5, 7) !== daily[i - 1].date.slice(5, 7);
  return isFirstOfMonth ? monthTick(d.date) : '';
});

const gbp = (v) => `£${Number(v).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;

const baseScales = {
  x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0 } },
  y: { border: { display: false }, grid: { color: RULE, drawTicks: false }, ticks: { padding: 8 } },
};

// --- 1. cumulative savings, actual against the proposal's own year-one model ---
const paybackEl = document.getElementById('chart-payback');
if (paybackEl) {
  let acc = 0;
  const cumulative = daily.map((d) => {
    const b = d.cost_gbp?.baseline_no_solar_cost;
    const n = d.cost_gbp?.net_cost;
    if (b != null && n != null) acc += b - n;
    return Math.round(acc * 100) / 100;
  });
  // the proposal pro-rated across the same days, so the two lines are comparable
  const projected = daily.map((_, i) => Math.round(((proposal.year1_gbp * (i + 1)) / 365) * 100) / 100);

  // Label the last actual point directly — it's the number the page is about.
  const endLabel = {
    id: 'endLabel',
    afterDatasetsDraw(chart) {
      const meta = chart.getDatasetMeta(0);
      const pt = meta.data[meta.data.length - 1];
      if (!pt) return;
      const { ctx } = chart;
      ctx.save();
      ctx.font = "13px 'Newsreader Variable', Georgia, serif";
      ctx.fillStyle = ACCENT;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`£${cumulative[cumulative.length - 1].toFixed(2)}`, pt.x - 4, pt.y - 12);
      // a small dot on the point itself, so the label clearly belongs to it
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  };

  new Chart(paybackEl, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Actual',
          data: cumulative,
          borderColor: ACCENT,
          backgroundColor: 'rgba(29,78,216,0.09)',
          borderWidth: 2,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.2,
        },
        {
          label: 'Proposal estimate',
          data: projected,
          borderColor: PROJECTED,
          borderWidth: 1.5,
          borderDash: [5, 4],
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    },
    options: {
      scales: { ...baseScales, y: { ...baseScales.y, ticks: { ...baseScales.y.ticks, callback: gbp } } },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          callbacks: {
            title: (items) => daily[items[0].dataIndex]?.date ?? '',
            label: (i) => `${i.dataset.label}: £${Number(i.raw).toFixed(2)}`,
          },
        },
      },
      layout: { padding: { right: 10, top: 14 } },
    },
    plugins: [endLabel],
  });
}

// --- 2. grid flows: export above the line, import below ---
const gridEl = document.getElementById('chart-grid');
if (gridEl) {
  new Chart(gridEl, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Export',
          data: daily.map((d) => d.energy_kwh?.grid_export ?? null),
          backgroundColor: ACCENT,
          borderRadius: 2,
        },
        {
          label: 'Import',
          data: daily.map((d) => (d.energy_kwh?.grid_import == null ? null : -d.energy_kwh.grid_import)),
          backgroundColor: IMPORT,
          borderRadius: 2,
        },
      ],
    },
    options: {
      scales: {
        x: { ...baseScales.x, stacked: true },
        y: {
          ...baseScales.y,
          stacked: true,
          ticks: { ...baseScales.y.ticks, callback: (v) => `${Math.abs(v)}` },
        },
      },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        tooltip: {
          callbacks: {
            title: (items) => daily[items[0].dataIndex]?.date ?? '',
            label: (i) => `${i.dataset.label}: ${Math.abs(i.raw ?? 0).toFixed(1)} kWh`,
          },
        },
      },
    },
  });
}

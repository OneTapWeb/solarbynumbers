# Daily stats schema (v1)

One file per day at `data/daily/YYYY-MM-DD.json`, pushed nightly at ~00:15 by
Home Assistant via the GitHub Contents API, or backfilled by `scripts/backfill.py`.
These files are the single source of truth — everything else (`src/data/stats.json`,
monthly rollups, payback progress) is derived at build time by `scripts/aggregate.mjs`
and never committed.

```json
{
  "schema_version": 1,
  "date": "2026-06-04",
  "tz": "Europe/London",
  "generated_at": "2026-06-05T00:15:07+01:00",
  "source": "home_assistant",
  "energy_kwh": {
    "pv_generation": 18.42,
    "grid_import": 4.10,
    "grid_export": 9.77,
    "house_consumption": 11.30,
    "battery_charge": 7.05,
    "battery_discharge": 6.40
  },
  "cost_gbp": {
    "import_cost": 1.23,
    "export_revenue": 1.51,
    "net_cost": -0.28,
    "baseline_no_solar_cost": 4.96
  }
}
```

Conventions:

- **`null`, never `0`, for unavailable values** — 0 is a real measurement.
- kWh and £ rounded to 2 dp.
- `net_cost` = `import_cost − export_revenue`; negative = net credit for the day.
- `baseline_no_solar_cost` = what the day's consumption would have cost imported
  entirely from the grid with no PV/battery (Predbat's no-solar baseline).
- A day's **saving** = `baseline_no_solar_cost − net_cost` (derived, not stored).
- `source` is `home_assistant` (nightly push), `backfill` (historical script) or
  `sample` (synthesized demo data — never committed).
- Schema changes bump `schema_version`; the aggregator must keep reading old versions.

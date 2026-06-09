#!/usr/bin/env python3
"""One-time backfill of data/daily/*.json from Home Assistant's recorder history.

Reads the Sigenergy *daily* accumulator sensors via the REST history API and
writes one JSON file per completed local day, matching data/SCHEMA.md.

Notes
-----
- The recorder keeps ~10 days by default, and the Sigenergy integration only
  began recording on 2026-06-04, so this only needs to cover the gap between
  stack-go-live and the nightly HA push going live.
- Cost fields are left null for backfilled days unless the Octopus cost sensors
  have history (they're filled when available).
- Run from the Windows PC on the same LAN:  python scripts/backfill.py
"""

import json
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

HA_URL = "http://192.168.1.111:8123"
TOKEN_FILE = Path(r"G:\Solar\.ha_token")
OUT_DIR = Path(__file__).resolve().parent.parent / "data" / "daily"
TZ = ZoneInfo("Europe/London")

# Daily accumulator sensors (reset at midnight) -> schema field
# Entity names verified against the live system 2026-06-05.
ENERGY_SENSORS = {
    "sensor.sigen_plant_daily_pv_energy": "pv_generation",
    "sensor.sigen_plant_daily_grid_import_energy": "grid_import",
    "sensor.sigen_plant_daily_grid_export_energy": "grid_export",
    "sensor.sigen_plant_daily_load_consumption": "house_consumption",
    "sensor.sigen_plant_daily_battery_charge_energy": "battery_charge",
    "sensor.sigen_plant_daily_battery_discharge_energy": "battery_discharge",
}
# Export tariff not live yet (final certification pending, ~Jul-Aug 2026).
# Set to 0.12 once the Outgoing tariff is active. Revenue is computed, not metered.
EXPORT_RATE_GBP = 0.0
# Flat import unit rate (GBP/kWh) for the no-solar baseline -- Octopus Flat 23.4p.
# Update when the import tariff changes (e.g. moving to Agile in autumn 2026).
FLAT_RATE_GBP = 0.234


def api(path: str) -> object:
    token = TOKEN_FILE.read_text().strip()
    req = urllib.request.Request(
        f"{HA_URL}{path}",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def day_max(entity_id: str, day: date) -> float | None:
    """Max recorded value of a daily-reset accumulator within the local day."""
    start = datetime.combine(day, datetime.min.time(), TZ)
    end = start + timedelta(days=1)
    path = (
        f"/api/history/period/{start.isoformat()}"
        f"?end_time={urllib.parse.quote(end.isoformat())}"
        f"&filter_entity_id={entity_id}&minimal_response&no_attributes"
    )
    series = api(path)
    if not series or not series[0]:
        return None
    vals = []
    for point in series[0]:
        try:
            vals.append(float(point["state"]))
        except (ValueError, KeyError):
            continue
    return round(max(vals), 2) if vals else None


def main() -> None:
    days_arg = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    today = datetime.now(TZ).date()
    written = 0
    for back in range(days_arg, 0, -1):
        day = today - timedelta(days=back)
        out_file = OUT_DIR / f"{day.isoformat()}.json"
        if out_file.exists():
            print(f"{day} exists, skipping")
            continue

        energy = {field: day_max(eid, day) for eid, field in ENERGY_SENSORS.items()}
        # Costs: Predbat's yesterday sensors aren't queryable historically and the
        # Octopus integration has no export meter yet, so backfilled days carry null
        # for actual cost. Export revenue and the no-solar baseline are both computable:
        # baseline = house_consumption * flat import rate (matches the live automation).
        cost = {"import_cost": None, "export_revenue": None, "net_cost": None,
                "baseline_no_solar_cost": None}
        if energy["grid_export"] is not None:
            cost["export_revenue"] = round(energy["grid_export"] * EXPORT_RATE_GBP, 2)
        if energy["house_consumption"] is not None:
            cost["baseline_no_solar_cost"] = round(energy["house_consumption"] * FLAT_RATE_GBP, 2)

        if all(v is None for v in energy.values()):
            print(f"{day}: no data, skipping")
            continue

        record = {
            "schema_version": 1,
            "date": day.isoformat(),
            "tz": "Europe/London",
            "generated_at": datetime.now(TZ).isoformat(timespec="seconds"),
            "source": "backfill",
            "energy_kwh": energy,
            "cost_gbp": cost,
        }
        out_file.write_text(json.dumps(record, indent=2) + "\n")
        print(f"{day}: wrote {out_file.name}  gen={energy['pv_generation']} kWh")
        written += 1

    print(f"done — {written} day(s) written to {OUT_DIR}")


if __name__ == "__main__":
    main()

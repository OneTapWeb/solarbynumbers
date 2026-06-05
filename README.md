# Solar by Numbers

Source for [solarbynumbers.co.uk](https://solarbynumbers.co.uk) — one UK household's
solar + battery install (22× Aiko 475W / 10.45 kWp, Sigenergy EC 8.0SP, 15.06 kWh
SigenStor, Octopus Agile, Home Assistant + Predbat), documented with real daily data.

## How it works

```
Home Assistant ──nightly 00:15──▶ data/daily/YYYY-MM-DD.json (GitHub Contents API)
                                        │ push to main
                                        ▼
                        GitHub Action: gitleaks → npm run build → rsync → VPS
```

- `data/daily/*.json` — one file per day, pushed by a Home Assistant automation.
  Single source of truth. Schema: [`data/SCHEMA.md`](data/SCHEMA.md).
- `scripts/aggregate.mjs` — runs before every build; derives `src/data/stats.json`
  (totals, monthly rollups, payback progress). Synthesizes clearly-badged sample
  data when no daily files exist yet.
- `scripts/backfill.py` — one-time backfill from the HA recorder for days before
  the nightly push went live.
- Astro static site in `src/`, deployed to the VPS by `.github/workflows/deploy.yml`.

## Local dev

```sh
npm install
npm run dev    # aggregates data then starts astro dev
npm run build  # outputs to dist/
```

## Secrets

None in this repo, ever. HA's GitHub fine-grained PAT lives in HA `secrets.yaml`;
the deploy SSH key lives in GitHub Actions secrets. CI runs gitleaks plus a grep of
the built output and refuses to deploy on a hit.

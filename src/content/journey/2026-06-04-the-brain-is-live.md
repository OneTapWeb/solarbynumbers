---
title: "The brain is live: Home Assistant + Predbat take over"
date: 2026-06-04
summary: "Two months after install, the automation stack is running: Sigenergy, Octopus, Solcast and Predbat all talking to each other on a £50 Dell."
tags: [home-assistant, predbat, software]
---

As of last night, a £50 refurbished Dell OptiPlex is in charge of our electricity bill.

The full chain is live:

- **Sigenergy ESS integration** — Modbus to the inverter, 250+ entities, all local
- **Octopus Energy integration** — live Agile half-hourly rates and Saving Sessions
- **Solcast** — rooftop forecast for both roof faces
- **Predbat** (add-on mode) — planning every half-hour slot against prices + forecast
- **Energy dashboard** — wired to the Sigenergy cumulative meters

The hard part — and the reason this site's [configs page](/configs/) exists — was the
**Predbat ↔ Sigenergy bridge**. Predbat knows *what* it wants (charge now, discharge later,
freeze); the Sigenergy EMS has its own vocabulary of modes and cut-off registers. Three small
automations translate between them, including the subtle cases like "Freeze Charging"
(hold state of charge: self-consumption with discharge prohibited). Several control entities
also ship **disabled by default** in the integration and have to be switched on before any of
it works — the kind of thing that costs an evening when you don't know it yet.

Current state: Predbat is in monitor-then-control mode, learning our consumption pattern
(it only has a day of history so far — `days_previous` goes to 7 next week). The first
controlled charge test is queued up next.

From here the data flows. Every midnight, yesterday's numbers leave Home Assistant and land in
this site's repo, untouched by human hands. Watch them accumulate on the
[stats page](/stats/).

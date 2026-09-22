---
title: "Home Assistant and Predbat are running"
date: 2026-06-05
summary: "A day after install, the automation stack is up. Sigenergy, Octopus, Solcast and Predbat are all connected, running on a £50 Dell."
tags: [home-assistant, predbat, software]
---

The panels went on the roof yesterday, and today a £50 refurbished Dell OptiPlex started running
the battery.

Everything is now connected:

- Sigenergy ESS integration: Modbus to the inverter, over 250 entities, all local
- Octopus Energy integration: live half-hourly rates and Saving Sessions
- Solcast: rooftop forecast for both roof faces
- Predbat (add-on mode): planning every half-hour slot against prices and the forecast
- Energy dashboard: wired to the Sigenergy cumulative meters

We could only move this quickly because the Home Assistant box had been bought, set up and
tested weeks before install day. On the day it was mostly a matter of pointing the integrations at
a real inverter.

The difficult part, and the reason the [configs page](/configs/) exists, was getting Predbat to
drive the Sigenergy EMS. Predbat decides what it wants (charge now, discharge later, hold), while
the Sigenergy side has its own set of modes and cut-off registers. Three small automations
translate between the two, including awkward cases like "Freeze Charging", which means holding the
current state of charge by allowing self-consumption but blocking discharge. Several of the control
entities are also disabled by default in the integration, and nothing works until you enable them.
That took us an evening to find.

Predbat is still learning our consumption. It only has a day of history, so `days_previous` goes
up to 7 next week, and the first controlled charge test is lined up.

The stats now update themselves. Every midnight Home Assistant sends the previous day's numbers to
this site's repo, and they appear on the [stats page](/stats/).

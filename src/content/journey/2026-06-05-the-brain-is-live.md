---
title: "The brain is live: Home Assistant and Predbat take over"
date: 2026-06-05
summary: "One day after install, the automation stack is running. Sigenergy, Octopus, Solcast and Predbat are all talking to each other on a £50 Dell."
tags: [home-assistant, predbat, software]
---

The panels went on the roof yesterday. Today, a £50 refurbished Dell OptiPlex took charge of
our electricity bill.

The full chain is live:

- **Sigenergy ESS integration**: Modbus to the inverter, over 250 entities, all local
- **Octopus Energy integration**: live Agile half-hourly rates and Saving Sessions
- **Solcast**: rooftop forecast for both roof faces
- **Predbat** (add-on mode): planning every half-hour slot against prices and the forecast
- **Energy dashboard**: wired to the Sigenergy cumulative meters

Being able to move this fast wasn't luck. The Home Assistant box was bought, installed and
rehearsed weeks before install day, so on the day itself it was mostly a case of pointing the
integrations at a real inverter.

The hard part, and the reason this site's [configs page](/configs/) exists, was the bridge
between Predbat and the Sigenergy EMS. Predbat knows *what* it wants (charge now, discharge
later, hold). The Sigenergy side has its own vocabulary of modes and cut-off registers. Three
small automations translate between them, including fiddly cases like "Freeze Charging", which
means hold the current state of charge by allowing self-consumption but blocking discharge.
Several of the control entities also ship **disabled by default** in the integration, and
nothing works until you switch them on. That one cost us an evening.

Current state: Predbat is learning our consumption pattern (it only has a day of history so far,
so `days_previous` moves to 7 next week), and the first controlled charge test is queued up.

From here the data flows on its own. Every midnight, yesterday's numbers leave Home Assistant
and land in this site's repo without anyone touching a keyboard. Watch them stack up on the
[stats page](/stats/).

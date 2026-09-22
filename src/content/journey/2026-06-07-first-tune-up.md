---
title: "First tune-up: three small fixes from a config review"
date: 2026-06-07
summary: "Three days in, we checked the whole automation stack against what's actually running on the box. Predbat is still in monitor mode, but the review found an automation bug and two settings to change before it takes control."
tags: [home-assistant, predbat, software, tuning]
---

Predbat has been watching the house for three days, planning every half-hour slot but not yet
allowed to act on the plan. Before letting it take control we went through the whole config:
every entity reference, automation and tuning setting, checked against what is actually running on
the box rather than what we thought we'd set up. We found three things to fix.

## Fix 1: a race condition in the bridge automations

Two of the three automations that turn Predbat's decisions into Sigenergy register writes ran in
`mode: single`. In that mode, if a second trigger arrives while the automation is still running,
the second one is dropped without any warning, and the inverter is left with an out-of-date charge
or discharge limit until the next write. The window is small, but half-hourly rate changes are
exactly what produce quick back-to-back updates.

`mode: restart` is what you want when the automation should always follow the latest value: a new
trigger cancels the current run and starts again with fresh state. It's a one-word change. The
copy on the [configs page](/configs/) is updated too, so if you copied our bridge automations,
take the new version.

## Fix 2: a safety buffer on the battery floor

`best_soc_keep` was 0, so Predbat could plan the battery right down to the 4% hardware reserve
with no margin. That works if the forecast is perfect. When Solcast overestimates by a couple of
kWh, as it will sometimes, the shortfall comes from the grid at the peak rate of 35p+.

It matters more for us than for most Predbat users because **we still earn nothing for export**,
so there's no export income to make up for a miss, and every kWh we're short at the evening peak
is paid for at full price. We set the buffer to 0.5 kWh. That costs pennies in extra cheap-rate
charging and removes the worst case.

## Fix 3: discharge rate scaling

A leftover scaling factor (`battery_rate_max_scaling_discharge: 1.05`) was telling Predbat the
battery discharges 5% faster than the sensor reports. With [what's actually on the
wall](/journey/2026-06-05-wrong-inverter/) being a 6 kW inverter correctly reporting a 6.6 kW
limit, that was simply wrong. We reset it to 1.0. We'd rather the plans were consistent and a
little conservative.

## Everything else checked out

The live config on the box matches the published copies, every sensor reference resolves, the
Octopus and Solcast feeds are healthy, and the nightly stats pipeline behind the
[stats page](/stats/) has everything it needs.

One log warning remains, and it will clear on its own. Predbat can't model the battery's charge
taper near 100% because the battery has never been charged to 100% at full rate. The first
controlled charge test, which is next and planned for a cheap overnight slot, will fix that. After
that we can switch Predbat from Monitor to **Control charge**. We're deliberately not using
"Control charge & discharge" yet: until export certification clears, exporting stored energy earns
nothing, so there's no reason to let it discharge to the grid.

Two of the three fixes were settings we'd have sworn were already right, so it was worth checking
the running system rather than relying on our notes.

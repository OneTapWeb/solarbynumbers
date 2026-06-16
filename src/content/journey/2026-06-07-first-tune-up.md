---
title: "First tune-up: three small fixes from a config review"
date: 2026-06-07
summary: "Three days in, we audited the whole automation stack against what's actually running on the box. Predbat is still in training, but the review caught a subtle automation bug and two settings worth changing before it takes control."
tags: [home-assistant, predbat, software, tuning]
---

Predbat's been watching the house for three days now. Planning every half-hour slot but not
yet allowed to touch anything. Before handing it the keys, we did a full review of the config.
Every entity reference, every automation, every tuning knob, checked against what's actually
running on the box rather than what we *think* we set up. It found three things worth fixing.

## Fix 1: a race condition in the bridge automations

Two of the three automations that translate Predbat's wishes into Sigenergy register writes ran
in `mode: single`. That means if a second trigger arrives while the automation is still
mid-flight, the second one is **silently dropped**, and the inverter is left holding a stale
charge or discharge limit until the next write comes along. The window's tiny, but Agile
charging is exactly the kind of thing that fires rapid back-to-back updates.

`mode: restart` is the right semantics for "always mirror the latest value": a new trigger
cancels the in-flight run and starts over with fresh state. One word changed, one failure mode
gone. The [configs page](/configs/) copy is updated too, so if you cribbed our bridge
automations, take the new version.

## Fix 2: a safety buffer on the battery floor

`best_soc_keep` was 0, meaning Predbat was free to plan the battery right down to the 4% hardware
reserve with zero margin for error. That's fine when the forecast is perfect. When Solcast is
optimistic by a couple of kWh, and it will be, the difference arrives as peak-rate Agile
import at 35p+.

This matters more for us than for most Predbat users because **we still earn nothing for
export**. There's no export income to offset a miss. Every kWh short at the evening peak is
charged at full price. We set the buffer to 0.5 kWh. It costs pennies of extra cheap-slot
charging and takes the worst case off the table.

## Fix 3: stop pretending the inverter is faster than it is

A leftover scaling factor (`battery_rate_max_scaling_discharge: 1.05`) was telling Predbat the
battery discharges 5% faster than the sensor reports. Given [what's actually on the
wall](/journey/2026-06-05-wrong-inverter/) is a 6 kW inverter reporting an honest 6.6 kW limit,
that optimism was just wrong. Reset to 1.0. Plans should be consistent and slightly
conservative, not flattering.

## What the review didn't find

Pleasingly little. The live config on the box matches the published copies, every sensor
reference resolves, the Octopus and Solcast feeds are healthy, and the nightly stats pipeline
that feeds the [stats page](/stats/) has all its dependencies in place.

One log warning remains, and it sorts itself out: Predbat can't model the battery's charge
taper near 100% because the battery's never actually *been* to 100% at full rate. The first
controlled charge test, next on the list and aimed at a cheap overnight slot, fixes that and
clears the way to flip Predbat from Monitor to **Control charge**. Not "Control charge &
discharge": until the export certification clears, exporting stored energy earns precisely
nothing, so discharge control stays off the table on purpose.

The lesson, if there is one: review the running system, not your notes about it. Two of the
three fixes were things we'd have sworn were already right.

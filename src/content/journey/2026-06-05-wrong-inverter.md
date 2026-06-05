---
title: "Plot twist: there's a 6 kW inverter on the wall"
date: 2026-06-05
summary: "We paid for a Sigenergy EC 8.0 SP. The installer has just told us the unit fitted is the 6 kW model. Here's what that actually costs us while we wait for the fix."
tags: [install, hardware, sigenergy]
---

One day after install, the installer got in touch: the inverter on the wall is a
**SigenStor EC 6.0 SP**, not the EC 8.0 SP we ordered and paid for. They're sorting it.

Home Assistant agrees, for what it's worth. The integration exposes the model directly:

```
sensor.sigen_inverter_model_type   = SigenStor EC 6.0 SP
sensor.sigen_plant_max_active_power = 6.6 kW
```

So what does losing 2 kW of inverter actually cost? We sat down expecting bad news and found
surprisingly little, at least for now.

## Why it barely matters this month

- **Export is disabled anyway.** Until the final certification goes in we earn nothing for
  export, so any midday power beyond house load and battery charging was being curtailed
  whether the inverter could manage 6.6 kW or 8.
- **The battery charges on the DC side.** PV to battery doesn't pass through the AC stage,
  and the battery's DC charge path still reports 7.3 kW available. Sunny-day charging is
  unaffected.
- **The house doesn't care.** Our load rarely goes anywhere near 6 kW, so self-supply through
  the evening peak works exactly as before.
- **Overnight cheap charging is about ten minutes slower.** Grid charging does go through the
  AC stage, so a full charge takes roughly 1.8 hours instead of 1.6. Predbat just uses a bit
  more of the cheap window. The cost difference is pennies.
- **Predbat already adapted, on its own.** Our apps.yaml reads the inverter's reported maximum
  from a sensor rather than hard-coding 8.0, so the plan recalculated around 6.6 kW without
  anyone touching anything. If you're setting up Predbat on Sigenergy kit, configure it that
  way. Days like this are why.

## When it would start to matter

The cap starts costing real money the day export goes live. Saving Sessions and Axle VPP
events pay per kWh exported in a short window, and 6.6 kW instead of 8 means roughly 20% less
energy shifted per event. The same goes for any future move to Agile Outgoing, where the value
is in exporting hard into price spikes.

So the race is on: the inverter swap needs to happen before the export certification clears.
If it does, this whole episode will have cost us approximately nothing.

Lesson for your own install: check the model plate (or the integration's model sensor) against
your order on day one. The system works fine at 6 kW. We'd just have been none the wiser if
nobody had said anything.

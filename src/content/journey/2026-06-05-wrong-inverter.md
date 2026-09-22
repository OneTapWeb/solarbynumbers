---
title: "The wrong inverter: a 6 kW unit on the wall"
date: 2026-06-05
summary: "We paid for a Sigenergy EC 8.0 SP. The installer has told us the unit fitted is the 6 kW model. This is what it costs us while we wait for the replacement."
tags: [install, hardware, sigenergy]
---

A day after install, the installer got in touch to say the inverter on the wall is a
**SigenStor EC 6.0 SP**, not the EC 8.0 SP we ordered and paid for. They're arranging a
replacement.

Home Assistant shows the same thing, as the integration reports the model directly:

```
sensor.sigen_inverter_model_type   = SigenStor EC 6.0 SP
sensor.sigen_plant_max_active_power = 6.6 kW
```

We expected losing 2 kW of inverter to hurt, but for the moment it makes very little difference.

## Why it barely matters this month

- Export is disabled anyway. Until the final certification goes in we earn nothing for export,
  so any midday power beyond house load and battery charging was being curtailed whether the
  inverter could manage 6.6 kW or 8.
- The battery charges on the DC side. PV to battery doesn't pass through the AC stage, and the
  battery's DC charge path still reports 7.3 kW available, so charging on sunny days is unaffected.
- Our load rarely gets anywhere near 6 kW, so running the house off the battery through the evening
  peak works as before.
- Overnight cheap charging is about ten minutes slower. Grid charging does go through the AC stage,
  so a full charge takes roughly 1.8 hours instead of 1.6. Predbat uses a little more of the cheap
  window and the cost difference is pennies.
- Predbat adjusted automatically. Our apps.yaml reads the inverter's reported maximum from a sensor
  rather than hard-coding 8.0, so the plan was recalculated around 6.6 kW without us changing
  anything. If you're setting up Predbat on Sigenergy kit, it's worth configuring it the same way.

## When it would start to matter

The lower limit starts costing money once export goes live. Saving Sessions and Axle VPP events pay
per kWh exported in a short window, and 6.6 kW instead of 8 means roughly 20% less energy per event.
The same applies to any later move to Agile Outgoing, where the value comes from exporting hard
into price spikes.

So the replacement needs to be fitted before the export certification clears. If it is, this will
have cost us almost nothing.

If you're having your own system fitted, check the model plate (or the integration's model sensor)
against your order on day one. The system runs fine at 6 kW, and we wouldn't have known if the
installer hadn't told us.

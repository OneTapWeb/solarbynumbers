---
title: "110 days later, export finally pays"
date: 2026-09-22
summary: "From commissioning to today we gave away 2,487 kWh — £298.50 at 12p — because there was no export MPAN to pay it into. Outgoing Octopus went live this morning at a flat 12p. The paperwork was the slow part; the software then quietly refused to notice."
tags: [export, tariff, octopus, home-assistant, predbat]
---

The panels were commissioned on [4 June](/journey/2026-06-04-install-day/). Export started paying
**today, 22 September**. In between, every kilowatt-hour the battery couldn't hold went to the
grid for nothing:

- **2,487 kWh** given away
- **£298.50** it would have earned at 12p
- **110 days** of it, 4 June to 21 September

That is the single most expensive thing about this install, and none of it was the hardware's
fault. The [stats page](/stats/) has reported £0 export revenue for every one of those days,
because that is what it was, and it will keep reporting £0 for them now the tariff is live.

## The chain, in the order it has to happen

1. **The installation certificate.** Nothing starts until the MCS paperwork is processed.
2. **The export MPAN.** A second meter point, on the same physical meter, is created for the
   energy going the other way. Ours arrived on **14 September**.
3. **The export tariff application.** Submitted the same day.
4. **Go-live.** Eight days later, this morning. The agreement shows
   `E-1R-OUTGOING-VAR-24-10-26-H` — Outgoing Octopus, flat **12p/kWh**, running from today with no
   end date.

Nobody chases this for you, and the meter is exporting the entire time. If you take one thing
from this site, take that: **chase the paperwork on day one**, before you chase the optimisation.
We spent the summer tuning a system that was giving its surplus away.

## The trap in the application form

There are two Outgoing tariffs, and the form defaults to the wrong one for most people with a
battery. **Agile Outgoing** pays a half-hourly price that looks generous in the winter evening
peak; **flat 12p** pays the same all day.

We had a full year of real half-hourly Agile Outgoing rates, so we could check rather than guess.
Against our own export profile — a high-generation, low-consumption house that floods the grid at
**midday**, exactly when Agile Outgoing pays 5–7p — the answer wasn't close:

| Export tariff | Modelled annual revenue |
| --- | --- |
| Outgoing Octopus, flat 12p | **£488** |
| Agile Outgoing | £314 |

Picking the default would have cost **£174 a year**. Agile Outgoing rewards a house that can hold
its export back for the 16:00–19:00 peak. Ours can, a bit, but the battery is worth more doing
other things at that hour, and the heat pump will make the midday-heavy shape stronger still, not
weaker. Boring flat 12p wins. The full comparison is on [the tariff page](/tariff/).

## Then the software refused to notice

The tariff was live in our Octopus account and completely invisible at home. Two things had to be
poked, and both are worth knowing if you run the same stack:

**Home Assistant doesn't pick up a new meter point on its own.** The Octopus integration builds
its entities when it first sets up an account. An export MPAN added months later isn't in that
picture, and no amount of waiting changes it — the integration has to be reloaded before the
export sensors appear at all.

**Predbat reads its rate sensor once, at startup.** Its configuration already pointed at the
export-rate sensor by pattern, but that pattern is resolved when the add-on starts. It had started
in a world with no export sensor, so it had quietly concluded we had no export rates and carried
on with **0p**. A restart, and its export rates went from 0 to **12p** across the whole plan.

Neither failure announced itself. Both would have kept the optimiser making decisions on the
assumption that exported energy is worthless — which had been true for 110 days, and stopped being
true this morning.

## What actually changes

The battery has been running in charge-only mode all summer, because there was no point planning a
discharge to the grid that paid nothing. It's now allowed to plan paid exports too.

In practice it still won't do much of that, and that's correct. At 12p, exporting a stored
kilowatt-hour earns 12p; using that same kilowatt-hour instead of importing at the 34.7p day rate
saves nearly three times as much. Export is for genuine surplus — the sunshine that arrives when
the battery is already full — plus [Axle's grid events](/journey/2026-06-16-first-axle-event/) at
£1/kWh, which still outrank everything.

The genuinely counter-intuitive bit comes from the other side of the meter. Now that we're on
[Intelligent Octopus Go](/journey/2026-09-14-intelligent-octopus-go/) at **8p overnight**, imported
electricity is cheaper than our own solar's 12p opportunity cost. So the right move is the one
that sounds wrong: **sell the sunshine, and charge the car on the grid at night**.

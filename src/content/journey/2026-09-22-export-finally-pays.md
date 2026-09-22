---
title: "Export starts paying, 110 days in"
date: 2026-09-22
summary: "Between commissioning and today we sent 2,487 kWh to the grid for nothing (£298.50 at 12p) because there was no export MPAN to pay it into. Outgoing Octopus went live this morning at a flat 12p. The paperwork took months, and then Home Assistant and Predbat both needed a nudge before they saw it."
tags: [export, tariff, octopus, home-assistant, predbat]
---

The panels were commissioned on [4 June](/journey/2026-06-04-install-day/) and export started
paying today, 22 September. For the 110 days in between (4 June to 21 September), everything the
battery couldn't hold went to the grid unpaid. That came to **2,487 kWh**, which would have earned
**£298.50** at 12p.

That's the most expensive thing about this install so far, and none of it was down to the
hardware. The [stats page](/stats/) has shown £0 export revenue for every one of those days, since
that's what we got, and it will carry on showing £0 for them.

## What has to happen, in order

1. **The installation certificate.** Nothing starts until the MCS paperwork has been processed.
2. **The export MPAN.** A second meter point on the same physical meter, for energy going the
   other way. Ours arrived on **14 September**.
3. **The export tariff application.** We submitted it the same day.
4. **Go-live.** Eight days later, this morning. The agreement shows
   `E-1R-OUTGOING-VAR-24-10-26-H`: Outgoing Octopus, flat **12p/kWh**, from today with no end date.

Nobody chases this for you, and the meter is exporting the whole time. Our advice is to chase the
paperwork from day one, before you spend time on optimisation. We spent the summer tuning a system
that was giving its surplus away.

## Choosing the right export tariff

There are two Outgoing tariffs, and the application form defaults to the one that's wrong for most
people with a battery. **Agile Outgoing** pays a half-hourly price, which looks generous in the
winter evening peak. **Flat 12p** pays the same all day.

We had a full year of real half-hourly Agile Outgoing rates, so we could check. Our house generates
a lot and uses little, so most of our export happens around midday, when Agile Outgoing pays 5–7p.
Against that profile:

| Export tariff | Modelled annual revenue |
| --- | --- |
| Outgoing Octopus, flat 12p | **£488** |
| Agile Outgoing | £314 |

Going with the default would have cost us **£174 a year**. Agile Outgoing suits a house that can
hold its export back for the 16:00–19:00 peak. We can do that a little, but the battery is more
useful doing other things at that time of day, and the heat pump will push even more of our export
towards midday. So we went with flat 12p. The full comparison is on [the tariff page](/tariff/).

## Getting Home Assistant and Predbat to see it

Once the tariff was live in our Octopus account, nothing at home knew about it. Two things needed
sorting, which will apply to anyone running the same setup.

**Home Assistant doesn't pick up a new meter point by itself.** The Octopus integration creates
its entities when the account is first set up. An export MPAN added months later isn't included,
and waiting doesn't help. The integration has to be reloaded before the export sensors appear.

**Predbat only reads its rate sensor at startup.** Its configuration already matched the
export-rate sensor by pattern, but the pattern is resolved when the add-on starts. When it last
started there was no export sensor, so it had been running with export at **0p**. After a restart
its export rates went from 0 to **12p** across the whole plan.

Neither problem showed up as an error. Both would have left the optimiser treating exported energy
as worthless, which had been accurate for 110 days and stopped being accurate this morning.

## What changes

The battery has been in charge-only mode all summer, as there was no point planning discharges to
the grid when they paid nothing. It can now plan paid exports as well.

It still won't do many, and that's the right call. Exporting a stored kilowatt-hour earns 12p,
whereas using it instead of importing at the 34.7p day rate saves nearly three times that. Export
is for surplus, meaning sunshine that arrives when the battery is already full, plus [Axle's grid
events](/journey/2026-06-16-first-axle-event/) at £1/kWh, which still beat everything else.

The other side of the meter matters too. Now that we're on [Intelligent Octopus
Go](/journey/2026-09-14-intelligent-octopus-go/) at **8p overnight**, importing is cheaper than the
12p we'd get for exporting our own solar. So the best plan is to export the solar during the day
and charge the car from the grid overnight.

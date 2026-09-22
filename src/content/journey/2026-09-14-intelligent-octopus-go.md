---
title: "Leaving the fix five months early for Intelligent Octopus Go"
date: 2026-09-14
summary: "A flat 24.5p is fine for a house that just uses electricity. Ours has a battery, a car and a heat pump arriving in December, so we paid the exit fee and moved to Intelligent Octopus Go: 8p overnight, 34.7p by day. Our cheap window also isn't the one on the advert."
tags: [tariff, octopus, ev, heat-pump]
---

Since March we'd been on a plain **12-month fix at 24.5446p**, with a 44.35p standing charge and
an exit fee of £50 per fuel, and it had five months left to run. Today we left it for
**Intelligent Octopus Go**: **8p/kWh** overnight, **34.7205p** by day and 49.41p standing, fixed
for twelve months to September 2027.

## Why we didn't wait for March

On a flat rate a battery can only do half its job. Every stored kilowatt-hour is worth exactly
what it cost, so there's nothing to arbitrage. The [battery](/system/) still moves solar from the
day into the evening, which is useful, but it can't buy cheap and use it later when power is
expensive.

That was about to get much worse. The [Škoda Enyaq](/ev/) arrived in July and has been charging
off a granny lead at the full day rate, and the [heat pump](/heat-pump/) arrives in December. Both
are big new loads that want the same cheap hours, and waiting for March would have put a whole
heating season on the wrong tariff to save a £50 exit fee.

## The numbers

Modelled over a year with the heat pump and the car both running, on our own consumption profile:

| Tariff | Modelled net cost |
| --- | --- |
| Intelligent Octopus Go | **£591** |
| Octopus Go (5h) | £775 |
| Agile import | £946 |
| Cosy Octopus | £1,123 |
| Staying on the fix | £1,692 |

Staying on the fix would have cost us **£1,101 a year** more. The blended import price drops from
23.4p to about 9.4p, because the battery and a long cheap window between them shift nearly all the
year's demand off the day rate. The full modelling, including why Cosy (the heat pump tariff)
comes fourth, is on [the tariff page](/tariff/).

The standing charge does go **up**, from 44.35p to 49.41p a day, which is £18.47 a year before
you've used a single unit. It's small next to £1,101, and the comparison above already includes it.

## We nearly got this wrong

An earlier version of our model said **Agile beat IOG by about £100 a year**. That was a bug in
our own code. The battery's charging logic stopped looking ahead as soon as it found another
equally cheap half hour, so inside a flat overnight window it never filled up. Agile's uneven
prices hid the bug and a flat window showed it up. Fixing it reversed the result.

We would have switched to the wrong tariff because of our own arithmetic. If you're modelling this
yourself, check that your simulated battery is actually reaching 100% overnight before you trust
the answer.

## Our cheap window isn't the advertised one

Intelligent Octopus Go is sold as **23:30–05:30**, six hours. Ours is different. Reading the
half-hourly rates off our own meter, the 8p period runs from **01:30 to 08:30**. That's seven
hours, starting two hours later than advertised and finishing three hours later.

We're happy with an extra hour, and the timing suits us, since 08:30 is after the morning peak and
the house can run on cheap power well into the morning. But the tariff you get is whatever your
meter is actually running, so check yours before building automations around it. [Predbat](/stack/)
is now scheduling the car, the battery and, from December, the heat pump against that window.

One other consequence: at 8p, **imported electricity is now cheaper than our own solar is worth**.
That changes what we should do with surplus solar, which became a practical question when [export
went live eight days later](/journey/2026-09-22-export-finally-pays/).

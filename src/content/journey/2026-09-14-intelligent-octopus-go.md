---
title: "Leaving the fix five months early for Intelligent Octopus Go"
date: 2026-09-14
summary: "A flat 24.5p is a fine tariff for a house that just uses electricity. Ours has a battery, a car and a heat pump arriving in December, so we paid the exit fee and moved to Intelligent Octopus Go: 8p overnight, 34.7p by day. The cheap window turned out not to be the one on the advert."
tags: [tariff, octopus, ev, heat-pump]
---

Since March we'd been on a plain **12-month fix at 24.5446p**, with a 44.35p standing charge and
an exit fee of £50 per fuel. It had five months left to run. Today we left it for **Intelligent
Octopus Go** — **8p/kWh** overnight, **34.7205p** by day, 49.41p standing, fixed for twelve months
to September 2027.

## Why not just wait for March

Because a flat rate is the one tariff shape that makes a battery pointless. There's nothing to
arbitrage: every stored kilowatt-hour is worth exactly what it cost. The [battery](/system/)
spends its day shuffling solar around, which is useful, but the other half of what it's for —
buying cheap and using it expensive — simply doesn't exist on a fix.

Two things were about to make that much worse. The [Škoda Enyaq](/ev/) arrived in July and has
been charging off a granny lead at the full day rate, and the [heat pump](/heat-pump/) lands in
December. Both are large new loads that want the same cheap hours. Waiting for March would have
put an entire heating season on the wrong tariff to save a £50 exit fee.

## The numbers that settled it

Modelled over a year with the heat pump and the car both running, on our own consumption profile:

| Tariff | Modelled net cost |
| --- | --- |
| Intelligent Octopus Go | **£591** |
| Octopus Go (5h) | £775 |
| Agile import | £946 |
| Cosy Octopus | £1,123 |
| Staying on the fix | £1,692 |

Staying put was worth **£1,101 a year** to Octopus and nothing to us. The blended import price
falls from 23.4p to about 9.4p, because between them a battery and a long cheap window move nearly
all the year's demand off the day rate. The full modelling, including why Cosy — the designated
heat pump tariff — finishes fourth, is on [the tariff page](/tariff/).

One honest deduction: the standing charge goes **up**, from 44.35p to 49.41p a day. That's £18.47
a year handed back before a single unit is bought. It's small against £1,101, but it's real, and
the comparison above already includes it.

## We nearly got this wrong

An earlier version of our model said **Agile beat IOG by about £100 a year**. It was a bug in our
own code: the battery's charging logic stopped looking ahead the moment it hit another
equally-cheap half hour, so inside a flat overnight window it never actually filled up. Agile's
jagged prices hid the bug; a flat window exposed it. Fixing it reversed the verdict.

We'd have switched to the wrong tariff on our own arithmetic. If you're modelling this for
yourself, check that your simulated battery is actually reaching 100% overnight before you trust
the answer.

## The surprise: the cheap window isn't the advertised one

Intelligent Octopus Go is sold as **23:30–05:30**, six hours. Ours isn't. Reading the half-hourly
rates straight off our own meter, the 8p period runs **01:30 to 08:30** — seven hours, starting
two hours later than the brochure and ending three hours later.

We're not complaining about a free extra hour, and the shape suits us: 08:30 is after the morning
peak, so the house can coast on cheap power well into the day. But it's a reminder that the
tariff you get is the one your meter is actually running, not the one on the signup page. Check
yours before you plan the automation around it, because [Predbat](/stack/) is now scheduling the
car, the battery and soon the heat pump against that window.

The other consequence takes a moment to sink in: at 8p, **imported electricity is now cheaper
than our own sunshine is worth**. That changes what the right move is with surplus solar — which
[export going live eight days later](/journey/2026-09-22-export-finally-pays/) made concrete.

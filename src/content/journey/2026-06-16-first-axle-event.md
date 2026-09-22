---
title: "Our first Axle event, and getting Predbat to see the next one coming"
date: 2026-06-16
summary: "The battery ran its first paid grid event tonight: 5.5 kW out for an hour, £4.27 at £1/kWh. We also found that once a VPP event starts you can't touch the battery, so we changed Predbat to prepare for events in advance."
tags: [axle, vpp, revenue, home-assistant, predbat]
---

Six days after [signing up to Axle](/journey/2026-06-10-axle-vpp-signup/), the email arrived at
18:32: *"You are now in VPP mode."* Half an hour later, at 7pm, the battery started sending power
to the grid. That was our first paid grid event.

## What happened

The dispatch ran the full hour, 7–8pm. The battery discharged at a steady **5.5 kW**, exported
**4.27 kWh** and went from 99% down to about 66%. At Axle's £1/kWh that's **£4.27** for an hour
of the grid borrowing what the panels had put in earlier in the day.

**Update: Axle has now settled it at £4.27.** Their figure turned up in our account a couple of
days later and matched what our own inverter logged (we integrated the grid-export trace
ourselves and also got 4.27 kWh). So the VPP pays on metered export, and our meter and theirs
agreed to the penny. It's now on our [stats page](/stats/) and homepage, and from here on each
event will publish from our own meter the same night rather than waiting for the email.

> **Later note, 14 September 2026.** That last paragraph was too confident. We've left it in
> rather than edit it out. One event matching to the penny isn't a rule. Across the first twelve
> events our meter totalled **£76.63** and Axle actually paid **£82.51**. They settle on their own
> metering a day or so later, and event by event the two figures differ by a few percent either
> way (11 August: ours £14.33, theirs £13.19). Our figure also misses the monthly top-ups that
> bring a quiet month up to the £10 minimum, which account for £13.12 of the gap.
>
> The worst case was **6 September**. The Axle API key had expired without any warning, so
> Predbat didn't know about the event and the battery went into it at 2.9%. Our meter logged
> 0.43 kWh trickling out and counted it as 43p. Axle paid **£0.00**.
>
> So the site no longer publishes our estimate. The headline VPP figure now comes from Axle's
> settled ledger, and the [stats page](/stats/#axle) shows both numbers side by side so you can
> see how far apart the measured and paid figures are.

The dispatch itself needed nothing from us. The battery was already full because Predbat
normally charges it for the evening peak, so there was plenty to give.

## Why 5.5 kW and not 8

Our inverter can discharge at **8 kW** and the grid connection is uncapped. Earlier the same day
the panels on their own were exporting **8.5 kW** at midday, so we expected more than 5.5.

The rate is set by Axle. They command the battery from their cloud and decide how hard to pull.
5.5 kW is close to 90% of a **6 kW** inverter, which is what we had until it was [swapped for the
correct 8 kW unit](/journey/2026-06-10-the-right-inverter/) on signup day. Our guess is that Axle
still has us down as a 6 kW system, and we've emailed them to update it. If they do, future events
could run nearer 8 kW, which would be roughly 50% more per event.

## You can't prepare during an event

This we hadn't expected. As soon as you go into VPP mode (the 18:32 email), the inverter hands
control to Axle's cloud and you lose your own control. We saw it in Home Assistant: the setting
our software uses to charge or discharge the battery went to "unavailable" at exactly 18:32 and
stayed that way.

That matters. If the battery hadn't been full when the event started, there would have been
nothing we could do about it. You can't top it up at the last minute, because by the time you
know you're in VPP mode the controls are already gone.

## What we changed

Two things came out of tonight.

**1. Home Assistant now handles the handover.** We found the signal the inverter raises when VPP
mode starts and built an automation around it. When an event starts, Home Assistant sends us a
notification and moves our optimiser out of the way so it doesn't fight Axle's dispatch, then puts
everything back when the event ends. A late-night failsafe makes sure the battery is always
released in time for cheap overnight charging. Tonight we did all of that by hand.

**2. Predbat now sees events before they start.** This is the more important change. We connected
Predbat to Axle's event schedule, so it knows about a dispatch in advance and values those slots at
£1/kWh. With a number that high, the optimiser will make sure the battery is charged before the
event begins, while we still have control, rather than relying on it happening to be full.

What we don't know yet is how far ahead Axle publishes each event. Tonight the email gave 30
minutes' notice; the data feed may show it earlier.

**Update, September 2026.** Axle did update our system to 8 kW. The 5 August event discharged at
the full **8.0 kW** for 5.65 kWh, which paid £5.65. The Predbat link also worked as intended once it
had a valid key. For the 11 September event it raised the battery's charge target from 54% to 100%
through the afternoon, so the battery was full when the event started.

---
title: "Our first Axle event, and teaching the system to see the next one coming"
date: 2026-06-16
summary: "Tonight the battery ran its first paid grid event: a steady 5.5 kW out for an hour, £4.27 of help to the grid at £1/kWh. It also taught us that once a VPP event starts there's no touching the battery, so we rewired Predbat to prepare for events in advance instead of scrambling during them."
tags: [axle, vpp, revenue, home-assistant, predbat]
---

Six days after [signing up to Axle](/journey/2026-06-10-axle-vpp-signup/), the email we'd been
waiting for landed at **18:32**: *"You are now in VPP mode."* Half an hour later, at 7pm, the
battery started pushing power to the grid. Our **first paid grid event**.

## What actually happened

The dispatch ran the full hour, 7–8pm. The battery discharged at a rock-steady **5.5 kW**,
exporting **4.27 kWh** to the grid and dropping from a near-full 99% down to about 66%. At
Axle's £1/kWh that's **£4.27** for an hour of doing nothing but letting the grid borrow what
the sun put in earlier.

**Update — Axle has now settled it: £4.27.** Their figure landed in our account a couple of days
later, and it's an exact match for what our own inverter logged exporting during the hour (we
integrated the grid-export trace ourselves and got 4.27 kWh too). That's reassuring: the VPP pays
on metered export, and our meter and theirs agree to the penny. It's now showing on our
[stats page](/stats/) and homepage — and from here on, every event auto-publishes from our own
meter the same night, no waiting on the email.

No drama, and the dispatch itself needed no help from us. The battery was already full because
Predbat routinely charges it for the evening peak, so there was plenty to give.

## The surprise: it pulled 5.5 kW, not 8

Our inverter can discharge at **8 kW**, and our grid connection is uncapped. Earlier the same day
the panels alone were exporting **8.5 kW** at midday. So why did the event top out at 5.5?

Turns out the rate is **Axle's call, not ours**. They command the battery from their cloud and
decide how hard to pull. And 5.5 kW is suspiciously close to 90% of a **6 kW** inverter, which is
exactly what we *started* with, before it was [swapped for the correct 8 kW
unit](/journey/2026-06-10-the-right-inverter/) on signup day. Best guess: Axle still has us on file
as a 6 kW system. We've emailed them to update it. If they do, future events could dispatch nearer
8 kW, roughly 50% more per event.

## The real lesson: you can't prepare *during* an event

Here's the part we didn't expect. The moment you enter VPP mode, that 18:32 email, the inverter
hands control to Axle's cloud and **your own control goes dark**. We watched it happen in Home
Assistant. The setting that lets our software charge or discharge the battery flipped to
"unavailable" at 18:32 on the dot, and stayed there.

That has a sharp consequence. If the battery *hadn't* been full when the event armed, there'd be
**nothing we could do about it**. No last-minute top-up, because by the time you know you're in
VPP mode, you've already lost the controls. Reacting to an event is too late.

## So we rewired it to look ahead

Two changes came out of tonight.

**1. It now tells us, and steps aside by itself.** We found the exact signal the inverter raises
when VPP mode starts, and built an automation around it: the instant an event arms, Home Assistant
notifies us and moves our optimiser out of the way so it can't fight Axle's dispatch, then
restores everything automatically when the event ends. A late-night failsafe makes sure the battery
is always freed in time for cheap overnight charging. No more doing it by hand mid-event like we did
tonight.

**2. Predbat now sees events before they start.** This is the important one. We connected Predbat
straight to Axle's event schedule, so it learns about a dispatch *ahead of time* and treats those
slots as worth £1/kWh. Because that's such a big number, the optimiser will now make sure the
battery is **charged and ready before an event begins**, back when we still have control, instead
of hoping it happens to be full. That's exactly the window the lockout takes away.

The one thing we don't know yet is how far in advance Axle publishes each event. Tonight the email
gave us 30 minutes. The data feed may show it sooner. We'll find out at the next one, and report
back here, hopefully with a fuller battery and a bigger number.

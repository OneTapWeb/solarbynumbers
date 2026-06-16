---
title: "Signed up to Axle: getting paid for grid events"
date: 2026-06-10
summary: "Same day as the inverter swap, we joined Axle's virtual power plant in events-only mode. It pays £1/kWh when the grid needs the battery, and because it settles through the smart meter, it earns even though our export still isn't certified."
tags: [axle, vpp, revenue, home-assistant, predbat]
---

With the [correct inverter finally on the wall](/journey/2026-06-10-the-right-inverter/), the same
afternoon we signed up to **Axle**, a virtual power plant. The pitch is simple. When the grid is
under stress, Axle remotely discharges your battery to help balance it, and pays you **£1/kWh**
for what goes out. Events run roughly four to eight times a month, fifteen minutes to an hour
each, with a **£10/month guaranteed minimum**. We joined in **events-only** mode, which is the
important bit. Axle only touches the battery during an actual event, and the rest of the time
our own optimiser stays in charge.

## Why it matters that it's separate from export

Our [export still isn't certified](/tariff/), so right now we earn nothing for the surplus we
push to the grid. Axle's different. It settles **directly through the smart meter** over the
DCC, independent of any export tariff. No MCS certificate and no export MPAN required for
events-only mode, we checked. So this is the **first part of the system that actually earns
money for export**, months before the Octopus side goes live. A nice surprise.

## The one hiccup

Linking the battery means giving Axle your Sigenergy system ID so it can talk to the inverter
through Sigenergy's cloud. Ours validated as "invalid" on the first try, almost certainly
because the new inverter had only been online a couple of hours and the cloud hadn't finished
re-registering the swapped hardware to our account. A support ticket and a bit of patience later,
the connection test passed and the signup finalised. Worth knowing if you do this on swap day:
give the cloud time to catch up.

## How it fits with Predbat

This was the part we expected to be fiddly and it wasn't. **Predbat has Axle support
built in.** You hand it your Axle key and it pulls the upcoming events straight into its plan,
so it knows not to fight a dispatch and picks back up cleanly afterwards. There's also a
first-party Axle to Home Assistant integration that surfaces events as a sensor, which is handy
for the dashboard.

One honest caveat, straight from Axle's own onboarding screen: the service is still in beta, and
while it *tries* to restore your battery settings after each event, it's worth double-checking
them. So after the first few dispatches we'll be confirming the inverter lands back in
self-consumption mode and Predbat resumes as normal. We'll report the first event, and the first
pound, here when it happens.

---
title: "Signed up to Axle: getting paid for grid events"
date: 2026-06-10
summary: "Same day as the inverter swap, we joined Axle's virtual power plant in events-only mode. It pays £1/kWh when the grid needs the battery, and because it settles through the smart meter it pays even though our export still isn't certified."
tags: [axle, vpp, revenue, home-assistant, predbat]
---

With the [correct inverter now fitted](/journey/2026-06-10-the-right-inverter/), we signed up
the same afternoon to **Axle**, a virtual power plant. When the grid is under stress, Axle
discharges your battery remotely to help balance it and pays you **£1/kWh** for the energy that
goes out. Events happen roughly four to eight times a month and last between fifteen minutes and an
hour, with a **£10/month guaranteed minimum**. We joined in events-only mode, so Axle only controls
the battery during an event and our own optimiser runs it the rest of the time.

## Separate from export

Our [export still isn't certified](/tariff/), so at the moment we earn nothing for the surplus we
send to the grid. Axle works differently. It settles directly through the smart meter over the DCC,
independently of any export tariff, and events-only mode doesn't need an MCS certificate or an
export MPAN (we checked). That makes it the first part of the system that pays us for export,
months before the Octopus side goes live, which we hadn't expected.

## One hiccup

Linking the battery means giving Axle your Sigenergy system ID so it can control the inverter
through Sigenergy's cloud. Ours came back as "invalid" the first time, almost certainly because the
new inverter had only been online for a couple of hours and the cloud hadn't finished registering
the replacement hardware to our account. After a support ticket and some waiting, the connection
test passed and the signup went through. If you sign up on the day you swap hardware, give the
cloud time to catch up.

## How it fits with Predbat

We expected this to be awkward and it wasn't. Predbat has Axle support built in: you give it your
Axle key and it adds upcoming events to its plan, so it doesn't work against a dispatch and carries
on normally afterwards. There's also an official Axle integration for Home Assistant that shows
events as a sensor, which is useful for the dashboard.

Axle's own onboarding screen says the service is still in beta, and that although it tries to
restore your battery settings after each event, you should check them. So after the first few
events we'll make sure the inverter goes back to self-consumption mode and Predbat carries on as
normal. We'll write up the first event, and the first pound earned, when it happens.

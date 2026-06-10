---
title: "The right inverter is on the wall"
date: 2026-06-10
summary: "Five days after we discovered the wrong unit had been fitted, the installer came back and swapped the 6 kW EC 6.0 SP for the EC 8.0 SP we actually ordered. The race against export certification is won."
tags: [hardware, inverter, install]
---

When we [found the wrong inverter on the wall](/journey/2026-06-05-wrong-inverter/) — a 6 kW
EC 6.0 SP instead of the EC 8.0 SP we'd ordered and paid for — the worry wasn't the day-to-day.
Export isn't even switched on yet, the battery's DC path is unchanged, and Predbat had quietly
recalculated the whole plan around the 6.6 kW limit it read from a sensor. The worry was the
deadline: the swap had to happen **before export certification clears**, because that extra 1.4 kW
is exactly what pays out during short, high-value export events.

Today the installer came back and fitted the correct unit. **Sigenergy EC 8.0 SP, 8 kW, now on
the wall.** The race is won with weeks to spare.

## What actually changes

Less than you'd think on the software side, which is the whole point of reading limits from
sensors rather than hard-coding them. Predbat will re-read the new 8 kW ceiling on its next
restart and plan against it automatically — no config to rewrite, no numbers to chase down. The
discharge-rate scaling we'd dialled back to a true 6.6 kW just goes back to reflecting a genuine
8 kW.

The fiddly part is everything that's tied to the *physical* unit: the new inverter has a new
serial number and a new network address, so the Modbus connection that lets Home Assistant talk
to it has to be re-established, and the DHCP reservation re-pointed. None of that is hard — it's
just the price of swapping the brain of the system out from under a live install.

We'll confirm the model sensor reads **EC 8.0 SP** and the plant power limit reads **8 kW** once
it's all back on the network, and then this chapter is properly closed.

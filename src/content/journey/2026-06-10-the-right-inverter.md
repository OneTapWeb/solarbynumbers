---
title: "The correct inverter is fitted"
date: 2026-06-10
summary: "Five days after we found the wrong unit had been fitted, the installer came back and swapped the 6 kW EC 6.0 SP for the EC 8.0 SP we ordered, well before export certification clears."
tags: [hardware, inverter, install]
---

When we [found the wrong inverter on the wall](/journey/2026-06-05-wrong-inverter/) (a 6 kW
EC 6.0 SP instead of the EC 8.0 SP we'd ordered and paid for), day-to-day running wasn't the
concern. Export isn't switched on yet, the battery's DC path was unchanged, and Predbat had already
recalculated its plan around the 6.6 kW limit it reads from a sensor. The concern was timing. The
swap needed to happen **before export certification clears**, because the extra 1.4 kW is what
earns money during short, high-value export events.

Today the installer came back and fitted the correct unit, a **Sigenergy EC 8.0 SP** rated at
8 kW, with weeks to spare.

## What changes

Not much on the software side, which is why we read limits from sensors rather than hard-coding
them. Predbat will pick up the new 8 kW limit on its next restart and plan around it, with no
config to rewrite. The discharge-rate scaling we'd set back to 1.0 for the 6.6 kW unit now simply
reflects 8 kW.

The more awkward part is everything tied to the physical unit. The new inverter has a new serial
number and a new network address, so the Modbus connection Home Assistant uses has to be set up
again and the DHCP reservation pointed at the new device. None of it is difficult, but it has to be
done when you replace the inverter on a working system.

Once it's all back on the network we'll check that the model sensor reads **EC 8.0 SP** and the
plant power limit reads **8 kW**, and that should be the end of it.

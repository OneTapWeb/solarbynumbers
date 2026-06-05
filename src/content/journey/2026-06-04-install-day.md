---
title: "Install day: 22 panels where 21 should have fit"
date: 2026-06-04
summary: "The system went in on 4 June, and the installers managed to squeeze a 22nd panel onto the roof. We went from 9.98 to 10.45 kWp for free."
tags: [install, hardware]
---

By the evening of 4 June the roof was generating.

The quote was for **21 Aiko 475W panels**, 9.98 kWp across our east/west roof. On the day, the
installers measured up and decided there was room for one more on the west face. No drama and no
extra charge, just **22 panels and 10.45 kWp**. It pays to have installers who treat the roof
as the spec rather than the paperwork.

The rest of the kit:

- **Sigenergy EC 8.0SP** hybrid inverter. 8 kW, with the energy management system built in.
- **SigenStor BAT 6.0 and BAT 10.0** stacked together. 15.06 kWh nominal, 14.6 usable.
- G99 approval came back from the DNO with **no export limit**, which matters more than it
  sounds. The full 8 kW will be able to flow out during VPP events and Saving Sessions.

One catch: we don't get paid for export yet. The final installation certification takes a
month or two to go through, and until it does the export tariff sits dormant. The inverter
still pushes surplus to the grid once the battery is full, we just earn nothing for it. On
good days that's a couple of pounds given away, which is worth knowing about if you're
planning your own install: the first month or two is effectively self-consumption only, so
chase the certification paperwork early.

First impressions of the Sigenergy kit: the stack design is genuinely tidy (the battery modules
and inverter click together like oversized LEGO), the app is fine, and it speaks **Modbus TCP
over the LAN**, which is the bit we really cared about. Local control is what makes everything
in [the stack](/stack/) possible.

The sales projection says this system should generate around 7,500 kWh a year and return
somewhere near £1,900 to £2,000 of value in year one against an £11,999 price. Whether that
survives contact with reality is what [the stats page](/stats/) is for.

**Update, 5 June:** it turns out the inverter on the wall is not the one we ordered.
[That story has its own post](/journey/2026-06-05-wrong-inverter/).

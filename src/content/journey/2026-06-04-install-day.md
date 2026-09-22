---
title: "Install day: 22 panels where 21 should have gone"
date: 2026-06-04
summary: "The system went in on 4 June, and the installers found room for a 22nd panel on the roof, taking us from 9.98 to 10.45 kWp at no extra cost."
tags: [install, hardware]
---

By the evening of 4 June the roof was generating.

The quote was for **21 Aiko 475W panels**, 9.98 kWp across our east/west roof. On the day the
installers measured up and reckoned there was room for one more on the west face, so we ended up
with 22 panels and **10.45 kWp** for the same price. It was good of them to go by the roof rather
than the paperwork.

The rest of the kit:

- Sigenergy EC 8.0SP hybrid inverter. 8 kW, with the energy management system built in.
- SigenStor BAT 6.0 and BAT 10.0 stacked together, giving 15.06 kWh nominal and 14.6 usable.
- G99 approval came back from the DNO with no export limit. That means the full 8 kW can go out
  during VPP events and Saving Sessions, which will matter later.

We don't get paid for export yet. The final installation certification takes a month or two to go
through, and the export tariff can't start until it does. In the meantime the inverter still sends
surplus to the grid once the battery's full and we earn nothing for it, which on a good day is a
couple of pounds. If you're planning your own install, expect the first month or two to be
self-consumption only, and chase the certification paperwork early.

First impressions of the Sigenergy kit are good. The battery modules and inverter stack together
neatly, the app is fine, and it talks Modbus TCP over the LAN. That was what we cared about most,
because local control is what everything in [the stack](/stack/) depends on.

The sales projection says the system should generate around 7,500 kWh a year and return
somewhere near £1,900 to £2,000 of value in year one against an £11,999 price. [The stats
page](/stats/) will show whether it does.

**Update, 5 June:** the inverter on the wall isn't the one we ordered.
[That has its own post](/journey/2026-06-05-wrong-inverter/).

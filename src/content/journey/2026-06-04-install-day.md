---
title: "Install day: 22 panels where 21 should have gone"
date: 2026-06-04
summary: "The system went in on 4 June, and the installers squeezed a 22nd panel onto the roof. We went from 9.98 to 10.45 kWp for free."
tags: [install, hardware]
---

By the evening of 4 June the roof was generating.

The quote was for **21 Aiko 475W panels**, 9.98 kWp across our east/west roof. On the day, the
installers measured up and reckoned there was room for one more on the west face. No drama, no
extra charge. Just **22 panels and 10.45 kWp**. Nice when the installers go off what's actually
on the roof rather than what's on the form.

The rest of the kit:

- **Sigenergy EC 8.0SP** hybrid inverter. 8 kW, with the energy management system built in.
- **SigenStor BAT 6.0 and BAT 10.0** stacked together. 15.06 kWh nominal, 14.6 usable.
- G99 approval came back from the DNO with **no export limit**, which matters more than it
  sounds. The full 8 kW will be able to flow out during VPP events and Saving Sessions.

One catch: we don't get paid for export yet. The final installation certification takes a
month or two to go through, and until it does the export tariff sits dormant. The inverter
still pushes surplus to the grid once the battery's full, we just earn nothing for it. On a
good day that's a couple of quid given away. Worth knowing if you're planning your own install,
because the first month or two is basically self-consumption only. Chase the certification
paperwork early.

First impressions of the Sigenergy kit. The stack design is properly tidy (the battery modules
and inverter click together like oversized LEGO), the app's fine, and it speaks **Modbus TCP
over the LAN**, which is the bit we actually cared about. Local control is what makes everything
in [the stack](/stack/) possible.

The sales projection says this system should generate around 7,500 kWh a year and return
somewhere near £1,900 to £2,000 of value in year one against an £11,999 price. Whether any of
that holds up in real life is what [the stats page](/stats/) is there to find out.

**Update, 5 June:** turns out the inverter on the wall isn't the one we ordered.
[That story has its own post](/journey/2026-06-05-wrong-inverter/).

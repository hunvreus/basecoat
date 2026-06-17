# TODO

## Chart

- Verify chart tick label color against upstream shadcn/ui across light/dark and all style packs. The target is `muted-foreground`; Chart.js renders labels on canvas, so it may not visually match Recharts SVG text exactly even with the same token.
- Add an explicit legend interaction option if needed. Upstream shadcn/ui's `ChartLegendContent` is display-only by default, so Basecoat should not toggle series visibility unless users opt into it.
- Document chart sizing escape hatches after visual QA. Default should stay `aspect-video`, matching upstream `ChartContainer`; users can override with height, `min-h-*`, or `aspect-*` on the generated container path once the public API is settled.
- Add chart examples for line, area, and tooltip indicator variants once the MVP bar chart behavior is visually aligned.

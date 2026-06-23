const visitorsByDay = [
  { date: "Apr 1", desktop: 222, mobile: 150 },
  { date: "Apr 5", desktop: 373, mobile: 290 },
  { date: "Apr 9", desktop: 59, mobile: 110 },
  { date: "Apr 13", desktop: 342, mobile: 380 },
  { date: "Apr 17", desktop: 446, mobile: 360 },
  { date: "Apr 21", desktop: 137, mobile: 200 },
  { date: "Apr 25", desktop: 215, mobile: 250 },
  { date: "Apr 29", desktop: 315, mobile: 240 },
  { date: "May 3", desktop: 247, mobile: 190 },
  { date: "May 7", desktop: 388, mobile: 300 },
  { date: "May 11", desktop: 335, mobile: 270 },
  { date: "May 15", desktop: 473, mobile: 380 },
  { date: "May 19", desktop: 235, mobile: 180 },
  { date: "May 23", desktop: 252, mobile: 290 },
  { date: "May 27", desktop: 420, mobile: 460 },
  { date: "May 31", desktop: 178, mobile: 230 },
  { date: "Jun 4", desktop: 439, mobile: 380 },
  { date: "Jun 8", desktop: 385, mobile: 320 },
  { date: "Jun 12", desktop: 492, mobile: 420 },
  { date: "Jun 16", desktop: 371, mobile: 310 },
  { date: "Jun 20", desktop: 408, mobile: 450 },
  { date: "Jun 24", desktop: 132, mobile: 180 },
  { date: "Jun 28", desktop: 149, mobile: 200 },
];

const monthlyVisitors = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const defaultScales = {
  y: { beginAtZero: true },
  x: { grid: { display: false } },
};

const initChart = (id, config) => {
  const canvas = document.getElementById(id);
  if (!canvas || canvas.dataset.chartInitialized) return;
  window.basecoat.chart(canvas, config);
};

const initChartExamples = () => {
  if (!window.Chart || !window.basecoat?.chart) return;

  initChart("chart-example-overview", {
    type: "line",
    labelKey: "date",
    legend: true,
    data: visitorsByDay,
    series: {
      desktop: {
        label: "Desktop",
        color: "var(--chart-2)",
        surface: "gradient",
        dataset: {
          borderWidth: 1.5,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
        },
      },
      mobile: {
        label: "Mobile",
        color: "var(--chart-1)",
        surface: "gradient",
        dataset: {
          borderWidth: 1.5,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
        },
      },
    },
    options: {
      interaction: { mode: "index", intersect: false },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
        y: { beginAtZero: true, stacked: true, ticks: { display: false } },
      },
    },
  });

  initChart("chart-example-visitors", {
    type: "bar",
    labelKey: "month",
    legend: true,
    data: monthlyVisitors,
    series: {
      desktop: { label: "Desktop", color: "var(--chart-1)" },
      mobile: { label: "Mobile", color: "var(--chart-2)" },
    },
    options: { scales: defaultScales },
  });

  initChart("chart-example-line", {
    type: "line",
    labelKey: "month",
    data: [
      { month: "Jan", revenue: 42 },
      { month: "Feb", revenue: 68 },
      { month: "Mar", revenue: 61 },
      { month: "Apr", revenue: 90 },
      { month: "May", revenue: 112 },
      { month: "Jun", revenue: 128 },
    ],
    series: {
      revenue: {
        label: "Revenue",
        color: "var(--chart-1)",
        dataset: { borderWidth: 1.5, tension: 0, pointRadius: 0, pointHoverRadius: 4 },
      },
    },
    options: { scales: defaultScales },
  });

  initChart("chart-example-step", {
    type: "line",
    labelKey: "day",
    data: [
      { day: "Mon", queued: 12 },
      { day: "Tue", queued: 18 },
      { day: "Wed", queued: 9 },
      { day: "Thu", queued: 24 },
      { day: "Fri", queued: 16 },
      { day: "Sat", queued: 14 },
    ],
    series: {
      queued: {
        label: "Queued",
        color: "var(--chart-1)",
        dataset: { borderWidth: 1.5, stepped: true, pointRadius: 0, pointHoverRadius: 4 },
      },
    },
    options: { scales: defaultScales },
  });

  initChart("chart-example-stacked", {
    type: "bar",
    labelKey: "quarter",
    legend: true,
    data: [
      { quarter: "Q1", won: 32, open: 44, lost: 12 },
      { quarter: "Q2", won: 48, open: 38, lost: 18 },
      { quarter: "Q3", won: 52, open: 46, lost: 16 },
      { quarter: "Q4", won: 61, open: 40, lost: 14 },
    ],
    series: {
      won: { label: "Won", color: "var(--chart-1)" },
      open: { label: "Open", color: "var(--chart-2)" },
      lost: { label: "Lost", color: "var(--chart-3)" },
    },
    options: {
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, ticks: { display: false } },
      },
    },
  });

  initChart("chart-example-donut", {
    type: "doughnut",
    labelKey: "source",
    legend: true,
    data: [
      { source: "Search", visitors: 275, color: "var(--chart-1)" },
      { source: "Direct", visitors: 200, color: "var(--chart-2)" },
      { source: "Social", visitors: 187, color: "var(--chart-3)" },
      { source: "Referral", visitors: 173, color: "var(--chart-4)" },
      { source: "Email", visitors: 90, color: "var(--chart-5)" },
    ],
    series: {
      visitors: { label: "Visitors" },
    },
    options: {
      cutout: "62%",
    },
  });

  initChart("chart-example-radar", {
    type: "radar",
    labelKey: "channel",
    legend: true,
    data: [
      { channel: "Acquisition", current: 82, previous: 64 },
      { channel: "Activation", current: 72, previous: 70 },
      { channel: "Retention", current: 66, previous: 58 },
      { channel: "Revenue", current: 88, previous: 75 },
      { channel: "Referral", current: 61, previous: 52 },
    ],
    series: {
      current: {
        label: "Current",
        color: "var(--chart-1)",
        surface: { from: 0.22 },
        dataset: { borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 4 },
      },
      previous: {
        label: "Previous",
        color: "var(--chart-2)",
        surface: { from: 0.18 },
        dataset: { borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 4 },
      },
    },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          grid: { color: "color-mix(in oklab, var(--border) 60%, transparent)" },
          angleLines: { color: "color-mix(in oklab, var(--border) 60%, transparent)" },
          pointLabels: { color: "var(--muted-foreground)" },
          ticks: { display: false },
        },
      },
    },
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChartExamples, { once: true });
} else {
  initChartExamples();
}

if (!window.__basecoatChartExamplesObserver) {
  let pending = false;
  const queueInitChartExamples = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      initChartExamples();
    });
  };

  window.__basecoatChartExamplesObserver = new MutationObserver(queueInitChartExamples);
  window.__basecoatChartExamplesObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

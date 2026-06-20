(() => {
  const instances = new WeakMap();
  const activeCanvases = new Set();
  const defaultColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
  let refreshFrame = null;

  const isChartJsData = (data) => {
    return data && typeof data === 'object' && Array.isArray(data.datasets);
  };

  const resolveTarget = (target) => {
    if (typeof target === 'string') {
      const elements = Array.from(document.querySelectorAll(target));
      if (elements.length === 0) {
        throw new Error(`Chart target not found: ${target}`);
      }
      return elements;
    }

    if (target instanceof HTMLCanvasElement) return [target];
    if (target instanceof Element) {
      const canvas = target.matches('canvas') ? target : target.querySelector('canvas');
      if (canvas) return [canvas];
    }

    if (target instanceof NodeList || Array.isArray(target)) {
      return Array.from(target).flatMap(resolveTarget);
    }

    throw new Error('Chart target must be a selector, canvas, element, NodeList, or array.');
  };

  const readOption = (canvas, config, key, dataName) => {
    if (config[key] !== undefined) return config[key];
    return canvas.dataset[dataName];
  };

  const readBoolean = (canvas, config, key, dataName, defaultValue) => {
    const value = readOption(canvas, config, key, dataName);
    if (value === undefined) return defaultValue;
    if (typeof value === 'boolean') return value;
    return value !== 'false';
  };

  const readJsonAttribute = (canvas, name) => {
    const value = canvas.getAttribute(name);
    if (!value) return undefined;

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Invalid JSON in ${name}:`, error);
      return undefined;
    }
  };

  const colorForIndex = (index) => defaultColors[index % defaultColors.length];

  const cloneChartData = (chartData) => {
    if (!isChartJsData(chartData)) return chartData;

    return {
      ...chartData,
      labels: Array.isArray(chartData.labels) ? [...chartData.labels] : chartData.labels,
      datasets: chartData.datasets.map((dataset) => ({
        ...dataset,
        data: Array.isArray(dataset.data) ? [...dataset.data] : dataset.data,
        backgroundColor: Array.isArray(dataset.backgroundColor) ? [...dataset.backgroundColor] : dataset.backgroundColor,
        borderColor: Array.isArray(dataset.borderColor) ? [...dataset.borderColor] : dataset.borderColor,
        hoverBackgroundColor: Array.isArray(dataset.hoverBackgroundColor) ? [...dataset.hoverBackgroundColor] : dataset.hoverBackgroundColor,
        hoverBorderColor: Array.isArray(dataset.hoverBorderColor) ? [...dataset.hoverBorderColor] : dataset.hoverBorderColor,
      })),
    };
  };

  const clonePlainObject = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;

    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      item && typeof item === 'object' && !Array.isArray(item) ? clonePlainObject(item) : item,
    ]));
  };

  const resolveColor = (color, element) => {
    if (Array.isArray(color)) return color.map(item => resolveColor(item, element));
    if (typeof color !== 'string') return color;

    const probe = document.createElement('span');
    probe.style.color = color;
    probe.style.display = 'none';
    (element.parentElement || document.body).appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();

    return resolved || color;
  };

  const colorWithAlpha = (color, alpha, element) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return color;

    context.clearRect(0, 0, 1, 1);
    context.fillStyle = '#000';
    context.fillStyle = resolveColor(color, element);
    context.fillRect(0, 0, 1, 1);

    const [red, green, blue, sourceAlpha] = context.getImageData(0, 0, 1, 1).data;
    return `rgba(${red}, ${green}, ${blue}, ${(sourceAlpha / 255) * alpha})`;
  };

  const surfaceColor = (color, element, { from = 0.4, to } = {}) => {
    if (to === undefined) return colorWithAlpha(color, from, element);

    return ({ chart }) => {
      if (!chart.chartArea) return colorWithAlpha(color, from, element);

      const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
      gradient.addColorStop(0, colorWithAlpha(color, from, element));
      gradient.addColorStop(1, colorWithAlpha(color, to, element));
      return gradient;
    };
  };

  const resolveDatasetColors = (chartData, element) => {
    chartData.datasets?.forEach((dataset) => {
      dataset.borderColor = resolveColor(dataset.borderColor, element);
      dataset.backgroundColor = resolveColor(dataset.backgroundColor, element);
      dataset.hoverBorderColor = resolveColor(dataset.hoverBorderColor, element);
      dataset.hoverBackgroundColor = resolveColor(dataset.hoverBackgroundColor, element);
    });
    return chartData;
  };

  const resolveScaleColors = (scales, element) => {
    Object.values(scales || {}).forEach((scale) => {
      ['border', 'grid', 'ticks', 'angleLines', 'pointLabels'].forEach((key) => {
        if (scale[key]?.color !== undefined) {
          scale[key].color = resolveColor(scale[key].color, element);
        }
      });
    });

    return scales;
  };

  const chartColor = (element, token) => resolveColor(`var(${token})`, element);

  const colorMix = (color, opacity) => `color-mix(in oklab, ${color} ${opacity * 100}%, transparent)`;

  const readCssPixels = (element, property, fallback = 0) => {
    const value = getComputedStyle(element).getPropertyValue(property).trim();
    if (!value) return fallback;

    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
  };

  const applyDatasetDefaults = (chartData, type, { barRadius, element }) => {
    chartData.datasets?.forEach((dataset) => {
      if (type === 'bar' || dataset.type === 'bar') {
        if (dataset.borderRadius === undefined) dataset.borderRadius = barRadius;
      }

      if (dataset._basecoatSurface) {
        dataset.backgroundColor = surfaceColor(dataset.borderColor || dataset.backgroundColor, element, dataset._basecoatSurface);
        delete dataset._basecoatSurface;
      }
    });

    return chartData;
  };

  const usesCartesianScales = (type) => !['pie', 'doughnut', 'polarArea', 'radar'].includes(type);

  const moveCanvasClassesToContainer = (canvas, container) => {
    const classes = Array.from(canvas.classList).filter((className) => className !== 'chart');
    if (classes.length === 0) return;

    container.classList.add(...classes);
    canvas.classList.remove(...classes);
  };

  const ensureContainer = (canvas) => {
    if (canvas.parentElement?.classList.contains('chart')) {
      canvas.parentElement.dataset.basecoatChartContainer = 'true';
      moveCanvasClassesToContainer(canvas, canvas.parentElement);
      return canvas.parentElement;
    }

    const container = document.createElement('div');
    container.className = 'chart';
    container.dataset.basecoatChartContainer = 'true';
    moveCanvasClassesToContainer(canvas, container);
    canvas.insertAdjacentElement('beforebegin', container);
    container.append(canvas);
    return container;
  };

  const seriesEntries = (series) => Object.entries(series || {});

  const valueFor = (row, key) => {
    if (row && typeof row === 'object') return row[key];
    return undefined;
  };

  const toChartData = ({ type, labelKey, data, series }) => {
    if (isChartJsData(data)) return cloneChartData(data);

    const rows = Array.isArray(data) ? data : [];
    const entries = seriesEntries(series);
    const labels = rows.map((row) => valueFor(row, labelKey));

    if (type === 'pie' || type === 'doughnut' || type === 'polarArea') {
      const [firstKey, firstSeries = {}] = entries[0] || [];
      return {
        labels,
        datasets: [{
          label: firstSeries.label || firstKey || 'Value',
          data: rows.map((row) => valueFor(row, firstKey)),
          backgroundColor: rows.map((row, index) => row?.color || row?.fill || colorForIndex(index)),
          borderColor: rows.map((row, index) => row?.color || row?.fill || colorForIndex(index)),
          ...(firstSeries.dataset || {}),
        }],
      };
    }

    return {
      labels,
      datasets: entries.map(([key, item], index) => {
        const color = item.color || colorForIndex(index);
        const dataset = item.dataset || {};
        const surface = item.surface === true
          ? { from: 0.4 }
          : item.surface === 'gradient'
            ? { from: 0.8, to: 0.1 }
            : item.surface;

        return {
          label: item.label || key,
          data: rows.map((row) => valueFor(row, key)),
          borderColor: color,
          backgroundColor: item.backgroundColor || color,
          fill: type === 'line' ? false : undefined,
          type: item.type,
          yAxisID: item.axis,
          hidden: item.hidden,
          ...dataset,
          ...(surface && item.backgroundColor === undefined && dataset.backgroundColor === undefined
            ? { _basecoatSurface: surface }
            : {}),
        };
      }),
    };
  };

  const formatValue = (value) => {
    return typeof value === 'number' ? value.toLocaleString() : String(value);
  };

  const colorForTooltipItem = (item) => {
    const elementColor = item.element?.options?.backgroundColor || item.element?.options?.borderColor;
    if (typeof elementColor === 'string') return elementColor;

    const backgroundColor = Array.isArray(item.dataset.backgroundColor)
      ? item.dataset.backgroundColor[item.dataIndex]
      : item.dataset.backgroundColor;
    if (typeof backgroundColor === 'string') return backgroundColor;

    const borderColor = Array.isArray(item.dataset.borderColor)
      ? item.dataset.borderColor[item.dataIndex]
      : item.dataset.borderColor;
    if (typeof borderColor === 'string') return borderColor;

    return colorForIndex(item.datasetIndex);
  };

  const ensureTooltip = (canvas) => {
    let tooltip = canvas._basecoatChartTooltip;
    if (tooltip) return tooltip;

    tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.hidden = true;
    tooltip.setAttribute('role', 'status');
    tooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(tooltip);
    canvas._basecoatChartTooltip = tooltip;
    return tooltip;
  };

  const renderTooltip = (context) => {
    const { chart, tooltip } = context;
    const element = ensureTooltip(chart.canvas);

    if (tooltip.opacity === 0) {
      element.hidden = true;
      return;
    }

    const children = [];

    if (tooltip.title?.length) {
      const title = document.createElement('div');
      title.className = 'chart-tooltip-title';
      title.textContent = tooltip.title.join(', ');
      children.push(title);
    }

    const items = document.createElement('div');
    items.className = 'chart-tooltip-items';
    tooltip.dataPoints.forEach((item) => {
      const color = colorForTooltipItem(item);
      const value = item.formattedValue || formatValue(item.raw);

      const row = document.createElement('div');
      row.className = 'chart-tooltip-item';

      const indicator = document.createElement('span');
      indicator.className = 'chart-tooltip-indicator';
      indicator.style.setProperty('--chart-indicator-color', color);

      const label = document.createElement('span');
      label.className = 'chart-tooltip-label';
      label.textContent = item.dataset.label || item.label;

      const tooltipValue = document.createElement('span');
      tooltipValue.className = 'chart-tooltip-value';
      tooltipValue.textContent = value;

      row.append(indicator, label, tooltipValue);
      items.append(row);
    });
    children.push(items);

    const rect = chart.canvas.getBoundingClientRect();
    element.replaceChildren(...children);
    element.hidden = false;
    element.style.left = `${rect.left + tooltip.caretX}px`;
    element.style.top = `${rect.top + tooltip.caretY}px`;
  };

  const createLegendPlugin = (canvas, enabled) => ({
    id: `basecoatLegend-${Math.random().toString(36).slice(2)}`,
    afterUpdate(chart) {
      if (!enabled) return;

      let legend = canvas._basecoatChartLegend;
      if (!legend) {
        legend = document.createElement('ul');
        legend.className = 'chart-legend';
        canvas._basecoatChartContainer.insertAdjacentElement('afterend', legend);
        canvas._basecoatChartLegend = legend;
      }

      const items = chart.options.plugins.legend.labels.generateLabels(chart);
      legend.replaceChildren(...items.map((item) => {
        const content = document.createElement('span');
        content.className = 'chart-legend-item';

        const indicator = document.createElement('span');
        indicator.className = 'chart-legend-indicator';
        const indicatorColor = typeof item.fillStyle === 'string'
          ? item.fillStyle
          : typeof item.strokeStyle === 'string'
            ? item.strokeStyle
            : colorForIndex(item.datasetIndex || item.index || 0);
        indicator.style.setProperty('--chart-indicator-color', indicatorColor);

        const label = document.createElement('span');
        label.textContent = item.text;

        content.append(indicator, label);

        const listItem = document.createElement('li');
        listItem.append(content);
        return listItem;
      }));
    },
  });

  const removeGeneratedElements = (canvas) => {
    canvas._basecoatChartTooltip?.remove();
    canvas._basecoatChartLegend?.remove();
    delete canvas._basecoatChartTooltip;
    delete canvas._basecoatChartLegend;
  };

  const initChart = (canvas, config = {}) => {
    const Chart = config.Chart || window.Chart;
    if (!Chart) {
      throw new Error('Chart.js is required before calling basecoat.chart().');
    }

    const previous = instances.get(canvas);
    if (previous) previous.destroy();
    removeGeneratedElements(canvas);

    const type = readOption(canvas, config, 'type', 'chartType') || 'bar';
    const labelKey = readOption(canvas, config, 'labelKey', 'chartLabelKey') || 'label';
    const legend = readBoolean(canvas, config, 'legend', 'chartLegend', false);
    const tooltip = readBoolean(canvas, config, 'tooltip', 'chartTooltip', true);
    const data = config.data || readJsonAttribute(canvas, 'data-chart-data') || [];
    const series = config.series || readJsonAttribute(canvas, 'data-chart-series') || {};
    const chartData = config.chartData ? cloneChartData(config.chartData) : toChartData({ type, labelKey, data, series });
    const userOptions = config.options || {};
    const legendPlugin = createLegendPlugin(canvas, legend);
    const container = ensureContainer(canvas);
    const borderColor = chartColor(canvas, '--border');
    const gridColor = resolveColor(colorMix('var(--border)', 0.5), canvas);
    const mutedColor = chartColor(canvas, '--muted-foreground');
    const barRadius = readCssPixels(canvas, '--chart-bar-radius');
    const defaultScales = usesCartesianScales(type)
      ? {
          x: {
            border: { display: false, color: borderColor },
            grid: { display: false, color: gridColor },
            ticks: { color: mutedColor, padding: 8 },
            ...clonePlainObject(userOptions.scales?.x || {}),
          },
          y: {
            border: { display: false, color: borderColor },
            grid: { color: gridColor },
            ticks: { display: false, color: mutedColor },
            ...clonePlainObject(userOptions.scales?.y || {}),
          },
        }
      : {};
    const scales = {
      ...defaultScales,
      ...(Object.fromEntries(Object.entries(userOptions.scales || {})
        .filter(([key]) => key !== 'x' && key !== 'y')
        .map(([key, value]) => [key, clonePlainObject(value)]))),
    };

    canvas.classList.remove('chart');
    canvas._basecoatChartContainer = container;
    canvas.dataset.chartLegend = String(legend);

    const chart = new Chart(canvas, {
      type,
      data: resolveDatasetColors(applyDatasetDefaults(chartData, type, { barRadius, element: canvas }), canvas),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        ...userOptions,
        scales: resolveScaleColors(scales, canvas),
        plugins: {
          ...userOptions.plugins,
          legend: {
            display: false,
            ...(userOptions.plugins?.legend || {}),
          },
          tooltip: {
            enabled: false,
            external: tooltip ? renderTooltip : undefined,
            ...(userOptions.plugins?.tooltip || {}),
          },
        },
      },
      plugins: [legendPlugin, ...(config.plugins || [])],
    });

    instances.set(canvas, chart);
    activeCanvases.add(canvas);
    canvas.dataset.chartInitialized = 'true';
    canvas.chart = chart;
    canvas._basecoatChartConfig = config;
    canvas._destroy = () => {
      chart.destroy();
      removeGeneratedElements(canvas);
      instances.delete(canvas);
      activeCanvases.delete(canvas);
      canvas.removeAttribute('data-chart-initialized');
      delete canvas._basecoatChartContainer;
      delete canvas._basecoatChartConfig;
      delete canvas.chart;
      delete canvas._destroy;
    };

    return chart;
  };

  const chart = (target, config = {}) => {
    const canvases = resolveTarget(target);
    const charts = canvases.map((canvas) => initChart(canvas, config));
    return charts.length === 1 ? charts[0] : charts;
  };

  const refreshCharts = () => {
    refreshFrame = null;

    Array.from(activeCanvases).forEach((canvas) => {
      if (!canvas.isConnected) {
        canvas._destroy?.();
        activeCanvases.delete(canvas);
        return;
      }

      initChart(canvas, canvas._basecoatChartConfig || {});
    });
  };

  const scheduleRefresh = () => {
    if (refreshFrame !== null) return;
    refreshFrame = requestAnimationFrame(refreshCharts);
  };

  const observeTokenChanges = () => {
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.attributeName === 'class' || mutation.attributeName === 'data-style-variant')) {
        scheduleRefresh();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-style-variant'],
    });

    document.addEventListener('basecoat:themechange', scheduleRefresh);
    document.addEventListener('basecoat:stylechange', scheduleRefresh);
  };

  if (window.basecoat) {
    window.basecoat.chart = chart;
  }

  observeTokenChanges();
})();

import { loadScript } from '../../scripts/aem.js';

const DATA_URL = new URL('./gemini-utm.json', import.meta.url);
const CHART_JS_URL = new URL('./vendor/chart.umd.min.js', import.meta.url);

/** Resolves a CSS custom property to a colour string the canvas can paint */
function token(el, name) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** Index 100 = the average baseline day of referred visits */
function indexed(data) {
  const from = data.days.indexOf(data.baseline.from);
  const to = data.days.indexOf(data.baseline.to);
  const base = data.visible.slice(from, to + 1);
  const avg = base.reduce((a, b) => a + b, 0) / base.length;
  const ix = (v) => Math.round((v / avg) * 100);
  return { visible: data.visible.map(ix), hidden: data.hidden.map(ix) };
}

function renderTable(widget, data, values) {
  const rows = data.days.map((day, i) => `<tr><th scope="row">${day}</th><td>${values.visible[i]}</td><td>${values.hidden[i]}</td></tr>`).join('');
  widget.querySelector('.gemini-utm-table').innerHTML = `<table>
    <thead><tr><th scope="col">Day</th><th scope="col">Visible</th><th scope="col">Hidden</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

/** Shades the days Gemini tagged its links and labels the band */
function taggedWindow(from, to, label, colors) {
  return {
    id: 'taggedWindow',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales: { x } } = chart;
      const half = (x.getPixelForValue(1) - x.getPixelForValue(0)) / 2;
      const left = x.getPixelForValue(from) - half;
      const right = x.getPixelForValue(to) + half;
      ctx.save();
      ctx.fillStyle = colors.band;
      ctx.fillRect(left, chartArea.top - 26, right - left, chartArea.bottom - chartArea.top + 26);
      ctx.fillStyle = colors.label;
      ctx.font = `600 13px ${colors.font}`;
      ctx.textAlign = 'center';
      ctx.fillText(label, (left + right) / 2, chartArea.top - 9, right - left - 8);
      ctx.restore();
    },
  };
}

/**
 * Stacked daily bars of Gemini visits: referred (visible) and tagged with no referrer (hidden).
 * @param {Element} widget The widget element
 */
export default async function decorate(widget) {
  const [data, Chart] = await Promise.all([
    fetch(DATA_URL).then((r) => r.json()),
    loadScript(CHART_JS_URL.href).then(() => window.Chart),
  ]);
  const values = indexed(data);
  renderTable(widget, data, values);

  const colors = {
    visible: token(widget, '--violet'),
    hidden: token(widget, '--mark-pink'),
    band: token(widget, '--haze'),
    label: token(widget, '--pink-ink'),
    ink: token(widget, '--ink-soft'),
    line: token(widget, '--line-color'),
    font: token(widget, '--body-font-family'),
  };
  const from = data.days.indexOf(data.tagged.from);
  const to = data.days.indexOf(data.tagged.to);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Chart.defaults.font.family = colors.font;
  Chart.defaults.color = colors.ink;

  // eslint-disable-next-line no-new
  new Chart(widget.querySelector('canvas'), {
    type: 'bar',
    data: {
      labels: data.days,
      datasets: [
        {
          label: 'Visible', data: values.visible, backgroundColor: colors.visible, stack: 'visits',
        },
        {
          label: 'Hidden', data: values.hidden, backgroundColor: colors.hidden, stack: 'visits', borderRadius: { topLeft: 3, topRight: 3 },
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      animation: reduceMotion ? false : { duration: 700 },
      layout: { padding: { top: 30 } },
      interaction: { mode: 'index', intersect: false },
      datasets: { bar: { categoryPercentage: 0.86, barPercentage: 0.92 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            footer: (items) => `Total ${items.reduce((sum, item) => sum + item.parsed.y, 0)}`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { maxRotation: 0, autoSkipPadding: 16 },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          border: { display: false },
          grid: { color: colors.line },
          ticks: { maxTicksLimit: 6 },
        },
      },
    },
    plugins: [taggedWindow(from, to, `Tagged ${data.tagged.from}–${data.tagged.to.replace(/^\D+/, '')}`, colors)],
  });
}

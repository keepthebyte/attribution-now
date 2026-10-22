import { loadScript } from '../../scripts/aem.js';

const DATA_URL = new URL('./ai-traffic.json', import.meta.url);
const CHART_JS_URL = new URL('../../scripts/vendor/chart.umd.min.js', import.meta.url);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Resolves a CSS custom property to a colour string the canvas can paint */
function token(el, name) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

const day = (iso) => new Date(`${iso}T00:00:00Z`);
const short = (iso) => `${MONTHS[day(iso).getUTCMonth()]} ${day(iso).getUTCDate()}`;

/** "Apr 20–26, 2026" */
function weekRange(data, i) {
  const [from, to] = [data.weeks[i], data.weekEnd[i]];
  const sameMonth = day(from).getUTCMonth() === day(to).getUTCMonth();
  return `${short(from)}–${sameMonth ? day(to).getUTCDate() : short(to)}, ${day(to).getUTCFullYear()}`;
}

/** Week index plus the fraction of the week, so a milestone sits on its day */
function weekPosition(data, iso) {
  const t = day(iso).getTime();
  const i = data.weeks.findIndex((w, j) => t >= day(w).getTime()
    && t <= day(data.weekEnd[j]).getTime());
  return i < 0 ? null : i + (t - day(data.weeks[i]).getTime()) / (7 * 86400000);
}

function renderLegend(widget, lines) {
  widget.querySelector('.ai-traffic-legend').innerHTML = lines.map((l) => `<li class="${l.dash ? 'ai-traffic-key-dash' : ''}" style="--key: var(${l.color})">${l.label}</li>`).join('');
}

function renderTable(widget, data, assistant) {
  const { lines, share } = assistant;
  const head = lines.map((l) => `<th scope="col">${l.label}</th>`).join('')
    + (share ? `<th scope="col">${share.title}</th>` : '');
  const rows = data.weeks.map((w, i) => `<tr><th scope="row">${weekRange(data, i)}</th>${lines.map((l) => `<td>${l.values[i]}</td>`).join('')}${share ? `<td>${share.values[i]}%</td>` : ''}</tr>`).join('');
  widget.querySelector('.ai-traffic-table').innerHTML = `<table>
    <thead><tr><th scope="col">Week</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

/** First and last week of each line, for screen readers */
function ariaLabel(data, assistant) {
  const last = data.weeks.length - 1;
  const parts = assistant.lines.map((l) => `${l.label}: ${l.values[0]} in the week of ${short(data.weeks[0])}, ${l.values[last]} in the week of ${short(data.weeks[last])}`);
  return `${assistant.name} visits per week, indexed. ${parts.join('. ')}.`;
}

/** Dashed milestone lines; labels only where they fit */
function milestones(data, list, colors) {
  return {
    id: 'milestones',
    beforeDatasetsDraw(chart) {
      if (!list.length) return;
      const { ctx, chartArea, scales: { x } } = chart;
      const labelled = chart.options.plugins.milestones?.labels && chartArea.width > 560;
      ctx.save();
      ctx.strokeStyle = colors.ink;
      ctx.fillStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.font = `500 12px ${colors.font}`;
      ctx.textAlign = 'right';
      list.forEach((m, n) => {
        const pos = weekPosition(data, m.date);
        if (pos === null) return;
        const px = x.getPixelForValue(pos);
        ctx.beginPath();
        ctx.moveTo(px, chartArea.top);
        ctx.lineTo(px, chartArea.bottom);
        ctx.stroke();
        const row = list.length - 1 - n;
        if (labelled) ctx.fillText(m.label, px - 6, chartArea.top + 12 + row * 16);
      });
      ctx.restore();
    },
  };
}

/**
 * Weekly lines of one assistant's visits by the signal they arrive with, plus,
 * where it applies, the share of visits that carry the tag.
 * The assistant comes from the widget link: /widgets/ai-traffic/ai-traffic.html?assistant=copilot
 * @param {Element} widget The widget element
 */
export default async function decorate(widget) {
  const [data, Chart] = await Promise.all([
    fetch(DATA_URL).then((r) => r.json()),
    loadScript(CHART_JS_URL.href).then(() => window.Chart),
  ]);
  const assistant = data[widget.dataset.assistant];
  if (!assistant) return;
  const { lines, share } = assistant;
  const list = assistant.milestones || [];

  renderLegend(widget, lines);
  renderTable(widget, data, assistant);
  widget.querySelector('.ai-traffic-volume canvas').setAttribute('aria-label', ariaLabel(data, assistant));
  widget.querySelector('figcaption').textContent = `Visits per week, indexed: ${assistant.index}.${list.length ? ` Dashed lines: ${list.map((m) => m.label).join('; ')}.` : ''} Source: ${data.source}`;

  const colors = {
    fill: token(widget, '--haze'),
    ink: token(widget, '--ink-soft'),
    line: token(widget, '--line-color'),
    font: token(widget, '--body-font-family'),
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Chart.defaults.font.family = colors.font;
  Chart.defaults.color = colors.ink;

  const xAxis = {
    grid: { display: false },
    ticks: {
      autoSkip: false,
      maxRotation: 0,
      // one tick per month on its first week; none for a leading partial month
      callback(v, i) {
        const month = (j) => day(data.weeks[j]).getUTCMonth();
        const m = month(i);
        if (i > 0 && m === month(i - 1)) return null;
        if (i === 0 && month(2) !== m) return null;
        if (this.chart.width < 400 && m % 2) return null;
        return MONTHS[m];
      },
    },
  };
  const base = {
    maintainAspectRatio: false,
    animation: reduceMotion ? false : { duration: 700 },
    interaction: { mode: 'index', intersect: false },
    elements: { point: { radius: 0, hoverRadius: 4 }, line: { borderWidth: 2.5, tension: 0.25 } },
  };

  // eslint-disable-next-line no-new
  new Chart(widget.querySelector('.ai-traffic-volume canvas'), {
    type: 'line',
    data: {
      labels: data.weeks,
      datasets: lines.map((l) => ({
        label: l.label,
        data: l.values,
        borderColor: token(widget, l.color),
        borderDash: l.dash ? [6, 4] : [],
      })),
    },
    options: {
      ...base,
      plugins: {
        legend: { display: false },
        milestones: { labels: true },
        tooltip: {
          callbacks: {
            title: ([item]) => weekRange(data, item.dataIndex),
            label: (item) => ` ${item.dataset.label}: ${item.raw}`,
          },
        },
      },
      scales: {
        x: xAxis,
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: colors.line },
          ticks: { maxTicksLimit: 5 },
        },
      },
    },
    plugins: [milestones(data, list, colors)],
  });

  if (!share) return;
  const subtitle = widget.querySelector('.ai-traffic-subtitle');
  const shareChart = widget.querySelector('.ai-traffic-share');
  subtitle.textContent = share.title;
  subtitle.hidden = false;
  shareChart.hidden = false;
  shareChart.querySelector('canvas').setAttribute('aria-label', `${share.title}: ${share.values[0]}% in the week of ${short(data.weeks[0])}, ${share.values[share.values.length - 1]}% in the week of ${short(data.weeks[data.weeks.length - 1])}.`);

  // eslint-disable-next-line no-new
  new Chart(shareChart.querySelector('canvas'), {
    type: 'line',
    data: {
      labels: data.weeks,
      datasets: [{
        label: share.label,
        data: share.values,
        borderColor: token(widget, '--violet'),
        backgroundColor: colors.fill,
        fill: 'origin',
      }],
    },
    options: {
      ...base,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ([item]) => weekRange(data, item.dataIndex),
            label: (item) => ` ${item.raw}% ${share.label}`,
          },
        },
      },
      scales: {
        x: xAxis,
        y: {
          beginAtZero: true,
          max: share.max,
          border: { display: false },
          grid: { color: colors.line },
          ticks: { stepSize: share.max / 2, callback: (v) => `${v}%` },
        },
      },
    },
    plugins: [milestones(data, list, colors)],
  });
}

import { loadScript } from '../../scripts/aem.js';

const DATA_URL = new URL('./chatgpt-utm.json', import.meta.url);
const CHART_JS_URL = new URL('../../scripts/vendor/chart.umd.min.js', import.meta.url);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Resolves a CSS custom property to a colour string the canvas can paint */
function token(el, name) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

const day = (iso) => new Date(`${iso}T00:00:00Z`);
const short = (iso) => `${MONTHS[day(iso).getUTCMonth()]} ${day(iso).getUTCDate()}`;
const thousands = (v) => `${Math.round(v / 1000)}k`;

/** "Oct 23–29, 2025" */
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

function renderTable(widget, data) {
  const rows = data.weeks.map((w, i) => `<tr><th scope="row">${weekRange(data, i)}</th>
    <td>${data.utm[i].toLocaleString('en-US')}</td><td>${data.referrer[i].toLocaleString('en-US')}</td>
    <td>${data.withReferrerPct[i]}%</td></tr>`).join('');
  widget.querySelector('.chatgpt-utm-table').innerHTML = `<table>
    <thead><tr><th scope="col">Week</th><th scope="col">Tagged per day</th><th scope="col">Referrer per day</th>
    <th scope="col">Tagged with referrer</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/** Grey exception week and dashed milestone lines; labels only where they fit */
function annotations(data, exception, colors) {
  return {
    id: 'annotations',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales: { x } } = chart;
      const step = x.getPixelForValue(1) - x.getPixelForValue(0);
      ctx.save();
      if (exception >= 0) {
        ctx.fillStyle = colors.band;
        const left = x.getPixelForValue(exception) - step / 2;
        ctx.fillRect(left, chartArea.top, step, chartArea.bottom - chartArea.top);
      }
      const labelled = chart.options.plugins.annotations?.labels && chartArea.width > 560;
      ctx.strokeStyle = colors.ink;
      ctx.fillStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.font = `500 12px ${colors.font}`;
      ctx.textAlign = 'right';
      data.milestones.forEach((m, n) => {
        const pos = weekPosition(data, m.date);
        if (pos === null) return;
        const px = x.getPixelForValue(pos);
        ctx.beginPath();
        ctx.moveTo(px, chartArea.top);
        ctx.lineTo(px, chartArea.bottom);
        ctx.stroke();
        // later milestones sit higher, where the lines have room
        const row = data.milestones.length - 1 - n;
        if (labelled) ctx.fillText(m.label, px - 6, chartArea.top + 12 + row * 16);
      });
      ctx.restore();
    },
  };
}

/**
 * Two charts of ChatGPT landings by week: tagged visits against referred ones,
 * and the share of tagged visits that still carry the referrer.
 * @param {Element} widget The widget element
 */
export default async function decorate(widget) {
  const [data, Chart] = await Promise.all([
    fetch(DATA_URL).then((r) => r.json()),
    loadScript(CHART_JS_URL.href).then(() => window.Chart),
  ]);
  renderTable(widget, data);

  const colors = {
    utm: token(widget, '--violet'),
    referrer: token(widget, '--mark-pink'),
    fill: token(widget, '--haze'),
    band: token(widget, '--line-color'),
    ink: token(widget, '--ink-soft'),
    line: token(widget, '--line-color'),
    font: token(widget, '--body-font-family'),
  };
  const exception = data.flag.findIndex((f) => f.startsWith('exception'));
  const partial = data.flag.findIndex((f) => f.startsWith('current week'));
  const bridged = (list) => list.map((v, i) => (i === exception ? null : v));
  const only = (list) => list.map((v, i) => (i === exception ? v : null));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Chart.defaults.font.family = colors.font;
  Chart.defaults.color = colors.ink;

  const note = (i) => {
    if (i === exception) return 'GPT-6 rollout bug: tag and referrer stripped';
    if (i === partial) return `Week to date (${data.days[i]} days)`;
    return '';
  };
  const xAxis = {
    grid: { display: false },
    ticks: {
      autoSkip: false,
      maxRotation: 0,
      // one tick per month on its first week (each quarter on narrow charts); none for a
      // leading partial month
      callback(v, i) {
        const month = (j) => day(data.weeks[j]).getUTCMonth();
        const m = month(i);
        if (i > 0 && m === month(i - 1)) return null;
        if (i === 0 && month(2) !== m) return null;
        if (this.chart.width < 600 && m % 3) return null;
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
  new Chart(widget.querySelector('.chatgpt-utm-volume canvas'), {
    type: 'line',
    data: {
      labels: data.weeks,
      datasets: [
        {
          label: 'Tagged', data: bridged(data.utm), borderColor: colors.utm, spanGaps: true,
        },
        {
          label: 'Referrer', data: bridged(data.referrer), borderColor: colors.referrer, borderDash: [6, 4], spanGaps: true,
        },
        {
          label: 'Tagged (bug week)', data: only(data.utm), borderColor: colors.utm, backgroundColor: colors.fill, pointRadius: 4, showLine: false,
        },
        {
          label: 'Referrer (bug week)', data: only(data.referrer), borderColor: colors.referrer, backgroundColor: colors.fill, pointRadius: 4, showLine: false,
        },
      ],
    },
    options: {
      ...base,
      plugins: {
        legend: { display: false },
        annotations: { labels: true },
        tooltip: {
          filter: (item) => item.raw !== null,
          callbacks: {
            title: ([item]) => weekRange(data, item.dataIndex),
            label: (item) => ` ${item.dataset.label.replace(/ \(.*\)/, '')}: ${thousands(item.raw)} per day`,
            footer: ([item]) => note(item.dataIndex),
          },
        },
      },
      scales: {
        x: xAxis,
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: colors.line },
          ticks: { maxTicksLimit: 5, callback: (v) => (v ? thousands(v) : '0') },
        },
      },
    },
    plugins: [annotations(data, exception, colors)],
  });

  // eslint-disable-next-line no-new
  new Chart(widget.querySelector('.chatgpt-utm-share canvas'), {
    type: 'line',
    data: {
      labels: data.weeks,
      datasets: [{
        label: 'With referrer',
        data: data.withReferrerPct,
        borderColor: colors.referrer,
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
            label: (item) => ` ${item.raw}% of tagged visits had the referrer`,
            footer: ([item]) => note(item.dataIndex),
          },
        },
      },
      scales: {
        x: xAxis,
        y: {
          beginAtZero: true,
          max: 60,
          border: { display: false },
          grid: { color: colors.line },
          ticks: { stepSize: 25, callback: (v) => `${v}%` },
        },
      },
    },
    plugins: [annotations(data, exception, colors)],
  });
}

const STATUSES = ['works', 'partial', 'missing', 'untested', 'n/a'];

const ICONS = {
  works: '<circle cx="8" cy="8" r="8" fill="currentColor"/><path d="m4.6 8.3 2.2 2.2 4.6-4.8" fill="none" stroke="#faf9fe" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  partial: '<circle cx="8" cy="8" r="6.8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8 1.2a6.8 6.8 0 0 1 0 13.6Z" fill="currentColor"/>',
  missing: '<circle cx="8" cy="8" r="8" fill="currentColor"/><path d="m5.3 5.3 5.4 5.4m0-5.4-5.4 5.4" fill="none" stroke="#faf9fe" stroke-width="1.9" stroke-linecap="round"/>',
  untested: '<circle cx="8" cy="8" r="6.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3 2.4"/>',
};

/** "Referrer: Reported missing" → { status: 'missing', reported: true } */
function statusOf(text) {
  const words = text.toLowerCase().split(':').pop().trim()
    .split(/\s+/);
  const reported = words[0] === 'reported';
  const status = words[words.length - 1];
  return { status: STATUSES.includes(status) ? status : 'untested', reported };
}

/** Turns a status link into a mark: symbol + the authored words + colour */
function decorateSignal(a) {
  const { status, reported } = statusOf(a.textContent);
  const key = status === 'n/a' ? 'na' : status;
  a.classList.add('signal', `signal-${key}`);
  if (reported) a.classList.add('signal-reported');
  if (ICONS[status]) {
    a.insertAdjacentHTML('afterbegin', `<svg class="signal-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${ICONS[status]}</svg>`);
  }
}

/**
 * Scorecard: authored as a table (header row of surfaces, one row per assistant),
 * with optional single-cell rows before it (takeaway) and after it (notes).
 * Rendered as one card per assistant.
 * @param {Element} block The scorecard block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const isNote = (r) => r.children.length === 1;
  const firstTable = rows.findIndex((r) => !isNote(r));
  if (firstTable < 0) return;
  const before = rows.slice(0, firstTable);
  const tableRows = rows.slice(firstTable).filter((r) => !isNote(r));
  const after = rows.slice(firstTable).filter(isNote);
  const [head, ...labs] = tableRows;
  const columns = [...head.children].slice(1).map((c) => c.textContent.trim());

  const notes = (list, className) => list.map((r) => {
    const div = document.createElement('div');
    div.className = className;
    div.append(...r.firstElementChild.childNodes);
    return div;
  });

  const cards = document.createElement('ul');
  cards.className = 'scorecard-cards';
  labs.forEach((r, i) => {
    const [name, ...cells] = [...r.children];
    const li = document.createElement('li');
    li.className = 'scorecard-card';

    const title = document.createElement('div');
    title.className = 'scorecard-title';
    title.append(...(name?.childNodes || []));
    const heading = title.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && !heading.id) heading.id = `scorecard-lab-${i + 1}`;

    const table = document.createElement('table');
    if (heading) table.setAttribute('aria-labelledby', heading.id);
    const tbody = document.createElement('tbody');
    cells.forEach((c, j) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = columns[j] || '';
      const td = document.createElement('td');
      const marks = document.createElement('div');
      marks.className = 'scorecard-marks';
      c.querySelectorAll('a').forEach((a) => {
        if (j < cells.length - 1) decorateSignal(a);
        else a.classList.add('signal', 'signal-plain');
        marks.append(a);
      });
      if (!marks.children.length) marks.textContent = c.textContent.trim();
      td.append(marks);
      tr.append(th, td);
      tbody.append(tr);
    });
    table.append(tbody);
    li.append(title, table);
    cards.append(li);
  });

  // the takeaway heading is the section's anchor (#scorecard): the pipeline ids headings by text
  const takeaway = notes(before, 'scorecard-takeaway');
  const anchor = takeaway[0]?.querySelector('h1, h2, h3');
  if (anchor && !document.getElementById('scorecard')) anchor.id = 'scorecard';

  block.replaceChildren(
    ...takeaway,
    cards,
    ...notes(after, 'scorecard-note'),
  );
}

const STATUSES = ['works', 'partial', 'missing', 'untested', 'n/a'];

/** "Referrer: Reported missing" → { status: 'missing', reported: true } */
function statusOf(text) {
  const words = text.toLowerCase().split(':').pop().trim()
    .split(/\s+/);
  const reported = words[0] === 'reported';
  const status = words[words.length - 1];
  return { status: STATUSES.includes(status) ? status : 'untested', reported };
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headRow = document.createElement('tr');
  [...rows[0].children].forEach((c) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.append(...c.childNodes);
    headRow.append(th);
  });
  thead.append(headRow);

  rows.slice(1).forEach((r) => {
    const tr = document.createElement('tr');
    const [name, ...cells] = [...r.children];
    const th = document.createElement('th');
    th.scope = 'row';
    th.append(...(name?.childNodes || []));
    tr.append(th);
    cells.forEach((c, i) => {
      const td = document.createElement('td');
      td.append(...c.childNodes);
      if (i < cells.length - 1) {
        td.querySelectorAll('a').forEach((a) => {
          const { status, reported } = statusOf(a.textContent);
          a.classList.add('signal', `signal-${status === 'n/a' ? 'na' : status}`);
          if (reported) a.classList.add('signal-reported');
        });
      }
      tr.append(td);
    });
    tbody.append(tr);
  });

  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'scorecard-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Scorecard');
  scroller.append(table);
  block.replaceChildren(scroller);
}

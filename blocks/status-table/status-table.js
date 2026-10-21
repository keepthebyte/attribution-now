const STATUSES = ['works', 'partial', 'missing', 'reported', 'untested', 'n/a'];

function statusOf(text) {
  const label = text.toLowerCase().split('(')[0].trim();
  const [status, finding] = label.split(':').map((s) => s.trim());
  return {
    status: STATUSES.includes(status) ? status : 'untested',
    finding: finding || null,
  };
}

function chip(cellEl) {
  const label = cellEl.querySelector('p') || cellEl;
  const { status, finding } = statusOf(label.textContent);
  const el = document.createElement('span');
  el.className = `chip chip-${status === 'n/a' ? 'na' : status}`;
  if (finding) el.classList.add(`chip-finding-${finding}`);
  el.append(...label.childNodes);
  return el;
}

let panelCount = 0;

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  panelCount += 1;
  const panelId = `status-detail-${panelCount}`;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headRow = document.createElement('tr');
  [...rows[0].children].forEach((c, i) => {
    const th = document.createElement('th');
    th.scope = 'col';
    if (i === 0) th.className = 'test-col';
    th.append(...c.childNodes);
    headRow.append(th);
  });
  thead.append(headRow);
  const columns = [...headRow.children].map((th) => th.textContent.trim());

  const panel = document.createElement('div');
  panel.className = 'status-detail';
  panel.id = panelId;
  panel.setAttribute('aria-live', 'polite');
  panel.hidden = true;
  let active = null;

  rows.slice(1).forEach((r) => {
    const tr = document.createElement('tr');
    const cells = [...r.children];
    const th = document.createElement('th');
    th.scope = 'row';
    th.append(...(cells[0]?.childNodes || []));
    tr.append(th);
    const testName = th.textContent.trim();
    // anchor for deep links from the homepage scorecard, e.g. #status-ref-01
    const testId = th.querySelector('strong')?.textContent.trim();
    if (testId) tr.id = `status-${testId.toLowerCase()}`;
    cells.slice(1).forEach((c, i) => {
      const td = document.createElement('td');
      const details = c.querySelector('ul');
      const label = chip(c);
      if (details) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cell-button';
        button.setAttribute('aria-controls', panelId);
        button.setAttribute('aria-expanded', 'false');
        button.append(label);
        button.addEventListener('click', () => {
          if (active) active.setAttribute('aria-expanded', 'false');
          if (active === button) {
            active = null;
            panel.hidden = true;
            return;
          }
          active = button;
          button.setAttribute('aria-expanded', 'true');
          const h = document.createElement('h4');
          h.textContent = `${testName} · ${columns[i + 1] || ''}`;
          panel.replaceChildren(h, details.cloneNode(true));
          panel.hidden = false;
        });
        td.append(button);
      } else {
        td.append(label);
      }
      tr.append(td);
    });
    tbody.append(tr);
  });

  table.append(thead, tbody);
  const scroller = document.createElement('div');
  scroller.className = 'status-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Status table');
  scroller.append(table);
  block.replaceChildren(scroller, panel);

  // the row didn't exist when the browser handled the hash, so scroll to it now
  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  if (target && block.contains(target)) {
    target.classList.add('status-target');
    target.scrollIntoView();
  }
}

/* "Match these": the values a channel rule needs, one row per assistant. Stacks on phones. */

/**
 * Decorates the match block.
 * Authoring: the first row holds the column headings; each other row starts with the assistant.
 * @param {Element} block The match block element
 */
export default function decorate(block) {
  const [headRow, ...rows] = [...block.children];
  if (!headRow) return;
  const headings = [...headRow.children].map((cell) => cell.innerHTML);
  const labels = [...headRow.children].map((cell) => cell.textContent.trim());

  const table = document.createElement('table');
  table.setAttribute('role', 'table');
  const caption = block.closest('.section')?.querySelector('h3');
  if (caption) {
    caption.id ||= 'match-these';
    table.setAttribute('aria-labelledby', caption.id);
  }

  const thead = document.createElement('thead');
  thead.setAttribute('role', 'rowgroup');
  const tr = document.createElement('tr');
  tr.setAttribute('role', 'row');
  headings.forEach((html) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.setAttribute('role', 'columnheader');
    th.innerHTML = html;
    tr.append(th);
  });
  thead.append(tr);

  const tbody = document.createElement('tbody');
  tbody.setAttribute('role', 'rowgroup');
  rows.forEach((row) => {
    const r = document.createElement('tr');
    r.setAttribute('role', 'row');
    [...row.children].forEach((cell, i) => {
      const c = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) {
        c.scope = 'row';
        c.setAttribute('role', 'rowheader');
        c.append(...cell.childNodes);
      } else {
        c.setAttribute('role', 'cell');
        const label = document.createElement('span');
        label.className = 'match-label';
        label.setAttribute('aria-hidden', 'true');
        label.textContent = labels[i] || '';
        const value = document.createElement('span');
        value.className = 'match-value';
        value.append(...cell.childNodes);
        c.append(label, value);
      }
      r.append(c);
    });
    tbody.append(r);
  });

  table.append(thead, tbody);
  block.replaceChildren(table);
}

/* Channel order: the channels in the order a rule checks them, first match wins. */

/**
 * Decorates the precedence block.
 * Authoring: an optional first row with one cell (the label), then one row with a cell per
 * channel, highest first; the channel in bold is the one this page is about.
 * @param {Element} block The precedence block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const labelRow = rows.length > 1 && rows[0].children.length === 1 ? rows.shift() : null;
  const cells = rows.flatMap((row) => [...row.children]);

  const label = document.createElement('p');
  label.className = 'precedence-label';
  label.id = 'channel-order';
  label.textContent = labelRow?.textContent.trim() || 'Channel order, first match wins';

  const list = document.createElement('ol');
  list.setAttribute('aria-labelledby', label.id);
  cells.forEach((cell, i) => {
    if (i) {
      const sep = document.createElement('li');
      sep.className = 'precedence-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = 'above';
      list.append(sep);
    }
    const li = document.createElement('li');
    if (cell.querySelector('strong')) li.className = 'is-current';
    li.textContent = cell.textContent.trim();
    list.append(li);
  });

  block.replaceChildren(label, list);
}

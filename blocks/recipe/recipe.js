/* "How to count" card: one row per operation, the operator in a column down the left. */

const VERBS = {
  '+': 'Add',
  '−': 'Subtract',
  '-': 'Subtract',
  '×': 'Multiply by',
  x: 'Multiply by',
  '≥': 'At least',
  '=': 'Total',
  '→': 'Then',
};

/**
 * Reads an operator cell. "↳ −" marks a row that modifies the row above it.
 * @param {string} text The cell text
 * @returns {{ op: string, sub: boolean }}
 */
function readOperator(text) {
  const sub = text.startsWith('↳');
  const op = text.replace('↳', '').trim();
  return { op: op === '-' ? '−' : op, sub };
}

/**
 * The nodes inside a cell, without the paragraph the authoring tool may wrap them in.
 * @param {Element} cell A block cell
 * @returns {Node[]}
 */
function inline(cell) {
  const only = cell.children.length === 1 && cell.firstElementChild;
  return [...(only?.tagName === 'P' && only.textContent.trim() === cell.textContent.trim()
    ? only.childNodes : cell.childNodes)];
}

/**
 * Decorates the recipe block.
 * Authoring: the first row is "How to count | <result>"; every other row is
 * operator | label | values | note (values and note may be empty or missing).
 * @param {Element} block The recipe block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const first = rows[0]?.children;
  const firstOp = first?.[0] && readOperator(first[0].textContent.trim()).op;
  const hasHead = first && first.length >= 2 && !VERBS[firstOp];
  const head = hasHead ? rows.shift() : null;

  const title = head?.children[0]?.textContent.trim() || 'How to count';
  const result = head?.children[1]?.textContent.trim() || '';
  const heading = block.closest('.section')?.querySelector('h2');
  const name = heading ? heading.textContent.split(':')[0].trim() : '';

  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.setAttribute('role', 'group');
  card.setAttribute('aria-label', [`${title}${name ? ` ${name}` : ''}`, result].filter(Boolean).join(': '));

  const top = document.createElement('div');
  top.className = 'recipe-head';
  top.innerHTML = `<span class="recipe-title"></span>${result ? '<span class="recipe-result"></span>' : ''}`;
  top.querySelector('.recipe-title').textContent = title;
  if (result) top.querySelector('.recipe-result').textContent = result;

  const list = document.createElement('ol');
  list.className = 'recipe-rows';
  rows.forEach((row, i) => {
    const [opCell, labelCell, valuesCell, noteCell] = row.children;
    if (!opCell) return;
    const { op, sub } = readOperator(opCell.textContent.trim());
    const li = document.createElement('li');
    li.className = 'recipe-row';
    if (sub) li.classList.add('is-sub');
    if (i === rows.length - 1 && ['=', '≥'].includes(op)) li.classList.add('is-total');

    const opEl = document.createElement('span');
    opEl.className = 'recipe-op';
    opEl.setAttribute('aria-hidden', 'true');
    opEl.textContent = op;
    const verb = document.createElement('span');
    verb.className = 'visually-hidden';
    verb.textContent = `${VERBS[op] || op}: `;

    const body = document.createElement('span');
    body.className = 'recipe-body';
    if (labelCell?.textContent.trim()) {
      const label = document.createElement('span');
      label.className = 'recipe-label';
      label.append(...inline(labelCell));
      body.append(label);
    }
    if (valuesCell?.textContent.trim()) {
      const values = document.createElement('span');
      values.className = 'recipe-values';
      const parts = valuesCell.querySelectorAll(':scope > p').length
        ? [...valuesCell.querySelectorAll(':scope > p')]
        : [...valuesCell.querySelectorAll('code')];
      if (parts.length) {
        parts.forEach((part) => {
          const value = document.createElement('span');
          value.className = 'recipe-value';
          value.append(...(part.tagName === 'P' ? part.childNodes : [part]));
          values.append(value);
        });
      } else {
        values.append(...inline(valuesCell));
      }
      body.append(values);
    }
    if (noteCell?.textContent.trim()) {
      const note = document.createElement('span');
      note.className = 'recipe-note';
      const sep = document.createElement('span');
      sep.className = 'visually-hidden';
      sep.textContent = ', ';
      note.append(sep, ...inline(noteCell));
      body.append(note);
    }
    li.append(opEl, verb, body);
    list.append(li);
  });

  card.append(top, list);
  block.replaceChildren(card);
}

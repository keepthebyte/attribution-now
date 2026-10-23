/* "At a glance": one formula per section, each a link to it (replaces the pill toc). */

const LEAD = { '=': 'equals', '≥': 'is at least' };
const OPERATORS = /([+−×≥=])/g;

/**
 * Renders a formula, wrapping each operator so it reads as a sum.
 * @param {string} text The formula, e.g. "= referrer × 2.1–2.5"
 * @returns {HTMLSpanElement}
 */
function formula(text) {
  const span = document.createElement('span');
  span.className = 'glance-formula';
  const lead = text.match(/^([=≥])\s*/);
  if (lead) {
    const op = document.createElement('span');
    op.className = 'op op-lead';
    op.setAttribute('aria-hidden', 'true');
    const [, sign] = lead;
    op.textContent = sign;
    const verb = document.createElement('span');
    verb.className = 'visually-hidden';
    verb.textContent = `${LEAD[sign]} `;
    span.append(op, verb);
  }
  text.slice(lead ? lead[0].length : 0).split(OPERATORS).forEach((part) => {
    if (!part) return;
    if (OPERATORS.test(part)) {
      OPERATORS.lastIndex = 0;
      const op = document.createElement('span');
      op.className = 'op';
      op.textContent = part;
      span.append(op);
    } else {
      span.append(part);
    }
  });
  return span;
}

/**
 * Decorates the glance block.
 * Authoring: one row per section: a link | its formula (a row without a formula is an arrow link).
 * @param {Element} block The glance block element
 */
export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.id = 'at-a-glance';
  nav.setAttribute('aria-label', 'On this page');
  const list = document.createElement('ol');

  [...block.children].forEach((row) => {
    const [nameCell, formulaCell] = row.children;
    const source = nameCell?.querySelector('a[href]');
    if (!source) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = source.getAttribute('href');
    const text = formulaCell?.textContent.trim();
    if (text) {
      const name = document.createElement('span');
      name.className = 'glance-name';
      name.textContent = source.textContent.trim();
      a.append(name, formula(text));
    } else {
      li.className = 'glance-more';
      a.className = 'arrow-link';
      a.textContent = source.textContent.trim();
    }
    li.append(a);
    list.append(li);
  });

  nav.append(list);
  block.replaceChildren(nav);
}

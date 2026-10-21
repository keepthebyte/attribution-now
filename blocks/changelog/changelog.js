const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-15" → <time> with "Oct 15" and the year on its own line; other text stays as is */
function dateline(text) {
  const time = document.createElement('time');
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    time.textContent = text;
    return time;
  }
  const [, year, month, day] = match;
  time.dateTime = text;
  time.innerHTML = `<span class="changelog-day">${MONTHS[Number(month) - 1]} ${Number(day)}</span><span class="changelog-sep">, </span><span class="changelog-year">${year}</span>`;
  return time;
}

/** Marks the thank-you line and the Verified/Reported line so they can be styled */
function classify(body) {
  body.querySelectorAll(':scope > p').forEach((p) => {
    const strong = p.querySelector(':scope > strong');
    if (strong && strong.textContent.trim() === p.textContent.trim()) {
      p.className = 'changelog-thanks';
      p.replaceChildren(...strong.childNodes);
      return;
    }
    const [, proof] = p.textContent.trim().match(/^(Verified|Reported)\b/) || [];
    if (proof) {
      p.className = 'changelog-proof';
      const first = p.firstChild;
      if (first?.nodeType === Node.TEXT_NODE) first.textContent = first.textContent.replace(proof, '');
      const mark = document.createElement('span');
      mark.className = `changelog-mark changelog-${proof.toLowerCase()}`;
      mark.textContent = proof;
      p.prepend(mark);
    }
  });
}

/**
 * Rows: date | lab | body | type (optional). Renders a dated list with a rail on wide screens.
 * @param {Element} block The changelog block
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row) => {
    const [date, lab, body, type] = row.children;
    const typeText = type?.textContent.trim() || '';
    const li = document.createElement('li');
    if (/shipped/i.test(typeText)) li.classList.add('changelog-shipped');

    const meta = document.createElement('div');
    meta.className = 'changelog-meta';
    if (date) meta.append(dateline(date.textContent.trim()));
    if (lab) {
      const name = document.createElement('p');
      name.className = 'changelog-lab';
      name.append(...(lab.querySelector('p') || lab).childNodes);
      meta.append(name);
    }
    if (typeText) {
      const kind = document.createElement('p');
      kind.className = 'changelog-type';
      kind.textContent = typeText;
      meta.append(kind);
    }

    const entry = document.createElement('div');
    entry.className = 'changelog-entry';
    if (body) {
      classify(body);
      entry.append(...body.childNodes);
    }
    li.append(meta, entry);
    ol.append(li);
  });
  block.replaceChildren(ol);
}

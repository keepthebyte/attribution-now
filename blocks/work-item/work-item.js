function rowsByLabel(block) {
  const map = new Map();
  [...block.children].forEach((row) => {
    const [label, value] = row.children;
    if (!label || !value) return;
    const text = label.textContent.trim();
    map.set(text.toLowerCase(), { label: text, value });
  });
  return map;
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function promptControl(label, value) {
  const pre = value.querySelector('pre');
  const wrap = document.createElement('div');
  wrap.className = 'work-item-prompt';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button';
  button.textContent = label;
  const status = document.createElement('span');
  status.className = 'work-item-copied';
  status.setAttribute('role', 'status');

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Show prompt';
  details.append(summary, pre);

  button.addEventListener('click', async () => {
    const ok = await copy(pre.textContent);
    if (ok) {
      status.textContent = 'Copied';
    } else {
      details.open = true;
      const range = document.createRange();
      range.selectNodeContents(pre);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Press Ctrl+C or ⌘C to copy';
    }
    setTimeout(() => { status.textContent = ''; }, 3000);
  });

  wrap.append(button, status, details);
  return wrap;
}

export default function decorate(block) {
  const rows = rowsByLabel(block);
  const card = document.createElement('article');
  const take = (key) => {
    const r = rows.get(key);
    rows.delete(key);
    return r;
  };

  const title = take('title');
  if (title) card.append(...title.value.childNodes);

  const meta = document.createElement('dl');
  meta.className = 'work-item-meta';
  ['surfaces', 'tests'].forEach((key) => {
    const r = take(key);
    if (!r) return;
    const dt = document.createElement('dt');
    dt.textContent = r.label;
    const dd = document.createElement('dd');
    dd.append(...r.value.childNodes);
    meta.append(dt, dd);
  });
  card.append(meta);

  ['summary', 'suggested fix'].forEach((key) => {
    const r = take(key);
    if (!r) return;
    const section = document.createElement('div');
    section.className = `work-item-${key.replace(' ', '-')}`;
    if (key !== 'summary') {
      const h = document.createElement('h4');
      h.textContent = r.label;
      section.append(h);
    }
    section.append(...r.value.childNodes);
    card.append(section);
  });

  const prompts = document.createElement('div');
  prompts.className = 'work-item-prompts';
  rows.forEach(({ label, value }) => {
    if (value.querySelector('pre')) prompts.append(promptControl(label, value));
  });
  card.append(prompts);
  block.replaceChildren(card);
}

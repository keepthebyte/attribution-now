export default function decorate(block) {
  const ol = document.createElement('ol');
  [...block.children].forEach((row) => {
    const [date, lab, body] = row.children;
    const li = document.createElement('li');
    const meta = document.createElement('p');
    meta.className = 'changelog-meta';
    if (date) {
      const time = document.createElement('time');
      time.dateTime = date.textContent.trim();
      time.textContent = date.textContent.trim();
      meta.append(time);
    }
    if (lab) {
      meta.append(' · ');
      meta.append(...(lab.querySelector('p') || lab).childNodes);
    }
    li.append(meta);
    if (body) li.append(...body.childNodes);
    ol.append(li);
  });
  block.replaceChildren(ol);
}

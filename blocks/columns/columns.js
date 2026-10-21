/**
 * Audience fields: one column per audience, each on its own colour field.
 * Analysts (violet) come first unless the block has the `labs-first` option.
 * Authored per cell: an optional audience line, a heading, body, buttons, and optional link lines.
 * @param {Element} block The columns block
 */
function decorateAudiences(block) {
  block.parentElement.classList.add('columns-audiences-wrapper');
  const audiences = block.classList.contains('labs-first') ? ['labs', 'analysts'] : ['analysts', 'labs'];
  block.querySelectorAll(':scope > div > div').forEach((cell, i) => {
    cell.classList.add('columns-field', `field-${audiences[i % 2]}`);

    // the audience line becomes the first line of the heading (no labels above headings)
    const heading = cell.querySelector('h2, h3');
    const line = heading?.previousElementSibling;
    if (line?.tagName === 'P' && !line.querySelector('a') && line.textContent.trim()) {
      const span = document.createElement('span');
      span.className = 'columns-audience';
      span.textContent = line.textContent.trim();
      heading.prepend(span, ' ');
      line.remove();
    }

    // consecutive buttons share one row
    let actions;
    [...cell.children].forEach((child) => {
      if (child.classList.contains('button-wrapper')) {
        if (!actions) {
          actions = document.createElement('div');
          actions.className = 'columns-actions';
          child.before(actions);
        }
        actions.append(child);
      } else {
        actions = null;
      }
    });

    // "See your status: A · B · C": a label and a list of arrow links to the lab pages
    cell.querySelectorAll(':scope > p').forEach((p) => {
      const links = [...p.querySelectorAll('a')];
      if (links.length < 2 || !links.every((a) => new URL(a.href).pathname.startsWith('/labs/'))) return;
      const label = [...p.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent).join('').replace(/[·\s]+$/, '')
        .replace(/·/g, '')
        .trim();
      const list = document.createElement('ul');
      list.className = 'columns-links';
      links.forEach((a) => {
        a.classList.add('arrow-link');
        const li = document.createElement('li');
        li.append(a);
        list.append(li);
      });
      if (label) {
        const id = `columns-links-${Math.random().toString(36).slice(2, 8)}`;
        const labelEl = document.createElement('p');
        labelEl.className = 'columns-links-label';
        labelEl.id = id;
        labelEl.textContent = label;
        list.setAttribute('aria-labelledby', id);
        p.replaceWith(labelEl, list);
      } else {
        p.replaceWith(list);
      }
    });

    // a trailing line of plain links reads quieter
    const last = cell.lastElementChild;
    if (last?.tagName === 'P' && last.querySelector('a') && !last.classList.contains('button-wrapper')) {
      last.classList.add('columns-quiet');
    }
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('audiences')) decorateAudiences(block);
}

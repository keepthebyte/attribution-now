export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    [...row.children].forEach((col, i) => {
      col.className = ['lab-tiles-name', 'lab-tiles-works', 'lab-tiles-next'][i] || '';
      li.append(col);
    });
    ul.append(li);
  });
  block.replaceChildren(ul);
}

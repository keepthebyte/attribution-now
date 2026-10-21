/**
 * Table of contents: a list of in-page links, shown as a row of pills.
 * @param {Element} block The toc block element
 */
export default function decorate(block) {
  const list = block.querySelector('ul');
  if (!list) return;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'On this page');
  nav.append(list);
  block.replaceChildren(nav);
}

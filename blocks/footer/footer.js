import { getMetadata } from '../../scripts/aem.js';
import { brandMark } from '../../scripts/brand-mark.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.append(brandMark({ reversed: true }));
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // the first paragraph is the mission line
  footer.querySelector('p')?.classList.add('footer-mission');

  block.append(footer);
}

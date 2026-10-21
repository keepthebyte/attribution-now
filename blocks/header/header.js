import { getMetadata } from '../../scripts/aem.js';
import { brandMark } from '../../scripts/brand-mark.js';
import { loadFragment } from '../fragment/fragment.js';

// eight items and the mark need about 1000px; below that the nav sits behind a menu button
const isDesktop = window.matchMedia('(min-width: 1024px)');

/**
 * Opens or closes the mobile menu
 * @param {Element} nav The nav element
 * @param {boolean} [force] Open (true) or close (false); toggles when omitted
 */
function toggleMenu(nav, force) {
  const button = nav.querySelector('.nav-menu-button');
  const open = force ?? button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open && !isDesktop.matches));
  nav.classList.toggle('nav-open', open && !isDesktop.matches);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // nav fragment sections: brand, sections, tools (authors may omit any of them)
  const [brandSection, linksSection, toolsSection] = [...fragment.children];

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  // brand: mark + wordmark
  const brandSource = brandSection?.querySelector('a');
  const brand = document.createElement('a');
  brand.className = 'nav-brand';
  brand.href = brandSource?.getAttribute('href') || '/';
  brand.append(brandMark(), (brandSource?.textContent || 'attribution.now').trim());
  nav.append(brand);

  // menu button for narrow screens
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-menu-button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'nav-links');
  button.innerHTML = '<span class="nav-menu-icon" aria-hidden="true"></span>Menu';
  button.addEventListener('click', () => toggleMenu(nav));
  nav.append(button);

  // links: the authored list plus the tools as the last, emphasised item
  const list = document.createElement('ul');
  list.id = 'nav-links';
  list.className = 'nav-links';
  const items = [
    ...(linksSection?.querySelectorAll('li > a') || []),
  ].map((a) => ({ a, tool: false }));
  (toolsSection?.querySelectorAll('a') || []).forEach((a) => items.push({ a, tool: true }));
  items.forEach(({ a, tool }) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    if (tool) link.className = 'nav-tool';
    else if (link.pathname.startsWith('/labs/')) link.className = 'nav-lab';
    if (link.pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
    li.append(link);
    list.append(li);
  });
  nav.append(list);

  nav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      toggleMenu(nav, false);
      button.focus();
    }
  });
  nav.addEventListener('focusout', (e) => {
    if (!nav.contains(e.relatedTarget)) toggleMenu(nav, false);
  });
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

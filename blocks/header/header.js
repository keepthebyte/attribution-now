import { getMetadata } from '../../scripts/aem.js';
import { brandFix, brandMark } from '../../scripts/brand-mark.js';
import { loadFragment } from '../fragment/fragment.js';

// seven items (labs in a drop-down), the mark and "fix" need about 1080px;
// below that the nav sits behind a menu button
const isDesktop = window.matchMedia('(min-width: 1100px)');

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
 * Opens or closes one drop-down group
 * @param {Element} group The group's list item
 * @param {boolean} [force] Open (true) or close (false); toggles when omitted
 */
function toggleGroup(group, force) {
  const button = group.querySelector('button');
  const open = force ?? button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  group.classList.toggle('nav-group-open', open);
}

/**
 * One nav link, copied from the authored link
 * @param {Element} a The authored link
 * @param {boolean} [tool] The emphasised tool link
 * @returns {Element} The list item
 */
function navItem(a, tool = false) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = a.getAttribute('href');
  link.textContent = a.textContent.trim();
  if (tool) link.className = 'nav-tool';
  else if (link.pathname.startsWith('/labs/')) link.className = 'nav-lab';
  if (link.pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
  li.append(link);
  return li;
}

/**
 * A drop-down: the item's own text is the button, the nested list its links
 * @param {Element} item The authored list item
 * @param {Element} sub Its nested list
 * @param {number} index Used for the menu id
 * @returns {Element} The list item
 */
function navGroup(item, sub, index) {
  const li = document.createElement('li');
  li.className = 'nav-group';
  const menu = document.createElement('ul');
  menu.className = 'nav-group-menu';
  menu.id = `nav-group-${index + 1}`;
  [...sub.querySelectorAll(':scope > li > a')].forEach((a) => menu.append(navItem(a)));
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-group-button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', menu.id);
  button.textContent = [...item.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
  if (menu.querySelector('[aria-current]')) button.classList.add('nav-group-current');
  button.addEventListener('click', () => toggleGroup(li));
  li.append(button, menu);
  return li;
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
  const name = document.createElement('span');
  name.className = 'nav-brand-name';
  name.textContent = (brandSource?.textContent || 'attribution.now').trim();
  brand.append(brandMark(), brandFix(), name);
  nav.append(brand);

  // menu button for narrow screens
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-menu-button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'nav-links');
  button.innerHTML = '<span class="nav-menu-icon" aria-hidden="true"></span><span class="nav-menu-label">Menu</span>';
  button.addEventListener('click', () => toggleMenu(nav));
  nav.append(button);

  // links: the authored list plus the tools as the last, emphasised item;
  // an item with a nested list ("Results by lab") becomes a drop-down
  const list = document.createElement('ul');
  list.id = 'nav-links';
  list.className = 'nav-links';
  const groups = [];
  [...(linksSection?.querySelector('ul')?.children || [])].forEach((item) => {
    const sub = item.querySelector('ul');
    if (sub) {
      groups.push(navGroup(item, sub, groups.length));
      list.append(groups[groups.length - 1]);
    } else {
      const a = item.querySelector('a');
      if (a) list.append(navItem(a));
    }
  });
  (toolsSection?.querySelectorAll('a') || []).forEach((a) => list.append(navItem(a, true)));
  nav.append(list);

  const closeGroups = () => groups.forEach((g) => toggleGroup(g, false));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeGroups();
  });

  nav.addEventListener('keydown', (e) => {
    const openGroup = groups.find((g) => g.classList.contains('nav-group-open'));
    if (e.key === 'Escape' && openGroup) {
      toggleGroup(openGroup, false);
      openGroup.querySelector('button').focus();
      return;
    }
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      toggleMenu(nav, false);
      button.focus();
    }
  });
  nav.addEventListener('focusout', (e) => {
    groups.filter((g) => !g.contains(e.relatedTarget)).forEach((g) => toggleGroup(g, false));
    if (!nav.contains(e.relatedTarget)) toggleMenu(nav, false);
  });
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}

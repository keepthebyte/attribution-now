const SVG_NS = 'http://www.w3.org/2000/svg';
let count = 0;

function el(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/**
 * The two-dot mark: a violet and a pink dot that overlap in an ink lens.
 * @param {Object} [options]
 * @param {boolean} [options.reversed] Light variant for violet and ink grounds
 * @returns {SVGSVGElement} Decorative SVG (aria-hidden)
 */
// eslint-disable-next-line import/prefer-default-export
export function brandMark({ reversed = false } = {}) {
  count += 1;
  const clipId = `brand-mark-clip-${count}`;
  const svg = el('svg', {
    class: 'brand-mark', viewBox: '0 0 64 64', 'aria-hidden': 'true', focusable: 'false',
  });
  const defs = el('defs', {});
  const clip = el('clipPath', { id: clipId });
  clip.append(el('circle', { cx: 22, cy: 32, r: 15 }));
  defs.append(clip);
  const lens = el('g', { 'clip-path': `url(#${clipId})` });
  lens.append(el('circle', {
    class: 'lens', cx: 42, cy: 32, r: 15, fill: '#181527',
  }));
  svg.append(
    defs,
    el('circle', {
      cx: 22, cy: 32, r: 15, fill: reversed ? '#faf9fe' : '#5e2dc4',
    }),
    el('circle', {
      class: 'dot-b', cx: 42, cy: 32, r: 15, fill: reversed ? '#f893bc' : '#e13b86',
    }),
    lens,
  );
  return svg;
}

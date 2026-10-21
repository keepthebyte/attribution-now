const SVG_NS = 'http://www.w3.org/2000/svg';

// "fix" in Gochi Hand (SIL OFL 1.1), outlined so the header loads no extra font
const FIX_GLYPHS = 'M0 29.2Q-0.5 29.2-0.8 28.7Q-1 28.1-1 27.4Q-1 27.1-1 26.8Q-0.9 26.5-0.8 26.3Q-0.7 26.1-0.5 25.9Q-0.4 25.8-0.1 25.8Q0.6 25.8 1.5 25.7Q2.5 25.7 3.6 25.6Q4.1 25.5 4.2 25Q4.3 22.1 4.6 20.1Q5 18 5.4 16.6Q5.9 15.2 6.4 14.3Q7 13.4 7.7 13Q7.9 12.8 8.2 12.6Q8.5 12.5 8.8 12.5Q9.3 12.5 9.8 12.7Q10.3 13 10.8 13.3Q11.3 13.7 11.5 14.2Q11.8 14.7 11.8 15.2Q11.8 15.3 11.8 15.4Q11.7 15.5 11.6 15.6Q10.8 16.2 10.2 16.9Q9.6 17.6 9.2 18.6Q8.8 19.6 8.5 21.1Q8.3 22.5 8.1 24.5Q8.1 24.8 8.2 25Q8.3 25.1 8.6 25.1Q9.4 25.1 10.2 25Q10.9 24.9 11.6 24.8Q12.3 24.6 13 24.5Q13.6 24.4 14.1 24.4Q14.4 24.4 14.6 24.8Q14.8 25.2 14.8 25.8Q14.8 26.2 14.7 26.6Q14.6 26.9 14.5 27.2Q14.4 27.5 14.2 27.7Q14 27.9 13.7 28L8.5 28.5Q8.1 28.6 8 28.8Q7.9 29.1 7.9 29.6Q7.9 33.9 8.1 37Q8.4 40.1 8.6 42.3Q8.9 44.4 9.1 45.6Q9.3 46.8 9.3 47.4Q9.3 47.8 9 48.1Q8.7 48.4 8.2 48.7Q7.7 48.9 7.1 49Q6.5 49.2 6 49.2Q5.5 49.2 5.1 49Q4.7 48.8 4.7 48.4Q4.5 47.1 4.4 45.4Q4.2 43.8 4.1 41.8Q4 39.8 4 37.5Q4 35.1 4 32.3Q4 31.6 4 30.9Q4 30.2 4 29.6Q4 29 3.4 29L0 29.2ZM16.8 20.1Q16.2 20.1 15.7 19.9Q15.2 19.7 14.9 19.4Q14.5 19.1 14.3 18.7Q14.1 18.3 14.1 17.8Q14.1 17 14.7 16.5Q15.4 16 16.5 16Q17 16 17.5 16.2Q17.9 16.4 18.3 16.7Q18.7 17 18.9 17.4Q19.1 17.8 19.1 18.3Q19.1 19.1 18.5 19.6Q17.9 20.1 16.8 20.1ZM14.1 26Q14.1 25.4 14.7 24.9Q15.3 24.5 16.3 24.5Q18 24.5 18.2 25.7Q18.2 26.5 18.3 27.6Q18.4 28.6 18.5 29.8Q18.6 31 18.7 32.3Q18.7 33.5 18.8 34.7Q18.8 36 18.9 37.1Q18.9 38.2 18.9 39.2Q18.9 40.1 18.2 40.6Q17.5 41.1 16.2 41.1Q15.6 41.1 15.3 40.8Q14.9 40.5 14.9 40Q14.9 37.3 14.8 35Q14.7 32.6 14.5 30.8Q14.4 28.9 14.2 27.7Q14.1 26.5 14.1 26ZM23.1 23.5Q22.8 23.1 22.8 22.8Q22.7 22.5 22.7 22.4Q22.7 22 23 21.7Q23.3 21.3 23.7 21Q24.1 20.8 24.6 20.6Q25.1 20.4 25.5 20.4Q25.7 20.4 25.9 20.6Q26.2 20.7 26.6 21.4Q27.3 22.5 28 23.7Q28.8 24.9 29.6 26.1Q30 26.6 30.3 26.6Q30.7 26.6 31 26.2Q32.4 24.7 33.7 23.4Q35.1 22.2 36.4 21.4Q37.2 20.9 37.8 20.8Q38.3 20.6 38.5 20.6Q38.9 20.6 39.3 20.8Q39.7 21.1 40 21.4Q40.3 21.8 40.5 22.1Q40.7 22.5 40.7 22.8Q40.7 23.2 40.2 23.7Q39.6 24.1 38.6 24.7Q37.1 25.6 35.8 26.8Q34.5 28 33.2 29.4Q33 29.6 33 29.8Q32.9 29.9 32.9 30.1Q32.9 30.3 33 30.4Q33 30.6 33.2 30.8Q33.9 31.6 34.6 32.3Q35.4 33 36 33.5Q36.7 34 37.4 34.3Q38 34.6 38.6 34.6Q39 34.6 39.5 34.5Q40 34.4 40.4 34.4Q41 34.4 41.2 34.7Q41.4 35 41.4 35.6Q41.4 36.3 41.2 36.8Q41 37.3 40.6 37.6Q40.2 37.9 39.6 38.1Q39.1 38.3 38.5 38.3Q37.5 38.3 36.6 38Q35.6 37.7 34.6 37.1Q33.6 36.5 32.7 35.7Q31.7 34.9 30.8 34Q30.4 33.6 30.1 33.6Q29.7 33.6 29.4 34Q28.4 35.1 27.6 36.1Q26.7 37.1 25.9 37.9Q25.2 38.6 24.4 39Q23.7 39.5 23 39.5Q22.5 39.5 22.1 39.3Q21.7 39.1 21.5 38.8Q21.2 38.5 21.1 38.2Q21 37.9 21 37.6Q21 37.4 21.2 37.1Q21.3 36.9 21.7 36.6Q22.1 36.3 22.6 35.8Q23.1 35.4 23.7 34.8Q24.4 34.1 25.2 33.1Q26 32.1 27 30.9Q27.1 30.8 27.1 30.7Q27.2 30.5 27.2 30.4Q27.2 29.8 26.6 29Q25.4 27.3 24.5 25.8Q23.6 24.4 23.1 23.5Z';
let count = 0;

function el(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/**
 * The hand-written "fix" in front of the wordmark: a teacher's correction in pen,
 * tilted, with two quick underlines.
 * @returns {SVGSVGElement} Decorative SVG (aria-hidden)
 */
export function brandFix() {
  const svg = el('svg', {
    class: 'brand-fix', viewBox: '-5.5 8 51.5 53.5', 'aria-hidden': 'true', focusable: 'false',
  });
  const pen = el('g', { transform: 'rotate(-8 20 34)' });
  pen.append(
    el('path', { class: 'brand-fix-glyphs', d: FIX_GLYPHS }),
    el('path', { class: 'brand-fix-line', pathLength: 1, d: 'M0 52.5c9-1.5 24-2.3 41-1.4' }),
    el('path', { class: 'brand-fix-line', pathLength: 1, d: 'M5 57c8-1 19-1.5 30-.9' }),
  );
  svg.append(pen);
  return svg;
}

/**
 * The two-dot mark: a violet and a pink dot that overlap in an ink lens.
 * @param {Object} [options]
 * @param {boolean} [options.reversed] Light variant for violet and ink grounds
 * @returns {SVGSVGElement} Decorative SVG (aria-hidden)
 */
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

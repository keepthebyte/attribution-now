// Minimal templating for prompts/templates/*.md.
//   {{name}}                       value from the context
//   {{for each test}}...{{/for}}   repeated per entry of context.tests, one per line

const LOOP = /\{\{for each test\}\}([\s\S]*?)\{\{\/for\}\}/g;
const VAR = /\{\{([a-z_]+)\}\}/g;

function fill(text, ctx, name) {
  return text.replace(VAR, (match, key) => {
    const value = ctx[key];
    if (value === undefined || value === null || value === '') {
      throw new Error(`${name}: no value for {{${key}}}`);
    }
    return String(value);
  });
}

export function renderTemplate(template, ctx, name = 'template') {
  const out = fill(
    template.replace(LOOP, (match, inner) => (ctx.tests || []).map((t) => fill(inner, { ...ctx, ...t }, name)).join('\n')),
    ctx,
    name,
  );
  if (out.includes('{{')) throw new Error(`${name}: unfilled placeholder in output`);
  return out;
}

// Local preview of dist/ with the site code, approximating what EDS serves:
// head.html is injected, the metadata block becomes <meta> tags, /x.plain.html returns
// the main content (used for nav/footer fragments), and /t/* pages get the same
// server-echo JSON the Cloudflare worker injects.
//
//   npm run render && npm run preview   →  http://localhost:3000
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { echoJson, hitRecord, originPath } from '../worker/src/log.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const port = Number(process.env.PORT || 3000);
const headHtml = readFileSync(join(root, 'head.html'), 'utf8');
const TYPES = {
  '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.json': 'application/json', '.png': 'image/png',
};

function contentFile(pathname) {
  const clean = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const file = join(dist, `${clean === '/' ? '/index' : clean}.html`);
  return existsSync(file) ? file : null;
}

function split(html) {
  const main = html.match(/<main>([\s\S]*)<\/main>/)?.[1] || '';
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
  const meta = {};
  const content = main.replace(/<div class="metadata">([\s\S]*?)<\/div><\/div><\/div>/, (m) => {
    [...m.matchAll(/<div><div>([^<]*)<\/div><div>([^<]*)<\/div><\/div>/g)].forEach(([, k, v]) => {
      meta[k.toLowerCase()] = v;
    });
    return '';
  });
  return { title, meta, content };
}

function fullPage(html, extraHead = '') {
  const { title, meta, content } = split(html);
  const tags = Object.entries(meta)
    .filter(([k]) => k !== 'title')
    .map(([k, v]) => `<meta name="${k}" content="${v}">`)
    .join('\n');
  return `<!DOCTYPE html><html><head><title>${meta.title || title}</title>\n${tags}\n${headHtml}${extraHead}</head>
<body><header></header><main>${content}</main><footer></footer></body></html>`;
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const send = (status, body, type = 'text/html; charset=utf-8') => {
    res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(body);
  };
  if (url.pathname === '/t/beacon') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => { console.log('beacon', body); send(204, ''); });
    return;
  }
  if (url.pathname.endsWith('.plain.html')) {
    const file = contentFile(url.pathname.replace(/\.plain\.html$/, ''));
    if (file) send(200, split(readFileSync(file, 'utf8')).content);
    else send(404, 'Not found');
    return;
  }
  const isTarget = url.pathname.startsWith('/t/');
  const file = contentFile(isTarget ? originPath(url.pathname) : url.pathname);
  if (file) {
    let extra = '';
    if (isTarget) {
      const headers = new Headers(Object.entries(req.headers).map(([k, v]) => [k, String(v)]));
      const record = hitRecord(new Request(url, { headers }), randomUUID());
      console.log('hit', record.path, record.query, record.referer);
      extra = `<script type="application/json" id="server-echo">${echoJson(record)}</script>`;
    }
    send(200, fullPage(readFileSync(file, 'utf8'), extra));
    return;
  }
  const asset = join(root, normalize(url.pathname).replace(/^(\.\.[/\\])+/, ''));
  if (asset.startsWith(root) && existsSync(asset) && statSync(asset).isFile()) {
    send(200, readFileSync(asset), TYPES[extname(asset)] || 'application/octet-stream');
    return;
  }
  send(404, fullPage(readFileSync(join(root, '404.html'), 'utf8').replace(/[\s\S]*/, '<main><div><h1>Not found</h1></div></main>')));
}).listen(port, () => console.log(`Preview on http://localhost:${port}`));

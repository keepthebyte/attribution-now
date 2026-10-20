// Shows what arrived with the visit. Server-side values are injected by the Cloudflare
// worker as <script type="application/json" id="server-echo">; fragments never reach a
// server, so the page also beacons document.referrer, query and hash to /t/beacon.

function serverEcho() {
  const el = document.getElementById('server-echo');
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

function value(text) {
  const code = document.createElement('code');
  code.textContent = text || '(none)';
  return code;
}

function sendBeacon(server) {
  if (!server?.hit || !navigator.sendBeacon) return;
  const payload = JSON.stringify({
    hit: server.hit,
    path: window.location.pathname,
    document_referrer: document.referrer,
    search: window.location.search,
    hash: window.location.hash,
  });
  navigator.sendBeacon('/t/beacon', new Blob([payload], { type: 'application/json' }));
}

export default function decorate(block) {
  const heading = block.textContent.trim() || 'What this page received';
  const server = serverEcho();
  const params = new URLSearchParams(window.location.search);
  const utm = [...params.keys()].filter((k) => k.toLowerCase().startsWith('utm_'));

  const rows = [
    ['Referer (server)', server ? server.referer : 'not available on this host'],
    ['document.referrer', document.referrer],
    ['utm_source', params.get('utm_source')],
    ['Other utm_* parameters', utm.filter((k) => k !== 'utm_source').map((k) => `${k}=${params.get(k)}`).join('&')],
    ['Query string', window.location.search],
    ['Fragment', window.location.hash],
    ['Sec-Fetch-Site', server?.sec_fetch_site],
    ['User agent', navigator.userAgent],
  ];

  const h = document.createElement('h2');
  h.textContent = heading;
  const dl = document.createElement('dl');
  rows.forEach(([label, v]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.append(value(v));
    dl.append(dt, dd);
  });
  const note = document.createElement('p');
  note.className = 'test-echo-note';
  note.textContent = server
    ? `Logged as hit ${server.hit}. No IP address is stored.`
    : 'The server-side referrer is only shown on attribution.now.';
  block.replaceChildren(h, dl, note);
  sendBeacon(server);
}

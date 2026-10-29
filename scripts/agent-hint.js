// Detects hosted (cloud) browsers such as Meta Muse. Chrome on Linux always claims
// "Linux x86_64" in its UA, so the signal is the real CPU (Client Hints) plus a
// software GPU: real ARM Linux desktops (Pi, Asahi, Snapdragon) have a hardware GPU.
// RUM only ever gets the short label from cloudBrowserHint(); the raw values from
// probe() are shown and logged on /t/ test pages only.

const SOFTWARE_GPU = /swiftshader|llvmpipe|softpipe/i;

function gpuRenderer() {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return null;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return renderer;
  } catch {
    return null;
  }
}

async function highEntropy(hints) {
  if (!navigator.userAgentData?.getHighEntropyValues) return {};
  try {
    return await navigator.userAgentData.getHighEntropyValues(hints);
  } catch {
    return {};
  }
}

/**
 * Label for a set of browser values, or null for an ordinary browser.
 * `renderer` is null when WebGL is unavailable.
 */
export function label({ userAgent, architecture, renderer }) {
  if (!/Linux x86_64/.test(userAgent || '') || architecture !== 'arm') return null;
  if (renderer === null) return 'arm-nogpu';
  return SOFTWARE_GPU.test(renderer) ? 'arm-software-gpu' : null;
}

/** Cheap check for RUM: nearly every visitor stops before WebGL is touched. */
export async function cloudBrowserHint() {
  const { userAgent } = navigator;
  if (!/Linux x86_64/.test(userAgent) || !navigator.userAgentData) return null;
  const { architecture } = await highEntropy(['architecture']);
  if (architecture !== 'arm') return null;
  return label({ userAgent, architecture, renderer: gpuRenderer() });
}

/** Full set of values for the /t/ echo page. */
export async function probe() {
  const he = await highEntropy(['architecture', 'bitness', 'platformVersion', 'model', 'fullVersionList']);
  const values = {
    userAgent: navigator.userAgent,
    architecture: he.architecture ?? null,
    bitness: he.bitness ?? null,
    platform: navigator.userAgentData?.platform ?? navigator.platform ?? null,
    platformVersion: he.platformVersion ?? null,
    model: he.model ?? null,
    brands: he.fullVersionList?.map((b) => `${b.brand} ${b.version}`).join(', ') ?? null,
    renderer: gpuRenderer(),
    webdriver: navigator.webdriver ?? null,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: (navigator.languages || []).join(', '),
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    deviceMemory: navigator.deviceMemory ?? null,
    maxTouchPoints: navigator.maxTouchPoints ?? null,
  };
  return { values, label: label(values) };
}

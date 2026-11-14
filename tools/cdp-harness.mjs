#!/usr/bin/env node
/**
 * Harnais CDP minimal pour valider le portfolio - AUCUNE dependance npm
 * (WebSocket global de Node 22 + chrome-headless-shell de Playwright).
 *
 *   node tools/cdp-harness.mjs --url http://localhost:8731/index.html \
 *        --w 1440 --h 900 --dpr 1 --wait 3000 \
 *        --evalfile /tmp/mesure.js --shot /tmp/capture.png \
 *        --profile /tmp/profil.json --out /tmp/resultat.json
 *
 * Options :
 *   --url URL        page a ouvrir
 *   --w --h --dpr    viewport CSS et devicePixelRatio (Emulation.setDeviceMetricsOverride)
 *   --wait MS        attente apres chargement avant l'evaluation
 *   --evalfile PATH  expression JS (IIFE async autorisee), awaitPromise + returnByValue
 *   --shot PATH      capture PNG (composite, filtres CSS inclus)
 *   --profile PATH   profil CPU CDP (.cpuprofile)
 *   --media A=B,...  emule des media features (ex. prefers-reduced-motion=reduce)
 *   --out PATH       ecrit le resultat JSON complet (preferer --out : stdout est tronque a 64 KB)
 *   --port N         port de debogage (defaut aleatoire)
 *
 * CHROME_PATH permet de forcer le binaire Chrome/Chromium.
 *
 * Exemple type (etat gele pour comparer deux versions) :
 *   const L = window.__lava;                                   // hook de debug de la lampe a lave
 *   Object.defineProperty(document,'hidden',{get:()=>true});    // arrete la boucle rAF
 *   L.restore(ETAT); L.simTime = 61.92; L.render();             // etat identique + un rendu
 */
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
function arg(name, def = null) {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : def;
}
const has = (name) => argv.includes('--' + name);

const URL_ = arg('url');
const W = parseInt(arg('w', '1440'), 10);
const H = parseInt(arg('h', '900'), 10);
const DPR = parseFloat(arg('dpr', '1'));
const WAIT = parseInt(arg('wait', '3000'), 10);
const EVALFILE = arg('evalfile');
const SHOT = arg('shot');
const PROFILE = arg('profile');
const OUT = arg('out');
const PORT = parseInt(arg('port', String(9300 + Math.floor(Math.random() * 400))), 10);

const CHROME = process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell';
const profileDir = mkdtempSync(join(tmpdir(), 'cdpprof-'));

const chromeArgs = [
  '--headless',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--enable-unsafe-swiftshader',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  '--hide-scrollbars',
  '--mute-audio',
  `--window-size=${W},${H}`,
  `--user-data-dir=${profileDir}`,
  `--remote-debugging-port=${PORT}`,
  '--remote-allow-origins=*',
  'about:blank',
];

const child = spawn(CHROME, chromeArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
let chromeErr = '';
child.stderr.on('data', (d) => { chromeErr += d.toString(); });

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForVersion() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return await r.json();
    } catch { /* not ready */ }
    await sleep(250);
  }
  throw new Error('Chrome did not start.\n' + chromeErr.slice(-2000));
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id != null) {
        const p = this.pending.get(msg.id);
        if (p) { this.pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result); }
      } else { this.events.push(msg); }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('CDP timeout: ' + method)); } }, 900000);
    });
  }
}

async function main() {
  await waitForVersion();
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  if (!page) throw new Error('no page target: ' + JSON.stringify(targets));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable').catch(() => {});
  const MEDIA = arg('media');
  if (MEDIA) {
    await cdp.send('Emulation.setEmulatedMedia', { features: MEDIA.split(',').map((f) => {
      const [name, value] = f.split('='); return { name, value };
    }) });
  }
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: W, height: H, deviceScaleFactor: DPR, mobile: false,
  });

  const result = {};
  if (PROFILE) {
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  }
  if (URL_) {
    await cdp.send('Page.navigate', { url: URL_ });
    // wait for load event
    const t0 = Date.now();
    while (Date.now() - t0 < 60000) {
      const r = await cdp.send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
      if (r.result.value === 'complete') break;
      await sleep(200);
    }
  }
  if (WAIT) await sleep(WAIT);

  if (PROFILE) await cdp.send('Profiler.start');

  if (EVALFILE) {
    const expr = readFileSync(EVALFILE, 'utf8');
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr, awaitPromise: true, returnByValue: true, allowUnsafeEvalBlockedByCSP: true,
    }, );
    if (r.exceptionDetails) {
      result.error = r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails);
      result.errorStack = r.exceptionDetails.stackTrace;
    } else {
      result.eval = r.result.value;
    }
  }

  if (PROFILE) {
    const prof = await cdp.send('Profiler.stop');
    writeFileSync(PROFILE, JSON.stringify(prof.profile));
  }

  if (SHOT) {
    const s = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    writeFileSync(SHOT, Buffer.from(s.data, 'base64'));
  }

  // console messages
  result.console = cdp.events.filter((e) => e.method === 'Runtime.consoleAPICalled')
    .map((e) => e.params.args.map((a) => a.value ?? a.description ?? a.type).join(' '))
    .slice(0, 40);
  result.exceptions = cdp.events.filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text).slice(0, 20);

  const text = JSON.stringify(result, null, 1);
  if (OUT) writeFileSync(OUT, text);
  process.stdout.write(text + '\n');

  ws.close();
  child.kill('SIGKILL');
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => {
  console.error('HARNESS ERROR:', e.message);
  child.kill('SIGKILL');
  process.exit(1);
});

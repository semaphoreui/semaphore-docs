import http from 'node:http';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';
import httpProxy from 'http-proxy';

const require = createRequire(import.meta.url);
const siteDir = fileURLToPath(new URL('../', import.meta.url));
const {values, tokens} = parseArgs({
  options: {
    port: {type: 'string', default: '3000'},
    host: {type: 'string', default: 'localhost'},
    locale: {type: 'string'},
    'no-open': {type: 'boolean'},
  },
  strict: false,
  allowPositionals: true,
  tokens: true,
});

if (values.locale || values.help) {
  process.env.DOCUSAURUS_GENERATED_FILES_DIR_NAME ??=
    `.docusaurus-dev/${encodeURIComponent(values.locale || 'en')}`;
  process.argv.splice(2, 0, 'start');
  await import('@docusaurus/core/bin/docusaurus.mjs');
} else {
  const {loadSiteConfig} = require('@docusaurus/core/lib/server/config');
  const {siteConfig} = await loadSiteConfig({siteDir});
  const {baseUrl, i18n} = siteConfig;
  const children = new Set();
  const backends = new Map();
  const proxy = httpProxy.createProxyServer({ws: true});
  const consumed = new Set();
  for (const token of tokens) {
    if (token.kind === 'option' && ['port', 'host', 'no-open'].includes(token.name)) {
      consumed.add(token.index);
      if (token.value !== undefined && !token.inlineValue) consumed.add(token.index + 1);
    }
  }
  const forwardedArgs = process.argv.slice(2).filter((_, index) => !consumed.has(index));

  function localeFor(url) {
    const pathname = new URL(url, 'http://localhost').pathname;
    const segment = pathname.startsWith(baseUrl) ? pathname.slice(baseUrl.length).split('/')[0] : '';
    return i18n.locales.includes(segment) ? segment : i18n.defaultLocale;
  }

  async function startLocale(locale) {
    // Allocate an internal port; only the proxy's port is used in the browser.
    const reservation = net.createServer();
    await new Promise((resolve, reject) => {
      reservation.once('error', reject);
      reservation.listen(0, '127.0.0.1', resolve);
    });
    const port = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));
    console.log(`[docs] Starting ${locale}…`);
    const child = spawn(process.execPath, [
      require.resolve('@docusaurus/core/bin/docusaurus.mjs'), 'start',
      ...forwardedArgs, '--locale', locale, '--host', '127.0.0.1', '--port', String(port), '--no-open',
    ], {
      cwd: siteDir,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: {
        ...process.env,
        DOCUSAURUS_GENERATED_FILES_DIR_NAME: `.docusaurus-dev/proxy-${values.port}/${locale}`,
        SEMAPHORE_DOCS_DEV_PROXY: 'true',
      },
    });
    children.add(child);
    let exited = false;
    child.once('exit', (code, signal) => {
      console.log(`[docs] ${locale} stopped (${signal || code}).`);
      exited = true;
      children.delete(child);
      backends.delete(locale);
    });
    child.once('error', () => { exited = true; });
    const deadline = Date.now() + 120_000;
    while (!exited && Date.now() < deadline) {
      const ready = await new Promise((resolve) => {
        const socket = net.connect(port, '127.0.0.1');
        socket.once('connect', () => { socket.destroy(); resolve(true); });
        socket.once('error', () => { socket.destroy(); resolve(false); });
      });
      if (ready) return `http://127.0.0.1:${port}`;
      await delay(100);
    }
    child.kill();
    throw new Error(`Could not start locale ${locale}`);
  }

  function backend(url) {
    const locale = localeFor(url);
    if (!backends.has(locale)) {
      backends.set(locale, startLocale(locale).catch((error) => {
        backends.delete(locale);
        throw error;
      }));
    }
    return backends.get(locale);
  }

  function fail(error, response) {
    console.error(`[docs] ${error.message}`);
    if (response.writeHead && !response.headersSent) response.writeHead(502);
    response.end('Documentation dev server failed. See terminal output.');
  }
  proxy.on('error', (error, _request, response) => fail(error, response));
  const server = http.createServer(async (request, response) => {
    if (request.url === '/') {
      response.writeHead(302, {Location: baseUrl});
      response.end();
      return;
    }
    try {
      const target = await backend(request.url);
      if (!response.destroyed) proxy.web(request, response, {target});
    } catch (error) { fail(error, response); }
  });
  server.on('upgrade', async (request, socket, head) => {
    try {
      const target = await backend(request.url);
      if (!socket.destroyed) proxy.ws(request, socket, head, {target});
    } catch (error) { fail(error, socket); }
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      for (const child of children) child.kill('SIGTERM');
      proxy.close();
      server.close();
      process.exit(0);
    });
  }
  server.on('error', (error) => {
    console.error(`[docs] ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(Number(values.port), values.host, () => {
    const url = `http://${values.host}:${server.address().port}${baseUrl}`;
    console.log(`[docs] All languages: ${url}`);
    console.log('[docs] Each language compiles on its first visit.');
    if (!values['no-open']) require('react-dev-utils/openBrowser')(url);
  });
}

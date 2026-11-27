import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {
  POPPY_PATH, QUESTION, SKILL_MARKER, SKILL_NAME, SKILL_PATH, TASKS_PATH, THANKS, NO_HUMAN, b64uEncode, handlePoppy,
  handleTasks, isPoppyPath, jwkThumbprint, poppyDocument, publicHttpsUrl, skillDocument, tasksDocument, versionSupported,
} from '../worker/src/poppy.mjs';
import { d1Store } from '../worker/src/poppy-store.mjs';

const ORIGIN = 'https://attribution.now';
const ENDPOINT = `${ORIGIN}${POPPY_PATH}`;
const CLIENT = 'https://agent.example/poppy/client.json';
const JWKS = 'https://agent.example/poppy/jwks.json';
const NOW = new Date('2026-11-17T06:00:00Z');
const SECONDS = Math.floor(NOW.getTime() / 1000);

/** The real migration on an in-memory SQLite, behind the small part of the D1 API we use. */
function d1() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../worker/migrations/0005_poppy.sql', import.meta.url), 'utf8'));
  const prepare = (sql, values = []) => ({
    bind: (...v) => prepare(sql, v),
    first: async () => db.prepare(sql).get(...values) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...values) }),
    run: async () => db.prepare(sql).run(...values),
  });
  return {
    prepare,
    batch: async (statements) => {
      db.exec('BEGIN');
      try {
        // eslint-disable-next-line no-restricted-syntax, no-await-in-loop
        for (const s of statements) await s.run();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    raw: db,
  };
}

const enc = (obj) => b64uEncode(new TextEncoder().encode(JSON.stringify(obj)));
async function sign(header, payload, privateKey, params) {
  const head = `${enc(header)}.${enc(payload)}`;
  const sig = await crypto.subtle.sign(params, privateKey, new TextEncoder().encode(head));
  return `${head}.${b64uEncode(sig)}`;
}
const ES256 = { name: 'ECDSA', hash: 'SHA-256' };
const ecKey = () => crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);

/** A personal agent: a client key published at its jwks_uri and a delegated session key. */
async function personalAgent({ rsa = false } = {}) {
  const root = rsa
    ? await crypto.subtle.generateKey({
      name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-384',
    }, true, ['sign', 'verify'])
    : await ecKey();
  const rootJwk = { ...(await crypto.subtle.exportKey('jwk', root.publicKey)), kid: 'root-1', use: 'sig' };
  const delegated = await ecKey();
  const delegatedJwk = await crypto.subtle.exportKey('jwk', delegated.publicKey);
  const cnf = {
    kty: 'EC', crv: 'P-256', x: delegatedJwk.x, y: delegatedJwk.y,
  };
  const delegation = (claims = {}, header = {}) => sign(
    {
      typ: 'poppy-delegation+jwt', alg: rsa ? 'PS384' : 'ES256', kid: 'root-1', ...header,
    },
    {
      iss: CLIENT, cnf: { jwk: cnf }, iat: SECONDS - 3600, exp: SECONDS + 3600, jti: crypto.randomUUID(), ...claims,
    },
    root.privateKey,
    rsa ? { name: 'RSA-PSS', saltLength: 48 } : ES256,
  );
  const fetched = [];
  const fetcher = async (url, init) => {
    fetched.push(url);
    assert.equal(init.redirect, 'manual');
    if (url === CLIENT) return Response.json({ client_id: CLIENT, client_name: 'Test agent', jwks_uri: JWKS });
    if (url === JWKS) return Response.json({ keys: [rootJwk] });
    return new Response('no', { status: 404 });
  };
  const session = async (method, url, { claims = {}, header = {}, dlg } = {}) => sign(
    {
      typ: 'poppy-session+jwt', alg: 'ES256', kid: await jwkThumbprint(cnf), poppy_dlg: dlg ?? await delegation(), ...header,
    },
    {
      iss: CLIENT, aud: ORIGIN, sid: 'sid-1', sub: 'user-1', agent_id: 'muse-test', htm: method, htu: url.split('?')[0], iat: SECONDS, jti: crypto.randomUUID(), ...claims,
    },
    delegated.privateKey,
    ES256,
  );
  return {
    root, delegated, delegation, fetcher, fetched, session,
  };
}

const say = (id, text) => ({ id, message: { author: { type: 'agent' }, text } });

/** Send one request as the agent; `opts.token` overrides the Session JWT. */
async function call(agent, store, method, url, body, opts = {}) {
  const headers = { 'poppy-version': '1.0', ...(opts.headers || {}) };
  const token = opts.token !== undefined ? opts.token : await agent.session(method, url, opts.session);
  if (token) headers['poppy-session'] = token;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const request = new Request(url, {
    method, headers, body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
  });
  return handlePoppy(request, {
    store, audience: ORIGIN, fetcher: agent.fetcher, now: NOW, cache: opts.cache, sleep: opts.sleep ?? (async () => {}),
  });
}

test('poppy.json is a valid 1.0 document for the serving host', () => {
  const doc = poppyDocument(ORIGIN);
  assert.equal(doc.protocol_version, '1.0');
  assert.deepEqual(doc.organization, { name: 'attribution.now', domain: 'attribution.now' });
  const [entry] = doc.agent.protocols;
  assert.equal(entry.type, 'poppy');
  assert.equal(entry.endpoint, ENDPOINT);
  assert.match(entry.description, /how you discovered the site/);
  assert.equal(doc.auth, undefined);
  assert.equal(isPoppyPath(POPPY_PATH), true);
  assert.equal(isPoppyPath(`${POPPY_PATH}/cnv_1/events`), true);
  assert.equal(isPoppyPath('/poppy/conversationsx'), false);
});

test('version and URL checks', () => {
  assert.equal(versionSupported('1.0'), true);
  assert.equal(versionSupported('1.7'), true);
  assert.equal(versionSupported('0.4'), false);
  assert.equal(versionSupported('2.0'), false);
  assert.equal(versionSupported(null), false);
  assert.ok(publicHttpsUrl('https://muse.ai/client.json'));
  ['http://muse.ai/x', 'https://localhost/x', 'https://127.0.0.1/x', 'https://[::1]/x', 'https://box.internal/x',
    'https://u:p@muse.ai/x', 'nonsense'].forEach((u) => assert.equal(publicHttpsUrl(u), null, u));
});

test('a first message opens a conversation and the agent asks how the site was discovered', async () => {
  const agent = await personalAgent();
  const store = d1Store(d1());
  const res = await call(agent, store, 'POST', `${ENDPOINT}?wait=20`, say('req-1', 'Hello'));
  assert.equal(res.status, 201);
  const { body } = res;
  assert.match(body.conversation_id, /^cnv_/);
  assert.equal(body.events.length, 2);
  const [mine, reply] = body.events;
  assert.deepEqual(mine.message, {
    id: 'req-1', role: 'user', author: { type: 'agent' }, text: 'Hello',
  });
  assert.equal(reply.type, 'message');
  assert.equal(reply.message.role, 'company');
  assert.equal(reply.message.author.type, 'agent');
  assert.equal(reply.message.as_of_request, 'req-1');
  assert.equal(reply.message.text, QUESTION);
  assert.match(QUESTION, /how did you discover/);
  assert.equal(body.cursor, reply.id);
  assert.deepEqual([body.has_more, body.working, body.handoff, body.responder, body.closed], [false, false, 'none', 'agent', false]);
  assert.equal(res.info.verified, 1);
  assert.equal(res.info.client_id, CLIENT);
  assert.equal(res.info.agent_id, 'muse-test');
  assert.equal(res.info.text, 'Hello');
  assert.deepEqual(agent.fetched, [CLIENT, JWKS]);
});

test('without wait a POST returns only the conversation id; events are read separately', async () => {
  const agent = await personalAgent();
  const store = d1Store(d1());
  const created = await call(agent, store, 'POST', ENDPOINT, say('req-1', 'Hello'));
  assert.equal(created.status, 201);
  assert.deepEqual(Object.keys(created.body), ['conversation_id']);
  const id = created.body.conversation_id;

  const read = await call(agent, store, 'GET', `${ENDPOINT}/${id}/events`);
  assert.equal(read.status, 200);
  assert.equal(read.body.events.length, 2);

  const answer = await call(agent, store, 'POST', `${ENDPOINT}/${id}/messages`, say('req-2', 'My user pasted the URL.'));
  assert.equal(answer.status, 202);
  assert.deepEqual(answer.body, { conversation_id: id });

  const after = await call(agent, store, 'GET', `${ENDPOINT}/${id}/events?cursor=${read.body.cursor}`);
  assert.deepEqual(after.body.events.map((e) => e.message.text), ['My user pasted the URL.', THANKS]);

  let slept = null;
  const idle = await call(agent, store, 'GET', `${ENDPOINT}/${id}/events?cursor=${after.body.cursor}&wait=30`, undefined, {
    sleep: async (ms) => { slept = ms; },
  });
  assert.deepEqual(idle.body.events, []);
  assert.equal(idle.body.cursor, after.body.cursor);
  assert.equal(slept, 10000);

  const bad = await call(agent, store, 'GET', `${ENDPOINT}/${id}/events?cursor=evt_nope`);
  assert.deepEqual([bad.status, bad.body.error], [400, 'invalid_cursor']);
});

test('a replayed request id returns the first answer, a reused one conflicts', async () => {
  const agent = await personalAgent();
  const db = d1();
  const store = d1Store(db);
  const first = await call(agent, store, 'POST', ENDPOINT, say('req-1', 'Hello'));
  const again = await call(agent, store, 'POST', `${ENDPOINT}?wait=5`, say('req-1', 'Hello'));
  assert.equal(again.status, 201);
  assert.equal(again.body.conversation_id, first.body.conversation_id);
  assert.equal(again.body.events.length, 2);
  assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM poppy_conversations').get().n, 1);

  const reused = await call(agent, store, 'POST', ENDPOINT, say('req-1', 'Something else'));
  assert.deepEqual([reused.status, reused.body.error], [409, 'request_id_conflict']);
  const elsewhere = await call(agent, store, 'POST', `${ENDPOINT}/${first.body.conversation_id}/messages`, say('req-1', 'Hello'));
  assert.equal(elsewhere.body.error, 'request_id_conflict');
});

test('close, handoff and messages after close', async () => {
  const agent = await personalAgent();
  const store = d1Store(d1());
  const { body: { conversation_id: id } } = await call(agent, store, 'POST', ENDPOINT, say('req-1', 'Hello'));

  const handoff = await call(agent, store, 'POST', `${ENDPOINT}/${id}/handoff?wait=1`, { id: 'req-2' });
  assert.equal(handoff.status, 202);
  assert.equal(handoff.body.events.at(-1).message.text, NO_HUMAN);
  assert.equal(handoff.body.handoff, 'none');
  assert.equal((await call(agent, store, 'POST', `${ENDPOINT}/${id}/handoff/cancel`, { id: 'req-3' })).status, 202);

  const closed = await call(agent, store, 'POST', `${ENDPOINT}/${id}/close?wait=1`, { id: 'req-4' });
  assert.equal(closed.status, 202);
  assert.equal(closed.body.closed, true);
  assert.deepEqual(
    (({ type, handoff: h, responder, closed: c }) => [type, h, responder, c])(closed.body.events.at(-1)),
    ['state', 'none', 'agent', true],
  );
  const late = await call(agent, store, 'POST', `${ENDPOINT}/${id}/messages`, say('req-5', 'Still there?'));
  assert.deepEqual([late.status, late.body.error], [409, 'conversation_closed']);
  assert.equal((await call(agent, store, 'POST', `${ENDPOINT}/${id}/close`, { id: 'req-6' })).status, 202);
});

test('a conversation belongs to the client and user that started it', async () => {
  const agent = await personalAgent();
  const store = d1Store(d1());
  const { body: { conversation_id: id } } = await call(agent, store, 'POST', ENDPOINT, say('req-1', 'Hello'));
  const other = await call(agent, store, 'GET', `${ENDPOINT}/${id}/events`, undefined, { session: { claims: { sub: 'user-2' } } });
  assert.deepEqual([other.status, other.body.error], [404, 'conversation_not_found']);
  // another Session of the same user continues it
  const same = await call(agent, store, 'GET', `${ENDPOINT}/${id}/events`, undefined, { session: { claims: { sid: 'sid-2' } } });
  assert.equal(same.status, 200);
  const missing = await call(agent, store, 'GET', `${ENDPOINT}/cnv_missing/events`);
  assert.equal(missing.body.error, 'conversation_not_found');
});

test('request validation', async () => {
  const agent = await personalAgent();
  const store = d1Store(d1());
  const cases = [
    ['not json', /JSON/],
    [{ message: { author: { type: 'agent' }, text: 'x' } }, /id must/],
    [{ id: 'has space', message: { author: { type: 'agent' }, text: 'x' } }, /id must/],
    [{ id: 'a' }, /message is missing/],
    [{ id: 'a', message: { text: 'x' } }, /author\.type/],
    [{ id: 'a', message: { author: { type: 'agent' } } }, /needs text/],
    [{ id: 'a', parent_conversation_id: 'cnv_1', message: { author: { type: 'human' }, text: 'x' } }, /Direct/],
  ];
  // eslint-disable-next-line no-restricted-syntax
  for (const [body, why] of cases) {
    // eslint-disable-next-line no-await-in-loop
    const res = await call(agent, store, 'POST', ENDPOINT, body);
    assert.deepEqual([res.status, res.body.error], [400, 'invalid_request'], JSON.stringify(body));
    assert.match(res.body.error_description, why);
  }
  const version = await call(agent, store, 'POST', ENDPOINT, say('a', 'x'), { headers: { 'poppy-version': '0.4' } });
  assert.deepEqual([version.status, version.body.error], [400, 'version_unsupported']);
  const method = await call(agent, store, 'GET', ENDPOINT);
  assert.equal(method.status, 405);
});

test('the Session JWT is verified before anything is stored', async () => {
  const agent = await personalAgent();
  const stranger = await personalAgent();
  const db = d1();
  const store = d1Store(db);
  const url = ENDPOINT;
  const directKid = 'root-1';
  const cases = {
    'header is missing': { token: null },
    'not a compact JWS': { token: 'abc' },
    'audience is not': { session: { claims: { aud: 'https://attribution.now/' } } },
    'htm differs': { session: { claims: { htm: 'GET' } } },
    'htu differs': { session: { claims: { htu: `${ENDPOINT}/other` } } },
    'iat is outside': { session: { claims: { iat: SECONDS - 600 } } },
    'lacks sid, sub or jti': { session: { claims: { sub: '' } } },
    'ath but no access token': { session: { claims: { ath: 'abc' } } },
    'typ is wrong': { session: { header: { typ: 'JWT' } } },
    'alg is not ES256': { session: { header: { alg: 'PS384' } } },
    'thumbprint': { session: { header: { kid: 'wrong' } } },
    'no delegation': { session: { header: { poppy_dlg: undefined, kid: directKid } } },
    'has expired': { session: { dlg: await agent.delegation({ exp: SECONDS - 1 }) } },
    'longer than 24 hours': { session: { dlg: await agent.delegation({ iat: SECONDS - 10, exp: SECONDS + 90000 }) } },
    'issuer differs': { session: { dlg: await agent.delegation({ iss: 'https://other.example/c.json' }) } },
    'kid is not in the client keys': { session: { dlg: await agent.delegation({}, { kid: 'root-2' }) } },
    // a delegation signed by someone else's key, for our key
    'signature does not verify': { session: { dlg: await stranger.delegation({ cnf: (JSON.parse(atob((await agent.delegation()).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))).cnf }) } },
    'not a public HTTPS URL': { session: { claims: { iss: 'https://localhost/c.json' }, dlg: await agent.delegation({ iss: 'https://localhost/c.json' }) } },
  };
  // eslint-disable-next-line no-restricted-syntax
  for (const [why, opts] of Object.entries(cases)) {
    // eslint-disable-next-line no-await-in-loop
    const res = await call(agent, store, 'POST', url, say('req-1', 'Hello'), opts);
    assert.deepEqual([res.status, res.body.error], [400, 'invalid_session'], why);
    assert.match(res.body.error_description, new RegExp(why), why);
    assert.equal(res.info.verified, 0);
  }
  // a session token signed by another key than the delegated one
  const forged = await stranger.session('POST', url, { dlg: await agent.delegation() });
  const res = await call(agent, store, 'POST', url, say('req-1', 'Hello'), { token: forged });
  assert.match(res.body.error_description, /signature does not verify/);
  assert.equal(res.info.client_id, CLIENT);
  assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM poppy_conversations').get().n, 0);
});

test('client metadata must name itself and keep its keys on its own domain', async () => {
  const agent = await personalAgent();
  const store = d1Store(d1());
  const serve = (metadata, status = 200) => ({
    ...agent,
    fetcher: async (u) => (u === CLIENT ? Response.json(metadata, { status }) : agent.fetcher(u, { redirect: 'manual' })),
  });
  const cases = [
    [serve({ client_id: 'https://agent.example/other.json', jwks_uri: JWKS }), /client_id differs/],
    [serve({ client_id: CLIENT, jwks_uri: 'https://keys.elsewhere.example/jwks.json' }), /jwks_uri/],
    [serve({ client_id: CLIENT, jwks_uri: 'http://agent.example/jwks.json' }), /jwks_uri/],
    [serve({}, 302), /answered 302/],
  ];
  // eslint-disable-next-line no-restricted-syntax
  for (const [a, why] of cases) {
    // eslint-disable-next-line no-await-in-loop
    const res = await call(a, store, 'POST', ENDPOINT, say('req-1', 'Hello'));
    assert.equal(res.body.error, 'invalid_session');
    assert.match(res.body.error_description, why);
  }
});

test('PS384 delegations verify, and a verified delegation is cached', async () => {
  const agent = await personalAgent({ rsa: true });
  const store = d1Store(d1());
  const cache = new Map();
  const dlg = await agent.delegation();
  const first = await call(agent, store, 'POST', ENDPOINT, say('req-1', 'Hello'), { cache, session: { dlg } });
  assert.equal(first.status, 201);
  const second = await call(agent, store, 'GET', `${ENDPOINT}/${first.body.conversation_id}/events`, undefined, { cache, session: { dlg } });
  assert.equal(second.status, 200);
  assert.equal(agent.fetched.length, 2);
});

test('an access token must match ath', async () => {
  const agent = await personalAgent();
  const store = d1Store(d1());
  const ath = b64uEncode(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tok-1')));
  const ok = await call(agent, store, 'POST', ENDPOINT, say('req-1', 'Hello'), {
    headers: { authorization: 'Bearer tok-1' }, session: { claims: { ath } },
  });
  assert.equal(ok.status, 201);
  const bad = await call(agent, store, 'POST', ENDPOINT, say('req-2', 'Hello'), {
    headers: { authorization: 'Bearer tok-2' }, session: { claims: { ath } },
  });
  assert.match(bad.body.error_description, /ath does not match/);
});

test('poppy.json names the tasks endpoint, and the tasks response lists one skill with its digest', async () => {
  assert.deepEqual(poppyDocument(ORIGIN).tasks, { endpoint: `${ORIGIN}${TASKS_PATH}` });
  const doc = await tasksDocument(ORIGIN);
  assert.deepEqual(Object.keys(doc), ['skill_index']);
  assert.equal(doc.skill_index.$schema, 'https://schemas.agentskills.io/discovery/0.2.0/schema.json');
  const [skill] = doc.skill_index.skills;
  assert.deepEqual(Object.keys(skill), ['name', 'description', 'type', 'url', 'digest']);
  assert.equal(skill.name, SKILL_NAME);
  assert.equal(skill.type, 'skill-md');
  assert.equal(skill.url, `${ORIGIN}${SKILL_PATH}`);
  const file = skillDocument(ORIGIN);
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(file));
  assert.equal(skill.digest, `sha256:${Buffer.from(hash).toString('hex')}`);
  // Agent Skills: frontmatter name equals the directory name
  assert.match(file, new RegExp(`^---\\nname: ${SKILL_NAME}\\ndescription: .+\\n---\\n`));
  assert.equal(SKILL_PATH.split('/').at(-2), SKILL_NAME);
  // the marker is in the file only, so a reply with it shows the file was read
  assert.ok(file.includes(`Skill: ${SKILL_NAME} ${SKILL_MARKER}`));
  assert.equal(JSON.stringify(doc).includes(SKILL_MARKER), false);
  assert.equal(JSON.stringify(poppyDocument(ORIGIN)).includes(SKILL_MARKER), false);
});

test('the tasks endpoint answers every GET and logs whether the Session verified', async () => {
  const agent = await personalAgent();
  const url = `${ORIGIN}${TASKS_PATH}`;
  const get = async (token) => handleTasks(new Request(url, {
    headers: { 'poppy-version': '1.0', ...(token ? { 'poppy-session': token } : {}) },
  }), { audience: ORIGIN, fetcher: agent.fetcher, now: NOW });

  const signed = await get(await agent.session('GET', url));
  assert.equal(signed.status, 200);
  assert.equal(signed.body.skill_index.skills.length, 1);
  assert.deepEqual([signed.info.verified, signed.info.client_id, signed.info.agent_id, signed.info.error], [1, CLIENT, 'muse-test', null]);
  assert.equal(signed.info.path, TASKS_PATH);

  const unsigned = await get(null);
  assert.equal(unsigned.status, 200);
  assert.deepEqual(unsigned.body, signed.body);
  assert.deepEqual([unsigned.info.verified, unsigned.info.error], [0, 'invalid_session']);

  const wrongUrl = await get(await agent.session('GET', ENDPOINT));
  assert.equal(wrongUrl.status, 200);
  assert.deepEqual([wrongUrl.info.verified, wrongUrl.info.client_id], [0, CLIENT]);

  const post = await handleTasks(new Request(url, { method: 'POST', body: '{}' }), { audience: ORIGIN, now: NOW });
  assert.equal(post.status, 405);
  assert.equal(post.info.status, 405);
});

test('with a gateway, poppy.json is the gateway document for this host', async () => {
  const { gatewayPoppy, GATEWAY_PATH } = await import('../worker/src/poppy-gateway.mjs');
  const organization = { name: 'attribution.now', domain: 'attribution.now' };
  const doc = { protocol_version: '1.0', organization };
  const seen = [];
  const fetcher = async (url, init) => {
    seen.push({ url, host: init.headers['x-forwarded-host'], service: init.headers['x-poppy-aem-service'] });
    return new Response(JSON.stringify(doc), { status: 200 });
  };
  const ok = await gatewayPoppy('https://m.adobe.io', 'attribution.now', 'eds-keepthebyte--attribution-now', fetcher);
  assert.equal(ok.status, 200);
  assert.deepEqual(JSON.parse(ok.body), doc);
  assert.deepEqual(seen, [{
    url: `https://m.adobe.io${GATEWAY_PATH}`, host: 'attribution.now', service: 'eds-keepthebyte--attribution-now',
  }]);
  await gatewayPoppy('https://m.adobe.io', 'attribution.now', undefined, fetcher);
  assert.equal(seen[1].service, undefined);

  const status = async (host, f) => (await gatewayPoppy('https://m.adobe.io', host, 'eds-x--y', f)).status;
  const answer = (res) => async () => res;
  assert.equal(await status('other.example', fetcher), 502);
  assert.equal(await status('attribution.now', answer(new Response('x', { status: 500 }))), 502);
  assert.equal(await status('attribution.now', answer(new Response('<html>'))), 502);
  assert.equal(await status('attribution.now', async () => { throw new Error('down'); }), 502);
});

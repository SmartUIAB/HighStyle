import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, writeFile, readFile, chmod, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { STAGING_TARGETS, rejectStagingRailwayIds, verifyRailwayProductionTarget, verifyVercelProductionLink, verifyVercelProductionEnv } from '../targets.mjs';

const expected = {
  projectId: '11111111-1111-4111-8111-111111111111', environmentId: '22222222-2222-4222-8222-222222222222',
  serviceId: '33333333-3333-4333-8333-333333333333', apiOrigin: 'https://highstyle-api.example.com', stagingApiOrigin: 'https://highstyle-staging.example.com',
};
function target() {
  return { id: expected.projectId, name: 'highstyle-production', deletedAt: null, environments: { edges: [{ node: {
    id: expected.environmentId, name: 'production', canAccess: true, deletedAt: null, unmergedChangesCount: 0,
    serviceInstances: { edges: [{ node: { serviceId: expected.serviceId, serviceName: 'highstyle-api', environmentId: expected.environmentId,
      source: { repo: 'SmartUIAB/HighStyle', image: null }, domains: { serviceDomains: [], customDomains: [{ domain: 'highstyle-api.example.com' }] },
    } }] },
  } }] } };
}
const environment = value => value.environments.edges[0].node;
const instance = value => environment(value).serviceInstances.edges[0].node;

test('Railway preflight binds project, production environment, API service, repository and public domain', () => {
  const value = target();
  assert.equal(verifyRailwayProductionTarget(value, expected), instance(value));
  instance(value).source = null; // A deliberately empty service is a valid first CLI upload target.
  assert.doesNotThrow(() => verifyRailwayProductionTarget(value, expected));
});
test('known staging Railway IDs cannot be relabeled as production', () => {
  for (const [field, id] of [['projectId', STAGING_TARGETS.railwayProject], ['environmentId', STAGING_TARGETS.railwayEnvironment], ['serviceId', STAGING_TARGETS.railwayService]]) {
    assert.throws(() => rejectStagingRailwayIds({ ...expected, [field]: id }), /known staging/);
  }
  const renamed = target(); renamed.id = STAGING_TARGETS.railwayProject;
  assert.throws(() => verifyRailwayProductionTarget(renamed, { ...expected, projectId: renamed.id }), /known staging/);
});
test('Railway preflight rejects unrelated projects, staging names and inaccessible or pending environments', () => {
  const changes = [
    value => { value.name = 'hsm-production'; },
    value => { value.name = 'highstyle-staging'; },
    value => { value.id = 'other'; },
    value => { value.deletedAt = '2026-01-01'; },
    value => { environment(value).name = 'staging'; },
    value => { environment(value).canAccess = false; },
    value => { environment(value).id = 'other'; },
    value => { environment(value).unmergedChangesCount = 1; },
    value => { value.environments.edges.push(structuredClone(value.environments.edges[0])); },
  ];
  for (const change of changes) { const value = target(); change(value); assert.throws(() => verifyRailwayProductionTarget(value, expected)); }
});
test('Railway preflight rejects wrong service membership, repository, image, domain and shared staging origin', () => {
  const changes = [
    value => { instance(value).serviceId = 'other'; },
    value => { instance(value).serviceName = 'database'; },
    value => { instance(value).environmentId = STAGING_TARGETS.railwayEnvironment; },
    value => { instance(value).source.repo = 'baraabd/homeservicemarketplace'; },
    value => { instance(value).source.image = 'mongo:7'; },
    value => { instance(value).domains.customDomains = [{ domain: 'other.example.com' }]; },
    value => { environment(value).serviceInstances.edges = []; },
  ];
  for (const change of changes) { const value = target(); change(value); assert.throws(() => verifyRailwayProductionTarget(value, expected)); }
  assert.throws(() => verifyRailwayProductionTarget(target(), { ...expected, stagingApiOrigin: expected.apiOrigin }), /must be different/);
});

const vercelExpected = { orgId: 'team_production', projectId: 'prj_production', rootDirectory: 'frontend', apiOrigin: expected.apiOrigin };
function projectLink() { return { orgId: vercelExpected.orgId, projectId: vercelExpected.projectId, projectName: 'highstyle-production-web', settings: { rootDirectory: 'frontend' } }; }

test('Vercel link must match the configured production application, team and source root', () => {
  assert.doesNotThrow(() => verifyVercelProductionLink(projectLink(), vercelExpected));
  for (const patch of [{ orgId: 'other' }, { projectId: 'other' }, { projectName: 'highstyle-staging-web' }, { projectName: 'homeservicemarketplace-web' }, { settings: { rootDirectory: 'backend' } }]) {
    assert.throws(() => verifyVercelProductionLink({ ...projectLink(), ...patch }, vercelExpected));
  }
  for (const projectId of [STAGING_TARGETS.vercelStorefront, STAGING_TARGETS.vercelAdmin]) {
    assert.throws(() => verifyVercelProductionLink({ ...projectLink(), projectId }, { ...vercelExpected, projectId }), /known staging/);
  }
});
test('Vercel build switches cannot silently point to staging or turn browser checkout on', () => {
  const config = { API_ORIGIN: expected.apiOrigin, NEXT_PUBLIC_GRAPHQL_ENDPOINT: '/api/graphql', NEXT_PUBLIC_CHECKOUT_ENABLED: 'false', NEXT_PUBLIC_PAYMENT_MODE: 'disabled' };
  assert.equal(verifyVercelProductionEnv(config, vercelExpected), config);
  for (const patch of [{ API_ORIGIN: expected.stagingApiOrigin }, { API_ORIGIN: undefined }, { NEXT_PUBLIC_GRAPHQL_ENDPOINT: `${expected.stagingApiOrigin}/graphql` }, { NEXT_PUBLIC_API_KEY: expected.stagingApiOrigin }, { NEXT_PUBLIC_API_URL: expected.stagingApiOrigin }, { NEXT_PUBLIC_CHECKOUT_ENABLED: 'true' }, { NEXT_PUBLIC_PAYMENT_MODE: 'live' }, { APP_ENV: 'staging' }]) {
    assert.throws(() => verifyVercelProductionEnv({ ...config, ...patch }, vercelExpected));
  }
});
test('optional source environment files cannot override a valid pulled production origin', () => {
  assert.doesNotThrow(() => verifyVercelProductionEnv({ SOME_UNRELATED_SETTING: '1' }, vercelExpected, { requireApiOrigin: false }));
  assert.throws(() => verifyVercelProductionEnv({ API_ORIGIN: expected.stagingApiOrigin }, vercelExpected, { requireApiOrigin: false }));
});

test('settings checker rejects unsafe source .env overrides without exposing secret contents', async () => {
  const execute = promisify(execFile);
  const directory = await mkdtemp(join(tmpdir(), 'highstyle-target-check-'));
  try {
    await mkdir(join(directory, '.vercel'));
    await mkdir(join(directory, 'frontend'));
    await writeFile(join(directory, '.vercel', 'project.json'), JSON.stringify(projectLink()));
    await writeFile(join(directory, '.vercel', '.env.production.local'), `API_ORIGIN="${expected.apiOrigin}"\nNEXT_PUBLIC_GRAPHQL_ENDPOINT="/api/graphql"\nUNRELATED_PRIVATE_VALUE="do-not-print-this-value"\n`);
    const env = { PATH: process.env.PATH, VERCEL_SOURCE_DIR: directory, VERCEL_EXPECTED_PROJECT_ID: vercelExpected.projectId, VERCEL_ORG_ID: vercelExpected.orgId,
      VERCEL_EXPECTED_ROOT_DIRECTORY: 'frontend', PRODUCTION_API_ORIGIN: expected.apiOrigin };
    const success = await execute(process.execPath, ['scripts/release/check-vercel-settings.mjs'], { env, timeout: 5000 });
    assert.match(success.stdout, /Verified frontend/);
    assert.doesNotMatch(success.stdout + success.stderr, /do-not-print-this-value/);
    await writeFile(join(directory, 'frontend', '.env.production.local'), `API_ORIGIN="${expected.stagingApiOrigin}"\n`);
    await assert.rejects(() => execute(process.execPath, ['scripts/release/check-vercel-settings.mjs'], { env, timeout: 5000 }), error => error.code === 1 && /API_ORIGIN/.test(error.stderr) && !error.stderr.includes('do-not-print-this-value'));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('Railway deploy script cannot issue a variable write or upload before a valid target preflight', async () => {
  const execute = promisify(execFile);
  const directory = await mkdtemp(join(tmpdir(), 'highstyle-railway-preflight-'));
  try {
    const response = target(); response.name = 'highstyle-staging';
    const statusFile = join(directory, 'status.json'); const callsFile = join(directory, 'calls.jsonl');
    await writeFile(statusFile, JSON.stringify(response));
    const executable = join(directory, 'railway');
    await writeFile(executable, '#!/usr/bin/env node\nconst fs = require("node:fs"); fs.appendFileSync(process.env.TEST_CALLS, JSON.stringify(process.argv.slice(2))+"\\n"); process.stdout.write(fs.readFileSync(process.env.TEST_STATUS,"utf8"));\n');
    await chmod(executable, 0o700);
    const env = { PATH: `${directory}:${process.env.PATH}`, TEST_CALLS: callsFile, TEST_STATUS: statusFile,
      RELEASE_SHA: 'a'.repeat(40), PRODUCTION_API_ORIGIN: expected.apiOrigin, STAGING_API_ORIGIN: expected.stagingApiOrigin,
      RAILWAY_PROJECT_ID: expected.projectId, RAILWAY_ENVIRONMENT_ID: expected.environmentId, RAILWAY_SERVICE_ID: expected.serviceId,
      RAILWAY_TOKEN: 'fixture-token-never-sent-to-a-provider' };
    await assert.rejects(() => execute(process.execPath, ['scripts/release/deploy-railway.mjs'], { env, timeout: 5000 }), error => error.code === 1 && /explicit highstyle-production/.test(error.stderr));
    const calls = (await readFile(callsFile, 'utf8')).trim().split('\n').map(line => JSON.parse(line));
    assert.deepEqual(calls.map(args => args[0]), ['status']);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('a failed first Railway mutation retains the previous deployment pointer for recovery', async () => {
  const execute = promisify(execFile);
  const directory = await mkdtemp(join(tmpdir(), 'highstyle-railway-recovery-'));
  try {
    const previousId = '44444444-4444-4444-8444-444444444444';
    const statusFile = join(directory, 'status.json'); const outputFile = join(directory, 'github-output');
    await writeFile(statusFile, JSON.stringify(target()));
    const executable = join(directory, 'railway');
    await writeFile(executable, `#!/usr/bin/env node
const fs = require('node:fs');
const command = process.argv[2];
if (command === 'status') process.stdout.write(fs.readFileSync(process.env.TEST_STATUS, 'utf8'));
else if (command === 'deployment') process.stdout.write(JSON.stringify([{id:'${previousId}',status:'SUCCESS'}]));
else if (command === 'variable') { if (!fs.readFileSync(process.env.GITHUB_OUTPUT,'utf8').includes('${previousId}')) process.exit(8); process.exit(9); }
else process.exit(10);
`);
    await chmod(executable, 0o700);
    const env = { PATH: `${directory}:${process.env.PATH}`, TEST_STATUS: statusFile, GITHUB_OUTPUT: outputFile,
      RELEASE_SHA: 'a'.repeat(40), PRODUCTION_API_ORIGIN: expected.apiOrigin, STAGING_API_ORIGIN: expected.stagingApiOrigin,
      RAILWAY_PROJECT_ID: expected.projectId, RAILWAY_ENVIRONMENT_ID: expected.environmentId, RAILWAY_SERVICE_ID: expected.serviceId,
      RAILWAY_TOKEN: 'fixture-token-never-sent-to-a-provider' };
    await assert.rejects(() => execute(process.execPath, ['scripts/release/deploy-railway.mjs'], { env, timeout: 5000 }), error => error.code === 1 && /Railway variable failed/.test(error.stderr));
    assert.equal(await readFile(outputFile, 'utf8'), `previous_deployment_id=${previousId}\n`);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('production smoke rejects an otherwise healthy frontend that proxies to staging', async () => {
  const execute = promisify(execFile);
  const directory = await mkdtemp(join(tmpdir(), 'highstyle-proxy-smoke-'));
  try {
    const preload = join(directory, 'mock-fetch.mjs');
    await writeFile(preload, `globalThis.fetch = async value => {
      const url = new URL(value);
      let body;
      if (url.hostname === 'api.vercel.com') body = {readyState:'READY',target:'production',projectId:url.pathname.includes('store-production')?'prj_store':'prj_admin',meta:{highstyleCommit:process.env.RELEASE_SHA}};
      else if (url.pathname === '/health/release' || url.pathname === '/api/release') body = {status:'ready',commit:process.env.RELEASE_SHA,environment:url.pathname === '/api/release'?'staging':'production',paymentsEnabled:false,stripeMode:'test'};
      else return new Response('<html><body><main>Healthy application</main></body></html>',{headers:{'content-type':'text/html'}});
      return new Response(JSON.stringify(body),{headers:{'content-type':'application/json'}});
    };\n`);
    const env = { PATH: process.env.PATH, RELEASE_SHA: 'a'.repeat(40), PRODUCTION_API_ORIGIN: expected.apiOrigin,
      VERCEL_TOKEN: 'fixture-token-never-sent-to-a-provider', VERCEL_ORG_ID: 'team_production', VERCEL_STOREFRONT_PROJECT_ID: 'prj_store', VERCEL_ADMIN_PROJECT_ID: 'prj_admin',
      STOREFRONT_DEPLOYMENT_URL: 'https://store-production.vercel.app', ADMIN_DEPLOYMENT_URL: 'https://admin-production.vercel.app' };
    await assert.rejects(() => execute(process.execPath, ['--import', preload, 'scripts/release/smoke-production.mjs'], { env, timeout: 5000 }), error => error.code === 1 && /API environment does not match/.test(error.stderr));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { appendFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { requireValue, requireSha, requireHttpsOrigin, verifyApiRelease } from './evidence.mjs';
import { rejectStagingRailwayIds, verifyRailwayProductionTarget } from './targets.mjs';

const execute = promisify(execFile);
const busy = new Set(['QUEUED', 'INITIALIZING', 'WAITING', 'BUILDING', 'DEPLOYING']);
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

async function main() {
  const sha = requireSha(process.env.RELEASE_SHA);
  const origin = requireHttpsOrigin(process.env.PRODUCTION_API_ORIGIN, 'Production API origin');
  const names = ['RAILWAY_PROJECT_ID', 'RAILWAY_ENVIRONMENT_ID', 'RAILWAY_SERVICE_ID'];
  const ids = names.map(name => requireValue(process.env[name], name));
  if (!ids.every(id => uuid.test(id))) throw new Error('Railway project, environment and service must be explicit UUIDs');
  const expectedTarget = { projectId: ids[0], environmentId: ids[1], serviceId: ids[2], apiOrigin: origin,
    stagingApiOrigin: requireHttpsOrigin(process.env.STAGING_API_ORIGIN, 'Staging API origin') };
  rejectStagingRailwayIds(expectedTarget);
  requireValue(process.env.RAILWAY_TOKEN, 'Production-scoped Railway token');
  const scope = ['--project', ids[0], '--environment', ids[1], '--service', ids[2]];
  async function railway(args, timeout = 120_000) {
    try {
      return (await execute('railway', args, { timeout, maxBuffer: 2 * 1024 * 1024, env: {
        ...process.env, RAILWAY_CALLER: 'skill:use-railway@1.3.5', RAILWAY_AGENT_SESSION: `highstyle-cd-${process.env.GITHUB_RUN_ID}`,
      } })).stdout;
    } catch {
      // Provider logs may contain configuration; keep credential-bearing raw output out of CI artifacts.
      throw new Error(`Railway ${args[0]} failed; inspect the scoped Railway dashboard logs before retrying`);
    }
  }
  // Resolve the actual resource identities and domain ownership before the first
  // variable change. Never relabel a staging environment as production.
  const target = JSON.parse(await railway(['status', '--project', ids[0], '--environment', ids[1], '--json']));
  verifyRailwayProductionTarget(target, expectedTarget);
  const before = JSON.parse(await railway(['deployment', 'list', ...scope, '--json', '--limit', '5']));
  const previous = (Array.isArray(before) ? before : before.deployments || []).find(item => item.status === 'SUCCESS');
  const outputPath = requireValue(process.env.GITHUB_OUTPUT, 'GitHub output path');
  if (previous?.id && !uuid.test(previous.id)) throw new Error('Previous Railway deployment has an invalid identity');
  // Preserve recovery information even when the subsequent write, upload or
  // health verification fails. These identifiers contain no credentials.
  await appendFile(outputPath, `previous_deployment_id=${previous?.id || ''}\n`);
  await railway(['variable', 'set', ...scope, '--skip-deploys', 'APP_ENV=production', 'PAYMENTS_ENABLED=false', 'STRIPE_MODE=test', `RELEASE_SHA=${sha}`]);
  // Upload the checked-out root so Railway's configured /API root remains valid.
  // This never follows a moving branch or invokes redeploy --from-source.
  const queued = JSON.parse(await railway(['up', '.', ...scope, '--detach', '--json', '-m', `Protected HighStyle release ${sha}`], 300_000));
  const deploymentId = queued.deploymentId || queued.deployment?.id || queued.id;
  if (!uuid.test(deploymentId || '')) throw new Error('Railway accepted an upload but returned no verifiable deployment ID; do not promote frontend');
  await appendFile(outputPath, `deployment_id=${deploymentId}\n`);
  const deadline = Date.now() + 15 * 60_000;
  let succeeded = false;
  while (Date.now() < deadline) {
    const result = JSON.parse(await railway(['deployment', 'list', ...scope, '--json', '--limit', '20']));
    const deployment = (Array.isArray(result) ? result : result.deployments || []).find(item => item.id === deploymentId);
    if (deployment?.status === 'SUCCESS') { succeeded = true; break; }
    if (deployment && !busy.has(deployment.status)) throw new Error(`Railway deployment ${deploymentId} ended in ${deployment.status}`);
    await delay(10_000);
  }
  if (!succeeded) throw new Error(`Railway deployment ${deploymentId} did not reach SUCCESS before timeout`);
  let health;
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const response = await fetch(`${origin}/health/release`, { redirect: 'error', signal: AbortSignal.timeout(10_000), cache: 'no-store' });
      if (response.ok) {
        health = verifyApiRelease(await response.json(), { commit: sha, environment: 'production', paymentsEnabled: false });
        break;
      }
    } catch { /* Bound retries accommodate the provider's routing handover. */ }
    await delay(5_000);
  }
  if (!health) throw new Error('API did not prove exact source, production isolation and disabled live payments after deployment');
  console.log(`Railway ${deploymentId} reached SUCCESS; ${origin} serves ${sha} with checkout disabled.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });

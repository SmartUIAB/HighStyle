import { requireValue, requireSha, requireHttpsOrigin, verifyApiRelease } from './evidence.mjs';

async function fetchChecked(url, headers = {}, redirect = 'error') {
  const response = await fetch(url, { headers, redirect, signal: AbortSignal.timeout(20_000), cache: 'no-store' });
  if (!response.ok) throw new Error(`Production smoke failed (${response.status}) at ${new URL(url).pathname}`);
  return response;
}

async function main() {
  const sha = requireSha(process.env.RELEASE_SHA);
  const api = requireHttpsOrigin(process.env.PRODUCTION_API_ORIGIN, 'Production API');
  verifyApiRelease(await (await fetchChecked(`${api}/health/release`)).json(), { commit: sha, environment: 'production', paymentsEnabled: false });
  const token = requireValue(process.env.VERCEL_TOKEN, 'Vercel deployment inspection token');
  const team = requireValue(process.env.VERCEL_ORG_ID, 'Vercel team ID');
  for (const [name, path] of [['STOREFRONT', '/en'], ['ADMIN', '/auth/login']]) {
    const origin = requireHttpsOrigin(process.env[`${name}_DEPLOYMENT_URL`], `${name} staged deployment`);
    if (!new URL(origin).hostname.endsWith('.vercel.app')) throw new Error('Only Vercel deployment URLs may receive a protection bypass');
    const project = requireValue(process.env[`VERCEL_${name}_PROJECT_ID`], `${name} project ID`);
    const inspected = await fetchChecked(`https://api.vercel.com/v13/deployments/${new URL(origin).hostname}?teamId=${encodeURIComponent(team)}`, { Authorization: `Bearer ${token}` });
    const deployment = await inspected.json();
    if (deployment.readyState !== 'READY' || deployment.target !== 'production' ||
        (deployment.projectId || deployment.project?.id) !== project || deployment.meta?.highstyleCommit !== sha) {
      throw new Error(`${name} Vercel deployment has not proved READY, correct project, production target and exact source`);
    }
    const bypass = process.env[`VERCEL_${name}_AUTOMATION_BYPASS_SECRET`];
    const headers = bypass ? { 'x-vercel-protection-bypass': bypass } : {};
    // An independently healthy API is insufficient if either web app still
    // routes its browser requests to staging or to an older backend release.
    const proxied = await fetchChecked(`${origin}/api/release`, headers);
    verifyApiRelease(await proxied.json(), { commit: sha, environment: 'production', paymentsEnabled: false });
    const response = await fetchChecked(`${origin}${path}`, headers);
    const html = await response.text();
    if (!/text\/html/.test(response.headers.get('content-type') || '') ||
        !/<(?:main|form|nav|body)[\s>]/i.test(html) || /Application error: a (?:client|server)-side exception/i.test(html)) {
      throw new Error(`${name} staged deployment did not return a valid application page`);
    }
  }
  console.log(`Production API and both unpromoted Vercel builds passed smoke on ${sha}; payments remain disabled.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });

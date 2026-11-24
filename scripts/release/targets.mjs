import { REPOSITORY, requireValue, requireHttpsOrigin } from './evidence.mjs';

// Infrastructure IDs are identifiers, not credentials. Keep the known staging
// resources denied even if someone renames them or miscopies a production variable.
export const STAGING_TARGETS = Object.freeze({
  railwayProject: '5fb754c3-3323-4dd2-8887-e5b2a3599f9e',
  railwayEnvironment: '6d387b2e-7a53-4cf3-bd8f-e2c9e8001eda',
  railwayService: 'f4e8a471-e1e7-4c1d-91ce-115a69d81844',
  vercelStorefront: 'prj_VBLEjXQ3cePdeHIWnhcvCDWOK9U2',
  vercelAdmin: 'prj_50ly0UzC6aBUqoPrNAe3XTBWiQxg',
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function rejectStagingRailwayIds({ projectId, environmentId, serviceId }) {
  const denied = new Set([STAGING_TARGETS.railwayProject, STAGING_TARGETS.railwayEnvironment, STAGING_TARGETS.railwayService]);
  assert(![projectId, environmentId, serviceId].some(id => denied.has(id)), 'Production release must never target a known staging Railway resource');
}

export function verifyRailwayProductionTarget(project, expected) {
  rejectStagingRailwayIds(expected);
  const origin = requireHttpsOrigin(expected.apiOrigin, 'Production API');
  if (expected.stagingApiOrigin) assert(origin !== requireHttpsOrigin(expected.stagingApiOrigin, 'Staging API'), 'Production and staging API origins must be different');
  const hostname = new URL(origin).hostname;
  assert(project?.id === expected.projectId && project.name === 'highstyle-production' && !project.deletedAt,
    'Railway target must be the explicit highstyle-production project');
  const environments = project.environments?.edges?.map(edge => edge.node).filter(node => node?.id === expected.environmentId) || [];
  assert(environments.length === 1, 'Railway production environment does not belong to the selected project');
  const environment = environments[0];
  assert(environment.name === 'production' && environment.canAccess === true && !environment.deletedAt,
    'Railway target must be an accessible production environment');
  assert(environment.unmergedChangesCount == null || environment.unmergedChangesCount === 0,
    'Review pending Railway environment changes before releasing production');
  const instances = environment.serviceInstances?.edges?.map(edge => edge.node).filter(node => node?.serviceId === expected.serviceId) || [];
  assert(instances.length === 1, 'Railway API service does not belong to the selected production environment');
  const instance = instances[0];
  assert(instance.environmentId === expected.environmentId && instance.serviceName === 'highstyle-api',
    'Railway target must be the highstyle-api service in production');
  const repository = instance.source?.repo?.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
  assert(!repository || repository === REPOSITORY, 'Railway service is attached to another repository');
  assert(!instance.source?.image, 'Railway API must not target a prebuilt image service');
  const domains = [...(instance.domains?.serviceDomains || []), ...(instance.domains?.customDomains || [])];
  assert(domains.some(domain => domain?.domain?.toLowerCase() === hostname),
    'Production API hostname is not assigned to the selected Railway service');
  return instance;
}

export function verifyVercelProductionLink(link, expected) {
  const projectId = requireValue(expected.projectId, 'Expected Vercel project ID');
  assert(![STAGING_TARGETS.vercelStorefront, STAGING_TARGETS.vercelAdmin].includes(projectId),
    'Production release must never target a known staging Vercel project');
  assert(link?.projectId === projectId && link.orgId === requireValue(expected.orgId, 'Expected Vercel team ID'),
    'Pulled Vercel project or team differs from the approved production target');
  assert(['frontend', 'backend'].includes(expected.rootDirectory), 'The expected Vercel source root must be frontend or backend');
  assert(link.settings?.rootDirectory === expected.rootDirectory, 'Vercel project root differs from the intended application');
  const allowedNames = expected.rootDirectory === 'frontend'
    ? ['highstyle-web', 'highstyle-storefront', 'highstyle-production-web', 'highstyle-production-storefront']
    : ['highstyle-admin', 'highstyle-production-admin'];
  assert(allowedNames.includes(link.projectName), 'Vercel project must be a named HighStyle production application');
  return link;
}

export function verifyVercelProductionEnv(config, expected, { requireApiOrigin = true } = {}) {
  const origin = requireHttpsOrigin(expected.apiOrigin, 'Production API');
  if (requireApiOrigin || Object.hasOwn(config, 'API_ORIGIN')) {
    assert(config.API_ORIGIN === origin, 'Vercel API_ORIGIN must point to the intended production API');
  }
  if (Object.hasOwn(config, 'NEXT_PUBLIC_GRAPHQL_ENDPOINT')) {
    assert(config.NEXT_PUBLIC_GRAPHQL_ENDPOINT === '/api/graphql', 'Browser GraphQL requests must use the same-origin production proxy');
  }
  for (const name of ['NEXT_PUBLIC_API_KEY', 'NEXT_PUBLIC_API_URL']) {
    if (Object.hasOwn(config, name)) assert(config[name] === '' || config[name] === origin, `${name} must use the production API or the same-origin image proxy`);
  }
  if (Object.hasOwn(config, 'NEXT_PUBLIC_CHECKOUT_ENABLED')) {
    assert(config.NEXT_PUBLIC_CHECKOUT_ENABLED === 'false', 'Production browser checkout must remain disabled until separate payment approval');
  }
  if (Object.hasOwn(config, 'NEXT_PUBLIC_PAYMENT_MODE')) {
    assert(['test', 'disabled'].includes(config.NEXT_PUBLIC_PAYMENT_MODE), 'Production browser payment mode must not activate live payments');
  }
  if (Object.hasOwn(config, 'APP_ENV')) assert(config.APP_ENV === 'production', 'Vercel APP_ENV must be production');
  return config;
}

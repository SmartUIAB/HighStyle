import { requireValue, REPOSITORY } from './evidence.mjs';

export function githubClient(token = process.env.GITHUB_TOKEN) {
  requireValue(token, 'Read-only GitHub workflow token');
  return async function github(path) {
    if (!path.startsWith(`/repos/${REPOSITORY}/`)) throw new Error('GitHub release read is outside the configured repository');
    const response = await fetch(`https://api.github.com${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(20_000), redirect: 'error',
    });
    if (!response.ok) throw new Error(`GitHub release verification failed (${response.status}) for ${path}; no protection or acceptance gate may be bypassed`);
    return response.json();
  };
}

export async function verifyProtectedEnvironment(github, name) {
  const environment = await github(`/repos/${REPOSITORY}/environments/${name}`);
  const reviewers = environment.protection_rules?.find(rule => rule.type === 'required_reviewers');
  if (!reviewers?.reviewers?.length || reviewers.prevent_self_review !== true) {
    throw new Error(`GitHub ${name} environment needs required reviewers with self-review prevented`);
  }
  if (environment.deployment_branch_policy?.protected_branches === true && name !== 'production') return environment;
  if (environment.deployment_branch_policy?.custom_branch_policies !== true) {
    throw new Error(`GitHub ${name} environment must restrict allowed deployment branches`);
  }
  const policies = await github(`/repos/${REPOSITORY}/environments/${name}/deployment-branch-policies?per_page=100`);
  const allowed = name === 'production' ? ['main'] : ['main', 'fix/security-foundation-20261117'];
  if (!policies.branch_policies?.length || policies.total_count > policies.branch_policies.length ||
      policies.branch_policies.some(policy => policy.type !== 'branch' || !allowed.includes(policy.name))) {
    throw new Error(`GitHub ${name} environment allows unreviewed branches or tags`);
  }
  return environment;
}

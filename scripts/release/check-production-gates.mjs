import { appendFile } from 'node:fs/promises';
import { REPOSITORY, REQUIRED_CI_JOBS, REQUIRED_MAIN_CHECKS, requireSha, requireValue } from './evidence.mjs';
import { githubClient, verifyProtectedEnvironment } from './github.mjs';

async function main() {
  if (process.env.GITHUB_REPOSITORY !== REPOSITORY || process.env.GITHUB_REF !== 'refs/heads/main') {
    throw new Error('Production releases can run only from this repository protected main branch');
  }
  const sha = requireSha(process.env.RELEASE_SHA);
  if (sha !== process.env.GITHUB_SHA) throw new Error('Requested release differs from the workflow commit');
  const runId = requireValue(process.env.ACCEPTANCE_RUN_ID, 'Successful hosted acceptance run ID');
  if (!/^\d+$/.test(runId)) throw new Error('Acceptance run ID must be numeric');
  const github = githubClient();
  const base = `/repos/${REPOSITORY}`;
  const [branch, protection, environment] = await Promise.all([
    github(`${base}/branches/main`),
    github(`${base}/branches/main/protection`),
    verifyProtectedEnvironment(github, 'production'),
  ]);
  if (branch.commit.sha !== sha) throw new Error('main moved; restart the release on its current exact commit');
  if (branch.protected !== true || protection.enforce_admins?.enabled !== true ||
      protection.required_pull_request_reviews?.required_approving_review_count < 1 ||
      protection.required_pull_request_reviews?.dismiss_stale_reviews !== true ||
      protection.required_status_checks?.strict !== true) {
    throw new Error('main must enforce reviews, stale-review dismissal, strict required checks and administrator enforcement');
  }
  const requiredChecks = new Set([
    ...(protection.required_status_checks?.contexts || []),
    ...(protection.required_status_checks?.checks || []).map(check => check.context),
  ]);
  for (const check of REQUIRED_MAIN_CHECKS) {
    if (!requiredChecks.has(check)) throw new Error(`main is missing required CI check: ${check}`);
  }
  const runs = await github(`${base}/actions/workflows/security-validation.yml/runs?branch=main&event=push&head_sha=${sha}&per_page=100`);
  const latest = runs.workflow_runs?.filter(run => run.head_sha === sha).sort((a, b) => b.id - a.id)[0];
  if (latest?.status !== 'completed' || latest.conclusion !== 'success') throw new Error('The latest complete six-gate main CI run has not succeeded on the exact release commit');
  const jobs = await github(`${base}/actions/runs/${latest.id}/jobs?filter=latest&per_page=100`);
  for (const expected of REQUIRED_CI_JOBS) {
    if (!jobs.jobs?.some(job => job.name === expected && job.status === 'completed' && job.conclusion === 'success')) {
      throw new Error(`Exact-commit CI did not pass: ${expected}`);
    }
  }
  const accepted = await github(`${base}/actions/runs/${runId}`);
  const trustedTrigger = accepted.event === 'workflow_dispatch' || (accepted.event === 'push' && accepted.head_branch === 'fix/security-foundation-20261117');
  if (accepted.path !== '.github/workflows/hosted-acceptance.yml' || !trustedTrigger ||
      accepted.status !== 'completed' || accepted.conclusion !== 'success' ||
      accepted.head_repository?.full_name !== REPOSITORY) {
    throw new Error('Acceptance must come from a successful trusted hosted-acceptance workflow in this repository');
  }
  const acceptedSha = requireSha(accepted.head_sha, 'Accepted commit');
  const [releaseCommit, acceptedCommit] = await Promise.all([
    github(`${base}/git/commits/${sha}`), github(`${base}/git/commits/${acceptedSha}`),
  ]);
  const sourceTree = requireSha(releaseCommit.tree?.sha, 'Release source tree');
  if (acceptedCommit.tree?.sha !== sourceTree) throw new Error('The release tree differs from the source tested on staging; rerun hosted acceptance');
  const artifactName = `hosted-acceptance-${acceptedSha}`;
  const artifacts = await github(`${base}/actions/runs/${runId}/artifacts?per_page=100`);
  const artifact = artifacts.artifacts?.find(item => item.name === artifactName && item.expired === false);
  if (!artifact) throw new Error('Trusted hosted acceptance artifact is missing or expired');
  const output = requireValue(process.env.GITHUB_OUTPUT, 'GitHub output path');
  await appendFile(output, `acceptance_sha=${acceptedSha}\nsource_tree=${sourceTree}\nartifact_name=${artifactName}\n`);
  console.log(`Protected release gates passed for ${sha}; CI run ${latest.id}; hosted acceptance run ${runId}.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });

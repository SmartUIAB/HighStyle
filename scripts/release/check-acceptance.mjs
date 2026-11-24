import { execFileSync } from 'node:child_process';
import { loadAcceptance, requireValue } from './evidence.mjs';

try {
  const expectedTree = process.env.EXPECTED_SOURCE_TREE || execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim();
  const expectedCommit = process.env.ACCEPTANCE_SHA || process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  await loadAcceptance(requireValue(process.env.HOSTED_ACCEPTANCE_OUTPUT, 'Hosted acceptance report path'), {
    commit: expectedCommit,
    sourceTree: expectedTree,
    apiOrigin: requireValue(process.env.STAGING_API_ORIGIN, 'Staging API origin'),
    storefrontOrigin: requireValue(process.env.STAGING_STOREFRONT_ORIGIN, 'Staging storefront origin'),
  });
  console.log(`All hosted acceptance evidence verified for ${expectedCommit}.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }

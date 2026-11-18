import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseEnv } from 'node:util';
import { requireValue } from './evidence.mjs';
import { verifyVercelProductionLink, verifyVercelProductionEnv } from './targets.mjs';

async function main() {
  const directory = resolve(requireValue(process.env.VERCEL_SOURCE_DIR, 'Vercel exact-source directory'));
  const expected = {
    orgId: process.env.VERCEL_ORG_ID,
    projectId: process.env.VERCEL_EXPECTED_PROJECT_ID,
    rootDirectory: process.env.VERCEL_EXPECTED_ROOT_DIRECTORY,
    apiOrigin: process.env.PRODUCTION_API_ORIGIN,
  };
  const link = JSON.parse(await readFile(join(directory, '.vercel', 'project.json'), 'utf8'));
  verifyVercelProductionLink(link, expected);
  const pulled = parseEnv(await readFile(join(directory, '.vercel', '.env.production.local'), 'utf8'));
  verifyVercelProductionEnv(pulled, expected);
  // Check only endpoint/payment switches; never print pulled variables or secrets.
  // Next.js may load these source files as additional build configuration.
  for (const base of [directory, join(directory, expected.rootDirectory)]) {
    for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
      let contents;
      try { contents = await readFile(join(base, name), 'utf8'); }
      catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      verifyVercelProductionEnv(parseEnv(contents), expected, { requireApiOrigin: false });
    }
  }
  verifyVercelProductionEnv(process.env, expected, { requireApiOrigin: false });
  console.log(`Verified ${expected.rootDirectory} production project, source root, API proxy and disabled browser checkout.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });

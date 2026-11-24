import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const execute = promisify(execFile);
test('missing provider credentials fail before any hosted mutation and retain only blocked evidence', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'highstyle-release-test-'));
  const output = join(directory, 'evidence.json');
  try {
    await assert.rejects(() => execute(process.execPath, ['scripts/acceptance/hosted-purchase.mjs'], {
      env: { PATH: process.env.PATH, HOSTED_ACCEPTANCE_OUTPUT: output, STAGING_API_ORIGIN: 'https://staging-api.example.com', STAGING_STOREFRONT_ORIGIN: 'https://staging-web.example.com' },
      timeout: 5_000,
    }), error => error.code === 1 && /STAGING_STRIPE_SECRET_KEY is required/.test(error.stderr));
    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.kind, 'hosted-purchase');
    assert.equal(report.outcome, 'blocked-or-failed');
    assert.equal(Object.values(report.checks).every(value => value === 'blocked'), true);
    assert.equal(report.stripe, undefined);
    assert.equal(report.order, undefined);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('browser-only preflight does not ask for Stripe or claim checkout acceptance', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'highstyle-smoke-test-'));
  const output = join(directory, 'evidence.json');
  try {
    await assert.rejects(() => execute(process.execPath, ['scripts/acceptance/hosted-purchase.mjs', '--browser-smoke'], {
      env: { PATH: process.env.PATH, HOSTED_ACCEPTANCE_OUTPUT: output, STAGING_API_ORIGIN: 'https://staging-api.example.com', STAGING_STOREFRONT_ORIGIN: 'https://staging-web.example.com' },
      timeout: 5_000,
    }), error => error.code === 1 && /PLAYWRIGHT_MODULE is required/.test(error.stderr));
    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.kind, 'browser-smoke');
    assert.equal(report.checks.checkoutSuccess, 'blocked');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
